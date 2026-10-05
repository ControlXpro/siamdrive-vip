import { createRequire } from "node:module"; import path from "node:path";
const require = createRequire(import.meta.url);
const puppeteer = require(path.join(process.env.APPDATA, "npm/node_modules/hyperframes/node_modules/puppeteer-core"));
const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: "new" });
const OUT = "C:/Users/LENOVO/AppData/Local/Temp/claude/C--Users-LENOVO/efc2f6be-b453-49de-af1d-c24e2234d32a/scratchpad/qa/";
for (const w of [1024, 1101, 1180, 1280, 1366, 1440, 1536, 1600, 1920]) {
  const p = await b.newPage(); await p.setViewport({ width: w, height: 800 });
  await p.goto("https://siamdrive.vip/private-driver/", { waitUntil: "networkidle2" }); await new Promise((r) => setTimeout(r, 1800));
  const r = await p.evaluate(() => {
    const links = [...document.querySelectorAll(".nav-links a")].filter((a) => a.offsetParent);
    const wrapped = links.filter((a) => a.getBoundingClientRect().height > 46).map((a) => a.textContent);
    const st = document.querySelector(".hdr .status"); const stv = st && st.offsetParent ? Math.round(st.getBoundingClientRect().height) : 0;
    const pill = document.querySelector(".pill").getBoundingClientRect(), right = document.querySelector(".hdr-right").getBoundingClientRect();
    return { navShown: links.length, wrapped, statusH: stv, pillH: Math.round(pill.height), overlap: pill.right > right.left - 4, rightEdge: Math.round(right.right), vw: innerWidth };
  });
  console.log(w, JSON.stringify(r));
  if ([1101, 1280, 1440].includes(w)) await p.screenshot({ path: OUT + `nav-${w}.png`, clip: { x: 0, y: 0, width: w, height: 110 } });
  await p.close();
}
await b.close();
