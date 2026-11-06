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
HIDDEN_LEGACY_AREAS = ("action", "advancement")
AREAS = (
    ("dashboard", "대시보드"),
    ("activity", "개선활동관리"),
    ("audit", "Audit 점검"),
    ("theme", "테마점검"),
    ("master", "통합기준정보"),
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
            # A hidden form alone does not prove that the intended company session exists.
            page.wait_for_function(
                """email => {
                  try {
                    const session = JSON.parse(localStorage.getItem('hd20_company_session_v1') || 'null');
                    return !!session && String(session.email || '').toLowerCase() === email.toLowerCase()
                      && Number(session.expiresAt) > Date.now();
                  } catch { return false; }
                }""",
                arg=EMAIL,
                timeout=12000,
            )
            page.locator(".beginnerNav button[data-key='dashboard']").wait_for(state="visible", timeout=15000)

            for legacy in HIDDEN_LEGACY_AREAS:
                legacy_button = page.locator(f".beginnerNav button[data-key='{legacy}']")
                if legacy_button.count() != 1 or legacy_button.is_visible():
                    raise AssertionError(f"Hidden legacy navigation {legacy!r} is missing or exposed")
                print(f"PASS hidden legacy navigation: {legacy}", flush=True)

            for area, title in AREAS:
                button = page.locator(f".beginnerNav button[data-key='{area}']")
                button.wait_for(state="visible", timeout=12000)
                button.click(timeout=12000)
                page.wait_for_timeout(350)
                active = page.locator(f".beginnerNav button[data-key='{area}'].active")
                if active.count() != 1:
                    raise AssertionError(f"{title}: navigation did not become active")
                selected = page.evaluate("() => window.HD20_NAV?.active?.() || ''")
                if selected != area:
                    raise AssertionError(f"{title}: button is active but navigation controller reports {selected!r}")
                region_ids = {"activity": "#awActivity", "audit": "#awAudit", "theme": "#awTheme"}
                if area in region_ids:
                    region = page.locator(region_ids[area])
                    region.wait_for(state="visible", timeout=12000)
                    if area in ("audit", "theme") and not region.evaluate("(el) => el.classList.contains('on')"):
                        raise AssertionError(f"{title}: inspection screen not activated")
                elif area == "master":
                    master = page.locator("#masterModal")
                    master.wait_for(state="visible", timeout=12000)
                    if not master.evaluate("(el) => el.classList.contains('on')"):
                        raise AssertionError("Master tab: visible modal does not have active class")
                elif page.locator(".app").count() != 1:
                    raise AssertionError("Dashboard app root missing")
                print(f"PASS read-only nav {area}: {title} (active + visible screen)", flush=True)
            # Reproduce the URL subtab restoration path, including a full page reload.
            page.locator(".beginnerNav button[data-key='activity']").click(timeout=12000)
            page.locator("#hd20Subnav button[data-sub='request']").wait_for(state="visible", timeout=12000)
            page.locator("#hd20Subnav button[data-sub='request']").click(timeout=12000)
            page.wait_for_function(
                "() => window.HD20_SUBNAV?.state?.()?.area === 'activity' && window.HD20_SUBNAV?.state?.()?.sub === 'request'",
                timeout=12000,
            )
            page.reload(wait_until="domcontentloaded", timeout=30000)
            page.wait_for_function(
                "() => window.HD20_NAV?.active?.() === 'activity' && window.HD20_SUBNAV?.state?.()?.sub === 'request'",
                timeout=15000,
            )
            request_button = page.locator("#hd20Subnav button[data-sub='request']")
            request_button.wait_for(state="visible", timeout=12000)
            if not request_button.evaluate("(el) => el.classList.contains('on')"):
                raise AssertionError("Direct URL reload failed to restore the selected request subtab")
            page.locator("#hd20Subnav button[data-sub='self']").click(timeout=12000)
            page.wait_for_function(
                "() => window.HD20_SUBNAV?.state?.()?.sub === 'self'",
                timeout=12000,
            )
            print("PASS activity subtab reload restoration and next-button click", flush=True)
            # Stale/unknown subtab IDs must not overwrite the active view or URL.
            before_invalid = page.evaluate("""() => ({
                state: window.HD20_SUBNAV.state(),
                view: document.querySelector('.app')?.getAttribute('data-hd-view'),
                url: location.href,
            })""")
            page.evaluate("() => window.HD20_SUBNAV.select('activity', 'nonexistent-legacy-tab')")
            after_invalid = page.evaluate("""() => ({
                state: window.HD20_SUBNAV.state(),
                view: document.querySelector('.app')?.getAttribute('data-hd-view'),
                url: location.href,
            })""")
            if before_invalid != after_invalid:
                raise AssertionError("Invalid activity subtab changed active view, state or URL")
            buttons = page.locator("#hd20Subnav > button[data-sub]")
            if buttons.count() != 4:
                raise AssertionError("Activity subnavigation duplicated or lost canonical buttons")
            print("PASS invalid subtab ignored; four canonical activity buttons preserved", flush=True)
            # Simulate another UI renderer replacing a same-looking button without its onclick.
            page.evaluate("""() => {
              const button = document.querySelector("#hd20Subnav button[data-sub='request']");
              if (!button) throw new Error("request button missing");
              button.replaceWith(button.cloneNode(true));
            }""")
            page.wait_for_function(
                """() => {
                  const button = document.querySelector("#hd20Subnav button[data-sub='request']");
                  return !!button && typeof button.onclick === 'function';
                }""",
                timeout=12000,
            )
            page.locator("#hd20Subnav button[data-sub='request']").click(timeout=12000)
            page.wait_for_function(
                "() => window.HD20_SUBNAV?.state?.()?.sub === 'request'",
                timeout=12000,
            )
            print("PASS rebuilt activity button click handler recovered", flush=True)
            if page_errors:
                raise AssertionError("Uncaught JS errors (first 5): " + " | ".join(page_errors[:5]))
            print(f"PASS authenticated browser navigation: {len(AREAS)}/{len(AREAS)}; no uncaught page errors", flush=True)
        finally:
            browser.close()


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(f"FAIL browser smoke: {type(error).__name__}: {error}", file=sys.stderr)
        sys.exit(1)
