# 코딩일지 — 월별 검증 및 이탈

- web-validation-fixture.js makeActivities: 팀/slot별 월 배분으로 등록월 편중 감소.
- 확정 후 최소 21일 이상 경과 조건으로 이탈 판정, 이탈일은 현재일 이내로 제한.
- 팀별 pf.loss에 1.65배 적용, 상한 0.82. 원래 등록 건수 및 ID 수량 유지.
- index.html fixture cache version 갱신.
- JS 구문 검사 PASS. CI 및 브라우저 검증 미실시.

## 사용자 확정 기준 정정 (최신)
- 고도화 작업장 → 고도화 작업사례로 용어 통일.
- 3대 요건 중 1개 이상 충족 시 고도화 작업사례로 인정; 0개면 이탈.
- 검증 fixture에서 확정 사례의 충족 개수를 1~3개로 배분하고 이탈 사례는 0개로 기록.
- integrated-performance-map.js에서 해당 명칭 교체 및 캐시 갱신.
- JS 구문검사 통과. 실제 브라우저/CI 검증 미완료.
