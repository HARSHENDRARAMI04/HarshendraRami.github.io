(function () {
  "use strict";
  var S = window.SITE || {};
  var $ = function (s) { return document.querySelector(s); };

  /* tiny safe DOM builder: text is always set as text, never as HTML */
  function h(tag, props) {
    var el = document.createElement(tag);
    props = props || {};
    Object.keys(props).forEach(function (k) {
      var v = props[k];
      if (v == null || v === false) return;
      if (k === "class") el.className = v;
      else if (k === "text") el.textContent = v;
      else el.setAttribute(k, v === true ? "" : v);
    });
    for (var i = 2; i < arguments.length; i++) {
      var kids = [].concat(arguments[i]);
      kids.forEach(function (c) {
        if (c == null || c === false) return;
        el.appendChild(c.nodeType ? c : document.createTextNode(c));
      });
    }
    return el;
  }
  function slug(s) { return String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
  function fmtDate(d) {
    if (!d) return "";
    var dt = new Date(d + "T00:00:00");
    if (isNaN(dt)) return d;
    return dt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  }
  function isUrl(u) { return typeof u === "string" && u.trim() !== "" && u.trim() !== "#"; }

  /* expandable row: opens with a height animation, keeps hidden content out of tab order */
  function expander(item, btn, detail) {
    detail.setAttribute("inert", "");
    btn.addEventListener("click", function () {
      var open = !item.classList.contains("open");
      item.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", String(open));
      if (open) detail.removeAttribute("inert"); else detail.setAttribute("inert", "");
    });
  }

  /* ---------- identity, title, search-engine data ---------- */
  var name = S.name || "Your Name";
  document.title = name + (S.role ? " | " + S.role : "");
  var greet = $("#greet");
  var isWorks = document.body.hasAttribute("data-works");
  if (isWorks) document.title = "All work | " + name;
  if (greet && isUrl(S.photo)) greet.appendChild(h("img", { class: "photo", src: S.photo, alt: "Portrait of " + name, width: 56, height: 56 }));
  if (greet) { if (S.greeting) greet.appendChild(h("span", { text: S.greeting })); else greet.hidden = true; }
  var building = (S.products || []).filter(function (p) { return /building/i.test(p.status || ""); })[0];
  var st = S.status || (building ? "Now building: " + building.name : "");
  if (st) $("#status").textContent = st; else $("#status").parentNode.hidden = true;
  if ($("#intro")) $("#intro").textContent = S.intro || "";
  $("#copyright").textContent = "\u00A9 " + new Date().getFullYear() + " " + name;

  var links = (S.links || []).filter(function (l) { return l && isUrl(l.url); });
  var heroLinks = $("#hero-links");
  if (heroLinks) links.forEach(function (l) {
    var external = !/^mailto:/.test(l.url);
    heroLinks.appendChild(h("a", { href: l.url, text: l.label, target: external ? "_blank" : null, rel: external ? "noopener noreferrer" : null }));
  });

  try {
    var ld = { "@context": "https://schema.org", "@type": "Person", name: name, jobTitle: S.role || undefined,
      sameAs: links.filter(function (l) { return /^https?:/.test(l.url); }).map(function (l) { return l.url; }) };
    var tag = document.createElement("script");
    tag.type = "application/ld+json";
    tag.textContent = JSON.stringify(ld);
    document.head.appendChild(tag);
  } catch (e) {}

  /* ---------- hero: letters start scattered and settle into place ---------- */
  var nameEl = $("#name");
  if (nameEl) {
  nameEl.setAttribute("aria-label", name);
  nameEl.textContent = "";
  var n = 0;
  name.split(/\s+/).forEach(function (w) {
    var word = h("span", { class: "word", "aria-hidden": "true" });
    w.split("").forEach(function (c) {
      var ch = h("span", { class: "ch", text: c });
      ch.style.setProperty("--i", n++);
      ch.style.setProperty("--dy", ((Math.random() * 2 - 1) * 0.45).toFixed(2) + "em");
      ch.style.setProperty("--rot", ((Math.random() * 2 - 1) * 8).toFixed(1) + "deg");
      word.appendChild(ch);
    });
    nameEl.appendChild(word);
  });
  }

  /* ---------- theme toggle ---------- */
  var root = document.documentElement;
  var themeBtn = $("#theme");
  function currentTheme() {
    return root.getAttribute("data-theme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  }
  /* icon only: the sun appears in dark mode (tap for light), the moon in light mode (tap for dark) */
  var SUN = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  var MOON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/></svg>';
  function paintThemeBtn() {
    var dark = currentTheme() === "dark", label = dark ? "Switch to light theme" : "Switch to dark theme";
    themeBtn.innerHTML = dark ? SUN : MOON;
    themeBtn.setAttribute("aria-label", label); themeBtn.title = label;
  }
  themeBtn.addEventListener("click", function () {
    var next = currentTheme() === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
    paintThemeBtn();
  });
  paintThemeBtn();

  /* ---------- mobile menu ---------- */
  var menuBtn = $("#menubtn"), hdr = document.querySelector(".top");
  if (menuBtn && hdr) {
    var setMenu = function (open) {
      if (open) hdr.setAttribute("data-menu", "open"); else hdr.removeAttribute("data-menu");
      menuBtn.setAttribute("aria-expanded", String(open));
      menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };
    menuBtn.addEventListener("click", function (e) { e.stopPropagation(); setMenu(menuBtn.getAttribute("aria-expanded") !== "true"); });
    $("#menu").addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
    document.addEventListener("click", function (e) { if (!hdr.contains(e.target)) setMenu(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && menuBtn.getAttribute("aria-expanded") === "true") { setMenu(false); menuBtn.focus(); } });
    addEventListener("resize", function () { if (innerWidth >= 720) setMenu(false); });
  }

  /* ---------- scroll life ---------- */
  var still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!still) {
    root.classList.add("js");
    var bar = $("#progress"), secs = [].slice.call(document.querySelectorAll(".sec")), spy = {};
    [].forEach.call(document.querySelectorAll(".top nav a[href^='#']"), function (a) { spy[a.getAttribute("href").slice(1)] = a; });
    /* sections rise into view as you reach them */
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { rootMargin: "0px 0px -12% 0px" });
    secs.forEach(function (s) { if (s.getBoundingClientRect().top > innerHeight * 0.9) { s.classList.add("rv"); io.observe(s); } });
    /* the menu underlines the section you are in */
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting || !spy[e.target.id]) return;
        Object.keys(spy).forEach(function (k) { spy[k].removeAttribute("aria-current"); });
        spy[e.target.id].setAttribute("aria-current", "true");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    secs.forEach(function (s) { so.observe(s); });
    /* a thin line across the top fills as you read */
    var prog = function () { var m = document.documentElement.scrollHeight - innerHeight; if (bar) bar.style.transform = "scaleX(" + (m > 0 ? Math.min(1, scrollY / m) : 0) + ")"; };
    addEventListener("scroll", prog, { passive: true }); prog();
  }

  /* ---------- the living name ----------
     Letters shy away from the pointer like magnets, drift apart as you scroll,
     and scatter when you tap them, then spring back. Uses the CSS translate/rotate
     properties so it never fights the entrance animation. Idle = no work. */
  if (nameEl && !still) {
    var chs = [].slice.call(nameEl.querySelectorAll(".ch")), lt = chs.map(function () { return { x: 0, y: 0, vx: 0, vy: 0 }; });
    var mx = -1e4, my = -1e4, raf = 0;
    var tick = function () {
      var s = Math.min(1, scrollY / (nameEl.offsetHeight * 1.6)), mid = (chs.length - 1) / 2, busy = false;
      chs.forEach(function (c, i) {
        var o = lt[i], r = c.getBoundingClientRect();
        var dx = r.left + r.width / 2 - o.x - mx, dy = r.top + r.height / 2 - o.y - my, d = Math.sqrt(dx * dx + dy * dy) || 1;
        var tx = (i - mid) * s * 16, ty = -s * 40 * (1 + Math.sin(i * 1.7) * 0.5);
        if (d < 150) { var f = Math.pow(1 - d / 150, 2) * 90; tx += dx / d * f; ty += dy / d * f; }
        o.vx = (o.vx + (tx - o.x) * 0.12) * 0.78; o.vy = (o.vy + (ty - o.y) * 0.12) * 0.78;
        o.x += o.vx; o.y += o.vy;
        c.style.translate = o.x.toFixed(1) + "px " + o.y.toFixed(1) + "px";
        c.style.rotate = (o.x * 0.12).toFixed(1) + "deg";
        if (Math.abs(o.vx) + Math.abs(o.vy) + Math.abs(tx - o.x) + Math.abs(ty - o.y) > 0.3) busy = true;
      });
      raf = busy ? requestAnimationFrame(tick) : 0;
    };
    var kick = function () { if (!raf) raf = requestAnimationFrame(tick); };
    addEventListener("pointermove", function (e) { if (e.pointerType === "mouse") { mx = e.clientX; my = e.clientY; if (nameEl.getBoundingClientRect().bottom > -150) kick(); } }, { passive: true });
    root.addEventListener("mouseleave", function () { mx = my = -1e4; kick(); });
    addEventListener("scroll", kick, { passive: true });
    nameEl.addEventListener("pointerdown", function () { lt.forEach(function (o) { o.vx += (Math.random() - 0.5) * 70; o.vy -= 20 + Math.random() * 40; }); kick(); });
  }

  /* ---------- work ---------- */
  var products = S.products || [];
  var plist = $("#products");
  var shown = isWorks ? products : products.slice(0, 2);   // the home page shows the 2 newest
  shown.forEach(function (p, idx) {
    var id = "p-" + idx;
    var icon = isUrl(p.icon)
      ? h("img", { class: "icon", src: p.icon, alt: "", width: 40, height: 40, loading: "lazy" })
      : h("span", { class: "icon", "aria-hidden": "true", text: (p.mono || p.name || "?").replace(/\s/g, "").slice(0, 2).toUpperCase() });
    var btn = h("button", { class: "row", type: "button", "aria-expanded": "false", "aria-controls": id },
      icon,
      h("span", { class: "main" }, h("span", { class: "pname", text: p.name }), h("span", { class: "ptag", text: p.tagline || "" })),
      h("span", { class: "type", text: p.type || "" }),
      h("span", { class: "status s-" + slug(p.status || "live") }, h("span", { class: "dot" }), p.status || ""),
      h("span", { class: "chev", "aria-hidden": "true" })
    );
    var pLinks = (p.links || []).filter(function (l) { return l && isUrl(l.url); });
    var body = h("div", { class: "dbody" },
      p.description ? h("p", { text: p.description }) : null,
      (p.features && p.features.length) ? h("ul", {}, p.features.map(function (f) { return h("li", { text: f }); })) : null,
      h("div", { class: "actions" },
        pLinks.length
          ? pLinks.map(function (l) { return h("a", { class: "btn" + (l.primary ? " primary" : ""), href: l.url, target: "_blank", rel: "noopener noreferrer", text: l.label }); })
          : h("span", { class: "soon", text: "Links are coming soon." }))
    );
    var detail = h("div", { class: "detail", id: id }, h("div", { class: "detail-in" }, body));
    var item = h("li", { class: "item", "data-type": p.type || "" }, btn, detail);
    expander(item, btn, detail);
    plist.appendChild(item);
  });

  var types = [];
  products.forEach(function (p) { if (p.type && types.indexOf(p.type) < 0) types.push(p.type); });
  var filters = $("#filters");
  if (isWorks && types.length > 1) {
    ["All"].concat(types).forEach(function (t, i) {
      var b = h("button", { class: "chip", type: "button", "aria-pressed": i === 0 ? "true" : "false", text: t === "All" ? "All" : t + "s" });
      b.addEventListener("click", function () {
        [].forEach.call(filters.children, function (c) { c.setAttribute("aria-pressed", String(c === b)); });
        [].forEach.call(plist.children, function (li) { li.hidden = !(t === "All" || li.getAttribute("data-type") === t); });
      });
      filters.appendChild(b);
    });
  } else {
    filters.hidden = true;
  }
  var wm = $("#work-more");
  if (wm && !isWorks && products.length > 2) { wm.hidden = false; wm.textContent = "See all work (" + products.length + ")"; }

  /* ---------- show-more helper ---------- */
  function limit(listEl, btn, count) {
    var kids = [].slice.call(listEl.children);
    btn.hidden = true;
    if (kids.length <= count) return;
    kids.slice(count).forEach(function (k) { k.hidden = true; });
    btn.hidden = false;
    btn.onclick = function () {
      kids.forEach(function (k) { k.hidden = false; });
      btn.hidden = true;
    };
  }

  /* ---------- notes ---------- */
  if ($("#notes-list")) {
  var nlist = $("#notes-list");
  var notes = S.notes || [];
  if (!notes.length) { $("#notes").hidden = true; }
  notes.forEach(function (nt, idx) {
    var id = "n-" + idx;
    var btn = h("button", { class: "row", type: "button", "aria-expanded": "false", "aria-controls": id },
      h("span", { class: "ndate", text: fmtDate(nt.date) }),
      h("span", { class: "main" }, h("span", { class: "pname", text: nt.title })),
      h("span", { class: "chev", "aria-hidden": "true" })
    );
    var paras = String(nt.body || "").split(/\n\s*\n/).map(function (t) { return h("p", { text: t }); });
    var body = h("div", { class: "dbody" }, paras, (nt.tags && nt.tags.length) ? h("p", { class: "tags", text: nt.tags.join(", ") }) : null);
    var detail = h("div", { class: "detail", id: id }, h("div", { class: "detail-in" }, body));
    var item = h("li", { class: "item" }, btn, detail);
    expander(item, btn, detail);
    nlist.appendChild(item);
  });
  limit(nlist, $("#notes-more"), 5);

  }

  /* ---------- contact and resume ---------- */
  if ($("#cform")) {
  var ct = S.contact || {}, mail = ct.email || "", cform = $("#cform"), cst = $("#cstatus");
  if (!mail) { var ml = (S.links || []).filter(function (l) { return /^mailto:/.test(l.url || ""); })[0]; mail = ml ? ml.url.slice(7) : ""; }
  $("#contact-note").textContent = ct.note || "A project, a question, or just hello. Write to me.";
  if (isUrl(S.resume)) {
    if (heroLinks) heroLinks.appendChild(h("a", { href: S.resume, text: "Resume", target: "_blank", rel: "noopener noreferrer" }));
    $("#cresume").setAttribute("href", S.resume); $("#cresume").hidden = false;
  }
  if (!mail && !isUrl(ct.formEndpoint)) { $("#contact").hidden = true; }
  if (mail) {
    $("#cemail").hidden = false;
    $("#cemail").addEventListener("click", function () {
      var b = this; try { navigator.clipboard.writeText(mail).then(function () { b.textContent = "Copied"; }, function () { b.textContent = mail; }); } catch (e) { b.textContent = mail; }
    });
  }
  cform.addEventListener("submit", function (e) {
    e.preventDefault();
    cst.textContent = "";
    var g = function (n) { return cform.elements[n].value.trim(); };
    if (g("website")) return;   // hidden field: bots fill it, people do not
    var d = { name: g("name"), email: g("email"), message: g("message") };
    if (!d.message || !/\S+@\S+\.\S+/.test(d.email)) { cst.textContent = "Please add your email and a message."; return; }
    if (isUrl(ct.formEndpoint)) {
      if (ct.accessKey) d.access_key = ct.accessKey;
      fetch(ct.formEndpoint, { method: "POST", headers: { "content-type": "application/json", accept: "application/json" }, body: JSON.stringify(d) })
        .then(function (r) { if (!r.ok) throw new Error("fail"); cform.reset(); cst.textContent = "Sent. Thank you, I will reply soon."; })
        .catch(function () { cst.textContent = "Could not send. Please email me directly."; });
    } else {
      location.href = "mailto:" + mail + "?subject=" + encodeURIComponent("Hello from " + (d.name || "your website")) + "&body=" + encodeURIComponent(d.message + "\n\n" + d.name + " (" + d.email + ")");
    }
  });

  }

  /* ---------- about ---------- */
  if ($("#about-text")) {
  var a = S.about || {};
  var at = $("#about-text");
  (a.paragraphs || []).forEach(function (t) { at.appendChild(h("p", { text: t })); });
  var facts = $("#facts");
  (a.facts || []).forEach(function (g) {
    facts.appendChild(h("div", {}, h("h3", { text: g.title }), h("ul", {}, (g.items || []).map(function (i) { return h("li", { text: i }); }))));
  });

  }

  /* ---------- support ---------- */
  if ($("#amounts")) {
  var sp = S.support || {};
  var COINS = [["INR","\u20B9"],["USD","$"],["EUR","\u20AC"],["GBP","\u00A3"],["AUD","A$"],["CAD","C$"],["SGD","S$"],["AED","AED"]];
  var rates = { INR: 1 };
  Object.keys(sp.fallbackRates || {}).forEach(function (k) { rates[k] = sp.fallbackRates[k]; });
  var cur = "INR", base = sp.amounts && sp.amounts.length ? sp.amounts : [50, 100, 250, 500], amount = base[0];
  var amtEl = $("#amt"), liquid = $("#liquid"), input = $("#custom"), amtWrap = $("#amounts"), coins = $("#coins");
  var upi = $("#upi"), card = $("#card"), pp = $("#paypal"), rzp = $("#rzp"), copy = $("#copy"), nopay = $("#nopay");
  $("#support-msg").textContent = sp.message || "";

  function money(v) { try { return new Intl.NumberFormat("en", { style: "currency", currency: cur, minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(v); } catch (e) { return cur + " " + v; } }
  /* round converted presets to friendly numbers: 1, 2, 5, 10, 20, 50... */
  function nice(x) { if (x < 1) return Math.max(0.5, Math.round(x * 2) / 2); var m = Math.pow(10, Math.floor(Math.log10(x))), n = x / m; return m * [1, 2, 5, 10].reduce(function (a, b) { return Math.abs(b - n) < Math.abs(a - n) ? b : a; }); }
  function buildAmounts() {
    amtWrap.textContent = "";
    base.forEach(function (v) {
      var val = cur === "INR" ? v : nice(v * (rates[cur] || 1));
      var b = h("button", { class: "chip", type: "button", "data-v": val, "aria-pressed": "false", text: money(val) });
      b.addEventListener("click", function () { setAmount(val, false); });
      amtWrap.appendChild(b);
    });
  }
  function show(el, on, href, label) {
    el.hidden = !on;
    if (!on) return;
    el.removeAttribute("aria-disabled");
    if (href) el.setAttribute("href", href);
    if (label) el.textContent = label;
  }
  function paint() {
    var ok = amount > 0, inr = cur === "INR";
    show(upi, inr && !!sp.upiId && ok, "upi://pay?pa=" + encodeURIComponent(sp.upiId || "") + "&pn=" + encodeURIComponent(sp.payeeName || name) + "&am=" + amount + "&cu=INR&tn=Coffee", "Pay " + money(amount) + " by UPI");
    show(rzp, !!sp.checkoutEndpoint && ok, "", "Pay " + money(amount) + (inr ? " by card or netbanking" : " by card"));
    show(pp, !!sp.paypalMe && ok, "https://paypal.me/" + encodeURIComponent(sp.paypalMe || "") + "/" + amount + cur, "Pay " + money(amount) + " with PayPal");
    show(card, !sp.checkoutEndpoint && isUrl(sp.paymentPageUrl), sp.paymentPageUrl, "Card or international");
    copy.hidden = !(sp.upiId && inr);
    $("#qr").hidden = !(sp.upiId && isUrl(sp.qr) && inr);
    var any = [upi, rzp, pp, card].some(function (e) { return !e.hidden; });
    nopay.hidden = any;
    nopay.textContent = ok ? "Payments in " + cur + " are coming soon." : "Enter an amount to continue.";
  }
  function setAmount(v, fromInput) {
    amount = Math.max(0, Math.round((Number(v) || 0) * 100) / 100);
    if (!fromInput) input.value = "";
    amtEl.textContent = money(amount);
    /* the cup fills on a log scale of the rupee value, so small and large gifts both read */
    var inr = amount / (rates[cur] || 1);
    var f = inr <= 0 ? 0.05 : Math.min(1, Math.max(0.14, 0.14 + 0.86 * Math.log10(Math.max(inr, 10) / 10) / 2));
    liquid.style.transform = "translateY(" + (108 - f * 78).toFixed(1) + "px)";
    [].forEach.call(amtWrap.children, function (b) { b.setAttribute("aria-pressed", String(!fromInput && Number(b.getAttribute("data-v")) === amount)); });
    paint();
  }
  function setCurrency(c) {
    cur = c; buildAmounts();
    [].forEach.call(coins.children, function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-c") === c)); });
    var nm = c; try { nm = new Intl.DisplayNames(["en"], { type: "currency" }).of(c); } catch (e) {}
    $("#curname").textContent = c + " \u00B7 " + nm;
    setAmount(amtWrap.children[Math.min(1, amtWrap.children.length - 1)].getAttribute("data-v"), false);
  }
  COINS.forEach(function (c) {
    var b = h("button", { class: "coin" + (c[1].length > 2 ? " long" : ""), type: "button", "aria-pressed": "false", "aria-label": c[0], "data-c": c[0], text: c[1] });
    b.addEventListener("click", function () { setCurrency(c[0]); });
    coins.appendChild(b);
  });
  input.addEventListener("input", function () { setAmount(input.value, true); });
  if (sp.upiId) {
    copy.addEventListener("click", function () {
      var done = function () { copy.textContent = "Copied"; setTimeout(function () { copy.textContent = "Copy UPI ID"; }, 1600); };
      try { navigator.clipboard.writeText(sp.upiId).then(done, function () { copy.textContent = sp.upiId; }); }
      catch (e) { copy.textContent = sp.upiId; }
    });
  }
  if (sp.upiId && isUrl(sp.qr)) $("#qr-img").src = sp.qr;

  /* card payments in any currency: the server creates the order, Razorpay's popup takes the payment */
  function loadRzp() {
    return window.Razorpay ? Promise.resolve() : new Promise(function (res, rej) {
      var s = document.createElement("script"); s.src = "https://checkout.razorpay.com/v1/checkout.js"; s.onload = res; s.onerror = rej; document.head.appendChild(s);
    });
  }

  rzp.addEventListener("click", function () {
    if (amount <= 0) return;

    rzp.disabled = true;

    fetch(sp.checkoutEndpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ amount: amount, currency: cur })
    })
      .then(function (r) {
        return r.json().then(function (o) {
          if (!r.ok) {
            throw new Error(o.error || "Order creation failed");
          }
          return o;
        });
      })
      .then(function (o) {
        // Support both response formats.
        var orderId = o.order_id || o.id;

        if (!orderId || !o.key || !o.amount || !o.currency) {
          throw new Error("Incomplete Razorpay order response");
        }

        return loadRzp().then(function () {
          var checkout = new window.Razorpay({
            key: o.key,
            order_id: orderId,
            amount: o.amount,
            currency: o.currency,
            name: name,
            description: "Buy me a coffee",
            theme: { color: "#3340E8" },
            handler: function () {
              rzp.textContent = "Thank you!";
            }
          });

          checkout.open();
        });
      })
      .catch(function (err) {
        console.error("Razorpay checkout error:", err);
        rzp.textContent = "Could not start payment. Try again.";
      })
      .then(function () {
        rzp.disabled = false;
      });
  });


  setCurrency("INR");
  /* live rates are written daily by the sync job; the fallback rates in data.js cover any gap */
  fetch("https://open.er-api.com/v6/latest/INR").then(function (r) { return r.json(); }).then(function (j) {
    if (!j || !j.rates) return;
    COINS.forEach(function (c) { if (j.rates[c[0]]) rates[c[0]] = j.rates[c[0]]; });
    if (cur !== "INR") setCurrency(cur);
  }).catch(function () {});
  }
})();
