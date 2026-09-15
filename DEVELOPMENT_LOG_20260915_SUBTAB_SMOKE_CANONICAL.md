# DEVELOPMENT LOG — 2026-09-15 — Subtab Smoke Canonical

## 목적
현재 6개 메인영역과 대시보드 4그룹 구조에 맞춰 오래된 서브탭 E2E 검증을 정합화한다.

## 발견 결함
기존 `.github/workflows/subtab-contract-grid-smoke.yml`은 과거 구조를 전제로 했고, 1차 Canonical 수정에서도 대시보드가 실제 4그룹임에도 `summary/execution/standard` 3그룹으로 잘못 검증했으며 Node 실행문에 `window===window`를 두어 브라우저 컨텍스트 밖 ReferenceError 가능성을 만들었다.

## 반영
- 메인 내비게이션 정확히 6개 키 검증
- 대시보드 그룹 정확히 `summary/execution/standard/field` 4개 검증
- Node 컨텍스트의 잘못된 `window===window` assertion 제거
- 운영 서브탭 8개(Activity 2, Advancement 2, Audit 2, Action 2)의 목적/판단/다음행동/상세 데이터 그리드 계약 검증 유지
- Maturity Map 메인영역 직접 이동 검증 유지
- 모바일 390px 상세 그리드 overflow 검증 유지

## 데이터 안전
검증 fixture는 브라우저 localStorage에만 주입하며 Supabase 쓰기 로직이나 운영 데이터 저장 로직을 변경하지 않았다. 서버 강제 빈 값 쓰기 없음.

## 변경 커밋
- 1차 workflow: `7b061d9cc8af574e69c20e1e20267a686cf93ee5`
- Canonical correction workflow: `a1de90158411b80404d7406875f3bc0c49ef00da`
