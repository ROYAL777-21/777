#!/bin/bash
# Full transcript extraction v2: scroll-collect all segments per video
set -u
OUT=/home/z/my-project/scripts/transcripts
COLLECT=/home/z/my-project/scripts/collect_transcript.js
mkdir -p "$OUT"

declare -A VIDS=(
  [Du2lkZ_cux8]="addictive-apps"
  [YS7uOXjmJTA]="great-apps-formula"
  [yBpv5rZoBjA]="scientifically-addictive"
  [pqWPKgfBDiw]="avoid-vibe-coded-look"
  [qJ4qYhTqAz0]="paywalls-that-convert"
  [YA3QpYIKqNI]="earn-second-visit"
  [VkFDdGGGA-s]="irresistible-design"
  [HA4yB_sd62Q]="six-outliers-playbook"
  [BxhsCu9hNpY]="leaderboards-kill-retention"
  [sYRhXB_ZcLI]="10000-paywalls"
  [MAvKHToGiVY]="indie-beats-giants"
  [LXX_qOA5D8E]="500-gamified-apps"
  [wmTkiF23GRQ]="design-formula"
  [11h4H3TAGkM]="tiny-design-rule"
  [D9SXaj6qQIQ]="keep-you-hooked"
  [8EAYZe6y3I8]="premium-psychology"
)

for VID in "${!VIDS[@]}"; do
  SLUG="${VIDS[$VID]}"
  OUTFILE="$OUT/$SLUG.txt"
  echo "== $VID ($SLUG)"
  # fresh anonymous session
  agent-browser cookies clear > /dev/null 2>&1
  agent-browser storage local clear > /dev/null 2>&1
  agent-browser open "https://notegpt.io/youtube-transcript-generator" > /dev/null 2>&1
  sleep 5
  SNAPS=$(agent-browser snapshot -i -c 2>/dev/null)
  TREF=$(echo "$SNAPS" | grep -oE 'textbox "Paste the YouTube video link[^[]*" \[ref=e[0-9]+' | grep -oE 'e[0-9]+$' | head -1)
  GREF=$(echo "$SNAPS" | grep -oE 'button "Generate Transcript" \[ref=e[0-9]+' | grep -oE 'e[0-9]+$' | head -1)
  if [ -z "$TREF" ] || [ -z "$GREF" ]; then
    echo "   REFS NOT FOUND — skipping"
    continue
  fi
  agent-browser fill "@${TREF}" "https://www.youtube.com/watch?v=$VID" > /dev/null 2>&1
  agent-browser click "@${GREF}" > /dev/null 2>&1
  # wait for transcript
  FOUND=0
  for i in $(seq 1 20); do
    sleep 3
    HAS=$(agent-browser eval "/\d\d:\d\d/.test(document.body.innerText)" 2>/dev/null | tr -d '"')
    if [ "$HAS" = "true" ]; then FOUND=1; break; fi
  done
  if [ "$FOUND" != "1" ]; then
    echo "   transcript did not load"
    continue
  fi
  sleep 2
  # run in-browser scroll-collect (up to ~90s)
  RESULT=$(agent-browser eval "$(cat "$COLLECT")" 2>/dev/null | tail -1)
  echo "   $RESULT"
  # fetch the collected transcript
  agent-browser eval "window.__fullTranscript" > /tmp/raw_transcript.txt 2>&1
  python3 - "$OUTFILE" "$VID" "$SLUG" <<'PYEOF'
import sys, json
outfile, vid, slug = sys.argv[1], sys.argv[2], sys.argv[3]
raw = open('/tmp/raw_transcript.txt').read()
try:
    if raw.startswith('"'):
        raw = json.loads(raw)
except Exception:
    pass
raw = raw.replace('\\"', '"')
with open(outfile, 'w') as f:
    f.write(f"TITLE: {slug}\nURL: https://youtu.be/{vid}\n\n{raw}")
print(f"   saved {len(raw)} chars")
PYEOF
done
echo "ALL DONE"
