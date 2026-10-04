/* SIAMDRIVE.VIP — interaction layer (GSAP + ScrollTrigger + Lenis) */
(() => {
  const d = document, html = d.documentElement;
  html.classList.remove("no-js");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const phone = matchMedia("(max-width: 720px)").matches;
  const $ = (s, c = d) => c.querySelector(s), $$ = (s, c = d) => [...c.querySelectorAll(s)];
  const hasGsap = !!window.gsap;
  if (hasGsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (!reduce && fine && window.Lenis) {
    lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    if (hasGsap) { lenis.on("scroll", ScrollTrigger.update); gsap.ticker.add((t) => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0); }
    else { const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf); }
  }
  $$('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
    const id = a.getAttribute("href"); if (id.length < 2) return;
    const t = $(id); if (!t) return; e.preventDefault();
    lenis ? lenis.scrollTo(t, { offset: -90 }) : t.scrollIntoView({ behavior: "smooth" });
  }));

  /* ---------- split text ---------- */
  const split = (el) => {
    const words = el.innerHTML.trim().split(/(\s+|<br\s*\/?>)/i).filter((w) => w.trim().length || /<br/i.test(w));
    el.innerHTML = words.map((w) => /<br/i.test(w) ? "<br>" : `<span class="line"><span>${w}</span></span>`).join(" ");
  };
  $$("[data-split]").forEach((el) => { el.classList.add("split"); split(el); });

  /* ---------- preloader ---------- */
  const pre = $(".preloader");
  const intro = () => {
    html.classList.add("ready");
    if (!hasGsap || reduce || phone) { if (pre) pre.remove(); $$("[data-split] .line>span").forEach((s) => (s.style.transform = "none")); return; }
    const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
    if (pre) tl.to(pre, { clipPath: "inset(0 0 100% 0)", duration: 1.1, ease: "expo.inOut", onComplete: () => pre.remove() });
    tl.from(".hero-media", { scale: 1.18, duration: 2.4 }, pre ? "-=.75" : 0)
      .from(".hero-word", { yPercent: 40, opacity: 0, duration: 2 }, "<.1")
      .from(".hero [data-split] .line>span, .phero [data-split] .line>span", { yPercent: 110, duration: 1.4, stagger: .06 }, "<.2")
      .from(".hero .eyebrow, .hero .lead, .hero-cta>*, .qb, .hero-strip>div, .phero .eyebrow, .phero .lead, .phero-meta>*, .crumbs", { y: 28, opacity: 0, duration: 1.2, stagger: .05 }, "<.25");
  };
  if (pre && !phone) {
    const seen = sessionStorage.getItem("sd-seen");
    const cnt = $(".pl-count"); let n = 0;
    const total = seen ? 350 : 1500, start = performance.now();
    const tick = (t) => { n = Math.min(100, Math.round(((t - start) / total) * 100)); if (cnt) cnt.textContent = String(n).padStart(3, "0") + " %"; if (n < 100) requestAnimationFrame(tick); else { sessionStorage.setItem("sd-seen", 1); intro(); } };
    requestAnimationFrame(tick);
  } else intro();

  /* ---------- reveals ---------- */
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((ents) => ents.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -10% 0px" });
    $$("[data-reveal], .img-reveal").forEach((el, i) => { el.style.transitionDelay = (el.dataset.delay || 0) + "s"; io.observe(el); });
  } else $$("[data-reveal]").forEach((el) => el.classList.add("in"));
  if (hasGsap && !reduce) {
    $$("main [data-split]").forEach((el) => {
      if (el.closest(".hero, .phero")) return;
      gsap.from($$(".line>span", el), { yPercent: 110, duration: 1.3, ease: "expo.out", stagger: .05, scrollTrigger: { trigger: el, start: "top 88%" } });
    });
    // word-by-word statement
    $$(".statement p").forEach((p) => {
      p.innerHTML = p.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(" ");
      gsap.to($$(".w", p), { opacity: 1, stagger: .08, ease: "none", scrollTrigger: { trigger: p, start: "top 80%", end: "bottom 45%", scrub: true } });
    });
    // parallax media
    $$("[data-parallax]").forEach((el) => gsap.fromTo(el, { yPercent: -8 }, { yPercent: 8, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true } }));
    // hero word drift
    if ($(".hero-word")) gsap.to(".hero-word", { xPercent: -14, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
    // stacked cards depth
    $$(".scard").forEach((c, i, all) => { if (i === all.length - 1) return; gsap.to(c, { scale: .94, opacity: .55, ease: "none", scrollTrigger: { trigger: all[i + 1], start: "top bottom", end: "top 20%", scrub: true } }); });
    // fleet rail (pinned horizontal scroll on desktop)
    const rail = $(".rail");
    if (rail && innerWidth > 900) {
      const prog = $(".rail-progress i");
      const dist = () => rail.scrollWidth - innerWidth;
      gsap.to(rail, { x: () => -dist(), ease: "none", scrollTrigger: { trigger: ".rail-wrap", start: "top 12%", end: () => "+=" + dist(), pin: ".rail-pin", scrub: 1, invalidateOnRefresh: true, onUpdate: (s) => prog && (prog.style.width = s.progress * 100 + "%") } });
    } else if (rail) { rail.parentElement.style.overflowX = "auto"; }
    // counters
    $$("[data-count]").forEach((el) => { const v = +el.dataset.count; const o = { n: 0 }; gsap.to(o, { n: v, duration: 2, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%" }, onUpdate: () => (el.textContent = Math.round(o.n).toLocaleString("en-US")) }); });
    // route map draw
    $$(".rmap .path").forEach((p) => { const L = p.getTotalLength(); gsap.fromTo(p, { strokeDashoffset: L }, { strokeDashoffset: 0, duration: 2.4, ease: "power2.inOut", scrollTrigger: { trigger: p.closest("svg"), start: "top 85%" } }); });
  } else { const r = $(".rail"); if (r) r.parentElement.style.overflowX = "auto"; }

  /* ---------- header hide on scroll ---------- */
  const hdr = $(".hdr"); let lastY = 0;
  const mbar = $(".mbar");
  const onScroll = () => {
    const y = scrollY;
    if (hdr && !html.classList.contains("menu-open")) hdr.classList.toggle("hide", y > lastY && y > 300);
    if (mbar) mbar.classList.toggle("on", y > 500);
    lastY = y;
  };
  addEventListener("scroll", onScroll, { passive: true });

  /* ---------- menu ---------- */
  const mb = $(".menu-btn");
  mb && mb.addEventListener("click", () => {
    const open = html.classList.toggle("menu-open");
    mb.setAttribute("aria-expanded", open);
    open ? lenis && lenis.stop() : lenis && lenis.start();
  });
  $$(".menu a").forEach((a) => a.addEventListener("click", () => { html.classList.remove("menu-open"); lenis && lenis.start(); }));
  const mm = $(".menu-media img");
  $$(".menu-list a[data-img]").forEach((a) => a.addEventListener("mouseenter", () => { if (mm) mm.src = a.dataset.img; }));

  /* ---------- custom cursor + magnetic ---------- */
  if (fine && !reduce) {
    const c = d.createElement("div"); c.className = "cursor"; c.innerHTML = '<div class="c-dot"></div><div class="c-ring"><span class="c-label"></span></div>'; d.body.appendChild(c);
    const dot = $(".c-dot", c), ring = $(".c-ring", c), label = $(".c-label", c);
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; dot.style.transform = `translate(${mx}px,${my}px)`; });
    const loop = () => { rx += (mx - rx) * .16; ry += (my - ry) * .16; ring.style.transform = `translate(${rx}px,${ry}px)`; requestAnimationFrame(loop); }; loop();
    d.addEventListener("mouseover", (e) => {
      const t = e.target.closest("[data-cursor]"), a = e.target.closest("a,button,select,input,summary");
      c.classList.toggle("is-label", !!t); label.textContent = t ? t.dataset.cursor : "";
      c.classList.toggle("is-hover", !t && !!a);
    });
    $$(".btn,.menu-btn,[data-magnetic]").forEach((b) => {
      b.addEventListener("mousemove", (e) => { const r = b.getBoundingClientRect(); const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2; b.style.transform = `translate(${x * .18}px,${y * .28}px)`; });
      b.addEventListener("mouseleave", () => (b.style.transform = ""));
    });
    // hover image follower for service lists
    const lists = $$(".svc-list[data-follow]");
    if (lists.length) {
      const f = d.createElement("div"); f.className = "follower"; d.body.appendChild(f);
      const imgs = {};
      let fx = 0, fy = 0, tx = 0, ty = 0;
      lists.forEach((l) => $$("a[data-img]", l).forEach((a) => {
        const src = a.dataset.img; if (!imgs[src]) { const i = new Image(); i.src = src; i.alt = ""; f.appendChild(i); imgs[src] = i; }
        a.addEventListener("mouseenter", () => { f.classList.add("on"); Object.values(imgs).forEach((i) => i.classList.toggle("on", i === imgs[src])); });
        a.addEventListener("mouseleave", () => f.classList.remove("on"));
      }));
      addEventListener("mousemove", (e) => { tx = e.clientX + 190; ty = e.clientY; });
      const fl = () => { fx += (tx - fx) * .12; fy += (ty - fy) * .12; f.style.left = fx + "px"; f.style.top = fy + "px"; requestAnimationFrame(fl); }; fl();
    }
  }

  /* ---------- Bangkok live clock ---------- */
  const clocks = $$("[data-bkk-clock]");
  if (clocks.length) {
    const f = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Bangkok", hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const up = () => clocks.forEach((c) => (c.textContent = f.format(new Date()))); up(); setInterval(up, 1000);
  }

  /* ---------- videos: play only in view ---------- */
  const vids = $$("video[data-autoplay]");
  if (vids.length && "IntersectionObserver" in window) {
    const vo = new IntersectionObserver((ents) => ents.forEach((e) => { const v = e.target; if (e.isIntersecting) { v.play().catch(() => {}); } else v.pause(); }), { threshold: .1 });
    const go = () => vids.forEach((v) => { v.muted = true; vo.observe(v); });
    document.readyState === "complete" ? setTimeout(go, 300) : addEventListener("load", () => setTimeout(go, 300), { once: true });
  }

  /* ---------- quick-book (home hero) ---------- */
  const qb = $(".qb");
  if (qb && window.SD) {
    const P = window.SD, fmt = (n) => n.toLocaleString("en-US");
    const tabs = $$(".qb-tabs button", qb), sel = (n) => $(`[name=${n}]`, qb);
    let mode = "driver";
    const groups = $$("[data-mode]", qb);
    const setMode = (m) => { mode = m; tabs.forEach((t) => t.setAttribute("aria-selected", t.dataset.tab === m)); groups.forEach((g) => (g.hidden = !g.dataset.mode.split(" ").includes(m))); calc(); };
    tabs.forEach((t) => t.addEventListener("click", () => setMode(t.dataset.tab)));
    const calc = () => {
      const v = P.vehicles.find((x) => x.slug === sel("vehicle").value) || P.vehicles[0];
      const h = sel("hours").value, car = h === "10" ? v.price.bkk10 : v.price.bkk5;
      let price = car, label = `Private driver · ${h} hours`;
      const q = new URLSearchParams({ vehicle: v.slug });
      if (mode === "driver") { q.set("service", "hourly"); q.set("hours", h); }
      if (mode === "guards") {
        const g = +sel("guards").value; price = car + g * (h === "10" ? P.bodyguard.h10 : P.bodyguard.h5);
        label = `Driver + ${g} bodyguard${g > 1 ? "s" : ""} · ${h} hours`; q.set("service", "protection"); q.set("hours", h); q.set("guards", g);
      }
      if (mode === "airport") { price = v.price.airport; label = "Airport transfer"; q.set("service", "airport"); }
      $(".qb-price b", qb).textContent = fmt(price) + " THB";
      $(".qb-price small", qb).textContent = label + " · " + v.name;
      if (sel("date") && sel("date").value) q.set("date", sel("date").value);
      $(".qb-go", qb).href = "/book/?" + q.toString();
    };
    $$("select,input", qb).forEach((i) => i.addEventListener("change", calc));
    setMode("driver");
  }

  /* refresh triggers once fonts/images settle */
  addEventListener("load", () => hasGsap && window.ScrollTrigger && ScrollTrigger.refresh());
})();
