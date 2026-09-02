(()=>{'use strict';
/*
 * RETIRED COMPATIBILITY SHIM — 2026-09-02
 *
 * 과거 GMES 원천의 audit-like 필드를 별도로 스캔해 hd20ActionCasesV2에
 * 자동 Case를 생성하던 경로는 현재 Canonical Audit 운영모델과 중복되어
 * 퇴역했다.
 *
 * 현재 유효한 연결경로:
 *   hd20AuditRandomDrawsV1
 *   → Audit 실시/개선요청
 *   → audit-checklist-enhance.js / audit-closed-loop-workflow.js
 *   → action-audit-linkage.js
 *   → hd20ActionCasesV2
 *
 * 기존 외부 호출의 JavaScript 오류만 방지하기 위해 이름만 남기며,
 * 이 파일은 운영 Store를 읽거나 쓰거나 Case를 생성하지 않는다.
 */
function sync(){return 0}
function candidates(){return[]}
function deadlineDays(){return window.HD20PolicyConfig?.deadlineDays?.()??null}
window.HD20AuditActionAutoLink={retired:true,sync,candidates,deadlineDays};
})();