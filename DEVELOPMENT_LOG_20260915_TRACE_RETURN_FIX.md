# HD-20 개발일지 — Exact Trace → Audit 유지관리 복귀 보완 (2026-09-15)

## 목적
Audit → Action exact Trace에서 개별 Action Case Detail을 확인한 뒤 `원 Audit 유지관리로 돌아가기`를 눌렀을 때, 사용자가 어느 상단영역에서 Trace를 열었더라도 실제 Audit 유지관리 화면으로 정확히 복귀하도록 보완한다.

## 발견 문제
기존 `hd20-trace-backlink-guard.js`의 `goBack(id)`는 `HD20_SUBNAV.select('audit','retention')`만 호출했다.

`HD20_SUBNAV.select()`는 audit 내부 subview를 바꾸지만 상단 main navigation을 Audit으로 전환하지 않는다. 따라서 Dashboard 또는 Action 영역에서 Exact Trace를 연 뒤 복귀하면, 숨겨진 Audit DOM의 대상 행은 탐색할 수 있어도 사용자가 보는 상단영역은 그대로 남을 수 있었다.

## 수정
`goBack(id)` 순서를 다음과 같이 변경했다.
1. Action Case Detail / Exact Trace modal 닫기
2. `HD20_NAV.go('audit')`로 상단영역을 Audit으로 명시 전환
3. URL `tab=audit&sub=retention` 갱신
4. seek loop에서 `HD20_SUBNAV.select('audit','retention')` 반복 적용
5. exact Audit ID가 동일한 종료평가 행을 탐색
6. 대상 행 scroll + highlight

팀명·작업장명 유사추론은 사용하지 않으며 기존 exact Audit ID 기준을 유지한다.

## 수정 파일
- `hd20-trace-backlink-guard.js`
- `final-layout-polish.js` — backlink guard cache `v=20260915-2`

## Commit
- `ece46af0a8abe857efa79f8ab083f8f718b26261` — `fix: navigate to Audit before trace backlink highlight`
- `009a8467980bf6f1c61055be7e79535b90d90c01` — `chore: refresh exact Audit backlink cache`
- `92cde83b263c0284743aa6e32ddc5577ea6d63f9` — 개발일지 생성
- `e70b9667c551e1f87ca31d5ab25ce4217d2ad171` — 코딩일지 생성 및 당시 main

## 회귀 확인
- `sourceAuditId()`는 Case Detail의 `원천 Audit ID` 값만 사용한다.
- `highlight(id)`는 `#hd20AuditCloseEvaluation`의 cell 값이 exact Audit ID와 동일한 행만 선택한다.
- Action → Audit 연결 규칙 `auditDrawId || sourceCaseId`는 변경하지 않았다.
- Production-only Trace/Case Detail guard는 변경하지 않았다.
- `final-layout-polish.js`에서 `hd20-trace-backlink-guard.js?v=20260915-2` 로딩을 확인했다.
- `index.html`의 `고도화 작업장 추이`는 `<div class="cardBody"><div class="trendBox"></div></div>` 구조를 그대로 유지한다.

## Pages 배포 실행검증
- 기준 main SHA: `e70b9667c551e1f87ca31d5ab25ce4217d2ad171`
- Pages run: `34907593976`
- run 상태: `completed / success`
- build job `104187762439`: success
- deploy job `104187931113`: success
- report-build-status job `104187931161`: success
- 세 job 모두 `head_sha = e70b9667c551e1f87ca31d5ab25ce4217d2ad171`

따라서 Trace backlink 수정 + cache v2 + 관련 로그가 포함된 위 main SHA가 Pages build/deploy 대상과 일치함을 확인했다.

## 잔여 검증
- Dashboard/Action/Retention Evidence 각 진입점에서 Case Detail → 원 Audit 복귀 실제 브라우저 화면 전환 확인
- Case Detail에 원천 Audit ID가 없는 경우 backlink 미표시 유지 확인
- Action 0건 Audit은 Trace에서 `미연계` 상태 유지 확인
- 일반 GitHub-hosted smoke runner는 기존처럼 job step 시작 전 실패하는 경우가 있어 Pages 배포 검증과 분리하여 판단한다.
