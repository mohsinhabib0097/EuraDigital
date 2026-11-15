/* =========================================================
   Eura Digital — interacciones
   ========================================================= */
(function () {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const LANG = document.documentElement.lang === "es" ? "es" : "en";
  const UI = {
    en: {
      menuOpen: "Open menu", menuClose: "Close menu", locale: "en-IE",
      formError: "Please check the highlighted fields and accept the privacy policy.",
      snapshotOk: "Thank you! Your Digital Snapshot will arrive by email within 24 to 48 hours.",
      contactOk: "Thanks! Your message is on its way — we will get back to you within one business day.",
    },
    es: {
      menuOpen: "Abrir menú", menuClose: "Cerrar menú", locale: "es-ES",
      formError: "Revisa los campos marcados y acepta la política de privacidad.",
      snapshotOk: "¡Gracias! Recibirás tu diagnóstico en 24–48 horas.",
      contactOk: "¡Mensaje enviado! Te responderemos en menos de 24 horas.",
    },
  }[LANG];

  /* ---------- año ---------- */
  $("#year").textContent = new Date().getFullYear();

  /* ---------- cabecera al hacer scroll ---------- */
  const header = $("#header");
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 10);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- menú móvil ---------- */
  const burger = $("#burger");
  const nav = $("#nav");
  const setMenu = (open) => {
    nav.classList.toggle("is-open", open);
    burger.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? UI.menuClose : UI.menuOpen);
  };
  burger.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
  $$(".nav a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("click", (e) => {
    if (document.body.classList.contains("menu-open") && !nav.contains(e.target) && !burger.contains(e.target)) setMenu(false);
  });

  /* dropdowns (click on mobile / keyboard) */
  const dds = $$(".nav__dropdown");
  const closeDd = (dd) => { dd.classList.remove("is-open"); $(".nav__toggle", dd).setAttribute("aria-expanded", "false"); };
  dds.forEach((dd) => {
    const t = $(".nav__toggle", dd);
    t.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = !dd.classList.contains("is-open");
      dds.forEach(closeDd);
      dd.classList.toggle("is-open", open);
      t.setAttribute("aria-expanded", String(open));
    });
  });
  document.addEventListener("click", (e) => { dds.forEach((dd) => { if (!dd.contains(e.target)) closeDd(dd); }); });

  /* ---------- enlace activo según sección ---------- */
  const links = $$(".nav__list > li > a.nav__link");
  const sections = links.map((l) => $(l.getAttribute("href"))).filter(Boolean);
  if ("IntersectionObserver" in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          links.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === "#" + en.target.id));
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach((s) => spy.observe(s));
  }

  /* ---------- aparición al hacer scroll ---------- */
  const reveals = $$(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          const siblings = Array.from(en.target.parentElement.children).filter((c) => c.classList.contains("reveal"));
          en.target.style.transitionDelay = Math.min(siblings.indexOf(en.target) * 70, 420) + "ms";
          en.target.classList.add("is-visible");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }


  /* ---------- hero rotating word ---------- */
  const rot = $(".rotator");
  if (rot && !reduceMotion) {
    const words = rot.dataset.words.split("|");
    const w = $(".rotator__word", rot);
    let i = 0;
    setInterval(() => {
      w.classList.add("is-out");
      setTimeout(() => {
        i = (i + 1) % words.length;
        w.textContent = words[i];
        w.style.transition = "none";
        w.classList.remove("is-out");
        w.classList.add("is-in");
        void w.offsetWidth;
        w.style.transition = "";
        w.classList.remove("is-in");
      }, 350);
    }, 2800);
  }

  /* ---------- hero floating cards parallax ---------- */
  const fcards = $$(".fcard");
  if (fcards.length && !reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    const hero = $(".hero");
    hero.addEventListener("mousemove", (e) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      fcards.forEach((c) => {
        const d = +c.dataset.depth || 10;
        c.style.marginLeft = (x * d) + "px";
        c.style.marginTop = (y * d) + "px";
      });
    });
  }

  /* ---------- texto de declaración que se ilumina ---------- */
  const st = $("#statementText");
  if (st && !reduceMotion) {
    // wrap plain words in spans, keep keyword spans and inline photos as single units
    Array.from(st.childNodes).forEach((node) => {
      if (node.nodeType === 3) {
        const frag = document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          const sp = document.createElement("span");
          sp.className = "w";
          sp.textContent = part;
          frag.appendChild(sp);
        });
        node.replaceWith(frag);
      } else if (node.nodeType === 1) {
        node.classList.add("w");
      }
    });
    const spans = $$(".w", st);
    const light = () => {
      const r = st.getBoundingClientRect();
      const vh = window.innerHeight;
      const progress = Math.min(Math.max((vh * 0.85 - r.top) / (r.height + vh * 0.3), 0), 1);
      const n = Math.round(progress * spans.length);
      spans.forEach((s, i) => s.classList.toggle("on", i < n));
    };
    light();
    window.addEventListener("scroll", light, { passive: true });
  }

  /* ---------- contadores ---------- */
  const counters = $$("[data-count]");
  const runCounter = (el) => {
    const end = +el.dataset.count;
    if (reduceMotion) { el.textContent = end; return; }
    const t0 = performance.now(), dur = 1400;
    const tick = (t) => {
      const p = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ("IntersectionObserver" in window) {
    const co = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { runCounter(en.target); co.unobserve(en.target); } });
    }, { threshold: 0.5 });
    counters.forEach((c) => co.observe(c));
  } else counters.forEach(runCounter);

  /* ---------- filtro de proyectos ---------- */
  const projFilters = $$(".projects .filter");
  projFilters.forEach((btn) => btn.addEventListener("click", () => {
    projFilters.forEach((b) => b.classList.toggle("is-active", b === btn));
    const f = btn.dataset.filter;
    $$(".project").forEach((p) => {
      const show = f === "all" || p.dataset.cat === f;
      p.classList.toggle("is-hidden", !show);
      if (show) p.classList.add("is-visible");
    });
  }));

  /* ---------- modal de servicios ---------- */
  const servicesByLang = {};
  servicesByLang.en = {
    "design": { icon: "fa-palette", title: "Web Design", text: "Thoughtful, conversion-focused design that makes your business look as good online as it is in person. You see and approve every page before we build.", list: ["UX/UI design and wireframes", "Mobile-first, responsive layouts", "Brand-consistent visuals", "Design you approve before we build"] },
    "web": { icon: "fa-laptop-code", title: "Web Development", text: "Clean, fast, secure websites and web apps that load quickly, rank well, and are easy for you to update.", list: ["WordPress or custom-coded sites", "E-commerce and online bookings", "Speed and Core Web Vitals optimization", "GDPR and cookie compliance (EU-ready)"] },
    "apps": { icon: "fa-mobile-screen-button", title: "Mobile App Development", text: "Mobile apps your customers will actually use — from idea and design to App Store and Google Play launch.", list: ["iOS and Android apps", "Cross-platform (Flutter / React Native)", "App Store and Google Play launch", "Ongoing support and updates"] },
    "software": { icon: "fa-gears", title: "Custom Software", text: "Quotes, leads, bookings, and billing tools built around the way you work — so your business runs itself.", list: ["CRMs, booking and quoting systems", "Dashboards and internal tools", "Integrations with your existing software", "Secure, scalable cloud setup"] },
    "hosting": { icon: "fa-globe", title: "Domain & Hosting", text: "We take care of the technical side — domains, email, hosting, updates, and backups — so your website just works.", list: [".es / .com domain registration", "Professional business email", "Fast, secure hosting in the EU", "SSL, updates, and daily backups"] },
    "seo": { icon: "fa-magnifying-glass-chart", title: "SEO", text: "We get your business ranking on Google and showing up in AI answers, so customers searching for what you offer can find you.", list: ["Technical SEO audit", "Keyword research and content", "Local SEO and Google Business Profile", "AI search visibility (ChatGPT, Gemini)"] },
    "marketing": { icon: "fa-chart-line", title: "Digital Marketing", text: "One joined-up plan across your website, search, social, email, and ads — measured from day one.", list: ["Digital strategy and planning", "Email marketing and automation", "Conversion-focused landing pages", "Analytics and plain-English reporting"] },
    "sem": { icon: "fa-bullseye", title: "SEM / PPC Advertising", text: "Paid campaigns focused on real results, not clicks — with every euro tracked back to leads and sales.", list: ["Google Ads and Meta Ads", "Campaign setup and management", "Conversion tracking", "Weekly optimization"] },
    "social": { icon: "fa-bullhorn", title: "Social Media Marketing", text: "Content and community management that builds your brand and starts conversations with customers.", list: ["Instagram, Facebook, LinkedIn, and TikTok", "Content calendar and post design", "Short-form video and reels", "Community management"] },
    "ia": { icon: "fa-robot", title: "AI Solutions", text: "We use AI to automate the repetitive work, so your team can focus on the work that matters.", list: ["AI chatbots for customer service", "Workflow and process automation", "AI assistants trained on your business", "Integration with your tools"] },
  };
  servicesByLang.es = {
    "design": { icon: "fa-palette", title: "Diseño Web", text: "Diseño cuidado y orientado a la conversión para que tu negocio luzca online tan bien como en persona. Ves y apruebas cada página antes de construirla.", list: ["Diseño UX/UI y wireframes", "Diseño responsive pensado para móvil", "Estética coherente con tu marca", "Apruebas el diseño antes de desarrollar"] },
    "web": { icon: "fa-laptop-code", title: "Desarrollo Web", text: "Webs y aplicaciones web limpias, rápidas y seguras, que cargan al instante, posicionan bien y puedes actualizar tú mismo.", list: ["WordPress o desarrollo a medida", "Tiendas online y reservas", "Optimización de velocidad y Core Web Vitals", "Cumplimiento RGPD y cookies"] },
    "apps": { icon: "fa-mobile-screen-button", title: "Desarrollo de Apps Móviles", text: "Apps que tus clientes usarán de verdad: de la idea y el diseño al lanzamiento en App Store y Google Play.", list: ["Apps para iOS y Android", "Multiplataforma (Flutter / React Native)", "Publicación en App Store y Google Play", "Soporte y actualizaciones"] },
    "software": { icon: "fa-gears", title: "Software a Medida", text: "Presupuestos, leads, reservas y facturación con herramientas hechas a tu medida, para que tu negocio funcione solo.", list: ["CRM, reservas y presupuestos", "Paneles de control y herramientas internas", "Integración con tu software actual", "Infraestructura cloud segura y escalable"] },
    "hosting": { icon: "fa-globe", title: "Dominio y Hosting", text: "Nos ocupamos de la parte técnica — dominios, email, hosting, actualizaciones y copias de seguridad — para que tu web simplemente funcione.", list: ["Registro de dominio .es / .com", "Email profesional", "Hosting rápido y seguro en la UE", "SSL, actualizaciones y copias diarias"] },
    "seo": { icon: "fa-magnifying-glass-chart", title: "SEO", text: "Posicionamos tu negocio en Google y en las respuestas de la IA, para que te encuentren quienes ya buscan lo que ofreces.", list: ["Auditoría SEO técnica", "Palabras clave y contenido", "SEO local y Google Business Profile", "Visibilidad en buscadores IA (ChatGPT, Gemini)"] },
    "marketing": { icon: "fa-chart-line", title: "Marketing Digital", text: "Un plan conjunto para tu web, buscadores, redes, email y publicidad, medido desde el primer día.", list: ["Estrategia y planificación digital", "Email marketing y automatización", "Landing pages orientadas a conversión", "Analítica e informes claros"] },
    "sem": { icon: "fa-bullseye", title: "SEM / Publicidad PPC", text: "Campañas de pago centradas en resultados reales, no en clics, con cada euro vinculado a leads y ventas.", list: ["Google Ads y Meta Ads", "Creación y gestión de campañas", "Seguimiento de conversiones", "Optimización semanal"] },
    "social": { icon: "fa-bullhorn", title: "Marketing en Redes Sociales", text: "Contenido y gestión de comunidad que construyen tu marca y generan conversaciones con tus clientes.", list: ["Instagram, Facebook, LinkedIn y TikTok", "Calendario editorial y diseño de piezas", "Vídeo corto y reels", "Gestión de comunidad"] },
    "ia": { icon: "fa-robot", title: "Soluciones con IA", text: "Usamos la inteligencia artificial para automatizar el trabajo repetitivo, para que tu equipo se centre en lo importante.", list: ["Chatbots de atención al cliente", "Automatización de procesos", "Asistentes de IA entrenados con tu negocio", "Integración con tus herramientas"] },
  };
  const services = servicesByLang[LANG];
  const modal = $("#serviceModal");
  let lastFocus = null;
  const openModal = (key) => {
    const s = services[key];
    if (!s) return;
    $("#modalIcon").innerHTML = `<i class="fa-solid ${s.icon}" aria-hidden="true"></i>`;
    $("#modalTitle").textContent = s.title;
    $("#modalText").textContent = s.text;
    $("#modalList").innerHTML = s.list.map((i) => `<li>${i}</li>`).join("");
    lastFocus = document.activeElement;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    $(".modal__close", modal).focus();
  };
  const closeModal = () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  };
  $$("[data-service]").forEach((el) => el.addEventListener("click", (e) => {
    e.preventDefault();
    setMenu(false);
    openModal(el.dataset.service);
  }));
  $$("[data-close]", modal).forEach((el) => el.addEventListener("click", closeModal));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { if (modal.classList.contains("is-open")) closeModal(); setMenu(false); }
  });

  /* ---------- calculadora ---------- */
  const fmt = new Intl.NumberFormat(UI.locale, { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
  const range = $("#revenue");
  const goals = $$(".calc__goal .filter");
  let pct = 0.05;
  const calc = () => {
    const v = +range.value;
    $("#revenueOut").textContent = fmt.format(v);
    $("#calcOut").textContent = fmt.format((v * pct) / 12);
  };
  range.addEventListener("input", calc);
  goals.forEach((g) => g.addEventListener("click", () => {
    goals.forEach((b) => b.classList.toggle("is-active", b === g));
    pct = +g.dataset.pct;
    calc();
  }));
  calc();

  /* ---------- customer value calculator ---------- */
  const clv = $("#clv");
  if (clv) {
    const inputs = $$("input[data-key]", clv);
    const out = (k, v) => { const el = $(`[data-out="${k}"]`, clv); if (el) el.textContent = v; };
    const calcClv = () => {
      const v = {};
      inputs.forEach((i) => { v[i.dataset.key] = +i.value; });
      out("sale", fmt.format(v.sale)); out("freq", v.freq); out("years", v.years); out("new", v.new);
      const ltv = v.sale * v.freq * v.years;
      out("ltv", fmt.format(ltv));
      out("year", fmt.format(ltv * v.new * 12));
    };
    inputs.forEach((i) => i.addEventListener("input", calcClv));
    calcClv();
  }

  /* ---------- range sliders: filled track ---------- */
  const fillRange = (r) => r.style.setProperty("--p", ((r.value - r.min) / (r.max - r.min)) * 100 + "%");
  $$('input[type="range"]').forEach((r) => { fillRange(r); r.addEventListener("input", () => fillRange(r)); });

  /* ---------- formularios (validación en cliente) ---------- */
  const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  const handleForm = (form, okText) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const msg = $(".form__msg", form);
      let valid = true;
      $$("[required]", form).forEach((input) => {
        const wrap = input.closest(".field") || input.closest(".check");
        let ok = input.type === "checkbox" ? input.checked : input.value.trim() !== "";
        if (ok && input.type === "email") ok = emailOk(input.value.trim());
        wrap.classList.toggle("has-error", !ok);
        if (!ok) valid = false;
      });
      if (!valid) {
        msg.className = "form__msg err";
        msg.textContent = UI.formError;
        return;
      }
      // TODO: conectar con backend / servicio de formularios (Formspree, PHP mailer, etc.)
      const btn = $("button[type=submit]", form);
      btn.disabled = true;
      btn.style.opacity = ".7";
      setTimeout(() => {
        form.reset();
        btn.disabled = false;
        btn.style.opacity = "";
        msg.className = "form__msg ok";
        msg.textContent = okText;
      }, 700);
    });
    form.addEventListener("input", (e) => {
      const wrap = e.target.closest(".field, .check");
      if (wrap) wrap.classList.remove("has-error");
    });
  };
  handleForm($("#snapshotForm"), UI.snapshotOk);
  handleForm($("#contactForm"), UI.contactOk);

  /* ---------- aviso de cookies ---------- */
  const cookies = $("#cookies");
  let consent = null;
  try { consent = localStorage.getItem("eura-cookies"); } catch (_) {}
  if (!consent) cookies.hidden = false;
  $$("[data-cookies]", cookies).forEach((b) => b.addEventListener("click", () => {
    try { localStorage.setItem("eura-cookies", b.dataset.cookies); } catch (_) {}
    cookies.hidden = true;
  }));
})();
