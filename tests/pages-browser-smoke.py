#!/usr/bin/env python3
"""Read-only live browser smoke: public login gate, optionally authenticated navigation.

No login bypass, fabricated identity or business record writes. The authenticated
path only runs with an explicitly configured authorized HD20_E2E_EMAIL.
"""
import os
import sys
from urllib.parse import urljoin

from playwright.sync_api import sync_playwright

BASE = os.environ.get("HD20_PAGES_URL", "https://hastom79-hue.github.io/hd-20/")
EMAIL = os.environ.get("HD20_E2E_EMAIL", "").strip()
AREAS = (
    ("dashboard", "대시보드"),
    ("activity", "개선활동관리"),
    ("audit", "Audit 점검"),
    ("theme", "테마점검"),
)


def main():
    page_errors = []
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        try:
            page = browser.new_page(viewport={"width": 1440, "height": 900}, locale="ko-KR")
            page.on("pageerror", lambda error: page_errors.append(str(error)))
            response = page.goto(urljoin(BASE, "index.html"), wait_until="domcontentloaded", timeout=30000)
            if not response or response.status != 200:
                raise AssertionError(f"Pages HTTP status: {response.status if response else 'no response'}")

            # The pending class is removed *before* the email gate is rendered;
            # it is not evidence of an authenticated session.
            page.locator("#hd20MailGateForm #hd20MailGateEmail").wait_for(state="visible", timeout=15000)
            if page.locator("#hd20MailGateError").count() != 1:
                raise AssertionError("Company-mail gate was not initialized correctly")
            print("PASS public authentication gate visible; login was not bypassed", flush=True)

            if not EMAIL:
                if page_errors:
                    raise AssertionError("Page errors during public gate: " + " | ".join(page_errors[:5]))
                print("SKIP authenticated navigation: HD20_E2E_EMAIL is not configured. "
                      "Public gate PASS does not mean browser navigation E2E PASS.", flush=True)
                return

            if not EMAIL.lower().endswith("@hd.com") or "@" not in EMAIL:
                raise AssertionError("HD20_E2E_EMAIL must be an authorized @hd.com test identity")
            # Honor the same explicit company-email entry flow as a human user.
            page.locator("#hd20MailGateEmail").fill(EMAIL)
            page.locator("#hd20MailGateForm button[type='submit']").click()
            page.locator("#hd20MailGateForm").wait_for(state="hidden", timeout=12000)
            page.locator(".beginnerNav button[data-key='dashboard']").wait_for(state="visible", timeout=15000)

            for area, title in AREAS:
                button = page.locator(f".beginnerNav button[data-key='{area}']")
                button.wait_for(state="visible", timeout=12000)
                button.click(timeout=12000)
                page.wait_for_timeout(350)
                active = page.locator(f".beginnerNav button[data-key='{area}'].active")
                if active.count() != 1:
                    raise AssertionError(f"{title}: navigation did not become active")
                region_ids = {"activity": "#awActivity", "audit": "#awAudit", "theme": "#awTheme"}
                if area in region_ids:
                    region = page.locator(region_ids[area])
                    region.wait_for(state="visible", timeout=12000)
                    if area in ("audit", "theme") and not region.evaluate("(el) => el.classList.contains('on')"):
                        raise AssertionError(f"{title}: inspection screen not activated")
                elif page.locator(".app").count() != 1:
                    raise AssertionError("Dashboard app root missing")
                print(f"PASS read-only nav {area}: {title} (active + visible screen)", flush=True)
            if page_errors:
                raise AssertionError("Uncaught JS errors (first 5): " + " | ".join(page_errors[:5]))
            print("PASS authenticated browser navigation: 4/4; no uncaught page errors", flush=True)
        finally:
            browser.close()


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(f"FAIL browser smoke: {type(error).__name__}: {error}", file=sys.stderr)
        sys.exit(1)
