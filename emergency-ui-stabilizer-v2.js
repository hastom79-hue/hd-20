(()=>{
/*
 * Legacy emergency stabilizer retired after Design 2 approval.
 * It previously rebuilt navigation/framework and forced a 6-column menu,
 * conflicting with the approved 7-item navigation and newer page modules.
 * Keep only the fail-safe reveal so a downstream script error can never hide the app.
 */
function reveal(){
 document.documentElement.classList.add('hd20-ready');
 document.documentElement.style.visibility='visible';
 if(document.body){document.body.style.visibility='visible';document.body.style.opacity='1'}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',reveal,{once:true});else reveal();
setTimeout(reveal,300);
})();