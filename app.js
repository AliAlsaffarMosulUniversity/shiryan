/* شريان — نسخة تجريبية تعمل بحالات وهمية (لا يوجد خادم بعد) */
(function () {
  "use strict";
  const P = {
    home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
    pulse: '<path d="M3 12h4l2-5 4 10 2-5h6"/>',
    bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 21h4"/>',
    sliders: '<path d="M4 7h9"/><path d="M17 7h3"/><path d="M4 17h3"/><path d="M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
    pin: '<path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    car: '<path d="M5 16V11l2-5h10l2 5v5"/><path d="M3 16h18v3H3z"/>',
    hosp: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M12 8v8"/><path d="M8 12h8"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    back: '<path d="M9 6l6 6-6 6"/>',
    fwd: '<path d="M15 6l-6 6 6 6"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z"/>',
    map: '<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14"/><path d="M15 6v14"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
    mute: '<path d="M6 16V11a6 6 0 0 1 9.5-4.9"/><path d="M18 11v5l2 2H8"/><path d="M3 3l18 18"/>',
    share: '<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.2 10.8l7.6-3.6"/><path d="M8.2 13.2l7.6 3.6"/>',
    cal: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16"/><path d="M9 3v4"/><path d="M15 3v4"/>',
    heart: '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>',
    drop: '<path d="M12 3s6.5 7.2 6.5 11.5a6.5 6.5 0 0 1-13 0C5.5 10.2 12 3 12 3z"/>',
    play: '<path d="M8 5v14l11-7z" fill="currentColor"/>'
  };
  const ic = (k, s = 24, w = 1.8) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[k]}</svg>`;
  const drop = (t, size, fill, fg, fs) => `<div class="drop" style="width:${size}px;height:${size}px"><svg width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.2s7.2 8 7.2 12.8a7.2 7.2 0 0 1-14.4 0C4.8 10.2 12 2.2 12 2.2z" fill="${fill}"/></svg><span style="color:${fg};font-size:${fs}px;padding-bottom:${Math.round(size * .2)}px">${t}</span></div>`;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const store = {
    get(k, d) { try { const v = localStorage.getItem("sh:" + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("sh:" + k, JSON.stringify(v)); } catch (e) {} }
  };
  const DEF = { name: "", blood: "O−", available: true, radius: 5, dnd: true, vib: "heart", flash: true, sound: true, quiet: false, lastDonation: 0 };
  let S = Object.assign({}, DEF, store.get("s", {}));
  const save = () => store.set("s", S);
  const DAY = 864e5, WAIT_DAYS = 90;
  const daysLeft = () => S.lastDonation ? Math.max(0, Math.ceil((S.lastDonation + WAIT_DAYS * DAY - Date.now()) / DAY)) : 0;

  /* القائمة في ملف hospitals.js. المسافات تجريبية لحين ربط المواقع الحقيقية */
  const HOSP = HOSPITALS.map((h, i) => {
    const dist = Math.round((2.5 + ((i * 37) % 60) / 10) * 10) / 10;
    return Object.assign({ id: "h" + (i + 1), dist, drive: Math.round(dist * 2.6), need: h.type === "مصرف دم" ? 4 : 2 + (i % 2) }, h);
  });
  function cases() {
    let c = store.get("cases", null);
    if (!c) {
      const now = Date.now();
      c = HOSP.filter((h) => h.dist <= 5).slice(1, 3).map((h, i) => ({ h: h.id, crit: false, deadline: now + (3 + i * 2) * 3600e3, got: i ? 0 : 1 }));
      store.set("cases", c);
    }
    return c.filter((x) => x.deadline > Date.now()).map((x) => Object.assign({}, HOSP.find((h) => h.id === x.h), x));
  }
  const inbox = () => store.get("inbox", [
    { t: "تم تأمين العدد الكافي من المتبرعين", d: "حالة سابقة في مستشفى ابن سينا التعليمي، لا حاجة للحضور. شكراً لاستعدادك.", k: "covered", at: Date.now() - 2 * 3600e3 },
    { t: "فصيلتك مطلوبة بكثرة هذا الأسبوع", d: "بنوك الدم في منطقتك تحتاج متبرعين من فصيلتك.", k: "info", at: Date.now() - 3 * DAY }
  ]);
  const pushInbox = (n) => { const l = inbox(); l.unshift(Object.assign({ at: Date.now() }, n)); store.set("inbox", l.slice(0, 30)); };
  const ago = (t) => { const m = Math.round((Date.now() - t) / 6e4); return m < 1 ? "الآن" : m < 60 ? `قبل ${m} دقيقة` : m < 1440 ? `قبل ${Math.round(m / 60)} ساعة` : `قبل ${Math.round(m / 1440)} يوم`; };
  const clock = (t) => new Date(t).toLocaleTimeString("ar-IQ", { hour: "2-digit", minute: "2-digit" });
  function toast(m) { const t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); t.textContent = m; document.body.appendChild(t); setTimeout(() => t.remove(), 2800); }

  const $m = document.getElementById("main"), $nav = document.getElementById("nav");
  let timers = [];
  const every = (fn, ms) => { fn(); timers.push(setInterval(fn, ms)); };
  const TABS = [["home", "home", "الرئيسية"], ["inbox", "bell", "التنبيهات"], ["track", "heart", "أثر تبرعي"], ["settings", "sliders", "الإعدادات"]];
  function nav(a) { $nav.innerHTML = `<div class="in">${TABS.map(([r, i, l]) => `<a href="#/${r}"${r === a ? ' aria-current="page"' : ""}>${ic(i)}<span>${l}</span></a>`).join("")}</div>`; }
  const top = (back, t, sub) => `<div class="row"><a class="icb" href="${back}" aria-label="رجوع">${ic("back")}</a><div><h1>${t}</h1>${sub ? `<p class="mu">${sub}</p>` : ""}</div></div>`;

  function route() {
    timers.forEach(clearInterval); timers = [];
    const r = (location.hash.replace(/^#\/?/, "") || "home").split("/")[0];
    const V = { home, alert, check, route: routeV, track, inbox: inboxV, settings, hospitals };
    const full = ["alert", "check", "route"].includes(r);
    document.body.classList.toggle("full", full);
    document.body.classList.toggle("alerting", r === "alert");
    (V[r] || home)();
    nav(V[r] ? (full ? "" : r === "hospitals" ? "home" : r) : "home");
    window.scrollTo(0, 0);
  }

  // ---------- تنبيه طارئ (محاكاة) ----------
  let audioCtx = null;
  function beep() {
    if (!S.sound) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      [0, .35, .7].forEach((d) => {
        const o = audioCtx.createOscillator(), g = audioCtx.createGain();
        o.frequency.value = 880; o.type = "square"; g.gain.value = .12;
        o.connect(g); g.connect(audioCtx.destination);
        o.start(audioCtx.currentTime + d); o.stop(audioCtx.currentTime + d + .2);
      });
    } catch (e) {}
  }
  function triggerEmergency() {
    const now = Date.now();
    const pool = HOSP.filter((h) => h.dist <= S.radius);
    const H = (pool.length ? pool : HOSP)[Math.floor(Math.random() * (pool.length || HOSP.length))];
    const c = store.get("cases", []).filter((x) => x.h !== H.id);
    c.unshift({ h: H.id, crit: true, deadline: now + 45 * 6e4, got: 1 });
    store.set("cases", c);
    store.set("active", H.id);
    pushInbox({ t: `مطلوب ${S.blood} في ${H.name}`, d: `حالة حرجة، ${H.dist} كم، مطلوب خلال 45 دقيقة`, k: "crit" });
    if (navigator.vibrate) navigator.vibrate(S.vib === "heart" ? [120, 90, 160, 700, 120, 90, 160, 700, 120, 90, 160] : [1200, 200, 1200, 200, 1200]);
    beep();
    if (S.flash) { const f = document.createElement("div"); f.className = "flash"; document.body.appendChild(f); setTimeout(() => f.remove(), 1600); }
    if ("Notification" in window && Notification.permission === "granted" && navigator.serviceWorker) {
      navigator.serviceWorker.ready.then((reg) => reg.showNotification("شريان: حالة طارئة", {
        body: `مريض بحاجة عاجلة لفصيلة ${S.blood} في ${H.name}، ${H.dist} كم`,
        icon: "icons/icon-192.png", badge: "icons/icon-192.png", tag: "emergency", renotify: true, requireInteraction: true,
        vibrate: [120, 90, 160, 700, 120, 90, 160], dir: "rtl", lang: "ar",
        actions: [{ action: "accept", title: "أستطيع التبرع" }, { action: "decline", title: "لا أستطيع" }]
      })).catch(() => {});
    }
    location.hash = "#/alert";
  }

  // ---------- الرئيسية ----------
  function home() {
    const dl = daysLeft();
    const list = S.available && !dl ? cases().filter((c) => c.dist <= S.radius) : [];
    $m.innerHTML = `
      <div class="row between"><div class="row" style="gap:8px;color:var(--red)">${ic("pulse", 28, 2.2)}<h1 style="font-size:26px;color:var(--ink)">شريان</h1></div>
        <a class="icb" href="#/inbox" aria-label="التنبيهات">${ic("bell")}${inbox().some((n) => n.k === "crit" && Date.now() - n.at < 36e5) ? '<span class="dot"></span>' : ""}</a></div>
      <section class="card" style="display:flex;flex-direction:column;gap:16px;border-radius:26px">
        <div class="row" style="gap:16px">${drop(esc(S.blood), 84, "var(--red)", "#fff", 24)}
          <div style="display:flex;flex-direction:column;gap:4px"><span class="mu">فصيلة دمك</span>
            <span style="font-family:var(--disp);font-size:20px;font-weight:700">مرحباً${S.name ? "، " + esc(S.name) : ""}</span>
            ${dl ? `<span class="pill" style="background:#F4F5F7;color:var(--mu)">${ic("clock", 14)}تبرعت مؤخراً، متاح بعد ${dl} يوماً</span>`
              : `<span class="pill" style="background:var(--bluel);color:var(--blue)">${ic("check", 14, 2.4)}جاهز للتبرع</span>`}</div></div>
        <label class="toggle" style="padding:0 14px;border-radius:16px;background:var(--bg)"><span><b style="font-size:14px">متاح لتلقي الحالات الطارئة</b><br><span class="mu" style="font-size:12px">ضمن ${S.radius} كم من موقعك</span></span>
          <input type="checkbox" id="av"${S.available ? " checked" : ""}></label>
      </section>
      <section style="display:flex;flex-direction:column;gap:10px"><div class="row between"><h2>حالات قريبة تطابق فصيلتك</h2></div>
        ${list.length ? list.map((c) => `<a class="case${c.crit ? " crit" : ""}" href="#/alert" data-h="${c.id}">
          <div class="bt" style="background:${c.crit ? "var(--red)" : "var(--redl)"};color:${c.crit ? "#fff" : "var(--red)"}">${esc(S.blood)}</div>
          <div style="flex:1;display:flex;flex-direction:column;gap:4px"><b style="font-size:15px">${c.name}</b>
            <span class="meta"><span>${ic("pin", 14)}${c.dist} كم</span><span>${ic("clock", 14)}<span class="left" data-dl="${c.deadline}"></span></span></span></div>
          <span class="pill" style="background:${c.crit ? "var(--red)" : "#F4F5F7"};color:${c.crit ? "#fff" : "var(--mu)"}">${c.crit ? "حرجة" : "عاجلة"}</span></a>`).join("")
          : `<div class="empty">${!S.available ? "أنت غير متاح حالياً. فعّل الزر أعلاه لتصلك الحالات." : dl ? "شكراً لتبرعك. ستصلك الحالات بعد انتهاء فترة الراحة." : "لا توجد حالات مطابقة قريبة الآن. سننبّهك فور ظهور حالة."}</div>`}
      </section>
      ${store.get("donation", null) ? `<a class="lastcard" href="#/track"><div><span style="font-size:13px;color:#E8C5CC">آخر تبرع لك</span><br><b style="font-size:16px">شاهد رحلة تبرعك</b></div><span class="icb" style="background:#4A1420;border:0;color:#fff">${ic("fwd", 20)}</span></a>` : ""}
      <a class="note" href="#/hospitals"><span class="ic" style="background:var(--redl);color:var(--red)">${ic("hosp", 22)}</span>
        <span style="display:flex;flex-direction:column;gap:3px;flex:1"><b style="font-size:14px">مستشفيات الموصل المشتركة</b><span class="mu">${HOSP.filter((h) => h.type === "حكومي").length} حكومي، ${HOSP.filter((h) => h.type === "أهلي").length} أهلي، ومصرف الدم</span></span><span style="align-self:center;color:var(--mu)">${ic("fwd", 20)}</span></a>
      <section class="card demo" style="display:flex;flex-direction:column;gap:10px">
        <b style="font-size:14px">عرض تجريبي</b>
        <p class="mu" style="line-height:1.8">اضغط الزر وأبعد يدك عن الهاتف، مع إبقاء التطبيق مفتوحاً. بعد 5 ثوانٍ تصل حالة طارئة وهمية.</p>
        <button class="btn p sm" id="sim">${ic("bell", 20)}محاكاة حالة طارئة</button>
      </section>`;
    $m.querySelector("#av").addEventListener("change", (e) => { S.available = e.target.checked; save(); home(); });
    $m.querySelectorAll("[data-h]").forEach((a) => a.addEventListener("click", () => store.set("active", a.dataset.h)));
    $m.querySelector("#sim").addEventListener("click", (e) => {
      if (!S.available) { toast("فعّل زر الإتاحة أولاً"); return; }
      if (daysLeft()) { S.lastDonation = 0; save(); }
      if ("Notification" in window && Notification.permission === "default") Notification.requestPermission();
      e.target.disabled = true; e.target.textContent = "ستصل الحالة خلال 5 ثوانٍ…";
      setTimeout(triggerEmergency, 5000);
    });
    every(() => $m.querySelectorAll(".left").forEach((s) => { const m = Math.max(0, Math.round((+s.dataset.dl - Date.now()) / 6e4)); s.textContent = m >= 120 ? `مطلوب خلال ${Math.round(m / 60)} ساعات` : `مطلوب خلال ${m} دقيقة`; }), 15000);
  }

  const activeCase = () => { const id = store.get("active", "h1"); return cases().find((c) => c.id === id) || Object.assign({}, HOSP[0], { deadline: Date.now() + 45 * 6e4, crit: true, got: 1 }); };

  // ---------- شاشة التنبيه ----------
  function alert() {
    const c = activeCase();
    $m.innerHTML = `<div class="alert">
      <div class="row between"><span class="pill" style="background:var(--red);color:#fff;font-size:13px;padding:6px 12px">${ic("bell", 16, 2.2)}${c.crit ? "تنبيه طوارئ" : "حالة عاجلة"}</span>
        <span class="row" style="gap:6px;font-size:12px;color:#E8C5CC">${ic("mute", 16)}يعمل رغم الوضع الصامت</span></div>
      <div class="rings"><i></i><i></i><i></i><div style="position:relative">${drop(esc(S.blood), 104, "#fff", "var(--red)", 30)}</div></div>
      <div style="text-align:center"><h1 style="font-size:28px;line-height:1.35">مريض بحاجة عاجلة<br>لفصيلة دمك</h1><p style="font-size:14px;color:#E8C5CC;margin-top:6px">أنت من أقرب المتبرعين المطابقين</p></div>
      <div style="background:var(--deep2);border-radius:20px;padding:14px 16px;display:flex;flex-direction:column;gap:10px">
        <div class="row" style="gap:10px;font-size:16px;font-weight:700">${ic("hosp", 22)}${c.name}، بنك الدم</div>
        <div class="stats"><div>${ic("pin", 18)}<b>${c.dist} كم</b><small>المسافة</small></div><div>${ic("car", 18)}<b>${c.drive} د</b><small>بالسيارة</small></div>
          <div>${ic("clock", 18)}<b id="cd">—</b><small>مطلوب خلال</small></div></div>
      </div>
      <div style="flex:1"></div>
      <a class="btn l" href="#/check" style="min-height:60px;font-size:17px">${ic("drop", 20)}أستطيع التبرع الآن</a>
      <button class="btn g" id="dec">لا أستطيع الآن</button>
      <p class="row" style="justify-content:center;gap:6px;font-size:12px;color:#E8C5CC;text-align:center">${ic("shield", 14)}لا يُشارَك موقعك مع المستشفى إلا بعد موافقتك</p></div>`;
    every(() => { const m = Math.max(0, Math.round((c.deadline - Date.now()) / 6e4)); const el = $m.querySelector("#cd"); if (el) el.textContent = m >= 120 ? Math.round(m / 60) + " س" : m + " د"; }, 10000);
    $m.querySelector("#dec").addEventListener("click", () => { toast("شكراً، سنبلغ متبرعاً آخر"); location.hash = "#/home"; });
  }

  // ---------- تأكيد الأهلية ----------
  function check() {
    const Q = ["هل مرّ أكثر من 3 أشهر على آخر تبرع لك؟", "هل تشعر بصحة جيدة اليوم؟", "هل تناولت طعاماً خلال آخر 4 ساعات؟"];
    const a = [null, null, null];
    function draw() {
      const done = a.filter((x) => x !== null).length, anyNo = a.includes("no"), allYes = a.every((x) => x === "yes");
      $m.innerHTML = `${top("#/alert", "تأكيد سريع قبل الانطلاق", "3 أسئلة، تستغرق 10 ثوانٍ")}
        <div class="steps" aria-hidden="true">${Q.map((_, i) => `<i class="${i < Math.max(1, done) ? "on" : ""}"></i>`).join("")}</div>
        ${Q.map((q, i) => `<fieldset><legend>${q}</legend><div class="yn">
          <button class="y" data-i="${i}" data-v="yes" aria-pressed="${a[i] === "yes"}">نعم</button>
          <button class="n" data-i="${i}" data-v="no" aria-pressed="${a[i] === "no"}">لا</button></div></fieldset>`).join("")}
        ${anyNo ? `<p class="warn" role="status">لا بأس، سنبلغ المستشفى ليتواصل مع متبرع آخر. شكراً لاستجابتك.</p>` : ""}
        <p class="row mu" style="gap:8px;font-size:12px;line-height:1.8;align-items:flex-start">${ic("shield", 16)}الفحص الطبي النهائي يُجريه بنك الدم في المستشفى.</p>
        <div style="flex:1"></div>
        <button class="btn p" id="go"${allYes ? "" : " disabled"}>${ic("car", 20)}انطلق إلى المستشفى</button>
        <button class="btn o" id="no">لا أستطيع، أبلغ المستشفى</button>`;
      $m.querySelectorAll("[data-i]").forEach((b) => b.addEventListener("click", () => { a[+b.dataset.i] = b.dataset.v; draw(); }));
      $m.querySelector("#go").addEventListener("click", () => {
        const c = activeCase();
        store.set("donation", { h: c.id, name: c.name, accepted: Date.now(), arrived: 0 });
        location.hash = "#/route";
      });
      $m.querySelector("#no").addEventListener("click", () => { toast("تم إبلاغ المستشفى، شكراً لك"); location.hash = "#/home"; });
    }
    draw();
  }

  // ---------- الطريق ----------
  function qr(seed, n = 21) {
    let x = seed, s = `<svg width="126" height="126" viewBox="0 0 ${n} ${n}" role="img" aria-label="رمز الوصول" shape-rendering="crispEdges"><rect width="${n}" height="${n}" fill="#fff"/>`;
    const rnd = () => ((x = (x * 9301 + 49297) % 233280) / 233280);
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      if ((i < 8 && j < 8) || (i < 8 && j > n - 9) || (i > n - 9 && j < 8)) continue;
      if (rnd() < .47) s += `<rect x="${j}" y="${i}" width="1" height="1" fill="#1A1D26"/>`;
    }
    const f = (a, b) => `<rect x="${a}" y="${b}" width="7" height="7" fill="#1A1D26"/><rect x="${a + 1}" y="${b + 1}" width="5" height="5" fill="#fff"/><rect x="${a + 2}" y="${b + 2}" width="3" height="3" fill="#1A1D26"/>`;
    return s + f(0, 0) + f(n - 7, 0) + f(0, n - 7) + "</svg>";
  }
  function routeV() {
    const c = activeCase(), d = store.get("donation", { accepted: Date.now() });
    const q = encodeURIComponent(c.name + " الموصل");
    $m.innerHTML = `${top("#/check", "في الطريق إلى المستشفى", c.name + "، بنك الدم")}
      <div class="timer" role="status"><span class="row" style="gap:8px;font-size:14px;font-weight:600">${ic("clock", 18)}المستشفى بانتظارك</span><b id="cd">—</b></div>
      <div class="map"><svg viewBox="0 0 350 250" role="img" aria-label="خريطة المسار"><rect width="350" height="250" fill="#E9EBEF"/>
        <path d="M0 70h350M0 160h350M80 0v250M200 0v250M290 0v250" stroke="#fff" stroke-width="14"/><path d="M0 115h350M140 0v250M250 0v250" stroke="#fff" stroke-width="6"/>
        <rect x="210" y="170" width="70" height="70" rx="6" fill="#DDE7DA"/><path d="M0 215 Q120 190 200 250" stroke="#CFE0F0" stroke-width="18" fill="none"/>
        <path class="route" d="M60 205 L80 205 L80 160 L200 160 L200 70 L270 70" stroke="#C8102E" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="60" cy="205" r="11" fill="#1F5AA6" stroke="#fff" stroke-width="4"/><rect x="258" y="44" width="28" height="28" rx="8" fill="#C8102E"/><path d="M272 50v16M264 58h16" stroke="#fff" stroke-width="3"/></svg>
        <span class="tag">${c.dist} كم، ${c.drive} دقيقة</span></div>
      <div class="grid2"><a class="btn o sm" href="https://www.google.com/maps/dir/?api=1&destination=${q}" target="_blank" rel="noopener">${ic("map", 20)}افتح الخرائط</a>
        <button class="btn o sm" id="call">${ic("phone", 20)}اتصل ببنك الدم</button></div>
      <section class="card qr"><div class="box">${qr(d.accepted % 233280)}</div>
        <div style="display:flex;flex-direction:column;gap:6px"><h2 style="font-size:16px">رمز الوصول</h2><p class="mu" style="line-height:1.8">اعرضه لموظف بنك الدم عند الوصول، فيبدأ تتبّع تبرعك تلقائياً.</p></div></section>
      <div style="flex:1"></div>
      <button class="btn p" id="arr">${ic("check", 20)}وصلت إلى المستشفى</button>`;
    every(() => { const m = Math.max(0, Math.round((c.deadline - Date.now()) / 6e4)); $m.querySelector("#cd").textContent = m >= 120 ? Math.round(m / 60) + " ساعة" : m + " د"; }, 10000);
    $m.querySelector("#call").addEventListener("click", () => toast("رقم بنك الدم يُضاف في النسخة الكاملة"));
    $m.querySelector("#arr").addEventListener("click", () => {
      const dn = store.get("donation", {}); dn.arrived = Date.now(); store.set("donation", dn);
      location.hash = "#/track";
    });
  }

  // ---------- أثر التبرع ----------
  function track() {
    const d = store.get("donation", null);
    if (!d) {
      $m.innerHTML = `${top("#/home", "أثر تبرعك")}<div class="empty">لم تتبرع عبر شريان بعد.<br>عندما تستجيب لحالة، ستتابع هنا رحلة تبرعك خطوة بخطوة.</div>`;
      return;
    }
    const STEP_MS = 6000; // في العرض التجريبي كل مرحلة 6 ثوانٍ
    const labels = ["قبلتَ الحالة", "وصلتَ إلى بنك الدم", "تم سحب وحدة الدم", "فُحصت الوحدة وطوبقت مع المريض", "تبرعك وصل الآن للمستشفى", "رسالة شكر من الفريق الطبي"];
    function draw() {
      let stage = 0, times = [d.accepted];
      if (d.arrived) {
        const el = Math.floor((Date.now() - d.arrived) / STEP_MS);
        stage = Math.min(5, 1 + el);
        for (let i = 1; i <= stage; i++) times[i] = d.arrived + (i - 1) * STEP_MS;
      }
      if (stage >= 4 && !d.thanked) {
        d.thanked = true; store.set("donation", d);
        S.lastDonation = Date.now(); save();
        store.set("cases", store.get("cases", []).filter((x) => x.h !== d.h));
        pushInbox({ t: "تبرعك وصل للمستشفى", d: "اضغط لمشاهدة رحلة تبرعك.", k: "done" });
        if (navigator.vibrate) navigator.vibrate([60, 60, 60]);
      }
      const heroTxt = !d.arrived ? "في الطريق إلى بنك الدم" : stage >= 4 ? "تبرعك وصل الآن للمستشفى، وهو في طريقه للمريض" : labels[stage];
      $m.innerHTML = `${top("#/home", "أثر تبرعك", "تبرع اليوم، " + esc(d.name))}
        <section class="hero"><span class="row" style="gap:6px;font-size:13px;color:#FBE7EA">${ic("pulse", 18, 2.2)}تحديث مباشر</span><p>${heroTxt}</p></section>
        <ol class="tl" aria-label="مراحل التبرع">${labels.map((l, i) => {
          const st = i < stage || (i === stage && stage === 5) ? "done" : i === stage ? "now" : "wait";
          const last = i === labels.length - 1;
          return `<li><div class="rail"><span class="d ${st}">${st === "done" ? ic("check", 16, 2.6) : ""}</span>${last ? "" : `<span class="ln ${i < stage ? "done" : ""}"></span>`}</div>
            <div class="tx ${st}"><b>${i === 5 && stage === 5 ? "شكراً لك، أنت جزء من إنقاذ حياة" : l}</b><span class="mu" style="font-size:12px">${times[i] ? clock(times[i]) : "لاحقاً"}</span></div></li>`;
        }).join("")}</ol>
        <p class="row mu" style="gap:8px;font-size:12px;line-height:1.8;align-items:flex-start">${ic("shield", 16)}لا نعرض أي معلومة عن هوية المريض، حفاظاً على خصوصيته.</p>
        ${stage >= 4 ? `<div class="next"><span><span style="font-size:13px">تبرعك القادم متاح بعد</span><br><b>${daysLeft() || WAIT_DAYS} يوماً</b></span>
          <button class="btn p sm" id="rem" style="width:auto;background:var(--blue)">${ic("cal", 18)}ذكّرني</button></div>
          <button class="btn o" id="shr">${ic("share", 20)}ادعُ متبرعاً جديداً</button>` : ""}`;
      const rem = $m.querySelector("#rem");
      if (rem) rem.addEventListener("click", () => toast("سنذكّرك عندما يحين موعد تبرعك القادم"));
      const shr = $m.querySelector("#shr");
      if (shr) shr.addEventListener("click", async () => {
        const data = { title: "شريان", text: "انضم إلى شريان، وكن قريباً ممن يحتاجون دمك في الحالات الطارئة.", url: location.href.split("#")[0] };
        try { if (navigator.share) await navigator.share(data); else { await navigator.clipboard.writeText(data.text + " " + data.url); toast("تم نسخ رابط الدعوة"); } } catch (e) {}
      });
      return stage;
    }
    timers.push(setInterval(() => { if (draw() >= 5) timers.forEach(clearInterval); }, 2000));
    draw();
  }

  // ---------- التنبيهات ----------
  function inboxV() {
    const act = cases().filter((c) => c.crit);
    const L = inbox();
    const kind = { covered: ["check", "var(--bluel)", "var(--blue)"], done: ["heart", "var(--redl)", "var(--red)"], crit: ["bell", "var(--redl)", "var(--red)"], info: ["bell", "#F4F5F7", "var(--ink)"] };
    $m.innerHTML = `${top("#/home", "التنبيهات", "الحالات الطارئة تظهر أولاً")}
      ${act.length ? `<h2 class="mu" style="font-size:14px">نشطة الآن</h2>` + act.map((c) => `<article class="active">
        <div class="row">${drop(esc(S.blood), 52, "#fff", "var(--red)", 15)}<div style="flex:1"><span style="font-size:12px;color:#E8C5CC">حالة حرجة</span><br><b>مطلوب ${esc(S.blood)} في ${c.name}</b><br><span style="font-size:12px;color:#E8C5CC">${c.dist} كم</span></div></div>
        <div class="bar"><i style="width:${Math.round(c.got / c.need * 100)}%"></i></div><span style="font-size:12px;color:#E8C5CC">استجاب ${c.got} من ${c.need} متبرعين مطلوبين</span>
        <div class="grid2"><a class="btn l sm" href="#/check" data-h="${c.id}">أستطيع التبرع</a><a class="btn g sm" href="#/home">لا أستطيع</a></div></article>`).join("") : ""}
      <h2 class="mu" style="font-size:14px">السجل</h2>
      ${L.map((n) => { const [i, bg, fg] = kind[n.k] || kind.info; return `<a class="note" href="${n.k === "done" ? "#/track" : "#/inbox"}"><span class="ic" style="background:${bg};color:${fg}">${ic(i, 22)}</span>
        <span style="display:flex;flex-direction:column;gap:3px"><b style="font-size:14px">${esc(n.t)}</b><span class="mu" style="line-height:1.7">${esc(n.d)}</span><span class="mu" style="font-size:11px">${ago(n.at)}</span></span></a>`; }).join("")}`;
    $m.querySelectorAll("[data-h]").forEach((a) => a.addEventListener("click", () => store.set("active", a.dataset.h)));
  }

  // ---------- الإعدادات ----------
  function settings() {
    const perm = "Notification" in window ? Notification.permission : "unsupported";
    const T = [["flash", "وميض الشاشة مع التنبيه", ""], ["sound", "صوت التنبيه", ""], ["quiet", "ساعات هادئة", "الحالات الحرجة تصل دائماً"]];
    $m.innerHTML = `${top("#/home", "الإعدادات", "متى وكيف تصلك الحالات الطارئة")}
      <section class="card" style="display:flex;flex-direction:column;gap:12px">
        <label for="nm" style="font-weight:700;font-size:15px">اسمك</label><input type="text" id="nm" value="${esc(S.name)}" placeholder="اكتب اسمك الأول" autocomplete="given-name">
        <label for="bt" style="font-weight:700;font-size:15px">فصيلة الدم</label>
        <select id="bt" dir="ltr">${["O−", "O+", "A−", "A+", "B−", "B+", "AB−", "AB+"].map((b) => `<option${b === S.blood ? " selected" : ""}>${b}</option>`).join("")}</select></section>
      <section class="dark">
        <label class="toggle"><span><b style="font-size:15px">تجاوز الوضع الصامت وعدم الإزعاج</b><br><span style="font-size:12px;color:#E8C5CC;line-height:1.7">للحالات الحرجة فقط</span></span><input type="checkbox" data-k="dnd"${S.dnd ? " checked" : ""}></label>
        <div class="perm"><span>${perm === "granted" ? "إذن الإشعارات مفعّل" : perm === "denied" ? "الإشعارات مرفوضة، فعّلها من إعدادات الهاتف" : "يحتاج إذن الإشعارات من الهاتف"}</span>
          ${perm === "default" ? `<button id="perm">منح الإذن</button>` : ""}</div></section>
      <section class="card" style="display:flex;flex-direction:column;gap:8px"><div class="row between"><label for="rad" style="font-weight:700;font-size:15px">نطاق التنبيه حول موقعك</label><b id="radv" style="color:var(--red);font-family:var(--disp);font-size:18px">${S.radius} كم</b></div>
        <input id="rad" type="range" min="1" max="25" value="${S.radius}"><div class="row between mu" style="font-size:12px"><span>1 كم</span><span>25 كم</span></div></section>
      <fieldset><legend>نمط الاهتزاز</legend>${[["heart", "نبضة قلب، تمييزه دون النظر للهاتف"], ["long", "متواصل حتى تفتح التنبيه"]].map(([v, l]) =>
        `<label class="opt"><input type="radio" name="vib" value="${v}"${S.vib === v ? " checked" : ""}>${l}</label>`).join("")}
        <button class="btn o sm" id="tv" style="margin-top:8px">${ic("play", 18)}جرّب الاهتزاز</button></fieldset>
      <section class="card tlist" style="padding:4px 16px">${T.map(([k, l, s]) => `<label class="toggle"><span><b style="font-size:14px;font-weight:600">${l}</b>${s ? `<br><span class="mu" style="font-size:12px">${s}</span>` : ""}</span><input type="checkbox" data-k="${k}"${S[k] ? " checked" : ""}></label>`).join("")}</section>
      <button class="btn o" id="reset">إعادة ضبط العرض التجريبي</button>
      <p class="mu" style="text-align:center;line-height:1.8">للتواصل: <a href="mailto:alsfarly2@gmail.com" dir="ltr">alsfarly2@gmail.com</a></p>`;
    $m.querySelector("#nm").addEventListener("input", (e) => { S.name = e.target.value.trim().slice(0, 30); save(); });
    $m.querySelector("#bt").addEventListener("change", (e) => { S.blood = e.target.value; save(); });
    $m.querySelector("#rad").addEventListener("input", (e) => { S.radius = +e.target.value; save(); $m.querySelector("#radv").textContent = S.radius + " كم"; });
    $m.querySelectorAll('input[name="vib"]').forEach((r) => r.addEventListener("change", () => { S.vib = r.value; save(); }));
    $m.querySelector("#tv").addEventListener("click", () => { if (navigator.vibrate) navigator.vibrate(S.vib === "heart" ? [120, 90, 160, 700, 120, 90, 160] : [1200]); else toast("الاهتزاز غير مدعوم في هذا الجهاز"); });
    $m.querySelectorAll("[data-k]").forEach((c) => c.addEventListener("change", () => { S[c.dataset.k] = c.checked; save(); }));
    const p = $m.querySelector("#perm");
    if (p) p.addEventListener("click", () => Notification.requestPermission().then(() => settings()));
    $m.querySelector("#reset").addEventListener("click", () => {
      ["cases", "inbox", "donation", "active"].forEach((k) => localStorage.removeItem("sh:" + k));
      S.lastDonation = 0; save(); toast("تمت إعادة الضبط"); location.hash = "#/home";
    });
  }

  // ---------- المستشفيات ----------
  let hFilter = "all";
  function hospitals() {
    const groups = [["حكومي", "مستشفيات حكومية"], ["أهلي", "مستشفيات أهلية"], ["مصرف دم", "مصرف الدم"]];
    const active = cases().map((c) => c.id);
    const F = [["all", "الكل"], ["حكومي", "حكومي"], ["أهلي", "أهلي"]];
    $m.innerHTML = `${top("#/home", "مستشفيات الموصل", "الجهات التي تصل منها الحالات")}
      <div class="yn" role="group" aria-label="تصفية حسب النوع" style="grid-template-columns:repeat(3,minmax(0,1fr))">
        ${F.map(([k, l]) => `<button class="y" data-f="${k}" aria-pressed="${hFilter === k}">${l}</button>`).join("")}</div>
      ${groups.filter(([k]) => hFilter === "all" || k === hFilter || k === "مصرف دم").map(([k, l]) => {
        const list = HOSP.filter((h) => h.type === k);
        if (!list.length) return "";
        return `<section style="display:flex;flex-direction:column;gap:8px"><h2 style="font-size:15px">${l} <span class="mu">(${list.length})</span></h2>
          ${list.map((h) => `<div class="note" style="align-items:center"><span class="ic" style="background:${k === "مصرف دم" ? "var(--red)" : k === "أهلي" ? "var(--bluel)" : "var(--redl)"};color:${k === "مصرف دم" ? "#fff" : k === "أهلي" ? "var(--blue)" : "var(--red)"}">${ic(k === "مصرف دم" ? "drop" : "hosp", 22)}</span>
            <span style="flex:1;display:flex;flex-direction:column;gap:2px"><b style="font-size:14px">${esc(h.name)}</b><span class="mu" style="font-size:12px">${esc(h.kind)}${h.side ? "، الجانب " + h.side : ""}</span></span>
            ${active.includes(h.id) ? `<span class="pill" style="background:var(--red);color:#fff">حالة نشطة</span>` : ""}</div>`).join("")}</section>`;
      }).join("")}
      <p class="mu" style="line-height:1.8;font-size:12px">المسافات في النسخة التجريبية تقديرية، وتُحسب فعلياً من موقعك في النسخة الكاملة.</p>`;
    $m.querySelectorAll("[data-f]").forEach((b) => b.addEventListener("click", () => { hFilter = b.dataset.f; hospitals(); }));
  }

  window.addEventListener("hashchange", route);
  route();
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js").catch(() => {});
})();
