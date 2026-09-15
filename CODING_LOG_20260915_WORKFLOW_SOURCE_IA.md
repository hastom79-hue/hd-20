# CODING LOG — 2026-09-15 — Workflow Source IA Canonicalization

## 수정 파일
- `activity-workflow.js`
- `index.html`

## 원천 수정
`build()`가 생성하는 실제 Hero 텍스트를 canonical navigation과 직접 일치시켰다. 따라서 `hd20-five-area-integration.js`의 normalize 단계는 안전망으로 남지만 정상 경로에서는 같은 값을 재설정한다.

Canonical source headings:
- ② 활동관리
- ③ 고도화·표준화
- ⑤ 진단·유지
- ⑥ 개선실행

④ 고도화 맵은 별도 canonical map 화면이므로 `activity-workflow.js`가 생성하지 않는다.

## 캐시
`activity-workflow.js?v=20260915-canonical-ia-5`

## 비회귀
CRUD, Audit lifecycle 계산, 후보 판정, Action/Audit ID, Supabase/localStorage write 로직은 수정하지 않았다.
