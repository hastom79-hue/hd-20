# 코딩일지 — 2026-10-17 빈 대시보드 복구
- 파일: dashboard-section-tabs.js: improve/request 활성화 시 .app.awFocused 및 body.navModeActivity 해제, 보드 없으면 ensure(), 비어 있으면 render() 호출.
- 파일: hd20-improve-board.js, hd20-request-board.js: 기존 공개 API에 ensure 추가, render()의 보드 미생성 시 ensure() 폴백 추가.
- 반복 렌더링 회피: 기존 콘텐츠가 있는 경우 탭 전환에서 불필요한 재렌더링하지 않음.
- 실사용 브라우저 및 GitHub Actions 검증 상태는 병합과 별도로 확인 필요.
