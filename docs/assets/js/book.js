/* SIAMDRIVE.VIP — single-page instant quote calculator. Prices from window.SD (generated from src/data.mjs). */
(() => {
  const P = window.SD; if (!P) return;
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const fmt = (n) => n.toLocaleString("en-US") + " THB";
  const root = $(".qc"); if (!root) return;

  /* ---------- state ---------- */
  const S = {
    service: "hourly", hours: "10", airport: "suvarnabhumi-bkk", direction: "arrival", dest: "pattaya", trip: "transfer",
    pax: 2, vehicle: "toyota-alphard-40", guards: 0, escort: false, ft: false,
    date: "", time: "", pickup: "", flight: "", name: "", notes: "",
  };
  try { Object.assign(S, JSON.parse(localStorage.getItem("sd-quote") || "{}")); } catch {}
  const url = new URLSearchParams(location.search);
  ["service", "hours", "airport", "direction", "dest", "trip", "vehicle", "date"].forEach((k) => url.get(k) && (S[k] = url.get(k)));
  ["guards", "pax"].forEach((k) => url.get(k) && (S[k] = +url.get(k)));
  if (url.get("escort")) S.escort = url.get("escort") !== "none";
  if (url.get("ft")) S.ft = url.get("ft") === "1";
  if (url.get("service") === "protection" && !url.get("guards") && S.guards < 1) S.guards = 2;
  if (!["5", "10"].includes(S.hours)) S.hours = "10";
  const save = () => { try { localStorage.setItem("sd-quote", JSON.stringify(S)); } catch {} };

  const veh = (slug = S.vehicle) => P.vehicles.find((v) => v.slug === slug) || P.vehicles[2];
  const route = () => P.routes.find((r) => r.slug === S.dest);
  const ap = () => P.airports.find((a) => a.slug === S.airport) || P.airports[0];
  const seats = (v) => +v.seats.split("+")[0];
  const isBKK = () => S.service === "airport" && S.airport === "suvarnabhumi-bkk";
  const monthlyOf = (v) => (P.monthly.find((m) => m.vehicle === v.name) || {}).price;

  /* ---------- pricing ---------- */
  const nCars = (v) => Math.max(1, Math.ceil(S.pax / seats(v)));
  const carPrice = (v) => { const one = unitPrice(v); return one == null ? null : one * nCars(v); };
  const unitPrice = (v) => {
    switch (S.service) {
      case "hourly": case "protection": return S.hours === "10" ? v.price.bkk10 : v.price.bkk5;
      case "airport": return S.airport === "u-tapao-utp" ? v.price.pattaya : v.price.airport;
      case "intercity": { const r = route(), t = r && P.tiers[r.tier]; const col = t && t[S.trip === "day" ? "day" : "transfer"]; return col ? v.price[col] : null; }
      case "monthly": return monthlyOf(v) || null;
    }
    return null;
  };
  const carLabel = () => ({
    hourly: `Private driver · ${S.hours} hours`, protection: `Private driver · ${S.hours} hours`,
    airport: `Airport ${S.direction === "arrival" ? "pick-up" : "drop-off"} · ${ap().short}`,
    intercity: route() ? `${S.trip === "day" ? "Day trip" : "Transfer"} · ${route().name}` : "Out of town",
    monthly: "Monthly private driver",
  })[S.service];
  const lines = () => {
    const v = veh(), n = nCars(v), L = [[`${carLabel()} — ${n > 1 ? n + " × " : ""}${v.name}`, carPrice(v)]];
    if (S.service === "protection" && S.guards > 0) L.push([`Bodyguards × ${S.guards} (${S.hours} hours)`, S.guards * (S.hours === "10" ? P.bodyguard.h10 : P.bodyguard.h5)]);
    if (S.service === "protection" && S.escort) L.push([`Motorcycle escort (${S.hours} hours)`, S.hours === "10" ? P.bodyguard.escort10 : P.bodyguard.escort5]);
    if (isBKK() && S.guards > 0) L.push([`Bodyguards × ${S.guards} (airport transfer)`, S.guards * P.bodyguard.transfer]);
    if (isBKK() && S.ft) {
      if (S.direction === "arrival") {
        L.push([`Fast-Track arrival × ${S.pax} guests`, S.pax * P.fasttrack.arrival]);
        const n = Math.ceil(S.pax / 2); L.push([`Electric buggy × ${n}`, n * P.fasttrack.buggy]);
      } else L.push([`Fast-Track departure × ${S.pax} guests`, S.pax * P.fasttrack.departure]);
    }
    return L;
  };
  const total = () => { const L = lines(); return L.some((l) => l[1] == null) ? null : L.reduce((a, l) => a + l[1], 0); };

  /* ---------- message ---------- */
  const message = () => {
    const v = veh(), L = lines(), T = total();
    const svc = { hourly: "Private driver", protection: "Private driver + bodyguards", airport: "Airport transfer", intercity: "Out of town", monthly: "Monthly private driver" }[S.service];
    const rows = ["Hello SiamDrive, I would like to book:", "", `• Service: ${svc}`];
    if (S.service === "hourly" || S.service === "protection") rows.push(`• Duration: ${S.hours} hours`);
    if (S.service === "airport") rows.push(`• Airport: ${ap().name} (${ap().code}) — ${S.direction === "arrival" ? "arrival pick-up" : "departure drop-off"}${S.flight ? " · Flight " + S.flight : ""}`);
    if (S.service === "intercity" && route()) rows.push(`• Destination: ${route().name} (${S.trip === "day" ? "day trip, return" : "one way"})`);
    rows.push(`• Date & time: ${S.date || "TBC"}${S.time ? " " + S.time : ""}`);
    if (S.pickup) rows.push(`• Pick-up: ${S.pickup}`);
    rows.push(`• Vehicle: ${nCars(v) > 1 ? nCars(v) + " × " : ""}${v.name}`, `• Guests: ${S.pax}`, "", "Quote:");
    L.forEach(([a, b]) => rows.push(`  – ${a}: ${b == null ? "on request" : fmt(b)}`));
    rows.push(`  = Total: ${T == null ? "on request" : fmt(T)}`, "", `Name: ${S.name || "—"}`);
    if (S.notes) rows.push(`Notes: ${S.notes}`);
    return rows.join("\n");
  };

  /* ---------- render ---------- */
  const shows = (key) => key.split(" ").some((k) => k === S.service || (k === "airport-bkk" && isBKK()));
  const render = () => {
    $$("[data-group]", root.parentNode).forEach((b) => b.setAttribute("aria-pressed", String(S[b.dataset.group]) === b.dataset.value));
    $$("[data-show]", root).forEach((el) => (el.hidden = !shows(el.dataset.show)));
    $$("[data-dir]", root).forEach((el) => (el.hidden = el.dataset.dir !== S.direction));
    $$(".stepper", root).forEach((st) => ($("output", st).textContent = S[st.dataset.key]));
    $$("input[type=checkbox][data-bind]", root).forEach((i) => (i.checked = !!S[i.dataset.bind]));
    // keep a valid vehicle
    const ok = (v) => S.service !== "monthly" || !!monthlyOf(v);
    if (!ok(veh())) { const alt = P.vehicles.find(ok); if (alt) S.vehicle = alt.slug; }
    $(".cars", root).innerHTML = P.vehicles.map((v) => {
      const p = carPrice(v), n = nCars(v);
      const dis = S.service === "monthly" && !monthlyOf(v);
      return `<button type="button" class="car-opt" data-car="${v.slug}" aria-pressed="${v.slug === S.vehicle}"${dis ? " disabled" : ""}>
        <img src="/assets/img/${v.img}-800.webp" alt="" loading="lazy" width="400" height="260">
        <span class="car-opt-body"><b>${v.name}</b><small>${n > 1 ? `<span class="car-n">${n} cars for ${S.pax} guests</span>` : `${v.seats} seats · ${v.luggage} large bags`}</small>
        <span class="car-opt-price">${dis ? "Monthly not available" : p != null ? fmt(p) : "Quote on request"}</span></span></button>`;
    }).join("");
    $$(".car-opt", root).forEach((b) => b.addEventListener("click", () => { S.vehicle = b.dataset.car; update(); }));
    summary();
  };
  const summary = () => {
    const L = lines(), T = total();
    const priceTxt = T == null ? "On request" : fmt(T);
    $(".qc-price b", root.parentNode).textContent = priceTxt;
    $(".qc-sub").textContent = T == null ? "We'll quote this route on WhatsApp" : "Fixed price · estimate confirmed on WhatsApp";
    $(".qc-lines").innerHTML = L.map(([a, b]) => `<div><span>${a}</span><span>${b == null ? "on request" : fmt(b)}</span></div>`).join("");
    $$(".qc-bar-price").forEach((e) => (e.textContent = priceTxt));
    const href = "https://wa.me/" + P.whatsapp + "?text=" + encodeURIComponent(message());
    $$(".qc-send").forEach((a) => (a.href = href));
  };
  const update = () => { save(); render(); };

  /* ---------- events ---------- */
  $$("[data-group]", root.parentNode).forEach((b) => b.addEventListener("click", () => {
    const g = b.dataset.group; S[g] = b.dataset.value;
    if (g === "service") {
      S.guards = S.service === "protection" ? 2 : 0; S.escort = false; S.ft = false;
      if (S.service === "monthly" && !monthlyOf(veh())) S.vehicle = "toyota-alphard-40";
    }
    update();
  }));
  $$(".stepper", root).forEach((st) => $$("button", st).forEach((b) => b.addEventListener("click", () => {
    const k = st.dataset.key, min = +st.dataset.min, max = +st.dataset.max;
    S[k] = Math.max(min, Math.min(max, S[k] + +b.dataset.d)); update();
  })));
  $$("[data-bind]", root).forEach((i) => {
    const k = i.dataset.bind;
    if (i.type === "checkbox") { i.checked = !!S[k]; i.addEventListener("change", () => { S[k] = i.checked; update(); }); }
    else { if (S[k]) i.value = S[k]; i.addEventListener(i.tagName === "SELECT" ? "change" : "input", () => { S[k] = i.value; i.tagName === "SELECT" ? update() : (save(), summary()); }); }
  });
  const d = $("[data-bind=date]", root); if (d) d.min = new Date().toISOString().slice(0, 10);
  $(".qc-copy")?.addEventListener("click", async (e) => { try { await navigator.clipboard.writeText(message()); e.currentTarget.textContent = "Copied ✓"; } catch {} });
  // mobile sticky bar: show once the calculator is on screen
  const bar = $(".qc-bar");
  if (bar && "IntersectionObserver" in window) new IntersectionObserver(([e]) => bar.classList.toggle("on", e.isIntersecting), { rootMargin: "0px 0px -40% 0px" }).observe(root);
  render();
})();
