# HD-20 개발일지 — Canonical Runtime / Workflow 정리

일자: 2026-09-02
대상: `main`

## 목적
전면개편 이후에도 활성 Runtime에 남아 있던 구형 7영역/1·3·6개월 Lifecycle/분리 Store/가상 판정값을 제거하고, 실제 5영역 Canonical 운영모델과 자동검증 계약을 일치시킨다.

현재 5영역은 다음으로 고정한다.

1. 통합 대시보드
2. 5S 활동
3. 고도화·판정
4. 유지·Audit
5. 개선조치

## 1. 구형 관리경로 퇴역
현재 Navigation에서 접근되지 않으면서 과거 구조를 다시 생성하던 실행모듈을 제거했다.

- `register-tab-fill.js`
- `audit-admin-import.js`
- `crud-hotfix.js`
- `action-button-hotfix.js`

`audit-admin-import.js`는 폐기된 1·3·6개월 점검주기와 분리 Store `hd20WorkflowDataV1`를 다시 사용하는 경로였으므로 유지할 이유가 없었다.

`index.html`의 script reference도 함께 제거했다.

관련 커밋:
- `5183928e23984f3c6b7b3e7f2dafc68805fcb335`
- `6fcf533e30dbaa76f8f3a5fa8a400daa88a59d0b`
- `9f4d4daa4839f4f897e1954da0e11acef1852d12`
- `426f6d8440b699a76c87e883640cf3c3ffeab714`

## 2. Workflow 원본 Canonical 재구성
`activity-workflow.js`에 다음 과거 원본이 남아 있었다.

- `⑤ 5S Audit 관리`
- `3개월 AUDIT / 6개월 AUDIT`
- `⑥ 문제점·개선조치`
- 삭제된 `HD20MaturityFollowup` 조회경로
- `awRegister` 구형 기준정보 화면 경로

이를 현재 업무흐름 기준으로 재구성했다.

- `② 5S 활동`
- `③ 고도화·판정`
- `④ 유지·Audit`
- `⑤ 개선조치`

Audit 화면은 `hd20AuditRandomDrawsV1` 실제 Audit Store를 기준으로 `실시대기 / 6개월 관리중 / 종료평가 대기 / 종료평가 완료`를 집계한다.

고도화 화면은 조건 충족 개수와 공식 판정을 분리한다.

관련 커밋:
- `b8c8908c99d027e18fee9d0e5c69dee11fddd0f9`

## 3. 생산팀 Master 단일 Source 마무리
`activity-dynamic-chart.js`에 남아 있던 마지막 독립 16개 팀 배열을 제거했다.

현재 생산팀 목록 Source는 `app.js`의 `window.HD20ProductionTeamMaster`가 Canonical이며 다음 실행모듈이 동일 Source를 사용한다.

- `team-master-safety.js`
- `audit-random-draw.js`
- `action-mail-workflow.js`
- `activity-workflow.js`
- `activity-dynamic-chart.js`
- `performance-conversion-analysis.js`

관련 커밋:
- `3ad3bfe2d3add2ec2ac43f6d468263abe4cfe36c`

## 4. 공식판정과 조건충족 의미 분리
성과전환 화면의 `공식 확정`은 `HD20KPIData.isConfirmed()`를 사용한다.

1개/2개/3개 조건 충족 수준은 고도화 현상·성과 분석축이며 공식 판정결과와 자동 연결하지 않는다.

판정 UI는 다음만 기록한다.

- `확정 / 보완요청 / 미확정`
- 판정주체/기록
- 판정사유
- 판정일시

판정 버튼이 `criteriaMet`, `criteriaMetCount` 등을 임의 변경하지 않는다.

`performance-conversion-analysis.js`는 이를 명확하게 보여주는 Canonical 버전으로 재작성했다.

관련 커밋:
- `c748bee21c1c3990d512da82fe51f5b4bae57900`
- `309a389668f08863fc9250bfc101a9d5685cd658`

## 5. 가상 판정자·사유 제거
`maturity-map-drilldown.js`에 실제 저장값이 없을 때 다음 값을 자동 표시하던 fallback이 있었다.

- `생산혁신팀 메인 담당자`
- `공식 판정 기준 충족`

이 값은 실제 판정기록이 아니므로 제거했다.

현재는 실제 `judgeOwner / judgeBy / confirmedBy`, `judgeReason` 저장값이 없으면 `—`로 표시한다.

공식 판정주체 기준은 승인된 `생산혁신팀 + 5S 모듈`로 표기한다.

관련 커밋:
- `00fb06ebb1bb72aced0bfe5ef77c44b35077c973`

## 6. Runtime 실패와 교정 이력
### Runtime #260 — failure
Commit `00fb06ebb1bb72aced0bfe5ef77c44b35077c973` 기준.

실패단계:
- `Verify JavaScript syntax`

원인:
- `performance-conversion-analysis.js`의 `renderFunnel()` 종료경계가 깨져 `function render()` 앞에서 `SyntaxError: Unexpected token 'function'` 발생.

조치:
- 파일을 현재 Canonical 의미체계로 재작성.
- 로컬 `node --check` 통과 후 반영.

### Runtime #261 — failure
Commit `309a389668f08863fc9250bfc101a9d5685cd658` 기준.

확인결과:
- JavaScript syntax: success
- index script reference: success
- static 5-area: success
- Dashboard Core: success
- Team Master: success
- five-area navigation: success
- HDPS canonical: success
- MaturityFollowup retirement: success
- Approved Landing: success
- Dashboard Side Summary: success
- `Verify workflow screen contract`: failure

원인:
- Runtime Smoke가 이미 퇴역한 `awRegister`를 계속 필수 화면으로 요구.

조치:
- Runtime Smoke를 현재 4개 실제 Workflow screen + 5영역 Navigation 기준으로 재정의.
- `awRegister` 기대값 제거.
- 퇴역 파일 재유입 방지 추가.
- 생산팀 Master 단일화 계약 확대.
- 조건충족/공식판정 분리 계약 추가.
- 가상 판정자/사유 재유입 차단 추가.

관련 커밋:
- `c357c3519a9f85ce002bc9b93dce957b414a2470`

### Runtime #262 — failure
Runtime 계약 현행화 직후 `Verify advancement semantics`에서 화면 문구와 grep 문구가 미세하게 달라 실패했다.

기능 오류가 아니라 검증문구 불일치였으며 실제 Canonical 문구 `공식 판정 결과는 별도 축` 기준으로 계약을 수정했다.

관련 커밋:
- `fb6c4ac5afb0dce610ca270f07f299d1618b0bde`

이후 Runtime #265는 전체 계약을 **success**로 통과했다.

## 7. Browser 의미검증 강화
Browser Smoke가 단순 메뉴 클릭만 하지 않고 `③ 고도화·판정` 화면을 직접 열어 다음을 검증하도록 강화했다.

- `#performanceConversionAnalysis.on` 실제 표시.
- `조건 충족 수준과 공식 판정은 분리` 문구 확인.
- `생산혁신팀 + 5S 모듈 판정` 확인.
- `생산혁신팀 메인 담당자` 가상 판정자 미노출.
- `2개 이상 충족 → 자동 확정` 식 의미가 화면에 나타나지 않는지 확인.
- 기존 Audit Batch / Audit 실시 / 종료평가 / Case Trace / Dashboard / HDPS E2E는 계속 수행.

관련 커밋:
- `07ad9d2ed3f403a79a6f16dac34d3a4fd54b71fb`

## 8. 배포 ZIP 직접검증 및 가상 팀장 템플릿 제거
Package Artifact를 직접 압축 해제해 활성 JS/HTML을 검색했다.

발견사항:
- `team-leader-excel-import.js`의 다운로드 양식에 `홍길동`, `김현대`, `hong@example.com`, `kim@example.com` 가상 예시가 남아 있었다.

조치:
- 생산팀장 업로드양식을 `생산팀,생산팀장,이메일` 컬럼 헤더만 제공하도록 변경.
- Runtime Smoke에서 활성 JS/HTML에 `example.com`, `홍길동`, `김현대`가 재유입되면 실패하도록 추가.

관련 커밋:
- `30b680fb49b6173d349f6181f9b9bd4739637829`
- `c662915a20cfab3eeecddf0c420d09c6bb2fb092`

최신 Package #472 Artifact를 다시 직접 풀어 검사한 결과:
- `HD20MaturityFollowup`: 0건
- `hd20WorkflowDataV1`: 0건
- `management.html` 링크: 0건
- `awRegister`: 0건
- 가상 판정자: 0건
- `example.com / 홍길동 / 김현대`: 0건
- `1개월 점검 / 3개월 AUDIT / 6개월 AUDIT`: 0건
- 독립 16개 팀 배열: 0건 (`app.js`의 `CANONICAL_TEAMS`만 존재)

## 9. 확정 검증 기준점
Commit `c662915a20cfab3eeecddf0c420d09c6bb2fb092`:

- Runtime Smoke #268: **success**
- Browser Smoke #211: **success**
- Package HD20 source #472: **success**
- Pages build and deployment #663: **success**

Browser #211에는 새 고도화 의미검증과 기존 Audit Batch/종료평가/HDPS E2E가 모두 포함된다.

## 10. 검증 원칙
최신 HEAD의 Runtime / Browser / Package / Pages가 모두 확정되기 전에는 성공으로 기록하지 않는다.

기능 실패와 검증계약 실패를 구분해 기록하며, 실패한 Workflow Run도 삭제하거나 숨기지 않는다.

## 후속
- 활성 Runtime의 죽은 링크·미사용 UI·가상 기본값을 계속 제거한다.
- 운영 Master/정책이 없는 상태에서 임의 수치나 임의 담당자를 만들지 않는 원칙을 유지한다.
- 이후 기능 추가도 `code → Runtime → Browser → Package/Pages → 개발일지/README` 순으로 검증한다.
