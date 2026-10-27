# HD-20 개발일지 — 2026-09-02 / Static Five-Area Migration

## 목적
런타임 JavaScript가 과거 7탭 및 1·3·6개월 Audit 표현을 사후 치환하는 의존도를 줄이고, 정적 소스가 처음부터 현재 승인 운영모델을 표시하도록 정리한다.

## 1. index.html 정적 5영역 전환
- 기존 7개 정적 메뉴를 다음 5영역으로 직접 교체.
  - ① 통합 대시보드
  - ② 5S 활동
  - ③ 고도화·판정
  - ④ 유지·Audit
  - ⑤ 개선조치
- `통합기준정보`는 상단 Utility 유지.
- 정적 Audit 카드에서 1개월/3개월/6개월 고정 Audit 표현 제거.
- 첫 렌더링부터 `Audit 후 6개월 지속관리` 모델 표시.
- Action Summary 정적 항목을 `Audit 실시 대기 / 6개월 관리 중 / 개선조치 기한경과` 중심으로 재구성.
- 고도화 3번째 조건 명칭을 `정량축소·정위치 변경을 통한 공간 활용`로 통일.
- Master 설명에서 `⑦ 기준정보 탭` 의존 문구 제거.

## 2. Static Source 회귀방지 계약
`.github/workflows/runtime-smoke.yml`에 정적 index 계약 추가.

검증내용:
- 메뉴 key 순서가 정확히 `dashboard / activity / advancement / audit / action`인지 검사.
- `1개월 점검`, `3개월 AUDIT`, `6개월 AUDIT`, `⑦ 기준정보`, `⑥ 문제점·개선조치` 문구가 index에 재유입되지 않는지 검사.
- `Audit 후 6개월 지속관리` 및 정확한 고도화 3번째 조건 문구 존재 여부 검사.

## 3. HDPS · 5S Expert AI 현재 운영모델 전환
`expert-chatbot-final.js`의 업무지식/FAQ/자유질문 응답을 현재 5영역 구조에 맞춤.

변경사항:
- 1M·3M·6M 후속점검 안내 제거.
- Audit 안내를 `Risk 랜덤 → 실제 Audit 실시일 D-Day → 달력 기준 6개월 지속관리 → 개선조치·효과검증·재발 → 종료평가`로 변경.
- 탭 안내 번호를 5영역 기준으로 변경.
- 개선조치 자동기한은 D+7~D+14 범위이며 세부 일수는 통합기준정보 운영정책을 사용한다고 안내.
- 고도화 조건 충족분석과 공식판정 상태를 분리하여 설명.

## 4. HDPS 연결 대시보드 Current Model Bridge
신규 `hdps-dashboard-current-model.js` 추가.

목적:
기존 `hdps-dashboard.js` 내부에 남아 있는 1·3·6개월 Legacy 함수가 사용자 화면의 Audit/Action 해석을 지배하지 못하게 하고, 현재 Canonical Store를 읽는 보정 레이어를 적용한다.

Canonical Store:
- Audit: `hd20AuditRandomDrawsV1`
- 개선조치: `hd20ActionCasesV2`

현재 표시/상세기준:
- Audit 실시 대기: 대상 추출은 됐으나 `auditDate`가 없는 건.
- 6개월 관리 중: 실제 `auditDate`부터 달력 기준 +6개월 사이의 건.
- 개선조치 미완료: Canonical Action 중 완료/종결 상태가 아닌 건.
- 개선조치 기한경과: 미완료 건 중 실제 due가 기준일보다 지난 건.
- KPI 4번째 항목은 `Audit 후 6개월 유지율`로 표시하고 Audit 실시일/관리종료일/종료평가 상세 Grid를 연결.
- 재발 판정 시 `미발생` 문자열을 재발로 오인하지 않도록 명시형 semantic parsing 사용.

## 5. hdps-dashboard.html 정적 메뉴 전환
- 기존 6개 메뉴에서 현재 5영역으로 변경.
- `기존 대시보드` 링크를 `5S 통합관리`로 정리.
- Action Summary 보조문구를 `Audit 지속관리·개선`으로 변경.
- `hdps-dashboard-current-model.js`를 기존 dashboard script 뒤에 로드.

## 6. 자동검증 추가
Runtime Smoke에 다음 계약 추가.
- `hdps-dashboard-current-model.js` 존재 및 `hdps-dashboard.html` 로드 여부.
- HDPS 정적 메뉴가 ① 통합 대시보드 ~ ⑤ 개선조치인지 확인.
- `⑥ 기준정보` 정적 메뉴가 제거되었는지 확인.
- Audit/Action Canonical Store key 사용 확인.
- `Audit 후 6개월 유지율 / Audit 실시 대기 / 6개월 관리 중 / addMonths` 계약 확인.

## 7. 잔여 리팩터링
- `hdps-dashboard.js` 내부의 과거 `HD20MaturityFollowup.one/three/six`, `audit6Result` 기반 Legacy 상세함수는 현재 보정 레이어에 의해 사용자 화면에서 우선되지 않지만 소스 내부에는 Historical code로 남아 있음.
- 다음 단계에서 해당 내부함수를 Canonical Audit Store 기준으로 직접 교체하여 보정 레이어 의존도를 축소한다.
- KPI CSV 다운로드의 `6개월 유지율` 명칭과 상세 Raw Data도 `Audit 후 6개월 유지율` 기준으로 직접 리팩터링한다.
