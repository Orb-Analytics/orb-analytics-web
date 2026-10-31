/* Landing intro: FAQ accordion and the control that slides the layer away. */
(function () {
  "use strict";
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
})();
