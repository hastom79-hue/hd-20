# HD-20 코딩일지 — 팀별 막대 총 건수 표시

- 파일: hd20-improve-board.js
- chart() 인수에 labelTotals=null 추가.
- 막대 라벨 출력 시 labelTotals[i]가 유효하면 인당값 + tspan 줄바꿈 `(N건)` 생성.
- 팀 차트 Cc 호출에서 `labelTotals:per?tv.map(x=>x.c):null` 전달.
- 검증: new Function(JS) 구문 통과; SVG 내 `2.15<tspan` 및 `(86건)` 확인(테스트용 값).
- 남은 검증: 실제 팀 데이터 숫자, 모바일 라벨 겹침, CI, 운영 화면 반영.
