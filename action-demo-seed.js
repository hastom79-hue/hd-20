(()=>{'use strict';
/* Production safety guard.
 * Do not inject demo action cases into the canonical hd20ActionCasesV2 store.
 * Existing browser data is intentionally preserved; this file only prevents
 * future automatic demo creation from affecting KPI, Lead Time and Grid totals.
 */
window.HD20_DEMO_ACTIONS=[];
window.HD20_ACTION_DEMO_SEED_DISABLED=true;
})();