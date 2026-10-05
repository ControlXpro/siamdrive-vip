// /book/ — single-page instant quote calculator. Imported by build.mjs.
export function buildBook(ctx) {
  const { D, I, IMG, thb, esc, layout, emit, crumbLd, phero } = ctx;
  const B = D.BODYGUARD;
  const choice = (group, value, title, sub, icon = "") => `<button type="button" class="choice" data-group="${group}" data-value="${value}" aria-pressed="false">${icon ? `<span class="choice-ic">${icon}</span>` : ""}<span><b>${title}</b><small>${sub}</small></span></button>`;
  const seg = (group, opts) => `<div class="seg" role="group">${opts.map(([v, t, s]) => `<button type="button" data-group="${group}" data-value="${v}" aria-pressed="false"><b>${t}</b>${s ? `<small>${s}</small>` : ""}</button>`).join("")}</div>`;
  const stepper = (key, min, max, label, hint = "") => `<div class="stepper" data-key="${key}" data-min="${min}" data-max="${max}"><div><b>${label}</b>${hint ? `<small>${hint}</small>` : ""}</div><div class="stepper-ctl"><button type="button" data-d="-1" aria-label="Fewer">−</button><output>0</output><button type="button" data-d="1" aria-label="More">+</button></div></div>`;
  const ICN = {
    car: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 13l2-5a2 2 0 0 1 1.9-1.3h10.2A2 2 0 0 1 19 8l2 5v5a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H6v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z"/><circle cx="7.5" cy="14.5" r="1"/><circle cx="16.5" cy="14.5" r="1"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6Z"/><path d="M9.5 12l2 2 3.5-4"/></svg>',
    fast: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></svg>',
    plane: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 16l20-6-9 8-2-4Z"/><path d="M13 14l-2 6"/></svg>',
  };
  const step = (n, title, inner, show = "", hint = "") => `<section class="qc-step"${show ? ` data-show="${show}"` : ""}><div class="qc-head"><span class="qc-num"></span><div><h2>${title}</h2>${hint ? `<p>${hint}</p>` : ""}</div></div>${inner}</section>`;
  const body = `
${phero({ trail: [["Home", "/"], ["Instant quote", "/book/"]], kicker: "Instant quote · no payment now", h1: "Get your price <em>in seconds.</em>", lead: "Tap your choices below — the price updates as you go. When it looks right, send it to our concierge on WhatsApp and we confirm within minutes." })}
<section class="sec-sm" style="padding-top:10px"><div class="wrap">
<div class="qc">
  <div class="qc-main">
    ${step(1, "What do you need?", `<div class="choices">${choice("service", "hourly", "Private driver", "Car &amp; chauffeur, by the hour", ICN.car)}${choice("service", "protection", "Driver + bodyguards", "Chauffeur with a protection detail", ICN.shield)}${choice("service", "airport", "Airport transfer", "Meet &amp; greet · BKK / DMK / UTP", ICN.plane)}<button type="button" class="choice" data-preset="fasttrack" aria-pressed="false"><span class="choice-ic">${ICN.fast}</span><span><b>Fast-Track &amp; VIP buggy</b><small>Suvarnabhumi arrival · skip the queues</small></span></button></div>
      <div class="more-svc"><span>Also:</span><button type="button" class="chip-btn" data-group="service" data-value="intercity" aria-pressed="false">Out of town / day trip</button><button type="button" class="chip-btn" data-group="service" data-value="monthly" aria-pressed="false">Monthly driver</button></div>`)}
    ${step(2, "How long?", seg("hours", [["5", "Half day", "5 hours"], ["10", "Full day", "10 hours"]]) + `<p class="qc-note">Your chauffeur stays with you the whole time — as many stops as you like. Extra time is billed per hour.</p>`, "hourly protection")}
    ${step(2, "Which airport?", `<div class="field-row"><div class="field"><label for="qc-ap">Airport</label><select id="qc-ap" data-bind="airport">${D.AIRPORTS.map((a) => `<option value="${a.slug}">${a.short} (${a.code})</option>`).join("")}</select></div></div>` + seg("direction", [["arrival", "Arriving", "We pick you up"], ["departure", "Departing", "We drop you off"]]), "airport")}
    ${step(2, "Where to?", `<div class="field-row"><div class="field"><label for="qc-dest">Destination from Bangkok</label><select id="qc-dest" data-bind="dest">${D.ROUTES.map((r) => `<option value="${r.slug}">${esc(r.name)} · ${r.km} km</option>`).join("")}</select></div></div>` + seg("trip", [["transfer", "One way", "Drop-off there"], ["day", "Day trip", "Return same day · 10 hrs"]]), "intercity")}
    ${step(2, "Monthly private driver", `<p class="qc-note" style="margin-top:0">Same chauffeur and car, 7 days a week, 10 hours a day, unlimited kilometres (fuel &amp; tolls not included). Available with the Alphard 30 or Alphard 40.</p>`, "monthly")}
    ${step(2, "Arriving at Suvarnabhumi?", `<label class="toggle"><input type="checkbox" data-bind="ft"><span><b>Start the day with Fast-Track</b><small>We meet you at the aircraft door with a private buggy and priority immigration, then your driver takes over · ${thb(D.FASTTRACK.arrival)} per guest + ${thb(D.FASTTRACK.buggy)} per buggy</small></span></label>`, "hourly protection", "Optional — only if your booking begins with a flight arrival.")}
    ${step(3, "Who's travelling — and which car?", stepper("pax", 1, 12, "Guests", "Including children") + `<div class="cars"></div>`, "", "Every price below already matches your choices. Bigger groups automatically get extra cars.")}
    ${step(4, "How many bodyguards?", stepper("guards", 0, 8, "Bodyguards", `${thb(B.h5)} each for 5 hrs · ${thb(B.h10)} each for 10 hrs`) + `<label class="toggle"><input type="checkbox" data-bind="escort"><span><b>Add a motorcycle escort</b><small>Escort riders clear the way · ${thb(B.escort5)} (5 hrs) / ${thb(B.escort10)} (10 hrs)</small></span></label>`, "protection")}
    ${step(4, "Fast-Track &amp; extras", `<div data-only="bkk"><label class="toggle toggle-hl"><input type="checkbox" data-bind="ft"><span><b>Add Fast-Track</b><small data-dir="arrival">Met at the aircraft door · private electric buggy · priority immigration · butler luggage help. ${thb(D.FASTTRACK.arrival)} per guest + ${thb(D.FASTTRACK.buggy)} per buggy (1 buggy per 2 guests)</small><small data-dir="departure">Priority departure lanes with a butler escort · ${thb(D.FASTTRACK.departure)} per guest</small></span></label></div>
      <div data-only="notbkk" class="qc-info">Fast-Track and the VIP buggy are offered at <b>Suvarnabhumi (BKK)</b>. <button type="button" class="chip-btn" data-switch-bkk>Switch to Suvarnabhumi</button></div>` + stepper("guards", 0, 8, "Bodyguards at the airport", `${thb(B.transfer)} per guard`), "airport")}
    ${step(5, "When &amp; where?", `<div class="field-row c2">
        <div class="field"><label for="qc-date">Date</label><input id="qc-date" type="date" data-bind="date"></div>
        <div class="field"><label for="qc-time">Time</label><input id="qc-time" type="time" data-bind="time"></div>
        <div class="field full"><label for="qc-pick">Pick-up address or hotel</label><input id="qc-pick" type="text" data-bind="pickup" placeholder="e.g. Hotel name, Sukhumvit"></div>
        <div class="field full" data-show="airport"><label for="qc-fl">Flight number (optional)</label><input id="qc-fl" type="text" data-bind="flight" placeholder="e.g. TG 917"></div>
        <div class="field"><label for="qc-name">Your name</label><input id="qc-name" type="text" data-bind="name" autocomplete="name"></div>
        <div class="field"><label for="qc-notes">Notes (optional)</label><input id="qc-notes" type="text" data-bind="notes" placeholder="Child seat, extra stops…"></div>
      </div>`, "", "You can leave anything you're unsure of — the concierge will ask.")}
  </div>
  <aside class="qc-total" aria-live="polite">
    <p class="eyebrow">Your price</p>
    <div class="qc-price"><b>—</b><small class="qc-sub"></small></div>
    <div class="qc-lines"></div>
    <a class="btn btn-wa qc-send" href="#" target="_blank" rel="noopener" data-cursor="Send"><span class="ic">${I.wa}</span>Send booking on WhatsApp</a>
    <ul class="qc-trust"><li>No payment now</li><li>Driver, fuel &amp; tolls included</li><li>Confirmed by a real person, usually in minutes</li></ul>
    <button type="button" class="qc-copy">Copy booking details</button>
  </aside>
</div></div></section>
<div class="qc-bar" aria-hidden="true"><div><small>Your price</small><b class="qc-bar-price">—</b></div><a class="btn btn-wa btn-sm qc-send" href="#" target="_blank" rel="noopener"><span class="ic">${I.wa}</span>Send on WhatsApp</a></div>`;
  emit("/book/", layout({ url: "/book/", book: true, title: "Instant Quote — Private Driver & Bodyguards in Bangkok", desc: "Get an instant price for a private driver, bodyguards or airport transfer in Bangkok. Pick your options, see the total, and send it to our 24/7 WhatsApp concierge.", body, ld: [crumbLd([["Home", "/"], ["Instant quote", "/book/"]])] }), 0.95);
}
