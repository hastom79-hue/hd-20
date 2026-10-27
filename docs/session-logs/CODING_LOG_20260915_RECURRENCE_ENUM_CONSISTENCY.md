# Coding Log — 2026-09-15 Recurrence Enum Consistency

## 변경 파일
- `audit-close-evaluation.js`
- `final-layout-polish.js`

## 핵심 변경
`recurrenceValue(a)`를 추가해 재발 여부의 known/recurred 판정을 명시값으로 제한했다.

Known recurrence:
- 재발: `recurrence===true`, 재발/발생/true/1/Y
- 미재발: `recurrence===false`, 미발생/없음/미재발/false/0/N

그 외 문자열(`미확인`, `대기` 등)은 `{known:false,recurred:false}`이며 Audit 유지 판정을 차단한다.

`recur()`와 `recurrenceKnown()`은 이 parser를 공유한다.

## Cache
`audit-close-evaluation.js?v=20260915-2` → `v=20260915-3`.

## 불변조건
production filter, exact Audit→Action linkage, Supabase schema/sync, server forced empty write 정책은 변경하지 않았다.