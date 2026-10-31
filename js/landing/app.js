/* Orb Analytics: nav, FAQ accordion, Google Identity Services sign-in. */
(function () {
  "use strict";
  var CFG = window.ORB_CONFIG || {};
  var CLIENT_ID = CFG.GOOGLE_CLIENT_ID || "";
  var CONFIGURED = CLIENT_ID && CLIENT_ID !== "YOUR_GOOGLE_CLIENT_ID";
  var STORE_KEY = "orb.user";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  document.getElementById("yr").textContent = new Date().getFullYear();

  /* ---------- nav shadow ---------- */
  var nav = document.getElementById("nav");
  function onScroll() { nav.classList.toggle("scrolled", window.scrollY > 24); }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* ---------- FAQ accordion (one open at a time) ---------- */
  var items = $$("#faqList .faq-item");
  function setOpen(item, open) {
    var b = $("button", item);
    b.setAttribute("aria-expanded", open ? "true" : "false");
    item.classList.toggle("open", open);
  }
  items.forEach(function (item) {
    $("button", item).addEventListener("click", function () {
      var willOpen = this.getAttribute("aria-expanded") !== "true";
      items.forEach(function (o) { setOpen(o, o === item && willOpen); });
    });
  });

  /* ---------- auth state ---------- */
  var GOOGLE_G = '<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.5-4.1 7-10.2 7-17.6z"/><path fill="#FBBC05" d="M10.5 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/></svg>';
  function readUser() {
    try {
      var u = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
      if (u && u.exp && u.exp * 1000 < Date.now()) { localStorage.removeItem(STORE_KEY); return null; }
      return u;
    } catch (e) { return null; }
  }
  function decodeJwt(token) {
    var part = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    while (part.length % 4) part += "=";
    var bin = atob(part), bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return JSON.parse(new TextDecoder("utf-8").decode(bytes));
  }
  function renderAuth() {
    var u = readUser();
    $("#navUser").hidden = !u; $("#navGuest").hidden = !!u;
    if (u) {
      $("#navName").textContent = u.name || u.email || "Signed in";
      var av = $("#navAvatar");
      if (u.picture) { av.src = u.picture; av.hidden = false; } else { av.hidden = true; }
    }
    ["heroSigned", "closeSigned"].forEach(function (id) {
      var el = document.getElementById(id); if (!el) return;
      el.hidden = !u;
      if (u) el.textContent = "Signed in as " + (u.name || u.email) + ".";
    });
    $$("[data-google-slot]").forEach(function (slot) {
      var block = slot.closest(".cta-block"); if (block) block.hidden = !!u;
    });
  }
  function signOut() {
    localStorage.removeItem(STORE_KEY);
    try { if (window.google && google.accounts) google.accounts.id.disableAutoSelect(); } catch (e) {}
    renderAuth();
  }
  $$("[data-signout]").forEach(function (b) { b.addEventListener("click", signOut); });

  /* ---------- Google Identity Services ---------- */
  function onCredential(resp) {
    // NOTE: this decodes the token client side for display only.
    // A real app must send resp.credential to a server and verify it there.
    try {
      var c = decodeJwt(resp.credential);
      localStorage.setItem(STORE_KEY, JSON.stringify({ sub: c.sub, name: c.name, email: c.email, picture: c.picture, exp: c.exp }));
      pop(false); renderAuth();
    } catch (e) { showNotice($("#authPop .g-notice"), "Sign-in failed. Please try again."); }
  }
  function loadGsi(cb) {
    if (window.google && google.accounts && google.accounts.id) return cb();
    var s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client"; s.async = true; s.defer = true;
    s.onload = cb;
    s.onerror = function () { $$(".g-notice").forEach(function (n) { showNotice(n, "Could not load Google sign-in. Check your connection and try again."); }); };
    document.head.appendChild(s);
  }
  function showNotice(el, html) { if (!el) return; el.innerHTML = html; el.hidden = false; }
  var NOTICE = "Google sign-in is not set up yet. Add your Google OAuth client ID to <code>js/landing/config.js</code> to turn it on.";

  function buildSlots() {
    $$("[data-google-slot]").forEach(function (slot) {
      slot.innerHTML = "";
      if (!CONFIGURED) {
        var btn = document.createElement("button");
        btn.type = "button"; btn.className = "g-btn";
        btn.innerHTML = GOOGLE_G + "<span>Continue with Google</span>";
        btn.addEventListener("click", function () {
          var n = slot.parentNode.querySelector(".g-notice");
          showNotice(n, NOTICE);
        });
        slot.appendChild(btn);
      }
    });
    if (CONFIGURED) {
      loadGsi(function () {
        google.accounts.id.initialize({ client_id: CLIENT_ID, callback: onCredential, ux_mode: "popup", auto_select: false });
        $$("[data-google-slot]").forEach(function (slot) {
          google.accounts.id.renderButton(slot, { type: "standard", theme: "outline", size: "large", text: "continue_with", shape: "pill", logo_alignment: "left" });
        });
      });
    }
  }

  /* ---------- nav popover ---------- */
  var navBtn = $("#navLogin"), popEl = $("#authPop");
  function pop(open) {
    popEl.hidden = !open; navBtn.setAttribute("aria-expanded", open ? "true" : "false");
  }
  navBtn.addEventListener("click", function (e) { e.stopPropagation(); pop(popEl.hidden); });
  document.addEventListener("click", function (e) { if (!popEl.hidden && !popEl.contains(e.target) && e.target !== navBtn) pop(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !popEl.hidden) { pop(false); navBtn.focus(); } });

  buildSlots();
  renderAuth();
})();
