# 코딩일지 — 월별 검증 및 이탈

- web-validation-fixture.js makeActivities: 팀/slot별 월 배분으로 등록월 편중 감소.
- 확정 후 최소 21일 이상 경과 조건으로 이탈 판정, 이탈일은 현재일 이내로 제한.
- 팀별 pf.loss에 1.65배 적용, 상한 0.82. 원래 등록 건수 및 ID 수량 유지.
- index.html fixture cache version 갱신.
- JS 구문 검사 PASS. CI 및 브라우저 검증 미실시.
