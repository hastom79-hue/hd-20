# HD-20 코딩일지 — Exact Trace → Audit 유지관리 복귀 보완 (2026-09-15)

## 변경 대상
- `hd20-trace-backlink-guard.js`
- `final-layout-polish.js`

## 원인
기존 `goBack(id)`는 다음만 수행했다.
- exact Case / Trace modal close
- `HD20_SUBNAV.select('audit','retention')`
- URL query 변경
- `highlight(id)` 재시도

하지만 `HD20_SUBNAV.select()` 구현은 내부 `state={area,sub}`와 `apply(area,sub)`만 처리하며 `HD20_NAV.go('audit')`를 호출하지 않는다. 따라서 현재 상단영역이 Dashboard/Action인 경우 Audit root가 사용자 화면에 활성화된다는 보장이 없었다.

## 코드 수정
### `goBack(id)`
수정 후:
```text
normalize Audit ID
→ Case Detail / Exact Trace close
→ HD20_NAV.go('audit')
→ URL tab=audit&sub=retention
→ 80ms 후 seek 시작
→ 각 seek에서 HD20_SUBNAV.select('audit','retention')
→ exact Audit ID row highlight
→ 최대 30회 × 100ms 재시도
```

### Exact ID 기준
`highlight(id)`는 종료평가 table row의 모든 td를 검사하되 `txt(td.textContent) === id` exact equality만 사용한다. fuzzy team/workplace matching은 없다.

### Cache
`final-layout-polish.js`:
- old: `hd20-trace-backlink-guard.js?v=20260913-1`
- new: `hd20-trace-backlink-guard.js?v=20260915-2`

## Commit
- source fix: `ece46af0a8abe857efa79f8ab083f8f718b26261`
- loader/cache: `009a8467980bf6f1c61055be7e79535b90d90c01`
- 개발일지: `92cde83b263c0284743aa6e32ddc5577ea6d63f9`
- 코딩일지/main 기준: `e70b9667c551e1f87ca31d5ab25ce4217d2ad171`

## 영향 없음
- `hd20-trace-production-guard.js`의 production-only filtering
- Audit ID = `id || drawId || auditDrawId`
- Action source Audit ID = `auditDrawId || sourceCaseId`
- Action closure/effect/recurrence canonical logic
- Audit 6개월 종료평가 계산

## 배포 코드 검증
Pages run `34907593976` 기준:
- build `104187762439` success
- deploy `104187931113` success
- report-build-status `104187931161` success
- 모든 Pages job의 `head_sha` = `e70b9667c551e1f87ca31d5ab25ce4217d2ad171`

따라서 배포 artifact가 생성된 source revision과 Trace return fix가 포함된 main revision의 SHA가 일치한다.

## 소스 재확인
- `final-layout-polish.js`가 `hd20-trace-backlink-guard.js?v=20260915-2`를 로드한다.
- `hd20-trace-production-guard.js`는 `openForAudit(id)`에서 exact Audit ID만 사용한다.
- Action 없는 Audit도 `renderTrace()`에서 `미연계` row를 생성하므로 return 대상 Audit 자체는 사라지지 않는다.
- Case Detail은 production-filtered Action 배열의 exact Action ID로만 열린다.

## 다음 검증
1. Dashboard/Action/Retention Evidence 3개 진입점에서 실제 browser return behavior 확인
2. 원천 Audit ID 없는 Case에서 backlink가 생성되지 않는지 확인
3. URL `tab=audit&sub=retention`과 visible main nav가 동시에 Audit으로 전환되는지 확인
4. 일반 smoke runner step 시작 여부와 app assertion 실패를 구분하여 기록
5. 이후 변경도 개발일지·코딩일지 동시 갱신
