#!/usr/bin/env python3
"""Fetch YouTube video metadata for all UX/gamification videos."""
import json
import urllib.request
import urllib.parse
import time

VIDEOS = [
    "Du2lkZ_cux8",  # duplicated in user msg
    "YS7uOXjmJTA",
    "yBpv5rZoBjA",
    "pqWPKgfBDiw",
    "qJ4qYhTqAz0",
    "YA3QpYIKqNI",
    "VkFDdGGGA-s",
    "HA4yB_sd62Q",
    "BxhsCu9hNpY",
    "sYRhXB_ZcLI",
    "MAvKHToGiVY",
    "LXX_qOA5D8E",
    "wmTkiF23GRQ",
    "11h4H3TAGkM",
    "D9SXaj6qQIQ",
    "8EAYZe6y3I8",
]

results = {}
for vid in VIDEOS:
    url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=15) as r:
            data = json.loads(r.read().decode())
        results[vid] = {"title": data.get("title"), "author": data.get("author_name"),
                        "author_url": data.get("author_url")}
        print(f"{vid}: {data.get('title')}  —  {data.get('author_name')}")
    except Exception as e:
        results[vid] = {"error": str(e)}
        print(f"{vid}: ERROR {e}")
    time.sleep(0.3)

with open("/home/z/my-project/scripts/video_meta.json", "w") as f:
    json.dump(results, f, indent=2)
print("\nSaved to video_meta.json")
