# HD-20 업무일지 — 2026-08-27 KPI Canonical 정합화

## 작업 목적
승인된 첫 Dashboard 화면의 정보구조를 유지하면서 KPI 숫자, Popup 상세 Grid, 성과전환 분석이 서로 다른 Mock/Seed 값을 사용하지 않도록 동일 Canonical Source로 통합한다.

## 이번 작업
### 1. 상단 KPI 상세 Grid Mock 제거
- 변경 파일: `top-kpi-drilldown.js`
- 기존 문제: `ACT`, `WP`라는 별도 하드코딩 샘플 배열이 존재하여 Dashboard KPI와 Popup 상세 Grid의 숫자가 불일치할 수 있었음.
- 조치:
  - `ACT`, `WP` 샘플 배열 제거.
  - `window.HD20KPIData.snapshot()`을 유일한 상세 Grid 원천으로 사용.
  - 5개 KPI별 상세행을 `activities`, `candidates`, `newSecured`, `confirmed`, `maintained`에서 직접 생성.
  - Raw Data CSV도 화면 Grid와 동일 행을 추출.
  - Headcount가 없는 경우 인당 개선활동을 임의 계산하지 않고 `—` 처리.
- Commit: `82fdbc7168167f4bd70cd3a2fdc13b25c1245c30`

### 2. 성과전환 분석 판정함수 통합
- 변경 파일: `performance-conversion-analysis.js`
- 기존 문제: 성과전환 화면이 자체 `isCandidate`, `isConfirmed`, `isMaintained` 함수를 가지고 있어 메인 KPI와 판정기준이 달라질 위험이 있었음.
- 조치:
  - 후보 판정: `HD20KPIData.isCandidate()` 공유.
  - 공식확정: `HD20KPIData.isConfirmed()` 공유.
  - 현재유지: `HD20KPIData.isMaintained()` 공유.
  - GMES 원천 로딩도 `HD20KPIData.load()` 우선 사용.
  - 상세 Grid도 동일 판정 결과를 사용.
- Commit: `583d556d4e94b5be5e04bdc26730037ef2b94538`

## Canonical Source 기준
- 원천 LocalStorage: `hd20GMES5SAutoImproveRawV1`
- 공통 Adapter: `dashboard-kpi-source.js`
- 후보: `HD20KPIData.isCandidate`
- 공식확정: `HD20KPIData.isConfirmed`
- 현재유지: `HD20KPIData.isMaintained`
- 선택연도 신규확정: `HD20KPIData.snapshot().newSecured`
- Headcount Master: `hd20TeamHeadcountMasterV1`; 실제 인원 원천이 없으면 인당 KPI를 임의 생성하지 않음.

## 실행/검증
- `top-kpi-drilldown.js`의 기존 ACT/WP 하드코딩 샘플 존재를 원본 조회로 확인 후 제거.
- `dashboard-kpi-source.js`의 Canonical 함수 및 snapshot 구조 확인.
- `performance-conversion-analysis.js`가 자체 판정함수를 사용하던 상태 확인 후 공통 함수로 변경.
- GitHub Actions `HD20 runtime smoke`가 HEAD `583d556d4e94b5be5e04bdc26730037ef2b94538`에서 `completed / success` 확인.
- 동일 HEAD의 `Package HD20 source` 실행도 확인.

## 다음 미결 순서
1. 승인 2번 첫 화면을 덮어쓰는 잔존 Mock/Seed/Hardcoded KPI 전수검사.
2. `index.html` 및 동적 Boot Loader의 로딩순서 재검증.
3. 상단 KPI 숫자 = Popup Grid 행수 1:1 검증.
4. 후보/신규/누적/유지의 연도 기준 및 날짜필드 fallback 검증.
5. 승인 첫 화면 레이아웃/이미지 회귀검증.
6. Runtime Smoke + Package + Pages 배포 상태 최종 확인.

## 변경 금지 기준
- 승인된 첫 Dashboard 정보구조 및 승인 2번 시안을 임의 변경하지 않는다.
- HD-20 외 다른 화면/프로젝트의 요구사항이나 코드를 혼합하지 않는다.
- 실제 원천이 없는 숫자를 운영 KPI로 생성하지 않는다.
- 기능 변경 후 실행/검증 없이 완료로 보고하지 않는다.
