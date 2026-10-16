/* Floating pickups: click one and the page takes on that mood for ten seconds. */
(function () {
  "use strict";
  var root = document.documentElement, fx = document.getElementById("fx");
  var P = {
    leaf: '<path d="M5 19c0-9 5-14 14-14 0 9-5 14-14 14zM5 19l8-8"/>',
    flower: '<circle cx="12" cy="12" r="2.2"/><circle cx="12" cy="6.5" r="3"/><circle cx="12" cy="17.5" r="3"/><circle cx="6.5" cy="12" r="3"/><circle cx="17.5" cy="12" r="3"/>',
    cat: '<path d="M4 10V4l5 3.2h6L20 4v6c.8 1.2 1 2.4 1 3.5 0 3.6-4 6.5-9 6.5s-9-2.9-9-6.5c0-1.1.2-2.3 1-3.5z"/><path d="M9 12.5h.01M15 12.5h.01M11 15.5h2"/>',
    bike: '<circle cx="6" cy="16" r="3.5"/><circle cx="18" cy="16" r="3.5"/><path d="M6 16l4-8h5l3 8M10 8l3 8M14 5h3"/>',
    code: '<path d="M8 7l-5 5 5 5M16 7l5 5-5 5M13.5 5l-3 14"/>',
    clap: '<path d="M3 10h18v10H3zM3 10l1.5-5 16 3.5-1 1.5"/><path d="M9 5l4 1-1.5 4M14 6l3 .7-1 3"/>',
    nib: '<path d="M12 3l6 9-6 9-6-9z"/><circle cx="12" cy="12" r="1.5"/><path d="M12 3v7.5"/>',
    bell: '<path d="M3 9v6M6 7v10M18 7v10M21 9v6M6 12h12"/>',
    hand: '<path d="M9 11V5a1.5 1.5 0 0 1 3 0v5M12 10V4.5a1.5 1.5 0 0 1 3 0V11M15 10.5a1.5 1.5 0 0 1 3 0V16a6 6 0 0 1-6 6h-1a6 6 0 0 1-5-3l-3-5a1.6 1.6 0 0 1 2.6-1.8L9 15"/>',
    heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
    coin: '<circle cx="12" cy="12" r="8"/><path d="M12 8v8"/>',
    pad: '<path d="M7 8h10a4 4 0 0 1 4 4.5l-.5 3a2.5 2.5 0 0 1-4.3 1.2L14.5 15h-5l-1.7 1.7a2.5 2.5 0 0 1-4.3-1.2l-.5-3A4 4 0 0 1 7 8z"/><path d="M8 11v3M6.5 12.5h3M16 11.5h.01M18 13.5h.01"/>'
  };
  var V = {
    nature: { label: "Greenhouse", icons: ["leaf", "flower"], fx: "fall", n: 14 },
    cat: { label: "Cat mode", icons: ["cat"], fx: "cross", n: 3 },
    bike: { label: "Ride", icons: ["bike"], fx: "cross", n: 2 },
    code: { label: "Terminal", icons: ["code"], fx: "fall", n: 12 },
    movies: { label: "Now showing", icons: ["clap"], fx: "", n: 0 },
    design: { label: "Canvas", icons: ["nib"], fx: "", n: 0 },
    gym: { label: "Pump", icons: ["bell"], fx: "rise", n: 9 },
    gaming: { label: "Player one", icons: ["pad"], fx: "rise", n: 10 }
  };
  var keys = Object.keys(V), active = null, timer = null, nextT = null, pickEl = null, toast = null, cleanT = null;
  var still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var rnd = function (a, b) { return a + Math.random() * (b - a); };
  var pickOne = function (arr) { return arr[Math.floor(Math.random() * arr.length)]; };
  function icon(name, cls, tag) {
    var el = document.createElement(tag || "span");
    el.className = cls;
    el.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + P[name] + "</svg>";
    return el;
  }
  /* One mood after another: a shuffled deck, so nothing repeats until all eight have played.
     The place in the deck is remembered for the tab, so moving between pages does not restart it. */
  var deck = [], pos = 0;
  try {
    var saved = JSON.parse(sessionStorage.getItem("moodDeck"));
    if (saved && saved.deck && saved.deck.length === keys.length && saved.deck.every(function (k) { return V[k]; })) { deck = saved.deck; pos = saved.pos | 0; }
  } catch (e) {}
  function shuffle(last) {
    var a = keys.slice(), i, j, t;
    for (i = a.length - 1; i > 0; i--) { j = Math.floor(Math.random() * (i + 1)); t = a[i]; a[i] = a[j]; a[j] = t; }
    if (a[0] === last) { t = a[0]; a[0] = a[a.length - 1]; a[a.length - 1] = t; }   // never the same mood twice in a row
    return a;
  }
  function upcoming() { if (pos >= deck.length) { deck = shuffle(deck[deck.length - 1]); pos = 0; } return deck[pos]; }
  function advance() { pos++; try { sessionStorage.setItem("moodDeck", JSON.stringify({ deck: deck, pos: pos })); } catch (e) {} }

  /* Small or short screens get smaller objects, fewer particles and a tighter layout. */
  function compact() { return matchMedia("(max-width: 719px), (max-height: 540px)").matches; }
  function r(n) { return (n * (compact() ? 0.6 : 1)).toFixed(2) + "rem"; }

  /* ---- cursor, and one thing to play with per mood ---- */
  var CUR = { nature: "leaf", cat: "hand", bike: "bike", code: "code", movies: "clap", design: "nib", gym: "bell", gaming: "pad" };
  function cursorFor(key) {
    var cs = getComputedStyle(root), c = cs.getPropertyValue("--accent").trim() || "#000", bg = cs.getPropertyValue("--bg").trim() || "#fff", p = P[CUR[key]];
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><g stroke="' + bg + '" stroke-width="4.5">' + p + '</g><g stroke="' + c + '" stroke-width="2">' + p + "</g></svg>";
    return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '") 16 16, auto';
  }
  function poke() { if (!active) return; clearTimeout(timer); timer = setTimeout(stop, 12000); }   // playing keeps the mood alive
  function say(t) { if (toast) toast.textContent = t + " \u00B7 tap to end"; }
  function add(label, html, css, fn, tag) {
    var el = document.createElement(tag || "button");
    el.className = "stage"; el.style.cssText = css; el.innerHTML = html; el.setAttribute("aria-label", label);
    if (tag) el.setAttribute("role", "group"); else el.type = "button";
    if (fn) el.addEventListener("click", function (e) { poke(); fn(el, e); });
    fx.appendChild(el); return el;
  }
  function at(el) { var r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }
  function replay(el, c) { el.classList.remove(c); void el.offsetWidth; el.classList.add(c); }
  function puff(x, y, name, n, dy, sp) {
    n = Math.max(1, Math.ceil(n * (compact() ? 0.55 : 1)));
    for (var i = 0; i < n; i++) {
      var p = icon(name, "fxp pf");
      p.style.setProperty("--s", compact() ? "1.2rem" : "1.6rem"); p.style.setProperty("--px", x + "px"); p.style.setProperty("--py", y + "px");
      p.style.setProperty("--dx", rnd(-sp, sp) + "px"); p.style.setProperty("--dy", dy * rnd(.7, 1.2) + "px");
      p.style.setProperty("--r", rnd(-180, 180) + "deg"); p.style.setProperty("--d", rnd(1.1, 1.8) + "s"); p.style.setProperty("--w", "0s");
      fx.appendChild(p); setTimeout(function (q) { q.remove(); }, 2000, p);
    }
  }
  function sv(inner, cls, vb) { return '<svg class="' + (cls || "") + '" viewBox="' + (vb || "0 0 24 24") + '" fill="none" stroke="currentColor" stroke-width="' + (vb ? 2.4 : 1.7) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + "</svg>"; }
  var S = {
    nature: function () {
      add("A tree. Press to shake its leaves loose.", sv('<path d="M50 118V72M50 94l-15-14M50 86l14-12"/><circle cx="50" cy="40" r="26" fill="var(--bg)"/><circle cx="29" cy="58" r="17" fill="var(--bg)"/><circle cx="71" cy="58" r="17" fill="var(--bg)"/>', "", "0 0 100 120"),
        "left:.5rem;bottom:0;width:" + r(9), function (el) { replay(el, "shake"); var p = at(el); puff(p[0], p[1] - 30, "leaf", 14, 260, 150); });
      var petals = [0, 72, 144, 216, 288].map(function (a) { return '<g transform="rotate(' + a + ' 50 48)"><ellipse class="pt" cx="50" cy="32" rx="8" ry="15" fill="var(--bg)"/></g>'; }).join("");
      add("A bud. Press to bloom.", sv('<path d="M50 118V58M50 100q-18-3-22-18 15 0 22 18"/>' + petals + '<circle cx="50" cy="48" r="5"/>', "", "0 0 100 120"),
        "right:.75rem;bottom:0;width:" + r(5.5), function (el) { el.classList.toggle("open"); if (el.classList.contains("open")) { var p = at(el); puff(p[0], p[1] - 40, "flower", 5, -90, 70); } });
    },
    cat: function () {
      var n = 0;
      add("A cat. Press to pet it.", sv(P.cat, "cat"), "right:12%;bottom:0;animation-delay:.8s;width:" + r(8), function (el) {
        n++; replay(el, "pet"); var p = at(el); puff(p[0], p[1] - 30, "heart", 3, -130, 50); say("Purr x" + n);
      });
    },
    bike: function () {
      add("A bike. Press to ride.", sv(P.bike), "left:.5rem;bottom:0;width:" + r(6), function (el) {
        if (el.classList.contains("go")) return; el.classList.add("go"); say("Ring ring!");
        el.addEventListener("animationend", function f(e) { if (e.animationName === "ride") { el.classList.remove("go"); el.removeEventListener("animationend", f); } });
      });
    },
    code: function () {
      var L = ["$ npm run coffee", "> brewing... done", '$ git commit -m "it works"', "> 0 bugs (suspicious)", "$ git push --force", "> nobody saw that"], i = 0, out = [];
      var el = add("A terminal. Press to run the next command.", '<span class="term"></span>', "right:.75rem;bottom:.75rem;width:" + (compact() ? "min(15rem,calc(100vw - 1.5rem))" : "min(17rem,70vw)"), function () { next(); });
      function next() { out.push(L[i++ % L.length]); out = out.slice(compact() ? -3 : -4); el.firstChild.textContent = out.join("\n"); }
      next();
    },
    movies: function () {
      add("A clapperboard. Press for action.", sv('<rect x="3" y="11" width="18" height="10" rx="1" fill="var(--bg)"/><g class="arm"><path d="M3 11V6.5h18V11" fill="var(--bg)"/><path d="M7 6.5L5 11M12 6.5L10 11M17 6.5L15 11"/></g>'),
        "right:.75rem;bottom:calc(9vh + .6rem);width:" + r(7), function (el) {
          el.classList.add("clap"); setTimeout(function () { el.classList.remove("clap"); }, 160);
          var f = document.createElement("div"); f.className = "flash"; fx.appendChild(f); setTimeout(function () { f.remove(); }, 600); say("Action!");
        });
    },
    design: function () {
      var w = add("Pick an accent colour", "", "right:.75rem;bottom:.75rem;display:flex;gap:.5rem", null, "div");
      ["#E0246E", "#2F6BFF", "#FF8A00", "#11A36A"].forEach(function (c) {
        var b = document.createElement("button"); b.type = "button"; b.className = "sw"; b.style.background = c; b.setAttribute("aria-label", "Use colour " + c);
        b.onclick = function () { poke(); root.style.setProperty("--accent", c); var p = at(b); puff(p[0], p[1], "nib", 3, -70, 40); };
        w.appendChild(b);
      });
    },
    gym: function () {
      var n = 0;
      add("A dumbbell. Press to lift.", sv(P.bell) + '<span class="cnt">0 reps</span>', "right:.75rem;bottom:.75rem;width:" + r(7), function (el) {
        n++; el.querySelector(".cnt").textContent = n + " reps"; replay(el, "lift"); if (n % 10 === 0) say("Beast mode");
      });
    },
    gaming: function () {
      var s = 0;
      add("A question block. Press to collect a coin.", '<span class="qb">?</span><span class="cnt">Score 0000</span>', "left:.75rem;bottom:.75rem", function (el) {
        s += 100; el.querySelector(".cnt").textContent = "Score " + String(s).padStart(4, "0"); replay(el, "bump"); var p = at(el); puff(p[0], p[1] - 40, "coin", 1, -110, 10);
      });
    }
  };
  function start(key) {
    if (active) return;
    advance();
    active = key; var v = V[key];
    clearTimeout(cleanT); fx.textContent = "";   // wipe anything left from the previous mood
    clearTimeout(nextT);
    root.setAttribute("data-vibe", key);
    root.style.setProperty("--cur", cursorFor(key));
    if (S[key]) S[key]();
    var cnt = compact() ? Math.ceil(v.n * 0.5) : v.n;
    for (var i = 0; i < cnt; i++) {
      var p = icon(pickOne(v.icons), "fxp " + v.fx), s = (v.fx === "cross" ? rnd(2.6, 3.6) : rnd(1.2, 2.2)) * (compact() ? 0.75 : 1);
      p.style.setProperty("--s", s + "rem");
      p.style.setProperty("--x", rnd(0, 95) + "%");
      p.style.setProperty("--y", rnd(55, 88) + "%");
      p.style.setProperty("--dx", rnd(-12, 12) + "vw");
      p.style.setProperty("--r", rnd(-200, 200) + "deg");
      p.style.setProperty("--d", (v.fx === "cross" ? rnd(5, 6.5) : rnd(4.5, 7)) + "s");
      p.style.setProperty("--w", (v.fx === "cross" ? i * 1.6 : rnd(0, 3)) + "s");
      fx.appendChild(p);
    }
    toast = document.createElement("button");
    toast.type = "button"; toast.className = "toast"; toast.setAttribute("aria-live", "polite");
    toast.textContent = v.label + " \u00B7 tap to end";
    toast.onclick = stop;
    document.body.appendChild(toast);
    poke();
  }
  function stop() {
    if (!active) return;
    clearTimeout(timer); active = null;
    root.removeAttribute("data-vibe");
    root.style.removeProperty("--cur"); root.style.removeProperty("--accent");
    if (toast) { toast.remove(); toast = null; }
    cleanT = setTimeout(function () { if (!active) fx.textContent = ""; }, 700);
    schedule(12000, 20000);
  }
  /* floating pickups are drawn toward the mouse once it gets close, so they are easy to catch */
  var mx = -1e4, my = -1e4, near = false, ax = 0, ay = 0, avx = 0, avy = 0, araf = 0;
  function pull() {
    araf = 0;
    if (!pickEl) return;
    var r = pickEl.getBoundingClientRect(), cx = r.left + r.width / 2 - ax, cy = r.top + r.height / 2 - ay;
    var dx = mx - cx, dy = my - cy, d = Math.sqrt(dx * dx + dy * dy) || 1, R = 190;
    var k = d < R ? Math.min(1, (1 - d / R) * 3) : 0;   // stronger the closer you are
    near = k > 0;
    avx = (avx + (dx * k - ax) * 0.14) * 0.74; avy = (avy + (dy * k - ay) * 0.14) * 0.74;
    ax += avx; ay += avy;
    pickEl.style.translate = ax.toFixed(1) + "px " + ay.toFixed(1) + "px";
    if (near || Math.abs(avx) + Math.abs(avy) + Math.abs(ax) + Math.abs(ay) > 0.5) araf = requestAnimationFrame(pull);
  }
  addEventListener("pointermove", function (e) { if (e.pointerType === "mouse") { mx = e.clientX; my = e.clientY; if (pickEl && !araf) araf = requestAnimationFrame(pull); } }, { passive: true });
  function dropPickup() {
    if (active || document.hidden) return schedule(4000, 6000);
    var key = upcoming(), el = icon(pickOne(V[key].icons), "pick", "button");
    el.type = "button";
    el.setAttribute("aria-label", "A floating " + V[key].label.toLowerCase() + " surprise. Press to change the mood for a few seconds.");
    el.style.left = rnd(6, 88) + "vw"; el.style.top = rnd(18, 78) + "vh";
    el.onclick = function () { el.remove(); pickEl = null; start(key); };
    document.body.appendChild(el); pickEl = el;
    ax = ay = avx = avy = 0; near = false; if (!araf) araf = requestAnimationFrame(pull);
    (function expire(t) {
      setTimeout(function () {
        if (!el.parentNode) return;
        if (near && pickEl === el) return expire(1500);   // do not vanish while someone is reaching for it
        el.classList.add("bye");
        setTimeout(function () { if (el.parentNode) { el.remove(); pickEl = null; schedule(10000, 18000); } }, 650);
      }, t);
    })(9000);
  }
  function schedule(a, b) { clearTimeout(nextT); if (!still) nextT = setTimeout(dropPickup, rnd(a, b)); }
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") stop(); });
  document.getElementById("surprise").addEventListener("click", function () { if (pickEl) { pickEl.remove(); pickEl = null; } start(upcoming()); });
  schedule(5000, 8000);
})();
