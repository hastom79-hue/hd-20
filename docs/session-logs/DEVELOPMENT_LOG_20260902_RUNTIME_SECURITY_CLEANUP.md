# HD-20 개발일지 — Runtime 의미·출력 안전성 정리

일자: 2026-09-02
대상: `main`

## 목적
전면개편 후 기능이 정상 동작하는 것만으로 종료하지 않고, 활성 Runtime에 남아 있던 과거 계산방식·중복 자동화·저장 문자열의 HTML 삽입 경로를 실제 배포코드 기준으로 점검했다.

이번 정리는 신규 업무규칙을 추가하는 작업이 아니라 이미 승인된 Canonical 운영기준을 위반하거나 우회할 수 있는 잔여경로를 제거하는 작업이다.

## 1. 개선조치 Evidence Gallery 출력 안전성
기존 `action-field-photo-gallery.js`는 `hd20ActionCasesV2`에 저장된 Evidence URL과 Case ID를 `<img src="...">` 문자열로 `innerHTML`에 직접 삽입했다.

정상 입력은 Data URL이지만 과거 데이터·Import 데이터가 오염되어 있을 경우 HTML 속성으로 해석될 가능성이 있으므로 문자열 렌더링을 제거했다.

현재는 DOM API를 사용한다.

- `document.createElement('img')`
- `img.src = String(src)`
- `img.alt = ...`
- 설명은 `textContent`

관련 커밋:
- `54d811a977d526abea999b269c790fdd0f1a1de3`

## 2. 공식판정 저장상태 escape
`gmes-5s-judge-ui.js`에서 저장된 `judgeState`가 표의 `innerHTML`에 그대로 삽입되던 경로를 보강했다.

정상 UI에서는 `확정 / 보완요청 / 미확정`만 저장하지만 Import·과거 데이터까지 포함하여 출력경계에서 escape하도록 변경했다.

판정 로직과 판정주체 `생산혁신팀 + 5S 모듈`은 변경하지 않았다.

관련 커밋:
- `12c082e93937952ebc9024fc237f8590787afc18`

## 3. 구형 Audit → 개선조치 자동생성 경로 퇴역
`index.html`에는 과거 `audit-action-auto-link.js`가 여전히 로드되고 있었다.

기존 모듈은 현재 Canonical Audit Store와 별개로 GMES 원천의 audit-like 필드를 스캔하여 `hd20ActionCasesV2` Case를 자동 생성했으며, 다음 문제가 있었다.

- 현재 `hd20AuditRandomDrawsV1 → Audit 실시 → 개선요청 → 개선조치` 경로와 중복
- 사용자가 승인하지 않은 별도 자동 Case 생성 가능
- `leader: 자동연결` 가상값 저장
- 동일 Audit 이슈의 중복 Case 생성 가능성

대형 단일행 `index.html`을 즉시 위험하게 재작성하지 않고, 해당 파일 자체를 **무동작 compatibility shim**으로 퇴역했다.

현재 `sync()`는 0, `candidates()`는 빈 배열을 반환하며 운영 Store를 읽거나 쓰지 않는다.

향후 index script assembly를 안전하게 정리할 때 script reference와 shim 파일 자체를 최종 제거한다.

관련 커밋:
- `792f3d545b1a89e2ef972be9b97e87afc605f5e6`

## 4. Conversion Chart의 임의 Q3 목표 제거
활성 `conversion-chart.js`에서 다음 과거 로직을 발견했다.

- Q3 목표 미설정 시 `55` 강제 fallback
- `분기 활동목표 55건` 계열 목표선 표시
- 총 활동건수와 목표값을 동일 차트 축에 혼합

이는 이미 확정한 원칙인 `분기목표 미설정은 미설정으로 유지` 및 `총 건수와 건/인 목표를 같은 축에 혼합하지 않음`을 위반한다.

Canonical 버전으로 재작성하여 다음만 표시한다.

- 실제 5S 개선활동
- 고도화 후보
- 공식 고도화 확보
- 후보 → 확보 전환율

`targetMaster`, Q3=55 fallback, 목표 marker를 제거했다.

관련 커밋:
- `071903cb8c0631439313f933abd924c32d0ad528`

## 5. 고도화 Portfolio Map 의미 교정
`integrated-performance-map.js`는 기존에 `d.valid = d.secured`로 계산하여 `현재 유효`와 `누적 확보`를 사실상 동일값으로 표시하고 있었다.

현재 Canonical 의미에서는 다음이 별도 상태다.

- 후보: `snapshot().candidates`
- 누적 공식확정: `snapshot().confirmed`
- 현재 유지: `snapshot().maintained`

따라서 원천을 화면의 과거 막대값 `#cols`가 아니라 `window.HD20KPIData.snapshot()`으로 교체했다.

또 기존의 임의 `전환율 50%` 기준과 `핵심 고도화팀 / 육성 필요` 같은 정책성 구역판정을 제거했다.

현재 Map은 중립적인 현상표현만 한다.

- X축: 후보 → 공식확정 전환율
- Y축: 현재 유지 고도화 작업장 수
- 중앙선: 시각적 참고선이며 운영 판정기준이 아님
- 요약: 후보 최다팀 / 공식확정 최다팀 / 현재유지 최다팀

관련 커밋:
- `87ff6f9eea7ff23805671c80a12c5474f3f4738b`

## 6. Canonical KPI 재발 의미판정 교정
`dashboard-kpi-source.js`의 `sixMonthRetention()`에 과거 문자열 추론이 남아 있었다.

기존:
- `status/problem` 문자열에 `재발`이 포함되면 재발로 판단
- operational recurrence도 정규식 `true|1|yes|재발|발생`으로 판정

이 방식은 `미발생` 같은 값을 오인할 수 있고, 문제서술에 `재발`이라는 단어가 있다는 이유만으로 KPI가 변할 수 있다.

현재는 explicit state만 사용한다.

재발 true:
- `recurrence === true`
- `재발 / 발생 / true / 1 / yes / y`

재발 false:
- `recurrence === false`
- `미발생 / 없음 / false / 0 / no / n`

또 6개월 종료평가 승인값 `미흡`을 유지실패로 명시적으로 처리한다.

관련 커밋:
- `4388d2df3a4a534b8a7d9b1eb7426777a5171c77`

## 7. Runtime 회귀방지 계약 강화
Runtime Smoke에 다음 계약을 추가했다.

- Evidence Gallery는 DOM `<img>` 생성 사용
- 판정상태 출력 escape
- 구형 `audit-action-auto-link.js`는 retired shim이며 Store write 금지
- Conversion Chart의 `targetMaster / Q3=55 / 목표 marker` 재유입 금지
- 총 활동건수와 인당목표 혼합 금지 문구 확인
- Portfolio Map은 `HD20KPIData.snapshot()`의 `confirmed / maintained` 사용
- `d.valid=d.secured`, 임의 `rate>=50` 판정 재유입 금지
- KPI 원천의 explicit recurrence state 사용
- `status/problem` free-text 재발추론 금지

관련 커밋:
- `695f56d85ca7dadcc1ce745b4e2b7da624711239`

## 자동검증 결과
Commit `695f56d85ca7dadcc1ce745b4e2b7da624711239`:

- Runtime Smoke #288: **success**
- Browser Smoke #231: **success**
- Package HD20 source #492: **success**
- Pages build and deployment #683: **success**

Browser E2E는 기존 5영역 Navigation, 고도화 의미분리, Audit → 개선조치 sourceCase 연결, 자동기한 정책, Audit Batch, Audit 실시, 6개월 종료평가, Case Trace, Dashboard, HDPS Dashboard 계약을 모두 계속 통과했다.

## 결론
이번 정리 후에는 화면에 보이는 결과뿐 아니라 그 결과를 만드는 원천 계산과 자동생성 경로도 현재 Canonical 운영모델에 맞춰졌다.

특히 `가상값을 만들어 빈칸을 채우지 않음`, `조건·판정·유지상태를 서로 다른 축으로 관리`, `명시된 상태값만 KPI 의미판정에 사용`, `승인되지 않은 목표·임계값을 코드가 임의 생성하지 않음` 원칙을 Runtime 계약으로 고정했다.
