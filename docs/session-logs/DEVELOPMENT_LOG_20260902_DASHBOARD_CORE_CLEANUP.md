# HD-20 개발일지 — 메인 Dashboard Core Canonical 정리

일자: 2026-09-02
대상: `main`

## 1. 발견사항
Demo/Seed 및 Audit Legacy 퇴역 후 메인 `app.js`를 재점검했다.

실행 코드에 다음 Prototype 잔재가 남아 있었다.

- `ensureFailSafeNav()`가 정적 Navigation이 없을 경우 과거 7개 메뉴를 재생성.
- 복구 메뉴 안에 `1·3·6개월 점검`과 `⑦ 기준정보` 등 폐기된 IA/Lifecycle 문구 존재.
- 분기별 인당 목표가 `Q1=0.5 / Q2=0.6 / Q3=0.6 / Q4=0.7`로 코드 기본값에 고정.
- 정적 `index.html`에 `Q3 목표 55건` Prototype 문구 존재.
- 팀별 메인 막대차트는 총 활동/후보/확보 건수인데 `건/인` 목표값을 동일 차트의 높이 기준 목표선으로 계산하여 단위가 불일치.
- 구형 `emergency-ui-stabilizer-v2.js`는 실제로 visibility fail-safe만 수행하면서 파일명/주석은 과거 7메뉴 복구 맥락을 유지.

## 2. 변경내용
### app.js
- 7메뉴 Fail-safe Navigation 재생성 코드 전체 제거.
- Navigation 정본을 `index.html` + `beginner-navigation.js`로 단일화.
- `targetMaster` 기본값을 `{Q1:null,Q2:null,Q3:null,Q4:null}`로 변경.
- 저장된 분기 목표가 실제 양수 숫자인 경우에만 사용.
- 목표 미설정 시 `Qn 인당 목표 미설정`으로 표현.
- 총 건수 막대차트 위에 단위가 다른 `건/인` 목표선을 그리지 않도록 목표선 숨김.
- 전역 이름을 `HD20LegacyDashboard`에서 `HD20DashboardCore`로 변경.

관련 커밋:
- `167e57c5ea0b02d550510c7cc6e22a965582b437` — app.js Canonical Dashboard Core 정리.

### index.html
- `Q3 목표 55건` 제거.
- 초기 목표 표현을 `Q3 인당 목표 미설정`으로 변경하고 목표선은 초기부터 숨김.
- app.js cache-bust를 Canonical Target 버전으로 갱신.

관련 커밋:
- `f768e1379d8fd884520b452487564953ec8b88e2` — 정적 목표 Placeholder 제거.

### App visibility fail-safe
- `app-visibility-failsafe.js` 생성: 앱 visibility 복구 기능만 담당.
- `index.html` 로딩을 새 모듈로 전환.
- `emergency-ui-stabilizer-v2.js` 삭제.

관련 커밋:
- `a44ce5746ea2b66b431d8f2093aab7173b287a22` — visibility fail-safe 생성.
- `c01794c77993edb6562605dd69b0f966f620590d` — index loader 전환.
- `6ce9ee38a75968f15709ad8d2093857d44024cd4` — 구형 emergency stabilizer 삭제.

## 3. 자동검증 강화
Runtime Smoke에 다음 회귀방지 계약을 추가했다.

- `app.js`의 분기 목표 기본값은 전부 `null`이어야 함.
- `HD20DashboardCore`가 존재해야 함.
- `ensureFailSafeNav`, 7-column fallback, `1·3·6개월 점검`, `HD20LegacyDashboard`가 `app.js`에 재유입되면 실패.
- 과거 `Q1=0.5 / Q2=0.6 / Q3=0.6 / Q4=0.7` 기본값 재유입 금지.
- 정적 `Q3 목표 55건` 재유입 금지.
- `app-visibility-failsafe.js` 존재 및 `emergency-ui-stabilizer-v2.js` 부재 확인.

관련 커밋:
- `e411d53a688739f656b92d2b7126069ef70cf3fb` — Dashboard Core/Target/Failsafe Runtime 계약.

## 4. README 현행화
`README_OVERHAUL_20260902.md`에 메인 Dashboard 목표/복구 기준과 퇴역 모듈을 반영했다.

관련 커밋:
- `8a913492ca156a8d7fa348d0b9d0a98724a38379`.

## 5. 검증 결과
Dashboard Core Canonical 정리와 문서 기록까지 포함한 commit `ad1566e21e47568aa1c3e4c28808be0fa54cb8bc` 기준 자동검증이 모두 성공했다.

- Runtime Smoke #228: **success**
- Browser Smoke #171: **success**
- Package HD20 source #432: **success**
- GitHub Pages #623: **success**

Browser Smoke의 실제 Chromium contract도 성공했다.

## 6. 배포 노출용 Prototype / Sample 퇴역
실행경로에는 연결되지 않았지만 GitHub Pages와 전체 소스 ZIP에 포함되던 독립 Prototype 및 가상 데이터 파일을 추가 점검했다.

퇴역 대상:
- `management.html`: 고정 KPI, 임의 48건 Raw Data, 샘플 외부 이미지, 과거 탭 구조를 포함한 독립 Prototype.
- `v2-preview.html`: 과거 디자인 Preview 페이지.
- `HD20_생산팀장_메일정보_강제생성_샘플.csv`: 가상 이름과 `example.com` 메일을 포함한 샘플.
- `data/HD20_생산팀장_메일정보_강제생성_샘플.csv`: 위 파일의 중복본.

현재 index/HDPS/Boot Loader의 참조가 없음을 확인한 뒤 삭제했다. 과거 개발 맥락은 Worklog/개발일지에 남기고 운영 배포물에서는 제거한다.

관련 커밋:
- `511401dbac5aa706da47569b4e784b8b3b52c213` — 루트 가상 팀장 CSV 삭제.
- `b8863e2e6f6aefd5ca33fc33675bd98622614f44` — data 중복 가상 팀장 CSV 삭제.
- `d391047c88fbd58c6da977de8a1a864904eed7ac` — `management.html` 삭제.
- `e549a4f7f82846e9a36504d2dd9dc56a16aed3d2` — `v2-preview.html` 삭제.
- `e34571d3afbfcd6b5bd3ebeb5c6c3a83ca39e70f` — 4개 파일 재유입 방지 Runtime 계약.

## 7. 후속 점검
- 실제 실행 JS/HTML의 `mock / seed / legacy / 1·3·6개월` 잔여를 계속 점검한다.
- 총 건수와 인당 실적처럼 단위가 다른 지표를 동일 축/목표선으로 혼합하지 않는다.
- 분기 목표는 실제 기준정보에 저장된 값만 운영값으로 사용한다.
- 현재 배포물에 불필요한 독립 Preview/가상 데이터 파일을 다시 포함하지 않는다.
