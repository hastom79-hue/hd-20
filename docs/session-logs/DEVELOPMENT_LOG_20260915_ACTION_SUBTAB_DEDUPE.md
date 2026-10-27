# DEVELOPMENT LOG — 2026-09-15 — Action Subtab Deduplication

## 목적
⑥ 개선실행의 `개선조치`와 `효과·재발관리`가 동일 Action 운영 UI를 중복 노출하지 않도록 역할을 분리한다.

## 변경
- `action-subtab-dedupe-guard.js` 추가
- 개선조치: Action 등록/배정/기한/완료 및 생산팀장 기준정보 중심
- 효과·재발관리: 완료 Action의 효과검증/검증대기/재발 상태 중심
- `#hd20ActionVerifyStatus`는 verify에서만 노출
- Action/Audit/refresh 이벤트 후 현재 서브탭 역할 재적용

## 보존
- `hd20ActionCasesV2` 데이터 구조 변경 없음
- Audit ID ↔ Action source exact key 변경 없음
- Action ID 무결성, 기한경과, 효과검증, 재발 tri-state 로직 변경 없음
- localStorage/Supabase write 변경 없음
- forced empty write 없음

## 캐시
- child: `action-subtab-dedupe-guard.js?v=20260915-1`
- parent: `final-layout-polish.js?v=20260915-action-subtab-dedupe-16`
