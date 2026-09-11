function ensureRailShell() {
  if ($("leadList")) return;
  $("rail").innerHTML = `
    <div class="rail-head">
      <h2>Leads <span class="dim" id="leadCount">0</span></h2>
      <div class="rail-head-actions">
        <button class="icon-btn rail-search-btn" data-act="search-toggle" title="Search CRM" aria-label="Search CRM">${ico("search",16)}</button>
        <button class="icon-btn rail-filter-btn" data-act="filter-toggle" title="Filter leads" aria-label="Filter leads" aria-expanded="false">${ico("filter",16)}</button>
      </div>
      <div class="lead-filter-menu" id="leadFilterMenu" role="menu"></div>
      <div class="crm-search-pop" id="crmSearchPop">
        <label class="crm-search-input">${ico("search",14)}<input id="q" autocomplete="off" aria-label="Search CRM" /></label>
        <div class="crm-search-results" id="crmSearchResults"></div>
      </div>
    </div>
    <div class="lead-list pane" id="leadList"></div>`;
}
function renderLeadFilterMenu() {
  const menu = $("leadFilterMenu");
  const button = document.querySelector(".rail-filter-btn");
  if (!menu || !button) return;
  menu.classList.toggle("open", state.filterOpen);
  button.classList.toggle("on", state.filter !== "all");
  button.setAttribute("aria-expanded", String(state.filterOpen));
  menu.innerHTML = [["all","All"],["star","Starred"],["hot","Hot"]].map(([k,label]) =>
    `<button class="lead-filter-option ${state.filter===k?"on":""}" data-act="filter" data-k="${k}" role="menuitemradio" aria-checked="${state.filter===k}"><span>${label}</span>${state.filter===k?ico("check",14):""}</button>`
  ).join("");
}
function renderSearch() {
  const pop = $("crmSearchPop");
  const input = $("q");
  const results = $("crmSearchResults");
  if (!pop || !input || !results) return;
  pop.classList.toggle("open", state.searchOpen);
  if (input.value !== state.query) input.value = state.query;
  const rows = crmSearchResults(state.query);
  results.innerHTML = state.query.trim() ? (rows.length ? rows.map(r => `<button class="crm-search-result" data-act="search-result" data-type="${r.type}" data-lead="${r.leadId}" ${r.index != null ? `data-i="${r.index}"` : ""} ${r.number ? `data-n="${esc(r.number)}"` : ""} ${r.channel ? `data-ch="${esc(r.channel)}"` : ""}><span><strong>${esc(r.title)}</strong><small>${esc(r.sub)}</small></span><em>${esc(r.type)}</em></button>`).join("") : '<div class="crm-search-empty">No results</div>') : "";
}
function renderRail() {
  ensureRailShell();
  const list = filtered();
  $("leadCount").textContent = list.length;
  const avatarColors = visibleAvatarColors(list);
  $("leadList").innerHTML = list.map((l, index) => `
    <button class="lead-row ${l.id===state.selected?"on":""}" data-act="select" data-id="${l.id}">
      <span class="av" style="background:${avatarColors[index]}">${esc(initials(l.contact))}</span>
      <span><div class="co">${esc(l.company)}</div><div class="nm">${esc(displayName(l.contact))}</div></span>
      <span class="right"><span class="amt">${money(l.avg)}</span><span class="ago">${esc(l.lastAgo)}</span></span>
    </button>`).join("") || `<div class="empty">No leads match.</div>`;
  renderLeadFilterMenu();
  renderSearch();
}

function renderDesk() {
  const l = lead();
  const appFile = applicationFileIndex(l);
  const completedStatements = (Array.isArray(l.stmts) ? l.stmts : []).slice(0, 3);
  const activities = state.activityExpanded ? l.activity : l.activity.slice(0, 2);
  const website = websiteUrl(l.website);
  const companyFields = [
    l.dba ? companyFieldBlock("DBA", esc(l.dba)) : "",
    l.industry ? companyFieldBlock("Industry", esc(industryWord(l.industry))) : "",
    l.ein ? companyFieldBlock("EIN", esc(l.ein)) : "",
    l.ssn ? companyFieldBlock("SSN", esc(l.ssn)) : "",
    l.dob ? companyFieldBlock("DOB", esc(l.dob)) : "",
    l.started ? companyFieldBlock("BSD", esc(bsdValue(l))) : "",
    l.entity ? companyFieldBlock("Entity", esc(l.entity)) : "",
    l.employees != null ? companyFieldBlock("Employees", esc(l.employees)) : "",
    l.address ? companyFieldBlock("Address", esc(l.address), true) : "",
    website ? companyFieldBlock("Website", `<a href="${esc(website)}" target="_blank" rel="noopener">${esc(l.website)}</a>`, true) : ""
  ].filter(Boolean).join("");
  const statementRows = completedStatements.map(s => {
    const i = statementFileIndex(l, s.m, false);
    const trigger = i >= 0 ? `data-act="file" data-i="${i}" role="button" tabindex="0"` : "";
    return `<tr><td><span class="statement-month ${i >= 0 ? "clickable" : ""}" ${trigger}><span>${esc(s.m)}</span></span></td><td>${money(s.dep)}</td><td>${money(s.end)}</td></tr>`;
  }).join("");
  const mtdRow = l.mtd ? (() => {
    const i = statementFileIndex(l, l.mtd.m, true);
    const trigger = i >= 0 ? `data-act="file" data-i="${i}" role="button" tabindex="0"` : "";
    return `<tr><td><span class="statement-month ${i >= 0 ? "clickable" : ""}" ${trigger}><span>MTD · ${esc(l.mtd.m)}</span></span></td><td>${money(l.mtd.dep)}</td><td>${money(l.mtd.bal)}</td></tr>`;
  })() : "";
  const firstStatement = completedStatements.length ? statementFileIndex(l, completedStatements[0].m, false) : -1;

  $("desk").innerHTML = `
    <div class="desk-scroll">
      <div class="rec-head">
        <div class="rec-main">
          <div class="rec-title-line">
            <span class="rec-avatar" style="background:${avatarColor(l)}" aria-hidden="true">${esc(initials(l.contact))}</span>
            <div class="rec-title-copy"><h1>${esc(l.company)}</h1><div class="rec-who">${esc(displayName(l.contact))}</div></div>
            ${appFile >= 0 ? `<button class="doc-link" data-act="file" data-i="${appFile}" title="Open documents" aria-label="Open documents">${documentIcon()}</button>` : ""}
            <button class="favorite-btn ${state.fav.has(l.id)?"on":""}" data-act="favorite" title="${state.fav.has(l.id)?"Remove star":"Star lead"}" aria-label="${state.fav.has(l.id)?"Remove star":"Star lead"}">${ico("star",16)}</button>
          </div>
        </div>
        <div class="rec-summary" aria-label="Lead summary">
          <div class="summary-item"><div class="k">Revenue</div><div class="v">${money(l.avg)}</div></div>
          <div class="summary-item"><div class="k">Approval</div><div class="v">${money(l.offer)}</div></div>
        </div>
      </div>

      <div class="middle-body">
        <div class="paired-row paired-primary">
          <section class="paired-section contact-card">
            <h3>Contact</h3>
            ${contactGroups(l)}
          </section>
          <section class="paired-section company-card">
            <h3>Company</h3>
            <div class="company-fields">${companyFields || '<div class="muted">No company details on file.</div>'}</div>
          </section>
        </div>

        <div class="paired-row">
          <section class="paired-section statements-card">
            <div class="section-heading-inline"><h3>Statements</h3>${firstStatement >= 0 ? `<button class="section-doc" data-act="file" data-i="${firstStatement}" title="Open latest statement" aria-label="Open latest statement">${documentIcon()}</button>` : ""}</div>
            ${(statementRows || mtdRow) ? `<table class="statement-table"><thead><tr><th>Month</th><th>Deposits</th><th>Ending</th></tr></thead><tbody>${statementRows}${mtdRow}</tbody></table>` : '<div class="muted">No statement data on file.</div>'}
          </section>
          <section class="paired-section">
            <h3>Bank Account</h3>
            <div class="company-rows bank-rows">
              ${l.bank?.name ? companyRow("Bank", esc(l.bank.name)) : ""}
              ${l.bank?.acct ? companyRow("Account", esc(l.bank.acct)) : ""}
              ${l.bank?.routing ? companyRow("Routing", esc(l.bank.routing)) : ""}
              ${l.bank?.type ? companyRow("Type", esc(l.bank.type)) : ""}
              ${l.bank?.adb != null ? companyRow("Avg daily balance", money(l.bank.adb)) : ""}
              ${l.bank?.bal != null ? companyRow("Current balance", money(l.bank.bal)) : ""}
            </div>
          </section>
        </div>

        <section class="section-block"><div class="section-title"><h3>Sales Pitch</h3></div><p class="sales-pitch">${esc(salesPitch(l))}</p></section>
        <section class="section-block"><div class="section-title"><h3>Latest Activity</h3></div><div class="activity-list">${activities.length ? activities.map(a => `<div class="activity-row"><div class="when">${esc(a.when)}</div><div>${esc(a.what)}</div></div>`).join("") : '<div class="muted">No activity on file.</div>'}</div>${l.activity.length > 2 ? `<button class="linkish" data-act="activity-toggle">${state.activityExpanded ? "Show less" : `Show ${l.activity.length - 2} older`}</button>` : ""}</section>
      </div>
    </div>`;
}

function relativeMinutes(label) {
  const raw = String(label || "").trim().toLowerCase();
  if (!raw) return 999999;
  if (raw.includes("just now")) return 0;
  let m = raw.match(/(\d+)m\s*ago/); if (m) return +m[1];
  m = raw.match(/(\d+)h\s*ago/); if (m) return +m[1] * 60;
  m = raw.match(/(\d+)d\s*ago/); if (m) return +m[1] * 1440;
  m = raw.match(/(\d+)w\s*ago/); if (m) return +m[1] * 10080;
  if (raw.includes("yesterday")) return 1440;
  if (raw.includes("today")) return 60;
  const days = {thu:1440,fri:0,wed:2880,tue:4320,mon:5760,sun:7200,sat:8640};
  const key = Object.keys(days).find(k => raw.startsWith(k));
  return key ? days[key] : 50000;
}
const COMM_BASE_DATE = new Date(2026, 8, 11, 3, 43, 0);
function exactTimestamp(label) {
  const raw = String(label || "").trim();
  if (!raw) return "—";
  if (/^[A-Z][a-z]{2} \d{1,2} · \d{1,2}:\d{2} (?:AM|PM)$/.test(raw)) return raw;
  const d = new Date(COMM_BASE_DATE.getTime());
  const lower = raw.toLowerCase();
  let match = lower.match(/^(\d+)m\s*ago$/);
  if (match) d.setMinutes(d.getMinutes() - Number(match[1]));
  else if ((match = lower.match(/^(\d+)h\s*ago$/))) d.setHours(d.getHours() - Number(match[1]));
  else if ((match = lower.match(/^(\d+)d\s*ago$/))) d.setDate(d.getDate() - Number(match[1]));
  else if ((match = lower.match(/^(\d+)w\s*ago$/))) d.setDate(d.getDate() - Number(match[1]) * 7);
  else if (lower === "just now") return formatCompactTimestamp(new Date());
  else {
    const dayMatch = raw.match(/^(Today|Yesterday|Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!dayMatch) return raw;
    const [, dayName, hourText, minuteText, meridiem] = dayMatch;
    let hour = Number(hourText) % 12 + (meridiem.toUpperCase() === "PM" ? 12 : 0);
    d.setHours(hour, Number(minuteText), 0, 0);
    const key = dayName.toLowerCase();
    if (key === "yesterday") d.setDate(d.getDate() - 1);
    else if (key !== "today") {
      const targets = {sun:0,mon:1,tue:2,wed:3,thu:4,fri:5,sat:6};
      const target = targets[key.slice(0,3)];
      let delta = (d.getDay() - target + 7) % 7;
      if (delta === 0) delta = 7;
      d.setDate(d.getDate() - delta);
    }
  }
  return formatCompactTimestamp(d);
}
function formatCompactTimestamp(date) {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  let hour = date.getHours();
  const meridiem = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${months[date.getMonth()]} ${date.getDate()} · ${hour}:${String(date.getMinutes()).padStart(2,"0")} ${meridiem}`;
}
function commIcon(kind, item={}) {
  let icon = kind;
  let label = kind;
  if (kind === "message") { icon = item.channel === "wa" ? "wa" : "sms"; label = item.channel === "wa" ? "WhatsApp" : "SMS"; }
  if (kind === "email") { icon = "mail"; label = "Email"; }
  if (kind === "call") { icon = item.dir === "in" ? "callIn" : item.dir === "missed" ? "callMissed" : "callOut"; label = callDirection(item); }
  const directionClass = kind === "call" ? ` call-${item.dir === "in" ? "in" : item.dir === "missed" ? "missed" : "out"}` : "";
  return `<span class="comm-type-icon${directionClass}" aria-label="${esc(label)}" title="${esc(label)}">${ico(icon,16)}</span>`;
}
function allMessageItems() {
  const items = [];
  LEADS.forEach(l => (l.sms || []).forEach((m,i) => items.push({lead:l,index:i,kind:"message",when:m.t || l.lastAgo || "",number:m.n || l.mobiles?.[0]?.n || "",channel:m.ch || "sms",text:m.txt || "",dir:m.dir || "in"})));
  return items.sort((a,b)=>relativeMinutes(a.when)-relativeMinutes(b.when));
}
function messageConversations() {
  const map = new Map();
  allMessageItems().forEach(item => {
    const key = `${item.lead.id}|${item.number}|${item.channel}`;
    if (!map.has(key)) map.set(key, item);
  });
  return [...map.values()];
}
function allCallItems() {
  const items = [];
  LEADS.forEach(l => (l.calls || []).forEach((c,i) => items.push({lead:l,index:i,kind:"call",...c})));
  return items.sort((a,b)=>relativeMinutes(a.when)-relativeMinutes(b.when));
}
function mailFolder(m) {
  if (m.folder) return String(m.folder).toLowerCase();
  return String(m.from || "").toLowerCase() === "cole brennan" ? "sent" : "inbox";
}
function allMailItems(folder="inbox") {
  const items = [];
  LEADS.forEach(l => (l.mails || []).forEach((m,i) => { if (mailFolder(m) === folder) items.push({lead:l,index:i,kind:"email",...m}); }));
  if (folder === "drafts") Object.entries(state.drafts).forEach(([leadId,d],i) => { const l=LEADS.find(x=>x.id===leadId); if (l) items.push({lead:l,index:i,kind:"draft",sub:d.subject||"(no subject)",from:"Cole Brennan",to:d.to||"",when:"Draft",preview:String(d.body||"").replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim(),draft:d}); });
  return items.sort((a,b)=>relativeMinutes(a.when)-relativeMinutes(b.when));
}
function allTimelineItems() {
  const items = [];
  allMessageItems().forEach(x=>items.push({kind:"message",lead:x.lead,when:x.when,title:displayName(x.lead.contact),preview:x.text,typeLabel:x.channel==="wa"?"WhatsApp":"SMS",number:x.number,channel:x.channel,index:x.index}));
  allCallItems().forEach(x=>items.push({kind:"call",lead:x.lead,when:x.when,title:x.who||x.n||displayName(x.lead.contact),preview:`${x.dir === "in" ? "Incoming" : x.dir === "missed" ? "Missed" : "Outgoing"}${x.dur ? ` · ${x.dur}` : ""}`,typeLabel:"Call",index:x.index}));
  ["inbox","sent"].forEach(folder=>allMailItems(folder).forEach(x=>items.push({kind:"email",lead:x.lead,when:x.when,title:x.sub||"(no subject)",preview:x.preview||"",typeLabel:"Email",index:x.index,folder})));
  return items.sort((a,b)=>relativeMinutes(a.when)-relativeMinutes(b.when)).slice(0,40);
}
function savedContacts() {
  return LEADS.slice().sort((a,b) => displayName(a.contact).localeCompare(displayName(b.contact), undefined, {sensitivity:"base"}));
}
function contactGroupsByLetter() {
  const groups = new Map();
  savedContacts().forEach(l => {
    const letter = (displayName(l.contact).charAt(0) || "#").toUpperCase();
    if (!groups.has(letter)) groups.set(letter, []);
    groups.get(letter).push(l);
  });
  return [...groups.entries()].sort((a,b)=>a[0].localeCompare(b[0]));
}
function callDirection(c) {
  return c.dir === "in" ? "Incoming" : c.dir === "missed" ? "Missed" : "Outgoing";
}
function commBackButton(act) { return `<button class="comm-back" data-act="${act}" aria-label="Back">${ico("back",15)} Back</button>`; }
