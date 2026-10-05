import { createRequire } from "node:module"; import path from "node:path";
const require = createRequire(import.meta.url);
const puppeteer = require(path.join(process.env.APPDATA, "npm/node_modules/hyperframes/node_modules/puppeteer-core"));
const BASE = process.argv[2] || "http://localhost:8790";
const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: "new" });
const p = await b.newPage(); const errs = []; p.on("pageerror", (e) => errs.push(e.message)); p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
await p.setViewport({ width: 1440, height: 900 });
await p.goto(BASE + "/book/", { waitUntil: "networkidle2" }); await p.evaluate(() => localStorage.clear()); await p.reload({ waitUntil: "networkidle2" });
await new Promise((r) => setTimeout(r, 800));
const st = () => p.evaluate(() => ({
  total: document.querySelector(".qc-price b").textContent, lines: [...document.querySelectorAll(".qc-lines div")].map((d) => d.innerText.replace(/\s*\n\s*/g, " = ")),
  steps: [...document.querySelectorAll(".qc-step")].filter((s) => !s.hidden).map((s) => s.querySelector("h2").textContent),
  car: document.querySelector(".car-opt[aria-pressed=true] b")?.textContent, disabled: [...document.querySelectorAll(".car-opt[disabled] b")].map((x) => x.textContent) }));
const click = (sel) => p.evaluate((s) => document.querySelector(s).click(), sel);
const log = async (label) => console.log(label.padEnd(30), JSON.stringify(await st()));
await log("default");
await click('[data-group=service][data-value=protection]'); await log("driver+guards");
await click('[data-key=guards] [data-d="1"]'); await click('[data-bind=escort]'); await log("+1 guard +escort");
await click('[data-group=hours][data-value="5"]'); await log("half day");
await click('[data-group=service][data-value=airport]'); await click('[data-bind=ft]'); await log("airport BKK + fasttrack");
for (let i = 0; i < 2; i++) await click('[data-key=pax] [data-d="1"]'); await log("airport 4 pax");
for (let i = 0; i < 3; i++) await click('[data-key=pax] [data-d="1"]'); await log("7 pax (2 cars)");
await click('[data-group=service][data-value=intercity]'); await click('[data-group=trip][data-value=day]'); await log("hua? default dest day trip");
await click('[data-group=service][data-value=monthly]'); await log("monthly");
await click('[data-group=service][data-value=hourly]');
await p.evaluate(() => { const i = document.querySelector("[data-bind=name]"); i.value = "Test Guest"; i.dispatchEvent(new Event("input")); });
console.log("WA:\n" + decodeURIComponent(await p.$eval(".qc-send", (a) => a.href)).replace("https://wa.me/66962212364?text=", ""));
console.log("errors", errs); await b.close();
