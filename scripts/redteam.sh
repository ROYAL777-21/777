#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
#  Scroll Academy — red-team pass (v11.3)
#
#  Static supply-chain checks + LIVE adversarial probes against the
#  telemetry service lane, including continuous mode.
#
#    bun run redteam            # static + live (boots a scratch server)
#    bun run redteam -- --live  # live lane probes only
#    bun run redteam -- --static# static checks only
#    bash scripts/redteam.sh --loop 120   # continuous: full suite
#                                         # every 120s until Ctrl-C
#
#  The live section boots an ISOLATED copy of the app (standalone build
#  on :3111, throwaway database copy, random service key, rate cap 5/min)
#  so probes can hammer the lane without touching real data. Set
#  REDTEAM_BASE_URL + REDTEAM_SERVICE_KEY to probe a shared staging
#  server instead (its rate cap is NOT lowered — the flood probe skips).
# ═══════════════════════════════════════════════════════════════
set -u
cd "$(dirname "$0")/.."

MODE="full"
LOOP_SECS=0
for arg in "$@"; do
  case "$arg" in
    --static) MODE="static" ;;
    --live) MODE="live" ;;
    --loop) LOOP_SECS=1 ;;            # value comes as the next arg
    *)
      if [ "$LOOP_SECS" = "1" ] && [[ "$arg" =~ ^[0-9]+$ ]]; then LOOP_SECS="$arg"; fi
      ;;
  esac
done
if [ "$LOOP_SECS" = "1" ]; then LOOP_SECS=120; fi   # default cadence
if [ "$LOOP_SECS" != "0" ] && [ "$LOOP_SECS" -lt 30 ]; then
  echo "refusing --loop < 30s (a round takes ~10s; anything tighter just burns CPU)"
  exit 2
fi

# pinned expectations — a mismatch means the contract drifted between builds
EXPECTED_FINGERPRINT="3026954531"
EXPECTED_EVENTS=60        # telemetry event contracts (eventCount)
EXPECTED_FEATURES=617     # governed behavioral features (census.features)
EXPECTED_GAMEVARS=544     # governed game variables (census.gameVars)

run_round() {
  local fail=0
  local round_at
  round_at="$(date -u '+%Y-%m-%d %H:%M:%SZ')"

  if [ "$MODE" != "live" ]; then
    echo "══ red-team round · $round_at ══"

    echo "== [1/8] dependency audit (high and above) =="
    if command -v npm >/dev/null 2>&1; then
      # bun.lock is the real lockfile; generate an ephemeral npm lock for the audit
      npm i --package-lock-only --ignore-scripts --no-audit --silent >/dev/null 2>&1
      if npm audit --audit-level=high >/dev/null 2>&1; then
        echo "   ok"
      else
        echo "   FAIL — high/critical advisories present (npm audit)"
        fail=1
      fi
      rm -f package-lock.json
    else
      echo "   skip (npm not installed)"
    fi

    echo "== [2/8] secret material scan =="
    if grep -rEn "sk_live_[A-Za-z0-9]+|whsec_[A-Za-z0-9]+|BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY" \
         --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git \
         --exclude-dir=dist --exclude="bun.lock" . >/dev/null 2>&1; then
      echo "   FAIL — secret-shaped strings found in the tree"
      fail=1
    else
      echo "   ok"
    fi

    echo "== [3/8] .env is never tracked =="
    if git ls-files --error-unmatch .env >/dev/null 2>&1; then
      echo "   FAIL — .env is committed to git"
      fail=1
    else
      echo "   ok"
    fi

    echo "== [4/8] no dynamic code execution in src/ =="
    if grep -rEn "eval\(|new Function\(" src/ --include="*.ts" --include="*.tsx" >/dev/null 2>&1; then
      echo "   FAIL — eval / new Function found in src/"
      fail=1
    else
      echo "   ok"
    fi

    echo "== [5/8] no plaintext password storage =="
    if grep -rn "password,$\|password: \".*\"" src/ --include="*.ts" --include="*.tsx" >/dev/null 2>&1; then
      echo "   FAIL — plaintext password literal/assignment found in src/"
      fail=1
    else
      echo "   ok (auth hashes via PBKDF2 — see src/lib/client/auth.ts)"
    fi

    echo "== [6/8] security headers present in next.config.ts =="
    headers_ok=1
    for h in X-Content-Type-Options X-Frame-Options Referrer-Policy Permissions-Policy Cross-Origin-Opener-Policy; do
      if ! grep -q "$h" next.config.ts; then
        echo "   FAIL — missing header: $h"
        headers_ok=0
        fail=1
      fi
    done
    [ "$headers_ok" -eq 1 ] && echo "   ok"

    echo "== [7/8] service lane hygiene (static) =="
    lane_ok=1
    # the shared secret must never be committed as a literal
    if grep -rEn "ENGINE_SERVICE_KEY\s*=\s*[\"'][A-Za-z0-9]{16,}|SCROLL_TAP__KEY\s*[:=]\s*[\"'][A-Za-z0-9]{16,}" \
         src/ services-csharp/ scripts/ docs/ --include="*.ts" --include="*.tsx" --include="*.cs" --include="*.md" >/dev/null 2>&1; then
      echo "   FAIL — a literal service key is committed in the tree"
      lane_ok=0; fail=1
    fi
    # the key must never be logged
    if grep -rEn "console\.(log|error|warn|info)\(.*(svcKey|serviceKey|_serviceKey)" src/ --include="*.ts" >/dev/null 2>&1; then
      echo "   FAIL — service key can reach a console log in src/"
      lane_ok=0; fail=1
    fi
    # the comparison must be timing-safe
    if ! grep -q "timingSafeEqual" src/lib/telemetry/serviceLane.ts; then
      echo "   FAIL — serviceLane.ts no longer uses timingSafeEqual"
      lane_ok=0; fail=1
    fi
    # the lane must fail closed when unconfigured
    if ! grep -q "length < SERVICE_KEY_MIN_LEN) return false" src/lib/telemetry/serviceLane.ts; then
      echo "   FAIL — serviceKeyMatches no longer fails closed on short/absent keys"
      lane_ok=0; fail=1
    fi
    [ "$lane_ok" -eq 1 ] && echo "   ok"
  fi

  if [ "$MODE" != "static" ]; then
    echo "== [8/8] service lane — LIVE adversarial probes =="

    SCRATCH_URL="${REDTEAM_BASE_URL:-}"
    SCRATCH_KEY="${REDTEAM_SERVICE_KEY:-}"
    OWN_SERVER=0
    SRV_PID=""
    TMPDB=""
    TMPDIR_RT="$(mktemp -d)"

    cleanup() {
      if [ -n "$SRV_PID" ]; then kill "$SRV_PID" >/dev/null 2>&1; wait "$SRV_PID" 2>/dev/null; fi
      [ -n "$TMPDB" ] && rm -f "$TMPDB"
      rm -rf "$TMPDIR_RT"
    }
    trap cleanup EXIT

    if [ -z "$SCRATCH_URL" ]; then
      # ── boot an isolated scratch instance ──
      SCRATCH_URL="http://127.0.0.1:3111"
      SCRATCH_KEY="$( (openssl rand -hex 16 2>/dev/null || head -c16 /dev/urandom | od -An -tx1 | tr -d ' \n') )"
      if [ "${#SCRATCH_KEY}" -lt 16 ]; then
        echo "   FAIL — could not generate a scratch key"
        return 1
      fi
      OWN_SERVER=1
      TMPDB="$(mktemp -u /tmp/redteam-XXXXXX.db)"
      cp db/custom.db "$TMPDB"
      # launch DIRECTLY (no subshell) so $SRV_PID is the real server PID and
      # cleanup can't orphan it; runs from the project root on its own port.
      DATABASE_URL="file:$TMPDB" ENGINE_SERVICE_KEY="$SCRATCH_KEY" \
      ENGINE_SERVICE_RATE_LIMIT=5 HOSTNAME=127.0.0.1 PORT=3111 NODE_ENV=production \
      bun .next/standalone/server.js >"$TMPDIR_RT/server.log" 2>&1 &
      SRV_PID=$!
      # wait for readiness (max 30s) — and fail loudly if the process died
      # (e.g. EADDRINUSE from a leftover listener on :3111)
      ready=0
      for _ in $(seq 1 60); do
        if ! kill -0 "$SRV_PID" 2>/dev/null; then
          echo "   FAIL — scratch server process died at boot; last log lines:"
          tail -5 "$TMPDIR_RT/server.log" | sed 's/^/     /'
          return 1
        fi
        code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 2 "$SCRATCH_URL/api/engine/schema" 2>/dev/null || echo 000)"
        [ "$code" = "200" ] && { ready=1; break; }
        sleep 0.5
      done
      if [ "$ready" != "1" ]; then
        echo "   FAIL — scratch server did not become ready (see $TMPDIR_RT/server.log)"
        return 1
      fi
      echo "   scratch server up on :3111 (pid $SRV_PID, isolated db copy, rate cap 5/min, key ${SCRATCH_KEY:0:4}…)"
    fi

    jget() { python3 -c "import json,sys;d=json.load(open(sys.argv[1]));print(d.get(sys.argv[2],''))" "$1" "$2" 2>/dev/null; }

    # a. schema fingerprint pin — the three-language contract must not drift
    curl -s --max-time 10 "$SCRATCH_URL/api/engine/schema" -o "$TMPDIR_RT/schema.json"
    fp="$(jget "$TMPDIR_RT/schema.json" fingerprint)"
    evc="$(jget "$TMPDIR_RT/schema.json" eventCount)"
    feat="$(python3 -c "import json;print(json.load(open('$TMPDIR_RT/schema.json')).get('census',{}).get('features',''))" 2>/dev/null)"
    gvar="$(python3 -c "import json;print(json.load(open('$TMPDIR_RT/schema.json')).get('census',{}).get('gameVars',''))" 2>/dev/null)"
    if [ "$fp" = "$EXPECTED_FINGERPRINT" ] && [ "$evc" = "$EXPECTED_EVENTS" ] && [ "$feat" = "$EXPECTED_FEATURES" ] && [ "$gvar" = "$EXPECTED_GAMEVARS" ]; then
      echo "   ok  a. schema pin fingerprint=$fp events=$evc features=$feat gameVars=$gvar"
    else
      echo "   FAIL a. schema drifted: fingerprint=$fp (want $EXPECTED_FINGERPRINT), events=$evc/$EXPECTED_EVENTS, features=$feat/$EXPECTED_FEATURES, gameVars=$gvar/$EXPECTED_GAMEVARS"
      fail=1
    fi

    # a real userId from the (copied) database for attribution probes
    PROBE_USER="$(bun -e "
      const { PrismaClient } = require('@prisma/client')
      const db = new PrismaClient({ datasources: { db: { url: 'file:$TMPDB' } } })
      const u = await db.user.findFirst({ select: { id: true } })
      await db.\$disconnect()
      process.stdout.write(u?.id ?? '')
    " 2>/dev/null || true)"
    if [ -z "$PROBE_USER" ] && [ "$OWN_SERVER" = "1" ]; then
      echo "   FAIL — no user row found in the scratch db for attribution probes"
      return 1
    fi

    hdr() { curl -s -D "$TMPDIR_RT/h.txt" -o "$TMPDIR_RT/b.txt" --max-time 10 "$@"; }

    # b. wrong key → 401, and the real key never appears in the response
    code="$(hdr -w '%{http_code}' -X POST "$SCRATCH_URL/api/engine/event" \
      -H "x-scroll-service-key: wrong-key-of-exactly-32-characters" \
      -H "content-type: application/json" -d '{"events":[]}' 2>/dev/null || echo 000)"
    if [ "$code" = "401" ] && ! grep -q "$SCRATCH_KEY" "$TMPDIR_RT/b.txt" "$TMPDIR_RT/h.txt" 2>/dev/null; then
      echo "   ok  b. wrong key rejected (401), key not echoed"
    else
      echo "   FAIL b. wrong key → $code (want 401) or key leaked in response"
      fail=1
    fi

    # c. userId in body WITHOUT a key must NOT get service-lane attribution
    code="$(hdr -w '%{http_code}' -X POST "$SCRATCH_URL/api/engine/event" \
      -H "content-type: application/json" \
      -d "{\"events\":[{\"type\":\"app_open\",\"payload\":{\"hour\":9},\"userId\":\"$PROBE_USER\"}]}" 2>/dev/null || echo 000)"
    lane="$(jget "$TMPDIR_RT/b.txt" lane)"
    if [ "$lane" != "service" ]; then
      echo "   ok  c. body userId without key does NOT ride the service lane (lane=$lane, $code)"
    else
      echo "   FAIL c. service-lane attribution granted without a key!"
      fail=1
    fi

    if [ -n "$PROBE_USER" ]; then
      # d. good key + valid event → stored, attributed to the named user
      code="$(hdr -w '%{http_code}' -X POST "$SCRATCH_URL/api/engine/event" \
        -H "x-scroll-service-key: $SCRATCH_KEY" -H "content-type: application/json" \
        -d "{\"events\":[{\"type\":\"app_open\",\"payload\":{\"hour\":9},\"userId\":\"$PROBE_USER\"}]}" 2>/dev/null || echo 000)"
      stored="$(jget "$TMPDIR_RT/b.txt" stored)"
      laneD="$(jget "$TMPDIR_RT/b.txt" lane)"
      if [ "$code" = "200" ] && [ "$laneD" = "service" ] && { [ "${stored:-0}" -ge 1 ] 2>/dev/null; }; then
        echo "   ok  d. keyed tap accepted via service lane (stored=$stored)"
      else
        echo "   FAIL d. keyed tap → $code lane=$laneD stored=$stored (want 200/service/≥1)"
        fail=1
      fi

      # e. keyed tap with junk userIds → rejected, nothing stored
      code="$(hdr -w '%{http_code}' -X POST "$SCRATCH_URL/api/engine/event" \
        -H "x-scroll-service-key: $SCRATCH_KEY" -H "content-type: application/json" \
        -d '{"events":[{"type":"app_open","payload":{"hour":9},"userId":"!!junk!!"},{"type":"app_open","payload":{"hour":9},"userId":""}]}' 2>/dev/null || echo 000)"
      rej="$(jget "$TMPDIR_RT/b.txt" rejected)"
      st="$(jget "$TMPDIR_RT/b.txt" stored)"
      if [ "$code" = "200" ] && { [ "${rej:-0}" -ge 2 ] 2>/dev/null; } && [ "${st:-0}" = "0" ]; then
        echo "   ok  e. junk attribution rejected (rejected=$rej, stored=0)"
      else
        echo "   FAIL e. junk userId → $code rejected=$rej stored=$st (want rejected≥2, stored=0)"
        fail=1
      fi
    fi

    # f. oversized body → 413 (guard fires before any lane work)
    # (payload goes via --data @file: a single argv string is capped ~128KB)
    python3 -c "print('{\"events\":[{\"type\":\"app_open\",\"payload\":{\"hour\":9,\"pad\":\"'+'x'*200000+'\"}]}')" >"$TMPDIR_RT/big.json"
    code="$(hdr -w '%{http_code}' -X POST "$SCRATCH_URL/api/engine/event" \
      -H "x-scroll-service-key: $SCRATCH_KEY" -H "content-type: application/json" \
      --data @"$TMPDIR_RT/big.json" 2>/dev/null || echo 000)"
    if [ "$code" = "413" ]; then
      echo "   ok  f. oversized payload refused (413)"
    else
      echo "   FAIL f. oversized payload → $code (want 413)"
      fail=1
    fi

    # g. invalid JSON → 400
    code="$(hdr -w '%{http_code}' -X POST "$SCRATCH_URL/api/engine/event" \
      -H "x-scroll-service-key: $SCRATCH_KEY" -H "content-type: application/json" \
      -d 'not-json' 2>/dev/null || echo 000)"
    if [ "$code" = "400" ]; then
      echo "   ok  g. invalid json refused (400)"
    else
      echo "   FAIL g. invalid json → $code (want 400)"
      fail=1
    fi

    # i. rate cap — only meaningful on our own scratch server (cap=5)
    if [ "$OWN_SERVER" = "1" ] && [ -n "$PROBE_USER" ]; then
      saw429=0
      for _ in $(seq 1 10); do
        c="$(curl -s -o "$TMPDIR_RT/b.txt" -w '%{http_code}' --max-time 5 -X POST "$SCRATCH_URL/api/engine/event" \
          -H "x-scroll-service-key: $SCRATCH_KEY" -H "content-type: application/json" \
          -d "{\"events\":[{\"type\":\"app_open\",\"payload\":{\"hour\":9},\"userId\":\"$PROBE_USER\"}]}" 2>/dev/null || echo 000)"
        [ "$c" = "429" ] && saw429=1
      done
      if [ "$saw429" = "1" ]; then
        echo "   ok  i. service-lane rate cap engaged (429 under sustained keyed fire)"
      else
        echo "   FAIL i. 10 rapid keyed taps never hit the cap — is ENGINE_SERVICE_RATE_LIMIT honored?"
        fail=1
      fi
    else
      echo "   skip i. flood probe (shared staging target — cap not lowered)"
    fi

    cleanup
    trap - EXIT
  fi

  echo
  if [ "$fail" -eq 0 ]; then
    echo "RED TEAM: PASS"
  else
    echo "RED TEAM: FAIL — fix the items above before shipping"
  fi
  return "$fail"
}

if [ "$LOOP_SECS" -gt 0 ] 2>/dev/null; then
  echo "continuous adversarial checking: full round every ${LOOP_SECS}s (Ctrl-C to stop)"
  rounds=0
  fails=0
  while true; do
    rounds=$((rounds + 1))
    if ! run_round; then fails=$((fails + 1)); fi
    echo "── rounds=$rounds failures=$fails · sleeping ${LOOP_SECS}s ──"
    sleep "$LOOP_SECS"
  done
else
  run_round
  exit $?
fi
