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
        <button data-act="fmt" data-cmd="bold"><b>B</b></button><button data-act="fmt" data-cmd="italic"><i>I</i></button><button data-act="fmt" data-cmd="underline"><u>U</u></button>
        <select id="cFont" data-act="font"><option>Inter</option><option>Georgia</option><option>Times New Roman</option><option>Arial</option></select>
        <select id="cSize" data-act="size"><option>13px</option><option selected>14px</option><option>16px</option><option>18px</option></select>
        <input id="cColor" type="color" value="#1A1F26" title="Color" style="width:32px;height:28px;border:1px solid var(--line);border-radius:6px;padding:2px;background:var(--surface)" />
        <select id="cTpl" data-act="tpl"><option value="">Template</option><option value="term">Term sheet follow-up</option><option value="stip">Stip request</option><option value="intro">Intro</option></select>
        <button data-act="attach">Attach</button><button data-act="draft">Save draft</button>
      </div>
      <div class="editor" id="cBody" contenteditable="true">${m.body}</div>
      <div class="row-between" style="margin-top:12px"><span class="dim" id="cAtt">No attachments</span><button class="btn primary" data-act="send-mail">Send</button></div>
    </div>`;
    $("cColor").addEventListener("input", (e) => document.execCommand("foreColor", false, e.target.value));
    return;
  }
  if (m.type === "file") {
    const files = lead().files || [];
    const safeIndex = Math.max(0, Math.min(files.length - 1, Number(m.i) || 0));
    m.i = safeIndex;
    const f = files[safeIndex];
    ov.innerHTML = `<div class="modal document-viewer"><div class="viewer-head">
        <button class="viewer-arrow" data-act="file-prev" ${safeIndex <= 0 ? "disabled" : ""} aria-label="Previous file">${ico("left",18)}</button>
        <div class="viewer-title"><h2>${esc(f.n)}</h2><span>${safeIndex + 1} / ${files.length}</span></div>
        <button class="viewer-arrow" data-act="file-next" ${safeIndex >= files.length - 1 ? "disabled" : ""} aria-label="Next file">${ico("right",18)}</button>
        <button class="icon-btn viewer-close" data-act="close" aria-label="Close">${ico("x")}</button>
      </div><div class="scan"><div class="scan-paper"><div class="scan-brand">${esc(lead().bank.name.toUpperCase())}</div>
        <div class="row-between scan-meta"><div>${esc(lead().company)}<br>${esc(lead().bank.acct)}</div><div>${esc(f.n)} · ${esc(f.p)}</div></div>
        <p>Scanned file preview. ${esc(f.n)} for ${esc(lead().company)}.</p><div class="scan-lines"></div></div></div></div>`;
    return;
  }
  if (m.type === "devices") {
    ov.innerHTML = `<div class="modal"><div class="row-between"><h2 style="font-size:calc(16px * var(--font-factor))">Calling as</h2><button class="icon-btn" data-act="close">${ico("x")}</button></div>
      ${DEVICES.map(d => `<button class="lead-row ${d.id===state.dial.device?"on":""}" data-act="set-device" data-id="${d.id}" style="padding-left:12px"><span class="av" style="background:${d.on?"#0F766E":"#8B949E"}">${ico("phone",14)}</span><span><div class="co">${esc(d.name)}</div><div class="nm">${esc(d.kind)} · ${esc(d.did)} · ${d.on?"On":"Off"}</div></span></button>`).join("")}</div>`;
    return;
  }
  if (m.type === "mail-read") {
    const mail = lead().mails[m.i];
    ov.innerHTML = `<div class="modal"><div class="row-between"><h2 style="font-size:calc(16px * var(--font-factor))">${esc(mail.sub)}</h2><button class="icon-btn" data-act="close">${ico("x")}</button></div><div class="dim" style="margin-top:8px">${esc(mail.from)} · ${esc(mail.when)}</div><p style="margin-top:16px;line-height:1.55">${esc(mail.preview)}</p><button class="btn" style="margin-top:16px" data-act="compose">Reply</button></div>`;
  }
}
