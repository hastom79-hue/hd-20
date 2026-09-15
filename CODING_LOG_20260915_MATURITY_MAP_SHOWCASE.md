# CODING LOG — Maturity Map Field Portfolio

## 신규 모듈
`hd20-maturity-map-showcase.js`

## 구성값
- 휠로더 조립라인: score 94 / 유지 8 / 확정 9 / 후보 10
- 대형굴착기 조립라인: score 91 / 유지 7 / 확정 8 / 후보 9
- 제관라인: score 88 / 유지 7 / 확정 8 / 후보 10
- 중형굴착기 조립라인: 72
- 도장라인: 66
- 조립물류: 61

## 로딩
`final-layout-polish.js`에 `hd20MaturityMapShowcaseScript` loader를 추가했다.

## 불변조건
- localStorage canonical production store 미기록
- Supabase 미기록
- 공식 KPI 산식 미변경
- 실제 공식확정 Case와 초기 Portfolio를 혼합하지 않음
- server-side forced empty write 없음
