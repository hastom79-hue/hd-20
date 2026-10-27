# 코딩일지 — 2026-10-17
- 파일 `dashboard-priority-layout.js`.
- `window.HD20KPIData?.monthlyOperational?.(6)` → `(12)`.
- 공통 데이터 소스는 이미 12개월 요청 시 당해연도 01~12월을 생성하도록 구현되어 있음.
- 미해결: browser smoke의 구형 DOM 기대치, current IA의 bridge 표시 불일치, subtab operating-master 중복, design stylesheet 계약. 수정 전후 화면 검증 미완료.
