(()=>{'use strict';
/* Production guard: demo action rows must never be injected into the canonical
 * hd20ActionCasesV2 store. Existing user/operational rows are preserved.
 * Demo fixtures remain intentionally unavailable to KPI, lead-time and Grid totals.
 */
window.HD20_DEMO_ACTIONS=[];
window.HD20_ACTION_DEMO_SEED_DISABLED=true;
})();