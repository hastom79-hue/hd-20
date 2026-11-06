#!/usr/bin/env python3
"""Read-only live browser smoke test. No login bypass and no mutations of business records."""
import os
import sys
from urllib.parse import urljoin

from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout

BASE = os.environ.get("HD20_PAGES_URL", "https://hastom79-hue.github.io/hd-20/")
AREAS = (
    ("dashboard", "대시보드"),
    ("activity", "개선활동관리"),
    ("audit", "Audit 점검"),
    ("theme", "테마점검"),
)


def main():
    errors = []
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900}, locale="ko-KR")
        page.on("pageerror", lambda error: errors.append(str(error)))
        response = page.goto(urljoin(BASE, "index.html"), wait_until="domcontentloaded", timeout=30000)
        if not response or response.status != 200:
            raise AssertionError(f"Pages HTTP status: {response.status if response else 'no response'}")
        page.locator(".beginnerNav button[data-key='dashboard']").wait_for(state="attached", timeout=15000)
        if page.locator("html.hd20-auth-pending").count():
            raise AssertionError("Authentication is pending. A test account/session is required for read-only E2E; do not bypass login.")
        # No credentials are supplied by the test and no registration/save button is clicked.
        for area, title in AREAS:
            button = page.locator(f".beginnerNav button[data-key='{area}']")
            button.wait_for(state="visible", timeout=10000)
            button.click(timeout=12000)
            page.wait_for_timeout(350)
            active = page.locator(f".beginnerNav button[data-key='{area}'].active")
            if active.count() != 1:
                raise AssertionError(f"{title}: navigation did not become active")
            print(f"PASS read-only nav {area}: {title}", flush=True)
        if errors:
            raise AssertionError("Uncaught JavaScript errors (first 5): " + " | ".join(errors[:5]))
        print("PASS live browser navigation: 4/4; no uncaught page errors", flush=True)
        browser.close()


if __name__ == "__main__":
    try:
        main()
    except (AssertionError, PlaywrightTimeout, Exception) as error:
        print(f"FAIL live browser E2E: {type(error).__name__}: {error}", file=sys.stderr)
        sys.exit(1)
