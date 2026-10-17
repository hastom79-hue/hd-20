# 코딩일지 — Canonical execution assertion

- .github/workflows/dashboard-canonical-smoke.yml의 execution grouping assertion 교체.
- 기존: mainGrid 및 operational bridge visible 요구.
- 변경: hd20V3Execution visible, mainGrid/operational bridge/showcase hidden 요구.
- classList 단독 확인 대신 getComputedStyle(display) 기반 확인.
- 테스트 파일 정적 변경 검증 완료, Actions 실행 미검증.
