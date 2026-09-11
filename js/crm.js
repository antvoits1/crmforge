const LS = { rail: "forge.v2.railW", dock: "forge.v2.dockW", custom: "forge.v2.panelCustom", fav: "forge.v2.favorites" };
function storeGet(k) {
  try { return localStorage.getItem(k); } catch (e) { return null; }
}
function storeSet(k, v) {
  try { localStorage.setItem(k, v); } catch (e) {}
}
function loadFavorites() {
  try {
    const saved = JSON.parse(localStorage.getItem(LS.fav) || "null");
    if (Array.isArray(saved)) return new Set(saved.filter(id => LEADS.some(l => l.id === id)));
  } catch (e) {}
  return new Set(LEADS.filter(l => l.fav).map(l => l.id));
}
function saveFavorites() { storeSet(LS.fav, JSON.stringify([...state.fav])); }
const state = {
  selected: "ns",
  filter: "all",
  query: "",
  commsTab: "all",
  threadN: "",
  threadCh: "sms",
  keypadOpen: false,
  activityExpanded: false,
  fav: loadFavorites(),
  follow: Object.fromEntries(LEADS.filter(l => l.follow).map(l => [l.id, l.follow])),
  modal: null,
  drafts: {},
  dial: { status:"idle", device:"poly", number:"", contact:"", elapsed:0, started:0, muted:false, speaker:false, dtmf:"" }
};
let tick = null;
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&"+"amp;","<":"&"+"lt;",">":"&"+"gt;",'"':"&"+"quot;","'":"&#39;"}[c]));
const money = (n) => n == null ? "—" : "$" + Math.round(n).toLocaleString("en-US");
const lead = () => LEADS.find(l => l.id === state.selected) || LEADS[0];
const device = () => DEVICES.find(d => d.id === state.dial.device) || DEVICES[0];
function displayName(n) { return String(n).replace(/^Dr\.\s+/i, ""); }
const AVATAR_COLORS = [
  "#4C5A78", "#5E6F5C", "#8A6F47", "#7A566F", "#3F6F73", "#6A6282",
  "#805C4B", "#596B79", "#6E7149", "#775A63", "#496579", "#756A58"
];
function avatarColor(l) {
  const sourceIndex = LEADS.findIndex(item => item.id === l.id);
  return AVATAR_COLORS[(sourceIndex >= 0 ? sourceIndex : 0) % AVATAR_COLORS.length];
}
function visibleAvatarColors(list) {
  let previous = "";
  return list.map(l => {
    let color = avatarColor(l);
    if (color === previous) {
      const index = (AVATAR_COLORS.indexOf(color) + 1) % AVATAR_COLORS.length;
      color = AVATAR_COLORS[index];
    }
    previous = color;
    return color;
  });
}
function industryWord(value) {
  const raw = String(value || "").trim();
  const known = {
    "catering · 2 units":"Catering",
    "trucking · 18 cabs":"Trucking",
    "dental · 3 chairs":"Dental",
    "collision repair":"Collision",
    "commercial interiors":"Interiors",
    "bar / restaurant":"Restaurant",
    "independent pharmacy":"Pharmacy",
    "hvac residential":"HVAC"
  };
  return known[raw.toLowerCase()] || raw.split(/[·/]/)[0].trim().split(/\s+/)[0] || "—";
}
function initials(n) {
  return displayName(n).split(/\s+/).slice(0,2).map(p => p[0]).join("").toUpperCase();
}
function ico(name, s=16) {
  const p = {
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6.4 6.4l1.2-1.2a2 2 0 0 1 2.1-.4c.8.2 1.7.5 2.6.6a2 2 0 0 1 1.7 2Z"/>',
    mail: '<path d="M4 4h16v16H4z"/><path d="m4 4 8 9 8-9"/>',
    sms: '<path d="M4 4h16v12H7l-3 4V4z"/>',
    wa: '<path d="M12 3a8 8 0 0 0-6.9 12.1L4 21l6-1.1A8 8 0 1 0 12 3z"/><path d="M9.2 9.6c.2-.5.3-.5.6-.5h.5c.2 0 .3.1.4.4l.6 1.5c.1.2 0 .4-.1.5l-.4.4c-.1.1-.1.3 0 .4.3.5.8 1 1.3 1.3.2.1.3.1.4 0l.4-.4c.2-.2.4-.2.5-.1l1.5.6c.2.1.4.2.4.4v.5c0 .2 0 .4-.5.6A6 6 0 0 1 9.2 9.6z"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
    spk: '<path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 9a4 4 0 0 1 0 6"/>',
    grid: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    send: '<path d="M4 12h16M14 6l6 6-6 6"/>',
    check: '<path d="M5 12.5l4 4 10-10"/>',
    star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2-4.5-4.4 6.2-.9L12 3z"/>',
    file: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v5h5"/>',
    signal: '<path d="M5 16.5h2.5V19H5zM9.5 13h2.5v6H9.5zM14 9.5h2.5V19H14zM18.5 6H21v13h-2.5z"/>'
  };
  return `<svg class="ui-ico" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${p[name]||""}</svg>`;
}
function toast(msg) {
  const el = $("toast"); el.textContent = msg; el.classList.add("show");
  clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.remove("show"), 2200);
}
function field(k,v){ return `<div class="field"><div class="k">${esc(k)}</div><div class="v">${v}</div></div>`; }
function fileIndex(l, test) {
  return Array.isArray(l.files) ? l.files.findIndex(test) : -1;
}
function applicationFileIndex(l) {
  return fileIndex(l, f => /application/i.test(String(f.n || "")) && /pdf/i.test(String(f.t || "")));
}
function statementFileIndex(l, label, mtd=false) {
  if (mtd) return fileIndex(l, f => /mtd/i.test(String(f.n || "")) && /pdf/i.test(String(f.t || "")));
  const month = String(label || "").trim().split(/\s+/)[0].toLowerCase();
  if (!month) return -1;
  return fileIndex(l, f => {
    const name = String(f.n || "").toLowerCase();
    return name.includes(month) && name.includes("statement") && /pdf/i.test(String(f.t || ""));
  });
}
function websiteUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  return /^https?:\/\//i.test(raw) ? raw : "https://" + raw;
}
function salesPitch(l) {
  const first = displayName(l.contact).split(" ")[0] || "there";
  const sentences = [];
  const revenue = Number.isFinite(Number(l.avg)) ? money(l.avg) : "";
  if (revenue && l.tib) sentences.push(`${first}, ${l.company} shows ${revenue} in monthly revenue and ${l.tib} in business.`);
  else if (revenue) sentences.push(`${first}, ${l.company} shows ${revenue} in monthly revenue.`);
  else if (l.tib) sentences.push(`${first}, ${l.company} has ${l.tib} in business.`);

  const latest = Array.isArray(l.stmts) && l.stmts.length ? l.stmts[0] : null;
  const approvalText = l.offer != null ? `The file is approved for ${money(l.offer)}${l.ask != null ? ` against a ${money(l.ask)} request` : ""}` : (l.ask != null ? `The current request is ${money(l.ask)}` : "");
  const statementText = latest ? `the latest completed statement shows ${money(latest.dep)} in deposits with a ${money(latest.end)} ending balance` : "";
  if (approvalText && statementText) sentences.push(`${approvalText}, and ${statementText}.`);
  else if (approvalText) sentences.push(approvalText + ".");
  else if (statementText) sentences.push(statementText.charAt(0).toUpperCase() + statementText.slice(1) + ".");

  if (l.use) sentences.push(`Keep the funding discussion centered on ${String(l.use).replace(/\.$/, "")} while tying the terms to the numbers already on file.`);
  else sentences.push("Keep the funding discussion tied to the verified revenue and bank activity already on file.");
  return sentences.slice(0,3).join(" ");
}
function fmtElapsed(s) {
  const m = Math.floor(s / 60), r = s % 60;
  return String(m).padStart(2,"0") + ":" + String(r).padStart(2,"0");
}
function filtered() {
  let list = LEADS.slice();
  if (state.filter === "mine") list = list.filter(l => l.rep === "Cole Brennan");
  if (state.filter === "star") list = list.filter(l => state.fav.has(l.id));
  if (state.filter === "today") list = list.filter(l => state.follow[l.id] === "2026-09-05");
  const q = state.query.trim().toLowerCase();
  if (q) list = list.filter(l => (l.company + l.contact + l.mobiles.map(p=>p.n).join(" ") + l.emails.map(e=>e.n).join(" ")).toLowerCase().includes(q));
  return list;
}
function qactPhone(n, who, sms, wa) {
  return `<div class="qacts">
    <button title="Call" data-act="call" data-n="${esc(n)}" data-who="${esc(who)}">${ico("phone",15)}</button>
    ${sms ? `<button title="SMS" data-act="sms" data-n="${esc(n)}">${ico("sms",15)}</button>` : ""}
    ${wa ? `<button title="WhatsApp" data-act="wa" data-n="${esc(n)}">${ico("wa",15)}</button>` : ""}
  </div>`;
}
function contactGroups(l) {
  return `<div class="contact-group">
      <div class="contact-group-head"><h4>Mobile</h4></div>
      ${l.mobiles.map(p => `<div class="contact-line"><span class="val">${esc(p.n)}</span>${qactPhone(p.n, l.contact, true, true)}</div>`).join("")}
    </div>
    <div class="contact-group">
      <div class="contact-group-head"><h4>Email</h4><button class="contact-email-all" data-act="email-all" title="Email all" aria-label="Email all">${ico("mail",14)}</button></div>
      ${l.emails.map(p => `<div class="contact-line"><span class="val">${esc(p.n)}</span><div class="qacts"><button title="Email" aria-label="Email ${esc(p.n)}" data-act="email-one" data-n="${esc(p.n)}">${ico("mail",15)}</button></div></div>`).join("")}
    </div>
    <div class="contact-group">
      <div class="contact-group-head"><h4>Landline</h4></div>
      ${l.landlines.map(p => `<div class="contact-line"><span class="val">${esc(p.n)}</span>${qactPhone(p.n, l.contact, false, false)}</div>`).join("")}
    </div>`;
}
function screenFactor() {
  const value = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--screen-factor"));
  return Number.isFinite(value) && value > 0 ? value : 1;
}
function panelCssWidth(el) {
  return el ? el.getBoundingClientRect().width / screenFactor() : 0;
}
function panelMetrics() {
  const main = $("main");
  const factor = screenFactor();
  const width = main ? main.clientWidth : 1200 / factor;
  return {
    available: Math.max(1020 / factor, width - 10),
    minRail: 440 / factor,
    maxRail: 480 / factor,
    targetRail: 460 / factor,
    minDesk: 300 / factor,
    minDock: 280 / factor
  };
}
function setPanelWidths(railW, dockW, persist=false) {
  const m = panelMetrics();
  const rail = Math.max(m.minRail, Math.min(m.maxRail, Number(railW) || m.targetRail));
  const dockMax = Math.max(m.minDock, m.available - rail - m.minDesk);
  const dock = Math.max(m.minDock, Math.min(dockMax, Number(dockW) || m.minDock));
  document.documentElement.style.setProperty("--rail-w", Math.round(rail) + "px");
  document.documentElement.style.setProperty("--dock-w", Math.round(dock) + "px");
  if (persist) { storeSet(LS.rail, Math.round(rail)); storeSet(LS.dock, Math.round(dock)); }
}
function resetPanelWidths(persist=true) {
  const m = panelMetrics();
  const rail = Math.min(m.targetRail, m.maxRail);
  const remaining = Math.max(m.minDesk + m.minDock, m.available - rail);
  const dock = remaining / 2;
  setPanelWidths(rail, dock, persist);
  if (persist) storeSet(LS.custom, "0");
}
function applyWidths() {
  const custom = storeGet(LS.custom) === "1";
  const r = Number(storeGet(LS.rail));
  const d = Number(storeGet(LS.dock));
  if (custom && Number.isFinite(r) && Number.isFinite(d)) setPanelWidths(r, d, false);
  else resetPanelWidths(false);
}
function placePad() {
  const pop = $("padPop");
  const dock = $("dock");
  if (!pop || !dock) return;
  if (!state.keypadOpen) { pop.classList.remove("open"); return; }
  const r = dock.getBoundingClientRect();
  const factor = screenFactor();
  pop.style.left = (r.right / factor - 244) + "px";
  pop.style.top = (r.bottom / factor - 75 - 12 - 214) + "px";
  pop.classList.add("open");
  pop.innerHTML = `<div class="pad">${[["1",""],["2","ABC"],["3","DEF"],["4","GHI"],["5","JKL"],["6","MNO"],["7","PQRS"],["8","TUV"],["9","WXYZ"],["*",""],["0","+"],["#",""]].map(([n,l]) =>
    `<button data-act="dtmf" data-k="${n}">${n}${l?`<small>${l}</small>`:""}</button>`).join("")}</div>`;
}

function ensureRailShell() {
  if ($("leadList")) return;
  $("rail").innerHTML = `
    <div class="rail-head">
      <h2>Leads <span class="dim" id="leadCount">0</span></h2>
      <button class="btn" style="margin-left:auto;height:28px;padding:0 10px" data-act="toast" data-msg="New lead is read-only in this desk.">${ico("plus",14)} New</button>
    </div>
    <div class="rail-search-wrap">
      <label class="search">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3-3"/></svg>
        <input id="q" placeholder="Search leads, phones, companies" autocomplete="off" />
        <kbd>/</kbd>
      </label>
    </div>
    <div class="filters" id="leadFilters"></div>
    <div class="lead-list pane" id="leadList"></div>`;
}
function renderRail() {
  ensureRailShell();
  const list = filtered();
  $("leadCount").textContent = list.length;
  $("leadFilters").innerHTML = [["all","All"],["mine","Mine"],["star","Starred"],["today","Due today"]].map(([k,l]) =>
    `<button class="chip ${state.filter===k?"on":""}" data-act="filter" data-k="${k}">${l}</button>`).join("");
  const avatarColors = visibleAvatarColors(list);
  $("leadList").innerHTML = list.map((l, index) => `
    <button class="lead-row ${l.id===state.selected?"on":""}" data-act="select" data-id="${l.id}">
      <span class="av" style="background:${avatarColors[index]}">${esc(initials(l.contact))}</span>
      <span>
        <div class="co">${esc(l.company)}</div>
        <div class="nm">${esc(displayName(l.contact))}</div>
      </span>
      <span class="right">
        <span class="amt">${money(l.avg)}</span>
        <span class="ago">${esc(l.lastAgo)}</span>
      </span>
    </button>`).join("") || `<div class="empty">No leads match.</div>`;
}

function renderDesk() {
  const l = lead();
  const appFile = applicationFileIndex(l);
  const hasStatementAddress = Boolean(l.statementAddress && l.statementAddress !== l.address);
  const completedStatements = (Array.isArray(l.stmts) ? l.stmts : []).slice(0, 3);
  const activities = state.activityExpanded ? l.activity : l.activity.slice(0, 2);
  const website = websiteUrl(l.website);
  const companyFields = [
    l.dba ? field("DBA", esc(l.dba)) : "",
    l.industry ? field("Industry", esc(industryWord(l.industry))) : "",
    l.tib ? field("Time in business", esc(l.tib)) : "",
    Number.isFinite(Number(l.avg)) ? field("Annual revenue", money(l.avg * 12)) : "",
    l.ask != null ? field("Requested", money(l.ask)) : "",
    hasStatementAddress ? field("Statement address", esc(l.statementAddress)) : "",
    website ? field("Website", `<a href="${esc(website)}" target="_blank" rel="noopener">${esc(l.website)}</a>`) : ""
  ].filter(Boolean).join("");
  const statementRows = completedStatements.map(s => {
    const i = statementFileIndex(l, s.m, false);
    return `<tr><td><span class="statement-month">${esc(s.m)}${i >= 0 ? `<button class="statement-pdf" data-act="file" data-i="${i}" title="Open ${esc(s.m)} statement" aria-label="Open ${esc(s.m)} statement">${ico("file",14)}</button>` : ""}</span></td><td>${money(s.dep)}</td><td>${money(s.end)}</td></tr>`;
  }).join("");
  const mtdRow = l.mtd ? (() => {
    const i = statementFileIndex(l, l.mtd.m, true);
    return `<tr><td><span class="statement-month">MTD · ${esc(l.mtd.m)}${i >= 0 ? `<button class="statement-pdf" data-act="file" data-i="${i}" title="Open MTD statement" aria-label="Open MTD statement">${ico("file",14)}</button>` : ""}</span></td><td>${money(l.mtd.dep)}</td><td>${money(l.mtd.bal)}</td></tr>`;
  })() : "";

  $("desk").innerHTML = `
    <div class="desk-scroll">
      <div class="rec-head">
        <div class="rec-main">
          <div class="rec-title-line">
            <span class="rec-avatar" style="background:${avatarColor(l)}" aria-hidden="true">${esc(initials(l.contact))}</span>
            <h1>${esc(l.company)}</h1>
            ${appFile >= 0 ? `<button class="doc-link" data-act="file" data-i="${appFile}" title="Open application" aria-label="Open application PDF">${ico("file",17)}</button>` : ""}
            <button class="favorite-btn ${state.fav.has(l.id) ? "on" : ""}" data-act="favorite" title="${state.fav.has(l.id) ? "Remove from starred" : "Add to starred"}" aria-label="${state.fav.has(l.id) ? "Remove from starred" : "Add to starred"}">${ico("star",17)}</button>
          </div>
          <div class="rec-who">${esc(displayName(l.contact))} · ${esc(l.title)}</div>
          <div class="rec-meta">
            ${l.address ? `<div class="rec-meta-line">${esc(l.address)}</div>` : ""}
            <div class="rec-meta-line">${[
              l.ein ? `EIN ${esc(l.ein)}` : "",
              l.ssn ? `SSN ${esc(l.ssn)}` : "",
              l.dob ? `DOB ${esc(l.dob)}` : "",
              l.started ? `Opened ${esc(l.started)}` : ""
            ].filter(Boolean).join(" · ")}</div>
          </div>
        </div>
        <div class="rec-summary" aria-label="Lead summary">
          <div class="summary-item"><div class="k">Monthly Revenue</div><div class="v">${money(l.avg)}</div></div>
          <div class="summary-item"><div class="k">Approval Amount</div><div class="v">${money(l.offer)}</div></div>
        </div>
      </div>

      <div class="middle-body">
        <div class="paired-row">
          <section class="paired-section">
            <h3>Contact</h3>
            ${contactGroups(l)}
          </section>
          <section class="paired-section">
            <h3>Company</h3>
            <div class="fields">${companyFields || '<div class="muted">No additional company details on file.</div>'}</div>
          </section>
        </div>

        <div class="paired-row">
          <section class="paired-section">
            <h3>Statements</h3>
            ${(statementRows || mtdRow) ? `<table class="statement-table"><thead><tr><th>Month</th><th>Deposits</th><th>Ending</th></tr></thead><tbody>${statementRows}${mtdRow}</tbody></table>` : '<div class="muted">No statement data on file.</div>'}
          </section>
          <section class="paired-section">
            <h3>Bank Account</h3>
            <div class="fields">
              ${l.bank?.name ? field("Bank", esc(l.bank.name)) : ""}
              ${l.bank?.acct ? field("Account", esc(l.bank.acct)) : ""}
              ${l.bank?.routing ? field("Routing", esc(l.bank.routing)) : ""}
              ${l.bank?.type ? field("Type", esc(l.bank.type)) : ""}
              ${l.bank?.adb != null ? field("Average daily balance", money(l.bank.adb)) : ""}
            </div>
          </section>
        </div>

        <section class="section-block">
          <div class="section-title"><h3>Sales Pitch</h3></div>
          <p class="sales-pitch">${esc(salesPitch(l))}</p>
        </section>

        <section class="section-block">
          <div class="section-title"><h3>Latest Activity</h3></div>
          <div class="activity-list">
            ${activities.length ? activities.map(a => `<div class="activity-row"><div class="when">${esc(a.when)}</div><div>${esc(a.what)}</div></div>`).join("") : '<div class="muted">No activity on file.</div>'}
          </div>
          ${l.activity.length > 2 ? `<button class="linkish" data-act="activity-toggle">${state.activityExpanded ? "Show less" : `Show ${l.activity.length - 2} older`}</button>` : ""}
        </section>
      </div>
    </div>`;
}

function renderDock() {
  const l = lead();
  const d = state.dial;
  const unread = l.sms.filter(m => m.dir === "in").length ? 1 : 0;
  if (!state.threadN) state.threadN = l.mobiles[0].n;
  $("dock").innerHTML = `
    <div class="dock-head">
      <h2>Communications</h2>
      <span class="live ${["connected","dialing"].includes(d.status)?"show":""}" id="livePill"><i></i> On a call</span>
      <button class="icon-btn device-status ${device().on?"connected":""}" data-act="devices" title="${esc(device().name)} · ${device().on?"Connected":"Disconnected"}" aria-label="Switch calling device">${ico("signal",16)}<span class="status-dot"></span></button>
      <span class="dim contact-label">${esc(displayName(l.contact))}</span>
    </div>
    <div class="dock-tabs">
      ${[["all","All"],["msg","Messages"],["calls","Call log"],["people","Contacts"],["mail","Email"]].map(([k,lab]) =>
        `<button class="${state.commsTab===k?"on":""}" data-act="comms-tab" data-k="${k}">${lab}${k==="msg" && unread ? ` <span class="unread">${unread}</span>` : ""}</button>`).join("")}
    </div>
    <div class="dock-body" id="commsBody">${renderComms(l)}</div>
    ${renderDialer(l, d)}`;
  placePad();
}

function threadMsgs(l) {
  const n = state.threadN || l.mobiles[0].n;
  const ch = state.threadCh || "sms";
  return l.sms.filter(m => (m.n || l.mobiles[0].n) === n && (m.ch || "sms") === ch);
}

function renderComms(l) {
  const tab = state.commsTab;
  const n = state.threadN || l.mobiles[0].n;
  if (tab === "msg") {
    const msgs = threadMsgs(l);
    return `
      <div class="num-switch">
        ${l.mobiles.map(p => `<button class="${n===p.n?"on":""}" data-act="thread-n" data-n="${esc(p.n)}">${esc(p.n)}</button>`).join("")}
        <button class="${state.threadCh==="sms"?"on":""}" data-act="thread-ch" data-k="sms">SMS</button>
        <button class="${state.threadCh==="wa"?"on":""}" data-act="thread-ch" data-k="wa">WhatsApp</button>
      </div>
      <div class="thread">${msgs.map(m => `
        <div class="bubble ${m.dir==="out"?"out":"in"} ${m.ch==="wa"?"wa":""}">${esc(m.txt)}<div class="t">${esc(m.t)}</div></div>`).join("") || `<div class="empty">No ${state.threadCh==="wa"?"WhatsApp":"SMS"} on this number.</div>`}</div>
      <div class="composer">
        <textarea id="smsBox" placeholder="Message ${esc(n)}…"></textarea>
        <button class="btn primary" data-act="send-sms">${ico("send",14)}</button>
      </div>`;
  }
  if (tab === "all") {
    return `<div class="thread">${l.sms.slice(-4).map(m => `<div class="bubble ${m.dir==="out"?"out":"in"} ${m.ch==="wa"?"wa":""}">${esc(m.txt)}<div class="t">${m.ch==="wa"?"WhatsApp":"SMS"} · ${esc(m.n || l.mobiles[0].n)} · ${esc(m.t)}</div></div>`).join("")}
      ${l.calls.slice(0,2).map(c => `<div class="bubble in"><strong>${c.dir==="in"?"Inbound":"Outbound"} call</strong> · ${esc(c.dur)}<div class="t">${esc(c.when)} · ${esc(c.dev)}</div></div>`).join("")}
      ${l.mails.slice(0,1).map(m => `<div class="bubble in"><strong>${esc(m.sub)}</strong><div class="t">${esc(m.when)}</div></div>`).join("")}
      </div>`;
  }
  if (tab === "mail") {
    return `${l.mails.map((m,i) => `<button class="mail" data-act="open-mail" data-i="${i}"><div class="sub">${esc(m.sub)}</div><div class="dim" style="margin-top:3px">${esc(m.from)} · ${esc(m.when)}</div><div class="pre">${esc(m.preview)}</div></button>`).join("") || `<div class="empty">No email.</div>`}
      <div style="padding:12px 16px"><button class="btn primary" data-act="compose">${ico("mail",14)} Compose</button></div>`;
  }
  if (tab === "calls") {
    return l.calls.map(c => `
      <div class="call-row">
        <div class="row-between"><strong>${c.dir==="in"?"Inbound":"Outbound"} · ${esc(c.who)}</strong><span class="num">${esc(c.dur)}</span></div>
        <div class="dim" style="margin-top:3px">${esc(c.when)} · ${esc(c.dev)} · ${esc(c.n)}</div>
        <p style="margin-top:6px">${esc(c.note)}</p>
        <button class="btn" style="margin-top:8px;height:28px" data-act="call" data-n="${esc(c.n)}" data-who="${esc(c.who)}">${ico("phone",14)} Call back</button>
      </div>`).join("") || `<div class="empty">No calls logged.</div>`;
  }
  return `<div style="padding:8px 16px 16px">${contactGroups(l)}</div>`;
}

function renderDialer(l, d) {
  const live = ["connected","dialing"].includes(d.status);
  const who = d.contact || displayName(l.contact);
  const num = d.number || l.mobiles[0].n;
  const st = d.status==="idle" ? "Ready" : d.status==="dialing" ? "Calling" : d.status==="incoming" ? "Incoming" : "Connected";
  return `<div class="dialer">
    <div class="who">
      <div class="nm">${esc(who)}</div>
      <div class="sub">${esc(num)} · ${esc(device().name)}</div>
    </div>
    <div class="lcd">
      <div class="st">${st}${live ? " · " + fmtElapsed(d.elapsed) : ""}</div>
      <div id="timer">${esc(d.dtmf || num)}</div>
    </div>
    <div class="dacts">
      ${d.status==="idle" || d.status==="ended" ? `
        <button data-act="devices" title="Device">${ico("phone",14)}</button>
        <button data-act="toggle-pad" class="${state.keypadOpen?"on":""}" title="Keypad">${ico("grid",14)}</button>
        <button class="callgo" data-act="call" data-n="${esc(num)}" data-who="${esc(who)}">Call</button>` : `
        <button data-act="mute" class="${d.muted?"on":""}" title="Mute">${ico("mic",14)}</button>
        <button data-act="spk" class="${d.speaker?"on":""}" title="Speaker">${ico("spk",14)}</button>
        <button data-act="toggle-pad" class="${state.keypadOpen?"on":""}" title="Keypad">${ico("grid",14)}</button>
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

function renderModal() {
  const ov = $("overlay");
  const m = state.modal;
  if (!m) { ov.className = "overlay"; ov.innerHTML = ""; return; }
  ov.className = "overlay open";
  if (m.type === "compose") {
    ov.innerHTML = `<div class="modal wide">
      <div class="row-between"><h2 style="font-size:calc(16px * var(--font-factor))">New message</h2><button class="icon-btn" data-act="close">${ico("x")}</button></div>
      <div class="compose-row"><label>To</label><input id="cTo" value="${esc(m.to)}" /></div>
      <div class="compose-row"><label>Cc</label><input id="cCc" value="${esc(m.cc)}" /></div>
      <div class="compose-row"><label>Bcc</label><input id="cBcc" value="${esc(m.bcc)}" /></div>
      <div class="compose-row"><label>Subject</label><input id="cSub" value="${esc(m.subject)}" placeholder="Subject" /></div>
      <div class="tb">
        <button data-act="fmt" data-cmd="bold"><b>B</b></button>
        <button data-act="fmt" data-cmd="italic"><i>I</i></button>
        <button data-act="fmt" data-cmd="underline"><u>U</u></button>
        <select id="cFont" data-act="font">
          <option>Inter</option><option>Georgia</option><option>Times New Roman</option><option>Arial</option>
        </select>
        <select id="cSize" data-act="size">
          <option>13px</option><option selected>14px</option><option>16px</option><option>18px</option>
        </select>
        <input id="cColor" type="color" value="#1A1F26" title="Color" style="width:32px;height:28px;border:1px solid var(--line);border-radius:6px;padding:2px;background:var(--surface)" />
        <select id="cTpl" data-act="tpl">
          <option value="">Template</option>
          <option value="term">Term sheet follow-up</option>
          <option value="stip">Stip request</option>
          <option value="intro">Intro</option>
        </select>
        <button data-act="attach">Attach</button>
        <button data-act="draft">Save draft</button>
      </div>
      <div class="editor" id="cBody" contenteditable="true">${m.body}</div>
      <div class="row-between" style="margin-top:12px">
        <span class="dim" id="cAtt">No attachments</span>
        <button class="btn primary" data-act="send-mail">Send</button>
      </div>
    </div>`;
    $("cColor").addEventListener("input", (e) => document.execCommand("foreColor", false, e.target.value));
    return;
  }
  if (m.type === "file") {
    const f = lead().files[m.i];
    ov.innerHTML = `<div class="modal"><div class="row-between"><h2 style="font-size:calc(16px * var(--font-factor))">${esc(f.n)}</h2><button class="icon-btn" data-act="close">${ico("x")}</button></div>
      <div class="scan"><div class="scan-paper">
        <div style="letter-spacing:.12em;font-weight:600;font-size:calc(11px * var(--font-factor))">${esc(lead().bank.name.toUpperCase())}</div>
        <div class="row-between" style="margin-top:10px"><div>${esc(lead().company)}<br>${esc(lead().bank.acct)}</div><div>${esc(f.n)} · ${esc(f.p)}</div></div>
        <p style="margin-top:12px">Scanned file preview. ${esc(f.n)} for ${esc(lead().company)}.</p>
        <div style="height:140px;margin-top:12px;background:repeating-linear-gradient(0deg,#e8e0d4,#e8e0d4 12px,#efe8dc 12px,#efe8dc 24px);border-radius:4px"></div>
      </div></div></div>`;
    return;
  }
  if (m.type === "devices") {
    ov.innerHTML = `<div class="modal"><div class="row-between"><h2 style="font-size:calc(16px * var(--font-factor))">Calling as</h2><button class="icon-btn" data-act="close">${ico("x")}</button></div>
      ${DEVICES.map(d => `<button class="lead-row ${d.id===state.dial.device?"on":""}" data-act="set-device" data-id="${d.id}" style="padding-left:12px">
        <span class="av" style="background:${d.on?"#0F766E":"#8B949E"}">${ico("phone",14)}</span>
        <span><div class="co">${esc(d.name)}</div><div class="nm">${esc(d.kind)} · ${esc(d.did)} · ${d.on?"On":"Off"}</div></span>
      </button>`).join("")}</div>`;
    return;
  }
  if (m.type === "mail-read") {
    const mail = lead().mails[m.i];
    ov.innerHTML = `<div class="modal"><div class="row-between"><h2 style="font-size:calc(16px * var(--font-factor))">${esc(mail.sub)}</h2><button class="icon-btn" data-act="close">${ico("x")}</button></div>
      <div class="dim" style="margin-top:8px">${esc(mail.from)} · ${esc(mail.when)}</div>
      <p style="margin-top:16px;line-height:1.55">${esc(mail.preview)}</p>
      <button class="btn" style="margin-top:16px" data-act="compose">Reply</button>
    </div>`;
  }
}

function startCall(n, who) {
  state.modal = null;
  state.keypadOpen = false;
  state.dial.status = "dialing";
  state.dial.number = n;
  state.dial.contact = who || displayName(lead().contact);
  state.dial.muted = false; state.dial.elapsed = 0; state.dial.dtmf = "";
  renderAll();
  setTimeout(() => {
    if (state.dial.status !== "dialing") return;
    state.dial.status = "connected";
    state.dial.started = Date.now();
    startTick(); renderAll(); toast("Connected · " + device().name);
  }, 1400);
}
function startTick() {
  clearInterval(tick);
  tick = setInterval(() => {
    if (state.dial.status !== "connected") return;
    state.dial.elapsed = Math.floor((Date.now() - state.dial.started) / 1000);
    const t = $("timer");
    if (t) t.textContent = fmtElapsed(state.dial.elapsed);
  }, 1000);
}
function hang() {
  const l = lead();
  const dur = fmtElapsed(state.dial.elapsed);
  if (state.dial.status === "connected") {
    l.calls.unshift({who: state.dial.contact, dir:"out", dur, when:"Just now", dev: device().name, n: state.dial.number, note:"Logged from dialer."});
    l.activity.unshift({when:"Just now", what:`Call · ${state.dial.contact} · ${dur}`});
    l.lastAgo = "just now";
  }
  state.dial.status = "idle"; state.dial.elapsed = 0; state.dial.dtmf = ""; state.keypadOpen = false;
  clearInterval(tick); renderAll(); toast("Call ended");
}

function applyComposerSelect(select) {
  if (!select || !state.modal || state.modal.type !== "compose") return;
  const editor = $("cBody");
  if (!editor) return;
  if (select.id === "cFont") {
    editor.style.fontFamily = select.value;
    return;
  }
  if (select.id === "cSize") {
    editor.style.fontSize = select.value;
    return;
  }
  if (select.id === "cTpl") {
    const l = lead();
    const first = displayName(l.contact).split(" ")[0];
    const map = {
      term: {s:"Term sheet — " + l.company, b:`<div>Hi ${first},</div><div><br></div><div>Term sheet is attached. ${money(l.offer || l.ask)} as discussed. Call me when you’ve had a look.</div>`},
      stip: {s:"Stips outstanding — " + l.company, b:`<div>Hi ${first},</div><div><br></div><div>Need the remaining statements to lock the file. Everything else is in.</div>`},
      intro:{s:"Intro — " + l.company, b:`<div>Hi ${first},</div><div><br></div><div>Elena suggested we talk. I help shops like yours with working capital. Ten minutes this week?</div>`}
    };
    const choice = map[select.value];
    if (choice) {
      $("cSub").value = choice.s;
      editor.innerHTML = choice.b + `<div><br></div><div>Cole Brennan<br>Forge · Merchant desk</div>`;
    }
  }
}

document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-act]");
  if (!b) {
    if (state.keypadOpen && !e.target.closest("#padPop") && !e.target.closest("[data-act='toggle-pad']")) {
      state.keypadOpen = false; placePad();
    }
    return;
  }
  const act = b.dataset.act;
  const l = lead();
  if (act === "select") { state.selected = b.dataset.id; state.keypadOpen = false; state.activityExpanded = false; state.threadN = ""; state.threadCh = "sms"; renderAll(); return; }
  if (act === "filter") { state.filter = b.dataset.k; renderRail(); return; }
  if (act === "favorite") {
    if (state.fav.has(l.id)) state.fav.delete(l.id); else state.fav.add(l.id);
    saveFavorites(); renderRail(); renderDesk(); return;
  }
  if (act === "activity-toggle") { state.activityExpanded = !state.activityExpanded; renderDesk(); return; }
  if (act === "comms-tab") { state.commsTab = b.dataset.k; renderDock(); return; }
  if (act === "thread-n") { state.threadN = b.dataset.n; state.commsTab = "msg"; renderDock(); return; }
  if (act === "thread-ch") { state.threadCh = b.dataset.k; state.commsTab = "msg"; renderDock(); return; }
  if (act === "call") { startCall(b.dataset.n, b.dataset.who); return; }
  if (act === "hang") { hang(); return; }
  if (act === "mute") { state.dial.muted = !state.dial.muted; renderDock(); return; }
  if (act === "spk") { state.dial.speaker = !state.dial.speaker; renderDock(); return; }
  if (act === "toggle-pad") { state.keypadOpen = !state.keypadOpen; placePad(); return; }
  if (act === "dtmf") {
    const k = b.dataset.k;
    if (state.dial.status === "idle") {
      const raw = (state.dial.number || "").replace(/\D/g,"");
      if (raw.length < 10) state.dial.number = (state.dial.number || "") + k;
      renderDock();
    } else { state.dial.dtmf += k; toast("DTMF " + k); }
    return;
  }
  if (act === "devices") { state.modal = {type:"devices"}; renderModal(); return; }
  if (act === "set-device") { state.dial.device = b.dataset.id; state.modal = null; renderAll(); toast(device().name); return; }
  if (act === "sms" || act === "wa") {
    state.threadN = b.dataset.n;
    state.threadCh = act === "wa" ? "wa" : "sms";
    state.commsTab = "msg";
    renderDock();
    setTimeout(()=>$("smsBox")?.focus(), 40);
    return;
  }
  if (act === "send-sms") {
    const t = $("smsBox")?.value.trim(); if (!t) return;
    l.sms.push({dir:"out", ch: state.threadCh || "sms", n: state.threadN || l.mobiles[0].n, t:"Just now", txt:t});
    l.activity.unshift({when:"Just now", what:"SMS to " + l.contact});
    l.lastAgo = "just now";
    $("smsBox").value = ""; renderDock(); toast("Sent"); return;
  }
  if (act === "email-all") { openCompose({ all:true }); return; }
  if (act === "email-one") { openCompose({ to:b.dataset.n, bcc:"" }); return; }
  if (act === "compose") { openCompose({}); return; }
  if (act === "fmt") { document.execCommand(b.dataset.cmd, false, null); return; }
  if (act === "attach") { $("cAtt").textContent = "term-sheet.pdf"; toast("Attached term-sheet.pdf"); return; }
  if (act === "draft") {
    state.drafts[l.id] = { to:$("cTo").value, cc:$("cCc").value, bcc:$("cBcc").value, subject:$("cSub").value, body:$("cBody").innerHTML };
    toast("Draft saved"); return;
  }
  if (act === "send-mail") {
    const sub = $("cSub").value.trim() || "(no subject)";
    const body = $("cBody").innerText.trim();
    l.mails.unshift({sub, from:"Cole Brennan", to:$("cTo").value, when:"Just now", preview:body.slice(0,140)});
    l.activity.unshift({when:"Just now", what:"Email · " + sub});
    l.lastAgo = "just now";
    state.modal = null; renderAll(); toast("Sent"); return;
  }
  if (act === "open-mail") { state.modal = {type:"mail-read", i:+b.dataset.i}; renderModal(); return; }
  if (act === "file") { state.modal = {type:"file", i:+b.dataset.i}; renderModal(); return; }
  if (act === "close") { state.modal = null; renderModal(); return; }
  if (act === "toast") { toast(b.dataset.msg); return; }
});

ensureRailShell();
$("overlay").addEventListener("click", (e) => { if (e.target.id === "overlay") { state.modal = null; renderModal(); }});
$("q").addEventListener("input", (e) => { state.query = e.target.value; renderRail(); });
document.addEventListener("change", (e) => {
  const select = e.target.closest("#cFont, #cSize, #cTpl");
  if (select) applyComposerSelect(select);
});
document.addEventListener("keydown", (e) => {
  if (e.key === "/" && document.body.dataset.page === "leads" && !/INPUT|TEXTAREA/.test(document.activeElement.tagName) && document.activeElement.isContentEditable !== true) {
    e.preventDefault(); $("q").focus();
  }
  if (e.key === "Escape") { state.modal = null; state.keypadOpen = false; renderAll(); }
});
(function resize() {
  let side = null, startX = 0, startW = 0;
  document.addEventListener("mousedown", (e) => {
    const h = e.target.closest(".handle");
    if (!h) return;
    side = h.dataset.side;
    startX = e.clientX;
    startW = side === "rail" ? panelCssWidth($("rail")) : panelCssWidth($("dock"));
    h.classList.add("drag");
    e.preventDefault();
  });
  document.addEventListener("mousemove", (e) => {
    if (!side) return;
    const dx = (e.clientX - startX) / screenFactor();
    const m = panelMetrics();
    const railNow = panelCssWidth($("rail"));
    const dockNow = panelCssWidth($("dock"));
    if (side === "rail") {
      const maxRail = Math.min(m.maxRail, m.available - dockNow - m.minDesk);
      const w = Math.min(maxRail, Math.max(m.minRail, startW + dx));
      setPanelWidths(w, dockNow, false);
    } else {
      const dockMax = Math.max(m.minDock, m.available - railNow - m.minDesk);
      const w = Math.min(dockMax, Math.max(m.minDock, startW - dx));
      setPanelWidths(railNow, w, false);
    }
    placePad();
  });
  document.addEventListener("mouseup", () => {
    if (!side) return;
    document.querySelectorAll(".handle").forEach(h => h.classList.remove("drag"));
    storeSet(LS.rail, Math.round(panelCssWidth($("rail"))));
    storeSet(LS.dock, Math.round(panelCssWidth($("dock"))));
    storeSet(LS.custom, "1");
    side = null;
  });
  document.addEventListener("dblclick", (e) => {
    const h = e.target.closest(".handle");
    if (!h) return;
    if (h.dataset.side === "rail") {
      setPanelWidths(panelMetrics().targetRail, panelCssWidth($("dock")), true);
      storeSet(LS.custom, "1");
    } else {
      const m = panelMetrics();
      const rail = panelCssWidth($("rail"));
      setPanelWidths(rail, (m.available - rail) / 2, true);
      storeSet(LS.custom, "1");
    }
    placePad();
  });
})();
window.addEventListener("forge:reset-panels", () => { resetPanelWidths(true); placePad(); });
window.addEventListener("forge:layout-changed", () => {
  if (storeGet(LS.custom) === "1") setPanelWidths(panelCssWidth($("rail")), panelCssWidth($("dock")), false);
  else resetPanelWidths(false);
  placePad();
});
window.addEventListener("resize", () => {
  if (storeGet(LS.custom) === "1") setPanelWidths(panelCssWidth($("rail")), panelCssWidth($("dock")), false);
  else resetPanelWidths(false);
  placePad();
});

applyWidths();
try { renderAll(); }
catch (err) {
  const r = document.getElementById("rail");
  if (r) r.innerHTML = `<div class="empty" style="padding:24px">Couldn’t start the desk.<br><br>${esc(err && err.message)}</div>`;
}