(()=>{'use strict';
function reveal(){
 document.documentElement.classList.add('hd20-ready');
 document.documentElement.style.visibility='visible';
 if(document.body){document.body.style.visibility='visible';document.body.style.opacity='1'}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',reveal,{once:true});else reveal();
setTimeout(reveal,300);
window.HD20AppVisibilityFailsafe={reveal};
})();