# HD-20 Development Log — Canonical Dashboard Cleanup

Date: 2026-09-03

## 목적
전면개편 과정에서 이미 active runtime에서 제외된 구형 승인형 대시보드(`approved-landing-v2`)가 저장소에 남아 있어, 향후 재참조·회귀·스타일 충돌 가능성을 제거한다.

## 확인 결과
- 최신 Browser Smoke가 구형 `.hd20ApprovedLanding`을 여전히 필수로 기다리고 있어 canonical dashboard 전환 이후 실패했다.
- 현재 메인 대시보드의 canonical 구조는 `#hd20DashboardPriority` + `.cards` + `#hd20OperationalBridge`이며, 운영 KPI는 `.hd20HealthKpi` 6종이다.
- `index.html`은 이미 `approved-landing-v2.js/css`를 참조하지 않는다.
- Repository search에서 `approved-landing-v2`의 남은 참조는 개발일지/README/회귀검증의 금지목록 등 기록성 참조였고 active runtime 의존은 확인되지 않았다.

## 반영 내용
1. `.github/workflows/browser-smoke.yml`을 canonical dashboard 계약으로 수정
   - `#hd20DashboardPriority` 1개
   - `.hd20HealthKpi` 6개
   - `.cards .kpi` 5개
   - `#hd20OperationalBridge` 존재
   - `.hd20ApprovedLanding` 0개
2. 퇴역 파일 삭제
   - `approved-landing-v2.js`
   - `approved-landing-v2.css`

## 업무 로직 영향
없음. 5S/고도화/Audit/개선조치 데이터 저장소, 공식판정, 6개월 Audit 유지관리, 개선조치 기한 정책 및 KPI 산식은 변경하지 않았다.

## 관련 커밋
- `929e521` test: align browser smoke with canonical dashboard
- `2b6b8fe` refactor: remove retired duplicate dashboard runtime
- `c4ee993` refactor: remove retired duplicate dashboard stylesheet

## 후속
새 HEAD 기준 Browser/Runtime/Nav/Design Layout/Dashboard Canonical/Package/Pages 회귀검증을 확인한다. 이후 단일 대시보드의 시각적 우선순위와 ②~⑤ 업무화면 밀도 조정을 계속 진행한다.
