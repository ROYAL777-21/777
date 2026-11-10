#!/usr/bin/env python3
"""Fetch transcripts for all 16 Tim Gabe videos."""
import json
import os
import time
from youtube_transcript_api import YouTubeTranscriptApi

VIDEOS = {
    "Du2lkZ_cux8": "The Secret Behind Weirdly Addictive Apps",
    "YS7uOXjmJTA": "The Only Formula Behind Truly Great Apps",
    "yBpv5rZoBjA": "How To Scientifically Design Addictive Apps",
    "pqWPKgfBDiw": "How Top 1% Startups Avoid the Vibe-Coded Look",
    "qJ4qYhTqAz0": "How Top Apps Scientifically Design Paywalls That Convert",
    "YA3QpYIKqNI": "How Top 1% Apps Earn Your Second Visit",
    "VkFDdGGGA-s": "Why Irresistible Apps Are Designed This Way (It's Genius)",
    "HA4yB_sd62Q": "The Weird Design Playbook of 6 App Outliers",
    "BxhsCu9hNpY": "Why Leaderboards Kill App Retention (How To Fix It)",
    "sYRhXB_ZcLI": "I Studied 10,000 Paywall Screens (THIS Makes People Pay)",
    "MAvKHToGiVY": "How Top 1% Indie Apps Beats Giants",
    "LXX_qOA5D8E": "I Studied 500+ Gamified Apps (Here's What Actually Works)",
    "wmTkiF23GRQ": "Our World Class App Design Formula",
    "11h4H3TAGkM": "The Tiny Design Rule Behind Top 1% Apps",
    "D9SXaj6qQIQ": "How Top 1% Apps Keep You Hooked",
    "8EAYZe6y3I8": "The Psychology of Premium Apps",
}

OUT_DIR = "/home/z/my-project/scripts/transcripts"
os.makedirs(OUT_DIR, exist_ok=True)

# Use the new API style (v1.x: instance methods)
api = YouTubeTranscriptApi()

for vid, title in VIDEOS.items():
    out_file = f"{OUT_DIR}/{vid}.txt"
    if os.path.exists(out_file) and os.path.getsize(out_file) > 500:
        print(f"{vid}: already have it")
        continue
    try:
        fetched = api.fetch(vid, languages=["en", "en-US", "en-GB"])
        text = " ".join(snippet.text for snippet in fetched)
        with open(out_file, "w") as f:
            f.write(f"TITLE: {title}\nURL: https://youtu.be/{vid}\n\n{text}")
        print(f"{vid}: OK  ({len(text)} chars, {fetched.total_duration:.0f}s)")
    except Exception as e:
        print(f"{vid}: ERROR {type(e).__name__}: {str(e)[:120]}")
    time.sleep(1.0)

print("\nDone")
