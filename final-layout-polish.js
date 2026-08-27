/* HD-20 Design 2 visual polish only.
 * IMPORTANT: no DOM reordering is allowed here. Layout ownership stays with
 * the canonical Design 2 dashboard renderer.
 */
(()=>{'use strict';const ID='hd20FinalLayoutPolish';document.getElementById(ID)?.remove();const s=document.createElement('style');s.id=ID;s.textContent=`
.approvedSummary{margin-bottom:10px!important}
.approvedAnalysis{margin-bottom:10px!important}
.approvedRaw{margin-bottom:10px!important}
.approvedFramework{margin:0 0 8px!important;padding:0!important;overflow:hidden!important;border-radius:14px!important;border:1px solid #d9e4eb!important;background:#fff!important;box-shadow:0 7px 20px rgba(25,61,88,.06)!important}
.approvedFramework .afGrid{display:grid!important;grid-template-columns:1fr!important;gap:0!important}
.approvedFramework .afCriteria,.approvedFramework .afProcess{padding:10px 12px!important;border:0!important;background:#fff!important}
.approvedFramework .afCriteria{border-bottom:1px solid #e4ebf0!important}
.approvedFramework .afSub{margin:0 0 7px!important;font-size:13.5px!important;line-height:1.25!important;font-weight:950!important;color:#173a57!important;letter-spacing:-.1px!important}
.approvedFramework .afCards{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:8px!important}
.approvedFramework .afCard{display:grid!important;grid-template-columns:30px minmax(0,1fr)!important;grid-template-rows:auto auto auto!important;column-gap:8px!important;row-gap:1px!important;align-items:start!important;min-height:88px!important;padding:8px 10px!important;border-radius:10px!important;background:#fbfdff!important;border:1px solid #dfe8ee!important;box-sizing:border-box!important;box-shadow:0 2px 6px rgba(25,61,88,.025)!important}
.approvedFramework .afCard:nth-child(1){background:#f8fcff!important;border-top:2px solid #9fcdec!important}.approvedFramework .afCard:nth-child(2){background:#f8fcfa!important;border-top:2px solid #a8d8b7!important}.approvedFramework .afCard:nth-child(3){background:#fbfaff!important;border-top:2px solid #c6b8e9!important}
.approvedFramework .afIcon{grid-column:1!important;grid-row:1/4!important;width:27px!important;height:27px!important;margin:0!important;display:grid!important;place-items:center!important;border-radius:8px!important}
.approvedFramework .afCard b{grid-column:2!important;grid-row:1!important;margin:0!important;padding:0!important;font-size:12.4px!important;line-height:1.28!important;color:#173a57!important;white-space:normal!important;word-break:keep-all!important;overflow-wrap:break-word!important}
.approvedFramework .afCard p{grid-column:2!important;grid-row:2!important;margin:2px 0 0!important;font-size:10px!important;line-height:1.32!important;color:#6d8291!important;white-space:normal!important;word-break:keep-all!important;overflow-wrap:break-word!important}
.approvedFramework .afCard:after{grid-column:2!important;grid-row:3!important;position:static!important;margin-top:2px!important;font-size:8.8px!important;line-height:1.15!important;color:#3779a6!important;font-weight:900!important}
.approvedFramework .afRule{margin:6px 0 0!important;padding:4px 7px!important;min-height:0!important;font-size:9px!important;line-height:1.2!important;border-radius:6px!important;background:#f2f8fc!important;border:1px solid #dce9f1!important;color:#4e6f83!important}
.approvedFramework .afProcess{padding-top:9px!important;padding-bottom:8px!important}
.approvedFramework .seqTrackWrap{margin:0!important;padding:0!important;border:0!important;background:#fff!important}
.approvedFramework .seqGantt{display:grid!important;grid-template-columns:108px minmax(0,1fr)!important;column-gap:8px!important;row-gap:2px!important}
.approvedFramework .seqLabel{min-height:36px!important;padding:0!important}.approvedFramework .seqLane{min-height:36px!important;background:#fbfdff!important;border-color:#edf2f6!important}
.approvedFramework .seqNum{width:21px!important;height:21px!important;flex-basis:21px!important}.approvedFramework .seqLabelText b{font-size:10.8px!important}.approvedFramework .seqLabelText small{font-size:7.9px!important;line-height:1.15!important}
.approvedFramework .seqBar{top:5px!important;height:24px!important;padding:0 7px!important;border-radius:7px!important;box-shadow:none!important}.approvedFramework .seqBarTitle{font-size:9.7px!important}.approvedFramework .seqTime{font-size:7.7px!important;padding:2px 5px!important}
.approvedFramework .seqRow:nth-child(odd) .seqBar{background:linear-gradient(90deg,#edf6fc,#deeff9)!important;border-color:#c6dceb!important}.approvedFramework .seqRow:nth-child(even) .seqBar{background:linear-gradient(90deg,#f0f8f2,#e2f1e7)!important;border-color:#c8dfcf!important}
@media(max-width:1000px){.approvedFramework .afCards{grid-template-columns:1fr!important}.approvedFramework .afCard{min-height:0!important}.approvedFramework .seqGantt{grid-template-columns:102px minmax(0,1fr)!important}}
`;document.head.appendChild(s);})();
