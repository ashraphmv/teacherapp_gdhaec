/* Teacher Connect launcher. Settings live in config.js. */
(function () {
  "use strict";
  var APP_VERSION = "1.0.2";
  var cfg = window.TC_CONFIG || {};
  var domain = String(cfg.schoolDomain || "").toLowerCase();
  var KEY = "tc.session", KEY_INSTALL = "tc.installDismissed";
  var $ = function (id) { return document.getElementById(id); };

  var ICONS = {
    calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="17" rx="3"/><path d="M8 2v4M16 2v4M3 10h18"/><path d="m9 15 2 2 4-4"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7z"/></svg>',
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/></svg>',
    sparkle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3l1.6 4.4L16 9l-4.4 1.6L10 15l-1.6-4.4L4 9l4.4-1.6z"/><path d="M18 14l.8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8z"/></svg>',
    globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>'
  };
  var DOT = { sky: "var(--sky)", red: "var(--red)", green: "var(--green)", navy: "var(--navy)", amber: "var(--amber)" };

  /* ---------- storage (never throws) ---------- */
  function load(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function drop(k) { try { localStorage.removeItem(k); } catch (e) {} }

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function mod(id) { return (cfg.modules || []).filter(function (m) { return m.id === id; })[0]; }
  function isStandalone() { return (window.matchMedia && matchMedia("(display-mode: standalone)").matches) || window.navigator.standalone === true; }

  var toastTimer;
  function toast(msg) { var t = $("toast"); t.textContent = msg; t.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.hidden = true; }, 2600); }

  /* ---------- session ---------- */
  function getSession() {
    var s = load(KEY);
    if (!s || !s.until || Date.now() > s.until) return null;
    if (!s.setup && cfg.googleClientId && String(s.domain || "").toLowerCase() !== domain) return null;
    if (s.setup && cfg.googleClientId) return null; // setup-mode sessions end once sign-in is configured
    return s;
  }
  function startSession(user) {
    user.until = Date.now() + (cfg.sessionDays || 30) * 864e5;
    save(KEY, user);
    route();
  }

  function decodeJwt(token) {
    var part = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    while (part.length % 4) part += "=";
    var bin = atob(part), bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return JSON.parse(new TextDecoder().decode(bytes));
  }

  function onCredential(resp) {
    var err = $("signin-err"); err.hidden = true;
    var p;
    try { p = decodeJwt(resp.credential); } catch (e) { err.textContent = "Sign-in failed. Please try again."; err.hidden = false; return; }
    var email = String(p.email || "").toLowerCase();
    var ok = p.email_verified && String(p.hd || "").toLowerCase() === domain && email.slice(-(domain.length + 1)) === "@" + domain;
    if (!ok) {
      err.textContent = (p.email ? p.email + " is not a school account. " : "") + "Choose your @" + domain + " account.";
      err.hidden = false;
      if (window.google && google.accounts) google.accounts.id.disableAutoSelect();
      return;
    }
    startSession({ name: p.name || email, given: p.given_name || "", email: email, picture: p.picture || "", domain: p.hd });
  }

  var gsiLoaded = false;
  function setupSignin() {
    if (!cfg.googleClientId) {
      $("setup-btn").hidden = false; $("setup-note").hidden = false;
      return;
    }
    if (gsiLoaded) { renderGsi(); return; }
    var s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client"; s.async = true; s.defer = true;
    s.onload = function () { gsiLoaded = true; renderGsi(); };
    s.onerror = function () { var e = $("signin-err"); e.textContent = "Can't reach Google sign-in. Check your internet connection and try again."; e.hidden = false; };
    document.head.appendChild(s);
  }
  function renderGsi() {
    google.accounts.id.initialize({
      client_id: cfg.googleClientId,
      callback: onCredential,
      hd: domain,
      auto_select: true,
      itp_support: true,
      ux_mode: "popup"
    });
    var slot = $("gsi-btn"); slot.innerHTML = "";
    google.accounts.id.renderButton(slot, { theme: "outline", size: "large", shape: "pill", text: "continue_with", logo_alignment: "left", width: 280 });
    google.accounts.id.prompt();
  }

  /* ---------- views ---------- */
  var current = null;
  function show(name) {
    closeSheet();
    ["signin", "home", "profile"].forEach(function (v) { $("v-" + v).hidden = v !== name; });
    $("nav").hidden = name === "signin";
    document.querySelectorAll(".nav [data-go]").forEach(function (b) {
      if (b.dataset.go === name) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current");
    });
    current = name;
    window.scrollTo(0, 0);
  }

  function route() {
    var s = getSession();
    if (!s) { show("signin"); setupSignin(); return; }
    renderUser(s);
    renderHome();
    show("home");
    var params = new URLSearchParams(location.search), target = params.get("open");
    if (target) {
      history.replaceState(null, "", location.pathname);
      var bits = target.split("/");
      openLink(bits[0], bits[1]);
    }
  }

  function initials(name) { return String(name || "?").split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w[0]; }).join("").toUpperCase(); }
  function setAvatar(el, s) {
    if (s.picture) { el.style.backgroundImage = "url('" + s.picture.replace(/'/g, "") + "')"; el.textContent = ""; }
    else { el.style.backgroundImage = ""; el.textContent = initials(s.name); }
  }
  function renderUser(s) {
    setAvatar($("head-avatar"), s); setAvatar($("p-avatar"), s);
    $("p-name").textContent = s.name || "";
    $("p-email").textContent = s.setup ? "Setup mode (sign-in not configured)" : s.email;
    $("p-version").textContent = APP_VERSION;
    $("p-support").textContent = cfg.supportText || "";
    var a = $("p-portal"); a.href = cfg.portalUrl || "#"; a.textContent = String(cfg.portalUrl || "").replace(/^https?:\/\//, "");
  }

  function tick() {
    var s = getSession(), d = new Date(), h = d.getHours(), wd = d.getDay();
    var first = s ? (s.given || String(s.name || "").split(" ")[0]) : "";
    $("greet").textContent = (h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening") + (first && !(s && s.setup) ? ", " + first : "");
    $("m-date").textContent = d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
    $("m-time").textContent = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    $("m-day").textContent = (wd === 5 || wd === 6) ? "Weekend" : "School day";
  }

  function renderHome() {
    tick();
    // featured
    var f = cfg.featured, fm = f && mod(f.module);
    if (fm && !fm.soon) {
      $("feat").hidden = false;
      $("feat-ic").className = "ic c-" + fm.colour; $("feat-ic").innerHTML = ICONS[fm.icon] || "";
      $("feat-title").textContent = f.title; $("feat-sub").textContent = f.subtitle || ""; $("feat-cta").textContent = f.button || "Open";
      $("feat").onclick = function () { openLink(f.module, f.link); };
    } else $("feat").hidden = true;

    // tiles
    var html = (cfg.modules || []).map(function (m) {
      return '<button class="tile' + (m.soon ? " soon" : "") + '" type="button" data-sheet="' + esc(m.id) + '">' +
        '<span class="ic c-' + esc(m.colour) + '">' + (ICONS[m.icon] || "") + "</span>" +
        '<span class="lbl">' + esc(m.short || m.name) + "</span>" +
        (m.soon ? '<span class="pill-soon">Coming soon</span>' : "") + "</button>";
    }).join("");
    html += '<button class="tile" type="button" data-portal="1"><span class="ic c-grey">' + ICONS.globe + '</span><span class="lbl">Portal Website</span></button>';
    $("grid").innerHTML = html;

    // quick actions
    $("quick").innerHTML = (cfg.quickActions || []).map(function (q) {
      var b = q.split("/"), m = mod(b[0]); if (!m || m.soon) return "";
      var l = (m.links || []).filter(function (x) { return x.id === b[1]; })[0]; if (!l) return "";
      return '<button type="button" data-open="' + esc(q) + '"><i style="background:' + (DOT[m.colour] || "var(--sky)") + '"></i>' + esc(l.label) + "</button>";
    }).join("");
  }

  /* ---------- sheet ---------- */
  var lastFocus = null;
  function openSheet(id, btn) {
    var m = mod(id); if (!m) return;
    lastFocus = btn;
    var ic = $("sh-ic"); ic.className = "ic c-" + m.colour; ic.innerHTML = ICONS[m.icon] || "";
    $("sh-name").textContent = m.name; $("sh-aud").textContent = m.audience || ""; $("sh-desc").textContent = m.description || "";
    var links = m.links || [];
    $("sh-soon").hidden = !m.soon;
    $("sh-h3").hidden = !!m.soon || !links.length;
    $("sh-note").textContent = m.note ? "· " + m.note : "";
    var box = $("sh-links"); box.hidden = !!m.soon || !links.length;
    box.innerHTML = links.map(function (l) { return '<button type="button" data-open="' + esc(m.id + "/" + l.id) + '">' + esc(l.label) + "</button>"; }).join("");
    var open = $("sh-open");
    open.disabled = !!m.soon;
    open.textContent = m.soon ? "Available soon" : "Open " + m.name;
    open.onclick = m.soon ? null : function () { openLink(m.id); };
    $("scrim").hidden = false; $("sheet").hidden = false;
    open.focus();
  }
  function closeSheet() {
    if ($("sheet").hidden) return;
    $("sheet").hidden = true; $("scrim").hidden = true;
    if (lastFocus) { try { lastFocus.focus(); } catch (e) {} }
  }

  /* ---------- opening modules ---------- */
  function goTo(url) {
    if (isStandalone()) window.location.href = url;          // installed app: opens in the in-app browser panel
    else { var w = window.open(url, "_blank", "noopener"); if (!w) window.location.href = url; }
  }
  function openLink(modId, linkId) {
    var m = mod(modId);
    if (!m) return;
    if (m.soon) { toast(m.name + " is coming soon."); return; }
    var l = linkId ? (m.links || []).filter(function (x) { return x.id === linkId; })[0] : null;
    var url = m.url;
    if (l && l.url) url = l.url;
    else if (l && m.deepLink && url && !/^PASTE_/.test(url)) url += (url.indexOf("?") < 0 ? "?" : "&") + m.deepLink + "=" + encodeURIComponent(l.id);
    if (!url || /^PASTE_/.test(url)) { toast("The link for " + m.name + " hasn't been set up yet."); return; }
    closeSheet();
    goTo(url);
  }

  /* ---------- install prompt ---------- */
  var deferred = null;
  function maybeShowInstall() {
    if (isStandalone() || load(KEY_INSTALL)) return;
    var ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (deferred) {
      $("install-text").textContent = "Install Teacher Connect on this phone for one-tap access.";
      $("install-btn").hidden = false; $("install").hidden = false;
    } else if (ios) {
      $("install-text").innerHTML = "To install: tap <b>Share</b>, then <b>Add to Home Screen</b>.";
      $("install-btn").hidden = true; $("install").hidden = false;
    }
  }
  window.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); deferred = e; maybeShowInstall(); });
  window.addEventListener("appinstalled", function () { $("install").hidden = true; deferred = null; });

  /* ---------- events ---------- */
  document.addEventListener("click", function (e) {
    var t;
    if ((t = e.target.closest("[data-sheet]"))) { openSheet(t.dataset.sheet, t); return; }
    if ((t = e.target.closest("[data-open]"))) { var b = t.dataset.open.split("/"); openLink(b[0], b[1]); return; }
    if ((t = e.target.closest("[data-portal]"))) { goTo(cfg.portalUrl); return; }
    if ((t = e.target.closest("[data-go]"))) { show(t.dataset.go); return; }
  });
  $("scrim").addEventListener("click", closeSheet);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeSheet(); });
  $("nav-web").addEventListener("click", function () { goTo(cfg.portalUrl); });
  $("setup-btn").addEventListener("click", function () { startSession({ name: "Setup mode", setup: true }); });
  $("signout").addEventListener("click", function () {
    drop(KEY);
    if (window.google && google.accounts) google.accounts.id.disableAutoSelect();
    show("signin"); setupSignin();
  });
  $("install-btn").addEventListener("click", function () {
    if (!deferred) return;
    deferred.prompt();
    deferred.userChoice.finally(function () { deferred = null; $("install").hidden = true; });
  });
  $("install-x").addEventListener("click", function () { save(KEY_INSTALL, true); $("install").hidden = true; });

  setInterval(function () { if (current === "home") tick(); }, 30000);
  document.addEventListener("visibilitychange", function () { if (!document.hidden && current) { if (!getSession()) route(); else if (current === "home") tick(); } });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () {}); });
  }

  route();
  maybeShowInstall();
})();
