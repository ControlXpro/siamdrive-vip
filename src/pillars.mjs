// Core offer landing pages: /private-driver/ + /bodyguards/ and their sub-pages. Imported by build.mjs.
export function buildPillars(ctx) {
  const { D, C, I, IMG, thb, minFor, btn, bookBtn, waBtn, phero, sections, listBox, faqBlock, ctaBand, imgCard, linkGrid, layout, emit, crumbLd, faqLd, serviceLd, rateTable, guardTable, monthlyTable, aside, esc, pick, by } = ctx;
  const B = D.BODYGUARD, mMin = Math.min(...D.MONTHLY.map((m) => m.price));
  const pkg = (title, sub, price, unit, items, href, pop) => `<div class="pkg${pop ? " pop" : ""}" data-reveal>${pop ? '<span class="pkg-tag">Recommended</span>' : ""}
    <p class="mono muted">${sub}</p><h3>${title}</h3><p class="pkg-price"><small>from</small>${thb(price)}<small>${unit || ""}</small></p>
    <ul>${items.map((x) => `<li>${x}</li>`).join("")}</ul>${btn(href, "Book", pop ? "btn-light btn-sm" : "btn-ghost btn-sm", I.cal, 'data-cursor="Book"')}</div>`;
  const timeline = (steps = []) => steps.length ? `<h2 class="h3" style="margin:50px 0 24px">A typical day</h2><ol class="timeline">${steps.map((s) => `<li><span class="t">${esc(s.time)}</span><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></li>`).join("")}</ol>` : "";

  const PILLAR = {
    driver: {
      url: "/private-driver/", svc: "hourly-chauffeur", name: "Private Driver", subs: D.DRIVER_PAGES, subC: C.drivers, base: "/private-driver/",
      title: "Private Driver in Bangkok — Hourly, Daily & Monthly", desc: "Hire a private driver in Bangkok for 5 hours, 10 hours or a month. Alphard, Vellfire, Cayenne & Camry with chauffeur. Driver, fuel & tolls included. Book 24/7.",
      kicker: "Private driver · Bangkok", h1: "A driver who is <em>yours</em> — all day.", video: "home",
      lead: "Book a chauffeur by the hour, the day or the month and use the car exactly as you would your own. Meetings, malls, dinners, school runs — the driver waits, the door is open, the next stop is planned.",
      cta: btn("/book/?service=hourly", "Hire a private driver", "btn-light", I.cal, 'data-cursor="Book"') + waBtn("Hello SiamDrive, I would like to hire a private driver", "Ask on WhatsApp", "btn-ghost"),
      meta: [`5 hrs from ${thb(minFor("bkk5"))}`, `10 hrs from ${thb(minFor("bkk10"))}`, "Fuel & tolls included", "6 vehicle classes"],
      pkgs: () => `<div class="pkgs">${pkg("Half day", "5 hours · Bangkok", minFor("bkk5"), "", ["Chauffeur &amp; car for 5 hours", "Unlimited stops in Bangkok", "Driver, fuel &amp; tolls included", "Overtime from " + thb(minFor("overtime")) + " / hr"], "/book/?service=hourly&hours=5")}
        ${pkg("Full day", "10 hours · Bangkok", minFor("bkk10"), "", ["Chauffeur &amp; car for 10 hours", "Day into evening, as directed", "Driver, fuel &amp; tolls included", "Add bodyguards in one tap"], "/book/?service=hourly&hours=10", true)}
        ${pkg("Monthly", "7 days · 10 hrs daily", mMin, " / month", ["Dedicated chauffeur &amp; Alphard", "Unlimited kilometres", "Excludes fuel &amp; tolls", "Residents &amp; long stays"], "/book/?service=monthly&vehicle=toyota-alphard-30")}</div>`,
      tables: () => `<h2 class="h3" style="margin:0 0 18px">Private driver rates by vehicle</h2>${rateTable(["bkk5", "bkk10", "outskirt", "overtime"], { q: "service=hourly" })}<h2 class="h3" style="margin:50px 0 18px">Monthly private driver</h2>${monthlyTable()}`,
      upsell: { title: "Add a <em>bodyguard</em> to your driver.", text: "Suited, English-speaking protection that rides with your chauffeur — from " + thb(B.h5) + " per guard.", href: "/bodyguards/", cta: "Explore bodyguards", video: "guards" },
    },
    guard: {
      url: "/bodyguards/", svc: "bodyguards", name: "Bodyguards", subs: D.GUARD_PAGES, subC: C.guards, base: "/bodyguards/",
      title: "Bodyguards in Bangkok — Suited Close Protection", desc: "Hire suited, English-speaking bodyguards in Bangkok for transfers, 5-hour or 10-hour details, events and nights out — coordinated with your private driver.",
      kicker: "Close protection · Bangkok", h1: "Discreet by default. <em>Unmistakable</em> when it matters.", video: "guards",
      lead: "Suited, English-speaking security professionals who manage the space around you — lobbies, crowds, events and late nights — while your chauffeur keeps the car one step ahead.",
      cta: btn("/book/?service=protection&guards=2", "Book bodyguards", "btn-light", I.cal, 'data-cursor="Book"') + waBtn("Hello SiamDrive, I would like to arrange bodyguards", "Discuss confidentially", "btn-ghost"),
      meta: [`From ${thb(B.h5)} per guard`, "Transfer · 5 h · 10 h", "Motorcycle escort", "Booked with your car"],
      pkgs: () => `<div class="pkgs c4">${pkg("Transfer detail", "Point to point", B.transfer, " / guard", ["Escort door to door", "Booked with your car"], "/book/?service=protection&guardPlan=transfer&guards=1")}
        ${pkg("5-hour detail", "Half day", B.h5, " / guard", ["Close protection, 5 hours", "Venues, meetings, shopping"], "/book/?service=protection&hours=5&guards=2")}
        ${pkg("10-hour detail", "Full day", B.h10, " / guard", ["Close protection, 10 hours", "Day into night"], "/book/?service=protection&hours=10&guards=2", true)}
        ${pkg("Motorcycle escort", "Convoys", B.escort5, "", ["Escort riders clear the way", "Transfer or 5 hours"], "/book/?service=protection&escort=e5&guards=2")}</div>`,
      tables: () => `<h2 class="h3" style="margin:0 0 18px">Protection rates</h2>${guardTable()}<h2 class="h3" style="margin:50px 0 18px">Your vehicle &amp; chauffeur</h2>${rateTable(["airport", "bkk5", "bkk10", "overtime"], { q: "service=protection" })}`,
      upsell: { title: "Your detail rides with a <em>private driver.</em>", text: "Protection is always coordinated with a SiamDrive chauffeur — from " + thb(minFor("bkk5")) + " for 5 hours.", href: "/private-driver/", cta: "Explore private drivers", video: "home" },
    },
  };

  for (const P of Object.values(PILLAR)) {
    const c = by(C.services, P.svc), trail = [["Home", "/"], [P.name, P.url]];
    const subCards = P.subs.map((s) => by(P.subC, s)).filter((x) => x.slug);
    const body = `
${phero({ trail, kicker: P.kicker, h1: P.h1, lead: P.lead, video: P.video, meta: P.meta, cta: P.cta })}
<section class="sec"><div class="wrap">
  <div class="index"><span>01 — Packages</span><span>Fixed prices · THB</span></div>
  <div class="sec-head"><h2 class="h2" data-split>Choose your <em>package.</em></h2><p class="lead">Your exact price updates live as you pick the vehicle and hours in the booking form — confirmed by the concierge on WhatsApp.</p></div>
  ${P.pkgs()}
</div></section>
${subCards.length ? `<section class="sec light"><div class="wrap">
  <div class="index"><span>02 — Specialists</span><span>${subCards.length} ways to book</span></div>
  <div class="sec-head"><h2 class="h2" data-split>Shaped around <em>your day.</em></h2><p class="lead">${P.svc === "bodyguards" ? "Close protection planned for the setting you're in." : "Private drivers configured for the way you travel."}</p></div>
  <div class="cards">${subCards.map((s, i) => imgCard({ href: P.base + s.slug + "/", img: pick(s.slug, P.svc === "bodyguards" ? ["hero-bodyguards", "sec-why", "banner-onecall"][i % 3] : ["svc-chauffeur", "sec-why", "car-alphard40exec", "hero-home", "hero-bodyguards", "car-sclass"][i % 6]), mono: s.kicker || P.name, title: s.name, text: (s.intro || "").split(". ")[0] + ".", foot: "Explore" })).join("")}</div>
</div></section>` : ""}
<section class="sec-sm"><div class="wrap layout"><div>
  <div class="prose">${sections(c.sections)}</div>
  <div class="lists">${listBox("What's included", c.includes)}${listBox("Ideal for", c.idealFor)}</div>
  ${c.process ? `<div class="steps" style="margin:50px 0">${c.process.map((p, i) => `<div class="step"><span class="n">0${i + 1}</span><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p></div>`).join("")}</div>` : ""}
  ${P.tables()}
</div>${aside({ title: P.name, price: P.svc === "bodyguards" ? B.h5 : minFor("bkk5"), priceLabel: P.svc === "bodyguards" ? "Per guard from" : "5 hours from", q: P.svc === "bodyguards" ? "service=protection&guards=2" : "service=hourly", msg: `Hello SiamDrive, I'd like to book: ${P.name}` })}</div></section>
<section class="sec-sm"><div class="wrap"><div class="cta-band">
  <div class="bg"><video data-autoplay muted loop playsinline preload="none" poster="/assets/video/${P.upsell.video}-poster.jpg"><source src="/assets/video/${P.upsell.video}-m.mp4" type="video/mp4"></video></div>
  <p class="eyebrow">Better together</p><h2 class="h1" style="margin:20px 0 22px;max-width:14ch">${P.upsell.title}</h2><p class="lead">${P.upsell.text}</p>
  <div class="hero-cta">${btn(P.upsell.href, P.upsell.cta, "btn-light")}${btn("/book/?service=protection&guards=2", "Book driver + bodyguards", "btn-ghost", I.cal)}</div></div></div></section>
${faqBlock(c.faqs)}${ctaBand()}`;
    const low = P.svc === "bodyguards" ? B.transfer : minFor("bkk5"), high = P.svc === "bodyguards" ? B.escort10 : mMin;
    emit(P.url, layout({ url: P.url, title: P.title, desc: P.desc, body, ld: [crumbLd(trail), serviceLd(P.name + " in Bangkok", P.url, low, high, P.desc), faqLd(c.faqs)] }), 0.98);

    // sub-pages
    subCards.forEach((s, i) => {
      const url = P.base + s.slug + "/", strail = [["Home", "/"], [P.name, P.url], [s.name, url]];
      const isG = P.svc === "bodyguards", bundle = s.slug === "driver-with-bodyguard";
      const img = pick(s.slug, isG ? ["hero-bodyguards", "sec-why", "banner-onecall"][i % 3] : ["svc-chauffeur", "sec-why", "car-alphard40exec", "hero-home", "hero-bodyguards", "car-sclass"][i % 6]);
      const q = isG || bundle ? "service=protection&guards=2" : s.slug === "half-day-driver" ? "service=hourly&hours=5" : "service=hourly&hours=10";
      const tables = isG || bundle ? guardTable() + `<h3 class="h3" style="margin:40px 0 16px">With your private driver</h3>` + rateTable(["bkk5", "bkk10", "overtime"], { q: "service=protection" }) : rateTable(["bkk5", "bkk10", "overtime"], { q: "service=hourly" });
      const sibs = subCards.filter((o) => o.slug !== s.slug);
      const body = `
${phero({ trail: strail, kicker: s.kicker || P.name, h1: esc(s.h1 || s.name), lead: s.intro, img, meta: isG ? [`From ${thb(B.h5)} / guard`, "Suited · English-speaking", "Booked with your car"] : [`5 hrs from ${thb(minFor("bkk5"))}`, `10 hrs from ${thb(minFor("bkk10"))}`, "Fuel & tolls included"] })}
<section class="sec-sm"><div class="wrap layout"><div>
  <div class="prose">${sections(s.sections)}</div>
  <div class="lists">${listBox("What's included", s.includes)}${listBox("Ideal for", s.idealFor)}</div>
  ${timeline(s.sampleDay)}
  <h2 class="h3" style="margin:40px 0 18px">Rates</h2>${tables}
  <h2 class="h3" style="margin:50px 0 18px">More ${isG ? "protection" : "private driver"} options</h2>${linkGrid([[P.name + " overview", P.url], ...sibs.map((o) => [o.name, P.base + o.slug + "/"])])}
</div>${aside({ title: s.name, price: isG ? B.h5 : minFor(s.slug === "half-day-driver" ? "bkk5" : bundle ? "bkk5" : "bkk10"), priceLabel: isG ? "Per guard from" : s.slug === "full-day-driver" ? "10 hours from" : "From", q, msg: `Hello SiamDrive, I'd like to book: ${s.name}` })}</div></section>
${faqBlock(s.faqs)}${ctaBand(isG ? "Protection, <em>planned</em> in confidence." : undefined, undefined, isG ? "guards" : "home")}`;
      emit(url, layout({ url, title: s.title || s.name, desc: s.metaDescription, body, ld: [crumbLd(strail), serviceLd(s.name + " in Bangkok", url, isG ? B.transfer : minFor("bkk5"), null, s.intro || ""), faqLd(s.faqs)] }), 0.9);
    });
  }
}
