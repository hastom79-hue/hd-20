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

주요 커밋:
- `c8417830a710fe3b5867f02c89db0da7d99548d5` — Compatibility Adapter 파일 완전 삭제.
- `7af701a76c2e9b75fa8304dd733e200feec119a8` — Adapter 퇴역 Runtime 계약 추가.

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

또한 `legacy-lifecycle-retirement.js`에서 승인 대시보드를 다시 덮어쓰던 `patchApprovedLanding()`을 제거하여 승인 대시보드는 이제 원본 `approved-landing-v2.js`가 직접 책임진다. Legacy retirement 파일은 구형 Side Card 치환만 담당한다.

주요 커밋:
- `28406ba53ed7effe55159d07b5c8db626b74dbfb` — 승인 대시보드 원본 Canonical 전환.
- `d6cd920062fd82c3db017dbe53b75949bf79f5cf` — 승인 대시보드 후처리 의존 제거.
- `3c326202bc2357aa3cbe9f1a6aebcb1cad1b0a87` — 승인 대시보드 Canonical Runtime 계약 추가.

## 검증 기준
- `maturity-seq-action-link.js` 파일이 없어야 함.
- 활성 JavaScript에서 `HD20MaturityFollowup`이 없어야 함.
- 승인 대시보드가 `hd20AuditRandomDrawsV1`을 직접 사용해야 함.
- 승인 대시보드에 `3개월 AUDIT`, `실제 6개월 Audit 결과`, `AUDIT 6개월 유지율`, `navCount===7`이 없어야 함.
- `Audit 후 6개월 유지율`, `Audit 후 6개월 관리 대상`, `navCount===5`가 존재해야 함.

최신 변경에 대한 Runtime/Browser/Pages 자동검증은 각 main push에서 다시 실행하며 완료 전에는 성공으로 간주하지 않는다.
