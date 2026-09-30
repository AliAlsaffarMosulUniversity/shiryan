/* عند تعديل أي ملف: غيّر رقم الإصدار حتى يتحدّث التطبيق عند المستخدمين */
const VERSION = "v3";
const SHELL = ["./", "index.html", "styles.css", "app.js", "hospitals.js", "manifest.json",
  "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png"];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open("shell-" + VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== "shell-" + VERSION && k !== "fonts").map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request; if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.hostname.includes("fonts.")) {
    e.respondWith(caches.open("fonts").then(async (c) => {
      const hit = await c.match(req); if (hit) return hit;
      try { const r = await fetch(req); c.put(req, r.clone()); return r; } catch (err) { return Response.error(); }
    }));
    return;
  }
  if (url.origin === location.origin) {
    e.respondWith(caches.match(req, { ignoreSearch: true }).then((h) => h || fetch(req).catch(() => caches.match("index.html"))));
  }
});
/* الضغط على الإشعار يفتح شاشة التنبيه */
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const target = e.action === "decline" ? "#/home" : "#/alert";
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((cs) => {
    for (const c of cs) { c.navigate(c.url.split("#")[0] + target); return c.focus(); }
    return self.clients.openWindow("./" + target);
  }));
});
