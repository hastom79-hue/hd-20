# DEVELOPMENT LOG — 2026-09-16 — Runtime smoke five-area repair

## 실행 검증 결과
Run 35049442279는 runner/checkout/JavaScript syntax/index reference까지 정상 통과했으나 `Verify six-area navigation and operational IA`에서 실패했다.

후속 Run 35050708482에서도 JavaScript syntax/index reference는 통과했지만 `Verify five-area navigation and dashboard maturity IA`에서 실패했다.

Run 35054309317에서는 five-area IA, five-column layout, auth fail-safe, canonical stores/KPI, demo isolation까지 모두 PASS했고 `Verify workflow screens`에서만 실패했다.

Run 35054705486도 동일하게 workflow screen 단계까지 전부 PASS했다. 로그를 명령 단위로 대조한 결과 현재 화면명 ②~⑤ 검사는 통과했고 마지막 `고도화 맵` 검사가 잘못된 파일인 `beginner-navigation.js`를 대상으로 하면서 실패했다.

## 근인
1차 근인은 runtime-smoke.yml이 과거 6-area 계약을 검사하던 stale 상태였다.
2차 검증에서 실제 코드 잔여 불일치도 확인했다. `beginner-navigation.js`는 이미 canonical 5-area였으나 `hd20-five-area-integration.js`의 공개 계약이 아직 `maturitymap`을 독립 area로 포함하고 있었다. 또한 Audit/Action 화면 제목 번호가 ⑤/⑥으로 남아 현재 ④/⑤ IA와 불일치했다.
3차 실패는 workflow screen 정적 검사가 과거 문구를 요구한 stale assertion이었다.
4차 실패는 `고도화 맵`이 메인 내비게이션에 있어야 한다는 잔여 가정이었다. 현재 canonical 구조에서 고도화 맵은 대시보드 subtab이므로 `dashboard-section-tabs.js`의 `key:'maturity'`와 `label:'고도화 맵'`을 검증하도록 수정했다.

## 수정
- runtime smoke를 canonical 5-area 계약으로 변경.
- main nav: dashboard/activity/advancement/audit/action.
- maturitymap 독립 nav 부재를 명시적으로 검사.
- legacy maturity deep-link가 dashboard maturity section으로 연결되는 계약 검사.
- dashboard maturity subtab 존재 및 `고도화 맵` label 검사.
- five-column navigation layout 검사 추가.
- auth bootstrap fail-safe 계약 검사 추가.
- `HD20_FIVE_AREA.areas`를 dashboard/activity/advancement/audit/action으로 정합화.
- 진단·유지/개선실행 화면 번호를 ④/⑤로 정합화.
- workflow screen assertion을 현재 5영역 및 dashboard maturity subtab 기준으로 정합화.

## 보존
Canonical Store/KPI, demo isolation, advancement/audit semantics, Supabase wiring, retired-file 검사는 그대로 유지했다. 운영 데이터 저장 로직은 변경하지 않았다.
