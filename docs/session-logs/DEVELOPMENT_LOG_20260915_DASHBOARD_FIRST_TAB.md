# HD-20 개발일지 — 대시보드 첫 탭 정리

일자: 2026-09-15

## 사용자 요구
상단 우측의 별도 `HDPS 대시보드 →` 페이지 전환 구조를 제거하고, 대시보드를 메인 6영역의 가장 첫 번째 탭으로 단순화한다.

## 반영
- `index.html` 상단의 `HDPS 대시보드 →` 별도 링크 제거.
- `beginner-navigation.js` 첫 영역명을 `① 통합현황`에서 `① 대시보드`로 변경.
- 별도 딥링크가 없을 때 초기 진입은 명시적으로 `dashboard`를 연다.
- 기존 dashboard/activity/advancement/maturitymap/audit/action 6영역 key 계약은 유지한다.
- HDPS 별도 페이지로 왕복 전환해야 하는 UX를 메인 헤더에서 제거한다.
- 이전 HD-22 배경 수정 캐시가 즉시 반영되도록 `hd20-overhaul.css` 버전도 갱신했다.

## 불변조건
- 운영 데이터 저장 로직 변경 없음.
- Supabase 동기화 변경 없음.
- 서버 강제 empty write 추가 없음.
