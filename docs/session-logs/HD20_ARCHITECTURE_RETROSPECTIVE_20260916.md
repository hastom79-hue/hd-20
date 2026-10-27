# HD-20 전체 회고 및 구조개편 기준 — 2026-09-16

## 회고 결론
HD-20은 기능 부족보다 기능의 분산·중복·업무단계 혼재가 더 큰 잔여위험이다. 이후 개발은 기능 추가보다 운영 아키텍처 정리와 Closed Loop 완결성을 우선한다.

## Canonical 정보구조
메인 5개 영역으로 정리한다.

1. 대시보드 — Control Tower. 전체 KPI, 우선조치, 실행·유지 상태, 고도화 Portfolio, 기준·추이, 현장참고를 통합 조회한다.
2. 활동관리 — Source. 현장 5S 활동 등록, Excel Import, 검증, 실적/추이, Evidence의 원천을 관리한다.
3. 고도화·표준화 — Conversion & Standardization. 후보 발굴, 조건/근거 판정, 공식확정, 표준화, 수평전개를 관리한다.
4. 진단·유지 — Verification. Risk 기반 Audit, 판정, 6개월 유지검증, 재발/종료평가를 관리한다.
5. 개선실행 — Action. 활동·고도화·Audit에서 발생한 Gap을 담당/기한/조치/효과검증/재발방지까지 폐쇄한다.

## 대시보드 세부구조
1. 종합현황 — 핵심 KPI와 우선조치
2. 실행·유지 — 팀별 실행, Audit, Action
3. 고도화 맵 — 고도화 Portfolio와 공식확정 Case Drill-down
4. 기준·추이 — 판정기준과 월별 변화
5. 현장참고 — 초기 구축/참고 자료

고도화 맵은 독립 업무 프로세스가 아니므로 메인 메뉴에서 제거하고 대시보드의 Portfolio View로 통합한다.

## Closed Loop
활동 실행 → 고도화 후보/공식판정 → 표준화 → Risk 기반 진단/Audit → Gap 개선실행 → 효과검증/재발확인 → 표준/활동 환류.

대시보드는 위 Cycle을 지휘·모니터링하며 별도의 원천 업무를 생성하지 않는다.

## 탭별 설계 원칙
모든 업무영역은 `INPUT → 판단 → ACTION → EVIDENCE → NEXT`를 명확히 한다.
- 활동관리: 활동/Excel → 검증·추이 → 후보/개선 연결 → Activity Evidence → 고도화 또는 개선실행
- 고도화·표준화: 후보 → 조건/근거 판정 → 공식확정/표준화 → Case Evidence → Audit
- 진단·유지: Risk/표준 → Audit/유지판정 → 부적합/재발 Action → Audit Evidence → 개선실행
- 개선실행: Gap → 담당/기한/조치 → 효과/재발검증 → Before/After Evidence → 표준화/재Audit

## 이후 개발 우선순위
- 1순위: 메인 5영역 + 대시보드 5서브탭 구조를 코드/Deep Link/Smoke 계약 전체에 일치시킨다.
- 2순위: 각 탭의 중복 분석·중복 카드·죽은 버튼·빈 영역을 제거한다.
- 3순위: Case ID/Evidence 기반의 탭 간 왕복 연결을 완성한다.
- 4순위: Excel → Preview → 확정 → DB → KPI/Trend → Evidence → Mail의 실사용 경로를 E2E 검증한다.
- 5순위: 마지막에 레이아웃/밀도/모바일을 정리한다.

## 금지 원칙
- 목표값이 없는데 임의 달성/미달 판정 생성 금지.
- Demo/Test/E2E를 Production KPI에 혼입 금지.
- Preview 단계의 Canonical/DB write 금지.
- 서버 측 forced empty write 금지.
- 동일 기능을 여러 탭에 복제하지 않는다.