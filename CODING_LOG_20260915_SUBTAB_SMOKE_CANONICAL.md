# CODING LOG — 2026-09-15 — Subtab Smoke Canonical

## 파일
`.github/workflows/subtab-contract-grid-smoke.yml`

## 변경
구형 Dashboard 서브탭 반복을 제거한 뒤 남아 있던 테스트 자체의 두 결함을 추가 수정했다.

현재 계약:
- main: `dashboard, activity, advancement, maturitymap, audit, action`
- dashboard groups: `summary, execution, standard, field` = 4
- operational subtabs: activity 2 + advancement 2 + audit 2 + action 2 = 8
- maturitymap: 독립 메인영역 이동성 검증
- mobile: 390x844 universal grid width 검증

수정한 테스트 결함:
- 잘못된 3그룹 assertion을 실제 4그룹 assertion으로 수정
- Node 컨텍스트에서 `window`를 직접 참조하던 무의미한 runtime assertion 제거
- PASS 메시지를 `4 dashboard groups`로 정정

## 불변조건
- 운영 JS/KPI/Audit/Action/Supabase 로직 변경 없음
- fixture는 localStorage 테스트 데이터뿐
- server-side forced empty write 없음

## workflow commits
- initial canonicalization: `7b061d9cc8af574e69c20e1e20267a686cf93ee5`
- correction: `a1de90158411b80404d7406875f3bc0c49ef00da`
