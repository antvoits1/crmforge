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
  searchOpen: false,
  commsTab: "all",
  threadN: "",
  threadCh: "sms",
  messageThreadOpen: false,
  callDetail: null,
  contactDetail: null,
  emailFolder: "inbox",
  emailDetail: null,
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
    signal: '<path d="M5 16.5h2.5V19H5zM9.5 13h2.5v6H9.5zM14 9.5h2.5V19H14zM18.5 6H21v13h-2.5z"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
    left: '<path d="m15 18-6-6 6-6"/>',
    right: '<path d="m9 18 6-6-6-6"/>',
    back: '<path d="m15 18-6-6 6-6"/><path d="M9 12h10"/>',
    folder: '<path d="M3 7h7l2 2h9v10H3z"/>'
  };
  return `<svg class="ui-ico" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${p[name]||""}</svg>`;
}
function toast(msg) {
  const el = $("toast"); el.textContent = msg; el.classList.add("show");
  clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.remove("show"), 2200);
}
function field(k,v){ return `<div class="field"><div class="k">${esc(k)}</div><div class="v">${v}</div></div>`; }
function companyRow(k,v){ return `<div class="company-row"><span class="k">${esc(k)}</span><span class="v">${v}</span></div>`; }
function documentIcon(label="DOCS") { return `<span class="doc-paper" aria-hidden="true"><span>${esc(label)}</span></span>`; }
function bsdValue(l) {
  const years = String(l.tib || "").match(/\d+/)?.[0] || "—";
  const d = new Date(String(l.started || "") + " 1");
  const month = Number.isNaN(d.getTime()) ? "—" : d.getMonth() + 1;
  const year = Number.isNaN(d.getTime()) ? "—" : d.getFullYear();
  return `${years} years · ${month}/${year}`;
}
function crmSearchResults(query) {
  const q = String(query || "").trim().toLowerCase();
  if (!q) return [];
  const rows = [];
  const add = (type, l, title, sub, extra={}) => {
    const hay = `${title} ${sub}`.toLowerCase();
    if (hay.includes(q)) rows.push({type, leadId:l.id, title, sub, ...extra});
  };
  LEADS.forEach(l => {
    add("lead", l, l.company, `${displayName(l.contact)} · ${l.industry || ""} · ${l.address || ""} · ${l.website || ""}`);
    [...(l.mobiles||[]), ...(l.landlines||[])].forEach(p => add("contact", l, p.n, `${displayName(l.contact)} · ${p.l || "Phone"}`, {number:p.n}));
    (l.emails||[]).forEach(p => add("contact", l, p.n, `${displayName(l.contact)} · Email`, {email:p.n}));
    (l.files||[]).forEach((f,i) => add("file", l, f.n, `${l.company} · ${f.t || "Document"}`, {index:i}));
    (l.sms||[]).forEach((m,i) => add("message", l, m.txt, `${displayName(l.contact)} · ${m.n || l.mobiles?.[0]?.n || ""} · ${m.ch === "wa" ? "WhatsApp" : "SMS"}`, {index:i, number:m.n || l.mobiles?.[0]?.n || "", channel:m.ch || "sms"}));
    (l.mails||[]).forEach((m,i) => add("email", l, m.sub, `${m.from || ""} · ${m.to || ""} · ${m.preview || ""}`, {index:i}));
    (l.calls||[]).forEach((c,i) => add("call", l, c.who || c.n, `${c.n || ""} · ${c.when || ""} · ${c.note || ""}`, {index:i}));
  });
  return rows.slice(0, 18);
}
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
  const phoneRows = (l.mobiles || []).map(p => `<div class="contact-line"><span class="val">${esc(p.n)}</span>${qactPhone(p.n, l.contact, true, true)}</div>`).join("");
  const emailRows = (l.emails || []).map(p => `<div class="contact-line"><span class="val email-value">${esc(p.n)}</span><div class="qacts"><button title="Email" aria-label="Email ${esc(p.n)}" data-act="email-one" data-n="${esc(p.n)}">${ico("mail",15)}</button></div></div>`).join("");
  const landRows = (l.landlines || []).map(p => `<div class="contact-line"><span class="val">${esc(p.n)}</span>${qactPhone(p.n, l.contact, false, false)}</div>`).join("");
  return `<div class="contact-group"><div class="contact-group-head"><h4>Mobile</h4></div>${phoneRows}</div>
    <div class="contact-group"><div class="contact-group-head"><h4>Email</h4><button class="contact-email-all" data-act="email-all" title="Email all" aria-label="Email all">${ico("mail",14)}</button></div>${emailRows}</div>
    <div class="contact-group"><div class="contact-group-head"><h4>Landline</h4></div>${landRows}</div>`;
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
  const available = Math.max(980 / factor, width - 10);
  const minRail = 320 / factor;
  const minDesk = 350 / factor;
  const minDock = 330 / factor;
  return {
    available,
    minRail,
    maxRail: Math.max(minRail, available - minDesk - minDock),
    targetRail: 460 / factor,
    minDesk,
    minDock
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
  pop.style.top = (r.bottom / factor - 70 - 12 - 214) + "px";
  pop.classList.add("open");
  pop.innerHTML = `<div class="pad">${[["1",""],["2","ABC"],["3","DEF"],["4","GHI"],["5","JKL"],["6","MNO"],["7","PQRS"],["8","TUV"],["9","WXYZ"],["*",""],["0","+"],["#",""]].map(([n,l]) =>
    `<button data-act="dtmf" data-k="${n}">${n}${l?`<small>${l}</small>`:""}</button>`).join("")}</div>`;
}

