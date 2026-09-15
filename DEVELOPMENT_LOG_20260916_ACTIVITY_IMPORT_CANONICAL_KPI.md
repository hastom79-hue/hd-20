# 2026-09-16 Activity Excel Import Canonical KPI 정합화

## 목적
Excel Import 분석 화면의 인당 활동 수치가 대시보드 공식 KPI와 다른 의미로 표시될 위험을 제거한다.

## 반영
- 당월/전월 비교: `source=excel-import` Production 데이터만 사용하여 Import 추이로 표시.
- 공식 인당 5S 개선활동 KPI: 해당 연도 전체 Production Canonical 활동 / 기준 인원으로 산출.
- 당월 Import/인 수치는 `당월 참고`로 명확히 분리.
- 목표 기준이 없을 때 미달/달성 판정을 생성하지 않는 원칙 유지.
- demo/test/E2E 데이터는 `HD20KPIData.isNonProdRow()` 기준으로 제외.
- 분석 메일 본문에도 같은 정의를 적용.
- 저장/DB 쓰기 로직은 변경하지 않음. 서버 측 강제 빈 값 쓰기 없음.

## 검증 포인트
- `dashboard-kpi-source.js`의 공식 snapshot은 연도별 Production 활동 전체를 numerator로 사용함을 재확인.
- 분석 모듈의 공식 KPI도 동일한 연도/Production Canonical 범위를 사용하도록 정렬.
- Excel Import 월별 증감은 공식 KPI가 아니라 Import 추이로 라벨링.