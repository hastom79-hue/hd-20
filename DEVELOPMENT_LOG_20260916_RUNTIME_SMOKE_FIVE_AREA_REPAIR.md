# DEVELOPMENT LOG — 2026-09-16 — Runtime smoke five-area repair

## 실행 검증 결과
Run 35049442279는 runner/checkout/JavaScript syntax/index reference까지 정상 통과했으나 `Verify six-area navigation and operational IA`에서 실패했다.

## 근인
운영 코드는 이미 5-area IA로 전환됐지만 runtime-smoke.yml만 과거 6-area 계약(`maturitymap` 독립 메인메뉴, `canonical-six-area-v6`)을 계속 검사하고 있었다. 앱 결함이 아니라 검증 계약의 stale 상태였다.

## 수정
- runtime smoke를 canonical 5-area 계약으로 변경.
- main nav: dashboard/activity/advancement/audit/action.
- maturitymap 독립 nav 부재를 명시적으로 검사.
- legacy maturity deep-link가 dashboard maturity section으로 연결되는 계약 검사.
- dashboard maturity subtab 존재 검사.
- five-column navigation layout 검사 추가.
- auth bootstrap fail-safe 계약 검사 추가: index 선행 pending 금지, showBootError 및 retry UI 존재.

## 보존
Canonical Store/KPI, demo isolation, workflow screen, advancement/audit semantics, Supabase wiring, retired-file 검사는 그대로 유지했다.
