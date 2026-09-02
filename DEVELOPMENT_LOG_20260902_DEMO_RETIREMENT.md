# HD-20 개발일지 — Canonical Demo Seed 퇴역

일자: 2026-09-02
대상: `main`

## 발견
정적 `index.html`과 `hdps-dashboard.html`에서 `demo-data-seed.js`가 자동 로드되고 있음을 확인했다.

해당 파일은 단순 화면 Preview용 데이터가 아니라 Canonical Store가 비어 있을 때 실제 LocalStorage에 다음 가짜 데이터를 자동 생성했다.

- `hd20GMES5SAutoImproveRawV1`: 5S/고도화 활동 120건
- `hd20ActionCasesV2`: 개선조치 26건
- `hd20TeamLeaderMasterV1`: 가상 팀장 및 `@hd-hyundai-demo.co.kr` 이메일

또한 Demo 활동에 과거 `audit6Result`, 임의 Level, 임의 유지상태, 임의 판정결과를 생성하고 있었다.

현재 전면개편 기준은 실제 원천데이터가 없으면 `0 / — / 데이터 없음`으로 표시하며 운영 KPI·Audit·개선조치 판단에 가짜 데이터를 자동 주입하지 않는 것이다. 따라서 이 자동 seed는 현재 기준과 충돌한다.

## 조치
- `index.html`에서 `demo-data-seed.js` 로딩 제거.
- `hdps-dashboard.html`에서 동일 로딩 제거.
- `demo-data-seed.js` 파일 자체 삭제.
- 실제 데이터가 없을 때 Canonical Store를 샘플 데이터로 자동 채우지 않도록 함.
- 기존 운영 데이터가 이미 브라우저 LocalStorage에 존재하는 경우 본 변경은 실제 데이터를 삭제하지 않는다. 본 변경은 향후 자동 Demo 주입만 중단한다.

## 자동검증
Runtime Smoke에 다음 계약을 추가했다.

- `demo-data-seed.js` 파일이 존재하면 실패.
- `index.html`, `hdps-dashboard.html`이 Demo seed를 로드하면 실패.
- 실행 JavaScript에 `source:'demo-seed'` Canonical seed 코드가 다시 들어오면 실패.
- 기존 `action-demo-seed.js`는 명시적 disable guard가 계속 존재해야 함.
- Audit Global seed는 별도 점검 대상으로 유지하며 현재 Smoke에서 `score:0`, `result:'N/A'` 계약을 확인함.

## 관련 커밋
- `07efc931f2c746962a891c8677bc271d256bb3df` — HDPS 대시보드 Demo seed 로딩 제거.
- `2b1e3f08b793870be814cf1274cdad701a55a296` — 메인 index Demo seed 로딩 제거.
- `1f1268b87a9fc84978216a3b5b05d829a3955e77` — `demo-data-seed.js` 삭제.
- `588c499f9a3f4ab9c8a347ad6624620643405e6e` — Demo 오염 방지 Runtime 계약 추가.

## 검증 상태
본 변경 이후 Runtime / Browser / Package / GitHub Pages 검증은 다시 실행된다. 완료 전에는 성공으로 간주하지 않는다.

## 후속
- `audit-global-seed.js`가 업무 결과값을 임의 생성하지 않는지 코드 단위로 재검토.
- 다른 Prototype seed/fixture가 Canonical Store에 자동 주입되는지 실행 코드 전수검색.
