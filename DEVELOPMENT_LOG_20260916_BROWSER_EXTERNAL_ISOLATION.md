# DEVELOPMENT LOG — 2026-09-16 — Browser external isolation

## 검증 결과
Browser Smoke run 35055073397은 local HTTP server와 Chromium 설치까지 성공했으나 `page.goto(... waitUntil:'domcontentloaded')`가 15초 timeout으로 실패했다. UI assertion에는 도달하지 못했다.

후속 HEAD 7aa84cfc 검증에서는 `waitUntil:'commit'` 이후에도 `.beginnerNav button[data-key="dashboard"]` 생성 대기에서 timeout이 발생했다. index 원문에는 `.beginnerNav` 컨테이너가 이미 존재하고 `beginner-navigation.js`가 DOMContentLoaded 시 5개 버튼을 주입하는 구조이므로, 로컬 CI에서 parser/DOMContentLoaded 완료 자체가 외부 parser-blocking script 처리에 영향을 받고 있음을 재확인했다.

## 근인
index.html의 parser 단계에서 외부 CDN/서비스 script 요청이 완료되지 않으면 DOMContentLoaded 자체가 지연될 수 있다. 단순 abort만으로는 CI Chromium에서 parser 진행을 안정적으로 보장하지 못했다. 따라서 로컬 정적 UI 계약 검증이 외부 네트워크/외부 script 로딩 상태에 종속되어 있었다.

## 수정
- Playwright에서 localhost/127.0.0.1 리소스는 정상 통과시킨다.
- 외부 `script` 요청은 CI 안에서만 빈 JavaScript 200 응답으로 대체하여 parser가 확실히 진행되도록 했다.
- 기타 외부 요청은 차단한다.
- 초기 navigation은 `domcontentloaded`까지 기다린 뒤 실제 dashboard 버튼 생성까지 확인한다.
- 운영 인증 코드와 운영 CDN 참조는 변경하지 않았다.

## 보존
운영 코드, 인증 정책, Canonical Store, Supabase write, KPI/import 데이터 로직은 변경하지 않았다. 이 변경은 CI browser-smoke 검증 환경에만 적용된다.
