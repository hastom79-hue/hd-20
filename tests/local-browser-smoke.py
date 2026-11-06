#!/usr/bin/env python3
"""HD-20 local read-only Chromium smoke. Run against a loopback HTTP server.

No production URL, credentials, backend writes, or test data mutations.
Local auth behavior is the application's existing localhost startup path.
"""
import os
import sys

from playwright.sync_api import sync_playwright

BASE = os.environ.get("HD20_LOCAL_URL", "http://127.0.0.1:8765/")
AREAS = (
    ("dashboard", None),
    ("activity", "#awActivity"),
    ("audit", "#awAudit"),
    ("theme", "#awTheme"),
    ("master", "#masterModal"),
)


def main():
    errors = []
    failures = []
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        try:
            page = browser.new_page(viewport={"width": 1440, "height": 900}, locale="ko-KR")
            page.on("pageerror", lambda error: errors.append(str(error)))
            response = page.goto(BASE, wait_until="domcontentloaded", timeout=30000)
            if not response or response.status != 200:
                raise AssertionError(f"Loopback server returned {response.status if response else 'no response'}")
            page.locator(".beginnerNav button[data-key='dashboard']").wait_for(state="visible", timeout=20000)
            page.wait_for_function("() => window.HD20_NAV?.ready?.() === true", timeout=20000)
            if page.locator("#hd20MailGateForm:visible").count():
                raise AssertionError("Unexpected company-mail popup on loopback; local test cannot proceed")
            print("PASS loopback boot and navigation controller", flush=True)
            # A registration-choice overlay is intentionally shown on first visit.
            # Exercise the real close button rather than force-clicking through it.
            launcher = page.locator("#hd20Launcher")
            if launcher.count() and launcher.is_visible():
                page.locator("#hd20Launcher [data-ln-close]").click(timeout=12000)
                launcher.wait_for(state="detached", timeout=15000)
                print("PASS first-visit registration launcher closed via visible UI", flush=True)
            for area, region in AREAS:
                try:
                    button = page.locator(f".beginnerNav button[data-key='{area}']")
                    button.wait_for(state="visible", timeout=12000)
                    button.click(timeout=12000)
                    page.wait_for_function(
                        "key => window.HD20_NAV?.active?.()===key",
                        arg=area, timeout=12000,
                    )
                    page.locator(f".beginnerNav button[data-key='{area}'].active").wait_for(state="attached", timeout=12000)
                    if region:
                        screen = page.locator(region)
                        screen.wait_for(state="visible", timeout=12000)
                        if area in ("audit", "theme", "master") and not screen.evaluate(
                            "el => el.classList.contains('on')"
                        ):
                            raise AssertionError(f"{area}: screen visible but not active")
                    elif page.locator(".app").count() != 1:
                        raise AssertionError("Dashboard app root missing")
                    print(f"PASS local navigation {area} (controller + visible screen)", flush=True)
                except Exception as error:
                    failures.append(f"{area}: {type(error).__name__}: {error}")
                    print(f"FAIL local navigation {area}: {error}", flush=True)
            if errors:
                failures.extend("JavaScript: " + error for error in errors[:10])
            if failures:
                raise AssertionError(" | ".join(failures))
            print("PASS local browser E2E: 5/5 sections; no uncaught JavaScript errors", flush=True)
        finally:
            browser.close()


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(f"FAIL local browser smoke: {type(error).__name__}: {error}", file=sys.stderr)
        sys.exit(1)
