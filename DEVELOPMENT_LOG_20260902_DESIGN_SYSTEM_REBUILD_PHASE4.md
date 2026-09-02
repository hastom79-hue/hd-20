# HD-20 Design System Rebuild Phase 4 — 2026-09-02

## 목적
통합 대시보드를 단순 카드 나열이 아니라 `운영 건전성 판단 → 5S/고도화 성과 흐름 → 팀별 실행·유지관리 → 기준·추이` 순서로 읽히도록 정보 우선순위를 재구성한다.

## 선행 회귀검증 결과
Phase 3에 새로 추가한 `HD20 design layout smoke`가 Mobile `375×812`의 `③ 고도화·판정` 화면에서 실제 horizontal overflow를 검출했다.

- 실패 Run: Design Layout Smoke #2
- 검출값: `mobile/advancement: horizontal overflow 718>375`
- 원인영역: 통합된 `performanceConversionAnalysis + awWorkplace` 내부 Grid/Table의 최소폭 전파
- 조치: `hd20-five-area.css`에서 advancement container와 내부 panel에 `min-width:0 / max-width:100%`를 적용하고, 모바일에서는 `pcType`을 2열 구조로 재배치하며 상세 Table은 컨테이너 내부 horizontal scroll로 제한했다.
- 관련 commit: `10991ea`

## 통합 대시보드 우선순위 재설계
새 모듈 `dashboard-priority-layout.js`를 추가했다.

### 최상위 운영 KPI 6종
`window.HD20KPIData.operational(snapshot)`의 실제 산식을 그대로 사용한다.

1. 공식 판정 완료율
2. 평균 판정 Lead Time
3. 고도화 수준
4. Audit 후 6개월 유지율
5. Audit 부적합 재발률
6. 기한 내 개선조치 완료율

값이 계산 불가능한 경우 임의값이나 0으로 치환하지 않고 `—`로 표시한다. 목표·등급·임의 색상판정은 추가하지 않았다.

각 KPI의 `관련 화면 →`는 업무 흐름에 따라 기존 5영역으로 연결한다.
- 판정/Lead Time/고도화 수준 → `③ 고도화·판정`
- 6개월 유지율/재발률 → `④ 유지·Audit`
- 기한 내 완료율 → `⑤ 개선조치`

## Dashboard 정보 계층
기존 화면의 데이터를 삭제하지 않고 시각적 우선순위만 재구성했다.

1. `OPERATION HEALTH` — 운영 건전성 KPI 6종
2. `PERFORMANCE FLOW` — 기존 5S 활동·고도화 성과카드
3. `EXECUTION & SUSTAIN` — 팀별 현황 + Audit/Action Summary
4. `STANDARD & TREND` — 3대 판정기준 + 고도화 추이

## 디자인 회귀검증 강화
`.github/workflows/design-layout-smoke.yml`에 Dashboard 계약을 추가했다.

Desktop `1440×1000` / Mobile `375×812` 모두에서:
- 5개 탭 active 상태 확인
- document horizontal overflow 없음
- ②~⑤ 중복 Area Header 없음
- 통합 대시보드 운영 KPI 카드가 정확히 6개인지 확인
- 6개 KPI 명칭이 승인된 명칭과 일치하는지 확인
- pageerror 없음

## 업무 로직 보존
이번 단계에서 변경하지 않은 항목:
- 5S·고도화 Canonical Store
- 생산팀 Master
- 고도화 3개 조건 및 공식판정 분리
- Risk 기반 랜덤 Audit
- Audit 실시일 기준 달력 +6개월 지속관리
- D+7~D+14 개선기한 정책
- 재발 명시필드 판정
- 종료평가 `유지 / 미흡`

## 관련 commits
- `10991ea` — mobile advancement overflow containment
- `1b01f5e` — dashboard operational KPI priority layer
- `7a275b3` — priority module loader 연결
- `7c5eb5f` — dashboard information hierarchy styling
- `3f15963` — Design Layout Smoke에 운영 KPI 6종 계약 추가
