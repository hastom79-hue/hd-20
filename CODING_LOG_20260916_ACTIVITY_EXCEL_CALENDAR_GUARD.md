# HD-20 Coding Log — 2026-09-16 Activity Excel Calendar Guard

## 변경 파일
- `activity-excel-preview-import.js`
- `index.html`

## 코드 변경
`dateKey(v)`를 실제 달력 검증 함수로 강화했다.

- 허용 입력: `YYYY-MM-DD`, `YYYY/MM/DD`, `YYYY.MM.DD`, `YYYYMMDD`
- 정규화 출력: `YYYY-MM-DD`
- `Date.UTC` round-trip으로 실제 존재하는 날짜인지 확인
- 불가능한 날짜는 빈 키를 반환하고 `analyze()`에서 오류 처리
- invalid date에는 중복 검사 키를 만들지 않음

`analyze()` 오류 문구:
`활동일 오류(실제 달력 날짜 확인)`

UI 단계 문구도 `구조/중복/실제 날짜 검증`으로 변경했다.

## Cache Bust
`index.html`의 activity importer를 `v=20260916-calendar-2`로 갱신했다.

## 안전성
저장은 기존과 동일하게 Preview 통과 + 사용자 confirm 이후 `apply()`에서만 실행한다. Preview 자체에는 write가 없다.