# HD-20 개발일지 — 2026-11-06 유지점검 재점검 원본 무결성 가드

## 확인된 위험
기존 `hd20-subtabs.js` 재점검 경로는 최신 재조치 번호와 완료상태를 확인하지만, 동일 개선조치 ID 복수 기록, 최초 평가자·생산팀·작업장 원본 불일치 여부를 재점검 진입 직전에 명시적으로 모두 확인하지 않았음.

## 구현
- `retention-recheck-integrity-guard.js` 신규. document click capture 단계에서 `[data-rs-recheck]` 버튼을 검사하고, 유효하지 않은 조치·유지점검 기록이면 `preventDefault`/`stopImmediatePropagation`으로 기존 판정 저장 호출 차단.
- 원본 유지점검 ID 및 개선조치 ID 유일성, 연결 sourceStage/sourceCaseId, 생산팀, 작업장, 최초 점검자, 종결 상태, 최신 재조치 원본 연결을 검증.
- `index.html`에 보호 모듈 로드. 승인 대시보드/기존 CSS/업무 데이터 미변경.
- 파일 및 HTML main 반영: `4d1e91ac`, `647ca9f2`.

## 테스트
- `tests/retention-recheck-integrity-smoke.cjs`: 실제 가드 함수 추출 실행, 정상·중복·원본부재·팀/작업장/평가자 불일치·유지점검 중복·종결·재점검 불가 상태 9/9 예상 결과 일치(개발 세션 내 단위검증).
- GitHub CI `.github/workflows/retention-recheck-integrity.yml` 신규. 커밋: `ed5147e5`, `e0b8c4fc`.
- **브라우저 E2E / GitHub Actions 실행 성공 / GitHub Pages 반영은 아직 확인하지 못함.**
- 기존 대용량 `hd20-subtabs.js` 직접 수정 실패는 이 별도 가드로 우회함. 원천 핸들러에 직접 통합하는 리팩터링은 후속 검토 대상.
