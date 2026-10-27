# Coding Log — 2026-09-15 Field Showcase Bootstrap

## 신규
`hd20-field-showcase-bootstrap.js`

- 대시보드 KPI 카드 아래에 현장형 초기 Case 6건을 표시.
- 생산팀/유형/개선주제/상태를 포함.
- 울산 스마트팩토리 및 건설기계 생산현장 공개 참고사진을 별도 카드로 표시.
- 사진은 샘플 Case의 실제 증빙으로 오인되지 않도록 `공개 현장사진 · 참고` 문구 적용.
- canonical store/localStorage/Supabase write 없음.

## Loader
`final-layout-polish.js`에 `hd20-field-showcase-bootstrap.js?v=20260915-1` 추가.

## 데이터 무결성
화면 공백 보완을 위해 가짜 운영실적을 서버에 기록하지 않는다. 실제 운영 KPI와 Audit/Action lineage에는 영향을 주지 않는다.