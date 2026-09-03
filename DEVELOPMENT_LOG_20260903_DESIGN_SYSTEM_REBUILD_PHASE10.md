# HD-20 Design System Rebuild — Phase 10
Date: 2026-09-03

## 목적
Dashboard 표현을 별도 보조 stylesheet의 load order에 의존하지 않고 5-area canonical layer가 직접 소유하도록 정리한다.

## 반영
- `index.html`에서 `dashboard-priority-groups.css` 로딩 제거.
- `dashboard-priority-groups.css` 저장소 물리 삭제.
- Dashboard priority/group/detail density는 `hd20-five-area.css` Dashboard contract가 소유하도록 stylesheet chain 단순화.
- cache key를 `hd20-five-area.css?v=20260903-dashboard-canonical-2`로 갱신.

## 업무 로직 영향
없음. KPI 산식, 고도화 3조건, 공식판정, Audit Risk 랜덤 추출, Audit 후 6개월 지속관리, 개선조치 Deadline 정책 및 canonical stores는 변경하지 않았다.

## 현재 stylesheet chain
1. styles.css
2. hd20-overhaul.css
3. hd20-five-area.css
4. workflow-area-density.css
5. maturity-condition-analysis.css

## 다음 단계
`workflow-area-density.css`의 공통 Card/Form/Table/Flow 밀도 규칙을 `hd20-five-area.css`로 흡수하고, area-specific 의미색과 workflow hierarchy만 남길 수 있는지 검증한다. 이후 안전하면 해당 보조 stylesheet도 제거한다.
