function ensureRailShell() {
  if ($("leadList")) return;
  $("rail").innerHTML = `
    <div class="rail-head">
      <h2>Leads <span class="dim" id="leadCount">0</span></h2>
      <div class="rail-head-actions">
        <button class="btn rail-new" data-act="toast" data-msg="New lead is read-only in this desk.">${ico("plus",14)} New</button>
        <button class="icon-btn rail-search-btn" data-act="search-toggle" title="Search CRM" aria-label="Search CRM">${ico("search",16)}</button>
      </div>
      <div class="crm-search-pop" id="crmSearchPop">
        <label class="crm-search-input">${ico("search",14)}<input id="q" autocomplete="off" aria-label="Search CRM" /></label>
        <div class="crm-search-results" id="crmSearchResults"></div>
      </div>
    </div>
    <div class="filters" id="leadFilters"></div>
    <div class="lead-list pane" id="leadList"></div>`;
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
  $("leadFilters").innerHTML = [["all","All"],["mine","Mine"],["star","Starred"],["today","Due today"]].map(([k,l]) =>
    `<button class="chip ${state.filter===k?"on":""}" data-act="filter" data-k="${k}">${l}</button>`).join("");
  const avatarColors = visibleAvatarColors(list);
  $("leadList").innerHTML = list.map((l, index) => `
    <button class="lead-row ${l.id===state.selected?"on":""}" data-act="select" data-id="${l.id}">
      <span class="av" style="background:${avatarColors[index]}">${esc(initials(l.contact))}</span>
      <span><div class="co">${esc(l.company)}</div><div class="nm">${esc(displayName(l.contact))}</div></span>
      <span class="right"><span class="amt">${money(l.avg)}</span><span class="ago">${esc(l.lastAgo)}</span></span>
    </button>`).join("") || `<div class="empty">No leads match.</div>`;
  renderSearch();
}

function renderDesk() {
  const l = lead();
  const appFile = applicationFileIndex(l);
  const completedStatements = (Array.isArray(l.stmts) ? l.stmts : []).slice(0, 3);
  const activities = state.activityExpanded ? l.activity : l.activity.slice(0, 2);
  const website = websiteUrl(l.website);
  const companyRows = [
    l.dba ? companyRow("DBA", esc(l.dba)) : "",
    l.industry ? companyRow("Industry", esc(industryWord(l.industry))) : "",
    l.address ? companyRow("Address", esc(l.address)) : "",
    l.ein ? companyRow("EIN", esc(l.ein)) : "",
    l.ssn ? companyRow("SSN", esc(l.ssn)) : "",
    l.dob ? companyRow("DOB", esc(l.dob)) : "",
    l.started ? companyRow("BSD", esc(bsdValue(l))) : "",
    website ? companyRow("Website", `<a href="${esc(website)}" target="_blank" rel="noopener">${esc(l.website)}</a>`) : "",
    l.entity ? companyRow("Entity", esc(l.entity)) : "",
    l.employees != null ? companyRow("Employees", esc(l.employees)) : ""
  ].filter(Boolean).join("");
  const statementRows = completedStatements.map(s => {
    const i = statementFileIndex(l, s.m, false);
    const trigger = i >= 0 ? `data-act="file" data-i="${i}" role="button" tabindex="0"` : "";
    return `<tr><td><span class="statement-month ${i >= 0 ? "clickable" : ""}" ${trigger}><span>${esc(s.m)}</span>${i >= 0 ? `<button class="statement-doc" data-act="file" data-i="${i}" title="Open ${esc(s.m)}" aria-label="Open ${esc(s.m)}">${documentIcon("DOCS")}</button>` : ""}</span></td><td>${money(s.dep)}</td><td>${money(s.end)}</td></tr>`;
  }).join("");
  const mtdRow = l.mtd ? (() => {
    const i = statementFileIndex(l, l.mtd.m, true);
    const trigger = i >= 0 ? `data-act="file" data-i="${i}" role="button" tabindex="0"` : "";
    return `<tr><td><span class="statement-month ${i >= 0 ? "clickable" : ""}" ${trigger}><span>MTD · ${esc(l.mtd.m)}</span>${i >= 0 ? `<button class="statement-doc" data-act="file" data-i="${i}" title="Open MTD" aria-label="Open MTD">${documentIcon("DOCS")}</button>` : ""}</span></td><td>${money(l.mtd.dep)}</td><td>${money(l.mtd.bal)}</td></tr>`;
  })() : "";
  const firstStatement = completedStatements.length ? statementFileIndex(l, completedStatements[0].m, false) : -1;

  $("desk").innerHTML = `
    <div class="desk-scroll">
      <div class="rec-head">
        <div class="rec-main">
          <div class="rec-title-line">
            <span class="rec-avatar" style="background:${avatarColor(l)}" aria-hidden="true">${esc(initials(l.contact))}</span>
            <h1>${esc(l.company)}</h1>
            ${appFile >= 0 ? `<button class="doc-link" data-act="file" data-i="${appFile}" title="Open documents" aria-label="Open documents">${documentIcon("DOCS")}</button>` : ""}
          </div>
          <div class="rec-who">Owner · ${esc(displayName(l.contact))}</div>
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
            <div class="company-rows">${companyRows || '<div class="muted">No company details on file.</div>'}</div>
          </section>
        </div>

        <div class="paired-row">
          <section class="paired-section statements-card">
            <div class="section-heading-inline"><h3>Statements</h3>${firstStatement >= 0 ? `<button class="section-doc" data-act="file" data-i="${firstStatement}" title="Open latest statement" aria-label="Open latest statement">${documentIcon("DOCS")}</button>` : ""}</div>
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
function callDirection(c) {
  return c.dir === "in" ? "Incoming" : c.dir === "missed" ? "Missed" : "Outgoing";
}
function commBackButton(act) { return `<button class="comm-back" data-act="${act}" aria-label="Back">${ico("back",15)} Back</button>`; }
