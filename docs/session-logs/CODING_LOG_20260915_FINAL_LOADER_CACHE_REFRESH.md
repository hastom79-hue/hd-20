# Coding Log — 2026-09-15 Final Loader Cache Refresh

## 변경 파일
- `index.html`

## 변경
- `final-layout-polish.js?v=20260915-4` → `final-layout-polish.js?v=20260915-5`

## 이유
최신 `final-layout-polish.js`가 `action-audit-linkage.js?v=20260915-3`을 로드하도록 변경된 뒤 최상위 index 캐시 키가 뒤처져 있었다. 최상위 loader cache를 갱신해 최신 lineage guard가 브라우저에 전달되도록 했다.

## 비변경
- Supabase sync/auth 로직
- production filter
- Action/Audit 데이터 구조
- 서버 write 정책