# HD-20 코딩일지 — DB Sync API 조기 노출

작성일: 2026-09-15

## 변경 파일
`supabase-sync.js`

## 문제
기존 `boot()`는 `window.HD20_DB_SYNC`를 최초 원격 fetch/apply/sanitize push 이후에 할당했다. `hd20-db-production-health.js`는 `HD20_DB_SYNC.fetchRemote`를 기다리므로 초기 원격 통신이 길어지면 Health Guard의 유한 retry와 초기화 순서가 경쟁할 수 있었다.

## 코드 변경
신규 함수:
```js
function exposeSync(){
  window.HD20_DB_SYNC={
    pull,push,manualSync,fetchRemote,
    keys:[...KEYS],
    stats:()=>storeStats(),
    ready:()=>ready,
    status:()=>({ready,lastRemoteAt,meta:meta(),stores:storeStats()})
  };
  return window.HD20_DB_SYNC;
}
```

`boot()`에서 인증 사용자 확인 직후:
```js
user=data?.session?.user||null;
if(!user)return;
exposeSync();
installBadge();
patchStorage();
```

초기 처리 종료 시에도 `exposeSync()`를 다시 호출한다.

## 불변조건
- `isNonProdRow()` 기준 변경 없음
- `sanitizeStore()` 변경 없음
- unsafe-only remote + local Production 보존 규칙 변경 없음
- conflict pull 규칙 변경 없음
- 서버측 강제 empty write 추가 없음

## 기능 커밋
`84113306bc0c002898b0e02c170eed53c5c12c3e`

## 후속 검증
1. Pages exact SHA 배포 확인
2. Health Guard 초기화 race 해소 확인
3. 인증 sanitize push remote timestamp 갱신 확인
4. Activity/Action/Audit production-only 재검증
