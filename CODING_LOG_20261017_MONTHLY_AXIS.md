# 코딩일지 — 2026-10-17
- `chart()` 옵션 `axisHeadroom=0`, `raisePlot=false` 추가(기존 호출 기본 동작 유지).
- 축 계산: `axis(dataMax*(1+axisHeadroom))`.
- 월별 완료·확정·수평전개 차트 B 호출에 `axisHeadroom:0.08,raisePlot:true` 설정.
- 차트 플롯 여백 `t=12,b=24` 월별 한정. 192건 데이터 예시는 200 상한을 넘어 다음 적정 눈금으로 증가.
- 실제 브라우저 렌더링 검증 미완료.
