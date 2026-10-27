# HD-20 Dashboard Priority Grouping — 2026-09-03

## 목적
Canonical Dashboard 정리 이후 운영 KPI 6종이 동일한 카드 6개로 나열되어 업무 맥락과 다음 행동이 약하게 보이는 문제를 보완했다.

## 변경
- `dashboard-priority-layout.js`
  - 운영 KPI 6종의 산식/Source/라벨은 변경하지 않았다.
  - 업무영역 기준으로 3개 그룹으로 재배치했다.
    - STEP 03 고도화·판정: 공식 판정 완료율 / 평균 판정 Lead Time / 고도화 수준
    - STEP 04 유지·Audit: Audit 후 6개월 유지율 / Audit 부적합 재발률
    - STEP 05 개선조치: 기한 내 개선조치 완료율
  - 각 그룹 Header에서 해당 업무화면으로 직접 이동하도록 했다.
  - 상단 읽기 흐름을 `현재 상태 → 판단 → 다음 행동`으로 명시했다.
  - 임의 목표, 경고 Threshold, Risk 등급은 추가하지 않았다.
- `dashboard-priority-groups.css`
  - 기존 Design System 위에 업무그룹 레이아웃만 담당하는 소형 specialization layer를 추가했다.
  - Desktop은 3개 업무영역의 중요도/지표수를 반영한 비대칭 grid, Tablet/Mobile은 단일 흐름으로 전환한다.
  - 판정/Audit/개선조치를 얇은 상단 accent로 구분하며 KPI 값 자체에 임의 위험색을 부여하지 않는다.
- `index.html`
  - 위 specialization stylesheet를 canonical five-area CSS 다음에 로드한다.

## Dashboard 균형 재조정
Header/Navigation 공통 스케일 정규화 후 ① 통합 대시보드 본체도 같은 밀도 기준으로 재조정했다.
- 운영 KPI 그룹 비율을 `고도화·판정 > 유지·Audit > 개선조치` 순으로 실제 지표 수에 맞춰 조정했다.
- 그룹 Header 높이를 88px에서 72px 수준으로 낮추고 KPI 최소높이도 축소해 첫 화면에서 운영상태가 과도하게 세로로 늘어나지 않도록 했다.
- 성과 보조 KPI 5종은 높이·아이콘·값 크기를 한 단계 축소해 운영 KPI보다 시각 우선순위가 높아지지 않도록 했다.
- 메인 차트 : 우측 Summary 비율을 재조정해 팀별 실행/고도화 현황을 더 넓게 확보했다.
- 우측 `Audit 후 6개월 지속관리 / Action Summary`는 card head/body와 row 높이를 압축해 보조 정보 성격을 명확히 했다.
- 하단 `3대 판정기준 / 고도화 추이` 비율과 카드 높이를 조정해 Dashboard 전체의 좌우 균형을 개선했다.
- 1100px 이하에서는 메인/하단 영역을 1열로 전환하고 우측 Summary는 2열로 병렬 배치하며, Mobile에서는 다시 1열로 전환한다.
- Dashboard 데이터, KPI 산식, 카드 라벨, 대상 업무영역 이동 로직은 변경하지 않았다.

## 회귀 원칙
- 운영 KPI는 기존 6종 그대로 유지한다.
- `HD20KPIData.operational()`을 단일 Source로 유지한다.
- 고정 M+1/M+3/M+6 표현을 추가하지 않는다.
- 개선조치 자동기한 정책을 임의 생성하지 않는다.
- 공식 판정과 3개 조건 충족수는 혼합하지 않는다.

## 직전 검증
직전 Header/Navigation 정규화 HEAD `5068a62`에서 Package Source와 Runtime Smoke가 success로 확인됐다.

## 이번 단계 Commit
- `4a91327` — 운영 KPI 업무영역 그룹화
- `7529e30` — 그룹형 Dashboard layout CSS 추가
- `667f05b` — index에서 그룹형 layout 활성화
- `4e53935` — Dashboard KPI/차트/Summary/하단영역 시각 균형 재조정
