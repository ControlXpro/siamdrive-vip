// QA: render pages headless, collect console errors, take screenshots.  node src/qa.mjs [path ...]
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
const require = createRequire(import.meta.url);
const puppeteer = require(path.join(process.env.APPDATA, "npm/node_modules/hyperframes/node_modules/puppeteer-core"));
const BASE = process.env.QA_BASE || "http://localhost:8790";
const OUT = process.env.QA_OUT || "C:/Users/LENOVO/AppData/Local/Temp/claude/C--Users-LENOVO/efc2f6be-b453-49de-af1d-c24e2234d32a/scratchpad/qa";
fs.mkdirSync(OUT, { recursive: true });
const urls = process.argv.slice(2).length ? process.argv.slice(2) : ["/"];
const sizes = (process.env.QA_SIZES || "desktop").split(",").map((s) => ({ desktop: [1440, 900, 1], mobile: [390, 844, 2] }[s]));
const browser = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: "new", args: ["--autoplay-policy=no-user-gesture-required", "--hide-scrollbars"] });
for (const u of urls) for (const [w, h, dpr] of sizes) {
  const page = await browser.newPage();
  const errs = [];
  page.on("console", (m) => m.type() === "error" && errs.push(m.text()));
  page.on("pageerror", (e) => errs.push("PAGEERROR " + e.message));
  page.on("requestfailed", (r) => errs.push("REQFAIL " + r.url()));
  await page.setViewport({ width: w, height: h, deviceScaleFactor: dpr > 1 ? 1 : 1, isMobile: w < 500, hasTouch: w < 500 });
  await page.evaluateOnNewDocument(() => sessionStorage.setItem("sd-seen", "1"));
  await page.goto(BASE + u, { waitUntil: "networkidle2", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 2200));
  // scroll through to trigger reveals
  const H = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < H; y += Math.round(h * 0.7)) { await page.evaluate((y) => window.scrollTo(0, y), y); await new Promise((r) => setTimeout(r, 160)); }
  await page.evaluate(() => window.scrollTo(0, 0)); await new Promise((r) => setTimeout(r, 900));
  const name = (u.replace(/\//g, "_") || "_home") + `-${w}`;
  const shot = process.env.QA_FULL ? { path: `${OUT}/${name}.png`, fullPage: true } : { path: `${OUT}/${name}.png` };
  await page.screenshot(shot);
  const info = await page.evaluate(() => ({ title: document.title, h1: document.querySelector("h1")?.innerText.replace(/\s+/g, " "), overflowX: document.documentElement.scrollWidth > innerWidth + 1, height: document.body.scrollHeight }));
  console.log(JSON.stringify({ u, w, ...info, errors: errs.slice(0, 5) }));
  await page.close();
}
await browser.close();
