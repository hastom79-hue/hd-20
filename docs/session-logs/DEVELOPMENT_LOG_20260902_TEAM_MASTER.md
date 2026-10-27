# HD-20 개발일지 — 생산팀 Master 단일화

일자: 2026-09-02
대상: `main`

## 1. 발견사항
현재 울산캠퍼스 16개 생산팀 목록이 여러 실행 모듈에 각각 중복 정의되어 있었다.

- `app.js`
- `team-master-safety.js`
- `audit-random-draw.js`
- `action-mail-workflow.js`

동일한 팀 목록을 파일별로 관리하면 조직명 변경, 신규/폐지 팀 반영, 오탈자 수정 시 화면별 불일치가 발생할 수 있다.

이번 작업에서는 업무기준이나 팀명을 임의 변경하지 않고 **현재 사용 중인 16개 팀을 그대로 유지**한 상태에서 Canonical Source로 통합한다.

## 2. 1차 변경
### app.js
- 기존 16개 팀 배열을 `CANONICAL_TEAMS`로 명확히 지정.
- 전역 `window.HD20ProductionTeamMaster` 제공.
- 공개 기능:
  - `teamNames()`
  - `has(team)`
  - `count()`
- Dashboard Core는 이 Canonical Team Master에서 팀 목록을 가져오도록 변경.

관련 커밋:
- `0b560e1cc9eb0887c0697ca2d7a092d2e9de59ab`

### team-master-safety.js
- 자체 16개 팀 배열 제거.
- `window.HD20ProductionTeamMaster.teamNames()`를 사용하여 팀장 기준정보의 누락 팀을 보완.
- Canonical Team Master가 로드되지 않은 비정상 상태에서는 임의 팀 목록을 생성하지 않고 오류 상태로 남김.

관련 커밋:
- `7cc83d7e4d78699687c4e6cdd1bc8fb485fa7976`

## 3. 2차 변경
### audit-random-draw.js
- 자체 16개 Audit 대상팀 배열 제거.
- `HD20ProductionTeamMaster.teamNames()`를 Audit 후보 모집단으로 사용.
- Canonical Team Master가 비정상적으로 비어 있으면 랜덤 추출을 실행하지 않고 명시 오류를 발생시킴.
- 기존 Risk 가중, 미설정 시 균등 랜덤, 동일 Batch 내 중복 없는 추출 로직은 유지.

관련 커밋:
- `2183e35fe14a055848878c88b0af62dcb3e85a8c`

### action-mail-workflow.js
- 자체 16개 팀 배열 제거.
- 개선요청 등록/팀장 기준정보 화면이 `HD20ProductionTeamMaster.teamNames()` 기준을 사용하도록 연결.
- 기존 Canonical Action Store `hd20ActionCasesV2`와 팀장 기준정보 Store `hd20TeamLeaderMasterV1`은 유지.

추가로 활성 화면에서 발견된 과거 IA/주기 잔여를 함께 교정했다.

- `⑥ 문제점 · 개선조치` → `⑤ 개선조치`
- `⑤ Audit 관리` → `④ 유지·Audit`
- 승인되지 않은 `정기 5S Audit(매월말·익월초)` 고정주기 문구 제거.
- 현재 업무기준에 맞춰 `Audit/현장점검` 표현 사용.

관련 커밋:
- `f11686f0eaa56cb0a7fe2d76fddc5e54c979bfc5`

## 4. 자동검증
Runtime Smoke는 다음 계약을 검증한다.

- `app.js`에 `HD20ProductionTeamMaster`가 존재해야 함.
- Canonical Team Master가 `CANONICAL_TEAMS` 사본을 제공해야 함.
- `team-master-safety.js`, `audit-random-draw.js`, `action-mail-workflow.js`가 모두 Canonical Team Master를 사용해야 함.
- 위 3개 파일에 독립적인 16개 팀 배열이 다시 들어오면 실패.
- Audit 랜덤추출은 Canonical Master 미로딩 시 명시 오류를 가져야 함.
- 개선조치 화면에 `⑤ 개선조치`, `④ 유지·Audit`가 존재해야 함.
- `⑥ 문제점 · 개선조치`, `⑤ Audit 관리`, `매월말·익월초`가 재유입되면 실패.

관련 커밋:
- `c04be3738b0ace84114c84f86037b0a2c61e1795` — 1차 계약.
- `e5749af15c78e7d6d14679c8eedf860d06c5eb40` — 2차 계약 및 IA/주기 회귀방지.

## 5. 현재 구조
현재 생산팀 이름의 실행 기준 Source는 `app.js`의 `HD20ProductionTeamMaster` 하나로 정리되었다.

- Dashboard 표시순서
- 팀장 기준정보 안전 초기화
- Audit 랜덤 대상 모집단
- 개선조치 등록/팀장 기준정보

위 흐름은 동일 16개 팀 기준을 공유한다.

팀장명과 이메일은 생산팀명 Master와 분리하여 `hd20TeamLeaderMasterV1`에 저장하며, 미등록 시 `미지정 / 공란`을 유지한다.

## 6. 검증상태
본 개발일지 작성 시점에 최신 HEAD의 Runtime/Browser/Package/Pages가 실행 중일 수 있다. **완료 전에는 성공으로 기록하지 않는다.**
