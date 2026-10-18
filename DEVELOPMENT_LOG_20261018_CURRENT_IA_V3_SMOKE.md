# 개발일지 — Current IA 검증 보정

- GitHub Actions 스크린샷에서 current IA smoke #2012 실패 확인.
- 실행 탭은 V3 실행패널이 소유하며 legacy mainGrid 및 operationalBridge는 숨겨져야 하는 현재 기준에 맞춰 workflow assertion 수정.
- dashboard canonical smoke #2143 실패는 별도이며 오류 로그 미확보로 원인 미확정.
- 실제 CI 재실행 결과 확인 전.

- dashboard canonical #2143 오류 근인: 테스트가 고도화 탭으로 이동한 뒤 대시보드로 돌아오지 않은 상태에서 실행 서브탭만 변경. hd20-v3-execution.js는 상위 내비게이션이 dashboard일 때만 표시하도록 정상 설계되어 v3:false 발생. 테스트에 dashboard 복귀 추가.
