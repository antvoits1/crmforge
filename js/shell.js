(() => {
  const PAGES = [
    ["leads", "Leads", '<rect x="4" y="4" width="16" height="16" rx="2"></rect><path d="M8 8h8M8 12h8M8 16h5"></path>'],
    ["messages", "Messages", '<path d="M4 5h16v12H9l-5 3V5z"></path><path d="M8 9h8M8 13h5"></path>'],
    ["email", "Email", '<rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="m4 7 8 6 8-6"></path>'],
    ["scanner", "Scanner", '<path d="M7 3h10v4H7zM5 8h14a2 2 0 0 1 2 2v6h-4v5H7v-5H3v-6a2 2 0 0 1 2-2z"></path><path d="M9 16h6"></path>'],
    ["command", "Command", '<path d="M12 3 4 7.5 12 12l8-4.5L12 3z"></path><path d="m4 12 8 4.5 8-4.5M4 16.5 12 21l8-4.5"></path>'],
    ["notifications", "Notifications", '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path>']
  ];
  const KEY = "forge.v2.settings";
  const DEFAULTS = { screenScale:"auto", fontSize:"auto", navMode:"topbar", leadDensity:"standard", motion:"normal" };
  let accountOpen = false;
  let toastTimer = null;
  const body = document.body;
  const html = document.documentElement;
  const standalone = body.dataset.standalone === "true";
  const base = body.dataset.base || ".";
  let settings = loadSettings();

  function loadSettings() {
    try {
      const parsed = JSON.parse(localStorage.getItem(KEY) || "null") || {};
      return { ...DEFAULTS, ...parsed };
    } catch { return { ...DEFAULTS }; }
  }
  function saveSettings() {
    try { localStorage.setItem(KEY, JSON.stringify(settings)); } catch {}
  }
  function autoScreenScale() {
    const width = Math.max(window.innerWidth || 0, document.documentElement.clientWidth || 0);
    if (width >= 2400) return "ultra";
    if (width >= 1600) return "wide";
    return "standard";
  }
  function applySettings({ notify=true } = {}) {
    const autoScale = autoScreenScale();
    const scale = settings.screenScale === "auto" ? autoScale : settings.screenScale;
    const requestedSize = settings.fontSize === "auto" ? (autoScale === "ultra" ? 16.5 : 16) : Number(settings.fontSize);
    const size = Math.max(15, Math.min(19, Math.round(requestedSize * 2) / 2 || 16));
    html.dataset.screenScale = ["standard","wide","ultra"].includes(scale) ? scale : "standard";
    html.dataset.leadDensity = settings.leadDensity === "compact" ? "compact" : "standard";
    html.dataset.motion = settings.motion === "reduced" ? "reduced" : "normal";
    html.style.setProperty("--ui-font-size", size + "px");
    html.style.setProperty("--font-factor", String(size / 16));
    const navMode = ["topbar","sidebar-icons","sidebar-wide"].includes(settings.navMode) ? settings.navMode : "topbar";
    html.dataset.navMode = navMode;
    body.dataset.sidebar = navMode === "sidebar-wide" ? "expanded" : "collapsed";
    saveSettings();
    if (notify) window.dispatchEvent(new CustomEvent("forge:layout-changed"));
  }
  function routeFor(page) {
    if (page === "leads") return base === ".." ? "../index.html" : "index.html";
    return base === ".." ? `${page}.html` : `pages/${page}.html`;
  }
  function navMarkup(includeNotifications = true) {
    const current = body.dataset.page || "leads";
    return PAGES.filter(([page]) => includeNotifications || page !== "notifications").map(([page,label,icon]) => `
      <button class="nav-btn ${current===page?'active':''}" type="button" data-shell-page="${page}" title="${label}">
        <span class="nav-icon"><svg viewBox="0 0 24 24" aria-hidden="true">${icon}</svg></span>
        <span class="nav-label">${label}</span>
      </button>`).join("");
  }
  function connectionIcon() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 9.5a11 11 0 0 1 15 0M7.5 12.5a7 7 0 0 1 9 0M10.5 15.5a3 3 0 0 1 3 0"/><circle cx="12" cy="19" r="1" fill="currentColor" stroke="none"/></svg>';
  }
  function mountShell() {
    const mount = document.getElementById("sidebarMount");
    if (!mount) return;
    mount.className = "app-nav";
    mount.innerHTML = `
      <header class="topbar-shell">
        <button class="topbar-traffic" type="button" data-shell-act="nav-cycle" aria-label="Change navigation" title="Change navigation"><i class="r"></i><i class="y"></i><i class="g"></i></button>
        <div class="topbar-brand">Forge<span>CRM</span></div>
        <nav class="topbar-nav" aria-label="Primary">${navMarkup(false)}</nav>
        <div class="topbar-utilities" aria-label="Workspace utilities">
          <button class="topbar-device" type="button" data-shell-act="devices" aria-label="Calling device"><span class="topbar-device-dot"></span>${connectionIcon()}</button>
          <button class="topbar-notifications ${body.dataset.page === "notifications" ? "active" : ""}" type="button" data-shell-page="notifications" aria-label="Notifications" title="Notifications"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg></button>
          <button class="topbar-avatar" type="button" data-shell-act="account" aria-expanded="false">CB</button>
        </div>
      </header>
      <aside class="sidebar-shell">
        <div class="sidebar-head">
          <button class="sidebar-collapsed-toggle" type="button" data-shell-act="nav-cycle" aria-label="Expand sidebar" title="Expand sidebar"></button>
          <div class="forge-dots" aria-label="Forge"><i class="r"></i><i class="y"></i><i class="g"></i></div>
          <div class="sidebar-brand">Forge<span>CRM</span></div>
          <button class="sidebar-toggle" type="button" data-shell-act="nav-cycle" aria-label="Switch to top bar" title="Switch to top bar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M15 6 9 12l6 6"/></svg>
          </button>
        </div>
        <nav class="sidebar-nav" aria-label="Primary"><div class="workspace-label">WORKSPACE</div>${navMarkup()}</nav>
        <div class="sidebar-device-zone"><button class="sidebar-device connected" id="sidebarDevice" type="button" data-shell-act="devices" title="Calling device connected" aria-label="Calling device connected"><span class="sidebar-device-icon">${connectionIcon()}<span class="status-dot"></span></span><span class="sidebar-device-copy">Connection</span></button></div>
        <div class="sidebar-bottom">
          <button class="user-btn" type="button" data-shell-act="account" aria-expanded="false">
            <span class="user-avatar">CB</span>
            <span class="user-copy"><strong>Cole Brennan</strong><span>User</span></span>
          </button>
        </div>
      </aside>`;
    const menu = document.createElement("div");
    menu.className = "account-menu"; menu.id = "accountMenu";
    menu.innerHTML = `<button type="button" data-shell-act="settings">Settings</button><button type="button" data-shell-act="logout">Log Out</button>`;
    document.body.appendChild(menu);
    const overlay = document.createElement("div"); overlay.className="shell-overlay"; overlay.id="shellOverlay"; document.body.appendChild(overlay);
    const toast = document.createElement("div"); toast.className="shell-toast"; toast.id="shellToast"; document.body.appendChild(toast);
  }
  function setStandalonePage(page) {
    if (!standalone) return;
    const valid = PAGES.some(([p]) => p === page) ? page : "leads";
    body.dataset.page = valid;
    document.querySelectorAll("[data-standalone-page]").forEach(el => { el.hidden = el.dataset.standalonePage !== valid; });
    document.querySelectorAll(".nav-btn[data-shell-page]").forEach(btn => btn.classList.toggle("active", btn.dataset.shellPage === valid));
    document.title = `${PAGES.find(([p]) => p===valid)?.[1] || "Forge"} · Forge CRM`;
    closeAccount();
  }
  function cycleNavigation() {
    const current = html.dataset.navMode || "topbar";
    settings.navMode = current === "topbar" ? "sidebar-icons" : current === "sidebar-icons" ? "sidebar-wide" : "topbar";
    applySettings();
  }
  function closeAccount() {
    accountOpen = false;
    document.getElementById("accountMenu")?.classList.remove("open");
    document.querySelectorAll("[data-shell-act='account']").forEach(el => el.setAttribute("aria-expanded", "false"));
  }
  function toggleAccount() {
    accountOpen = !accountOpen;
    document.getElementById("accountMenu")?.classList.toggle("open", accountOpen);
    document.querySelectorAll("[data-shell-act='account']").forEach(el => el.setAttribute("aria-expanded", String(accountOpen)));
  }
  function showToast(message) {
    const el = document.getElementById("shellToast"); if (!el) return;
    el.textContent = message; el.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(()=>el.classList.remove("show"), 2800);
  }
  function settingOptions(values, selected) {
    return values.map(([v,l]) => `<option value="${v}" ${String(v)===String(selected)?"selected":""}>${l}</option>`).join("");
  }
  function openSettings() {
    closeAccount();
    const ov = document.getElementById("shellOverlay");
    const fontValues = [["auto", "Auto (Recommended)"]]; for (let v=15; v<=19.001; v+=.5) fontValues.push([String(v), `${v.toFixed(v%1?1:0)}px`]);
    ov.className = "shell-overlay open";
    ov.innerHTML = `<div class="settings-modal" role="dialog" aria-modal="true" aria-labelledby="settingsTitle">
      <div class="settings-head"><h2 id="settingsTitle">Settings</h2><button class="shell-close" type="button" data-shell-act="settings-close" aria-label="Close">×</button></div>
      <div class="setting-row"><div class="setting-copy"><strong>Screen Scale</strong><span>Auto picks a layout for the current screen. You can override it anytime.</span></div><select data-setting="screenScale">${settingOptions([["auto","Auto (Recommended)"],["standard","Standard"],["wide","Wide"],["ultra","Ultra-Wide"]], settings.screenScale)}</select></div>
      <div class="setting-row"><div class="setting-copy"><strong>Font / Icon Size</strong><span>Auto keeps 16px standard and gently increases ultra-wide screens. Manual sizes stay 15px–19px.</span></div><select data-setting="fontSize">${settingOptions(fontValues, settings.fontSize)}</select></div>
      <div class="setting-row"><div class="setting-copy"><strong>Navigation</strong><span>Top bar is the default. You can switch to icon or wide sidebar.</span></div><select data-setting="navMode">${settingOptions([["topbar","Top bar (Default)"],["sidebar-icons","Sidebar icons"],["sidebar-wide","Wide sidebar"]], settings.navMode)}</select></div>
      <div class="setting-row"><div class="setting-copy"><strong>Lead Row Spacing</strong><span>Compact shows more leads without changing lead data.</span></div><select data-setting="leadDensity">${settingOptions([["standard","Standard"],["compact","Compact"]], settings.leadDensity)}</select></div>
      <div class="setting-row"><div class="setting-copy"><strong>Motion</strong><span>Reduced motion removes non-essential animations and transitions.</span></div><select data-setting="motion">${settingOptions([["normal","Normal"],["reduced","Reduced"]], settings.motion)}</select></div>
      ${document.getElementById("main") ? '<div class="settings-actions"><button class="shell-btn" type="button" data-shell-act="reset-panels">Reset panel widths</button></div>' : ''}
    </div>`;
  }
  function closeSettings() { const ov=document.getElementById("shellOverlay"); if (ov) { ov.className="shell-overlay"; ov.innerHTML=""; } }
  function setDeviceStatus(connected, label="Connection") {
    const button = document.getElementById("sidebarDevice");
    if (button) {
      button.classList.toggle("connected", Boolean(connected));
      const stateLabel = connected ? "connected" : "disconnected";
      button.title = `${label} · ${stateLabel}`;
      button.setAttribute("aria-label", `${label} ${stateLabel}`);
    }
    const dot = document.querySelector(".topbar-device-dot");
    if (dot) dot.classList.toggle("disconnected", !connected);
  }
  window.ForgeShell = { setDeviceStatus };

  applySettings({notify:false});
  mountShell();
  if (standalone) setStandalonePage(body.dataset.page || "leads");

  document.addEventListener("click", e => {
    const pageBtn = e.target.closest("[data-shell-page]");
    if (pageBtn) {
      const page = pageBtn.dataset.shellPage;
      if (standalone) setStandalonePage(page); else window.location.href = routeFor(page);
      return;
    }
    const actBtn = e.target.closest("[data-shell-act]");
    if (actBtn) {
      const act = actBtn.dataset.shellAct;
      if (act === "nav-cycle") { cycleNavigation(); return; }
      if (act === "account") { toggleAccount(); return; }
      if (act === "settings") { openSettings(); return; }
      if (act === "settings-close") { closeSettings(); return; }
      if (act === "devices") { window.dispatchEvent(new CustomEvent("forge:devices")); return; }
      if (act === "logout") { closeAccount(); showToast("Log Out is unavailable because no authentication service is connected to this build."); return; }
      if (act === "reset-panels") { window.dispatchEvent(new CustomEvent("forge:reset-panels")); showToast("Panel widths reset."); return; }
    }
    if (accountOpen && !e.target.closest("#accountMenu") && !e.target.closest("[data-shell-act='account']")) closeAccount();
  });
  document.addEventListener("change", e => {
    const select = e.target.closest("[data-setting]"); if (!select) return;
    const key = select.dataset.setting;
    settings[key] = key === "fontSize" && select.value !== "auto" ? Number(select.value) : select.value;
    applySettings();
  });
  document.getElementById("shellOverlay")?.addEventListener("click", e => { if (e.target.id === "shellOverlay") closeSettings(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") { closeAccount(); closeSettings(); } });
  window.addEventListener("resize", () => {
    if (settings.screenScale === "auto" || settings.fontSize === "auto") applySettings();
  });
})();
