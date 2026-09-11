function renderMessageThread() {
  const l = lead();
  const n = state.threadN || l.mobiles?.[0]?.n || "";
  const ch = state.threadCh || "sms";
  const msgs = (l.sms || []).filter(m => (m.n || l.mobiles?.[0]?.n || "") === n && (m.ch || "sms") === ch).sort((a,b)=>relativeMinutes(b.t)-relativeMinutes(a.t));
  return `<div class="comm-detail-head">
      ${commBackButton("message-back")}
      <div class="thread-contact"><strong>${esc(displayName(l.contact))}</strong><span>${esc(n)}</span></div>
      <select class="comm-select phone-select" data-act="thread-number" aria-label="Phone number">${(l.mobiles||[]).map(p=>`<option value="${esc(p.n)}" ${p.n===n?"selected":""}>${esc(p.n)}</option>`).join("")}</select>
      <select class="comm-select channel-select" data-act="thread-channel" aria-label="Message type"><option value="sms" ${ch==="sms"?"selected":""}>SMS</option><option value="wa" ${ch==="wa"?"selected":""}>WhatsApp</option></select>
    </div>
    <div class="thread">${msgs.length ? msgs.map(m=>`<div class="bubble ${m.dir==="out"?"out":"in"} ${m.ch==="wa"?"wa":""}">${esc(m.txt)}<div class="t">${esc(m.t)}</div></div>`).join("") : `<div class="empty">No ${ch==="wa"?"WhatsApp":"SMS"} messages on this number.</div>`}</div>
    <div class="composer"><textarea id="smsBox" placeholder="Message…"></textarea><button class="composer-action" data-act="send-sms" aria-label="Send">${ico("send",15)}</button></div>`;
}
function renderCallDetail() {
  const detail = state.callDetail;
  const l = LEADS.find(x=>x.id===detail?.leadId) || lead();
  const c = (l.calls || [])[detail?.index] || (l.calls || [])[0];
  if (!c) return `<div class="empty">Call not found.</div>`;
  const history=(l.calls||[]).filter(x=>x.n===c.n);
  return `<div class="comm-detail-head simple">${commBackButton("call-back")}<div class="detail-title"><strong>${esc(c.who || displayName(l.contact))}</strong><span>${esc(c.n || "")}</span></div></div>
    <div class="comm-detail-card"><div class="detail-grid"><span>Type</span><strong>${callDirection(c)}</strong><span>Date / time</span><strong>${esc(c.when || "—")}</strong><span>Duration</span><strong>${esc(c.dur || "—")}</strong><span>Device</span><strong>${esc(c.dev || "—")}</strong></div>${c.note?`<p>${esc(c.note)}</p>`:""}<button class="btn primary compact-action" data-act="call" data-n="${esc(c.n)}" data-who="${esc(c.who||displayName(l.contact))}">${ico("phone",14)} Call</button></div>
    <div class="comm-subhead">History</div>${history.map(x=>`<div class="comm-row static"><span class="comm-main"><strong>${callDirection(x)}</strong><small>${esc(x.when||"")} · ${esc(x.dur||"—")}</small></span></div>`).join("")}`;
}
function renderContactDetail() {
  const l = LEADS.find(x=>x.id===state.contactDetail) || lead();
  return `<div class="comm-detail-head simple">${commBackButton("contact-back")}<div class="detail-title"><strong>${esc(displayName(l.contact))}</strong><span>${esc(l.company)}</span></div></div><div class="contact-detail-wrap">${contactGroups(l)}</div>`;
}
function renderEmailDetail() {
  const d=state.emailDetail;
  const l=LEADS.find(x=>x.id===d?.leadId) || lead();
  const folder=d?.folder || state.emailFolder;
  if (d?.draft) {
    return `<div class="comm-detail-head simple">${commBackButton("email-back")}<div class="detail-title"><strong>${esc(d.draft.subject||"(no subject)")}</strong><span>Draft</span></div></div><div class="email-detail"><div class="email-meta">To ${esc(d.draft.to||"")}</div><div class="email-body">${d.draft.body||""}</div><button class="btn primary compact-action" data-act="compose">Edit draft</button></div>`;
  }
  const m=(l.mails||[])[d?.index];
  if (!m) return `<div class="empty">Email not found.</div>`;
  return `<div class="comm-detail-head simple">${commBackButton("email-back")}<div class="detail-title"><strong>${esc(m.sub||"(no subject)")}</strong><span>${esc(m.when||"")}</span></div></div><div class="email-detail"><div class="email-meta">From ${esc(m.from||"")}<br>To ${esc(m.to||"")}</div><p>${esc(m.preview||"")}</p><button class="btn compact-action" data-act="compose">Reply</button></div>`;
}
function renderDock() {
  const d = state.dial;
  const unread = 0;
  $("dock").innerHTML = `
    <div class="dock-head">
      <h2>Communications</h2>
      <span class="live ${["connected","dialing"].includes(d.status)?"show":""}" id="livePill"><i></i> On a call</span>
    </div>
    <div class="dock-tabs">
      ${[["all","All"],["msg","Messages"],["calls","Call log"],["people","Contacts"],["mail","Email"]].map(([k,lab]) => `<button class="${state.commsTab===k?"on":""}" data-act="comms-tab" data-k="${k}">${lab}${k==="msg" && unread ? ` <span class="unread">${unread}</span>` : ""}</button>`).join("")}
    </div>
    <div class="dock-body" id="commsBody">${renderComms()}</div>
    ${renderDialer(lead(), d)}`;
  placePad();
  window.ForgeShell?.setDeviceStatus(Boolean(device().on), device().name);
}
function renderComms() {
  if (state.commsTab === "msg") {
    if (state.messageThreadOpen) return renderMessageThread();
    const rows=messageConversations();
    return `<div class="comm-list">${rows.length ? rows.map(x=>`<button class="comm-row" data-act="message-open" data-lead="${x.lead.id}" data-n="${esc(x.number)}" data-ch="${esc(x.channel)}"><span class="comm-avatar" style="background:${avatarColor(x.lead)}">${esc(initials(x.lead.contact))}</span><span class="comm-main"><strong>${esc(displayName(x.lead.contact))}</strong><small>${esc(x.text)}</small></span><span class="comm-side"><time>${esc(x.when)}</time><em>${x.channel==="wa"?"WhatsApp":"SMS"}</em></span></button>`).join("") : '<div class="empty">No conversations.</div>'}</div>`;
  }
  if (state.commsTab === "calls") {
    if (state.callDetail) return renderCallDetail();
    const rows=allCallItems();
    return `<div class="comm-list">${rows.length ? rows.map(x=>`<button class="comm-row" data-act="call-open" data-lead="${x.lead.id}" data-i="${x.index}"><span class="comm-avatar" style="background:${avatarColor(x.lead)}">${esc(initials(x.lead.contact))}</span><span class="comm-main"><strong>${esc(x.who || x.n || displayName(x.lead.contact))}</strong><small>${callDirection(x)}${x.dur?` · ${esc(x.dur)}`:""}</small></span><span class="comm-side"><time>${esc(x.when||"")}</time><em>Call</em></span></button>`).join("") : '<div class="empty">No calls logged.</div>'}</div>`;
  }
  if (state.commsTab === "people") {
    if (state.contactDetail) return renderContactDetail();
    return `<div class="comm-list">${LEADS.map(l=>`<button class="comm-row" data-act="contact-open" data-lead="${l.id}"><span class="comm-avatar" style="background:${avatarColor(l)}">${esc(initials(l.contact))}</span><span class="comm-main"><strong>${esc(displayName(l.contact))}</strong><small>${esc(l.company)} · ${esc(l.mobiles?.[0]?.n || l.emails?.[0]?.n || "")}</small></span><span class="comm-side"><em>${l.mobiles?.[0]?.n ? "Phone" : "Email"}</em></span></button>`).join("")}</div>`;
  }
  if (state.commsTab === "mail") {
    if (state.emailDetail) return renderEmailDetail();
    const rows=allMailItems(state.emailFolder);
    return `<div class="mail-tools"><label class="folder-picker">${ico("folder",14)}<select id="mailFolder" aria-label="Email folder"><option value="inbox" ${state.emailFolder==="inbox"?"selected":""}>Inbox</option><option value="sent" ${state.emailFolder==="sent"?"selected":""}>Sent</option><option value="drafts" ${state.emailFolder==="drafts"?"selected":""}>Drafts</option><option value="archive" ${state.emailFolder==="archive"?"selected":""}>Archive</option></select></label><button class="btn primary mail-compose" data-act="compose">Compose</button></div><div class="comm-list">${rows.length ? rows.map(x=>`<button class="comm-row mail-row" data-act="email-open" data-lead="${x.lead.id}" ${x.kind==="draft"?`data-draft="1"`: `data-i="${x.index}"`}><span class="comm-main"><strong>${esc(x.sub||"(no subject)")}</strong><small>${esc(x.kind==="draft"?`To ${x.to||""}`:`${x.from||""} · ${x.preview||""}`)}</small></span><span class="comm-side"><time>${esc(x.when||"")}</time><em>${x.kind==="draft"?"Draft":"Email"}</em></span></button>`).join("") : '<div class="empty">No email in this folder.</div>'}</div>`;
  }
  const rows=allTimelineItems();
  return `<div class="comm-list">${rows.length ? rows.map(x=>`<button class="comm-row" data-act="timeline-open" data-kind="${x.kind}" data-lead="${x.lead.id}" data-i="${x.index}" ${x.number?`data-n="${esc(x.number)}"`:""} ${x.channel?`data-ch="${esc(x.channel)}"`:""} ${x.folder?`data-folder="${x.folder}"`:""}><span class="comm-avatar" style="background:${avatarColor(x.lead)}">${esc(initials(x.lead.contact))}</span><span class="comm-main"><strong>${esc(x.title)}</strong><small>${esc(x.preview)}</small></span><span class="comm-side"><time>${esc(x.when)}</time><em>${esc(x.typeLabel)}</em></span></button>`).join("") : '<div class="empty">No communications.</div>'}</div>`;
}
function renderDialer(l, d) {
  const live = ["connected","dialing"].includes(d.status);
  const idle = d.status === "idle" || d.status === "ended";
  const who = idle ? "Dialer ready" : (d.contact || displayName(l.contact));
  const num = d.number || "";
  const st = idle ? "Ready" : d.status==="dialing" ? "Calling" : d.status==="incoming" ? "Incoming" : "Connected";
  const display = idle ? (num || "") : (d.dtmf || num);
  return `<div class="dialer">
    <div class="who"><div class="nm">${esc(who)}</div><div class="sub">${idle ? esc(device().name) : `${esc(num)} · ${esc(device().name)}`}</div></div>
    <div class="lcd"><div class="st">${st}${live ? " · " + fmtElapsed(d.elapsed) : ""}</div><div id="timer">${esc(display)}</div></div>
    <div class="dacts">
      ${idle ? `
        <button data-act="devices" title="Device" aria-label="Device">${ico("phone",14)}</button>
        <button data-act="toggle-pad" class="${state.keypadOpen?"on":""}" title="Keypad" aria-label="Keypad">${ico("grid",14)}</button>
        <button class="callgo" data-act="call" data-n="${esc(num)}" data-who="" ${num ? "" : "disabled"}>Call</button>` : `
        <button data-act="mute" class="${d.muted?"on":""}" title="Mute" aria-label="Mute">${ico("mic",14)}</button>
        <button data-act="spk" class="${d.speaker?"on":""}" title="Speaker" aria-label="Speaker">${ico("spk",14)}</button>
        <button data-act="toggle-pad" class="${state.keypadOpen?"on":""}" title="Keypad" aria-label="Keypad">${ico("grid",14)}</button>
        <button class="hang" data-act="hang">Hang up</button>`}
    </div>
  </div>`;
}
function renderAll() {
  renderRail();
  renderDesk();
  renderDock();
  renderModal();
}
function openCompose(opts) {
  const l = lead();
  const emails = l.emails.map(e => e.n);
  state.modal = {
    type: "compose",
    to: opts.to || emails[0],
    cc: opts.cc || "",
    bcc: opts.bcc != null ? opts.bcc : (opts.all ? emails.slice(1).join(", ") : ""),
    subject: opts.subject || "",
    body: opts.body || `<div>Hi ${displayName(l.contact).split(" ")[0]},</div><div><br></div><div></div><div><br></div><div>Cole Brennan<br>Forge · Merchant desk<br>(212) 555-0140</div>`
  };
  renderModal();
}
