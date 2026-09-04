# HD-20 Design System Rebuild — Phase 15
Date: 2026-09-04

## 목적
Phase 14 이후 남아 있던 runtime presentation 주입을 제거하고, KPI 상세 Modal 표현이 승인된 KPI 명칭과 운영정책 문구를 정확히 사용하도록 정리한다.

## 변경 1 — health-grid runtime CSS 제거
`health-grid-practical-final.js`가 `document.createElement('style')`로 Modal/표 시각규칙을 런타임에 생성하던 경로를 제거했다.

기존 runtime style은 다음 표현을 직접 소유하고 있었다.
- `.hd20DecisionNote`
- `.kpiModal table`, `.modal table`
- Modal table header/body 일부 시각규칙

이번 단계에서는 별도 runtime CSS를 만들지 않고, KPI 상세 설명 element가 기존 canonical `.awHint` 표현을 재사용하도록 변경했다. Modal과 table의 기본 표현은 정적 Design System CSS가 담당한다.

## 변경 2 — KPI 명칭 교정
`health-grid-practical-final.js`의 KPI 매핑에서 `6개월 유지율`을 승인된 정확한 명칭인 `Audit 후 6개월 유지율`로 변경했다.

Dashboard의 승인 KPI 6종은 계속 다음과 같다.
1. 공식 판정 완료율
2. 평균 판정 Lead Time
3. 고도화 수준
4. Audit 후 6개월 유지율
5. Audit 부적합 재발률
6. 기한 내 개선조치 완료율

## 변경 3 — 개선조치 기한 설명 정책화
`기한 내 개선조치 완료율` 상세 설명에서 특정 일수가 화면설명에 고정된 정책처럼 보이지 않도록 다음 의미로 정리했다.

`등록일 기준 운영정책으로 자동 지정된 완료기한 안에 Close한 비율`

등록일 기준 7~14일이라는 승인 범위 자체는 유지하지만, 실제 자동 지정일수는 운영정책 설정값이 결정한다는 기존 기준을 따른다.

## Runtime style 현황
Repository code search 기준 visual `createElement('style')` 경로는 이번 변경으로 제거되었다. 남은 `nav-scroll-stability.js`의 1줄 style은 탭 전환 중 scroll restoration을 막는 functional rule이다.

`html.hd20-nav-switching{scroll-behavior:auto!important}`

이는 테마나 컴포넌트 디자인을 결정하는 presentation layer가 아니다.

## 업무 로직 영향
없음.

- 5S 6개 유형
- 고도화 3조건
- 공식판정 분리
- 라인 비추론 원칙
- Risk 가중 랜덤 Audit
- 실제 Audit 실시일부터 달력 기준 +6개월 지속관리
- 개선조치 등록일 기준 7~14일 정책 범위
- canonical stores 및 KPI 산식

위 기준은 변경하지 않았다.

## 다음 단계
최신 Actions 결과를 확인한 뒤 `workflow-area-density.css`에 남은 area-specific 표현을 `hd20-five-area.css`로 실제 흡수한다. Design Layout Smoke가 병합 상태를 통과한 뒤에만 `index.html`의 link를 제거하고 파일을 물리삭제한다.
