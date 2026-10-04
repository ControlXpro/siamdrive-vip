// Full-site audit: every URL in docs/urls.txt at desktop + mobile.  node src/audit.mjs [base]
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
const require = createRequire(import.meta.url);
const puppeteer = require(path.join(process.env.APPDATA, "npm/node_modules/hyperframes/node_modules/puppeteer-core"));
const BASE = process.argv[2] || "http://localhost:8790";
const urls = fs.readFileSync("docs/urls.txt", "utf8").trim().split("\n").map((u) => u.replace("https://siamdrive.vip", ""));
const sizes = [["desktop", 1440, 900, false], ["mobile", 390, 844, true]];
const browser = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: "new" });
const issues = [];
let done = 0;
async function check(u, [label, w, h, mob]) {
  const page = await browser.newPage();
  const errs = [];
  page.on("console", (m) => m.type() === "error" && errs.push("console: " + m.text().slice(0, 160)));
  page.on("pageerror", (e) => errs.push("js: " + e.message.slice(0, 160)));
  page.on("requestfailed", (r) => { const f = r.failure()?.errorText || ""; if (!/ERR_ABORTED/.test(f)) errs.push("reqfail: " + r.url() + " " + f); });
  page.on("response", (r) => { if (r.status() >= 400 && !r.url().includes("favicon")) errs.push(`http ${r.status()}: ${r.url()}`); });
  await page.setViewport({ width: w, height: h, isMobile: mob, hasTouch: mob, deviceScaleFactor: 1 });
  await page.evaluateOnNewDocument(() => { try { sessionStorage.setItem("sd-seen", "1"); } catch {} });
  try {
    await page.goto(BASE + u, { waitUntil: "networkidle2", timeout: 45000 });
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); } window.scrollTo(0, 0); });
    await new Promise((r) => setTimeout(r, 400));
    const r = await page.evaluate((mob) => {
      const out = [];
      const vw = document.documentElement.clientWidth;
      if (document.documentElement.scrollWidth > vw + 1) {
        const wide = [...document.querySelectorAll("body *")].filter((e) => { const b = e.getBoundingClientRect(); return b.right > vw + 2 && b.width > 0 && getComputedStyle(e).position !== "fixed" && !e.closest(".rail,.marquee,.table-scroll,.hero-word,.ftr-word,.grain,.gridlines,.menu"); }).slice(0, 3).map((e) => e.tagName + "." + [...e.classList].join("."));
        if (wide.length) out.push("overflowX: " + wide.join(", "));
      }
      [...document.images].forEach((i) => { if (i.complete && i.naturalWidth === 0 && i.src) out.push("broken img: " + i.src); if (!i.hasAttribute("alt")) out.push("img no alt: " + i.src.split("/").pop()); });
      const ids = {}; document.querySelectorAll("[id]").forEach((e) => (ids[e.id] = (ids[e.id] || 0) + 1)); Object.entries(ids).filter(([, n]) => n > 1).forEach(([k]) => out.push("dup id: " + k));
      if (mob) {
        document.querySelectorAll("input,select,textarea").forEach((e) => { const fs = parseFloat(getComputedStyle(e).fontSize); if (fs < 16 && e.offsetParent) out.push("ios-zoom input font " + fs + "px"); });
        const small = [...document.querySelectorAll("a,button")].filter((e) => { const b = e.getBoundingClientRect(); return e.offsetParent && b.width > 0 && (b.height < 24 || b.width < 24) && !e.closest("p,li,.crumbs,.prose,.legal,.ftr,.linkgrid,dd"); }).slice(0, 3).map((e) => (e.innerText || e.getAttribute("aria-label") || e.className).slice(0, 30));
        if (small.length) out.push("small tap targets: " + small.join(" | "));
      }
      if (!document.querySelector("h1")) out.push("no h1");
      return [...new Set(out)];
    }, mob);
    [...new Set(errs)].concat(r).forEach((m) => issues.push(`[${label}] ${u} — ${m}`));
  } catch (e) { issues.push(`[${label}] ${u} — LOAD FAIL ${e.message.slice(0, 100)}`); }
  await page.close();
  done++;
}
const jobs = []; for (const u of urls) for (const s of sizes) jobs.push([u, s]);
const CONC = 6;
await Promise.all([...Array(CONC)].map(async () => { while (jobs.length) { const [u, s] = jobs.shift(); await check(u, s); } }));
await browser.close();
const summary = {};
issues.forEach((i) => { const k = i.replace(/^\[\w+\] \S+ — /, "").replace(/https?:\/\/\S+/, (m) => m.split("?")[0]).slice(0, 90); summary[k] = (summary[k] || 0) + 1; });
console.log(`checked ${done} page-renders (${urls.length} URLs × 2 sizes) · ${issues.length} issues`);
Object.entries(summary).sort((a, b) => b[1] - a[1]).slice(0, 40).forEach(([k, n]) => console.log(String(n).padStart(4), k));
fs.writeFileSync("audit.log", issues.join("\n"));
