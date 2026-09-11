function startCall(n, who) {
  state.modal = null; state.keypadOpen = false; state.dial.status = "dialing"; state.dial.number = n; state.dial.contact = who || displayName(lead().contact); state.dial.muted = false; state.dial.hold = false; state.dial.elapsed = 0; state.dial.dtmf = ""; state.dial.notes = ""; renderAll();
  setTimeout(() => { if (state.dial.status !== "dialing") return; state.dial.status = "connected"; state.dial.started = Date.now(); startTick(); renderAll(); toast("Connected · " + device().name); }, 1400);
}
function startTick() {
  clearInterval(tick);
  tick = setInterval(() => { if (state.dial.status !== "connected") return; state.dial.elapsed = Math.floor((Date.now() - state.dial.started) / 1000); const t = $("timer"); if (t) t.textContent = fmtElapsed(state.dial.elapsed); }, 1000);
}
function hang() {
  const l = lead(); const dur = fmtElapsed(state.dial.elapsed);
  if (state.dial.status === "connected") { l.calls.unshift({who: state.dial.contact, dir:"out", dur, when:"Just now", dev: device().name, n: state.dial.number, note:state.dial.notes || "Logged from dialer."}); l.activity.unshift({when:"Just now", what:`Call · ${state.dial.contact} · ${dur}`}); l.lastAgo = "just now"; }
  state.dial.status = "idle"; state.dial.elapsed = 0; state.dial.dtmf = ""; state.dial.hold = false; state.dial.notes = ""; state.keypadOpen = false; clearInterval(tick); renderAll(); toast("Call ended");
}
function applyComposerSelect(select) {
  if (!select || !state.modal || state.modal.type !== "compose") return;
  const editor = $("cBody"); if (!editor) return;
  if (select.id === "cFont") { editor.style.fontFamily = select.value; return; }
  if (select.id === "cSize") { editor.style.fontSize = select.value; return; }
  if (select.id === "cTpl") {
    const l = lead(); const first = displayName(l.contact).split(" ")[0];
    const map = {
      term: {s:"Term sheet — " + l.company, b:`<div>Hi ${first},</div><div><br></div><div>Term sheet is attached. ${money(l.offer || l.ask)} as discussed. Call me when you’ve had a look.</div>`},
      stip: {s:"Stips outstanding — " + l.company, b:`<div>Hi ${first},</div><div><br></div><div>Need the remaining statements to lock the file. Everything else is in.</div>`},
      intro:{s:"Intro — " + l.company, b:`<div>Hi ${first},</div><div><br></div><div>Elena suggested we talk. I help shops like yours with working capital. Ten minutes this week?</div>`}
    };
    const choice = map[select.value]; if (choice) { $("cSub").value = choice.s; editor.innerHTML = choice.b + `<div><br></div><div>Cole Brennan<br>Forge · Merchant desk</div>`; }
  }
}
