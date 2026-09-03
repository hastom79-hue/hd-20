# HD-20 Workflow Area Density Refinement — 2026-09-03

## 목적
② 5S 활동부터 ⑤ 개선조치까지의 업무화면에서 Header, Workflow, 입력, 상태 KPI, 상세 Table이 모두 비슷한 시각강도로 보이던 문제를 개선한다.

## 변경
- `workflow-area-density.css` 추가
  - 업무로직/데이터/산식은 변경하지 않는 presentation-only layer다.
  - Workflow step에 번호 인지성을 강화하고 높이를 축소했다.
  - ② 5S 활동은 입력 Form보다 실적/이력 영역이 넓게 보이도록 0.78 : 1.22 구조로 재조정했다.
  - Desktop에서 활동 등록 Form은 화면을 따라가도록 sticky 처리하고 1100px 이하에서는 자동 해제한다.
  - 고도화·판정의 후보/판정 Table과 운영상태는 1.45 : 0.55 비율로 정리했다.
  - Audit/Action은 각 업무색을 Header/Workflow 상단 accent에만 사용한다.
  - KPI/상태카드 높이, Form 간격, Table header/padding을 축소하여 화면 밀도를 높였다.
  - Tablet/Mobile에서는 모든 주요 split을 1열로 전환하고 Table은 내부 가로스크롤로 보호한다.
- `index.html`
  - canonical five-area/dashboard CSS 이후 `workflow-area-density.css`를 활성화했다.

## 회귀검증
밀도 개선 반영 HEAD `dcad24c` 대상으로 GitHub Actions 7개가 생성되었고, failure 상태 workflow 조회 결과는 0건이었다. 확인된 Package 및 Runtime Smoke도 success였다.

## 추가 안정화
검증 후 Table/입력 UI를 한 단계 더 안정화했다.
- Table을 포함한 `.awBody`에 독립 가로스크롤을 항상 제공하여 넓은 열이 전체 페이지 폭을 밀지 않도록 했다.
- Table 최소폭을 유지하면서 셀 문자열은 `overflow-wrap:anywhere`로 보호했다.
- 5S 활동 등록 카드의 기존 inline 정렬 wrapper는 별도 JS 수정 없이 CSS에서 flex action row로 정상화했다.
- 최근 직접등록 목록은 일자와 제목이 겹치지 않도록 ellipsis/고정 날짜열 구조로 보완했다.
- 신규 business rule, threshold, target은 추가하지 않았다.

## 유지한 업무기준
- 5S 유형 6종 그대로 유지
- 고도화 3대 조건 및 공식판정 분리 유지
- Audit 실제 실시일 + 달력 6개월 지속관리 유지
- 개선조치 D+7~14 정책 설정 방식 유지
- 임의 Threshold/Risk/목표 추가 없음

## Commit
- `25a0d63` — workflow area density stylesheet
- `e3d6041` — index activation
- `cf8818a` — Table overflow / activity action row / recent list 안정화
