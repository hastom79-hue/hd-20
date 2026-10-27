# DEVELOPMENT LOG — Maturity Map Field Portfolio

## 목적
고도화 맵의 빈 화면을 보완하고 울산 생산공정 맥락의 초기 Portfolio를 제공한다.

## 사용자 우선순위
- 휠로더 조립라인: 최상위
- 대형굴착기 조립라인: 최상위
- 제관라인: 최상위
- 중형굴착기 조립/도장/조립물류: 상대적으로 낮게 구성

## 구현
`hd20-maturity-map-showcase.js`를 추가하여 고도화 맵 내부에 현장형 Portfolio를 표시한다. 최상위 3개 라인은 94/91/88의 시각적 우선순위 점수로 구성하고 실제 현장형 고도화 주제를 함께 표시한다.

## 데이터 안전 원칙
이 초기 Portfolio는 실제 공식판정 실적이 아니다. `HD20KPIData`, `hd20GMES5SAutoImproveRawV1`, Supabase 운영 데이터에는 쓰지 않는다. 따라서 기존 공식확정/유지 KPI와 데이터 무결성 규칙을 오염시키지 않는다.
