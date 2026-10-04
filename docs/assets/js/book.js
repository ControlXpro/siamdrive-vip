/* SIAMDRIVE.VIP — booking wizard. Prices come from window.SD (generated from src/data.mjs). */
(() => {
  const P = window.SD; if (!P) return;
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const fmt = (n) => n.toLocaleString("en-US") + " THB";
  const root = $(".wiz"); if (!root) return;
  const url = new URLSearchParams(location.search);
  const saved = (() => { try { return JSON.parse(localStorage.getItem("sd-booking") || "{}"); } catch { return {}; } })();

  const S = Object.assign({
    service: "hourly", airport: "suvarnabhumi-bkk", direction: "arrival", flight: "", date: "", time: "",
    pickup: "", dropoff: "", hours: "10", dest: "pattaya", trip: "transfer", pax: 2, bags: 2,
    vehicle: "toyota-alphard-40", guards: 0, guardPlan: "h5", escort: "none", ft: false, ftPax: 2, buggy: true,
    pa: 0, extraHours: 0, nights: 0, name: "", phone: "", email: "", notes: "",
  }, saved);
  ["service", "vehicle", "dest", "hours", "date", "guardPlan", "escort"].forEach((k) => url.get(k) && (S[k] = url.get(k)));
  if (url.get("guards")) S.guards = +url.get("guards");
  const syncGuards = () => { if (S.service === "protection") { if (S.guards < 1) S.guards = 2; if (S.guardPlan !== "transfer") S.guardPlan = S.hours === "10" ? "h10" : "h5"; } };
  syncGuards();
  if (S.service === "intercity" && url.get("dest")) S.dest = url.get("dest");

  let step = 1; const steps = 5;
  const veh = () => P.vehicles.find((v) => v.slug === S.vehicle) || P.vehicles[2];
  const route = () => P.routes.find((r) => r.slug === S.dest);
  const airport = () => P.airports.find((a) => a.slug === S.airport);
  const seatsOf = (v) => v.seats.split("+").map(Number)[0];

  /* ----- price engine ----- */
  const basePrice = (v) => {
    if (S.service === "airport") return S.airport === "u-tapao-utp" ? v.price.pattaya : v.price.airport;
    if (S.service === "hourly" || S.service === "protection") return S.hours === "10" ? v.price.bkk10 : v.price.bkk5;
    if (S.service === "intercity") { const r = route(); const t = r && P.tiers[r.tier]; if (!t || !t[S.trip === "day" ? "day" : "transfer"]) return null; return v.price[t[S.trip === "day" ? "day" : "transfer"]]; }
    if (S.service === "monthly") { const m = P.monthly.find((x) => x.vehicle === v.name); return m ? m.price : null; }
    return null;
  };
  const lines = () => {
    const v = veh(), L = [], b = basePrice(v);
    const svcLabel = { airport: S.direction === "arrival" ? "Airport pick-up" : "Airport drop-off", hourly: `Private driver · ${S.hours} hours`, protection: `Private driver · ${S.hours} hours`, intercity: route() ? `${S.trip === "day" ? "Day trip" : "Transfer"} · ${route().name}` : "Out of town", monthly: "Monthly private driver" }[S.service];
    L.push([`${svcLabel} — ${v.name}`, b]);
    if (S.extraHours > 0 && S.service !== "monthly") L.push([`Extra time × ${S.extraHours} h`, v.price.overtime * S.extraHours]);
    if (S.nights > 0 && S.service === "intercity") L.push([`Overnight outside Bangkok × ${S.nights}`, P.overnight * S.nights]);
    if (S.guards > 0) {
      const per = { transfer: P.bodyguard.transfer, h5: P.bodyguard.h5, h10: P.bodyguard.h10 }[S.guardPlan];
      L.push([`Bodyguards × ${S.guards} (${{ transfer: "transfer", h5: "5 hours", h10: "10 hours" }[S.guardPlan]})`, per * S.guards]);
      if (S.service === "intercity") L.push([`Outside Bangkok supplement × ${S.guards}`, P.bodyguard.outside * S.guards]);
    }
    if (S.escort !== "none") L.push([`Motorcycle escort (${S.escort === "e10" ? "10 hours" : "transfer / 5 hours"})`, S.escort === "e10" ? P.bodyguard.escort10 : P.bodyguard.escort5]);
    if (ftAvailable() && S.ft) {
      if (S.direction === "arrival") {
        L.push([`Fast-Track arrival × ${S.ftPax} guests`, P.fasttrack.arrival * S.ftPax]);
        if (S.buggy) { const n = Math.ceil(S.ftPax / 2); L.push([`Electric buggy × ${n} (max 2 guests each)`, P.fasttrack.buggy * n]); }
      } else L.push([`Fast-Track departure × ${S.ftPax} guests`, P.fasttrack.departure * S.ftPax]);
    }
    if (S.pa > 0) L.push([`Personal assistant × ${S.pa} (10 hours)`, P.pa.h10 * S.pa]);
    return L;
  };
  const ftAvailable = () => S.service === "airport" && S.airport === "suvarnabhumi-bkk";
  const total = () => { const L = lines(); return L.some((l) => l[1] == null) ? null : L.reduce((a, l) => a + l[1], 0); };

  /* ----- render helpers ----- */
  const press = (group, val) => $$(`[data-group="${group}"]`, root).forEach((b) => b.setAttribute("aria-pressed", b.dataset.value === String(val)));
  const show = () => {
    $$(".wiz-panel", root).forEach((p) => p.classList.toggle("on", +p.dataset.step === step));
    $$(".wiz-steps button", root).forEach((b) => { const n = +b.dataset.go; b.classList.toggle("on", n === step); b.classList.toggle("done", n < step); });
    $(".wiz-back", root).style.visibility = step === 1 ? "hidden" : "visible";
    const next = $(".wiz-next", root); next.hidden = step === steps;
    $$("[data-for]", root).forEach((el) => (el.hidden = !el.dataset.for.split(" ").includes(S.service)));
    $$("[data-ft]", root).forEach((el) => (el.hidden = !ftAvailable()));
    $$("[data-dir]", root).forEach((el) => (el.hidden = el.dataset.dir !== S.direction));
    renderVehicles(); renderSummary();
    const top = root.getBoundingClientRect().top + scrollY - 120;
    if (scrollY > top) scrollTo({ top, behavior: "smooth" });
  };
  const renderVehicles = () => {
    const box = $(".veh-opts", root); if (!box) return;
    box.innerHTML = P.vehicles.map((v) => {
      const p = (() => { const keep = S.vehicle; S.vehicle = v.slug; const x = basePrice(v); S.vehicle = keep; return x; })();
      const fits = seatsOf(v) >= S.pax;
      return `<button type="button" class="opt car" data-group="vehicle" data-value="${v.slug}" aria-pressed="${v.slug === S.vehicle}" ${fits ? "" : "disabled style=\"opacity:.35\""}>
        <img src="/assets/img/${v.img}.webp" alt="${v.name}" loading="lazy" width="900" height="600">
        <span class="in"><b>${v.name}</b><small>${v.cls} · ${v.seats} seats · ${v.luggage} large bags${fits ? "" : " · too small for your party"}</small><span class="pp">${p ? fmt(p) : "Quote on request"}</span></span></button>`;
    }).join("");
    $$("[data-group=vehicle]", box).forEach((b) => b.addEventListener("click", () => { S.vehicle = b.dataset.value; save(); press("vehicle", S.vehicle); renderSummary(); }));
  };
  const renderSummary = () => {
    const v = veh(), L = lines(), T = total();
    const where = S.service === "airport" ? `${airport().short} (${airport().code}) · ${S.direction === "arrival" ? "pick-up" : "drop-off"}` : S.service === "intercity" ? `Bangkok → ${route() ? route().name : ""}` : S.service === "hourly" ? "Private driver, Bangkok" : S.service === "protection" ? "Driver + bodyguards, Bangkok" : "Bangkok, monthly";
    $(".summary dl", root).innerHTML = [["Service", where], ["Date", S.date || "—"], ["Time", S.time || "—"], ["Vehicle", v.name], ["Guests", `${S.pax} · ${S.bags} bags`]].map(([a, b]) => `<dt>${a}</dt><dd>${b}</dd>`).join("");
    $(".summary-lines", root).innerHTML = L.map(([a, b]) => `<div><span>${a}</span><span>${b == null ? "On request" : fmt(b)}</span></div>`).join("");
    $(".summary-total b", root).textContent = T == null ? "On request" : fmt(T);
    $(".wa-send", root).href = "https://wa.me/" + P.whatsapp + "?text=" + encodeURIComponent(message());
  };
  const message = () => {
    const v = veh(), L = lines(), T = total();
    const rows = [
      "Hello SiamDrive, I would like to book:", "",
      `• Service: ${{ airport: "Airport transfer", hourly: "Private driver", protection: "Private driver + bodyguards", intercity: "Out-of-town", monthly: "Monthly private driver" }[S.service]}`,
      S.service === "airport" ? `• Airport: ${airport().name} (${airport().code}) — ${S.direction === "arrival" ? "arrival pick-up" : "departure drop-off"}${S.flight ? " · Flight " + S.flight : ""}` : null,
      S.service === "intercity" && route() ? `• Destination: ${route().name} (${S.trip === "day" ? "day trip, return" : "one-way transfer"})` : null,
      (S.service === "hourly" || S.service === "protection") ? `• Duration: ${S.hours} hours` : null,
      `• Date & time: ${S.date || "TBC"} ${S.time || ""}`.trim(),
      S.pickup ? `• Pick-up: ${S.pickup}` : null, S.dropoff ? `• Drop-off: ${S.dropoff}` : null,
      `• Vehicle: ${v.name}`, `• Guests: ${S.pax} · Luggage: ${S.bags}`, "",
      "Estimate:", ...L.map(([a, b]) => `  – ${a}: ${b == null ? "on request" : fmt(b)}`), `  = Total: ${T == null ? "on request" : fmt(T)}`, "",
      `Name: ${S.name || "—"}`, S.phone ? `Phone: ${S.phone}` : null, S.email ? `Email: ${S.email}` : null, S.notes ? `Notes: ${S.notes}` : null,
    ];
    return rows.filter((r) => r !== null).join("\n");
  };
  const save = () => { try { localStorage.setItem("sd-booking", JSON.stringify(S)); } catch {} };

  /* ----- bind inputs ----- */
  $$("[data-group]", root).forEach((b) => b.addEventListener("click", () => {
    const g = b.dataset.group; if (g === "vehicle") return;
    S[g] = b.dataset.value; syncGuards(); ["guards"].forEach((k) => { const o = root.querySelector(`[data-key=${k}] output`); if (o) o.textContent = S[k]; }); press(g, S[g]); press("guardPlan", S.guardPlan); save(); show();
  }));
  $$("[data-bind]", root).forEach((i) => {
    const k = i.dataset.bind; if (S[k] !== undefined && S[k] !== "") i.value = S[k];
    i.addEventListener("input", () => { S[k] = i.type === "checkbox" ? i.checked : i.value; save(); renderSummary(); if (["dest", "airport"].includes(k)) show(); });
    if (i.type === "checkbox") { i.checked = !!S[k]; i.addEventListener("change", () => { S[k] = i.checked; save(); renderSummary(); }); }
  });
  $$(".counter", root).forEach((c) => {
    const k = c.dataset.key, min = +c.dataset.min || 0, max = +c.dataset.max || 20, out = $("output", c);
    out.textContent = S[k];
    $$("button", c).forEach((b) => b.addEventListener("click", () => {
      S[k] = Math.max(min, Math.min(max, +S[k] + (+b.dataset.d))); out.textContent = S[k];
      if (k === "pax") { S.ftPax = S.pax; const fo = $('[data-key="ftPax"] output', root); if (fo) fo.textContent = S.ftPax; if (seatsOf(veh()) < S.pax) S.vehicle = P.vehicles.find((v) => seatsOf(v) >= S.pax)?.slug || S.vehicle; renderVehicles(); }
      save(); renderSummary();
    }));
  });
  ["service", "airport", "direction", "hours", "trip", "guardPlan", "escort"].forEach((g) => press(g, S[g]));

  $(".wiz-next", root).addEventListener("click", () => { if (step === 2 && !S.date) { const d = $("[data-bind=date]", root); d && d.focus(); d && d.closest(".field").animate([{ borderColor: "#ff6b6b" }, { borderColor: "rgba(255,255,255,.09)" }], 900); } step = Math.min(steps, step + 1); show(); });
  $(".wiz-back", root).addEventListener("click", () => { step = Math.max(1, step - 1); show(); });
  $$(".wiz-steps button", root).forEach((b) => b.addEventListener("click", () => { step = +b.dataset.go; show(); }));
  $(".wa-copy", root)?.addEventListener("click", async (e) => { try { await navigator.clipboard.writeText(message()); e.currentTarget.querySelector(".lbl").textContent = "Copied ✓"; } catch {} });
  const dateIn = $("[data-bind=date]", root); if (dateIn) dateIn.min = new Date().toISOString().slice(0, 10);
  show();
})();
