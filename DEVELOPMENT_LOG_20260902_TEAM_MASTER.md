# HD-20 개발일지 — 생산팀 Master 단일화 1차

일자: 2026-09-02
대상: `main`

## 1. 발견사항
현재 울산캠퍼스 16개 생산팀 목록이 여러 실행 모듈에 각각 중복 정의되어 있었다.

- `app.js`
- `team-master-safety.js`
- `audit-random-draw.js`
- `action-mail-workflow.js`

동일한 팀 목록을 파일별로 관리하면 조직명 변경, 신규/폐지 팀 반영, 오탈자 수정 시 화면별 불일치가 발생할 수 있다.

이번 1차 작업에서는 업무기준이나 팀명을 임의 변경하지 않고 **현재 사용 중인 16개 팀을 그대로 유지**한 상태에서 Canonical Source를 먼저 만든다.

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

## 3. 자동검증
Runtime Smoke에 다음 계약을 추가했다.

- `app.js`에 `HD20ProductionTeamMaster`가 존재해야 함.
- Canonical Team Master가 `CANONICAL_TEAMS` 사본을 제공해야 함.
- `team-master-safety.js`가 Canonical Team Master를 사용해야 함.
- `team-master-safety.js`에 독립적인 16개 팀 배열이 다시 들어오면 실패.

관련 커밋:
- `c04be3738b0ace84114c84f86037b0a2c61e1795`

## 4. 아직 남은 중복
다음 실행 모듈은 아직 자체 팀 배열을 가지고 있다.

- `audit-random-draw.js`
- `action-mail-workflow.js`

두 모듈은 Audit 대상 추출과 개선요청/메일의 핵심 운영 흐름이므로 한 번에 대규모 치환하지 않고 Browser/Runtime 검증을 유지하면서 순차적으로 Canonical Team Master에 연결한다.

## 5. 검증상태
본 개발일지 작성 시점에 최신 HEAD의 Runtime/Browser/Package/Pages가 실행 중일 수 있다. **완료 전에는 성공으로 기록하지 않는다.**
