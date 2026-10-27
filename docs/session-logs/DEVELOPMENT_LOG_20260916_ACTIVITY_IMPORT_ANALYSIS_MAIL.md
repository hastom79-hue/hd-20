# HD-20 Development Log — 2026-09-16 Activity Import Analysis + Mail Preview

## 목적
확정 반영된 월별 5S 운영실적 Excel 데이터를 웹에서 즉시 분석하고, 팀별 결과를 메일 본문으로 검토할 수 있는 다음 단계 파이프라인을 연결한다.

## 반영
- `hd20GMES5SAutoImproveRawV1` 중 production 데이터이며 `source=excel-import`인 확정 반영 건만 분석한다.
- 최신 Import 월 / 직전 Import 월을 자동 식별한다.
- 당월 건수, 전월 건수, 증감, 활동팀 수, 전월 대비 감소팀 수를 자동 계산한다.
- 팀별 당월/전월/증감 테이블을 표시한다.
- 목표 기준이 없는 경우 임의로 '미달' 판정을 만들지 않는다.
- 팀장 기준정보 `hd20TeamLeaderMasterV1`의 실제 이메일이 있는 대상만 메일 수신자 선택 목록에 표시한다.
- 분석 메일 본문을 Preview한 뒤 수신자를 선택해야 기본 메일 작성 화면을 열 수 있다.
- 자동 발송은 하지 않는다. 실제 발송은 사용자 메일 앱에서 최종 확인한다.
- Excel 확정 Import 이벤트와 팀장 기준정보 변경 이벤트에 분석 화면을 재계산한다.

## 안전성
- 분석 모듈은 운영실적/기준정보를 쓰지 않는다.
- Demo/E2E 데이터는 `HD20KPIData.isNonProdRow` 기준으로 제외한다.
- 목표 미설정 상태에서 임의 목표/미달을 생성하지 않는다.
- 서버 강제 empty write 없음.

## 다음
실제 목표/인원 기준정보가 존재하는 경우에만 인당 KPI 및 목표 Gap을 결합하고, Evidence ID 기반 상세 근거를 메일 Preview에 연결한다.