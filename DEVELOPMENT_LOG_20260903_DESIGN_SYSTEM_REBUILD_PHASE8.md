# HD-20 Design System Rebuild — Phase 8

## 목적
Canonical Design System 정리 중 화면 밀도와 반응형 규칙을 추가로 흡수하기 전에, 실제 레이아웃 회귀를 자동으로 차단하는 계약을 먼저 강화한다. 비즈니스 데이터·판정·Audit·개선조치 산식은 변경하지 않는다.

## 변경
`.github/workflows/design-layout-smoke.yml`의 검증 범위를 강화했다.

- Desktop 1440×1000
- 125% 배율 상당 1152×800
- Tablet 900×900
- Mobile 375×812
- 5개 Navigation 버튼 수 = 정확히 5
- 각 탭 전환 후 `scrollY` 상단 유지
- 전체 document horizontal overflow 금지
- Navigation / Area Header / Hero / Card / Dashboard 핵심영역 bounding-box가 viewport 밖으로 이탈하지 않는지 검사
- ②~⑤ Area Header 정확히 1개
- Dashboard 운영 KPI 정확히 6종 및 승인 명칭 유지
- Dashboard 전용 Priority/Bridge UI가 ②~⑤로 유출되지 않는지 검사
- 각 업무영역 핵심 레이아웃 존재 확인
- pageerror 금지

## 설계 원칙
이번 단계는 새 CSS overlay를 추가하지 않는다. `dashboard-priority-groups.css`, `workflow-area-density.css`의 실제 표현 규칙을 canonical CSS로 흡수할 때 시각 회귀를 잡기 위한 안전망을 먼저 만든 것이다.

## 다음 단계
1. `dashboard-priority-groups.css`의 Dashboard 전용 정보계층 규칙을 canonical dashboard component로 흡수
2. `workflow-area-density.css`의 공통 `.awScreen/.awCard/.awForm/.awTable` 규칙과 업무영역 전용 규칙을 분리
3. 공통 규칙은 `hd20-five-area.css`, 화면 전용 규칙은 해당 area contract로 이동
4. 중복 selector와 불필요한 `!important`를 줄인 뒤 본 smoke와 기존 Runtime/Browser/Nav smoke를 함께 통과시킨다.
