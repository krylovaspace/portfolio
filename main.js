(function () {
  var S = window.SITE || { sketches: [], works: [] };
  var IMG = "assets/img/";
  var isMobile = function () { return window.matchMedia("(max-width: 760px)").matches; };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  // ---------- текст с \n: переносы только на десктопе
  function setText(el, t) {
    el.textContent = "";
    t.split("\n").forEach(function (part, i) {
      if (i) { var br = document.createElement("br"); br.className = "br-d"; el.appendChild(br); el.appendChild(document.createTextNode(" ")); }
      el.appendChild(document.createTextNode(part));
    });
  }

  // ---------- круг из точек: 112 точек, мельче на осях, крупнее по диагоналям
  var svg = document.querySelector(".dots");
  if (svg) {
    var n = 112, c = 246, r = 239.5, out = "";
    for (var i = 0; i < n; i++) {
      var a = (i / n) * Math.PI * 2;
      var d = 9.2 + 3.8 * Math.abs(Math.sin(2 * a));
      out += '<circle cx="' + (c + r * Math.cos(a)).toFixed(2) + '" cy="' + (c + r * Math.sin(a)).toFixed(2) + '" r="' + (d / 2).toFixed(2) + '" fill="currentColor"/>';
    }
    svg.innerHTML = out;

    // вращение от скролла: вниз — по часовой, вверх — против (крутится весь круг вместе с надписью)
    var ring = document.querySelector(".hero-circle");
    if (!reduce && ring) {
      var angle = 0, target = 0, lastY = window.scrollY, spinning = false;
      var spin = function () {
        angle += (target - angle) * 0.12;
        ring.style.transform = "rotate(" + angle.toFixed(3) + "deg)";
        if (Math.abs(target - angle) > 0.01) requestAnimationFrame(spin); else spinning = false;
      };
      window.addEventListener("scroll", function () {
        var y = window.scrollY;
        target += (y - lastY) * 0.12;
        lastY = y;
        if (!spinning) { spinning = true; requestAnimationFrame(spin); }
      }, { passive: true });
    }
  }

  // ---------- какой файл показывать (на телефоне может быть свой)
  function srcFor(item) { return (isMobile() && item.mobileFile) ? item.mobileFile : item.file; }
  function captionFor(item) { return (isMobile() && item.mobileCaption) ? item.mobileCaption : item.caption; }
  function posterFor(item) { return (isMobile() && item.mobilePoster) ? item.mobilePoster : item.poster; }

  // ---------- сетка Visual sketches
  var grid = document.querySelector("[data-grid]");
  var tiles = [];
  S.sketches.forEach(function (item, idx) {
    var li = document.createElement("li");
    if (item.mobile === false) li.className = "no-mobile";
    else if (item.mobile) li.style.setProperty("--mo", item.mobile);
    var box = document.createElement("button");
    box.type = "button";
    box.className = "tile-media" + (item.fit === "inset" ? " inset" : "");
    box.setAttribute("aria-label", "Open: " + item.caption.replace(/\n/g, " "));
    var isVideo = /\.(mp4|webm|mov)$/i.test(item.file);
    var el;
    if (isVideo) {
      el = document.createElement("video");
      el.muted = true; el.loop = true; el.autoplay = true; el.playsInline = true;
      el.setAttribute("muted", ""); el.setAttribute("playsinline", "");
      el.preload = "metadata";
      if (posterFor(item)) el.poster = IMG + posterFor(item);
      el.src = IMG + srcFor(item);
    } else {
      el = document.createElement("img");
      el.loading = "lazy";
      el.alt = item.caption.replace(/\n/g, " ");
      el.src = IMG + item.file;
    }
    el.addEventListener("error", function () {
      // видео не проигрывается — показываем кадр-постер
      if (isVideo && posterFor(item)) {
        var img = document.createElement("img");
        img.src = IMG + posterFor(item); img.alt = item.caption.replace(/\n/g, " ");
        box.replaceChild(img, el);
        return;
      }
      box.classList.add("missing"); box.textContent = item.file;
    });
    box.appendChild(el);
    var cap = document.createElement("p");
    cap.className = "tile-caption";
    setText(cap, captionFor(item));
    li.appendChild(box); li.appendChild(cap);
    grid.appendChild(li);
    tiles.push({ item: item, li: li, box: box, video: isVideo, media: el, cap: cap });
    box.addEventListener("click", function () { openLightbox(idx); });
  });

  // при смене десктоп/телефон подменяем видео, у которых есть мобильная версия
  var mq = window.matchMedia("(max-width: 760px)");
  var onMq = function () {
    tiles.forEach(function (t) {
      if (t.item.mobileCaption) setText(t.cap, captionFor(t.item));
      if (!t.video || !t.item.mobileFile) return;
      var want = IMG + srcFor(t.item);
      if (t.media.getAttribute("src") !== want) {
        if (posterFor(t.item)) t.media.poster = IMG + posterFor(t.item);
        t.media.src = want;
        var p = t.media.play(); if (p && p.catch) p.catch(function () {});
      }
    });
  };
  if (mq.addEventListener) mq.addEventListener("change", onMq); else if (mq.addListener) mq.addListener(onMq);

  // видео играют только в зоне видимости
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { var p = e.target.play(); if (p && p.catch) p.catch(function () {}); }
        else e.target.pause();
      });
    }, { rootMargin: "200px" });
    document.querySelectorAll(".tile-media video").forEach(function (v) { io.observe(v); });
  }

  // ---------- курсор «+» над картинками
  var cur = null;
  if (fine && !reduce) {
    document.documentElement.classList.add("has-cursor");
    // два слоя: круг с инверсией цвета и белый плюс поверх
    var dot = document.createElement("div"); dot.className = "cursor";
    var plus = document.createElement("div"); plus.className = "cursor-plus"; plus.innerHTML = "<span></span>";
    document.body.appendChild(dot); document.body.appendChild(plus);
    cur = {
      classList: { add: function (c) { dot.classList.add(c); plus.classList.add(c); }, remove: function (c) { dot.classList.remove(c); plus.classList.remove(c); } }
    };
    var x = 0, y = 0, cx = 0, cy = 0, raf = null;
    var tick = function () {
      cx += (x - cx) * 0.22; cy += (y - cy) * 0.22;
      dot.style.left = plus.style.left = cx + "px";
      dot.style.top = plus.style.top = cy + "px";
      raf = (Math.abs(x - cx) > 0.1 || Math.abs(y - cy) > 0.1) ? requestAnimationFrame(tick) : null;
    };
    tiles.forEach(function (t) {
      t.box.addEventListener("mouseenter", function (e) { x = cx = e.clientX; y = cy = e.clientY; tick(); cur.classList.add("on"); });
      t.box.addEventListener("mousemove", function (e) { x = e.clientX; y = e.clientY; if (!raf) raf = requestAnimationFrame(tick); });
      t.box.addEventListener("mouseleave", function () { cur.classList.remove("on"); });
    });
  }

  // ---------- лайтбокс: увеличение картинки и листание
  var lb = document.createElement("div");
  lb.className = "lb";
  lb.setAttribute("role", "dialog");
  lb.setAttribute("aria-modal", "true");
  lb.setAttribute("aria-label", "Project preview");
  lb.innerHTML =
    '<div class="lb-bg"></div>' +
    '<div class="lb-stage"></div>' +
    '<button type="button" class="lb-btn lb-close" aria-label="Close"><svg viewBox="0 0 24 24"><path d="M5 5l14 14M19 5L5 19"/></svg></button>' +
    '<button type="button" class="lb-btn lb-prev" aria-label="Previous"><svg viewBox="0 0 24 24"><path d="M15 4l-8 8 8 8"/></svg></button>' +
    '<button type="button" class="lb-btn lb-next" aria-label="Next"><svg viewBox="0 0 24 24"><path d="M9 4l8 8-8 8"/></svg></button>';
  document.body.appendChild(lb);
  var stage = lb.querySelector(".lb-stage");
  var order = [], pos = 0, current = null, lastFocus = null, busy = false;

  function visibleOrder() {
    var list = tiles.map(function (t, i) { return i; });
    if (isMobile()) {
      list = list.filter(function (i) { return tiles[i].item.mobile !== false; })
        .sort(function (a, b) { return (tiles[a].item.mobile || 99) - (tiles[b].item.mobile || 99); });
    }
    return list;
  }

  function makeMedia(t) {
    var m;
    if (t.video) {
      m = document.createElement("video");
      m.muted = true; m.loop = true; m.autoplay = true; m.playsInline = true;
      m.setAttribute("muted", ""); m.setAttribute("playsinline", "");
      if (posterFor(t.item)) m.poster = IMG + posterFor(t.item);
      m.src = IMG + srcFor(t.item);
    } else {
      m = document.createElement("img");
      m.alt = t.item.caption.replace(/\n/g, " ");
      m.src = IMG + t.item.file;
    }
    m.className = "lb-media";
    return m;
  }

  function finalRect(aspect) {
    var vw = window.innerWidth, vh = window.innerHeight;
    var maxW = isMobile() ? vw - 16 : vw - 200, maxH = isMobile() ? vh * 0.75 : vh * 0.91;
    var w = maxW, h = w / aspect;
    if (h > maxH) { h = maxH; w = h * aspect; }
    return { left: (vw - w) / 2, top: (vh - h) / 2, width: w, height: h };
  }

  function place(el, r) {
    el.style.left = r.left + "px"; el.style.top = r.top + "px";
    el.style.width = r.width + "px"; el.style.height = r.height + "px";
  }

  function rectOf(t) {
    return (t.item.fit === "inset" ? t.media : t.box).getBoundingClientRect();
  }

  function aspectOf(t) {
    var src = t.box.querySelector("img, video");
    if (src && src.naturalWidth) return src.naturalWidth / src.naturalHeight;
    if (src && src.videoWidth) return src.videoWidth / src.videoHeight;
    return 1;
  }

  function flipFrom(el, from, to, dur) {
    if (reduce || !el.animate) return null;
    var sx = from.width / to.width, sy = from.height / to.height;
    var dx = from.left - to.left, dy = from.top - to.top;
    return el.animate([
      { transform: "translate(" + dx + "px," + dy + "px) scale(" + sx + "," + sy + ")" },
      { transform: "none" }
    ], { duration: dur, easing: "cubic-bezier(.7,0,.2,1)" });
  }

  function openLightbox(idx) {
    if (busy) return;
    order = visibleOrder();
    pos = Math.max(0, order.indexOf(idx));
    lastFocus = document.activeElement;
    if (cur) cur.classList.remove("on");
    var t = tiles[idx];
    var from = rectOf(t);
    var to = finalRect(aspectOf(t));
    stage.innerHTML = "";
    current = makeMedia(t);
    place(current, to);
    stage.appendChild(current);
    document.documentElement.classList.add("lb-lock");
    lb.classList.add("open");
    t.box.style.visibility = "hidden";
    var anim = flipFrom(current, from, to, 650);
    busy = true;
    var done = function () { busy = false; t.box.style.visibility = ""; };
    if (anim) anim.onfinish = done; else done();
    lb.querySelector(".lb-close").focus({ preventScroll: true });
  }

  function closeLightbox() {
    if (!lb.classList.contains("open") || busy) return;
    var t = tiles[order[pos]];
    var to = current.getBoundingClientRect();
    var from = rectOf(t);
    var inView = from.bottom > 0 && from.top < window.innerHeight && from.width > 0;
    busy = true;
    lb.classList.remove("open");
    var finish = function () {
      busy = false; stage.innerHTML = ""; current = null; t.box.style.visibility = "";
      document.documentElement.classList.remove("lb-lock");
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    };
    if (inView && !reduce && current.animate) {
      t.box.style.visibility = "hidden";
      var sx = from.width / to.width, sy = from.height / to.height;
      var anim = current.animate([
        { transform: "none" },
        { transform: "translate(" + (from.left - to.left) + "px," + (from.top - to.top) + "px) scale(" + sx + "," + sy + ")" }
      ], { duration: 550, easing: "cubic-bezier(.7,0,.2,1)", fill: "forwards" });
      anim.onfinish = finish;
    } else {
      setTimeout(finish, reduce ? 0 : 300);
      current.style.opacity = "0";
    }
  }

  function go(step) {
    if (busy || !current) return;
    pos = (pos + step + order.length) % order.length;
    var t = tiles[order[pos]];
    var next = makeMedia(t);
    var old = current;
    var show = function () {
      var ar = next.naturalWidth ? next.naturalWidth / next.naturalHeight : (next.videoWidth ? next.videoWidth / next.videoHeight : 1);
      place(next, finalRect(ar));
      stage.appendChild(next);
      current = next;
      if (reduce || !next.animate) { old.remove(); return; }
      busy = true;
      old.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateX(" + (-40 * step) + "px)" }], { duration: 350, easing: "ease", fill: "forwards" })
        .onfinish = function () { old.remove(); };
      next.animate([{ opacity: 0, transform: "translateX(" + (40 * step) + "px)" }, { opacity: 1, transform: "none" }], { duration: 450, easing: "cubic-bezier(.2,.7,.2,1)" })
        .onfinish = function () { busy = false; };
    };
    if (t.video) { next.addEventListener("loadedmetadata", show, { once: true }); }
    else if (next.complete && next.naturalWidth) show();
    else { next.addEventListener("load", show, { once: true }); next.addEventListener("error", show, { once: true }); }
  }

  lb.querySelector(".lb-close").addEventListener("click", closeLightbox);
  lb.querySelector(".lb-bg").addEventListener("click", closeLightbox);
  lb.querySelector(".lb-prev").addEventListener("click", function () { go(-1); });
  lb.querySelector(".lb-next").addEventListener("click", function () { go(1); });
  document.addEventListener("keydown", function (e) {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") closeLightbox();
    else if (e.key === "ArrowRight") go(1);
    else if (e.key === "ArrowLeft") go(-1);
    else if (e.key === "Tab") {
      var f = Array.prototype.slice.call(lb.querySelectorAll("button"));
      var i = f.indexOf(document.activeElement);
      e.preventDefault();
      f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  });
  var tx = null, ty = null;
  lb.addEventListener("touchstart", function (e) { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  lb.addEventListener("touchend", function (e) {
    if (tx === null) return;
    var dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
    else if (dy > 90) closeLightbox();
    tx = ty = null;
  });
  window.addEventListener("resize", function () {
    if (current && lb.classList.contains("open") && !busy) {
      var ar = current.naturalWidth ? current.naturalWidth / current.naturalHeight : (current.videoWidth ? current.videoWidth / current.videoHeight : 1);
      place(current, finalRect(ar));
    }
  });

  // ---------- список Works
  var list = document.querySelector("[data-works]");
  var preview = document.querySelector(".works-preview");
  var pImg = preview.querySelector("img");
  var activeRow = null;

  S.works.forEach(function (w) {
    var li = document.createElement("li");
    var a = document.createElement("a");
    a.className = "work";
    a.href = w.url; a.target = "_blank"; a.rel = "noopener";
    a.innerHTML =
      '<span class="work-name"><span class="name-roll"><span class="nr-a"></span><span class="nr-b" aria-hidden="true"></span></span></span>' +
      '<span class="work-text"></span>' +
      '<span class="work-label"><span class="status"></span><span class="action"></span></span>' +
      '<img class="work-image" loading="lazy" alt="">';
    setText(a.querySelector(".nr-a"), w.name);
    setText(a.querySelector(".nr-b"), w.name);
    setText(a.querySelector(".work-text"), w.text);
    a.querySelector(".status").textContent = w.status;
    a.querySelector(".action").textContent = w.action;
    var wi = a.querySelector(".work-image");
    if (w.mobileImage || w.preview) { wi.src = IMG + (w.mobileImage || w.preview); wi.alt = w.name.replace(/\n/g, " "); } else wi.remove();

    if (w.preview) {
      var pre = new Image(); pre.src = IMG + w.preview;
      var show = function () {
        if (isMobile()) return;
        preview.style.top = (a.offsetTop + a.offsetHeight / 2) + "px";
        if (activeRow !== a) {
          pImg.src = IMG + w.preview;
          preview.classList.remove("on");
          void preview.offsetWidth; // перезапуск анимации появления
          preview.classList.add("on");
          activeRow = a;
        }
      };
      a.addEventListener("mouseenter", show);
      a.addEventListener("focus", show);
    }
    li.appendChild(a);
    list.appendChild(li);
  });
  var hidePreview = function () { preview.classList.remove("on"); activeRow = null; };
  list.addEventListener("mouseleave", hidePreview);
  list.addEventListener("focusout", function (e) { if (!list.contains(e.relatedTarget)) hidePreview(); });

  // ---------- эффект «подмена текста» на ссылках
  function roll(el) {
    var t = el.textContent.trim();
    if (!t) return;
    el.textContent = "";
    var r = document.createElement("span"); r.className = "roll";
    var i = document.createElement("span"); i.className = "roll-in";
    var a = document.createElement("span"); a.textContent = t;
    var b = document.createElement("span"); b.textContent = t; b.setAttribute("aria-hidden", "true");
    i.appendChild(a); i.appendChild(b); r.appendChild(i); el.appendChild(r);
  }
  document.querySelectorAll(".nav, .corner a, a.footer-cell .footer-value, .footer-domain").forEach(roll);
})();
