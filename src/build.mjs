// SiamDrive static site generator — `node src/build.mjs` → ./docs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as D from "./data.mjs";
import { buildHome } from "./home.mjs";
import { buildPillars } from "./pillars.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "docs");
const S = D.SITE;
const TODAY = new Date().toISOString().slice(0, 10);
const IMGS = new Set(fs.readdirSync(path.join(ROOT, "static/img")).map((f) => f.replace(/\.(webp|png|jpg)$/, "")));
const load = (n) => { const p = path.join(ROOT, "src/content", n + ".json"); return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : []; };
const C = {
  routes: load("routes"), airports: load("airports"), airportRoutes: load("airport-routes"), districts: load("districts"),
  experiences: load("experiences"), services: load("services"), vehicles: load("vehicles"), faq: load("faq"), journal: load("journal"),
  drivers: load("drivers"), guards: load("guards"),
};
const by = (arr, slug) => arr.find((x) => x.slug === slug) || {};
const esc = (s = "") => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const thb = D.thb;
const WA = (msg) => `https://wa.me/${S.whatsapp}?text=${encodeURIComponent(msg)}`;
const hash = (s) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
const POOL = ["hero-home", "sec-why", "banner-onecall", "sec-fleet", "hero-fleet", "hero-airport", "car-alphard40", "car-vellfire", "car-alphard40exec", "svc-chauffeur", "car-sclass", "rt-sriracha", "hero-bodyguards", "car-cayenne"];
const pick = (key, pref) => (pref && IMGS.has(pref) ? pref : POOL[hash(key) % POOL.length]);
const IMG = (n) => `/assets/img/${n}.webp`;
const pages = []; // {url, priority}

/* ------------------------------------------------------------------ icons */
const I = {
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 19L19 5M9 5h10v10"/></svg>',
  wa: '<svg viewBox="0 0 32 32" fill="currentColor"><path d="M16 5C9.9 5 5 9.9 5 16c0 1.9.5 3.8 1.5 5.5L5 27l5.7-1.4c1.6.9 3.4 1.3 5.3 1.3 6.1 0 11-4.9 11-11S22.1 5 16 5zm5 15.7c-.3.6-1.3 1.2-1.9 1.3-.5.1-1.1.1-1.7-.1-.4-.1-.9-.3-1.6-.6-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8s.7-2 1-2.3c.3-.3.6-.3.7-.3h.5c.2 0 .4 0 .6.5.2.6.8 2 .8 2.1.1.1.1.3 0 .5-.1.2-.1.3-.3.5l-.4.5c-.1.1-.3.3-.1.6.2.3.7 1.2 1.5 1.9 1 .9 1.9 1.2 2.2 1.4.3.1.4.1.6-.1.2-.2.7-.8.9-1.1.2-.3.4-.2.6-.1.3.1 1.6.8 1.9.9.3.1.5.2.5.3.1.2.1.7-.1 1.3z"/></svg>',
  cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
};
const btn = (href, label, cls = "btn-light", icon = I.arrow, extra = "") => `<a class="btn ${cls}" href="${href}" ${extra}><span class="ic">${icon}</span>${label}</a>`;
const waBtn = (msg, label = "Book on WhatsApp", cls = "btn-wa") => btn(WA(msg), label, cls, I.wa, 'target="_blank" rel="noopener"');
const bookBtn = (q = "", label = "Book &amp; get a price") => btn("/book/" + (q ? "?" + q : ""), label, "btn-light", I.cal, 'data-cursor="Book"');

/* ------------------------------------------------------------------ JSON-LD */
const ORG = {
  "@type": ["LocalBusiness", "TravelAgency"], "@id": S.domain + "/#business", name: S.name, alternateName: "SiamDrive.vip",
  url: S.domain + "/", logo: S.domain + "/assets/img/mark.png", image: S.domain + "/assets/img/og.jpg",
  telephone: "+" + S.whatsapp, priceRange: "฿฿฿",
  description: "Private chauffeur, VIP airport fast-track and personal bodyguard service in Bangkok, Thailand.",
  address: { "@type": "PostalAddress", addressLocality: "Bangkok", addressCountry: "TH" },
  areaServed: [{ "@type": "City", name: "Bangkok" }, { "@type": "Country", name: "Thailand" }],
  openingHoursSpecification: { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], opens: "00:00", closes: "23:59" },
  contactPoint: { "@type": "ContactPoint", telephone: "+" + S.whatsapp, contactType: "reservations", availableLanguage: ["English", "Thai"] },
};
const WEBSITE = { "@type": "WebSite", "@id": S.domain + "/#website", url: S.domain + "/", name: S.name, publisher: { "@id": S.domain + "/#business" } };
const crumbLd = (trail) => ({ "@type": "BreadcrumbList", itemListElement: trail.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t[0], item: S.domain + t[1] })) });
const faqLd = (faqs) => faqs && faqs.length ? { "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) } : null;
const serviceLd = (name, url, low, high, desc, type = "Service") => ({
  "@type": type, name, url: S.domain + url, description: desc, provider: { "@id": S.domain + "/#business" }, areaServed: { "@type": "Country", name: "Thailand" },
  ...(low ? { offers: { "@type": "AggregateOffer", priceCurrency: "THB", lowPrice: low, highPrice: high || low, offerCount: D.VEHICLES.length } } : {}),
});

/* ------------------------------------------------------------------ chrome */
const NAV = [["Private Driver", "/private-driver/"], ["Bodyguards", "/bodyguards/"], ["Fleet", "/fleet/"], ["Services", "/services/"], ["Rates", "/pricing/"]];
const MENU = [
  ["Private driver", "/private-driver/", "svc-chauffeur"], ["Bodyguards", "/bodyguards/", "hero-bodyguards"], ["Book now", "/book/", "hero-home"],
  ["Fleet", "/fleet/", "sec-fleet"], ["Monthly driver", "/services/monthly-chauffeur/", "car-alphard40exec"], ["All services", "/services/", "sec-why"],
  ["Airports & Fast-Track", "/airports/", "hero-airport"], ["Routes & day trips", "/routes/", "rt-sriracha"], ["Journal", "/journal/", "car-sclass"],
];
const header = (url) => `
<header class="hdr"><div class="wrap">
  <div class="pill">
    <a class="brand" href="/"><img src="/assets/img/mark-64.png" alt="" width="30" height="30"><b>SIAMDRIVE<i>.VIP</i></b></a>
    <nav class="nav-links" aria-label="Primary">${NAV.map(([t, h]) => `<a href="${h}"${url.startsWith(h) ? ' aria-current="page"' : ""}>${t}</a>`).join("")}</nav>
    <button class="menu-btn" aria-label="Open menu" aria-expanded="false" aria-controls="menu"><span></span></button>
  </div>
  <div class="hdr-right">
    <div class="status"><i class="dot"></i>Bangkok <span data-bkk-clock>--:--:--</span> · Concierge online</div>
    ${btn("/book/?service=hourly", "Book a driver", "btn-light btn-sm", I.cal, 'data-cursor="Book"')}
  </div>
</div></header>
<div class="menu" id="menu" aria-label="Site menu">
  <ul class="menu-list">${MENU.map(([t, h, im], i) => `<li><a href="${h}" data-img="${IMG(IMGS.has(im) ? im : "hero-home")}"><small>0${i + 1}</small>${t}</a></li>`).join("")}</ul>
  <div class="menu-side">
    <div class="menu-media"><img src="${IMG("hero-home")}" alt="" loading="lazy"></div>
    <div class="menu-meta">
      <div><p class="eyebrow">Reservations</p><a href="${WA("Hello SiamDrive")}" target="_blank" rel="noopener">WhatsApp ${S.phoneDisplay}</a><a href="/book/">Online booking</a><a href="/pricing/">Rates</a></div>
      <div><p class="eyebrow">Company</p><a href="/about/">About</a><a href="/faq/">FAQ</a><a href="/contact/">Contact</a></div>
    </div>
  </div>
</div>`;
const footer = () => `
<footer class="ftr"><div class="wrap">
  <div class="ftr-top">
    <div>
      <a class="brand" href="/"><img src="/assets/img/mark-64.png" alt="" width="30" height="30"><b>SIAMDRIVE<i>.VIP</i></b></a>
      <p class="muted" style="margin:18px 0 24px;max-width:34ch">Private drivers by the hour, day or month — and suited, English-speaking bodyguards — across Bangkok. One concierge line, 24 hours a day.</p>
      ${waBtn("Hello SiamDrive, I would like to make a booking", "WhatsApp " + S.phoneDisplay, "btn-wa btn-sm")}
    </div>
    <div><p class="fh">Private driver</p><ul>${[["Private driver in Bangkok", "/private-driver/"], ...D.DRIVER_PAGES.map((s) => [by(C.drivers, s).name || s.replace(/-/g, " "), `/private-driver/${s}/`]), ["Monthly private driver", "/services/monthly-chauffeur/"], ["Corporate chauffeur", "/services/corporate-chauffeur/"]].map(([t, h]) => `<li><a href="${h}">${t}</a></li>`).join("")}</ul></div>
    <div><p class="fh">Protection</p><ul>${[["Bodyguards in Bangkok", "/bodyguards/"], ...D.GUARD_PAGES.map((s) => [by(C.guards, s).name || s.replace(/-/g, " "), `/bodyguards/${s}/`]), ["Motorcycle escort", "/services/motorcycle-escort/"], ["Personal assistant", "/services/personal-assistant/"]].map(([t, h]) => `<li><a href="${h}">${t}</a></li>`).join("")}</ul></div>
    <div><p class="fh">Company</p><ul>${[["Book online", "/book/"], ["Rates", "/pricing/"], ["Fleet", "/fleet/"], ["All services", "/services/"], ["Airports & Fast-Track", "/airports/"], ["Routes & day trips", "/routes/"], ["Bangkok areas", "/bangkok/"], ["Experiences", "/experiences/"], ["Journal", "/journal/"], ["FAQ", "/faq/"], ["About", "/about/"], ["Contact", "/contact/"]].map(([t, h]) => `<li><a href="${h}">${t}</a></li>`).join("")}</ul></div>
  </div>
  <div class="ftr-word" aria-hidden="true">SiamDrive</div>
  <div class="ftr-bottom"><span>© ${new Date().getFullYear()} SiamDrive · Bangkok, Thailand</span><span><a href="/terms/">Terms</a> · <a href="/privacy/">Privacy</a> · <a href="/cancellation-policy/">Cancellation</a> · <a href="/sitemap/">Sitemap</a></span><span>Bangkok <span data-bkk-clock>--:--:--</span></span></div>
</div></footer>
<nav class="mbar" aria-label="Quick booking"><a class="b1" href="/book/?service=hourly">${I.cal}Book a driver</a><a class="b2" href="${WA("Hello SiamDrive, I would like to make a booking")}" target="_blank" rel="noopener">${I.wa}WhatsApp</a></nav>`;

const SD_JSON = JSON.stringify({
  whatsapp: S.whatsapp, vehicles: D.VEHICLES.map(({ slug, name, seats, luggage, cls, img, price }) => ({ slug, name, seats, luggage, cls, img, price })),
  routes: D.ROUTES.map(({ slug, name, tier }) => ({ slug, name, tier })), tiers: D.TIERS, airports: D.AIRPORTS.map(({ slug, code, name, short }) => ({ slug, code, name, short })),
  bodyguard: D.BODYGUARD, fasttrack: D.FASTTRACK, pa: D.PA, overnight: D.OVERNIGHT, monthly: D.MONTHLY,
});

function layout({ url, title, desc, body, ld = [], image = "og.jpg", preload = "", home = false, book = false, noindex = false }) {
  const full = title.includes("SiamDrive") || title.length > 52 ? title : `${title} | SiamDrive`;
  const graph = { "@context": "https://schema.org", "@graph": [ORG, WEBSITE, ...ld.filter(Boolean)] };
  const ogImg = `${S.domain}/assets/img/og.jpg`;
  return `<!doctype html>
<html lang="en" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(full)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${S.domain}${url}">
<meta name="robots" content="${noindex ? "noindex,follow" : "index,follow,max-image-preview:large"}">
<meta name="theme-color" content="#0a0a0b">
<meta property="og:type" content="${url.startsWith("/journal/") && url !== "/journal/" ? "article" : "website"}">
<meta property="og:site_name" content="SiamDrive">
<meta property="og:title" content="${esc(full)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${S.domain}${url}">
<meta property="og:image" content="${ogImg}">
<meta property="og:locale" content="en_US">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(full)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${ogImg}">
<link rel="icon" href="/assets/img/favicon.png" type="image/png">
<link rel="apple-touch-icon" href="/assets/img/mark.png">
<link rel="preload" href="/assets/fonts/InstrumentSerif-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/InterTight-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/site.css?v=${BUILD}">
${preload}
<script type="application/ld+json">${JSON.stringify(graph)}</script>
</head>
<body>
${home ? `<div class="preloader" aria-hidden="true"><div class="pl-inner"><span class="pl-word">SiamDrive.vip</span><i class="pl-ring"></i><i class="pl-ring r2"></i><img src="/assets/img/mark-white.png" alt="" width="120" height="120"><span class="pl-count">000 %</span></div></div>` : ""}
<div class="grain" aria-hidden="true"></div>
<div class="gridlines" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
${header(url)}
<main id="main">
${body}
</main>
${footer()}
<script>window.SD=${SD_JSON}</script>
<script src="/assets/vendor/gsap.min.js" defer></script>
<script src="/assets/vendor/ScrollTrigger.min.js" defer></script>
<script src="/assets/vendor/lenis.min.js" defer></script>
<script src="/assets/js/site.js?v=${BUILD}" defer></script>
${book ? `<script src="/assets/js/book.js?v=${BUILD}" defer></script>` : ""}
</body>
</html>`;
}
const BUILD = Date.now().toString(36);

/* ------------------------------------------------------------------ partials */
const crumbs = (trail) => `<nav class="crumbs" aria-label="Breadcrumb">${trail.map(([t, h], i) => i === trail.length - 1 ? `<span aria-current="page" style="opacity:1">${esc(t)}</span>` : `<a href="${h}">${esc(t)}</a><span>/</span>`).join("")}</nav>`;
const phero = ({ trail, kicker, h1, lead, img, video, meta = [], cta = "" }) => `
<section class="phero${img || video ? " media" : ""}">
  ${video ? `<div class="bg"><video data-autoplay muted loop playsinline preload="metadata" poster="/assets/video/${video}-poster.jpg"><source src="/assets/video/${video}-m.mp4" media="(max-width:720px)" type="video/mp4"><source src="/assets/video/${video}.mp4" type="video/mp4"></video></div>` : img ? `<div class="bg"><img src="${IMG(img)}" alt="" fetchpriority="high" data-parallax></div>` : ""}
  <div class="wrap">
    ${crumbs(trail)}
    <p class="eyebrow">${esc(kicker || "")}</p>
    <h1 class="h1" data-split>${h1}</h1>
    ${lead ? `<p class="lead">${esc(lead)}</p>` : ""}
    ${meta.length ? `<div class="phero-meta">${meta.map((m) => `<span class="chip">${m}</span>`).join("")}</div>` : ""}
    ${cta ? `<div class="hero-cta">${cta}</div>` : ""}
  </div>
</section>`;
const sections = (secs = []) => secs.map((s) => `<h2>${esc(s.h2)}</h2>${(s.paragraphs || []).map((p) => `<p>${esc(p)}</p>`).join("")}${s.bullets ? `<ul>${s.bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>` : ""}`).join("");
const listBox = (title, items = []) => items.length ? `<div class="list-box"><h3>${title}</h3><ul>${items.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>` : "";
const faqBlock = (faqs = [], title = "Questions, answered") => faqs.length ? `
<section class="sec-sm"><div class="wrap">
  <div class="sec-head"><div><p class="eyebrow">FAQ</p><h2 class="h2" data-split>${title}</h2></div><p class="lead">Anything else? Our concierge replies on WhatsApp, day or night.</p></div>
  <div class="faq">${faqs.map((f, i) => `<details${i === 0 ? " open" : ""}><summary>${esc(f.q)}<i></i></summary><p class="a">${esc(f.a)}</p></details>`).join("")}</div>
</div></section>` : "";
const ctaBand = (title = "Your car is <em>one message</em> away.", sub = "Tell us when and where — we confirm your chauffeur, vehicle and fixed price on WhatsApp within minutes.", video = "home") => `
<section class="sec-sm"><div class="wrap">
  <div class="cta-band">
    <div class="bg"><video data-autoplay muted loop playsinline preload="none" poster="/assets/video/${video}-poster.jpg"><source src="/assets/video/${video}-m.mp4" type="video/mp4"></video></div>
    <p class="eyebrow">Reservations · 24/7</p>
    <h2 class="h1" data-split style="margin:20px 0 22px">${title}</h2>
    <p class="lead">${sub}</p>
    <div class="hero-cta">${bookBtn()}${waBtn("Hello SiamDrive, I would like to make a booking")}</div>
  </div>
</div></section>`;
const aside = ({ title, price, priceLabel = "From", items = [], q = "", msg }) => `
<aside class="aside">
  <div class="aside-card">
    <p class="eyebrow">Instant booking</p>
    <h3>${title}</h3>
    ${price ? `<p class="mono muted">${priceLabel}</p><p class="price">${thb(price)}</p>` : `<p class="price" style="font-size:1.9rem">Quote on request</p>`}
    <ul>${["Driver, fuel &amp; tolls included", "Fixed price — no meter, no surprises", "English-speaking concierge 24/7", ...items].map((x) => `<li>${x}</li>`).join("")}</ul>
    <div style="display:grid;gap:8px">${bookBtn(q, "Book online")}${waBtn(msg || `Hello SiamDrive, I'm interested in: ${title}`, "Ask on WhatsApp", "btn-ghost")}</div>
  </div>
  <div class="aside-card"><p class="eyebrow"><span data-bkk-clock>--:--</span> in Bangkok</p><p class="muted" style="margin-top:10px;font-size:14px">Our concierge is online now. Typical WhatsApp replies arrive in minutes.</p></div>
</aside>`;

/* rate tables */
const COLS = {
  airport: ["Airport transfer", "airport"], bkk5: ["Bangkok · 5 hrs", "bkk5"], bkk10: ["Bangkok · 10 hrs", "bkk10"], outskirt: ["Outskirt · 10 hrs", "outskirt"],
  pattaya: ["Pattaya · 10 hrs", "pattaya"], longTransfer: ["Long transfer", "longTransfer"], longDay: ["Long day trip", "longDay"], overtime: ["Overtime / hr", "overtime"],
};
const rateTable = (cols, opts = {}) => `<div class="table-scroll"><table class="rates"><thead><tr><th>Vehicle</th><th>Seats</th>${cols.map((c) => `<th class="r">${COLS[c] ? COLS[c][0] : c}</th>`).join("")}<th class="r"><span class="sr">Book</span></th></tr></thead><tbody>
${D.VEHICLES.map((v) => `<tr><td><a href="/fleet/${v.slug}/">${v.name}</a></td><td>${v.seats}</td>${cols.map((c) => `<td class="r">${thb(v.price[COLS[c] ? COLS[c][1] : c])}</td>`).join("")}<td class="r"><a class="btn btn-ghost btn-sm" href="/book/?vehicle=${v.slug}${opts.q ? "&" + opts.q : ""}">Book</a></td></tr>`).join("")}
</tbody></table></div>`;
const routeTable = (r) => {
  const t = D.TIERS[r.tier];
  if (!t.transfer) return `<div class="aside-card"><p class="lead" style="max-width:none">${esc(r.name)} is priced per journey — distance, ferry timing and overnight stays vary. Send your dates on WhatsApp for a fixed quote, usually within minutes.</p><div class="hero-cta">${waBtn(`Hello SiamDrive, please quote Bangkok to ${r.name}`, "Get a fixed quote")}</div></div>`;
  const same = t.transfer === t.day;
  return `<div class="table-scroll"><table class="rates"><thead><tr><th>Vehicle</th><th>Seats</th><th class="r">${same ? "Transfer or day trip · 10 hrs" : "One-way transfer"}</th>${same ? "" : '<th class="r">Day trip · 10 hrs</th>'}<th class="r">Overtime / hr</th><th class="r"><span class="sr">Book</span></th></tr></thead><tbody>
${D.VEHICLES.map((v) => `<tr><td><a href="/fleet/${v.slug}/">${v.name}</a></td><td>${v.seats}</td><td class="r">${thb(v.price[t.transfer])}</td>${same ? "" : `<td class="r">${thb(v.price[t.day])}</td>`}<td class="r">${thb(v.price.overtime)}</td><td class="r"><a class="btn btn-ghost btn-sm" href="/book/?service=intercity&dest=${r.slug}&vehicle=${v.slug}">Book</a></td></tr>`).join("")}
</tbody></table></div><p class="muted" style="font-size:14px;margin-top:12px">${esc(t.label)} pricing. Driver, fuel and tolls included. Overnight outside Bangkok +${thb(D.OVERNIGHT)} per night.</p>`;
};
const fastTrackTable = () => `<div class="table-scroll"><table class="rates"><thead><tr><th>Suvarnabhumi VIP service</th><th>Unit</th><th class="r">Price</th></tr></thead><tbody>
<tr><td>Fast-Track arrival (priority immigration)</td><td>per guest</td><td class="r">${thb(D.FASTTRACK.arrival)}</td></tr>
<tr><td>Private electric buggy from the aircraft door</td><td>per buggy · max 2 guests</td><td class="r">${thb(D.FASTTRACK.buggy)}</td></tr>
<tr><td>Fast-Track departure with butler escort</td><td>per guest</td><td class="r">${thb(D.FASTTRACK.departure)}</td></tr>
</tbody></table></div><p class="muted" style="font-size:14px;margin-top:12px">Available together with a SiamDrive car booking. Children under 3 free. Buggies are allocated per arrival flight — 4 guests on one flight = 2 buggies.</p>`;
const guardTable = () => `<div class="table-scroll"><table class="rates"><thead><tr><th>Protection</th><th>Unit</th><th class="r">Price</th></tr></thead><tbody>
<tr><td>Bodyguard — transfer</td><td>per guard</td><td class="r">${thb(D.BODYGUARD.transfer)}</td></tr>
<tr><td>Bodyguard — 5 hours</td><td>per guard</td><td class="r">${thb(D.BODYGUARD.h5)}</td></tr>
<tr><td>Bodyguard — 10 hours</td><td>per guard</td><td class="r">${thb(D.BODYGUARD.h10)}</td></tr>
<tr><td>Outside Bangkok supplement</td><td>per guard</td><td class="r">${thb(D.BODYGUARD.outside)}</td></tr>
<tr><td>Bodyguard overtime</td><td>per guard / hour</td><td class="r">${thb(D.BODYGUARD.overtime)}</td></tr>
<tr><td>Motorcycle escort — transfer / 5 hours</td><td>per escort</td><td class="r">${thb(D.BODYGUARD.escort5)}</td></tr>
<tr><td>Motorcycle escort — 10 hours</td><td>per escort</td><td class="r">${thb(D.BODYGUARD.escort10)}</td></tr>
<tr><td>Motorcycle escort overtime</td><td>per hour</td><td class="r">${thb(D.BODYGUARD.escortOvertime)}</td></tr>
</tbody></table></div><p class="muted" style="font-size:14px;margin-top:12px">Protection is booked together with a SiamDrive vehicle.</p>`;
const paTable = () => `<div class="table-scroll"><table class="rates"><thead><tr><th>Personal assistant</th><th>Unit</th><th class="r">Price</th></tr></thead><tbody>
<tr><td>Personal assistant / travel companion / nanny — Bangkok</td><td>10 hours</td><td class="r">${thb(D.PA.h10)}</td></tr>
<tr><td>Overtime</td><td>per hour</td><td class="r">${thb(D.PA.overtime)}</td></tr></tbody></table></div>`;
const monthlyTable = () => `<div class="table-scroll"><table class="rates"><thead><tr><th>Monthly private driver</th><th>Includes</th><th class="r">Per month</th></tr></thead><tbody>
${D.MONTHLY.map((m) => `<tr><td>${m.vehicle}</td><td>7 days · 10 hrs daily · unlimited km · driver</td><td class="r">${thb(m.price)}</td></tr>`).join("")}
<tr><td>Any other vehicle / duration</td><td>Tailored</td><td class="r">On request</td></tr></tbody></table></div><p class="muted" style="font-size:14px;margin-top:12px">Monthly packages exclude fuel and tolls.</p>`;

/* route map (SVG) */
const GEO = {
  bangkok: [13.75, 100.5], pattaya: [12.93, 100.88], "hua-hin": [12.57, 99.96], "cha-am": [12.8, 99.97], pranburi: [12.39, 99.92], rayong: [12.68, 101.28],
  "koh-samet": [12.57, 101.45], "koh-chang": [12.05, 102.33], chanthaburi: [12.61, 102.1], sriracha: [13.17, 100.93], "bang-saen": [13.28, 100.92],
  sattahip: [12.66, 100.9], "khao-yai": [14.44, 101.37], "nakhon-nayok": [14.2, 101.21], ayutthaya: [14.35, 100.57], lopburi: [14.8, 100.62],
  kanchanaburi: [14.02, 99.53], ratchaburi: [13.54, 99.82], "damnoen-saduak": [13.52, 99.96], amphawa: [13.42, 99.95], chachoengsao: [13.69, 101.07],
  "nakhon-pathom": [13.82, 100.06], "samut-prakan": [13.6, 100.6], "suvarnabhumi-bkk": [13.69, 100.75], "don-mueang-dmk": [13.91, 100.6], "u-tapao-utp": [12.68, 101.0],
};
const COAST = [[12.0, 99.9], [12.4, 99.97], [12.6, 99.96], [12.85, 100.0], [13.1, 100.02], [13.3, 100.0], [13.42, 100.05], [13.5, 100.3], [13.52, 100.55], [13.5, 100.75], [13.4, 100.95], [13.2, 100.92], [12.95, 100.88], [12.75, 100.86], [12.65, 100.92], [12.65, 101.1], [12.66, 101.3], [12.62, 101.5], [12.55, 101.8], [12.45, 102.05], [12.2, 102.3], [12.0, 102.45]];
const routeMap = (fromKey, toKey, fromLabel, toLabel, km) => {
  const W = 600, H = 375, lat0 = 15.1, lat1 = 11.8, lon0 = 99.2, lon1 = 102.7;
  const P = ([la, lo]) => [((lo - lon0) / (lon1 - lon0)) * W, ((lat0 - la) / (lat0 - lat1)) * H];
  const a = P(GEO[fromKey] || GEO.bangkok), b = P(GEO[toKey] || GEO.bangkok);
  const mx = (a[0] + b[0]) / 2 + (b[1] - a[1]) * 0.18, my = (a[1] + b[1]) / 2 - (b[0] - a[0]) * 0.18;
  const coast = COAST.map(P).map((p) => p.map((n) => n.toFixed(1)).join(",")).join(" ");
  const grid = [...Array(9)].map((_, i) => `<line class="grid" x1="${i * 75}" y1="0" x2="${i * 75}" y2="${H}"/>`).join("") + [...Array(6)].map((_, i) => `<line class="grid" x1="0" y1="${i * 75}" x2="${W}" y2="${i * 75}"/>`).join("");
  const lab = (p, t, right) => { if (right && p[0] > W - 150) right = false; if (!right && p[0] < 150) right = true; return `<text x="${(p[0] + (right ? 12 : -12)).toFixed(1)}" y="${(p[1] + 4).toFixed(1)}" text-anchor="${right ? "start" : "end"}">${esc(t)}</text>`; };
  return `<svg class="rmap" viewBox="0 0 ${W} ${H}" role="img" aria-label="Route map from ${esc(fromLabel)} to ${esc(toLabel)}">${grid}<polyline class="coast" points="${coast}"/>
<path class="path" d="M${a[0].toFixed(1)},${a[1].toFixed(1)} Q${mx.toFixed(1)},${my.toFixed(1)} ${b[0].toFixed(1)},${b[1].toFixed(1)}"/>
<circle class="node-o" cx="${a[0].toFixed(1)}" cy="${a[1].toFixed(1)}" r="9"/><circle class="node" cx="${a[0].toFixed(1)}" cy="${a[1].toFixed(1)}" r="3.5"/>
<circle class="node-o" cx="${b[0].toFixed(1)}" cy="${b[1].toFixed(1)}" r="9"/><circle class="node" cx="${b[0].toFixed(1)}" cy="${b[1].toFixed(1)}" r="3.5"/>
${lab(a, fromLabel, a[0] < b[0] ? false : true)}${lab(b, toLabel, b[0] >= a[0])}
${km ? `<text x="18" y="${H - 18}">≈ ${km} KM · GULF OF THAILAND</text>` : ""}</svg>`;
};
const minFor = (col) => Math.min(...D.VEHICLES.map((v) => v.price[col]));
const routeFrom = (r) => { const t = D.TIERS[r.tier]; return t.transfer ? minFor(t.transfer) : null; };

/* cards */
const routeCard = (r, href, light = false) => `<a class="card" href="${href}" data-cursor="View">
  <div class="card-map">${routeMap("bangkok", r.slug, "Bangkok", r.name.replace(/ \(.*\)/, ""), r.km)}</div>
  <div class="card-body"><p class="mono">${r.km} km · ${r.hrs} hrs · ${esc(r.region)}</p><h3>Bangkok → ${esc(r.name)}</h3>
  <div class="more"><span>${routeFrom(r) ? "From " + thb(routeFrom(r)) : "Quote on request"}</span><span>${I.arrow.replace("<svg", '<svg width="16" height="16"')}</span></div></div></a>`;
const imgCard = ({ href, img, mono, title, text, foot = "Discover" }) => `<a class="card" href="${href}" data-cursor="View">
  <div class="card-img"><img src="${IMG(img)}" alt="${esc(title)}" loading="lazy" width="900" height="600"></div>
  <div class="card-body"><p class="mono">${esc(mono || "")}</p><h3>${esc(title)}</h3>${text ? `<p>${esc(text)}</p>` : ""}
  <div class="more"><span>${foot}</span><span>${I.arrow.replace("<svg", '<svg width="16" height="16"')}</span></div></div></a>`;
const linkGrid = (items) => `<div class="linkgrid">${items.map(([t, h, s]) => `<a href="${h}">${esc(t)}${s ? `<small>${esc(s)}</small>` : ""}</a>`).join("")}</div>`;

/* ------------------------------------------------------------------ writer */
const svcUrl = (slug) => D.PILLARS[slug] || `/services/${slug}/`;
function emit(url, html, priority = 0.6) {
  for (const [slug, to] of Object.entries(D.PILLARS)) html = html.split(`/services/${slug}/`).join(to);
  html = html.replace(/-poster\.jpg"/g, '-poster.webp"');
  html = html.replace(/<img src="\/assets\/img\/([\w-]+)\.webp"([^>]*)>/g, (m, n, rest) => {
    if (!IMGS.has(n + "-800") || /srcset=/.test(rest)) return m;
    const hero = /data-parallax|fetchpriority/.test(rest);
    return `<img src="/assets/img/${n}.webp" srcset="/assets/img/${n}-800.webp 800w, /assets/img/${n}.webp 1600w" sizes="${hero ? "100vw" : "(max-width:720px) 92vw, (max-width:1100px) 46vw, 34vw"}"${rest}>`;
  });
  html = html.replace(/data-img="\/assets\/img\/([\w-]+)\.webp"/g, (m, n) => IMGS.has(n + "-800") ? `data-img="/assets/img/${n}-800.webp"` : m);
  html = html.replace(/loading="lazy"(?! decoding)/g, 'loading="lazy" decoding="async"');
  const dir = path.join(OUT, url);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), html);
  pages.push({ url, priority });
}
const fallback = (name, kind) => ({
  title: `${name}`, metaDescription: `${name} with SiamDrive — private chauffeur service in Bangkok and across Thailand. Fixed prices, driver, fuel and tolls included. Book 24/7 on WhatsApp.`,
  h1: name, kicker: kind, intro: `${name} by private chauffeur — fixed prices, discreet English-speaking team and 24/7 WhatsApp concierge.`, sections: [], faqs: [],
});

/* ================================================================== PAGES */
// ---------- HOME + CORE PILLARS
const ctx = { D, C, S, I, IMG, thb, minFor, btn, bookBtn, waBtn, pick, by, esc, phero, sections, listBox, faqBlock, ctaBand, aside, rateTable, guardTable, monthlyTable, imgCard, linkGrid, layout, emit, crumbLd, faqLd, serviceLd };
buildHome(ctx);

// ---------- BOOK
(() => {
  const opt = (g, v, b, s, extra = "") => `<button type="button" class="opt" data-group="${g}" data-value="${v}" aria-pressed="false" ${extra}><b>${b}</b><small>${s}</small></button>`;
  const counter = (key, label, min, max) => `<div class="field"><label>${label}</label><div class="counter" data-key="${key}" data-min="${min}" data-max="${max}"><button type="button" data-d="-1" aria-label="Less">−</button><output>0</output><button type="button" data-d="1" aria-label="More">+</button></div></div>`;
  const body = `
${phero({ trail: [["Home", "/"], ["Book", "/book/"]], kicker: "Private driver · Bodyguards · Instant estimate", h1: "Book your <em>private driver.</em>", lead: "Five quick steps — add bodyguards if you need them. Your price updates live, and a real person confirms on WhatsApp, usually within minutes." })}
<section class="sec-sm" style="padding-top:20px"><div class="wrap">
<div class="wiz">
  <div>
    <div class="wiz-steps">${["Service", "Trip", "Vehicle", "Extras", "Details"].map((t, i) => `<button type="button" data-go="${i + 1}"><b>${i + 1}</b>${t}</button>`).join("")}</div>
    <div class="wiz-panel" data-step="1"><h2>What do you need?</h2><p>Start with your driver — bodyguards, Fast-Track and assistants can be added in step 4.</p>
      <div class="opts c2">${opt("service", "hourly", "Private driver", "Chauffeur &amp; car for 5 or 10 hours — the driver stays with you")}${opt("service", "protection", "Driver + bodyguards", "Private driver with a suited, English-speaking protection detail")}${opt("service", "monthly", "Monthly private driver", "Same chauffeur, 7 days a week · 10 hrs daily")}${opt("service", "airport", "Airport transfer", "BKK, DMK or U-Tapao — meet &amp; greet, Fast-Track")}${opt("service", "intercity", "Out of town", "Transfers and day trips to " + D.ROUTES.length + " destinations")}</div></div>
    <div class="wiz-panel" data-step="2"><h2>Your trip</h2><p>Where and when. Exact addresses can be confirmed later on WhatsApp.</p>
      <div data-for="airport" style="margin-bottom:12px"><div class="opts">${D.AIRPORTS.map((a) => opt("airport", a.slug, a.code + " · " + a.short, a.code === "UTP" ? "Pattaya / Rayong region" : "Bangkok")).join("")}</div>
        <div class="opts c2" style="margin-top:10px">${opt("direction", "arrival", "Arrival", "Pick-up from the airport")}${opt("direction", "departure", "Departure", "Drop-off at the airport")}</div></div>
      <div data-for="hourly protection" style="margin-bottom:12px"><div class="opts c2">${opt("hours", "5", "Half day · 5 hours", "Meetings, shopping, dinner")}${opt("hours", "10", "Full day · 10 hours", "A full day at your disposal")}</div></div>
      <div data-for="intercity" style="margin-bottom:12px"><div class="field" style="margin-bottom:10px"><label>Destination</label><select data-bind="dest">${D.ROUTES.map((r) => `<option value="${r.slug}">${esc(r.name)} · ${r.km} km</option>`).join("")}</select></div>
        <div class="opts c2">${opt("trip", "transfer", "One-way transfer", "Drop-off at your destination")}${opt("trip", "day", "Day trip · 10 hrs", "Car and chauffeur on standby, return to Bangkok")}</div></div>
      <div class="wiz-form">
        <div class="field"><label>Date</label><input type="date" data-bind="date" required></div>
        <div class="field"><label>Time</label><input type="time" data-bind="time"></div>
        <div class="field" data-for="airport"><label>Flight number</label><input type="text" data-bind="flight" placeholder="e.g. TG 917"></div>
        <div class="field"><label>Pick-up</label><input type="text" data-bind="pickup" placeholder="Hotel, address or terminal"></div>
        <div class="field"><label>Drop-off</label><input type="text" data-bind="dropoff" placeholder="Hotel, address or terminal"></div>
        ${counter("pax", "Guests", 1, 12)}${counter("bags", "Large bags", 0, 12)}
      </div></div>
    <div class="wiz-panel" data-step="3"><h2>Choose your vehicle</h2><p>Prices reflect your trip. Vehicles too small for your party are greyed out.</p><div class="opts c2 veh-opts"></div></div>
    <div class="wiz-panel" data-step="4"><h2>Extras</h2><p>Everything is coordinated with your chauffeur. Skip anything you don't need.</p>
      <div class="addon"><div><b>Bodyguards</b><small>${thb(D.BODYGUARD.h5)} per guard (transfer / 5 hrs) · ${thb(D.BODYGUARD.h10)} (10 hrs)</small></div><div class="counter" data-key="guards" data-min="0" data-max="8"><button type="button" data-d="-1">−</button><output>0</output><button type="button" data-d="1">+</button></div></div>
      <div class="opts" style="margin-bottom:10px">${opt("guardPlan", "transfer", "Guards: transfer", "Point to point")}${opt("guardPlan", "h5", "Guards: 5 hours", "Half day")}${opt("guardPlan", "h10", "Guards: 10 hours", "Full day")}</div>
      <div class="opts" style="margin-bottom:10px">${opt("escort", "none", "No escort", "—")}${opt("escort", "e5", "Motorcycle escort", "Transfer / 5 hours")}${opt("escort", "e10", "Motorcycle escort", "10 hours")}</div>
      <div data-ft><div class="addon"><div><b>Suvarnabhumi Fast-Track</b><small data-dir="arrival">Priority immigration ${thb(D.FASTTRACK.arrival)} / guest · private buggy ${thb(D.FASTTRACK.buggy)} (max 2 guests each)</small><small data-dir="departure">Priority departure with butler escort ${thb(D.FASTTRACK.departure)} / guest</small></div><input type="checkbox" data-bind="ft" aria-label="Add Fast-Track" style="width:22px;height:22px;accent-color:#eeeae3"></div>
        <div class="addon" data-dir="arrival"><div><b>Include electric buggy</b><small>From the aircraft door · buggies allocated automatically</small></div><input type="checkbox" data-bind="buggy" aria-label="Include buggy" style="width:22px;height:22px;accent-color:#eeeae3"></div>
        <div class="addon"><div><b>Fast-Track guests</b><small>Usually everyone in your party</small></div><div class="counter" data-key="ftPax" data-min="1" data-max="12"><button type="button" data-d="-1">−</button><output>0</output><button type="button" data-d="1">+</button></div></div></div>
      <div class="addon"><div><b>Personal assistant</b><small>Travel companion or nanny · ${thb(D.PA.h10)} per 10-hour day</small></div><div class="counter" data-key="pa" data-min="0" data-max="4"><button type="button" data-d="-1">−</button><output>0</output><button type="button" data-d="1">+</button></div></div>
      <div class="addon"><div><b>Extra hours</b><small>Billed at the vehicle's overtime rate</small></div><div class="counter" data-key="extraHours" data-min="0" data-max="12"><button type="button" data-d="-1">−</button><output>0</output><button type="button" data-d="1">+</button></div></div>
      <div class="addon" data-for="intercity"><div><b>Overnight stays</b><small>Chauffeur &amp; car stay with you · ${thb(D.OVERNIGHT)} per night</small></div><div class="counter" data-key="nights" data-min="0" data-max="14"><button type="button" data-d="-1">−</button><output>0</output><button type="button" data-d="1">+</button></div></div>
    </div>
    <div class="wiz-panel" data-step="5"><h2>Almost there</h2><p>Who should our concierge confirm with? Then send your booking on WhatsApp.</p>
      <div class="wiz-form"><div class="field"><label>Full name</label><input type="text" data-bind="name" autocomplete="name"></div><div class="field"><label>Phone / WhatsApp</label><input type="tel" data-bind="phone" autocomplete="tel"></div>
      <div class="field full"><label>Email (optional)</label><input type="email" data-bind="email" autocomplete="email"></div><div class="field full"><label>Notes</label><textarea data-bind="notes" rows="3" placeholder="Child seats, names on sign, special requests…"></textarea></div></div></div>
    <div class="wiz-nav"><button type="button" class="btn btn-ghost btn-sm wiz-back"><span class="ic" style="transform:rotate(180deg)">${I.arrow}</span>Back</button><button type="button" class="btn btn-light btn-sm wiz-next"><span class="ic">${I.arrow}</span>Continue</button></div>
  </div>
  <aside class="summary" aria-live="polite">
    <div class="summary-head"><span class="eyebrow">Your booking</span><span class="mono muted"><i class="dot" style="display:inline-block;margin-right:6px"></i>Live</span></div>
    <dl></dl><div class="summary-lines"></div>
    <div class="summary-total"><span class="mono muted">Estimated total</span><b>—</b></div>
    <div class="summary-cta"><a class="btn btn-wa wa-send" href="#" target="_blank" rel="noopener" data-cursor="Send"><span class="ic">${I.wa}</span>Confirm on WhatsApp</a><button type="button" class="btn btn-ghost btn-sm wa-copy"><span class="ic">${I.arrow}</span><span class="lbl">Copy booking details</span></button></div>
    <p class="note">Estimate based on our published rates. Your fixed price is confirmed by the concierge before anything is charged.</p>
  </aside>
</div></div></section>`;
  emit("/book/", layout({ url: "/book/", book: true, title: "Book a Private Driver or Bodyguards in Bangkok", desc: "Book a private driver in Bangkok by the hour, day or month and add suited bodyguards. Live price estimate, confirmed by our 24/7 WhatsApp concierge in minutes.", body, ld: [crumbLd([["Home", "/"], ["Book", "/book/"]])] }), 0.95);
})();

// ---------- FLEET
(() => {
  const body = `
${phero({ trail: [["Home", "/"], ["Fleet", "/fleet/"]], kicker: "The fleet · 6 vehicle classes", h1: "Six cabins. <em>One standard.</em>", lead: "From the discreet Camry to the Executive Lounge Alphard and the Porsche Cayenne S — every vehicle chauffeured, immaculate and priced upfront.", video: "fleet", cta: bookBtn() })}
<section class="sec"><div class="wrap">
  <div class="cards">${D.VEHICLES.map((v) => `<a class="card" href="/fleet/${v.slug}/" data-cursor="Explore"><div class="card-img"><img src="${IMG(v.img)}" alt="${v.name} with chauffeur" loading="lazy" width="900" height="600"></div>
    <div class="card-body"><p class="mono">${v.cls} · ${v.seats} seats · ${v.luggage} bags</p><h3>${v.name}</h3><p>${esc(v.blurb)}</p><div class="more"><span>Airport from ${thb(v.price.airport)}</span><span>${I.arrow.replace("<svg", '<svg width="16" height="16"')}</span></div></div></a>`).join("")}</div>
</div></section>
<section class="sec light"><div class="wrap"><div class="sec-head"><h2 class="h2" data-split>Compare <em>every</em> rate.</h2><p class="lead">Fixed, all-inclusive prices: driver, fuel and tolls. Overtime billed per hour.</p></div>${rateTable(["airport", "bkk5", "bkk10", "pattaya", "overtime"])}</div></section>
${ctaBand()}`;
  emit("/fleet/", layout({ url: "/fleet/", title: "Luxury Chauffeur Fleet in Bangkok — Alphard, Vellfire, Cayenne", desc: "Explore SiamDrive's chauffeured fleet in Bangkok: Toyota Alphard 30 & 40, Executive Lounge, Rowen Vellfire Z, Porsche Cayenne S and Camry. Fixed prices online.", body, image: "car-alphard40.webp", ld: [crumbLd([["Home", "/"], ["Fleet", "/fleet/"]])] }), 0.9);

  D.VEHICLES.forEach((v) => {
    const c = Object.keys(by(C.vehicles, v.slug)).length ? by(C.vehicles, v.slug) : fallback(v.name + " with chauffeur", "Fleet");
    const url = `/fleet/${v.slug}/`;
    const trail = [["Home", "/"], ["Fleet", "/fleet/"], [v.name, url]];
    const others = D.VEHICLES.filter((o) => o.slug !== v.slug);
    const body = `
${phero({ trail, kicker: c.kicker || `${v.cls} · ${v.year}`, h1: esc(c.h1 || v.name), lead: c.intro, img: v.img, meta: [`${v.seats} seats`, `${v.luggage} large bags`, v.cls, `Airport ${thb(v.price.airport)}`] })}
<section class="sec-sm"><div class="wrap">
  <div class="cards" style="margin-bottom:clamp(50px,7vw,90px)">${[1, 2, 3].filter((n) => IMGS.has(`${v.img}-${n}`)).map((n) => `<div class="card img-reveal"><div class="card-img" style="aspect-ratio:16/10"><img src="${IMG(`${v.img}-${n}`)}" alt="${v.name} — ${["front", "profile", "rear"][n - 1]} view" loading="lazy" width="500" height="320"></div></div>`).join("")}</div></div>
<div class="wrap layout">
  <div>
    <div class="prose">${sections(c.sections)}</div>
    <div class="lists">${listBox("Cabin &amp; features", c.features)}${listBox("Best for", c.bestFor)}</div>
    <h2 class="h3" style="margin:50px 0 18px">${v.name} rates</h2>
    <div class="table-scroll"><table class="rates"><thead><tr><th>Service</th><th class="r">Price</th></tr></thead><tbody>
      ${[["Airport transfer (BKK / DMK)", v.price.airport], ["Bangkok · 5 hours", v.price.bkk5], ["Bangkok · 10 hours", v.price.bkk10], ["Outskirt Bangkok · 10 hrs (+20–70 km)", v.price.outskirt], ["Bangkok – Pattaya · 10 hrs", v.price.pattaya], ["Hua Hin / Rayong / Ratchaburi / Khao Yai transfer", v.price.longTransfer], ["Long-distance day trip · 10 hrs", v.price.longDay], ["Overtime per hour", v.price.overtime], ["Overnight outside Bangkok", D.OVERNIGHT]].map(([a, b]) => `<tr><td>${a}</td><td class="r">${thb(b)}</td></tr>`).join("")}
      ${D.MONTHLY.find((m) => m.vehicle === v.name) ? `<tr><td>Monthly private driver (excl. fuel &amp; tolls)</td><td class="r">${thb(D.MONTHLY.find((m) => m.vehicle === v.name).price)}</td></tr>` : ""}
    </tbody></table></div>
  </div>
  ${aside({ title: v.name, price: v.price.airport, priceLabel: "Airport transfer from", q: `vehicle=${v.slug}`, items: [`${v.seats} seats · ${v.luggage} large bags`] })}
</div></section>
<section class="sec-sm"><div class="wrap"><div class="sec-head"><h2 class="h2">Also in the <em>fleet</em></h2></div><div class="cards">${others.slice(0, 3).map((o) => imgCard({ href: `/fleet/${o.slug}/`, img: o.img, mono: `${o.cls} · ${o.seats} seats`, title: o.name, text: o.blurb, foot: "Airport from " + thb(o.price.airport) })).join("")}</div></div></section>
${faqBlock(c.faqs)}${ctaBand()}`;
    emit(url, layout({ url, title: c.title || `${v.name} with Chauffeur in Bangkok`, desc: c.metaDescription, body, image: v.img + ".webp", ld: [crumbLd(trail), serviceLd(`${v.name} with chauffeur`, url, v.price.airport, v.price.longDay, v.blurb), faqLd(c.faqs)] }), 0.8);
  });
})();

// ---------- SERVICES
const SVC_TABLE = {
  "airport-transfers": () => rateTable(["airport", "overtime"], { q: "service=airport" }) + `<h3 class="h3" style="margin:40px 0 16px">Add Suvarnabhumi Fast-Track</h3>` + fastTrackTable(),
  "hourly-chauffeur": () => rateTable(["bkk5", "bkk10", "overtime"], { q: "service=hourly" }),
  "city-to-city-transfers": () => `<div class="table-scroll"><table class="rates"><thead><tr><th>Destination</th><th>Distance</th><th class="r">From</th><th class="r"><span class="sr">Book</span></th></tr></thead><tbody>${D.ROUTES.map((r) => `<tr><td><a href="/routes/${r.slug}/">Bangkok → ${esc(r.name)}</a></td><td>${r.km} km · ${r.hrs} hrs</td><td class="r">${routeFrom(r) ? thb(routeFrom(r)) : "On request"}</td><td class="r"><a class="btn btn-ghost btn-sm" href="/book/?service=intercity&dest=${r.slug}">Book</a></td></tr>`).join("")}</tbody></table></div>`,
  "day-trips": () => rateTable(["outskirt", "pattaya", "longDay", "overtime"], { q: "service=intercity" }),
  "monthly-chauffeur": monthlyTable,
  bodyguards: guardTable, "motorcycle-escort": guardTable,
  "airport-fast-track": fastTrackTable,
  "personal-assistant": paTable,
};
const SVC_FROM = {
  "airport-transfers": minFor("airport"), "hourly-chauffeur": minFor("bkk5"), "city-to-city-transfers": minFor("outskirt"), "day-trips": minFor("outskirt"),
  "monthly-chauffeur": D.MONTHLY[1].price, bodyguards: D.BODYGUARD.transfer, "motorcycle-escort": D.BODYGUARD.escort5, "airport-fast-track": D.FASTTRACK.buggy, "personal-assistant": D.PA.h10,
};
(() => {
  const body = `
${phero({ trail: [["Home", "/"], ["Services", "/services/"]], kicker: `${D.SERVICES.length} services · one concierge`, h1: "Every service, <em>one standard.</em>", lead: "Chauffeurs, protection, airport VIP handling and personal assistance — booked individually or choreographed into one seamless itinerary.", img: "svc-chauffeur", cta: bookBtn() })}
<section class="sec light"><div class="wrap">
  <ul class="svc-list" data-follow>${D.SERVICES.map((s, i) => { const c = by(C.services, s.slug); return `<li><a href="/services/${s.slug}/" data-img="${IMG(pick(s.slug, s.img))}"><span class="n">${String(i + 1).padStart(2, "0")}</span><span class="t">${esc(s.name)}</span><span class="d">${esc((c.kicker || "").slice(0, 60))}</span><span class="p">${SVC_FROM[s.slug] ? "From " + thb(SVC_FROM[s.slug]) : "From " + thb(minFor("bkk5"))}</span><span class="ar">${I.arrow.replace("<svg", '<svg width="16" height="16"')}</span></a></li>`; }).join("")}</ul>
</div></section>${ctaBand()}`;
  emit("/services/", layout({ url: "/services/", title: "Chauffeur, Security & Airport Services in Bangkok", desc: "All SiamDrive services: airport transfers, hourly chauffeur, Fast-Track & VIP buggy, bodyguards, motorcycle escort, monthly drivers, day trips and delegations.", body, ld: [crumbLd([["Home", "/"], ["Services", "/services/"]])] }), 0.9);

  D.SERVICES.filter((s) => !s.core).forEach((s) => {
    const c = Object.keys(by(C.services, s.slug)).length ? by(C.services, s.slug) : fallback(s.name, "Service");
    const url = `/services/${s.slug}/`, trail = [["Home", "/"], ["Services", "/services/"], [s.name, url]];
    const img = pick(s.slug, s.img), video = s.slug === "bodyguards" || s.slug === "motorcycle-escort" ? "guards" : null;
    const table = (SVC_TABLE[s.slug] || (() => rateTable(["airport", "bkk5", "bkk10", "overtime"])))();
    const from = SVC_FROM[s.slug] || minFor("bkk5");
    const related = D.SERVICES.filter((o) => o.slug !== s.slug).sort((a, b) => hash(s.slug + a.slug) - hash(s.slug + b.slug)).slice(0, 3);
    const body = `
${phero({ trail, kicker: c.kicker || "Service", h1: esc(c.h1 || s.name), lead: c.intro, img: video ? null : img, video, meta: ["Fixed price", "24/7 concierge", "English-speaking"] })}
<section class="sec-sm"><div class="wrap layout">
  <div>
    <div class="prose">${sections(c.sections)}</div>
    <div class="lists">${listBox("What's included", c.includes)}${listBox("Ideal for", c.idealFor)}</div>
    ${c.process ? `<div class="steps" style="margin:50px 0">${c.process.map((p, i) => `<div class="step"><span class="n">0${i + 1}</span><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p></div>`).join("")}</div>` : ""}
    <h2 class="h3" style="margin:40px 0 18px">Rates</h2>${table}
  </div>
  ${aside({ title: s.name, price: SVC_FROM[s.slug] === undefined ? from : SVC_FROM[s.slug], q: { "airport-transfers": "service=airport", "hourly-chauffeur": "service=hourly", "city-to-city-transfers": "service=intercity", "day-trips": "service=intercity", "monthly-chauffeur": "service=monthly" }[s.slug] || "", msg: `Hello SiamDrive, I'd like to book: ${s.name}` })}
</div></section>
<section class="sec-sm"><div class="wrap"><div class="sec-head"><h2 class="h2">Pairs well <em>with</em></h2></div><div class="cards">${related.map((o) => imgCard({ href: `/services/${o.slug}/`, img: pick(o.slug, o.img), mono: "Service", title: o.name, text: (by(C.services, o.slug).intro || "").split(". ")[0] + ".", foot: "Explore" })).join("")}</div></div></section>
${faqBlock(c.faqs)}${ctaBand(undefined, undefined, video || "home")}`;
    emit(url, layout({ url, title: c.title || s.name, desc: c.metaDescription, body, image: img + ".webp", ld: [crumbLd(trail), serviceLd(s.name, url, from, null, c.intro || s.name), faqLd(c.faqs)] }), 0.85);
  });
})();

buildPillars(ctx);

// ---------- AIRPORTS
(() => {
  const body = `
${phero({ trail: [["Home", "/"], ["Airports", "/airports/"]], kicker: "BKK · DMK · UTP", h1: "Airport transfers, <em>orchestrated.</em>", lead: "Flight tracked, name sign at arrivals, Fast-Track and a private buggy from the aircraft door at Suvarnabhumi — then your chauffeur, waiting.", img: "hero-airport", cta: bookBtn("service=airport") })}
<section class="sec"><div class="wrap">
  <div class="cards">${D.AIRPORTS.map((a) => { const c = by(C.airports, a.slug); return imgCard({ href: `/airports/${a.slug}/`, img: pick(a.slug, a.img === "air-bkk" ? "hero-airport" : a.img === "air-dmk" ? "svc-chauffeur" : "rt-sriracha"), mono: `${a.code} · ${a.km} km from central Bangkok`, title: a.name, text: (c.intro || "").split(". ")[0] + ".", foot: a.code === "UTP" ? "From " + thb(minFor("pattaya")) : "From " + thb(minFor("airport")) }); }).join("")}</div>
  <div class="sec-head" style="margin:100px 0 40px"><h2 class="h2">Direct airport <em>routes</em></h2><p class="lead">Skip the city — go straight from the arrivals hall to the coast or the hills.</p></div>
  ${linkGrid(D.AIRPORT_ROUTES.map((ar) => { const a = D.AIRPORTS.find((x) => x.slug === ar.from), r = D.ROUTES.find((x) => x.slug === ar.to); return [`${a.short} → ${r ? r.name : "Don Mueang"}`, `/routes/${ar.slug}/`, `${ar.km} km`]; }))}
</div></section>
<section class="sec light"><div class="wrap"><div class="sec-head"><h2 class="h2" data-split>Fast-Track &amp; <em>VIP buggy</em></h2><p class="lead">At Suvarnabhumi, add priority immigration and a private electric buggy to any SiamDrive airport transfer.</p></div>${fastTrackTable()}</div></section>
${ctaBand()}`;
  emit("/airports/", layout({ url: "/airports/", title: "Bangkok Airport Transfers — Suvarnabhumi, Don Mueang, U-Tapao", desc: "Private Bangkok airport transfers with meet & greet at Suvarnabhumi, Don Mueang and U-Tapao. Flight tracking, Fast-Track & VIP buggy, fixed prices.", body, image: "hero-airport.webp", ld: [crumbLd([["Home", "/"], ["Airports", "/airports/"]])] }), 0.9);

  D.AIRPORTS.forEach((a) => {
    const c = Object.keys(by(C.airports, a.slug)).length ? by(C.airports, a.slug) : fallback(a.name + " transfers", "Airport");
    const url = `/airports/${a.slug}/`, trail = [["Home", "/"], ["Airports", "/airports/"], [a.short, url]];
    const utp = a.code === "UTP";
    const table = utp ? rateTable(["pattaya", "overtime"], { q: "service=airport&airport=u-tapao-utp" }) : rateTable(["airport", "overtime"], { q: "service=airport" }) + (a.code === "BKK" ? `<h3 class="h3" style="margin:40px 0 16px">Fast-Track &amp; VIP buggy</h3>${fastTrackTable()}` : "");
    const routes = D.AIRPORT_ROUTES.filter((x) => x.from === a.slug);
    const body = `
${phero({ trail, kicker: c.kicker || `${a.code} · Airport transfers`, h1: esc(c.h1 || a.name), lead: c.intro, img: pick(a.slug, a.code === "BKK" ? "hero-airport" : a.code === "DMK" ? "svc-chauffeur" : "rt-sriracha"), meta: [a.code, `${a.km} km · ${a.hrs} hrs to centre`, "Meet & greet", "Flight tracked"] })}
<section class="sec-sm"><div class="wrap layout">
  <div><div class="prose">${sections(c.sections)}</div>
  <div class="lists">${listBox("Highlights", c.highlights)}${listBox("Insider tips", c.tips)}</div>
  <h2 class="h3" style="margin:40px 0 18px">${a.short} transfer rates</h2>${table}
  ${routes.length ? `<h2 class="h3" style="margin:50px 0 18px">Direct routes from ${a.short}</h2>${linkGrid(routes.map((ar) => { const r = D.ROUTES.find((x) => x.slug === ar.to); return [`${a.short} → ${r ? r.name : "Don Mueang"}`, `/routes/${ar.slug}/`, `${ar.km} km`]; }))}` : ""}</div>
  ${aside({ title: `${a.short} airport transfer`, price: utp ? minFor("pattaya") : minFor("airport"), q: `service=airport&airport=${a.slug}`, items: ["Flight monitored", "Name-sign meet & greet"] })}
</div></section>
${faqBlock(c.faqs)}${ctaBand()}`;
    emit(url, layout({ url, title: c.title || `${a.name} Transfers`, desc: c.metaDescription, body, image: "hero-airport.webp", ld: [crumbLd(trail), serviceLd(`${a.name} private transfer`, url, utp ? minFor("pattaya") : minFor("airport"), null, c.intro || a.name, "TaxiService"), faqLd(c.faqs)] }), 0.85);
  });
})();

// ---------- ROUTES
(() => {
  const regions = [...new Set(D.ROUTES.map((r) => r.region))];
  const body = `
${phero({ trail: [["Home", "/"], ["Routes", "/routes/"]], kicker: `${D.ROUTES.length} destinations · fixed prices`, h1: "Where to <em>next?</em>", lead: "Private transfers and 10-hour day trips from Bangkok across Thailand — every route mapped, timed and priced before you book.", img: "rt-sriracha", cta: bookBtn("service=intercity") })}
${regions.map((reg, i) => `<section class="sec-sm${i % 2 ? " light" : ""}"><div class="wrap"><div class="index"><span>${String(i + 1).padStart(2, "0")} — ${reg}</span><span>${D.ROUTES.filter((r) => r.region === reg).length} routes</span></div><div class="cards">${D.ROUTES.filter((r) => r.region === reg).map((r) => routeCard(r, `/routes/${r.slug}/`)).join("")}</div></div></section>`).join("")}
<section class="sec-sm"><div class="wrap"><div class="sec-head"><h2 class="h2">Straight from <em>the airport</em></h2></div>${linkGrid(D.AIRPORT_ROUTES.map((ar) => { const a = D.AIRPORTS.find((x) => x.slug === ar.from), r = D.ROUTES.find((x) => x.slug === ar.to); return [`${a.short} → ${r ? r.name : "Don Mueang"}`, `/routes/${ar.slug}/`, `${ar.km} km`]; }))}</div></section>
${ctaBand()}`;
  emit("/routes/", layout({ url: "/routes/", title: "Private Transfers from Bangkok — Routes & Fixed Prices", desc: "Fixed-price private transfers and day trips from Bangkok to Pattaya, Hua Hin, Rayong, Khao Yai, Ayutthaya and more. Driver, fuel and tolls included.", body, ld: [crumbLd([["Home", "/"], ["Routes", "/routes/"]])] }), 0.9);

  D.ROUTES.forEach((r) => {
    const c = Object.keys(by(C.routes, r.slug)).length ? by(C.routes, r.slug) : fallback(`Bangkok to ${r.name} private transfer`, "Route");
    const url = `/routes/${r.slug}/`, short = r.name.replace(/ \(.*\)/, ""), trail = [["Home", "/"], ["Routes", "/routes/"], [short, url]];
    const near = D.ROUTES.filter((o) => o.slug !== r.slug && o.region === r.region).slice(0, 3);
    const body = `
${phero({ trail, kicker: c.kicker || `Private transfer · ${r.km} km · ${r.hrs} hrs`, h1: esc(c.h1 || `Bangkok to ${short}`), lead: c.intro, img: pick(r.slug, "rt-" + r.slug), meta: [`≈ ${r.km} km`, `${r.hrs} hrs`, esc(r.region), routeFrom(r) ? "From " + thb(routeFrom(r)) : "Quote on request"] })}
<section class="sec-sm"><div class="wrap layout">
  <div>
    <div class="card-map" style="border-radius:var(--r);border:1px solid var(--line);margin-bottom:50px">${routeMap("bangkok", r.slug, "Bangkok", short, r.km)}</div>
    <div class="prose">${sections(c.sections)}</div>
    <div class="lists">${listBox("Highlights", c.highlights)}${listBox("Worth a stop", c.stops)}</div>
    ${c.tips && c.tips.length ? `<div class="lists" style="grid-template-columns:1fr">${listBox("Chauffeur's tips", c.tips)}</div>` : ""}
    <h2 class="h3" style="margin:40px 0 18px">Bangkok → ${esc(short)} rates</h2>${routeTable(r)}
  </div>
  ${aside({ title: `Bangkok → ${short}`, price: routeFrom(r), q: `service=intercity&dest=${r.slug}`, items: [`≈ ${r.km} km · ${r.hrs} hrs`], msg: `Hello SiamDrive, I'd like to book Bangkok to ${short}` })}
</div></section>
${near.length ? `<section class="sec-sm"><div class="wrap"><div class="sec-head"><h2 class="h2">Also in the <em>${esc(r.region)}</em></h2></div><div class="cards">${near.map((o) => routeCard(o, `/routes/${o.slug}/`)).join("")}</div></div></section>` : ""}
${faqBlock(c.faqs)}${ctaBand()}`;
    emit(url, layout({ url, title: c.title || `Bangkok to ${short} Private Transfer`, desc: c.metaDescription, body, image: (IMGS.has("rt-" + r.slug) ? "rt-" + r.slug : pick(r.slug)) + ".webp", ld: [crumbLd(trail), serviceLd(`Bangkok to ${short} private transfer`, url, routeFrom(r), routeFrom(r) ? Math.max(...D.VEHICLES.map((v) => v.price[D.TIERS[r.tier].day])) : null, c.intro || "", "TaxiService"), faqLd(c.faqs)] }), 0.8);
  });

  D.AIRPORT_ROUTES.forEach((ar) => {
    const a = D.AIRPORTS.find((x) => x.slug === ar.from), r = D.ROUTES.find((x) => x.slug === ar.to);
    const toName = r ? r.name.replace(/ \(.*\)/, "") : "Don Mueang Airport";
    const c = Object.keys(by(C.airportRoutes, ar.slug)).length ? by(C.airportRoutes, ar.slug) : fallback(`${a.short} to ${toName} transfer`, "Airport route");
    const url = `/routes/${ar.slug}/`, trail = [["Home", "/"], ["Routes", "/routes/"], [`${a.short} → ${toName}`, url]];
    const table = r ? routeTable(r) : rateTable(["airport", "overtime"], { q: "service=airport" });
    const from = r ? routeFrom(r) : minFor("airport");
    const body = `
${phero({ trail, kicker: c.kicker || `${a.code} → ${toName} · ${ar.km} km`, h1: esc(c.h1 || `${a.short} to ${toName}`), lead: c.intro, img: r ? pick(r.slug, "rt-" + r.slug) : "hero-airport", meta: [`${a.code} arrivals`, `≈ ${ar.km} km`, `${ar.hrs} hrs`, from ? "From " + thb(from) : "Quote"] })}
<section class="sec-sm"><div class="wrap layout"><div>
  <div class="card-map" style="border-radius:var(--r);border:1px solid var(--line);margin-bottom:50px">${routeMap(a.slug, r ? r.slug : "don-mueang-dmk", a.code, r ? toName : "DMK", ar.km)}</div>
  <div class="prose">${sections(c.sections)}</div>
  <div class="lists">${listBox("Highlights", c.highlights)}${listBox("Tips", c.tips)}</div>
  <h2 class="h3" style="margin:40px 0 18px">Rates</h2>${table}
  ${a.code === "BKK" ? `<h3 class="h3" style="margin:40px 0 16px">Add Fast-Track &amp; buggy</h3>${fastTrackTable()}` : ""}
</div>${aside({ title: `${a.short} → ${toName}`, price: from, q: r ? `service=intercity&dest=${r.slug}` : "service=airport", items: ["Flight monitored", "Meet & greet"], msg: `Hello SiamDrive, I'd like to book ${a.short} airport to ${toName}` })}</div></section>
${faqBlock(c.faqs)}${ctaBand()}`;
    emit(url, layout({ url, title: c.title || `${a.short} Airport to ${toName} Transfer`, desc: c.metaDescription, body, image: "hero-airport.webp", ld: [crumbLd(trail), serviceLd(`${a.short} to ${toName} private transfer`, url, from, null, c.intro || "", "TaxiService"), faqLd(c.faqs)] }), 0.75);
  });
})();

// ---------- BANGKOK DISTRICTS
(() => {
  const body = `
${phero({ trail: [["Home", "/"], ["Bangkok", "/bangkok/"]], kicker: `${D.DISTRICTS.length} neighbourhoods`, h1: "Bangkok, <em>district by district.</em>", lead: "Private chauffeurs who know every soi, shortcut and hotel driveway — from Sukhumvit boardrooms to riverside dinners.", img: "sec-why", cta: bookBtn("service=hourly") })}
<section class="sec"><div class="wrap"><div class="cards">${D.DISTRICTS.map((dd) => { const c = by(C.districts, dd.slug); return imgCard({ href: `/bangkok/${dd.slug}/`, img: pick("ds-" + dd.slug, "ds-" + dd.slug), mono: "Bangkok district", title: `Chauffeur in ${dd.name}`, text: (c.intro || "").split(". ")[0] + ".", foot: "From " + thb(minFor("bkk5")) }); }).join("")}</div></div></section>
<section class="sec light"><div class="wrap"><div class="sec-head"><h2 class="h2">Chauffeur <em>by the hour</em></h2><p class="lead">5 or 10 hours, as directed, anywhere in Bangkok.</p></div>${rateTable(["bkk5", "bkk10", "overtime"], { q: "service=hourly" })}</div></section>${ctaBand()}`;
  emit("/bangkok/", layout({ url: "/bangkok/", title: "Private Chauffeur in Bangkok by District", desc: "Hire a private chauffeur anywhere in Bangkok: Sukhumvit, Silom, Sathorn, Siam, Thonglor, Riverside and more. Hourly hire from 5 hours, fixed prices, 24/7 booking.", body, ld: [crumbLd([["Home", "/"], ["Bangkok", "/bangkok/"]])] }), 0.85);
  D.DISTRICTS.forEach((dd) => {
    const c = Object.keys(by(C.districts, dd.slug)).length ? by(C.districts, dd.slug) : fallback(`Private chauffeur in ${dd.name}`, "Bangkok district");
    const url = `/bangkok/${dd.slug}/`, trail = [["Home", "/"], ["Bangkok", "/bangkok/"], [dd.name, url]];
    const others = D.DISTRICTS.filter((o) => o.slug !== dd.slug);
    const body = `
${phero({ trail, kicker: c.kicker || "Bangkok district", h1: esc(c.h1 || `Chauffeur in ${dd.name}`), lead: c.intro, img: pick("ds-" + dd.slug, "ds-" + dd.slug), meta: ["Hourly from " + thb(minFor("bkk5")), "Airport " + thb(minFor("airport")), "24/7"] })}
<section class="sec-sm"><div class="wrap layout"><div>
  <div class="prose">${sections(c.sections)}</div>
  <div class="lists">${listBox("Why a chauffeur here", c.highlights)}${listBox("Places we drive to", c.places)}</div>
  ${c.tips && c.tips.length ? `<div class="lists" style="grid-template-columns:1fr">${listBox("Local tips", c.tips)}</div>` : ""}
  <h2 class="h3" style="margin:40px 0 18px">Rates in ${esc(dd.name)}</h2>${rateTable(["airport", "bkk5", "bkk10"], { q: "service=hourly" })}
  <h2 class="h3" style="margin:50px 0 18px">Other districts</h2>${linkGrid(others.map((o) => [o.name, `/bangkok/${o.slug}/`]))}
</div>${aside({ title: `Chauffeur in ${dd.name}`, price: minFor("bkk5"), priceLabel: "5 hours from", q: "service=hourly" })}</div></section>
${faqBlock(c.faqs)}${ctaBand()}`;
    emit(url, layout({ url, title: c.title || `Private Chauffeur in ${dd.name}, Bangkok`, desc: c.metaDescription, body, ld: [crumbLd(trail), serviceLd(`Private chauffeur in ${dd.name}`, url, minFor("bkk5"), minFor("bkk10") * 3, c.intro || ""), faqLd(c.faqs)] }), 0.7);
  });
})();

// ---------- EXPERIENCES
const EXP_PRICE = { "ayutthaya-heritage-day": ["ayutthaya", "day"], "floating-markets": ["damnoen-saduak", "day"], "golf-day-bangkok": [null, "bkk10"] };
(() => {
  const body = `
${phero({ trail: [["Home", "/"], ["Experiences", "/experiences/"]], kicker: "Curated chauffeured days", h1: "Days worth <em>remembering.</em>", lead: "Temples at dawn, floating markets, rooftop nights and fight nights — itineraries planned by chauffeurs who drive them every week.", img: "banner-onecall", cta: bookBtn("service=hourly") })}
<section class="sec"><div class="wrap"><div class="cards">${D.EXPERIENCES.map((e) => { const c = by(C.experiences, e.slug); return imgCard({ href: `/experiences/${e.slug}/`, img: pick("ex-" + e.slug, "ex-" + e.slug), mono: c.duration || "Chauffeured experience", title: e.name, text: (c.intro || "").split(". ")[0] + ".", foot: "View itinerary" }); }).join("")}</div></div></section>${ctaBand()}`;
  emit("/experiences/", layout({ url: "/experiences/", title: "Chauffeured Experiences in Bangkok — Curated Days Out", desc: "Curated chauffeured itineraries in and around Bangkok: Grand Palace temples, floating markets, rooftop nights, Muay Thai, golf days, Ayutthaya and luxury shopping.", body, ld: [crumbLd([["Home", "/"], ["Experiences", "/experiences/"]])] }), 0.8);
  D.EXPERIENCES.forEach((e) => {
    const c = Object.keys(by(C.experiences, e.slug)).length ? by(C.experiences, e.slug) : fallback(e.name, "Experience");
    const url = `/experiences/${e.slug}/`, trail = [["Home", "/"], ["Experiences", "/experiences/"], [e.name, url]];
    const ep = EXP_PRICE[e.slug];
    const priceTable = ep && ep[0] ? routeTable(D.ROUTES.find((r) => r.slug === ep[0])) : rateTable(["bkk5", "bkk10", "overtime"], { q: "service=hourly" });
    const from = ep && ep[0] ? routeFrom(D.ROUTES.find((r) => r.slug === ep[0])) : minFor("bkk5");
    const body = `
${phero({ trail, kicker: c.kicker || "Experience", h1: esc(c.h1 || e.name), lead: c.intro, img: pick("ex-" + e.slug, "ex-" + e.slug), meta: [c.duration || "Chauffeured", c.bestTime ? "Best: " + esc(c.bestTime).slice(0, 40) : "Private", "From " + thb(from)] })}
<section class="sec-sm"><div class="wrap layout"><div>
  ${c.itinerary ? `<h2 class="h3" style="margin-bottom:24px">The itinerary</h2><ol class="timeline">${c.itinerary.map((s) => `<li><span class="t">${esc(s.time)}</span><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></li>`).join("")}</ol>` : ""}
  <div class="prose">${sections(c.sections)}</div>
  <div class="lists">${listBox("Highlights", c.highlights)}${listBox("Good to know", c.tips)}</div>
  <h2 class="h3" style="margin:40px 0 18px">Rates</h2>${priceTable}
</div>${aside({ title: e.name, price: from, q: ep && ep[0] ? `service=intercity&dest=${ep[0]}` : "service=hourly", msg: `Hello SiamDrive, I'd like to book the ${e.name} experience` })}</div></section>
${faqBlock(c.faqs)}${ctaBand()}`;
    emit(url, layout({ url, title: c.title || e.name, desc: c.metaDescription, body, ld: [crumbLd(trail), serviceLd(e.name + " with private chauffeur", url, from, null, c.intro || "", "TouristTrip" === "x" ? "TouristTrip" : "Service"), faqLd(c.faqs)] }), 0.7);
  });
})();

// ---------- JOURNAL
(() => {
  const arts = [...C.journal].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  const imgFor = (a) => pick("j-" + a.slug, { Airports: "hero-airport", Fleet: "car-vellfire", Security: "hero-bodyguards", Routes: "rt-sriracha", Business: "banner-onecall", Guides: "sec-why" }[a.category]);
  const body = `
${phero({ trail: [["Home", "/"], ["Journal", "/journal/"]], kicker: "Field notes from Bangkok", h1: "The <em>Journal</em>", lead: "Airports, routes, security and the small details of moving well in Thailand — written by the people who drive it every day." })}
<section class="sec-sm" style="padding-top:20px"><div class="wrap"><div class="cards">${arts.map((a) => imgCard({ href: `/journal/${a.slug}/`, img: imgFor(a), mono: `${a.category} · ${a.readMins} min · ${a.date}`, title: a.h1, text: a.excerpt, foot: "Read" })).join("")}</div></div></section>${ctaBand()}`;
  emit("/journal/", layout({ url: "/journal/", title: "Journal — Bangkok Travel, Airports & Chauffeur Guides", desc: "Guides to Bangkok airports, Fast-Track, traffic, routes to Pattaya and Hua Hin, hiring bodyguards and travelling with a private chauffeur in Thailand.", body, ld: [crumbLd([["Home", "/"], ["Journal", "/journal/"]])] }), 0.8);
  arts.forEach((a) => {
    const url = `/journal/${a.slug}/`, trail = [["Home", "/"], ["Journal", "/journal/"], [a.category || "Article", url]];
    const img = imgFor(a);
    const more = arts.filter((x) => x.slug !== a.slug).slice(0, 3);
    const body = `
${phero({ trail, kicker: `${a.category} · ${a.readMins} min read · ${a.date}`, h1: esc(a.h1), lead: a.excerpt, img })}
<section class="sec-sm"><div class="wrap layout"><article class="prose">${sections(a.sections)}
  ${a.related && a.related.length ? `<h3>Related</h3><ul>${a.related.map((u) => `<li><a href="${u}">${esc(u.replace(/\/$/, "").split("/").pop().replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase()))}</a></li>`).join("")}</ul>` : ""}
</article>${aside({ title: "Need a chauffeur?", price: minFor("airport"), priceLabel: "Airport transfers from" })}</div></section>
<section class="sec-sm"><div class="wrap"><div class="sec-head"><h2 class="h2">Keep <em>reading</em></h2></div><div class="cards">${more.map((m) => imgCard({ href: `/journal/${m.slug}/`, img: imgFor(m), mono: `${m.category} · ${m.readMins} min`, title: m.h1, text: m.excerpt, foot: "Read" })).join("")}</div></div></section>
${faqBlock(a.faqs)}${ctaBand()}`;
    const art = { "@type": "Article", headline: a.h1, description: a.metaDescription, datePublished: a.date, dateModified: a.date, image: `${S.domain}/assets/img/${img}.webp`, author: { "@type": "Organization", name: "SiamDrive", url: S.domain + "/" }, publisher: { "@id": S.domain + "/#business" }, mainEntityOfPage: S.domain + url };
    emit(url, layout({ url, title: a.title, desc: a.metaDescription, body, image: img + ".webp", ld: [crumbLd(trail), art, faqLd(a.faqs)] }), 0.6);
  });
})();

// ---------- PRICING
(() => {
  const body = `
${phero({ trail: [["Home", "/"], ["Rates", "/pricing/"]], kicker: "Published rates · THB", h1: "Clear prices. <em>No meter.</em>", lead: "Every chauffeured rate includes a professional driver, fuel and expressway tolls. Extras are listed upfront — what you see is what you pay.", cta: bookBtn() })}
<section class="sec-sm"><div class="wrap">
  <h2 class="h3" style="margin-bottom:18px">Chauffeur rates by vehicle</h2>${rateTable(["airport", "bkk5", "bkk10", "outskirt", "pattaya", "longTransfer", "longDay", "overtime"])}
  <p class="muted" style="font-size:14px;margin-top:12px">Long transfer / day trip: Hua Hin, Rayong, Ratchaburi, Khao Yai and comparable destinations. Overnight outside Bangkok +${thb(D.OVERNIGHT)} per night.</p>
</div></section>
<section class="sec-sm light"><div class="wrap" style="display:grid;gap:60px">
  <div><h2 class="h3" style="margin-bottom:18px">Suvarnabhumi Fast-Track &amp; VIP buggy</h2>${fastTrackTable()}</div>
  <div><h2 class="h3" style="margin-bottom:18px">Bodyguards &amp; escort</h2>${guardTable()}</div>
  <div><h2 class="h3" style="margin-bottom:18px">Personal assistant</h2>${paTable()}</div>
  <div><h2 class="h3" style="margin-bottom:18px">Monthly private driver</h2>${monthlyTable()}</div>
</div></section>
<section class="sec-sm"><div class="wrap"><h2 class="h3" style="margin-bottom:18px">Destination prices from Bangkok</h2>${SVC_TABLE["city-to-city-transfers"]()}</div></section>
${ctaBand()}`;
  emit("/pricing/", layout({ url: "/pricing/", title: "Rates — Private Chauffeur, Fast-Track & Bodyguards in Bangkok", desc: "SiamDrive published rates in THB: airport transfers, hourly chauffeur, Pattaya & long-distance trips, Fast-Track, VIP buggy, bodyguards, PA and monthly drivers.", body, ld: [crumbLd([["Home", "/"], ["Rates", "/pricing/"]])] }), 0.9);
})();

// ---------- STATIC PAGES
const simple = (url, trailName, { title, desc, kicker, h1, lead, html, img, faqs, priority = 0.5, noindex = false }) => {
  const trail = [["Home", "/"], [trailName, url]];
  emit(url, layout({ url, title, desc, noindex, body: `${phero({ trail, kicker, h1, lead, img })}<section class="sec-sm"><div class="wrap"><div class="prose">${html}</div></div></section>${faqs ? faqBlock(faqs) : ""}${ctaBand()}`, ld: [crumbLd(trail), faqs ? faqLd(faqs) : null] }), priority);
};
simple("/about/", "About", {
  title: "About SiamDrive — Bangkok Private Chauffeur Concierge", desc: "SiamDrive is a Bangkok concierge for private chauffeurs, VIP airport handling and personal security — one line for every movement in Thailand.",
  kicker: "Chauffeur · Security · Concierge", h1: "The quiet machinery <em>behind your day.</em>", lead: "SiamDrive exists for travellers who would rather not think about getting there.", img: "banner-onecall",
  html: `<h2>What we do</h2><p>SiamDrive coordinates private chauffeurs, VIP airport arrivals, suited security and personal assistants across Bangkok and Thailand. You speak to one concierge; we orchestrate the vehicle, the people and the timing.</p><p>Our fleet covers six classes — from the discreet Toyota Camry to the Alphard Executive Lounge, the Rowen Vellfire Z and the Porsche Cayenne S — each with a professional chauffeur, fuel and tolls included.</p><h2>How we work</h2><ul><li>Fixed, published prices — no meters and no surprises.</li><li>English-speaking concierge on WhatsApp, 24 hours a day.</li><li>Flight monitoring, name-sign meet &amp; greet and Fast-Track at Suvarnabhumi.</li><li>Discretion as a default: your schedule and your guests stay private.</li></ul><h2>Who we serve</h2><p>Business travellers and delegations, families, sports teams and federations, wedding parties, long-stay residents and high-profile guests who value privacy. Organisations receive formal invoicing.</p>`,
});
simple("/contact/", "Contact", {
  title: "Contact SiamDrive — 24/7 WhatsApp Concierge Bangkok", desc: "Contact SiamDrive's 24/7 concierge on WhatsApp +66 96 221 2364 to book a private chauffeur, airport Fast-Track or bodyguards in Bangkok.",
  kicker: "Reservations · 24/7", h1: "Speak to the <em>concierge.</em>", lead: "The fastest way to reach us is WhatsApp — a real person replies, day or night.",
  html: `<h2>WhatsApp</h2><p><a href="${WA("Hello SiamDrive, I would like to make a booking")}" target="_blank" rel="noopener">${S.phoneDisplay}</a> — bookings, quotes, changes and live support during your trip.</p><h2>Online booking</h2><p>Use our <a href="/book/">booking form</a> for an instant estimate; it sends a complete booking to our concierge in one tap.</p><h2>Organisations</h2><p>Delegations, sports teams, events and corporate accounts: message us with dates, arrival flights and party sizes and we will return a consolidated plan and formal invoice.</p><div class="hero-cta">${waBtn("Hello SiamDrive, I would like to make a booking", "Message on WhatsApp")}${bookBtn()}</div>`,
  priority: 0.7,
});
simple("/how-it-works/", "How it works", {
  title: "How SiamDrive Works — Book a Chauffeur in 3 Steps", desc: "How booking a SiamDrive private chauffeur works: choose online with an instant price, confirm on WhatsApp in minutes, and meet your chauffeur on time.",
  kicker: "Three steps", h1: "Booked in a minute. <em>Handled completely.</em>", lead: "No apps, no accounts, no meters — just a fixed price and a real concierge.", img: "sec-why",
  html: `<h2>1 · Choose</h2><p>Select your service, trip, vehicle and extras in the <a href="/book/">booking form</a>. The estimate updates live and uses our published <a href="/pricing/">rates</a>.</p><h2>2 · Confirm</h2><p>Tap “Confirm on WhatsApp”. Your full booking arrives with our concierge, who confirms the vehicle, chauffeur and fixed price — usually within minutes. Payment details are confirmed in the same chat.</p><h2>3 · Arrive</h2><p>The day before, you receive your chauffeur's details. For flights we monitor your arrival; your chauffeur waits in arrivals with a name sign. During the trip, the concierge stays one message away.</p><h2>Changes</h2><p>Plans change — message us and we adjust timings, vehicles or add-ons. See our <a href="/cancellation-policy/">cancellation policy</a>.</p>`,
  priority: 0.6,
});
simple("/faq/", "FAQ", {
  title: "FAQ — Private Chauffeur, Fast-Track & Bodyguards in Bangkok", desc: "Answers about booking SiamDrive: pricing, payment, airport meet & greet, Suvarnabhumi Fast-Track, bodyguards, vehicles, luggage and cancellations.",
  kicker: "Help centre", h1: "Questions, <em>answered.</em>", lead: "Can't find it here? Ask the concierge on WhatsApp.",
  html: C.faq.map((g) => `<h2>${esc(g.group)}</h2><div class="faq" style="margin-bottom:30px">${g.items.map((f) => `<details><summary>${esc(f.q)}<i></i></summary><p class="a">${esc(f.a)}</p></details>`).join("")}</div>`).join("") || "<p>FAQ coming soon.</p>",
  priority: 0.7,
});
// FAQ page needs FAQPage LD of all items — re-emit with LD
if (C.faq.length) {
  const all = C.faq.flatMap((g) => g.items);
  const trail = [["Home", "/"], ["FAQ", "/faq/"]];
  const html = fs.readFileSync(path.join(OUT, "faq/index.html"), "utf8").replace(/<script type="application\/ld\+json">.*?<\/script>/s, `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": [ORG, WEBSITE, crumbLd(trail), faqLd(all)] })}</script>`);
  fs.writeFileSync(path.join(OUT, "faq/index.html"), html);
}
const legal = (h) => `<p class="muted">Last updated ${TODAY}.</p>` + h;
simple("/terms/", "Terms", { title: "Terms of Service", desc: "SiamDrive terms of service for private chauffeur, airport and security bookings in Thailand.", kicker: "Legal", h1: "Terms of <em>service</em>", priority: 0.2,
  html: legal(`<h2>Bookings</h2><p>A booking is confirmed when our concierge confirms it in writing on WhatsApp or by invoice. Online estimates are based on published rates; the confirmed price is the one stated in your confirmation.</p><h2>Prices</h2><p>Chauffeured rates include driver, fuel and tolls unless stated otherwise (monthly packages exclude fuel and tolls). Extra hours, overnight stays and add-ons are charged at the published rates.</p><h2>Add-on services</h2><p>Bodyguard and airport Fast-Track services are provided together with a SiamDrive vehicle booking. Electric buggies seat a maximum of two guests and are allocated per arrival flight.</p><h2>Conduct</h2><p>All services, including personal assistance, are strictly professional. We may decline or end a service where safety or the law requires it.</p><h2>Liability</h2><p>We are not responsible for delays caused by traffic, weather, airport authorities or events outside our control, though we will always work to minimise disruption.</p>`) });
simple("/privacy/", "Privacy", { title: "Privacy Policy", desc: "How SiamDrive collects, uses and protects personal information shared when booking chauffeur, airport and security services.", kicker: "Legal", h1: "Privacy <em>policy</em>", priority: 0.2,
  html: legal(`<h2>What we collect</h2><p>Names, contact details, flight numbers, pick-up locations and preferences you share with us to deliver your booking.</p><h2>How we use it</h2><p>Only to plan, deliver and invoice your service and to contact you about it. We never sell personal data.</p><h2>Sharing</h2><p>Details are shared only with the chauffeur, security or airport personnel delivering your service.</p><h2>This website</h2><p>The booking form stores your draft in your own browser (local storage) so you don't lose progress; it is not sent anywhere until you choose to send it on WhatsApp.</p><h2>Your rights</h2><p>Message us on WhatsApp to access, correct or delete your information.</p>`) });
simple("/cancellation-policy/", "Cancellation", { title: "Cancellation Policy", desc: "SiamDrive cancellation and change policy for chauffeur, airport transfer, Fast-Track and bodyguard bookings in Bangkok.", kicker: "Policies", h1: "Changes &amp; <em>cancellations</em>", priority: 0.3,
  html: legal(`<h2>Changes</h2><p>Message the concierge on WhatsApp to change times, vehicles or add-ons. We accommodate changes wherever availability allows.</p><h2>Cancellations</h2><p>Cancellation terms depend on the service and how close to the start time you cancel; they are stated in your booking confirmation before you pay.</p><h2>Flight delays</h2><p>For airport pick-ups we monitor your flight and adjust to delays. Extended waiting beyond the included time may be charged at the overtime rate.</p><h2>No-shows</h2><p>If a guest cannot be located and does not respond, the booking may be charged in full.</p>`) });

// ---------- HTML SITEMAP + 404 + legacy redirects
(() => {
  const groups = [
    ["Main", [["Home", "/"], ["Book", "/book/"], ["Rates", "/pricing/"], ["Fleet", "/fleet/"], ["Services", "/services/"], ["Airports", "/airports/"], ["Routes", "/routes/"], ["Bangkok", "/bangkok/"], ["Experiences", "/experiences/"], ["Journal", "/journal/"], ["About", "/about/"], ["Contact", "/contact/"], ["FAQ", "/faq/"], ["How it works", "/how-it-works/"]]],
    ["Private driver", [["Private driver in Bangkok", "/private-driver/"], ...C.drivers.map((x) => [x.name, `/private-driver/${x.slug}/`])]], ["Bodyguards", [["Bodyguards in Bangkok", "/bodyguards/"], ...C.guards.map((x) => [x.name, `/bodyguards/${x.slug}/`])]],
    ["Fleet", D.VEHICLES.map((v) => [v.name, `/fleet/${v.slug}/`])], ["Services", D.SERVICES.map((s) => [s.name, `/services/${s.slug}/`])],
    ["Airports", D.AIRPORTS.map((a) => [a.name, `/airports/${a.slug}/`])], ["Routes", [...D.ROUTES.map((r) => [`Bangkok → ${r.name}`, `/routes/${r.slug}/`]), ...D.AIRPORT_ROUTES.map((ar) => [ar.slug.replace(/-/g, " "), `/routes/${ar.slug}/`])]],
    ["Bangkok", D.DISTRICTS.map((x) => [x.name, `/bangkok/${x.slug}/`])], ["Experiences", D.EXPERIENCES.map((x) => [x.name, `/experiences/${x.slug}/`])], ["Journal", C.journal.map((a) => [a.h1, `/journal/${a.slug}/`])],
  ];
  const trail = [["Home", "/"], ["Sitemap", "/sitemap/"]];
  emit("/sitemap/", layout({ url: "/sitemap/", title: "Sitemap", desc: "All SiamDrive pages: fleet, services, airports, routes, Bangkok districts, experiences and journal.", body: `${phero({ trail, kicker: "Index", h1: "Site<em>map</em>" })}<section class="sec-sm"><div class="wrap">${groups.map(([g, l]) => `<h2 class="h3" style="margin:40px 0 16px">${g}</h2>${linkGrid(l.map(([t, h]) => [t, h]))}`).join("")}</div></section>`, ld: [crumbLd(trail)] }), 0.3);

  const nf = layout({ url: "/404.html", noindex: true, title: "Page not found", desc: "This page doesn't exist.", body: `<section class="phero" style="min-height:90svh;display:flex;align-items:center"><div class="wrap"><p class="eyebrow">404 · Off route</p><h1 class="display" data-split>Wrong <em>turn.</em></h1><p class="lead" style="margin:24px 0">This page doesn't exist — but your chauffeur still does.</p><div class="hero-cta">${btn("/", "Back home", "btn-light")}${bookBtn()}</div></div></section>` });
  fs.writeFileSync(path.join(OUT, "404.html"), nf);
  const redirect = (to) => `<!doctype html><meta charset="utf-8"><title>Moved</title><link rel="canonical" href="${S.domain}${to}"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url=${to}"><script>location.replace(${JSON.stringify(to)})</script><a href="${to}">Continue</a>`;
  [["fleet.html", "/fleet/"], ["bodyguards.html", "/bodyguards/"], ["airport-fast-track.html", "/services/airport-fast-track/"]].forEach(([f, to]) => fs.writeFileSync(path.join(OUT, f), redirect(to)));
  for (const [slug, to] of Object.entries(D.PILLARS)) { const d = path.join(OUT, "services", slug); fs.mkdirSync(d, { recursive: true }); fs.writeFileSync(path.join(d, "index.html"), redirect(to)); }
})();

/* ------------------------------------------------------------------ assets + SEO files */
const copyDir = (src, dst) => { fs.mkdirSync(dst, { recursive: true }); for (const f of fs.readdirSync(src)) { const s = path.join(src, f), d = path.join(dst, f); fs.statSync(s).isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d); } };
copyDir(path.join(ROOT, "static"), path.join(OUT, "assets"));
{ const css = fs.readFileSync(path.join(ROOT, "static/fonts/fonts.css"), "utf8") + " " + fs.readFileSync(path.join(ROOT, "static/css/site.css"), "utf8");
  const min = css.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s+/g, " ").replace(/\s*([{};:,>])\s*/g, "$1").replace(/;}/g, "}").trim();
  fs.writeFileSync(path.join(OUT, "assets/css/site.css"), min); fs.rmSync(path.join(OUT, "assets/fonts/fonts.css"), { force: true }); }
fs.writeFileSync(path.join(OUT, "CNAME"), "siamdrive.vip\n");
fs.writeFileSync(path.join(OUT, ".nojekyll"), "");
fs.writeFileSync(path.join(OUT, "robots.txt"), `User-agent: *\nAllow: /\nDisallow: /404.html\n\nSitemap: ${S.domain}/sitemap.xml\n`);
const INDEXNOW = "8f3c2a9d41b54e7c9a6d2f1e0b7c5a43";
fs.writeFileSync(path.join(OUT, INDEXNOW + ".txt"), INDEXNOW);
fs.writeFileSync(path.join(OUT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map((p) => `  <url><loc>${S.domain}${p.url}</loc><lastmod>${TODAY}</lastmod><priority>${p.priority.toFixed(1)}</priority></url>`).join("\n")}\n</urlset>\n`);
fs.writeFileSync(path.join(OUT, "urls.txt"), pages.map((p) => S.domain + p.url).join("\n"));
console.log(`Built ${pages.length} pages → docs/  (content: routes ${C.routes.length}, airports ${C.airports.length}, airportRoutes ${C.airportRoutes.length}, districts ${C.districts.length}, experiences ${C.experiences.length}, services ${C.services.length}, vehicles ${C.vehicles.length}, faq ${C.faq.length}, journal ${C.journal.length})`);
