/* 行者纪元 Epoch Drive — 站点交互脚本 */
(function () {
  "use strict";

  /* ---------- 移动端导航 ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? "×" : "≡";
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A" && window.innerWidth <= 860) {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.textContent = "≡";
      }
    });
  }

  /* ---------- FAQ 手风琴 ---------- */
  document.querySelectorAll(".faq-q").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var item = btn.parentElement;
      var open = item.classList.contains("open");
      // 同组内单开
      item.parentElement.querySelectorAll(".faq-item.open").forEach(function (other) {
        if (other !== item) other.classList.remove("open");
      });
      item.classList.toggle("open", !open);
      btn.setAttribute("aria-expanded", !open ? "true" : "false");
    });
  });

  /* ---------- 滚动进场动画 ----------
     元素默认可见；只有确认脚本能把它点亮时才隐藏，
     避免 JS 异常或观察器未触发时内容永久不可见。 */
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var targets = Array.prototype.slice.call(
    document.querySelectorAll(".card, .product, .route, .step, .band-cell, .hero-stat")
  );
  if (!reduce && "IntersectionObserver" in window && targets.length) {
    var revealed = 0;
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
            io.unobserve(entry.target);
            revealed++;
          }
        });
        if (revealed === targets.length) io.disconnect();
      },
      { threshold: 0.08, rootMargin: "0px 0px -30px 0px" }
    );
    // 先让首屏元素进入观察，再统一隐藏，保证触发时能正确过渡
    requestAnimationFrame(function () {
      targets.forEach(function (el, i) {
        el.style.transition = "opacity .55s ease " + (i % 4) * 60 + "ms, transform .55s ease " + (i % 4) * 60 + "ms";
        el.style.opacity = "0";
        el.style.transform = "translateY(14px)";
        io.observe(el);
      });
    });
    // 兜底：3 秒后仍未显现的元素强制显示
    setTimeout(function () {
      targets.forEach(function (el) {
        if (el.style.opacity === "0") {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
        }
      });
      io.disconnect();
    }, 3000);
  }

  /* ---------- 表单处理（演示：本地校验 + 提示） ---------- */
  var form = document.querySelector("#inquiry-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var status = form.querySelector(".form-status");
      var name = (form.querySelector("#name") || {}).value || "";
      var contact = (form.querySelector("#contact") || {}).value || "";
      if (!name.trim() || !contact.trim()) {
        status.className = "form-status show";
        status.style.background = "rgba(168,69,47,.08)";
        status.style.border = "1px solid rgba(168,69,47,.35)";
        status.style.color = "#a8452f";
        status.textContent = "请填写称呼与联系方式，我们才能回复你。";
        return;
      }
      status.className = "form-status show ok";
      status.textContent =
        "已收到，" + name.trim() + "。这是演示站点，表单未发送到服务器。正式上线后我们会在 15 分钟内与你联系。";
      form.reset();
    });
  }

  /* ---------- 当前页导航高亮 ---------- */
  var here = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav a[href]").forEach(function (a) {
    var target = a.getAttribute("href").split("/").pop();
    if (target === here) a.setAttribute("aria-current", "page");
  });

  /* ---------- 背景图探测 ----------
     背景图用 CSS background 加载，无法用 img 的 onerror 判断失败，
     因此先用 Image() 预加载：成功才给 body 加类并设置 background-image，
     失败则保留原有的 CSS 渐变，页面不会出现破图。 */
  function applyBackground(el, url) {
    if (!el || !url) return;
    var probe = new Image();
    probe.onload = function () {
      el.style.backgroundImage = 'url("' + url + '")';
    };
    probe.onerror = function () {
      /* 图片缺失：静默回落到渐变背景 */
    };
    probe.src = url;
  }

  var heroPhoto = document.querySelector(".hero-photo");
  if (heroPhoto) {
    var heroUrl = heroPhoto.getAttribute("data-bg");
    applyBackground(heroPhoto, heroUrl);
    if (heroUrl) {
      var p = new Image();
      p.onload = function () { document.body.classList.add("has-hero-photo"); };
      p.src = heroUrl;
    }
  }

  var pagePhoto = document.querySelector(".page-head-photo");
  if (pagePhoto) {
    var pageUrl = pagePhoto.getAttribute("data-bg");
    applyBackground(pagePhoto, pageUrl);
    if (pageUrl) {
      var q = new Image();
      q.onload = function () { document.body.classList.add("has-page-photo"); };
      q.src = pageUrl;
    }
  }

  /* ---------- 图片淡入 ---------- */
  document.querySelectorAll(".ph img").forEach(function (img) {
    if (img.complete && img.naturalWidth > 0) {
      img.parentElement.classList.add("loaded");
    } else {
      img.addEventListener("load", function () {
        img.parentElement.classList.add("loaded");
      });
      img.addEventListener("error", function () {
        img.parentElement.style.display = "none";
      });
    }
  });
})();
