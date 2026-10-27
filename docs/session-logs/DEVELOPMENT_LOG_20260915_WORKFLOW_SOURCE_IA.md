# DEVELOPMENT LOG — 2026-09-15 — Workflow Source IA Canonicalization

## 목적
런타임 보정 Guard에 의존하던 구형 화면명/번호를 원천 `activity-workflow.js` 단계에서 canonical 6-area IA와 일치시킨다.

## 변경
- `② 5S 활동` → `② 활동관리`
- `③ 고도화·판정` → `③ 고도화·표준화`
- `④ 유지·Audit` → `⑤ 진단·유지`
- `⑤ 개선조치` → `⑥ 개선실행`
- 각 Hero 설명을 현재 역할 분리와 동일하게 정리
- Action의 `Workflow를 불러오는 중` 임시 문구 제거

## 효과
초기 렌더링 순간에 구형 번호/명칭이 보였다가 Guard가 교정하는 flicker와 구조적 이중 정의를 제거한다.

## 보존
업무 데이터, 판정 기준, Exact ID trace, localStorage/Supabase write 경로 변경 없음. forced empty write 없음.
