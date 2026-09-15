# CODING LOG — 2026-09-15 — Advancement Subtab Deduplication

## 파일
- `advancement-subtab-dedupe-guard.js`
- `final-layout-polish.js`
- `index.html`

## 계약
`hd20-subtab-changed`에서 `area === 'advancement'`일 때만 동작한다.

- `judge`: 기존 성과전환/후보/3대조건 판정 UI 유지
- `standard`: `.pcStage` 중 confirmed/maintained만 표시
- `standard`: `.pcTypes`, `.pcCriteriaBanner` 숨김
- `standard`: 안내문을 확정·유지·수평전개 역할로 교체
- judge 복귀 시 후보 안내문과 숨김 상태 복원

## 비회귀
- `HD20_SUBNAV` contract 변경 없음
- `advancementConfirmed` 기준 변경 없음
- 운영 데이터 mutation 없음
- Supabase write 변경 없음
- forced empty write 없음

## 캐시 체인
`advancement-subtab-dedupe-guard.js?v=20260915-1` → `final-layout-polish.js?v=20260915-advancement-dedupe-14`
