/* The Ledger Max — site behaviour (no dependencies) */
(function () {
  "use strict";
  var CFG = window.TLM_CONFIG || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* Mobile navigation */
  var toggle = $(".nav-toggle"), nav = $(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* Footer year */
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* Generic button group: buttons with [data-group] and [data-value];
     targets with [data-<group>] are shown when they match (or "all"). */
  function bindGroup(group, onChange) {
    var buttons = $$('[data-group="' + group + '"]');
    if (!buttons.length) return;
    function select(value) {
      buttons.forEach(function (b) {
        var on = b.getAttribute("data-value") === value;
        b.setAttribute(b.getAttribute("role") === "tab" ? "aria-selected" : "aria-pressed", on ? "true" : "false");
      });
      onChange(value);
    }
    buttons.forEach(function (b) { b.addEventListener("click", function () { select(b.getAttribute("data-value")); }); });
    var initial = buttons.filter(function (b) { return b.getAttribute("aria-pressed") === "true" || b.getAttribute("aria-selected") === "true"; })[0] || buttons[0];
    select(initial.getAttribute("data-value"));
  }

  /* Services filter */
  bindGroup("svc", function (v) {
    var shown = 0;
    $$("[data-cat]").forEach(function (el) {
      var on = v === "all" || el.getAttribute("data-cat") === v;
      el.hidden = !on; if (on) shown++;
    });
    var c = $("[data-shown]"); if (c) c.textContent = shown;
  });

  /* Industries picker */
  bindGroup("ind", function (v) {
    $$("[data-ind]").forEach(function (el) { el.hidden = el.getAttribute("data-ind") !== v; });
  });

  /* Federal tax filter */
  bindGroup("fed", function (v) {
    $$("[data-who]").forEach(function (el) {
      var who = el.getAttribute("data-who");
      el.hidden = !(v === "all" || who === v || who === "both");
    });
  });

  /* State tabs */
  bindGroup("state", function (v) {
    $$("[data-state]").forEach(function (el) { el.hidden = el.getAttribute("data-state") !== v; });
  });

  /* How we work: workflow tabs */
  bindGroup("flow", function (v) {
    $$("[data-flow]").forEach(function (el) { el.hidden = el.getAttribute("data-flow") !== v; });
  });

  /* Client checklist progress */
  var boxes = $$(".checklist input[type=checkbox]");
  if (boxes.length) {
    var count = $("[data-done]"), total = $("[data-total]"), bar = $(".bar span");
    var update = function () {
      var done = boxes.filter(function (b) { return b.checked; }).length;
      if (count) count.textContent = done;
      if (total) total.textContent = boxes.length;
      if (bar) bar.style.width = Math.round(done / boxes.length * 100) + "%";
    };
    boxes.forEach(function (b) { b.addEventListener("change", update); });
    update();
  }

  /* Booking (Calendly) */
  var booking = $("#booking-box");
  if (booking) {
    if (CFG.calendlyUrl) {
      var w = document.createElement("div");
      w.className = "calendly-inline-widget";
      w.setAttribute("data-url", CFG.calendlyUrl + (CFG.calendlyUrl.indexOf("?") > -1 ? "&" : "?") + "hide_gdpr_banner=1&primary_color=047857");
      booking.innerHTML = "";
      booking.appendChild(w);
      var s = document.createElement("script");
      s.src = "https://assets.calendly.com/assets/external/widget.js";
      s.async = true;
      document.body.appendChild(s);
    }
  }

  /* Contact form (Formspree, with email fallback) */
  var form = $("#contact-form");
  if (form) {
    var msg = $(".form-msg", form);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = new FormData(form);
      if (!CFG.formspreeEndpoint) {
        var body = [];
        data.forEach(function (v, k) { body.push(k + ": " + v); });
        window.location.href = "mailto:" + CFG.email + "?subject=" + encodeURIComponent("Website enquiry") + "&body=" + encodeURIComponent(body.join("\n"));
        return;
      }
      var btn = $("button[type=submit]", form);
      btn.disabled = true; btn.textContent = "Sending…";
      fetch(CFG.formspreeEndpoint, { method: "POST", body: data, headers: { Accept: "application/json" } })
        .then(function (r) {
          if (r.ok) { form.reset(); msg.className = "form-msg ok"; msg.textContent = "Thank you! We’ve received your enquiry and will reply within one business day."; }
          else { throw new Error("bad status"); }
        })
        .catch(function () { msg.className = "form-msg err"; msg.textContent = "Sorry, your message couldn’t be sent. Please email " + CFG.email + " or call " + CFG.phone + "."; })
        .then(function () { btn.disabled = false; btn.textContent = "Send my enquiry"; });
    });
  }

  /* Chat assistant (rule-based, answers from site content) */
  var R = {
    pricing: "Our monthly plans are fixed fees, all capped at $1,000/month:\n• Essentials: $250 – $400\n• Growth: $450 – $700\n• Virtual CFO: $750 – $1,000\nThe exact price depends on your monthly transactions. <a href='/#book'>Book a free call</a> for a fixed quote within 48 hours.",
    services: "We offer monthly bookkeeping, catch-up & clean-up, Excel & spreadsheet accounting, AP/AR, financial reporting, Virtual CFO, tax-ready books & 1099 support, sales tax reporting support, payroll support, and QuickBooks/Xero setup. <a href='/services'>See all services</a>",
    cpa: "For CPA and EA firms we provide white-label 1040, 1120, 1120-S and 1065 prep and client bookkeeping, in your software, overnight. 1040s from $40 – $120, business returns $150 – $400. Your first sample return or clean-up is free. <a href='/us-cpa-firms'>Learn more</a>",
    tax: "Key 2027 federal dates: Feb 1 (W-2s and 1099-NEC), Mar 15 (S corp & partnership returns), Apr 15 (individual & C corp returns). <a href='/tax-calendar'>See the full tax calendar</a>",
    industries: "We specialise in e-commerce, construction, real estate, medical & dental, restaurants, professional services, trucking and SaaS. <a href='/industries'>See workflows and plans</a>",
    software: "We work in QuickBooks Online (certified ProAdvisor, Silver tier), Xero, Excel, Google Sheets, Gusto, ADP, Bill.com, Shopify, Stripe, and Drake, Lacerte and UltraTax for CPA firms.",
    book: "Great! <a href='/#book'>Pick a date and time here</a>. Calls are free, 20 minutes, no obligation.",
    human: "Happy to connect you with our team:\nPhone: " + CFG.phone + "\nEmail: " + CFG.email + "\nOr use our <a href='/#contact'>contact form</a>. We reply within one business day.",
    security: "Your data stays safe: encrypted portal, multi-factor login, signed NDAs, read-only bank access and no files on personal devices.",
    fallback: "I’m not sure about that one. Our team can help directly:\nPhone: " + CFG.phone + "\nEmail: " + CFG.email + "\nOr choose a topic below."
  };
  function topic(t) {
    var s = " " + t.toLowerCase() + " ";
    var has = function () { for (var i = 0; i < arguments.length; i++) if (s.indexOf(arguments[i]) > -1) return true; return false; };
    if (has("price", "cost", "fee", "plan", "how much", "charge")) return "pricing";
    if (has("cpa", " ea ", "firm", "1040", "1120", "1065", "return", "white")) return "cpa";
    if (has("deadline", "date", "due", "tax", "1099", "w-2")) return "tax";
    if (has("book", "call", "meeting", "appointment", "schedule")) return "book";
    if (has("quickbooks", "xero", "excel", "software", "gusto", "sheets")) return "software";
    if (has("industry", "ecommerce", "e-commerce", "construction", "restaurant", "real estate", "medical", "trucking", "saas")) return "industries";
    if (has("secure", "security", "safe", "data", "privacy")) return "security";
    if (has("human", "person", "talk", "contact", "phone", "email")) return "human";
    if (has("service", "bookkeeping", "payroll", "cfo", "offer")) return "services";
    return "fallback";
  }
  var root = document.createElement("div");
  root.id = "tlm-chat";
  root.innerHTML =
    '<div class="chat-panel" id="chat-panel" role="dialog" aria-label="Chat with The Ledger Max" hidden>' +
      '<div class="chat-head"><span class="av"><img src="/assets/img/icon-navy.png" alt=""></span>' +
      '<span><strong>The Ledger Max Assistant</strong><small>Instant answers · our team replies within 1 business day</small></span>' +
      '<button type="button" class="chat-close" aria-label="Close chat">×</button></div>' +
      '<div class="chat-log" aria-live="polite"></div><div class="chat-quick"></div>' +
      '<form class="chat-form"><label class="sr-only" for="chat-in">Type your question</label>' +
      '<input id="chat-in" type="text" placeholder="Type your question…" autocomplete="off">' +
      '<button type="submit" aria-label="Send"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12l16-8-6 16-2-7z"/></svg></button></form>' +
    '</div>' +
    '<button type="button" class="chat-btn" aria-expanded="false" aria-controls="chat-panel"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6EE7B7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/></svg><span>Chat with us</span></button>';
  document.body.appendChild(root);
  var panel = $(".chat-panel", root), log = $(".chat-log", root), btn = $(".chat-btn", root);
  function add(text, who, html) {
    var d = document.createElement("div");
    d.className = "msg " + who;
    if (html) d.innerHTML = text; else d.textContent = text;
    log.appendChild(d); log.scrollTop = log.scrollHeight;
  }
  function say(u, k) { add(u, "user"); setTimeout(function () { add(R[k] || R.fallback, "bot", true); }, 250); }
  add("Hi! I’m The Ledger Max assistant. Ask me about our services, pricing, tax deadlines or booking a free call.", "bot");
  [["Services", "services"], ["Pricing", "pricing"], ["I’m a CPA firm", "cpa"], ["Tax deadlines", "tax"], ["Book a free call", "book"], ["Talk to a person", "human"]].forEach(function (q) {
    var b = document.createElement("button"); b.type = "button"; b.textContent = q[0];
    b.addEventListener("click", function () { say(q[0], q[1]); });
    $(".chat-quick", root).appendChild(b);
  });
  function setOpen(o) {
    panel.hidden = !o;
    btn.setAttribute("aria-expanded", o ? "true" : "false");
    $("span", btn).textContent = o ? "Close" : "Chat with us";
    if (o) $("#chat-in").focus();
  }
  btn.addEventListener("click", function () { setOpen(panel.hidden); });
  $(".chat-close", root).addEventListener("click", function () { setOpen(false); });
  $(".chat-form", root).addEventListener("submit", function (e) {
    e.preventDefault();
    var i = $("#chat-in"), t = i.value.trim(); if (!t) return;
    i.value = ""; say(t, topic(t));
  });
})();
