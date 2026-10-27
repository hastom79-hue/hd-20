# HD-20 코딩일지 — Dashboard First Tab

일자: 2026-09-15

## 변경 파일
### index.html
- 헤더의 `<a href="hdps-dashboard.html" ...>HDPS 대시보드 →</a>` 제거.
- `beginner-navigation.js` 캐시 버전을 `v=20260915-dashboard-first-1`로 갱신.
- `hd20-overhaul.css` 캐시 버전을 `v=20260915-hd22bg-2`로 갱신.

### beginner-navigation.js
- 첫 메뉴 표시명: `① 통합현황` → `① 대시보드`.
- `data-key="dashboard"`는 그대로 유지해 기존 dashboard 연동을 깨지 않는다.
- `init()`에서 유효한 `?tab=`이 없으면 `go('dashboard',nav)`를 실행해 첫 화면을 명시적으로 Dashboard로 고정.
- controller marker를 `canonical-six-area-v7-dashboard-first`로 갱신.

## 검증 포인트
- 메인 헤더에 별도 HDPS Dashboard 전환 링크가 없어야 한다.
- 첫 탭은 `① 대시보드`이고 기본 active 상태여야 한다.
- `?tab=activity` 등 기존 딥링크는 유지되어야 한다.
- 영역 key 배열은 `dashboard, activity, advancement, maturitymap, audit, action`을 유지한다.
- 데이터/Supabase write 로직은 건드리지 않았다.
