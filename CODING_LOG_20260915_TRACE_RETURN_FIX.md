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

## 영향 없음
- `hd20-trace-production-guard.js`의 production-only filtering
- Audit ID = `id || drawId || auditDrawId`
- Action source Audit ID = `auditDrawId || sourceCaseId`
- Action closure/effect/recurrence canonical logic
- Audit 6개월 종료평가 계산

## 다음 검증
1. 최신 main SHA 확인
2. Pages build/deploy/report 확인
3. deployed SHA와 main 일치 확인
4. Case Detail에서 원천 Audit ID가 없는 경우 backlink 미표시 유지 확인
5. Action 0건 Audit은 Trace에서 미연계 상태 유지 확인
6. 개발일지에 최종 deployed SHA 추가
