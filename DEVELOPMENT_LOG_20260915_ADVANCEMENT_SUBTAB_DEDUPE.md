# DEVELOPMENT LOG — 2026-09-15 — Advancement Subtab Deduplication

## 목적
③ 고도화·표준화의 `후보·판정`과 `확정·수평전개`가 동일 성과전환 화면을 반복 노출하던 구조를 역할 기준으로 분리한다.

## 변경
- `advancement-subtab-dedupe-guard.js` 추가
- `후보·판정`: 기존 후보/조건/판정 흐름 유지
- `확정·수평전개`: 공식확정·현재유지 단계만 표시
- 확정 화면에서 후보/판정용 팀별 전환현황과 3대조건 패널 숨김
- 안내문을 공식확정 사례의 표준화·유지·수평전개 역할로 전환

## 보존
- 공식확정 기준은 기존 canonical source를 변경하지 않음
- Activity ID, maturity map, Audit 연결 로직 변경 없음
- localStorage/Supabase write 변경 없음
- forced empty write 없음

## 캐시
- child: `advancement-subtab-dedupe-guard.js?v=20260915-1`
- parent: `final-layout-polish.js?v=20260915-advancement-dedupe-14`
