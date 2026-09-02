# HD-20 개발일지 — 승인 대시보드 Audit Canonical 보정

일자: 2026-09-02
대상: `main`

## 발견 경위
Browser Smoke run #98 및 #109가 메인 화면에서 과거 Audit Lifecycle 문구를 감지하여 Batch E2E 진입 전에 실패했다.

## 실제 원인
`approved-landing-v2.js`가 메인 승인 대시보드를 생성하면서 다음 과거 표현을 정적/동적으로 다시 만들고 있었다.
- `기한임박 점검 대상 (3개월 AUDIT)`
- `기한임박 3개월 AUDIT 대상 없음`
- `실제 6개월 Audit 결과`
- `AUDIT 6개월 유지율`
- 내부 유효성 검사 `navCount===7`

또한 공식 확정 사례가 없을 때 `3대 기준 중 2개 이상을 충족한 공식확정 사례`라는 문구를 표시해, 조건충족 분석과 공식판정 정책을 혼동할 가능성이 있었다.

## 조치
`legacy-lifecycle-retirement.js`의 역할을 단순 카드 치환에서 승인 대시보드 Current Model 보정까지 확장했다.

- KPI 명칭을 `Audit 후 6개월 유지율`로 통일.
- KPI 설명을 `실제 Audit 실시일 기준 6개월 관리 종료성과`로 변경.
- 월별 추이 5번째 항목을 `Audit 후 6개월 유지율`로 변경.
- 하단 후속조치 영역을 `Audit 후속조치 필요 대상 (실시대기·종료평가대기)`로 변경.
- 실제 `hd20AuditRandomDrawsV1`에서 `auditDate`가 없는 건을 `Audit 실시 대기`로 표시.
- 실제 Audit 실시일 + 달력 6개월이 지났지만 `finalEvaluation`이 없는 건을 `6개월 종료평가 대기`로 표시.
- 조건충족 분석과 공식판정은 분리관리한다는 표현으로 정정.
- `window.HD20_APPROVED_LANDING_AUDIT.navCount`와 valid 판정을 5영역 기준으로 보정.
- `미발생`을 재발로 오인하지 않도록 recurrence 명시값 판정으로 변경.
- 승인 대시보드에 삽입되는 생산팀/일자 값을 HTML escape 처리하여 기존 XSS 방어원칙 유지.
- DOM 생성 타이밍 차이를 고려하여 최대 40회/100ms의 제한된 초기 재시도만 사용하고 무한 Observer/Interval은 사용하지 않음.

## 관련 커밋
- `76d90ac077f2d56874511b90397bf38d858c7e14` — 승인 대시보드 Audit Current Model 보정.
- `968bd088eea1ee813e9983f28f04456b961d3860` — 승인 대시보드 후속조치 값 XSS escape 보강.
- `e183e8507a38a0a4a5e856d9c07b7fe6af51f784` — 운영 폐쇄루프 재발 판정 명시값 방식으로 수정.

## 후속 리팩터링
현재 `approved-landing-v2.js`는 대부분의 코드가 매우 긴 단일 라인에 집중되어 있어 즉시 전체교체 시 회귀위험이 높다. 사용자 화면의 운영기준은 우선 Current Model 보정으로 일치시킨 뒤, 별도 단계에서 이 파일을 구조화하여 보정 레이어 없이 Canonical Store를 직접 읽도록 리팩터링한다.

## 검증 상태
최신 Runtime/Browser/Pages 검증이 재실행 중이다. Browser Smoke가 Legacy 문구 검사를 통과한 뒤 실제 Audit Batch E2E까지 완료해야 성공으로 확정한다.
