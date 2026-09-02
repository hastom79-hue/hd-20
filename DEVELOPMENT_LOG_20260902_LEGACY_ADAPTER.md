# HD-20 개발일지 — Legacy 1M/3M/6M UI 퇴역

일자: 2026-09-02
대상: `main`

## 발견 경위
Audit Batch E2E Browser Smoke run #98에서 메인 화면에 구형 Audit 문구가 실제 렌더링되는 것을 감지하여 실패했다.

## 원인
`maturity-seq-action-link.js`가 아직 `공식 판정일 +1M/+3M/+6M`을 계산하고 다음 UI를 동적으로 생성하고 있었다.
- 1개월 점검
- 3개월 AUDIT
- 6개월 AUDIT
- 확정 사례 후속 점검 일정

이는 현재 승인된 `Audit 대상 랜덤 추출 → 실제 Audit 실시일 D-Day → 6개월 지속관리` 모델과 충돌한다.

## 조치
`maturity-seq-action-link.js`를 화면 생성 모듈에서 **호환 Adapter**로 전환했다.
- 더 이상 1M/3M/6M 패널이나 Action Summary를 생성하지 않음.
- `hd20AuditRandomDrawsV1`과 `hd20ActionCasesV2`를 읽어 현재 Audit 상태를 요약.
- 기존 일부 레거시 드릴다운이 `window.HD20MaturityFollowup` 객체를 참조하므로 객체 이름은 일시적으로 유지.
- `one / three / six`은 빈 배열로 유지하여 레거시 호출의 런타임 오류를 방지.
- 현재 상태는 `pending / active / closed`, 개선조치는 `due / over`로 제공.
- `compatibilityAdapter:true`를 명시하여 신규 업무로직에서 이 객체를 정본으로 사용하지 않도록 구분.

## 커밋
- `9d7acf933cd3560232f871f05899862db0958367` — Legacy 1M/3M/6M UI 제거 및 Audit compatibility adapter 전환.

## 검증
기존 E2E run #98의 실패는 Batch 추출/실시 기능 실패가 아니라 Legacy UI 탐지 단계에서 선행 중단된 것이다. Adapter 전환 후 새 Browser Smoke가 재실행되며 결과 확정 전에는 성공으로 간주하지 않는다.

## 후속
- `dashboard-grid-drilldown.js`, `audit-summary-drilldown.js` 등 남은 `HD20MaturityFollowup` 참조를 Canonical Audit Store로 단계적으로 직접 교체.
- 모든 참조 제거 후 compatibility adapter 자체를 삭제할 수 있는지 재검토.
