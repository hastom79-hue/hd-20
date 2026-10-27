# HD-20 개발일지 — Exact Audit Row Return 강화 (2026-09-15)

## 목적
Action Case Detail의 `원 Audit 유지관리로 돌아가기`가 Audit ID가 아닌 다른 셀의 우연한 동일 문자열을 선택할 가능성을 제거한다.

## 검증 결과
`audit-close-evaluation.js`의 유지관리 표는 9개 컬럼이며 두 번째 컬럼이 명시적으로 `Audit ID`이다. 기존 `hd20-trace-backlink-guard.js`는 한 행의 모든 `td`를 순회해 text가 Audit ID와 같으면 복귀 대상으로 선택했다. fuzzy matching은 아니었지만 Audit ID 전용 identity가 아니므로 범위를 더 좁힐 수 있었다.

## 수정
- `audit-close-evaluation.js`
  - 각 실제 Audit row에 `data-audit-id="<exact Audit ID>"`를 부여.
  - 기존 표시 컬럼/평가/Action 연계/Production filter는 변경하지 않음.
  - commit `75330c8f134403d4d15f7b1aa6d6fc6b1f1f305d`
- `hd20-trace-backlink-guard.js`
  - `highlight(id)`를 모든 td 검색에서 `tbody tr[data-audit-id]`의 `dataset.auditId === id` exact identity 비교로 변경.
  - Audit tab/subtab 복귀, retry, highlight UI는 유지.
  - commit `675e919bc1802b7504d5fc9f46df0e8b37ec1dc2`
- `final-layout-polish.js`
  - `audit-close-evaluation.js?v=20260915-1`
  - `hd20-trace-backlink-guard.js?v=20260915-3`
  - commit `be7aa15e22901ba5afa69bee18f5403752e3a728`

## 불변조건
- 원천 Audit ID는 Exact Case Detail의 `원천 Audit ID` 필드만 사용.
- Action↔Audit lineage는 exact Audit ID 기준.
- Production-only filter 유지.
- 종료평가 유지/미흡 판정 로직 변경 없음.
- Supabase write/sanitize 로직 변경 없음.
- 서버측 forced empty write 없음.

## 다음 검증
- final-layout loader의 index cache 갱신 여부 확인 및 필요 시 반영.
- duplicate Activity ID 고도화맵 상태 독립성 검증.
- 고도화맵 → Activity Grid → 원 Case 복귀 검증.
- GitHub Actions Runner 실제 step 진입 여부 재확인.
