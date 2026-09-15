# DEVELOPMENT LOG — 2026-09-15 — Action Subtab Hard Dedupe

## 목적
⑥ 개선실행의 `개선조치`와 `효과·재발관리`에서 native Action 요약/그리드/기준정보가 다시 노출될 수 있는 잔여 중복을 제거한다.

## 변경
- `action-subtab-dedupe-guard.js`의 역할 분류를 강화
- 효과검증/재발/검증대기/폐쇄루프는 verify 전용
- 개선요청/개선조치/Action Case/기준정보는 manage 전용
- verify 화면에서 native `.amSummary`, `.amGrid`, `.amMaster`, `.amRecentList`, `.amCasesScroll`, 등록폼을 명시적으로 숨김
- manage 화면에서는 `#hd20ActionVerifyStatus`를 명시적으로 숨김

## 보존
Action Case 데이터, Audit ID 연결, 효과판정/재발판정, localStorage/Supabase write 경로 변경 없음. forced empty write 없음.
