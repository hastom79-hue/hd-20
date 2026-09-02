# HD-20 개발일지 — Legacy 1M/3M/6M UI 퇴역

일자: 2026-09-02
대상: `main`

## 발견 경위
Audit Batch E2E Browser Smoke run #98에서 메인 화면에 구형 Audit 문구가 실제 렌더링되는 것을 감지하여 실패했다.

## 원인
`maturity-seq-action-link.js`가 과거 `공식 판정일 +1M/+3M/+6M`을 계산하고 1개월 점검 / 3개월 AUDIT / 6개월 AUDIT UI를 동적으로 생성하고 있었다. 이는 현재 승인된 `Audit 대상 랜덤 추출 → 실제 Audit 실시일 D-Day → 6개월 지속관리` 모델과 충돌했다.

## 1차 조치 — Compatibility Adapter 전환
- 구형 1M/3M/6M 패널과 Action Summary 생성 제거.
- `hd20AuditRandomDrawsV1`, `hd20ActionCasesV2`를 읽는 임시 Adapter로 축소.
- 기존 참조가 깨지지 않도록 `window.HD20MaturityFollowup` 전역만 한시적으로 유지.
- `one / three / six`은 빈 배열로 유지.

커밋: `9d7acf933cd3560232f871f05899862db0958367`.

## 2차 조치 — 직접 참조 제거
- `hdps-dashboard.js`를 Canonical Audit/Action Store 직접 사용 구조로 재작성.
- `audit-summary-drilldown.js`를 `Audit 실시 대기 / 6개월 관리중 / 종료평가 대기 / 종료평가 완료` 기준으로 전환.
- `dashboard-grid-drilldown.js`의 1/3/6개월 상세 Grid 제거.
- Browser/Runtime Smoke에서 Legacy Lifecycle 재유입을 차단.

## 3차 조치 — Adapter 완전 삭제
2026-09-02 후속 점검에서 코드 검색 결과 활성 JS/HTML에서 `HD20MaturityFollowup` 및 `maturity-seq-action-link.js` 참조가 더 이상 필요하지 않음을 확인했다.

- `maturity-seq-action-link.js` 파일 자체 삭제.
- Runtime Smoke에서 파일 부재를 확인.
- 루트 실행 JavaScript 어디에도 `HD20MaturityFollowup` 문자열이 존재하지 않아야 통과하도록 계약 추가.
- HTML 어디에도 `maturity-seq-action-link.js` 로딩 참조가 없어야 통과하도록 계약 추가.
- 파일 삭제 후 정적 `index.html`에 남아 있던 구형 script reference도 제거.

주요 커밋:
- `c8417830a710fe3b5867f02c89db0da7d99548d5` — Compatibility Adapter 파일 완전 삭제.
- `7af701a76c2e9b75fa8304dd733e200feec119a8` — Adapter 퇴역 Runtime 계약 추가.
- `05f91aeb2d876408a1480f32fb9d81c2b2f6abbf` — 정적 index의 삭제된 Adapter script reference 제거.

## 승인 대시보드 원본 Canonical 전환
Adapter 삭제 과정에서 `approved-landing-v2.js` 원본에 아직 다음 Legacy 요소가 남아 있음을 확인했다.
- `window.HD20MaturityFollowup?.summary?.()` 직접 참조.
- `3개월 AUDIT` 기한임박 패널.
- `실제 6개월 Audit 결과`, `AUDIT 6개월 유지율` 표현.
- 내부 유효성 검증 `navCount===7`.

이를 원본에서 직접 제거했다.
- Audit Store `hd20AuditRandomDrawsV1` 직접 사용.
- `Audit 후 6개월 유지율` 표준 명칭 적용.
- `Audit 후 6개월 관리 대상`을 실제 Audit 실시일 + 6개월 종료일 순으로 표시.
- 임의 기한임박 threshold를 만들지 않음.
- 5영역 유효성 `navCount===5` 적용.
- `hd20-followup-updated` 의존 제거, Audit Canonical 이벤트로 갱신.
- HTML escape helper의 `&quot;` 표기도 교정.

또한 `legacy-lifecycle-retirement.js`에서 승인 대시보드를 다시 덮어쓰던 `patchApprovedLanding()`을 제거하여 승인 대시보드는 이제 원본 `approved-landing-v2.js`가 직접 책임진다.

주요 커밋:
- `28406ba53ed7effe55159d07b5c8db626b74dbfb` — 승인 대시보드 원본 Canonical 전환.
- `d6cd920062fd82c3db017dbe53b75949bf79f5cf` — 승인 대시보드 후처리 의존 제거.
- `3c326202bc2357aa3cbe9f1a6aebcb1cad1b0a87` — 승인 대시보드 Canonical Runtime 계약 추가.

## Side Summary Canonical 분리
승인 대시보드 후처리를 제거한 뒤 `legacy-lifecycle-retirement.js`에는 메인 정적 Side Card 수치를 갱신하는 기능만 남았다. 역할이 Legacy retirement가 아니므로 별도 Canonical 모듈로 분리했다.

- 신규 `dashboard-side-summary.js` 추가.
- `hd20AuditRandomDrawsV1`, `hd20ActionCasesV2` 직접 사용.
- Side Card에 `Audit 실시 대기 / 6개월 지속관리 / 개선조치 미완료 / 기한경과 / 재발`을 실제 Store 기준으로 표시.
- 재발은 명시값 판정만 사용.
- `final-layout-polish.js`가 새 모듈만 로드하도록 변경.
- `legacy-lifecycle-retirement.js` 파일 완전 삭제.
- Runtime Smoke에서 새 파일 존재/구형 파일 부재/새 loader 연결을 검증.

주요 커밋:
- `b6e5c9b8a13d7922cee14396e728a628a809bc52` — `dashboard-side-summary.js` 추가.
- `971f3ed017dbb631e0a27ada6ffd725ee26701be` — `final-layout-polish.js` loader 교체.
- `c481d7a7c3540e803d95d506f9628b3caa716f90` — `legacy-lifecycle-retirement.js` 삭제.
- `cd2ba4cabb7198bcdf538be628d854755a1fcfb5` — Side Summary Canonical Runtime 계약 추가.

## 공식판정과 조건충족 분석 문구 분리
승인 대시보드 원본에서 다음 문구가 조건충족 분석을 공식확정 조건처럼 보이게 할 수 있음을 확인했다.
- `3대 기준 중 2개 이상을 충족한 공식확정 사례`
- `3대 기준 중 2개 이상 충족 · 어렵게 확보한 성과`

이를 제거했다.
- Empty state: `공식 확정된 고도화 사례가 아직 없습니다.`
- 최근 확정 사례 보조문구: `(공식 판정 완료 사례)`
- 1/2/3 조건 충족 분석은 별도 성과·현상 분석축이고 공식판정은 생산혁신팀 + 5S 모듈의 판정 결과라는 기준을 유지.

커밋:
- `c452b84c1f0e0158cbfbbe164691d2db87abcd9a` — 공식판정/조건충족 문구 분리.

## 검증 기준
- `maturity-seq-action-link.js` 파일이 없어야 함.
- 활성 JavaScript에서 `HD20MaturityFollowup`이 없어야 함.
- 정적 index에 삭제된 Adapter script reference가 없어야 함.
- 승인 대시보드가 `hd20AuditRandomDrawsV1`을 직접 사용해야 함.
- 승인 대시보드에 `3개월 AUDIT`, `실제 6개월 Audit 결과`, `AUDIT 6개월 유지율`, `navCount===7`이 없어야 함.
- `Audit 후 6개월 유지율`, `Audit 후 6개월 관리 대상`, `navCount===5`가 존재해야 함.
- `dashboard-side-summary.js`가 Canonical Audit/Action Store를 사용해야 함.
- `legacy-lifecycle-retirement.js`는 존재하지 않아야 함.

## 최신 검증
Commit `cd2ba4cabb7198bcdf538be628d854755a1fcfb5` 기준:
- Runtime Smoke #198: **success**
- Browser Smoke #141: **success**
- Package #402: **success**
- Pages #593: 확인 시점 대기 상태

`c452b84...` 이후에는 자동검증이 다시 실행되므로 완료 전 성공으로 간주하지 않는다.
