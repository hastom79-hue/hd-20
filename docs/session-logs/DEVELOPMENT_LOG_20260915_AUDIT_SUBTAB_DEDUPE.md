# DEVELOPMENT LOG — 2026-09-15 — Audit Subtab Deduplication

## 목적
⑤ 진단·유지 내부의 `Audit 관리`와 `유지관리`가 같은 실행/유지 UI를 동시에 노출하는 문제를 역할 기준으로 분리한다.

## 변경
- `audit-subtab-dedupe-guard.js` 추가
- `Audit 관리`: Risk 대상추출, Audit 실시/체크리스트/실시결과 중심
- `유지관리`: Lifecycle 요약, 6개월 관리, 종료평가 중심
- `awAuditLane`은 유지관리에서만 표시
- 동적 Audit 모듈이 갱신되어도 현재 서브탭 역할을 재적용

## 보존
- Audit ID 및 Action 정확 연계 변경 없음
- Audit 실시일 D-Day / 달력 기준 +6개월 규칙 변경 없음
- 종료평가 및 재발확인 규칙 변경 없음
- localStorage/Supabase write 변경 없음
- forced empty write 없음

## 캐시
- child: `audit-subtab-dedupe-guard.js?v=20260915-1`
- parent: `final-layout-polish.js?v=20260915-audit-subtab-dedupe-15`
