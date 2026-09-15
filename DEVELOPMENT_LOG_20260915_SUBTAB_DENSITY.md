# DEVELOPMENT LOG — 2026-09-15 — Subtab Density / Empty-space Cleanup

## 목적
②/③/⑤/⑥ 서브탭 분리 이후 숨김 콘텐츠 때문에 화면이 비어 보이거나 목적 패널이 과도하게 높아지는 잔여 UX를 정리한다.

## 변경
- `.awScreen[data-subview]`의 고정 `min-height:280px` 제거 → `min-height:0`
- 목적 패널 padding/gap/margin 축소
- Hero 상하 padding 축소
- Purpose logic/chip/action 밀도 최적화
- Empty grid 안내 영역 높이 축소
- 모바일 목적 패널 padding 추가 축소

## 보존
- 업무 데이터/판정/ID trace 변경 없음
- 서브탭 역할 분리 Guard 변경 없음
- Supabase/localStorage write 변경 없음
- forced empty write 없음

## 캐시
- `hd20-subtabs.css?v=20260915-density-2`
