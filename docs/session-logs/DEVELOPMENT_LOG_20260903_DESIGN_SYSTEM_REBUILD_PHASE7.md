# HD-20 Design System Rebuild — Phase 7

Date: 2026-09-03

## 목적
메인 화면의 canonical Design System 전환 이후 더 이상 실제 `index.html`에서 로드되지 않는 보조 스타일시트를 저장소에서도 정리하여, 과거 selector override가 다시 연결되거나 유지보수 시 표현 소유권이 분산되는 위험을 줄인다.

## 실제 확인
현재 `index.html`의 메인 stylesheet chain은 다음과 같다.

1. `styles.css`
2. `hd20-overhaul.css`
3. `hd20-five-area.css`
4. `dashboard-priority-groups.css`
5. `workflow-area-density.css`
6. `maturity-condition-analysis.css`

`tab-polish.css`와 `modal-chrome-unify.css`는 더 이상 이 chain에 참여하지 않는다.

## 삭제
### `tab-polish.css`
과거 역할:
- `awSplit` 우측 카드 sticky 보정
- form focus 강조
- primary button hover 보정

현재 대응:
- 업무영역 layout / form / button 표현은 `hd20-overhaul.css`, `hd20-five-area.css`, `workflow-area-density.css`가 담당한다.
- 따라서 별도 polish layer를 유지할 이유가 없다.

### `modal-chrome-unify.css`
과거 역할:
- 여러 modal별 서로 다른 header / radius / close button을 높은 specificity + `!important`로 강제 통일

현재 대응:
- modal 기본 contract는 `hd20-overhaul.css`로 이전되었고, runtime 대형 visual style injection도 제거된 상태다.
- 기존 파일의 목적이었던 load-order 경쟁 회피 구조 자체를 더 이상 유지하지 않는다.

## 업무 로직 영향
없음.

이번 단계는 stylesheet repository cleanup만 수행했으며 다음 항목은 변경하지 않았다.
- Canonical Stores
- 5S 활동 등록
- 고도화 3조건/공식판정 분리
- Audit random / 6개월 지속관리
- 개선조치 Deadline / 효과검증 / 재발관리
- Dashboard KPI 산식
- Navigation 동작

## 다음 단계
실제로 로딩 중인 보조 stylesheet만 대상으로 표현 소유권을 더 줄인다.

우선순위:
1. `dashboard-priority-groups.css`의 Dashboard 전용 group 규칙을 `hd20-five-area.css`의 Dashboard contract와 정리
2. `workflow-area-density.css`의 ②~⑤ 화면별 밀도 규칙 중 공통 규칙을 canonical component로 흡수
3. `hd20-overhaul.css` ↔ `hd20-five-area.css` 중복 selector와 `!important` 축소
4. Desktop/Mobile modal bounding-box 검증 강화
5. ②~⑤ 화면별 판단 순서가 `무엇을 봄 → 무엇을 판단 → 다음 행동`으로 읽히는지 정보계층 재검증
