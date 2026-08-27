/* HD-20 Design 2: effects layer intentionally reduced to boot visibility only.
 * Removed hard-coded KPI trend data, dark-header override, and pointer pulse DOM
 * injection so the approved layout/color system cannot drift after load.
 */
(()=>{'use strict';function reveal(){document.documentElement.classList.add('hd20-ready');document.documentElement.style.visibility='visible';if(document.body){document.body.style.visibility='visible';document.body.style.opacity='1'}}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',reveal,{once:true});else reveal();})();
