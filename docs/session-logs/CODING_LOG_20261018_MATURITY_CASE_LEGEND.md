# 코딩일지 — 고도화맵 범례

- hd20-maturity-map-tab.js: .mmtRuleLegend 3열 반응형 스타일 및 판정/유지/이탈 범례 HTML 삽입.
- index.html: maturity map script cache key 갱신.
- 실제 판정 함수와 데이터 변경 없음.
- JavaScript new Function 구문검사 PASS. CI/브라우저 검증 대기.

- 추가 정정: 유지·이탈 판정 단위는 개별 Case. 팀 내 다른 사례의 유지 유무와 관계없이 해당 Case가 0개 요건이면 이탈 1건으로 기록한다.
