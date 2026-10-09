/* Teacher Connect service worker.
   Change APP_VERSION whenever you upload changed files, so phones refresh. */
var APP_VERSION = "1.0.0";
var CACHE = "tc-" + APP_VERSION;
var SHELL = [
  "./", "index.html", "app.css", "app.js", "config.js", "manifest.webmanifest",
  "icons/logo.png", "icons/logo-white.png", "icons/icon-192.png", "icons/icon-512.png",
  "icons/favicon-32.png", "icons/apple-touch-icon.png"
];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k.indexOf("tc-") === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);

  // Google sign-in and anything else off-site: always straight to the network.
  if (url.origin !== location.origin && url.hostname.indexOf("fonts.g") !== 0) return;

  // Page and settings: network first so changes show up, cache as offline fallback.
  if (req.mode === "navigate" || url.pathname.endsWith("config.js")) {
    e.respondWith(fetch(req).then(function (res) {
      var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req.mode === "navigate" ? "index.html" : req, copy); });
      return res;
    }).catch(function () { return caches.match(req.mode === "navigate" ? "index.html" : req); }));
    return;
  }

  // Everything else (styles, icons, fonts): cache first.
  e.respondWith(caches.match(req).then(function (hit) {
    return hit || fetch(req).then(function (res) {
      if (res.ok || res.type === "opaque") { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); }
      return res;
    });
  }));
});
