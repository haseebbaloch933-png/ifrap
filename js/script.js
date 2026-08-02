/* ===========================================================
   Anthropology Portfolio — script.js
   Handles: mobile nav, theme toggle, scroll reveal,
   footer year, and contact form (client-side only).
   =========================================================== */

(function () {
  "use strict";

  /* ----- Mobile navigation ----- */
  var navToggle = document.getElementById("navToggle");
  var navMenu = document.getElementById("navMenu");

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      var isOpen = navMenu.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });
    // Close the menu when a link is clicked
    navMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navMenu.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ----- Theme toggle (persisted) ----- */
  var themeToggle = document.getElementById("themeToggle");
  var root = document.documentElement;

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    try { localStorage.setItem("theme", theme); } catch (e) {}
  }

  // Initialise from saved preference or system setting
  var saved;
  try { saved = localStorage.getItem("theme"); } catch (e) {}
  if (saved) {
    root.setAttribute("data-theme", saved);
  } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    root.setAttribute("data-theme", "dark");
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var current = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
      applyTheme(current === "dark" ? "light" : "dark");
    });
  }

  /* ----- Scroll reveal ----- */
  var revealEls = document.querySelectorAll(".section, .hero-text, .hero-portrait");
  revealEls.forEach(function (el) { el.classList.add("reveal"); });

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ----- Footer year ----- */
  var yearEl = document.getElementById("year");
  if (yearEl) { yearEl.textContent = new Date().getFullYear(); }

  /* ----- Contact form (client-side demo) ----- */
  var form = document.getElementById("contactForm");
  var status = document.getElementById("formStatus");

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.name.value.trim();
      var email = form.email.value.trim();
      var message = form.message.value.trim();

      if (!name || !email || !message) {
        if (status) { status.textContent = "Please fill in all fields."; }
        return;
      }
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!emailOk) {
        if (status) { status.textContent = "Please enter a valid email address."; }
        return;
      }

      // No backend yet — this is a front-end demo.
      // To receive real messages, connect a form service such as
      // Formspree, Getform, or a Vercel serverless function.
      if (status) {
        status.textContent = "Thanks, " + name + "! Your message has been recorded locally. (Connect a form backend to receive it.)";
      }
      form.reset();
    });
  }
})();
