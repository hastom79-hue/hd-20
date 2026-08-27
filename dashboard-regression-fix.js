/* HD-20 retired compatibility layer.
 * 2026-08-27: disabled because this legacy regression patch injects its own
 * modal/grid data and repeatedly re-wires dashboard DOM through MutationObserver.
 * Design 2 is now controlled by the canonical dashboard modules only.
 */
(()=>{'use strict';window.HD20_RETIRED_REGRESSION_FIX=true;})();
