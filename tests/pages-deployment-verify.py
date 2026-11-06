#!/usr/bin/env python3
"""Verify GitHub Pages is serving the exact committed HD-20 entrypoint/scripts."""
import hashlib
import os
import pathlib
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

BASE = os.environ.get("HD20_PAGES_URL", "https://hastom79-hue.github.io/hd-20/").rstrip("/") + "/"
FILES = (
    "index.html",
    "audit-as-is-to-be-manager.js",
    "hd20-subtabs.js",
    "retention-recheck-integrity-guard.js",
    "retention-draw-integrity-guard.js",
)
ATTEMPTS = max(1, int(os.environ.get("HD20_DEPLOY_ATTEMPTS", "16")))
WAIT_SECONDS = max(0, int(os.environ.get("HD20_DEPLOY_WAIT_SECONDS", "15")))
SHA = os.environ.get("GITHUB_SHA", "local")[:12]
ROOT = pathlib.Path(__file__).resolve().parents[1]


def fetch(path):
    url = urllib.parse.urljoin(BASE, path)
    joiner = "&" if "?" in url else "?"
    url += joiner + urllib.parse.urlencode({"hd20_verify": SHA})
    request = urllib.request.Request(url, headers={"User-Agent": "HD20-Pages-Deployment-Integrity/1.0", "Cache-Control": "no-cache"})
    with urllib.request.urlopen(request, timeout=15) as response:
        return response.read()


def verify_once():
    expected_index = (ROOT / "index.html").read_bytes()
    actual_index = fetch("index.html")
    if actual_index != expected_index:
        raise ValueError("index.html is not byte-for-byte equal to main (deploy pending or HTML transformed)")
    index_text = expected_index.decode("utf-8")
    script_urls = re.findall(r"<script\b[^>]*\bsrc=[\"']([^\"']+)", index_text, flags=re.I)
    checked = []
    for name in FILES[1:]:
        matching = [path for path in script_urls if urllib.parse.urlsplit(path).path.lstrip("./") == name]
        if len(matching) != 1:
            raise ValueError(f"{name}: expected one script tag, found {len(matching)}")
        expected = (ROOT / name).read_bytes()
        deployed = fetch(matching[0])
        if deployed != expected:
            local_digest = hashlib.sha256(expected).hexdigest()[:12]
            remote_digest = hashlib.sha256(deployed).hexdigest()[:12]
            raise ValueError(f"{name} mismatch: main={local_digest}, Pages={remote_digest}")
        checked.append(name)
    return checked


if __name__ == "__main__":
    for attempt in range(1, ATTEMPTS + 1):
        try:
            verified = verify_once()
            print(f"PASS Pages matches main {SHA}: index.html + {len(verified)} scripts")
            for filename in verified:
                print(f"PASS {filename}")
            sys.exit(0)
        except (urllib.error.URLError, TimeoutError, ValueError, OSError, UnicodeError) as error:
            print(f"Attempt {attempt}/{ATTEMPTS}: {error}", flush=True)
            if attempt < ATTEMPTS:
                time.sleep(WAIT_SECONDS)
    print("FAIL: latest main not verified on Pages. Check Pages deployment, access policy and cached content.")
    sys.exit(1)
