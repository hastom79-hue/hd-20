# DEVELOPMENT LOG — 2026-09-16 — Browser external isolation

## 검증 결과
Browser Smoke run 35055073397은 local HTTP server와 Chromium 설치까지 성공했으나 `page.goto(... waitUntil:'domcontentloaded')`가 15초 timeout으로 실패했다. UI assertion에는 도달하지 못했다.

## 근인
index.html의 parser 단계에서 외부 CDN/서비스 요청이 완료되지 않으면 DOMContentLoaded 자체가 지연될 수 있다. 따라서 로컬 정적 UI 계약을 검증하는 smoke가 외부 네트워크 상태에 종속되어 있었다.

## 수정
- Playwright에서 localhost/127.0.0.1 이외의 외부 요청을 차단하여 로컬 정적 boot 검증을 외부 CDN 상태와 분리했다.
- 인증 오버레이가 존재하더라도 내부 navigation controller 자체를 검증할 수 있도록 smoke의 메뉴 전환은 DOM click으로 수행한다.
- maturity map 가시성 검사에 실제 `hidden` 속성까지 포함했다.
- 실제 5영역/대시보드 maturity 계약 assertion은 약화하지 않았다.

## 보존
운영 코드, 인증 정책, Canonical Store, Supabase write, KPI/import 데이터 로직은 변경하지 않았다. 이 변경은 CI browser-smoke 검증 환경에만 적용된다.
