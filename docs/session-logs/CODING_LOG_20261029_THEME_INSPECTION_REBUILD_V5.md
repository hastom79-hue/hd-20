# Coding Log — 2026-10-29 — Theme Inspection Workflow Rebuild v5

## Scope
- `theme-inspection.js`
- `theme-inspection-v5.css`
- `supabase-sync.js`
- `.github/workflows/maturity-theme-regression.yml`
- `index.html`
- `DEVELOPMENT_LOG.md`
- `DEVELOPER_GUIDE.md`

## Changes
1. Replaced the single long screen with four focused work areas: monthly/theme plan and vulnerability overview, field inspection, finding/action tracking, and reinspection history.
2. Reads active Ulsan Campus workplaces from `HD20WorkplaceMaster.active()`, while retaining legacy line labels found in prior audit/action records.
3. Added month-and-line scoped theme planning using `hd20ThemeAuditPlansV1`; only selected themes are shown in the inspection checklist and matrix. Added the plan store to canonical Supabase synchronization and preserved local plans when older remote payloads lack the key.
4. Added a direct view of theme-originated action records from `hd20ActionCasesV2`, retaining existing deduplication and reinspection linkage.
5. Preserved append-only audit history and existing action records. Dashboard source and calculations were not changed.
6. Added scoped CSS and cache-busted both JS and CSS assets.

## Validation
- JavaScript syntax and workflow regression checks run in GitHub Actions before merge.
- Authenticated cross-session sync and live visual browser verification remain separate production-session checks.
- Live authenticated save/sync and visual browser verification remain required before claiming complete production validation.


## Follow-up quality correction — 2026-10-29
- New month/line pairs now start with no planned themes instead of silently enabling all themes.
- Saving an audit is blocked until at least one theme is explicitly planned.
- New audit rounds start with blank judgments; copying the previous round is an explicit action and is labeled as a reference that must be rechecked onsite.
- Added browser regression assertions for clean rounds, explicit previous-result import, and plan-gated audits.
- Dashboard remains untouched; live authenticated cross-session sync is still a separate verification item.


## Follow-up — Action tracking usability
- Added text search across line/team/theme/finding/action ID and a status filter to the action-tracking view.
- Reinspection-linked cases are discoverable in both the original audit month and the latest reinspection month.
- Monthly KPI lookup falls back to audit timestamps for legacy records with no explicit month field.
- Cache keys bumped to `20261029-action-filters-3`; dashboard remains unchanged.


## 2026-10-29 v6 — 라인 우선 운영화면
- 기존 매트릭스가 차지하던 넓은 가로 영역을 제거하고 라인별 요약 목록으로 전환.
- 라인별 계획 테마 칩, 최근 점검 일시, 최신 점검의 미흡 건수, 월 필터 기준 연계 조치 수, 현장점검 진입 버튼을 한 행에 배치.
- 상단의 대시보드형 KPI 카드 4개를 제거하고 4단계 업무 흐름 레일로 대체.
- 작은 화면은 라인별 요약을 세로 재배치하며 계획/이력/조치 데이터 스키마는 변경하지 않음.
- 추가 회귀 assertion: 업무 흐름 레일, 라인 요약 진입, 넓은 매트릭스 제거, KPI 타일 제거, 캐시 키 갱신.
