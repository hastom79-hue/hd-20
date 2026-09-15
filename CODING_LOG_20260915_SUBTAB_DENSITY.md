# CODING LOG — 2026-09-15 — Subtab Density / Empty-space Cleanup

## 파일
- `hd20-subtabs.css`
- `index.html`

## 핵심 수정
기존 `.awScreen[data-subview]{min-height:280px}`가 서브탭 dedupe 후 콘텐츠가 적은 화면에도 280px 빈 영역을 강제했다. 이를 `min-height:0`으로 변경했다.

목적 패널/logic/chip/action/hero/empty grid의 vertical spacing을 축소하여 PC에서 불필요한 스크롤을 줄이고 모바일은 별도 compact padding을 적용했다.

## 비회귀
- `.hd20SubHidden{display:none!important}` 유지
- Grid modal table minimum width/overflow 계약 유지
- business rule / exact ID trace / write path 변경 없음

## 캐시
`index.html` → `hd20-subtabs.css?v=20260915-density-2`
