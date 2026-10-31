/* Landing intro: FAQ, Google sign-in, and the control that slides the layer away. */
(function () {
  "use strict";
  var CFG = window.ORB_CONFIG || {};
  var CLIENT_ID = CFG.GOOGLE_CLIENT_ID || "";
  var CONFIGURED = CLIENT_ID && CLIENT_ID !== "YOUR_GOOGLE_CLIENT_ID";
  var STORE_KEY = "orb.user";
  var NOTICE = "Google sign-in is not set up yet. Add your Google OAuth client ID to <code>js/landing/config.js</code> to turn it on.";
  var GOOGLE_G = '<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.5-4.1 7-10.2 7-17.6z"/><path fill="#FBBC05" d="M10.5 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/></svg>';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var items = $$("#faqList .faq-item");
  function setOpen(item, open) {
    var b = $("button", item);
    if (!b) return;
    b.setAttribute("aria-expanded", open ? "true" : "false");
    item.classList.toggle("open", open);
  }
  items.forEach(function (item) {
    $("button", item).addEventListener("click", function () {
      var willOpen = this.getAttribute("aria-expanded") !== "true";
      items.forEach(function (o) { setOpen(o, o === item && willOpen); });
    });
  });

  function showNotice(el, html) {
    if (!el) return;
    el.innerHTML = html;
    el.hidden = false;
  }
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
    var slot = $("[data-google-slot]");
    var block = $(".cta-block");
    if (!slot || !block) return;
    var u = readUser();
    var signed = $("#googleSigned");
    if (u) {
      block.hidden = true;
      if (!signed) {
        signed = document.createElement("p");
        signed.id = "googleSigned";
        signed.className = "google-signed";
        block.parentNode.insertBefore(signed, block);
      }
      signed.hidden = false;
      signed.textContent = "Signed in as " + (u.name || u.email) + ".";
      return;
    }
    if (signed) signed.hidden = true;
    block.hidden = false;
  }
  function onCredential(resp) {
    try {
      var c = decodeJwt(resp.credential);
      localStorage.setItem(STORE_KEY, JSON.stringify({ sub: c.sub, name: c.name, email: c.email, picture: c.picture, exp: c.exp }));
      renderAuth();
    } catch (e) { showNotice($(".g-notice"), "Sign-in failed. Please try again."); }
  }
  function loadGsi(cb) {
    if (window.google && google.accounts && google.accounts.id) return cb();
    var s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.onload = cb;
    s.onerror = function () { showNotice($(".g-notice"), "Could not load Google sign-in. Check your connection and try again."); };
    document.head.appendChild(s);
  }
  function buildGoogle() {
    var slot = $("[data-google-slot]");
    if (!slot || readUser()) return;
    slot.innerHTML = "";
    if (!CONFIGURED) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "g-btn";
      btn.innerHTML = GOOGLE_G + "<span>Continue with Google</span>";
      btn.addEventListener("click", function () { showNotice($(".g-notice"), NOTICE); });
      slot.appendChild(btn);
      return;
    }
    loadGsi(function () {
      google.accounts.id.initialize({ client_id: CLIENT_ID, callback: onCredential, ux_mode: "popup", auto_select: false });
      google.accounts.id.renderButton(slot, { type: "standard", theme: "outline", size: "large", text: "continue_with", shape: "pill", logo_alignment: "left" });
    });
  }

  var layer = document.getElementById("landing");
  var btn = document.getElementById("enterSite");
  if (!layer || !btn) return;
  var blocked = [
    document.getElementById("main-nav"),
    document.getElementById("sidebar-overlay"),
    document.querySelector(".app-layout")
  ];
  blocked.forEach(function (el) { if (el) el.setAttribute("inert", ""); });

  function finish() {
    if (layer.classList.contains("is-gone")) return;
    layer.classList.add("is-gone");
    layer.setAttribute("aria-hidden", "true");
    blocked.forEach(function (el) { if (el) el.removeAttribute("inert"); });
    var focus = document.getElementById("sidebar-toggle") || document.getElementById("main-nav");
    if (focus && focus.focus) {
      try { focus.focus({ preventScroll: true }); } catch (e) { focus.focus(); }
    }
  }
  function enter() {
    if (layer.classList.contains("is-leaving") || layer.classList.contains("is-gone")) return;
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { finish(); return; }
    layer.classList.add("is-leaving");
    var done = false;
    function onEnd(e) {
      if (done || e.target !== layer) return;
      done = true;
      finish();
    }
    layer.addEventListener("transitionend", onEnd);
    window.setTimeout(function () { if (!done) { done = true; finish(); } }, 900);
  }
  btn.addEventListener("click", enter);
  buildGoogle();
  renderAuth();
  var mark = document.querySelector(".landing-mark .mini-orb-canvas");
  if (mark) import("./mini-orb.js").then(function (m) { return m.mountMiniOrb(mark); }).catch(function () {});
})();
