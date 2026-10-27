# HD-20 Design System Rebuild Phase 3 — 2026-09-02

## 목적
② 5S 활동 / ③ 고도화·판정 / ④ 유지·Audit / ⑤ 개선조치 화면의 정보계층과 시각밀도를 공통 제품 UI 수준으로 정리한다.

## 주요 변경
- `hd20-five-area.css`를 화면별 hotfix가 아니라 5개 업무영역 전용 layout layer로 재정비.
- `hd20AreaHeader` 크기와 설명 밀도 축소.
- 기존 `awHero`를 큰 중복 타이틀 박스가 아니라 보조 실행영역으로 축소.
- Workflow step / KPI / Audit lane을 동일 spacing, 높이, border hierarchy로 통일.
- Form / Card / Table의 vertical density를 줄이고 실제 실행화면 중심으로 정돈.
- ③ 고도화·판정의 `performanceConversionAnalysis` + `awWorkplace` 통합 구조 간격과 card hierarchy 통일.
- ④ Audit은 warning 계열 accent, ⑤ 개선조치는 action/danger 계열 accent로 업무 성격을 구분하되 status semantics는 변경하지 않음.
- 1100px / 700px breakpoint에서 4열 → 2열 → 1열로 재배치.

## 디자인 회귀검증 추가
`.github/workflows/design-layout-smoke.yml`

검증대상:
- desktop 1440×1000
- mobile 375×812
- 5개 화면 전체
- active tab 일치
- document horizontal overflow 없음
- 업무영역 Area Header 중복 없음
- browser page error 없음

## 업무 로직 보존
- Canonical stores 변경 없음
- 고도화 3조건 분석 변경 없음
- 공식판정 주체 및 상태 변경 없음
- Audit risk random / 6개월 지속관리 변경 없음
- 개선조치 D+7~D+14 정책 의미 변경 없음

## 관련 commits
- `78bd061` — five-area information hierarchy normalization
- `4e42ab4` — design layout smoke workflow
