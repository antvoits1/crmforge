document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-act]");
  if (!b) {
    if (state.keypadOpen && !e.target.closest("#padPop") && !e.target.closest("[data-act='toggle-pad']")) { state.keypadOpen = false; placePad(); }
    if (state.searchOpen && !e.target.closest("#crmSearchPop")) { state.searchOpen = false; state.query = ""; renderSearch(); }
    if (state.filterOpen && !e.target.closest("#leadFilterMenu")) { state.filterOpen = false; renderLeadFilterMenu(); }
    if ((state.composerMenu || state.emojiOpen || state.gifOpen) && !e.target.closest(".composer-shell")) { state.composerMenu = false; state.emojiOpen = false; state.gifOpen = false; renderDock(); }
    return;
  }
  const act = b.dataset.act;
  const l = lead();
  if (act === "select") { state.selected = b.dataset.id; state.keypadOpen = false; state.activityExpanded = false; state.threadN = ""; state.threadCh = "sms"; state.messageThreadOpen = false; state.callDetail = null; state.contactDetail = null; state.emailDetail = null; renderAll(); return; }
  if (act === "search-toggle") { state.searchOpen = !state.searchOpen; state.filterOpen = false; if (!state.searchOpen) state.query = ""; renderLeadFilterMenu(); renderSearch(); if (state.searchOpen) setTimeout(()=>$("q")?.focus(), 0); return; }
  if (act === "filter-toggle") { state.filterOpen = !state.filterOpen; state.searchOpen = false; state.query = ""; renderSearch(); renderLeadFilterMenu(); return; }
  if (act === "search-result") {
    state.selected = b.dataset.lead; state.searchOpen = false; state.query = "";
    const type = b.dataset.type;
    if (type === "file") state.modal = {type:"file", i:+b.dataset.i};
    else if (type === "message") { state.commsTab="msg"; state.threadN=b.dataset.n; state.threadCh=b.dataset.ch || "sms"; state.messageThreadOpen=true; }
    else if (type === "email") { state.commsTab="mail"; state.emailDetail={leadId:b.dataset.lead,index:+b.dataset.i}; }
    else if (type === "call") { state.commsTab="calls"; state.callDetail={leadId:b.dataset.lead,index:+b.dataset.i}; }
    renderAll(); return;
  }
  if (act === "filter") { state.filter = ["all","star","hot"].includes(b.dataset.k) ? b.dataset.k : "all"; state.filterOpen = false; renderRail(); return; }
  if (act === "favorite") { if (state.fav.has(l.id)) state.fav.delete(l.id); else state.fav.add(l.id); saveFavorites(); renderRail(); renderDesk(); return; }
  if (act === "activity-toggle") { state.activityExpanded = !state.activityExpanded; renderDesk(); return; }
  if (act === "comms-tab") { state.commsTab = b.dataset.k; state.messageThreadOpen = false; state.callDetail = null; state.contactDetail = null; state.emailDetail = null; state.composerMenu = false; state.emojiOpen = false; state.gifOpen = false; renderDock(); return; }
  if (act === "message-open") { state.selected=b.dataset.lead; state.threadN=b.dataset.n; state.threadCh=b.dataset.ch||"sms"; state.messageThreadOpen=true; state.callDetail=null; state.contactDetail=null; state.emailDetail=null; renderAll(); return; }
  if (act === "message-back") { state.messageThreadOpen=false; renderDock(); return; }
  if (act === "call-open") { state.selected=b.dataset.lead; state.callDetail={leadId:b.dataset.lead,index:+b.dataset.i}; state.messageThreadOpen=false; state.contactDetail=null; state.emailDetail=null; renderAll(); return; }
  if (act === "call-back") { state.callDetail=null; renderDock(); return; }
  if (act === "call-sms") { state.selected=b.dataset.lead || state.selected; state.threadN=b.dataset.n || lead().mobiles?.[0]?.n || ""; state.threadCh="sms"; state.commsTab="msg"; state.callDetail=null; state.messageThreadOpen=true; renderAll(); setTimeout(()=>$("smsBox")?.focus(), 0); return; }
  if (act === "contact-open") { state.selected=b.dataset.lead; state.contactDetail=b.dataset.lead; state.messageThreadOpen=false; state.callDetail=null; state.emailDetail=null; renderAll(); return; }
  if (act === "contact-back") { state.contactDetail=null; renderDock(); return; }
  if (act === "email-open") { state.selected=b.dataset.lead; const draft=state.emailFolder==="drafts" ? state.drafts[b.dataset.lead] : null; state.emailDetail={leadId:b.dataset.lead,index:+b.dataset.i,folder:state.emailFolder,draft}; renderAll(); return; }
  if (act === "email-back") { state.emailDetail=null; renderDock(); return; }
  if (act === "timeline-open") {
    state.selected=b.dataset.lead;
    if (b.dataset.kind === "message") { state.commsTab="msg"; state.threadN=b.dataset.n; state.threadCh=b.dataset.ch||"sms"; state.messageThreadOpen=true; }
    else if (b.dataset.kind === "call") { state.commsTab="calls"; state.callDetail={leadId:b.dataset.lead,index:+b.dataset.i}; }
    else { state.commsTab="mail"; state.emailFolder=b.dataset.folder||"inbox"; state.emailDetail={leadId:b.dataset.lead,index:+b.dataset.i,folder:state.emailFolder}; }
    renderAll(); return;
  }
  if (act === "attach-toggle") { state.composerMenu = !state.composerMenu; state.emojiOpen = false; state.gifOpen = false; renderDock(); setTimeout(()=>$("smsBox")?.focus(),0); return; }
  if (act === "attach-choice") {
    const kind = b.dataset.k;
    state.composerMenu = false;
    if (kind === "emoji") { state.emojiOpen = true; state.gifOpen = false; renderDock(); return; }
    if (kind === "gif") { state.gifOpen = true; state.emojiOpen = false; renderDock(); setTimeout(()=>$("gifSearch")?.focus(),0); return; }
    const input = $("composerFileInput");
    if (!input) return;
    const accepts = {photos:"image/*", camera:"image/*", videos:"video/*", files:"", documents:".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.rtf", audio:"audio/*", multiple:""};
    input.value = "";
    input.accept = accepts[kind] ?? "";
    input.multiple = kind === "multiple" || kind === "photos" || kind === "videos" || kind === "files" || kind === "documents" || kind === "audio";
    input.dataset.kind = kind;
    if (kind === "camera") input.setAttribute("capture","environment"); else input.removeAttribute("capture");
    document.querySelector(".attachment-menu")?.classList.remove("open");
    input.click();
    return;
  }
  if (act === "attachment-remove") {
    const i = Number(b.dataset.i);
    const item = state.composerAttachments[i];
    if (item?.url?.startsWith("blob:")) URL.revokeObjectURL(item.url);
    state.composerAttachments.splice(i,1);
    renderDock();
    return;
  }
  if (act === "picker-close") { state.emojiOpen = false; state.gifOpen = false; renderDock(); return; }
  if (act === "emoji-pick") {
    const box = $("smsBox"); if (!box) return;
    const emoji = b.dataset.emoji || "";
    const start = box.selectionStart ?? box.value.length, end = box.selectionEnd ?? start;
    box.value = box.value.slice(0,start) + emoji + box.value.slice(end);
    const pos = start + emoji.length; box.setSelectionRange(pos,pos); box.focus();
    return;
  }
  if (act === "call") { const number = b.dataset.n || state.dial.number || ""; if (!number.trim()) { toast("Enter a number first"); $("dialInput")?.focus(); return; } startCall(number, b.dataset.who); return; }
  if (act === "hang") { hang(); return; }
  if (act === "mute") { state.dial.muted = !state.dial.muted; renderDock(); return; }
  if (act === "hold") { state.dial.hold = !state.dial.hold; renderDock(); return; }
  if (act === "add-call") { toast("Add Call needs a connected phone service"); return; }
  if (act === "transfer") { toast("Transfer needs a connected phone service"); return; }
  if (act === "call-notes") { state.modal = {type:"call-notes"}; renderModal(); return; }
  if (act === "save-call-notes") { state.dial.notes = $("callNotes")?.value.trim() || ""; state.modal = null; renderModal(); toast("Call notes saved locally"); return; }
  if (act === "toggle-pad") { state.keypadOpen = !state.keypadOpen; placePad(); return; }
  if (act === "dtmf") {
    const k = b.dataset.k;
    if (state.dial.status === "idle") { const raw = (state.dial.number || "").replace(/\D/g,""); if (raw.length < 10) state.dial.number = (state.dial.number || "") + k; renderDock(); }
    else { state.dial.dtmf += k; const timer = $("timer"); if (timer) timer.textContent = state.dial.dtmf; toast("DTMF " + k); }
    return;
  }
  if (act === "devices") { state.modal = {type:"devices"}; renderModal(); return; }
  if (act === "set-device") { state.dial.device = b.dataset.id; state.modal = null; renderAll(); toast(device().name); return; }
  if (act === "sms" || act === "wa") { state.threadN = b.dataset.n; state.threadCh = act === "wa" ? "wa" : "sms"; state.commsTab = "msg"; state.messageThreadOpen = true; renderDock(); setTimeout(()=>$("smsBox")?.focus(), 40); return; }
  if (act === "send-sms") {
    const t = $("smsBox")?.value.trim() || "";
    if (!t && !state.composerAttachments.length) return;
    const attachments = state.composerAttachments.map(a => ({name:a.name,type:a.type,size:a.size,url:a.url,kind:a.kind}));
    l.sms.push({dir:"out", ch: state.threadCh || "sms", n: state.threadN || l.mobiles[0].n, t:"Just now", txt:t, attachments});
    l.activity.unshift({when:"Just now", what:(state.threadCh === "wa" ? "WhatsApp" : "SMS") + " to " + l.contact});
    l.lastAgo = "just now"; state.composerAttachments = []; state.composerMenu = false; state.emojiOpen = false; state.gifOpen = false;
    renderDock(); toast("Added to local demo thread · no messaging service connected"); return;
  }
  if (act === "email-all") { openCompose({ all:true }); return; }
  if (act === "email-one") { openCompose({ to:b.dataset.n, bcc:"" }); return; }
  if (act === "compose") { openCompose({}); return; }
  if (act === "fmt") { document.execCommand(b.dataset.cmd, false, null); return; }
  if (act === "attach") { $("cAtt").textContent = "term-sheet.pdf"; toast("Attached term-sheet.pdf"); return; }
  if (act === "draft") { state.drafts[l.id] = { to:$("cTo").value, cc:$("cCc").value, bcc:$("cBcc").value, subject:$("cSub").value, body:$("cBody").innerHTML }; toast("Draft saved"); return; }
  if (act === "send-mail") {
    const sub = $("cSub").value.trim() || "(no subject)"; const body = $("cBody").innerText.trim();
    l.mails.unshift({sub, from:"Cole Brennan", to:$("cTo").value, when:"Just now", preview:body.slice(0,140)}); l.activity.unshift({when:"Just now", what:"Email · " + sub}); l.lastAgo = "just now"; state.modal = null; renderAll(); toast("Sent"); return;
  }
  if (act === "open-mail") { state.modal = {type:"mail-read", i:+b.dataset.i}; renderModal(); return; }
  if (act === "file") { state.modal = {type:"file", i:+b.dataset.i}; renderModal(); return; }
  if (act === "file-prev") { if (state.modal?.type === "file") state.modal.i = Math.max(0, state.modal.i - 1); renderModal(); return; }
  if (act === "file-next") { if (state.modal?.type === "file") state.modal.i = Math.min((lead().files?.length || 1) - 1, state.modal.i + 1); renderModal(); return; }
  if (act === "close") { state.modal = null; renderModal(); return; }
  if (act === "toast") { toast(b.dataset.msg); return; }
});

ensureRailShell();
$("overlay").addEventListener("click", (e) => { if (e.target.id === "overlay") { state.modal = null; renderModal(); }});
document.addEventListener("input", (e) => {
  if (e.target.id === "q") { state.query = e.target.value; renderSearch(); return; }
  if (e.target.id === "dialInput") { const clean = e.target.value.replace(/[^0-9*#+()\- .]/g, ""); state.dial.number = clean; if (e.target.value !== clean) e.target.value = clean; return; }
});
document.addEventListener("change", (e) => {
  if (e.target.id === "composerFileInput") {
    const kind = e.target.dataset.kind || "file";
    const files = Array.from(e.target.files || []);
    files.forEach(file => state.composerAttachments.push({name:file.name,type:file.type || "application/octet-stream",size:file.size,kind,url:URL.createObjectURL(file)}));
    state.composerMenu = false; renderDock(); return;
  }
  if (e.target.id === "mailFolder") { state.emailFolder = e.target.value; state.emailDetail = null; renderDock(); return; }
  if (e.target.matches("[data-act='thread-number']")) { state.threadN = e.target.value; renderDock(); return; }
  if (e.target.matches("[data-act='thread-channel']")) { state.threadCh = e.target.value; renderDock(); return; }
  const select = e.target.closest("#cFont, #cSize, #cTpl"); if (select) applyComposerSelect(select);
});
document.addEventListener("keydown", (e) => {
  if (e.target.id === "dialInput" && e.key === "Enter") { e.preventDefault(); document.querySelector(".dialer [data-act='call']")?.click(); return; }
  if (e.target.id === "dialInput" && e.key === "Escape") { e.target.blur(); return; }
  const editing = /INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || e.target.isContentEditable === true;
  if (!editing && state.modal == null && /^[0-9*#]$/.test(e.key)) {
    e.preventDefault();
    if (state.dial.status === "idle" || state.dial.status === "ended") { state.dial.number = (state.dial.number || "") + e.key; renderDock(); }
    else { state.dial.dtmf += e.key; const timer=$("timer"); if (timer) timer.textContent=state.dial.dtmf; }
    return;
  }
  if (!editing && state.modal == null && e.key === "Backspace" && (state.dial.status === "idle" || state.dial.status === "ended")) { e.preventDefault(); state.dial.number=(state.dial.number||"").slice(0,-1); renderDock(); return; }
  if (!editing && state.modal == null && e.key === "Enter" && (state.dial.status === "idle" || state.dial.status === "ended") && state.dial.number) { e.preventDefault(); document.querySelector(".dialer [data-act='call']")?.click(); return; }
  if (e.target.id === "smsBox" && e.key === "Enter" && !e.shiftKey) { e.preventDefault(); document.querySelector("[data-act='send-sms']")?.click(); return; }
  if (e.key === "/" && document.body.dataset.page === "leads" && !/INPUT|TEXTAREA/.test(document.activeElement.tagName) && document.activeElement.isContentEditable !== true) { e.preventDefault(); state.filterOpen = false; state.searchOpen = true; renderLeadFilterMenu(); renderSearch(); setTimeout(()=>$("q")?.focus(), 0); }
  if (e.key === "Escape") {
    if (state.searchOpen) { state.searchOpen = false; state.query = ""; renderSearch(); return; }
    if (state.filterOpen) { state.filterOpen = false; renderLeadFilterMenu(); return; }
    if (state.composerMenu || state.emojiOpen || state.gifOpen) { state.composerMenu = false; state.emojiOpen = false; state.gifOpen = false; renderDock(); return; }
    state.modal = null; state.keypadOpen = false; renderAll();
  }
});
const SCROLL_EDGE_SELECTOR = ".pane,.desk-scroll,.dock-body";
function clearScrollEdges(except=null) {
  document.querySelectorAll(SCROLL_EDGE_SELECTOR).forEach(el => { if (el !== except) el.classList.remove("scrollbar-near"); });
}
document.addEventListener("mousemove", (e) => {
  const el = e.target.closest?.(SCROLL_EDGE_SELECTOR);
  if (!el) { clearScrollEdges(); return; }
  const rect = el.getBoundingClientRect();
  const needsScroll = el.scrollHeight > el.clientHeight + 1;
  const nearEdge = needsScroll && e.clientX >= rect.right - 12 && e.clientX <= rect.right + 1;
  clearScrollEdges(el);
  el.classList.toggle("scrollbar-near", nearEdge);
});
document.documentElement.addEventListener("mouseleave", () => clearScrollEdges());

(function resize() {
  let side = null, startX = 0, startW = 0;
  document.addEventListener("mousedown", (e) => {
    const h = e.target.closest(".handle"); if (!h) return;
    side = h.dataset.side; startX = e.clientX; startW = side === "rail" ? panelCssWidth($("rail")) : panelCssWidth($("dock")); h.classList.add("drag"); e.preventDefault();
  });
  document.addEventListener("mousemove", (e) => {
    if (!side) return;
    const dx = (e.clientX - startX) / screenFactor(); const m = panelMetrics(); const railNow = panelCssWidth($("rail")); const dockNow = panelCssWidth($("dock"));
    if (side === "rail") { const maxRail = Math.min(m.maxRail, m.available - dockNow - m.minDesk); setPanelWidths(Math.min(maxRail, Math.max(m.minRail, startW + dx)), dockNow, false); }
    else { const dockMax = Math.max(m.minDock, m.available - railNow - m.minDesk); setPanelWidths(railNow, Math.min(dockMax, Math.max(m.minDock, startW - dx)), false); }
    placePad();
  });
  document.addEventListener("mouseup", () => { if (!side) return; document.querySelectorAll(".handle").forEach(h => h.classList.remove("drag")); storeSet(LS.rail, Math.round(panelCssWidth($("rail")))); storeSet(LS.dock, Math.round(panelCssWidth($("dock")))); storeSet(LS.custom, "1"); side = null; });
  document.addEventListener("dblclick", (e) => {
    const h = e.target.closest(".handle"); if (!h) return;
    if (h.dataset.side === "rail") { setPanelWidths(panelMetrics().targetRail, panelCssWidth($("dock")), true); storeSet(LS.custom, "1"); }
    else { const m = panelMetrics(); const rail = panelCssWidth($("rail")); setPanelWidths(rail, (m.available - rail) / 2, true); storeSet(LS.custom, "1"); }
    placePad();
  });
})();
window.addEventListener("forge:reset-panels", () => { resetPanelWidths(true); placePad(); });
window.addEventListener("forge:layout-changed", () => { if (storeGet(LS.custom) === "1") setPanelWidths(panelCssWidth($("rail")), panelCssWidth($("dock")), false); else resetPanelWidths(false); placePad(); });
window.addEventListener("resize", () => { if (storeGet(LS.custom) === "1") setPanelWidths(panelCssWidth($("rail")), panelCssWidth($("dock")), false); else resetPanelWidths(false); placePad(); });

applyWidths();
try { renderAll(); }
catch (err) { const r = document.getElementById("rail"); if (r) r.innerHTML = `<div class="empty" style="padding:24px">Couldn’t start the desk.<br><br>${esc(err && err.message)}</div>`; }
window.addEventListener("forge:devices", () => { state.modal = {type:"devices"}; renderModal(); });
