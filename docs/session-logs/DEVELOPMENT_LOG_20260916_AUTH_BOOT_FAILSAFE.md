# DEVELOPMENT LOG — 2026-09-16 — Auth boot fail-safe recovery

## 장애
GitHub Pages 배포 성공 상태에서도 사용자 브라우저에서 HD-20이 열리지 않음.

## 확인
- index.html이 최초부터 `html.hd20-auth-pending`으로 시작.
- supabase-auth.css는 해당 상태에서 body 전체를 `visibility:hidden` 처리.
- 인증/CDN/Supabase 초기화가 중간 실패하면 사용자가 빈 화면/먹통으로 인지할 수 있는 구조였음.

## 복구
- index.html의 선행 `hd20-auth-pending` class 제거. HTML 자체는 기본적으로 렌더 가능하도록 변경.
- 인증은 gate overlay로 접근을 통제하고, 본문 전체를 사전 은폐하는 방식은 사용하지 않음.
- supabase-auth.js에 `showBootError()` 추가.
- boot/startSupabase의 예외를 catch하여 빈 화면 대신 명시적 `접속 초기화 오류` + `다시 시도` 화면 표시.
- 로그인 네트워크 예외도 폼 오류로 표시.
- auth JS/CSS cache token을 `20260916-boot-failsafe-1`로 갱신.

## 보안/데이터 안전
인증 요구 자체를 제거하지 않았다. 인증되지 않은 사용자는 gate overlay로 차단된다. Production 데이터, KPI, Canonical Store, Supabase sync/write 로직은 변경하지 않았으며 forced empty write도 추가하지 않았다.
