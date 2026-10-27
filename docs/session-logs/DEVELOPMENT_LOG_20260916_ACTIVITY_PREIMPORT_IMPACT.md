# 2026-09-16 Activity Excel Pre-Import Impact Preview

## 목적
Excel 파일 검증 직후, 운영실적에 저장하기 전에 예상 KPI 영향과 팀별 추가 건수를 확인할 수 있도록 한다.

## 반영
- `activity-excel-preview-import.js`가 검증 성공 시 `hd20-activity-import-preview` 이벤트를 발행한다.
- 오류/중복이 1건이라도 있으면 예상분석 데이터는 전달하지 않고 확정 반영도 기존대로 차단한다.
- 취소/오류/확정 반영 시 Preview 상태를 즉시 비운다.
- `activity-import-analysis-mail-preview.js`는 Preview rows를 메모리에서만 받아 기존 Production Canonical 데이터와 가상 병합하여 영향도를 계산한다.
- 표시 항목: 추가 예정 건수, 대상월, 생산팀 수, 해당연도 활동 건수 Before→After, Canonical 인당 KPI Before→After, 팀별 추가 예정 건수.
- 화면에 `예상 분석 · 아직 저장되지 않음` 및 `운영데이터·Supabase에는 아직 기록되지 않았습니다`를 명시한다.
- 목표값이 확인되지 않으면 미달/달성 판정을 생성하지 않는다.

## 안전성
Preview 단계에서는 localStorage/Supabase write가 없다. 기존 Confirm 이후 Canonical Store 기록 경계는 유지하며 서버 측 forced empty write를 추가하지 않았다.