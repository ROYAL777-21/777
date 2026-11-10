#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#  verify-v7.sh — end-to-end verification of the v7 build (v3)
#   1. tab bar consolidation (4 tabs, Stories in Profile → Explore)
#   2. church-plan dashboard (API math + guards + UI)
#   3. gift-subscription order bump (checkout + redeem + race guards)
# Notes: innerText is CASE-SENSITIVE and reflects CSS `uppercase`;
# all text checks are lowercased. Engine may highlight any plan, so
# the expected order-bump total is derived from the rendered header.
# ═══════════════════════════════════════════════════════════════
cd /home/z/my-project
mkdir -p screenshots
rm -f screenshots/v7-*.png
PASS=0; FAIL=0
ok()   { PASS=$((PASS+1)); echo "  ✓ $1"; }
bad()  { FAIL=$((FAIL+1)); echo "  ✗ $1"; }
# case-insensitive page-text assert (innerText follows CSS uppercase)
hasText() { B eval "document.body.innerText.toLowerCase().includes(\"$1\")" 2>/dev/null | grep -q true; }
# click first button whose text contains $1 (case-insensitive)
clickBtn() { B eval "(function(){const b=[...document.querySelectorAll('button')].find(b=>b.textContent.toLowerCase().includes('$1'));if(b)b.click();})()" > /dev/null 2>&1; }
# react-friendly input set (IIFE — evals share scope in this CLI)
fillInput() { B eval "(function(){const el=document.querySelector('$1');const p='$3'==='textarea'?window.HTMLTextAreaElement.prototype:window.HTMLInputElement.prototype;const s=Object.getOwnPropertyDescriptor(p,'value').set;s.call(el,'$2');el.dispatchEvent(new Event('input',{bubbles:true}))})()" > /dev/null 2>&1; }

echo "── 0. prep ─────────────────────────────────"
pkill -f "next dev" 2>/dev/null; pkill -f "next-server" 2>/dev/null; sleep 1
python3 - <<'PY'
import sqlite3
con = sqlite3.connect("db/custom.db")
con.execute("UPDATE User SET name='Scribe' WHERE id='user_1'")
con.execute("UPDATE UserProgress SET plan='free', trialEndsAt=NULL WHERE userId='user_1'")
con.execute("DELETE FROM GiftCode")
con.commit()
print("  · name→Scribe · plan→free · gifts cleared")
PY

echo "── 1. dev server ───────────────────────────"
bun run dev > /dev/null 2>&1 &
SRV=$!
code=""
for i in $(seq 1 40); do sleep 2; code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 4 http://localhost:3000/api/bootstrap 2>/dev/null); [ "$code" = "200" ] && break; done
[ "$code" = "200" ] && ok "server up" || { bad "server never became ready"; exit 1; }
# warm every route the browser flow will hit (first-hit compiles are slow)
curl -s http://localhost:3000/api/church > /dev/null; curl -s http://localhost:3000/api/gift > /dev/null; curl -s http://localhost:3000/api/pro > /dev/null

echo "── 2. church API math + guards ─────────────"
curl -s http://localhost:3000/api/church > /tmp/church.json
python3 - <<'PY' && ok "church payload invariants" || bad "church payload invariants"
import json
d = json.load(open("/tmp/church.json"))
assert d["org"]["seatsUsed"] == 27 and d["org"]["seatsTotal"] == 50
assert d["org"]["priceMonthly"] == 99
assert d["you"]["name"] == "Scribe" and d["you"]["role"] == "admin"
assert len(d["members"]) == 27
you = [m for m in d["members"] if m["isYou"]]
assert len(you) == 1 and you[0]["role"] == "admin" and you[0]["lastActiveDaysAgo"] <= 1
c = d["cohort"]
assert c["lessonsTotal"] == sum(m["lessons"] for m in d["members"])
assert c["chaptersRead"] == sum(m["chaptersRead"] for m in d["members"])
assert abs(c["coveragePct"] - round(c["chaptersRead"] / 1189 * 1000) / 10) < 0.11
assert sum(b["count"] for b in c["streakBands"]) == 27
assert sum(b["count"] for b in c["engagementBands"]) == 27
assert len(c["weekly"]) == 8
assert c["activeThisWeek"] == sum(1 for m in d["members"] if m["lastActiveDaysAgo"] <= 7)
print("invariants ok")
PY
R=$(curl -s -X POST http://localhost:3000/api/church -H 'content-type: application/json' -d '{"action":"invite","name":"Test Seat"}')
echo "$R" | grep -q '"seatsUsed":28' && ok "invite → 28 seats" || bad "invite failed: $R"
MID=$(echo "$R" | python3 -c "import json,sys; print(json.load(sys.stdin)['memberId'])")
R=$(curl -s -X POST http://localhost:3000/api/church -H 'content-type: application/json' -d "{\"action\":\"remove\",\"memberId\":\"$MID\"}")
echo "$R" | grep -q '"ok":true' && ok "remove → back to 27" || bad "remove failed: $R"
R=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3000/api/church -H 'content-type: application/json' -d '{"action":"invite","name":"x"}')
[ "$R" = "400" ] && ok "invite short name → 400" || bad "short name guard: $R"
ADMINID=$(curl -s http://localhost:3000/api/church | python3 -c "import json,sys; d=json.load(sys.stdin); print([m['id'] for m in d['members'] if m['isYou']][0])")
R=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3000/api/church -H 'content-type: application/json' -d "{\"action\":\"remove\",\"memberId\":\"$ADMINID\"}")
[ "$R" = "403" ] && ok "remove admin seat → 403" || bad "admin guard: $R"

echo "── 3. browser: 4-tab bar (mobile) ──────────"
B() { agent-browser "$@"; }
B set viewport 390 844 > /dev/null
B open http://localhost:3000 > /dev/null
B wait --load networkidle > /dev/null
B wait 1500 > /dev/null
B screenshot screenshots/v7-01-mobile-tabs.png > /dev/null
VTABS=$(B eval "[...document.querySelectorAll('nav[aria-label=Main]')].filter(n=>getComputedStyle(n).display!=='none').map(n=>n.querySelectorAll('button').length).join('+')" 2>/dev/null | tr -d '"')
[ "$VTABS" = "4" ] && ok "visible mobile tab bar has exactly 4 tabs" || bad "tab count: $VTABS"
NAMES=$(B eval "[...document.querySelectorAll('nav[aria-label=Main]')].filter(n=>getComputedStyle(n).display!=='none')[0].innerText.replace(/\\n/g,'·')" 2>/dev/null)
echo "  · tabs: $NAMES"
echo "$NAMES" | grep -qi "stories" && bad "Stories still a tab" || ok "Stories is NOT a tab (it lives in Profile → Explore)"

echo "── 4. browser: profile + explore + cards ───"
B eval "[...document.querySelectorAll('nav[aria-label=Main] button')].find(b=>b.getAttribute('aria-label')==='Profile').click()" > /dev/null
B wait 3500 > /dev/null
B screenshot --full screenshots/v7-02-profile.png > /dev/null
hasText "open the dashboard" && ok "ChurchPlanCard on profile" || bad "ChurchPlanCard missing"
hasText "explore" && ok "Explore menu present" || bad "Explore missing"
hasText "gift subscriptions" && ok "GiftCard on profile" || bad "GiftCard missing"
clickBtn "church plan"
B wait 2500 > /dev/null
B screenshot --full screenshots/v7-03-church-mobile.png > /dev/null
for t in "verse coverage" "cohort lessons" "worth a call" "the cohort" "grace community church" "add seat"; do
  hasText "$t" && ok "dashboard: ‘$t’" || bad "dashboard missing ‘$t’"
done
B set viewport 1280 900 > /dev/null
B reload > /dev/null; B wait --load networkidle > /dev/null; B wait 1500 > /dev/null
B screenshot --full screenshots/v7-04-church-desktop.png > /dev/null
hasText "church plan" && ok "desktop: church view + sidebar entry" || bad "desktop church missing"

echo "── 5. browser: paywall → checkout → order bump ─"
B set viewport 390 844 > /dev/null
B eval "[...document.querySelectorAll('nav[aria-label=Main] button')].find(b=>b.getAttribute('aria-label')==='Profile').click()" > /dev/null
B wait 2500 > /dev/null
clickBtn "try 7 days free"
B wait 2000 > /dev/null
B screenshot screenshots/v7-05-paywall.png > /dev/null
hasText "founding pricing ends in" && ok "paywall open (urgency block)" || bad "paywall did not open"
clickBtn "or skip the trial"
B wait 1200 > /dev/null
B screenshot --full screenshots/v7-06-checkout.png > /dev/null
hasText "one step left" && ok "checkout step reached" || bad "checkout step missing"
hasText "gift a year of scroll pro" && ok "order bump visible" || bad "order bump missing"
# which plan did the engine highlight?
HDR=$(B eval "document.body.innerText.match(/CHECKOUT · ([A-Z ]+)/)?.[1]||'?'" 2>/dev/null | tr -d '"')
BASE=$(B eval "document.body.innerText.match(/Total today/)?'0':'0'" > /dev/null; echo "")
case "$HDR" in
  MONTHLY) BASE=12.99 ;;
  ANNUAL)  BASE=59.99 ;;
  LIFETIME) BASE=149 ;;
  *) BASE=6.50; HDR="EXIT OFFER" ;;
esac
EXP=$(python3 -c "print(f'{$BASE+39.99:.2f}')")
echo "  · engine highlighted: $HDR → base \$$BASE + bump \$39.99 = \$$EXP"
B eval "(function(){document.querySelector('button[aria-label=\"Add a gift year\"]').click()})()" > /dev/null
B wait 700 > /dev/null
fillInput "#gift-to" "Naomi" input
fillInput "#gift-msg" "Happy birthday — read John with me this year." textarea
B wait 400 > /dev/null
B screenshot --full screenshots/v7-07-bump-on.png > /dev/null
GOT=$(B eval "[...document.querySelectorAll('button')].map(b=>b.textContent).filter(t=>t.includes('Confirm —')).join('')" 2>/dev/null | tr -d '"')
echo "  · CTA rendered: $GOT"
echo "$GOT" | grep -q "\$$EXP" && ok "order-bump total math: \$$EXP" || bad "total wrong: '$GOT' (expected \$$EXP)"
clickBtn "confirm —"
B wait --text "Your gift year is sent" --timeout 20000 > /dev/null 2>&1 && ok "gift success screen" || { sleep 3; hasText "your gift year is sent" && ok "gift success screen" || bad "no gift success screen"; }
B screenshot screenshots/v7-08-gift-success.png > /dev/null
CODE_ON_PAGE=$(B eval "document.body.innerText.match(/SCROLL-[A-Z2-9]{4}-[A-Z2-9]{4}/)?.[0]||''" 2>/dev/null | tr -d '"')
echo "  · code shown on screen: $CODE_ON_PAGE"

echo "── 6. gift semantics (API, race-proof) ────"
CODE=$(python3 -c "
import sqlite3
con = sqlite3.connect('db/custom.db')
r = con.execute('SELECT code FROM GiftCode ORDER BY purchasedAt DESC LIMIT 1').fetchone()
print(r[0] if r else '')")
[ -n "$CODE" ] && [ "$CODE" = "$CODE_ON_PAGE" ] && ok "gift code persisted ($CODE)" || bad "code mismatch db='$CODE' page='$CODE_ON_PAGE'"
R=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3000/api/gift -H 'content-type: application/json' -d '{"action":"redeem","code":"SCROLL-ABCD-EFGH"}')
[ "$R" = "404" ] && ok "unknown code → 404" || bad "not-found guard: $R"
R=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3000/api/gift -H 'content-type: application/json' -d '{"action":"redeem","code":"GIVE-ME-PRO"}')
[ "$R" = "400" ] && ok "bad format → 400" || bad "format guard: $R"
curl -s -X POST http://localhost:3000/api/gift -H 'content-type: application/json' -d "{\"action\":\"redeem\",\"code\":\"$CODE\"}" > /tmp/r1.json & P1=$!
curl -s -X POST http://localhost:3000/api/gift -H 'content-type: application/json' -d "{\"action\":\"redeem\",\"code\":\"$CODE\"}" > /tmp/r2.json & P2=$!
curl -s -X POST http://localhost:3000/api/gift -H 'content-type: application/json' -d "{\"action\":\"redeem\",\"code\":\"$CODE\"}" > /tmp/r3.json & P3=$!
wait $P1 $P2 $P3
WINS=$(grep -l '"ok":true' /tmp/r1.json /tmp/r2.json /tmp/r3.json 2>/dev/null | wc -l)
CONF=$(grep -h -c '"already_redeemed"' /tmp/r1.json /tmp/r2.json /tmp/r3.json 2>/dev/null | awk '{s+=$1} END {print s}')
[ "$WINS" = "1" ] && [ "$CONF" = "2" ] && ok "3-way parallel redeem: exactly 1 win · 2 rejected" || bad "race guard: wins=$WINS conflicts=$CONF"
curl -s http://localhost:3000/api/pro | grep -q '"isPro":true' && ok "Pro active via redeemed gift year" || bad "plan not pro after redeem"

echo "── 7. browser: sent ledger + golden Pro card ─"
clickBtn "done"
B wait 800 > /dev/null
# fresh mount (a real user returning later sees the redeemed state)
B reload > /dev/null
B wait --load networkidle > /dev/null
B wait 1500 > /dev/null
B eval "[...document.querySelectorAll('nav[aria-label=Main] button')].find(b=>b.getAttribute('aria-label')==='Profile').click()" > /dev/null
B wait 3000 > /dev/null
B screenshot --full screenshots/v7-09-profile-redeemed.png > /dev/null
{ hasText "years you" || hasText "awaiting redemption"; } && ok "sent ledger shows on profile" || bad "sent ledger missing"
B eval "document.body.textContent.includes('Redeemed by Scribe')" 2>/dev/null | grep -q true && ok "redeemed-by state visible" || bad "redeemed-by missing"
curl -s http://localhost:3000/api/gift | python3 -c "
import json,sys
d = json.load(sys.stdin)
assert len(d['sent']) == 1 and d['sent'][0]['redeemedAt'], 'sent row redeemed'
assert d['sent'][0]['toLabel'] == 'To Naomi', d['sent'][0]['toLabel']
assert d['sent'][0]['message'].startswith('Happy birthday'), 'message kept'
assert len(d['redeemed']) == 1 and d['redeemed'][0]['months'] == 12
assert d['sent'][0]['redeemedName'] == 'Scribe', d['sent'][0]['redeemedName']
print('ledger ok')" && ok "gift ledger consistency" || bad "gift ledger consistency"

echo "── 8. wrap-up ──────────────────────────────"
kill $SRV 2>/dev/null; pkill -f "next dev" 2>/dev/null; pkill -f "next-server" 2>/dev/null
agent-browser close > /dev/null 2>&1
echo ""
echo "═══ RESULT: $PASS passed · $FAIL failed ═══"
ls -la screenshots/v7-*.png 2>/dev/null | awk '{print "  " $NF " (" $5 " bytes)"}'
[ "$FAIL" = "0" ]
