# HD-20 통합 운영지표 중복/제목·건수 불일치 재수정 (2026-10-27)

## 재발 원인
- 기존 `dashboard-work-kpi-migration.js`는 대시보드의 `#hd20DashboardPriority` **바깥**에 지표 패널을 계속 재삽입하고, 표시 제어는 CSS body class와 tab targets에 의존함. 상단 세부탭 및 후속 렌더링과 충돌할 수 있음.
- KPI 표시값은 `HD20_OPS_V2.metrics()`, 상세근거는 `HD20_KPI_EVIDENCE.evidence()`를 사용하여 데이터 원천 및 타이틀이 불일치. `metrics()`는 필터·패리티 가드에 의해 런타임에서 여러 차례 덮어써짐.
- 특히 Audit 관리중 등 카드 제목과 상세근거 제목이 다름.

## 수정
1. KPI 패널 `#hd20DashboardWorkMetrics`를 **`#hd20DashboardPriority`의 직계 자식**으로 이동. Summary-only target 자체가 숨겨지면 KPI도 물리적으로 함께 숨김. priority 재렌더로 노드가 사라지면 MutationObserver가 복구.
2. `dashboard-section-tabs.js`에서 KPI 패널 독립 target 제거. summary target `#hd20DashboardPriority` 단일 소유. 탭 전환 이벤트 추가.
3. `dashboard-work-kpi-migration.js` 카드 12개는 `HD20_KPI_EVIDENCE.evidence(area,sub,index)`의 `title`과 `rows.length`에서 직접 생성. 상세근거와 제목·건수 1:1 계약 검증. 기존 `metrics()` 폴백 제거.
4. Audit/Action/Advancement 상단 구형 `#hd20OpsMetrics` 표시 방지 CSS 추가. 해당 화면에서의 구형 KPI 제거 코드는 `hd20-ops-v2.js`에 이미 존재.
5. index.html, 동적 로더 cache bust. Playwright smoke test에 물리적 부모 검증, 12개 제목·건수 근거 일치, 세부탭 간 비노출, 세 개 상위 업무 탭 비노출 추가.

## 테스트/상태
- 소스 파일 JS syntax 확인 PASS.
- JS fixture를 사용해 Audit 3세부탭, Action 3세부탭, Advancement 2세부탭의 **총 32개 KPI** 제목·건수가 evidence 결과와 일치함을 직접 확인 PASS.
- dashboard KPI의 물리적 summary-only 소유 구조 및 최신 script/css version 정적 확인 PASS.
- 실제 Pages 브라우저의 클릭·새로고침 및 GitHub Actions E2E 결과는 아직 미확인. 배포 성공으로 과장하지 않음.

## 데이터 보호
- 로컬 저장소/운영 DB/팀 마스터/원천 Audit·Action·Activity 데이터 수정 없음.
- 근거 데이터는 비운영 DEMO/E2E 레코드를 제외하는 기존 evidence 규칙 유지. 기존 임의 수치를 KPI에 대입하지 않음.
