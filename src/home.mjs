// Homepage — positioned around private drivers + bodyguards. Imported by build.mjs.
export function buildHome(ctx) {
  const { D, C, S, I, IMG, thb, minFor, btn, bookBtn, waBtn, pick, faqBlock, ctaBand, imgCard, linkGrid, layout, emit, faqLd, esc } = ctx;
  const B = D.BODYGUARD, mMin = Math.min(...D.MONTHLY.map((m) => m.price));
  const arrow = I.arrow.replace("<svg", '<svg width="16" height="16"');
  const homeFaq = [
    { q: "How does hiring a private driver work?", a: "Choose a vehicle and book a 5-hour or 10-hour block. Your chauffeur collects you and stays with the car for the whole booking — meetings, shopping, dinners, as many stops as you like. Extra time is billed per hour at the published overtime rate." },
    { q: "Can I add bodyguards to my driver booking?", a: "Yes. Suited, English-speaking bodyguards are booked per guard for a transfer, 5 hours or 10 hours, and are coordinated with your chauffeur so car and protection move as one. Protection is always booked together with a SiamDrive vehicle." },
    { q: "Are fuel, tolls and the driver included?", a: "Yes. Every chauffeured rate includes the driver, fuel and expressway tolls. Monthly packages exclude fuel and tolls. Overtime, overnight stays and add-ons are listed upfront." },
    { q: "Can I keep the same driver for my whole stay?", a: "Monthly packages give you a dedicated chauffeur and car seven days a week, ten hours a day, with unlimited kilometres. For shorter stays, ask the concierge to keep the same chauffeur across your bookings." },
    { q: "How quickly can you confirm?", a: "Send your booking from the form or message us on WhatsApp — the concierge confirms vehicle, chauffeur and fixed price, usually within minutes, 24 hours a day." },
    { q: "Do you also do airport pick-ups?", a: "Of course. We meet you in arrivals with a name sign and track your flight; at Suvarnabhumi you can add Fast-Track and a private electric buggy from the aircraft door." },
  ];
  const pkg = (title, sub, price, unit, items, href, pop) => `<div class="pkg${pop ? " pop" : ""}" data-reveal>${pop ? '<span class="pkg-tag">Recommended</span>' : ""}
    <p class="mono muted">${sub}</p><h3>${title}</h3><p class="pkg-price"><small>from</small>${thb(price)}<small>${unit}</small></p>
    <ul>${items.map((x) => `<li>${x}</li>`).join("")}</ul>${btn(href, "Book", pop ? "btn-light btn-sm" : "btn-ghost btn-sm", I.cal, 'data-cursor="Book"')}</div>`;
  const body = `
<section class="hero" aria-label="Introduction">
  <div class="hero-media"><video data-autoplay data-defer muted loop playsinline preload="none" poster="/assets/video/home-poster.jpg"><source src="/assets/video/home-m.mp4" media="(max-width:720px)" type="video/mp4"><source src="/assets/video/home.mp4" type="video/mp4"></video></div>
  <div class="hero-word" aria-hidden="true">SiamDrive</div>
  <div class="wrap hero-body">
    <div class="hero-top">
      <div>
        <p class="eyebrow">Bangkok · Private Drivers · Bodyguards · 24/7</p>
        <h1 class="display" data-split>Your private driver. <em>Your security.</em></h1>
        <p class="lead">A dedicated chauffeur at your disposal by the hour, the day or the month — with suited, English-speaking bodyguards whenever you need them. One concierge, 24 hours a day.</p>
        <div class="hero-cta">${btn("/book/?service=hourly", "Hire a private driver", "btn-light", I.cal, 'data-cursor="Book"')}${btn("/book/?service=protection&guards=2", "Book bodyguards", "btn-ghost", I.arrow, 'data-cursor="Book"')}</div>
      </div>
      <form class="qb" onsubmit="return false" aria-label="Instant price">
        <div class="qb-tabs" role="tablist"><button type="button" role="tab" data-tab="driver" aria-selected="true">Private driver</button><button type="button" role="tab" data-tab="guards">Bodyguards</button><button type="button" role="tab" data-tab="airport">Airport</button></div>
        <div class="qb-grid">
          <div class="field" data-mode="driver guards"><label for="qb-h">Duration</label><select id="qb-h" name="hours"><option value="10">Full day · 10 hours</option><option value="5">Half day · 5 hours</option></select></div>
          <div class="field" data-mode="guards" hidden><label for="qb-g">Bodyguards</label><select id="qb-g" name="guards"><option value="1">1 guard</option><option value="2" selected>2 guards</option><option value="3">3 guards</option><option value="4">4 guards</option></select></div>
          <div class="field" data-mode="driver"><label for="qb-d">Date</label><input id="qb-d" name="date" type="date"></div>
          <div class="field" data-mode="airport" hidden><label>Airport</label><select name="airport"><option>Suvarnabhumi (BKK)</option><option>Don Mueang (DMK)</option></select></div>
          <div class="field full"><label for="qb-v">Vehicle</label><select id="qb-v" name="vehicle">${D.VEHICLES.map((v) => `<option value="${v.slug}"${v.slug === "toyota-alphard-40" ? " selected" : ""}>${v.name} · ${v.seats} seats</option>`).join("")}</select></div>
        </div>
        <div class="qb-foot"><div class="qb-price"><small>Private driver</small><b>—</b></div><a class="btn btn-light btn-sm qb-go" href="/book/"><span class="ic">${I.arrow}</span>Continue</a></div>
        <p class="qb-note">Driver, fuel &amp; tolls included · chauffeur stays with you · confirmed on WhatsApp</p>
      </form>
    </div>
    <div class="hero-strip">
      <div>Private driver<b>from ${thb(minFor("bkk5"))} · 5 hrs</b></div>
      <div>Bodyguards<b>from ${thb(B.h5)} · per guard</b></div>
      <div>Concierge<b><i class="dot" style="display:inline-block;margin-right:8px"></i>Online 24/7</b></div>
      <div>Bangkok time<b data-bkk-clock>--:--:--</b></div>
    </div>
  </div>
</section>

<div class="marquee" aria-hidden="true"><div class="marquee-track">${[...Array(2)].map(() => ["Private driver", "By the hour", "Bodyguards", "By the day", "Executive protection", "By the month", "Sukhumvit", "Discreet", "Riverside", "Suited", "Thonglor", "English-speaking"].map((t) => `<span>${t}</span>`).join("")).join("")}</div></div>

<section class="sec"><div class="wrap">
  <div class="statement-grid">
    <p class="eyebrow">01 — The standard</p>
    <div class="statement"><p>Not a ride. A driver who is yours for the day, and people who quietly keep you safe — the car already waiting, the doors already open, the next move already planned.</p></div>
  </div>
  <div class="board" style="margin-top:clamp(60px,8vw,110px)" data-reveal>
    <div class="panel"><div class="panel-head"><span>Private driver / 01</span><b>At your disposal</b></div>
      <div class="panel-rows"><div>Half day · 5 hours <i></i></div><div>Full day · 10 hours <i></i></div><div>Monthly · 7 days a week <i></i></div><div>Overtime by the hour <i></i></div></div>
      <p class="big">${thb(minFor("bkk5")).replace(" THB", "")}<small style="font-size:.35em;margin-left:8px">THB / 5 h</small></p><p>Driver, fuel and tolls included. The car stays with you.</p></div>
    <div class="panel"><div class="panel-head"><span>Protection / 02</span><b>Suited detail</b></div>
      <div class="panel-rows"><div>Transfer detail <i></i></div><div>5-hour detail <i></i></div><div>10-hour detail <i></i></div><div>Motorcycle escort <i></i></div></div>
      <p class="big">${thb(B.h5).replace(" THB", "")}<small style="font-size:.35em;margin-left:8px">THB / guard</small></p><p>English-speaking, discreet, coordinated with your chauffeur.</p></div>
    <div class="panel"><div class="panel-head"><span>Concierge / 03</span><b>Status</b></div>
      <div class="panel-rows"><div>WhatsApp desk <i></i></div><div>Booking engine <i></i></div><div>Driver dispatch <i></i></div><div>Protection planning <i></i></div></div>
      <p class="big"><span data-bkk-clock>--:--</span></p><p>Bangkok time. Someone is always awake to answer.</p></div>
  </div>
</div></section>

<section class="sec light"><div class="wrap">
  <div class="index"><span>02 — What we do</span><span>Two disciplines, one team</span></div>
  <div class="sec-head"><h2 class="h2" data-split>A driver who is <em>yours.</em> Protection that <em>never shows off.</em></h2><p class="lead">Book either on its own, or together — your chauffeur and your security detail plan the day as one unit.</p></div>
  <div class="duo">
    <a class="duo-card" href="/private-driver/" data-cursor="Explore">
      <div class="duo-media"><img src="${IMG("svc-chauffeur")}" alt="Private driver with black S-Class in Bangkok" loading="lazy"></div>
      <div class="duo-body"><p class="mono">Private driver</p><h3 class="h2">By the hour, <em>the day,</em> the month.</h3>
        <ul><li>5 or 10-hour blocks, as many stops as you like</li><li>The chauffeur waits — meetings, malls, dinners</li><li>Monthly: same driver, 7 days a week</li><li>Six vehicle classes, Camry to Cayenne</li></ul>
        <div class="duo-foot"><span><small>from</small>${thb(minFor("bkk5"))}</span><span class="ar">${arrow}</span></div></div></a>
    <a class="duo-card" href="/bodyguards/" data-cursor="Explore">
      <div class="duo-media"><video data-autoplay muted loop playsinline preload="none" poster="/assets/video/guards-poster.jpg"><source src="/assets/video/guards-m.mp4" type="video/mp4"></video></div>
      <div class="duo-body"><p class="mono">Bodyguards</p><h3 class="h2">Discreet by default. <em>Unmistakable</em> when it matters.</h3>
        <ul><li>Suited, English-speaking professionals</li><li>Transfer, 5-hour and 10-hour details</li><li>Motorcycle escort for convoys</li><li>Planned confidentially on WhatsApp</li></ul>
        <div class="duo-foot"><span><small>from</small>${thb(B.h5)} <small>/ guard</small></span><span class="ar">${arrow}</span></div></div></a>
  </div>
</div></section>

<section class="sec"><div class="wrap">
  <div class="index"><span>03 — Packages</span><span>Fixed prices · THB</span></div>
  <div class="sec-head"><h2 class="h2" data-split>Choose your <em>package.</em></h2><p class="lead">Prices start with the Toyota Camry; your exact price updates live as you pick the vehicle in the booking form.</p></div>
  <p class="eyebrow" style="margin-bottom:20px">Private driver</p>
  <div class="pkgs">
    ${pkg("Half day", "5 hours · Bangkok", minFor("bkk5"), "", ["Chauffeur &amp; car for 5 hours", "Unlimited stops in Bangkok", "Driver, fuel &amp; tolls included", "Overtime from " + thb(minFor("overtime")) + " / hr"], "/book/?service=hourly&hours=5")}
    ${pkg("Full day", "10 hours · Bangkok", minFor("bkk10"), "", ["Chauffeur &amp; car for 10 hours", "Meetings, shopping, dinner — all day", "Driver, fuel &amp; tolls included", "Add bodyguards in one tap"], "/book/?service=hourly&hours=10", true)}
    ${pkg("Monthly", "7 days · 10 hrs daily", mMin, " / month", ["Dedicated chauffeur &amp; Alphard", "Unlimited kilometres", "Excludes fuel &amp; tolls", "Ideal for residents &amp; long stays"], "/book/?service=monthly&vehicle=toyota-alphard-30")}
  </div>
  <p class="eyebrow" style="margin:60px 0 20px">Bodyguards · per guard</p>
  <div class="pkgs c4">
    ${pkg("Transfer detail", "Point to point", B.transfer, "", ["Escort door to door", "Booked with your car"], "/book/?service=protection&guardPlan=transfer&guards=1")}
    ${pkg("5-hour detail", "Half day", B.h5, "", ["Close protection, 5 hours", "Venues, meetings, shopping"], "/book/?service=protection&hours=5&guards=2")}
    ${pkg("10-hour detail", "Full day", B.h10, "", ["Close protection, 10 hours", "Day into night"], "/book/?service=protection&hours=10&guards=2", true)}
    ${pkg("Motorcycle escort", "Convoys", B.escort5, "", ["Escort riders clear the way", "Transfer or 5 hours"], "/book/?service=protection&escort=e5&guards=2")}
  </div>
  <div class="hero-cta" style="margin-top:40px">${btn("/pricing/", "Full rate card", "btn-ghost")}</div>
</div></section>

<section class="sec" style="padding-bottom:60px;padding-top:0">
  <div class="wrap"><div class="index"><span>04 — The fleet</span><span>Scroll →</span></div>
  <div class="sec-head"><h2 class="h2" data-split>Six cabins. <em>One</em> standard.</h2><p class="lead">Every vehicle comes with its own professional chauffeur. Prices shown are full-day private-driver rates — fixed and all-inclusive.</p></div></div>
  <div class="rail-pin"><div class="rail-wrap"><div class="rail">
    ${D.VEHICLES.map((v) => `<a class="car" href="/fleet/${v.slug}/" data-cursor="Explore"><div class="car-img"><img src="${IMG(v.img)}" alt="${v.name} with private driver Bangkok" loading="lazy" width="900" height="600">${v.badge ? `<span class="car-badge">${v.badge}</span>` : ""}</div>
      <div class="car-body"><p class="mono muted">${v.cls} · ${v.year}</p><h3 class="h3">${v.name}</h3><div class="car-spec"><span>${v.seats} seats</span><span>${v.luggage} bags</span><span>${v.year}</span></div>
      <div class="car-foot"><div><small>Full day · 10 hrs</small><b>${thb(v.price.bkk10)}</b></div><div><small>Half day · 5 hrs</small><b style="font-size:1.3rem">${thb(v.price.bkk5)}</b></div></div></div></a>`).join("")}
    <div class="rail-end"><p class="eyebrow">Full rate card</p><h3 class="h2">Compare <em>every</em> vehicle.</h3>${btn("/fleet/", "Explore the fleet", "btn-ghost")}</div>
  </div></div><div class="rail-progress"><i></i></div></div>
</section>

<section class="sec" style="padding-top:60px"><div class="wrap">
  <div class="index"><span>05 — How we look after you</span><span>04 chapters</span></div>
  <div class="stack-cards">
    ${[
      ["Private driver", "Your car. Your driver. <em>Your schedule.</em>", "Book a chauffeur for five or ten hours and use the car exactly as you would your own — boardroom to lunch to boutique to rooftop, with the door already open at every stop.", ["The chauffeur waits at every stop", "Unlimited stops within your hours", "Chilled water, chargers, quiet cabin", "Extend by the hour, any time"], "/private-driver/", null, "svc-chauffeur"],
      ["Protection", "Discreet by default. <em>Unmistakable</em> when it matters.", "Suited, English-speaking security professionals who manage the space around you — lobbies, crowds, events and late nights — while your chauffeur keeps the car one step ahead.", ["Transfer, 5-hour and 10-hour details", "Motorcycle escort for convoys", "Coordinated with your chauffeur", "Planned confidentially on WhatsApp"], "/bodyguards/", "guards", null],
      ["Long stay", "Your own driver, <em>every day.</em>", "Monthly packages for executives, families and residents: the same chauffeur, the same car, seven days a week, ten hours a day, unlimited kilometres.", ["Alphard 40 or Alphard 30", "7 days · 10 hours daily", "Unlimited kilometres", "A consistent, trusted chauffeur"], "/services/monthly-chauffeur/", null, "car-alphard40exec"],
      ["Arrival", "Off the plane, <em>into your car.</em>", "Your driver meets you at arrivals with a name sign. At Suvarnabhumi add Fast-Track and a private electric buggy from the aircraft door — and a bodyguard at the gate if you need one.", ["Flight monitored, delays absorbed", "Fast-Track &amp; VIP buggy at BKK", "Buggy seats 2 — allocated per flight", "Protection from the airbridge"], "/airports/", null, "hero-airport"],
    ].map(([n, t, p, li, href, vid, im], i) => `<article class="scard"><div class="scard-copy"><span class="n">0${i + 1} / ${n}</span><h3 class="h2">${t}</h3><p class="lead">${p}</p><ul>${li.map((x) => `<li>${x}</li>`).join("")}</ul><div>${btn(href, "Explore", "btn-ghost btn-sm")}</div></div>
      <div class="scard-media">${vid ? `<video data-autoplay muted loop playsinline preload="none" poster="/assets/video/${vid}-poster.jpg"><source src="/assets/video/${vid}-m.mp4" type="video/mp4"></video>` : `<img src="${IMG(im)}" alt="" loading="lazy">`}</div></article>`).join("")}
  </div>
</div></section>

<section class="sec light"><div class="wrap">
  <div class="index"><span>06 — Specialists</span><span>Hover to preview</span></div>
  <div class="sec-head"><h2 class="h2" data-split>Built around <em>how you travel.</em></h2><p class="lead">Private drivers and protection details shaped for business, families, evenings out and high-profile days.</p></div>
  <ul class="svc-list" data-follow>
    ${[...D.DRIVER_PAGES.slice(0, 4).map((s) => [s, "/private-driver/" + s + "/", (C.drivers.find((x) => x.slug === s) || {}).name || s, "Private driver", "svc-chauffeur"]),
       ...D.GUARD_PAGES.slice(0, 4).map((s) => [s, "/bodyguards/" + s + "/", (C.guards.find((x) => x.slug === s) || {}).name || s, "Bodyguards", "hero-bodyguards"])]
      .map(([s, href, t, d, im], i) => `<li><a href="${href}" data-img="${IMG(pick(s, i % 2 ? "sec-why" : im))}"><span class="n">0${i + 1}</span><span class="t">${esc(t)}</span><span class="d">${d}</span><span class="p">${d === "Bodyguards" ? "From " + thb(B.h5) : "From " + thb(minFor(s === "full-day-driver" ? "bkk10" : "bkk5"))}</span><span class="ar">${arrow}</span></a></li>`).join("")}
  </ul>
</div></section>

<section class="sec"><div class="wrap">
  <div class="index"><span>07 — How it works</span><span>Three steps</span></div>
  <div class="sec-head"><h2 class="h2" data-split>Booked in <em>a minute.</em> Handled all day.</h2><p class="lead">No accounts, no apps. A fixed price before you commit, and a real person who answers.</p></div>
  <div class="steps">
    <div class="step" data-reveal><span class="n">01</span><h3>Choose</h3><p>Pick your hours, vehicle and any bodyguards — the price updates instantly as you go.</p></div>
    <div class="step" data-reveal data-delay=".1"><span class="n">02</span><h3>Confirm</h3><p>Send it to our WhatsApp concierge. We confirm your chauffeur, detail and fixed price within minutes.</p></div>
    <div class="step" data-reveal data-delay=".2"><span class="n">03</span><h3>Enjoy the day</h3><p>Your driver is waiting, your detail is briefed. Change plans on the go with one message.</p></div>
  </div>
  <div class="hero-cta" style="margin-top:50px">${btn("/book/?service=hourly", "Hire a private driver", "btn-light", I.cal, 'data-cursor="Book"')}${btn("/book/?service=protection&guards=2", "Book bodyguards", "btn-ghost")}</div>
</div></section>

<section class="sec-sm light"><div class="wrap">
  <div class="sec-head"><h2 class="h2">Also <em>available</em></h2><p class="lead">Airport meet &amp; greet with Fast-Track, out-of-town day trips and transfers across Thailand.</p></div>
  ${linkGrid([["Airport transfers & Fast-Track", "/airports/", "BKK · DMK · UTP"], ["Bangkok → Pattaya", "/routes/pattaya/", "150 km"], ["Bangkok → Hua Hin", "/routes/hua-hin/", "200 km"], ["Bangkok → Khao Yai", "/routes/khao-yai/", "180 km"], ["Ayutthaya day trip", "/routes/ayutthaya/", "80 km"], ["All routes", "/routes/", D.ROUTES.length + " routes"], ["Personal assistant", "/services/personal-assistant/", "Travel companion"], ["Delegations & teams", "/services/delegation-transport/", "Invoicing"]])}
</div></section>

${C.journal.length ? `<section class="sec-sm"><div class="wrap">
  <div class="index"><span>08 — Journal</span><span>Field notes</span></div>
  <div class="sec-head"><h2 class="h2" data-split>Know before <em>you go.</em></h2><p class="lead">Practical guides from the people who drive and protect in Bangkok every day.</p></div>
  <div class="cards">${["hiring-a-bodyguard-in-bangkok", "monthly-private-driver-bangkok", "bangkok-traffic-best-times-to-travel"].map((s, i) => C.journal.find((a) => a.slug === s)).filter(Boolean).map((a, i) => imgCard({ href: `/journal/${a.slug}/`, img: ["hero-bodyguards", "car-alphard40exec", "sec-why"][i], mono: `${a.category} · ${a.readMins} min read`, title: a.h1, text: a.excerpt, foot: "Read" })).join("")}</div>
</div></section>` : ""}

${faqBlock(homeFaq)}
${ctaBand("Your driver is <em>one message</em> away.", "Tell us when you need a chauffeur — and whether you'd like protection — and we confirm car, driver, detail and fixed price on WhatsApp within minutes.")}`;
  emit("/", layout({
    url: "/", home: true, title: "SiamDrive — Private Driver & Bodyguards in Bangkok",
    desc: "Hire a private driver in Bangkok by the hour, day or month, with suited English-speaking bodyguards on request. Alphard to Porsche Cayenne. Fixed prices, 24/7.",
    body, ld: [faqLd(homeFaq)],
  }), 1.0);
}
