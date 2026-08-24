# GMES HDPS 5S 활동관리 웹 구현 아키텍처

## 1. 화면설계 요청서 해석
본 프로토타입은 첨부 화면설계 요청서의 7개 페이지를 아래 구조로 통합하였다.

- HDPS42: 5S 활동 통합 대시보드
  - 월별/부서별 5S 표준화: '전체 개선건수'가 아니라 '인당 개선건수'를 핵심 지표로 표현
  - 월별/부서별 5S Audit 평가 현황
  - 팀별 5S 유형(정리·정돈·청소·시각화관리·자주보전) 문제점 현황
  - 팀별 전월 지적건수 대비 개선완료율
  - 최근 3개월 개선 Raw Data
- HDPS32: 5S 점검항목 기준정보
  - 작업장 특성별 기준정보 유지
  - 신규/개정 및 향후 알림 로직의 기준 화면
- HDPS33: 팀별 5S Audit 실적
  - 전월 점검결과와 당월 개선계획을 분리
  - 조치완료 체크/상태 표시
- HDPS34 + HDPS21: 개선 요청사항 등록/조회
  - 문제점(Before)과 개선결과(After) 사진/텍스트를 한 화면에서 관리
  - 생산팀 전달/메일링 알림 연계 대상

## 2. 권장 Front-end 구조
- `index.html`: 화면 구조 및 모듈별 view
- `styles.css`: Apriso 계열 업무시스템 톤의 공통 레이아웃/반응형 UI
- `app.js`: 화면 전환, 조회/필터, 차트 mock, 표 렌더링, 상태 필터
- 이후 실개발 시 Chart.js/ECharts 또는 사내 표준 차트 컴포넌트로 대체 가능

## 3. 권장 Back-end / API
### 핵심 엔터티
- `5s_standard_item`
  - standard_id, site_id, workcenter_id, category, seq, question, note, use_yn, revision_no
- `5s_audit_header`
  - audit_id, audit_month, site_id, dept_id, team_id, auditor_id, total_score
- `5s_audit_detail`
  - audit_id, standard_id, score, current_issue, previous_result, current_plan, action_complete_yn
- `5s_improvement`
  - improvement_id, audit_id, category, issue_text, action_text, before_image, after_image, action_status, owner_team
- `org_master`
  - plant, workcenter, dept, team hierarchy

### REST API 예시
- GET `/api/5s/dashboard?month=2026-03&site=...`
- GET `/api/5s/standards?workcenter=...&category=...`
- POST `/api/5s/standards`
- GET `/api/5s/audits?month=...&team=...`
- PUT `/api/5s/audits/{auditId}/action`
- POST `/api/5s/improvements`
- PUT `/api/5s/improvements/{id}`
- GET `/api/5s/improvements?from=...&to=...&status=...`

## 4. 요청서 기준 업무 로직
1. 인당 개선건수 = 월별 개선건수 / 해당 조직 인원
2. 개선조치율 = 전월 점검결과 중 문제점 지적건수 대비 완료 건수
3. HDPS33은 단순 '문제점 입력'이 아니라 전월 점검결과 + 당월 개선계획 + 조치완료 여부의 연속 데이터로 관리
4. HDPS34는 개별건수형 긴 목록보다 HDPS21 신규등록형 화면을 차용한 단건 등록/조회 UX가 적합
5. 조직 조회 조건은 작업장/부서/팀을 분리하여 글로벌 조직구조 확장에 대응
6. 개선요청 최초 등록 시 담당 생산팀/반장 알림, 개선 완료 시 5S 모듈리더 회신 알림을 이벤트로 연결 가능

## 5. 권장 상태 흐름
`Draft → 요청등록 → 생산팀 조치중 → 조치완료 → 5S모듈 검증 → Close`

## 6. 개발 단계
- 1단계: 본 정적 Prototype으로 UI/UX 합의
- 2단계: Apriso 공통 Control / 조직 Master / 사용자 Master 매핑
- 3단계: HDPS21·32·33·34 실데이터 API 연동
- 4단계: 알림/메일링, Excel 출력, 권한, 이력관리
- 5단계: 글로벌 공장 확장 및 다국어
