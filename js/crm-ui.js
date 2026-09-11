function messageAttachmentsHtml(attachments=[]) {
  return attachments.map(a => {
    const type = String(a.type || "");
    if (type.startsWith("image/") && a.url) return `<img class="message-media" src="${esc(a.url)}" alt="${esc(a.name || "Image")}" />`;
    if (type.startsWith("video/") && a.url) return `<video class="message-media" src="${esc(a.url)}" controls preload="metadata"></video>`;
    if (type.startsWith("audio/") && a.url) return `<audio class="message-audio" src="${esc(a.url)}" controls preload="metadata"></audio>`;
    return `<span class="message-file">${ico("file",14)}<span>${esc(a.name || "File")}</span></span>`;
  }).join("");
}
function emojiOnlyClass(text) {
  const clean = String(text || "").trim();
  if (!clean) return "";
  const matches = clean.match(/\p{Extended_Pictographic}/gu) || [];
  const remainder = clean.replace(/\p{Extended_Pictographic}|\p{Emoji_Modifier}|\uFE0F|\u200D|\s/gu, "");
  return matches.length >= 1 && matches.length <= 3 && !remainder ? " emoji-only" : "";
}
function renderComposerAttachments() {
  if (!state.composerAttachments.length) return "";
  return `<div class="composer-attachments">${state.composerAttachments.map((a,i)=>`<div class="composer-attachment">${a.type?.startsWith("image/") && a.url ? `<img src="${esc(a.url)}" alt="" />` : `<span class="attachment-file-icon">${ico(a.type?.startsWith("video/")?"video":a.type?.startsWith("audio/")?"audio":"file",15)}</span>`}<span class="attachment-name">${esc(a.name)}</span><button data-act="attachment-remove" data-i="${i}" aria-label="Remove ${esc(a.name)}">${ico("x",12)}</button></div>`).join("")}</div>`;
}
function renderAttachmentMenu() {
  const choices = [
    ["photos","Photos","image"],["camera","Camera","camera"],["videos","Videos","video"],["files","Files","file"],
    ["documents","PDFs / documents","file"],["audio","Audio","audio"],["multiple","Multiple attachments","plus"],["emoji","Large Emoji","smile"],["gif","GIFs","gif"]
  ];
  return `<div class="attachment-menu ${state.composerMenu?"open":""}">${choices.map(([k,label,icon])=>`<button data-act="attach-choice" data-k="${k}">${ico(icon,16)}<span>${label}</span></button>`).join("")}</div>`;
}
function renderEmojiPicker() {
  const emojis=["😀","😂","😍","🥳","👍","👏","🙏","🔥","✅","💯","💰","📈","🤝","🎉","❤️","🚀","😎","🤔","🙌","💪","📞","📩","🏦","⭐"];
  return `<div class="composer-picker emoji-picker ${state.emojiOpen?"open":""}"><div class="picker-head"><strong>Emoji</strong><button data-act="picker-close" aria-label="Close">${ico("x",14)}</button></div><div class="emoji-grid">${emojis.map(e=>`<button data-act="emoji-pick" data-emoji="${e}" aria-label="${e}">${e}</button>`).join("")}</div></div>`;
}
function renderGifPicker() {
  return `<div class="composer-picker gif-picker ${state.gifOpen?"open":""}"><div class="picker-head"><strong>GIFs</strong><button data-act="picker-close" aria-label="Close">${ico("x",14)}</button></div><label class="gif-search">${ico("search",14)}<input id="gifSearch" placeholder="Search GIFs" autocomplete="off" /></label><div class="gif-service-empty"><div class="gif-placeholder">GIF</div><strong>GIF service not connected</strong><span>Search needs a real GIF API. No fake GIF results are shown.</span></div></div>`;
}
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
    <div class="thread">${msgs.length ? msgs.map(m=>`<div class="bubble ${m.dir==="out"?"out":"in"} ${m.ch==="wa"?"wa":""}${emojiOnlyClass(m.txt)}">${messageAttachmentsHtml(m.attachments)}${m.txt?`<span class="bubble-text">${esc(m.txt)}</span>`:""}<div class="t">${esc(exactTimestamp(m.t))}</div></div>`).join("") : `<div class="empty">No ${ch==="wa"?"WhatsApp":"SMS"} messages on this number.</div>`}</div>
    <div class="composer-shell">${renderComposerAttachments()}${renderAttachmentMenu()}${renderEmojiPicker()}${renderGifPicker()}<div class="composer"><button class="composer-plus" data-act="attach-toggle" aria-label="Add attachment">${ico("plus",16)}</button><textarea id="smsBox" rows="1" placeholder="Message…"></textarea><button class="composer-action" data-act="send-sms" aria-label="Send">${ico("send",16)}</button><input id="composerFileInput" type="file" hidden /></div></div>`;
}
function renderCallDetail() {
  const detail = state.callDetail;
  const l = LEADS.find(x=>x.id===detail?.leadId) || lead();
  const c = (l.calls || [])[detail?.index] || (l.calls || [])[0];
  if (!c) return `<div class="empty">Call not found.</div>`;
  const history=(l.calls||[]).filter(x=>x.n===c.n);
  return `<div class="comm-detail-head simple">${commBackButton("call-back")}<div class="detail-title"><strong>${esc(c.who || displayName(l.contact))}</strong><span>${esc(c.n || "")}</span></div></div>
    <div class="comm-detail-card"><div class="detail-grid"><span>Type</span><strong>${callDirection(c)}</strong><span>Date / time</span><strong>${esc(exactTimestamp(c.when || ""))}</strong><span>Duration</span><strong>${esc(c.dur || "—")}</strong><span>Device</span><strong>${esc(c.dev || "—")}</strong></div>${c.note?`<p>${esc(c.note)}</p>`:""}<div class="call-detail-actions"><button class="btn primary compact-action" data-act="call" data-n="${esc(c.n)}" data-who="${esc(c.who||displayName(l.contact))}">${ico("phone",14)} Call</button><button class="btn compact-action" data-act="call-sms" data-n="${esc(c.n)}" data-lead="${l.id}">${ico("sms",14)} SMS</button></div></div>
    <div class="comm-subhead">History</div>${history.map(x=>`<div class="call-history-row"><span class="comm-type-cell">${commIcon("call", x)}</span><span class="comm-main"><strong>${callDirection(x)}</strong><small>${esc(exactTimestamp(x.when||""))} · ${esc(x.dur||"—")}</small></span></div>`).join("")}`;
}
function renderContactDetail() {
  const l = LEADS.find(x=>x.id===state.contactDetail) || lead();
  return `<div class="comm-detail-head simple">${commBackButton("contact-back")}<div class="detail-title"><strong>${esc(displayName(l.contact))}</strong><span>${esc(l.company)}</span></div></div><div class="contact-detail-wrap">${contactGroups(l)}</div>`;
}
function renderEmailDetail() {
  const d=state.emailDetail;
  const l=LEADS.find(x=>x.id===d?.leadId) || lead();
  if (d?.draft) {
    return `<div class="comm-detail-head simple">${commBackButton("email-back")}<div class="detail-title"><strong>${esc(d.draft.subject||"(no subject)")}</strong><span>Draft</span></div></div><div class="email-detail"><div class="email-meta">To ${esc(d.draft.to||"")}</div><div class="email-body">${d.draft.body||""}</div><button class="btn primary compact-action" data-act="compose">Edit draft</button></div>`;
  }
  const m=(l.mails||[])[d?.index];
  if (!m) return `<div class="empty">Email not found.</div>`;
  return `<div class="comm-detail-head simple">${commBackButton("email-back")}<div class="detail-title"><strong>${esc(m.sub||"(no subject)")}</strong><span>${esc(exactTimestamp(m.when||""))}</span></div></div><div class="email-detail"><div class="email-meta">From ${esc(m.from||"")}<br>To ${esc(m.to||"")}</div><p>${esc(m.preview||"")}</p><button class="btn compact-action" data-act="compose">Reply</button></div>`;
}
function renderDock() {
  const d = state.dial;
  $("dock").innerHTML = `
    <div class="dock-tabs" aria-label="Communications">
      ${[["all","All"],["msg","Messages"],["calls","Call log"],["people","Contacts"],["mail","Email"]].map(([k,lab]) => `<button class="${state.commsTab===k?"on":""}" data-act="comms-tab" data-k="${k}">${lab}</button>`).join("")}
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
    return `<div class="comm-list">${rows.length ? rows.map(x=>`<button class="comm-row" data-act="message-open" data-lead="${x.lead.id}" data-n="${esc(x.number)}" data-ch="${esc(x.channel)}"><span class="comm-type-cell">${commIcon("message", x)}</span><span class="comm-main"><strong>${esc(displayName(x.lead.contact))}</strong><small>${esc(x.text)}</small></span><span class="comm-side"><time>${esc(exactTimestamp(x.when))}</time><em>${x.channel==="wa"?"WhatsApp":"SMS"}</em></span></button>`).join("") : '<div class="empty">No conversations.</div>'}</div>`;
  }
  if (state.commsTab === "calls") {
    if (state.callDetail) return renderCallDetail();
    const rows=allCallItems();
    return `<div class="comm-list">${rows.length ? rows.map(x=>`<button class="comm-row" data-act="call-open" data-lead="${x.lead.id}" data-i="${x.index}"><span class="comm-type-cell">${commIcon("call", x)}</span><span class="comm-main"><strong>${esc(x.who || x.n || displayName(x.lead.contact))}</strong><small>${callDirection(x)}${x.dur?` · ${esc(x.dur)}`:""}</small></span><span class="comm-side"><time>${esc(exactTimestamp(x.when||""))}</time><em>Call</em></span></button>`).join("") : '<div class="empty">No calls logged.</div>'}</div>`;
  }
  if (state.commsTab === "people") {
    if (state.contactDetail) return renderContactDetail();
    return `<div class="contact-book">${contactGroupsByLetter().map(([letter, contacts]) => `<section class="contact-letter-group"><div class="contact-letter">${esc(letter)}</div>${contacts.map(l=>`<button class="contact-book-row" data-act="contact-open" data-lead="${l.id}"><span class="comm-main"><strong>${esc(displayName(l.contact))}</strong><small>${esc(l.company || l.mobiles?.[0]?.n || l.emails?.[0]?.n || "")}</small></span><span class="contact-primary">${esc(l.mobiles?.[0]?.n || l.emails?.[0]?.n || "")}</span></button>`).join("")}</section>`).join("")}</div>`;
  }
  if (state.commsTab === "mail") {
    if (state.emailDetail) return renderEmailDetail();
    const rows=allMailItems(state.emailFolder);
    return `<div class="mail-tools"><label class="folder-picker">${ico("folder",14)}<select id="mailFolder" aria-label="Email folder"><option value="inbox" ${state.emailFolder==="inbox"?"selected":""}>Inbox</option><option value="sent" ${state.emailFolder==="sent"?"selected":""}>Sent</option><option value="drafts" ${state.emailFolder==="drafts"?"selected":""}>Drafts</option><option value="archive" ${state.emailFolder==="archive"?"selected":""}>Archive</option></select></label><button class="btn primary mail-compose" data-act="compose">Compose</button></div><div class="comm-list">${rows.length ? rows.map(x=>`<button class="comm-row mail-row" data-act="email-open" data-lead="${x.lead.id}" ${x.kind==="draft"?`data-draft="1"`: `data-i="${x.index}"`}><span class="comm-type-cell">${commIcon("email", x)}</span><span class="comm-main"><strong>${esc(x.sub||"(no subject)")}</strong><small>${esc(x.kind==="draft"?`To ${x.to||""}`:`${x.from||""} · ${x.preview||""}`)}</small></span><span class="comm-side"><time>${esc(exactTimestamp(x.when||""))}</time><em>${x.kind==="draft"?"Draft":"Email"}</em></span></button>`).join("") : '<div class="empty">No email in this folder.</div>'}</div>`;
  }
  const rows=allTimelineItems();
  return `<div class="comm-list">${rows.length ? rows.map(x=>`<button class="comm-row" data-act="timeline-open" data-kind="${x.kind}" data-lead="${x.lead.id}" data-i="${x.index}" ${x.number?`data-n="${esc(x.number)}"`:""} ${x.channel?`data-ch="${esc(x.channel)}"`:""} ${x.folder?`data-folder="${x.folder}"`:""}><span class="comm-type-cell">${commIcon(x.kind, x)}</span><span class="comm-main"><strong>${esc(x.title)}</strong><small>${esc(x.preview)}</small></span><span class="comm-side"><time>${esc(exactTimestamp(x.when))}</time><em>${esc(x.typeLabel)}</em></span></button>`).join("") : '<div class="empty">No communications.</div>'}</div>`;
}
function renderDialer(l, d) {
  const live = ["connected","dialing"].includes(d.status);
  const idle = d.status === "idle" || d.status === "ended";
  const who = d.contact || displayName(l.contact);
  const status = idle ? "Ready" : d.status === "dialing" ? "Calling" : d.hold ? "On hold" : "Connected";
  return `<div class="dialer ${live?"active":"idle"}">
    <div class="dial-main">
      ${idle ? `<label class="dial-entry"><span>${status}</span><input id="dialInput" inputmode="tel" autocomplete="off" aria-label="Phone number" placeholder="Enter number" value="${esc(d.number || "")}" /></label>` : `<div class="dial-live"><strong>${esc(who || d.number || "Call")}</strong><span>${esc(d.number || "")} · ${status} · <b id="timer">${fmtElapsed(d.elapsed)}</b></span></div>`}
    </div>
    <div class="dacts">
      ${idle ? `
        <button data-act="devices" title="Speaker / Device" aria-label="Speaker / Device">${ico("spk",15)}</button>
        <button data-act="toggle-pad" class="${state.keypadOpen?"on":""}" title="Keypad" aria-label="Keypad">${ico("grid",15)}</button>
        <button class="callgo" data-act="call" data-who="" title="Call">${ico("phone",15)}<span>Call</span></button>` : `
        <button data-act="mute" class="${d.muted?"on":""}" title="Mute" aria-label="Mute">${ico("mic",15)}</button>
        <button data-act="hold" class="${d.hold?"on":""}" title="Hold" aria-label="Hold">${ico("hold",15)}</button>
        <button data-act="toggle-pad" class="${state.keypadOpen?"on":""}" title="Keypad" aria-label="Keypad">${ico("grid",15)}</button>
        <button data-act="devices" title="Speaker / Device" aria-label="Speaker / Device">${ico("spk",15)}</button>
        <button data-act="add-call" title="Add Call" aria-label="Add Call">${ico("plus",15)}</button>
        <button data-act="transfer" title="Transfer" aria-label="Transfer">${ico("transfer",15)}</button>
        <button data-act="call-notes" title="Notes" aria-label="Notes">${ico("note",15)}</button>
        <button class="hang" data-act="hang" title="End Call" aria-label="End Call">${ico("endcall",16)}</button>`}
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
