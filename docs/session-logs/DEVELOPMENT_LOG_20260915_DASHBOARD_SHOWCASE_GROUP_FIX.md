# DEVELOPMENT LOG — Dashboard Showcase Group Fix

## 확인 결함
현장형 초기 데이터/공개 현장사진 영역(`#hd20FieldShowcaseBootstrap`)이 `.cards` 뒤에 동적 삽입되지만 Dashboard section target에 포함되지 않아 `실행·유지`, `기준·추이` 전환 시에도 남을 수 있었다.

## 수정
- `summary` targets에 `#hd20FieldShowcaseBootstrap` 추가
- `execution`/`standard` 선택 시 showcase도 다른 summary 요소와 동일하게 숨김
- `summary` 복귀 시 다시 표시
- MutationObserver가 동적 showcase 생성도 감지해 현재 선택 그룹 상태를 재적용
- loader cache: `dashboard-section-tabs.js?v=20260915-3`
- parent cache: `final-layout-polish.js?v=20260915-dashboard-tabs-9`

## 안전성
시각 그룹핑만 수정. 샘플은 계속 운영 KPI/Supabase에서 제외. KPI 산식/Action/Audit/localStorage/Supabase write 변경 없음. forced empty write 없음.
