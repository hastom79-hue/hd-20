# HD-20 Development Log — Top Navigation Scroll Fix

Date: 2026-09-02

## 사용자 제보
상단 5개 화면 탭을 선택할 때 새 화면이 화면 상단에서 시작하지 않고, 기존 스크롤 위치 또는 동적 화면의 포커스 위치를 따라 내려가 보이는 현상이 보고되었다.

대상 탭:
1. 통합 대시보드
2. 5S 활동
3. 고도화·판정
4. 유지·Audit
5. 개선조치

## 원인 점검
- 활성 코드 전수검색에서 `scrollIntoView`를 이용해 의도적으로 화면을 내리는 코드는 확인되지 않았다.
- `activity-workflow.js`는 각 운영화면을 동적으로 생성한다.
- `hd20-five-area-integration.js`는 고도화 화면을 동적으로 통합하고 여러 이벤트에서 재렌더링한다.
- 일부 화면 내부에는 사용자 동작에 따른 정상적인 `focus()`가 존재한다. 예: 5S 신규등록 버튼을 누르면 문제점 입력칸에 포커스한다. 이 동작은 탭 전환 오류의 원인으로 보지 않고 유지했다.
- 따라서 탭 전환 직후 브라우저가 이전 스크롤 위치, 활성 입력요소, URL hash, 동적 DOM 갱신 후의 포커스 위치를 기준으로 viewport를 다시 보정하는 문제를 공통 레이어에서 차단하는 방식으로 수정했다.

## 수정 내용
### 1. `nav-scroll-stability.js` 신규 추가
상단 `.beginnerNav button[data-key]` 클릭을 capture 단계에서 감지한다.

탭 전환 시 다음을 수행한다.
- 기존 활성 입력요소 blur
- 남아 있는 URL hash 제거
- `window.scrollTo(0, 0)`
- `document.documentElement.scrollTop = 0`
- `document.body.scrollTop = 0`
- 동적 화면 렌더링이 직후 다시 viewport를 이동시키는 경우를 차단하기 위해 즉시 / double requestAnimationFrame / 40ms / 140ms / 320ms 시점에 짧게 상단 위치를 재확인
- 탭 전환 동안 `scroll-behavior:auto`를 적용해 부드러운 스크롤 애니메이션 때문에 화면이 끌려 내려가는 것처럼 보이지 않도록 처리
- `history.scrollRestoration='manual'` 적용

업무 로직, 화면 데이터, Audit/개선조치 Store, 공식판정 로직은 변경하지 않았다.

### 2. `final-layout-polish.js` 연결
메인 대형 `index.html`을 직접 수정하지 않고 기존 후단 통합 로더에서 `nav-scroll-stability.js`를 로드하도록 연결했다.

### 3. 전용 Browser 회귀검증 추가
`.github/workflows/nav-scroll-smoke.yml`을 신규 추가했다.

5개 탭 각각에 대해 두 상황을 실제 Chromium에서 검증한다.
- 화면 상단에서 탭 선택 후 최종 `window.scrollY === 0`
- 페이지를 아래로 내린 상태에서 다른 화면 탭 선택 후 최종 `window.scrollY === 0`

Playwright가 클릭 대상 버튼으로 자동 스크롤하는 영향을 제거하기 위해 테스트에서는 DOM의 `button.click()`을 직접 호출하여 실제 탭 전환 로직 자체를 검증한다.

## 관련 Commit
- `edb0632f359574cbd8252b8b26c97db7c52ae3b2` — `nav-scroll-stability.js` 추가
- `fd1c589fba19366e83d3adaed4145b570bb48403` — `final-layout-polish.js`에 로더 연결
- `99c79c7cfcfd069774044ada2ab4785a6a044ee0` — Nav Scroll 전용 회귀검증 Workflow 추가

## 자동검증 결과 — Commit `99c79c7cfcfd069774044ada2ab4785a6a044ee0`
- Runtime Smoke #292: **success**
- Browser Smoke #235: **success**
- Nav Scroll Smoke #1: **success**
- Package HD20 source #496: **success**
- Pages build and deployment #687: **success**

## 결론
상단 5개 화면 탭은 이제 이전 화면의 스크롤 위치를 승계하지 않는다. 화면이 내려간 상태에서 탭을 전환해도 새 화면은 페이지 상단에서 표시되며, 동적 모듈의 후속 렌더링이 viewport를 다시 아래로 이동시키는 경우도 짧은 안정화 구간에서 차단한다.

이 동작은 전용 Chromium 회귀검증으로 고정했으므로 이후 변경에서 다시 `scrollY`가 남으면 CI가 실패하도록 관리한다.
