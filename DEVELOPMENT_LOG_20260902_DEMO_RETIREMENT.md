# HD-20 개발일지 — Canonical Demo Seed 및 Audit Master 정리

일자: 2026-09-02
대상: `main`

## 1. Canonical Demo Seed 발견
정적 `index.html`과 `hdps-dashboard.html`에서 `demo-data-seed.js`가 자동 로드되고 있음을 확인했다.

해당 파일은 단순 화면 Preview용 데이터가 아니라 Canonical Store가 비어 있을 때 실제 LocalStorage에 다음 가짜 데이터를 자동 생성했다.

- `hd20GMES5SAutoImproveRawV1`: 5S/고도화 활동 120건
- `hd20ActionCasesV2`: 개선조치 26건
- `hd20TeamLeaderMasterV1`: 가상 팀장 및 `@hd-hyundai-demo.co.kr` 이메일

또한 Demo 활동에 과거 `audit6Result`, 임의 Level, 임의 유지상태, 임의 판정결과를 생성하고 있었다.

현재 전면개편 기준은 실제 원천데이터가 없으면 `0 / — / 데이터 없음`으로 표시하며 운영 KPI·Audit·개선조치 판단에 가짜 데이터를 자동 주입하지 않는 것이다. 따라서 이 자동 seed는 현재 기준과 충돌한다.

## 2. Canonical Demo Seed 퇴역
- `index.html`에서 `demo-data-seed.js` 로딩 제거.
- `hdps-dashboard.html`에서 동일 로딩 제거.
- `demo-data-seed.js` 파일 자체 삭제.
- 실제 데이터가 없을 때 Canonical Store를 샘플 데이터로 자동 채우지 않도록 함.
- 기존 운영 데이터가 이미 브라우저 LocalStorage에 존재하는 경우 본 변경은 실제 데이터를 삭제하지 않는다. 본 변경은 향후 자동 Demo 주입만 중단한다.

관련 커밋:
- `07efc931f2c746962a891c8677bc271d256bb3df` — HDPS 대시보드 Demo seed 로딩 제거.
- `2b1e3f08b793870be814cf1274cdad701a55a296` — 메인 index Demo seed 로딩 제거.
- `1f1268b87a9fc84978216a3b5b05d829a3955e77` — `demo-data-seed.js` 삭제.
- `588c499f9a3f4ab9c8a347ad6624620643405e6e` — Demo 오염 방지 Runtime 계약 추가.

## 3. Audit Global Seed 재검토
`audit-global-seed.js`를 코드 단위로 재검토했다.

현재 버전은 Audit 실적이나 합격/부적합 결과를 임의 생성하지 않았고, 체크리스트 Master를 다음 초기값으로 생성하는 역할이었다.

- `result:'N/A'`
- `score:0`
- `source:'master'`

다만 파일명이 `seed`여서 역할이 혼동되며, 체크리스트 항목 중 `1·3·6개월 Audit에서도 지속 유지되는가?`라는 폐기된 Lifecycle 문구가 남아 있었다.

## 4. Audit Checklist Master로 전환
- 신규 `audit-checklist-master.js` 생성.
- 기존 체크리스트 Master 초기화 기능은 유지.
- 결과값은 계속 `N/A / 0`으로 시작하여 실적처럼 보이지 않도록 유지.
- 폐기 문구를 `고도화 작업장의 개선상태가 Audit 실시 후 6개월 지속관리 기간 동안 유지되는가?`로 교정.
- `index.html` 로딩을 `audit-global-seed.js` → `audit-checklist-master.js`로 교체.
- `audit-global-seed.js` 파일 삭제.

관련 커밋:
- `732c3fc559f72ec313ff82ed54ad5dc5eac9b16a` — `audit-checklist-master.js` 생성 및 6개월 지속관리 문구 교정.
- `c6eb86d6b9ae657e713b62244cb08033f0363fd9` — index loader를 Audit Checklist Master로 전환.
- `bd0376ee894197bfab62e6b1880716bffe1717c9` — `audit-global-seed.js` 삭제.

## 5. index 제목 오타 즉시 복구
`c6eb86...`의 전체 index 교체 과정에서 `<h1>`이 일시적으로 `울산캠스 5S 활동관리 시스템`으로 잘못 입력된 것을 즉시 발견했다.

- 정확한 제목 `울산캠퍼스 5S 활동관리 시스템`으로 바로 복구.
- Runtime Smoke에 정확한 `<h1>` 문자열 계약을 추가하여 동일 오타의 재발을 차단.

관련 커밋:
- `3d14586cabd1432d20527f961c8441fc55ab116e` — 제목 즉시 복구.
- `6ec52aafb3ca66d23f9f761b8160f8322b73bc0f` — Audit Checklist Master 및 정확한 메인 제목 Runtime 계약.

## 6. Action Demo Guard 완전 퇴역
`action-demo-seed.js`를 점검한 결과 실제 Demo Action을 생성하지 않고 다음 두 전역만 설정하는 고립된 안전 플래그 파일이었다.

- `window.HD20_DEMO_ACTIONS=[]`
- `window.HD20_ACTION_DEMO_SEED_DISABLED=true`

저장소 검색 결과 다른 활성 코드가 두 전역에 의존하지 않는 것을 확인했다. 따라서 더 이상 별도 Guard 파일을 로드할 이유가 없으므로 완전히 퇴역했다.

- `index.html`에서 `action-demo-seed.js` 로딩 제거.
- `action-demo-seed.js` 파일 삭제.
- Runtime Smoke를 `disable guard 존재`가 아니라 `Demo Action seed 파일/참조/전역 자체 부재` 기준으로 강화.

관련 커밋:
- `fb1357e202161cf1b77da433c1015fa1f6e22dc2` — index Action Demo guard loader 제거.
- `56245e889aefb0c3fa18c8b9b7daad75572525b7` — `action-demo-seed.js` 삭제.
- `42f23043b1b13a7258d9f4f7a296d3beca59a6f8` — Demo Action 전역/파일 재유입 방지 Runtime 계약.

## 7. 현재 자동검증 계약
Runtime Smoke에서 다음을 검사한다.

- `demo-data-seed.js`가 존재하지 않아야 함.
- `action-demo-seed.js`가 존재하지 않아야 함.
- `index.html`, `hdps-dashboard.html`에 두 Demo script 참조가 없어야 함.
- 실행 JavaScript에 `source:'demo-seed'`, `HD20_DEMO_ACTIONS`, `HD20_ACTION_DEMO_SEED_DISABLED`가 없어야 함.
- `audit-checklist-master.js`가 존재해야 함.
- `audit-global-seed.js`는 존재하지 않아야 함.
- Audit Checklist Master는 `score:0`, `result:'N/A'`로 초기화되어야 함.
- Audit Checklist Master에 `Audit 실시 후 6개월 지속관리 기간 동안 유지되는가?`가 존재해야 함.
- 구형 `1·3·6개월 Audit` 문구가 Audit Checklist Master에 존재하면 실패.
- 메인 `<h1>`은 정확히 `울산캠퍼스 5S 활동관리 시스템`이어야 함.

## 8. 검증 상태
Commit `6ec52aafb3ca66d23f9f761b8160f8322b73bc0f` 기준 Runtime #212, Browser #155 등은 실행이 시작된 것을 확인했다. 그 이후 Action Demo Guard 퇴역과 Runtime 계약까지 추가 반영되었으므로 최종 검증은 최신 HEAD 기준으로 다시 확인한다.

완료 전에는 성공으로 간주하지 않는다.

## 9. 후속
- 최신 HEAD의 Runtime / Browser / Package / GitHub Pages 결과를 확정한다.
- 실행 코드 전체에서 다른 Prototype/mock/seed가 Canonical 운영 Store에 자동 데이터를 넣는지 계속 전수점검한다.
- 실제 운영데이터가 없을 때 화면은 `0 / — / 데이터 없음`을 유지한다.
