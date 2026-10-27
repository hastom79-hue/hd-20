# 코딩일지 — Current IA V3

- .github/workflows/current-ia-smoke.yml: groupState()에 v3 가시성 필드 추가, execution 검증을 !main && !bridge && v3로 변경.
- 웹 앱의 화면 동작 로직은 변경하지 않음.
- CI 통과 여부 미검증.

- dashboard canonical #2143 오류 근인: 테스트가 고도화 탭으로 이동한 뒤 대시보드로 돌아오지 않은 상태에서 실행 서브탭만 변경. hd20-v3-execution.js는 상위 내비게이션이 dashboard일 때만 표시하도록 정상 설계되어 v3:false 발생. 테스트에 dashboard 복귀 추가.
