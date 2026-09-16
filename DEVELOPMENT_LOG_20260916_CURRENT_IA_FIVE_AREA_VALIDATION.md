# DEVELOPMENT LOG — Current IA Five-Area Validation

## Date
2026-09-16

## Purpose
현재 운영방향을 독립 6영역이 아니라 5개 메인영역으로 고정하고, 고도화 맵을 대시보드 내부 세부탭으로 검증한다.

## Change
- current-ia smoke의 top nav 기대값을 dashboard/activity/advancement/audit/action 5개로 변경.
- dashboard group 기대값을 summary/execution/maturity/standard/field 5개로 변경.
- maturity는 top-level navigation 대상에서 제거하고 dashboard 내부 apply('maturity')로 검증.
- desktop 1440x1000 / mobile 390x844 검증 계약 유지.
- 기존 dashboard summary/execution/standard/field 격리, 404, pageerror, horizontal overflow 검증 유지.

## Safety
- 운영 데이터 write 로직 변경 없음.
- Supabase sync 변경 없음.
- forced empty write 없음.

## Validation status
Workflow 계약은 최신 5영역 IA와 정렬했다. GitHub Actions 실행 결과는 별도로 확인하며 runner가 step에 진입하지 않은 실패는 애플리케이션 assertion 실패로 간주하지 않는다.
