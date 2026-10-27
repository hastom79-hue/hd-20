# HD-20 Design System Rebuild Phase 6 — 2026-09-03

## 목적
Canonical Design System 전환 이후 더 이상 메인 화면에서 사용하지 않는 과거 theme / fix / hotfix CSS를 저장소에서도 제거하여, 향후 유지보수자가 퇴역 스타일을 다시 연결하거나 `!important` 경쟁을 재발시키는 위험을 없앤다.

## 삭제한 퇴역 CSS
- `readability-polish.css`
- `dashboard-premium-theme.css`
- `dashboard-contrast-fix.css`
- `title-underline-fix.css`
- `dashboard-balance-hotfix.css`
- `shared-color-theme-final.css`
- `mobile-runtime-restore.css`

위 파일들은 이미 Phase 1에서 `index.html`의 메인 스타일 체인에서 제외되었거나 현재 index에서 참조되지 않는 퇴역 레이어였다. 이번 단계에서는 파일 자체를 삭제했다.

## 유지한 CSS
현재 index에서 실제 사용 중인 `styles.css`, `approved-landing-v2.css`, `hd20-overhaul.css`, `hd20-five-area.css`, `maturity-condition-analysis.css`, `tab-polish.css`, `modal-chrome-unify.css`는 유지한다.

특히 `tab-polish.css`와 `modal-chrome-unify.css`는 아직 실제 화면 계약에 참여하므로 검증 없이 삭제하지 않는다. 다음 단계에서 canonical CSS로 흡수 가능한 selector부터 순차 정리한다.

## 업무 로직 영향
없음. 이번 변경은 퇴역 정적 CSS 파일 삭제만 수행했으며 Canonical Store, KPI 산식, 5S 활동, 고도화 조건/공식판정, Audit, 6개월 지속관리, 개선조치 Deadline 로직을 변경하지 않았다.

## 검증 원칙
삭제 후 기존 Runtime Smoke / Browser Smoke / Nav Scroll Smoke / Design Layout Smoke / Package / Pages 배포를 기준으로 회귀를 확인한다.
