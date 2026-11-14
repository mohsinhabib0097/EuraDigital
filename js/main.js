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

  /* desplegable de servicios (clic en móvil / teclado) */
  const dd = $(".nav__dropdown");
  const ddToggle = $(".nav__toggle");
  ddToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = !dd.classList.contains("is-open");
    dd.classList.toggle("is-open", open);
    ddToggle.setAttribute("aria-expanded", String(open));
  });
  document.addEventListener("click", (e) => { if (!dd.contains(e.target)) dd.classList.remove("is-open"); });

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

  /* ---------- texto de declaración que se ilumina ---------- */
  const st = $("#statementText");
  if (st && !reduceMotion) {
    const words = st.textContent.trim().split(/\s+/);
    st.innerHTML = words.map((w) => `<span class="w">${w}</span>`).join(" ");
    const spans = $$(".w", st);
    const light = () => {
      const r = st.getBoundingClientRect();
      const vh = window.innerHeight;
      const progress = Math.min(Math.max((vh * 0.85 - r.top) / (r.height + vh * 0.35), 0), 1);
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
  const projFilters = $$("#proyectos .filter");
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
  servicesByLang.es = {
    web: { icon: "🖥️", title: "Desarrollo Web", text: "Webs rápidas, modernas y optimizadas para convertir visitas en clientes. Tú apruebas el diseño, nosotros nos encargamos del resto.", list: ["Diseño a medida y responsive", "Optimizada para SEO y velocidad", "Panel fácil de editar", "Cumplimiento RGPD y cookies"] },
    dominio: { icon: "🌐", title: "Dominio, Email y Hosting", text: "Nos ocupamos de toda la parte técnica para que tu web y tu correo funcionen sin interrupciones.", list: ["Registro de dominio .es / .com", "Email profesional", "Hosting rápido en Europa", "Certificado SSL y copias de seguridad"] },
    seo: { icon: "🔍", title: "SEO Integral", text: "Posicionamos tu negocio en Google para que te encuentren los clientes que ya te están buscando.", list: ["Auditoría técnica completa", "Investigación de palabras clave", "Contenido optimizado", "Informes mensuales claros"] },
    "ia-vis": { icon: "✨", title: "Visibilidad en IA", text: "Revisamos qué dicen ChatGPT, Claude y Gemini de tu negocio y optimizamos tu presencia para que te recomienden.", list: ["Análisis de menciones en IA", "Datos estructurados (schema)", "Archivo llms.txt preparado", "Plan de mejora priorizado"] },
    social: { icon: "📣", title: "Marketing en Redes Sociales", text: "Contenido y gestión de redes que construyen marca y generan conversaciones con tus clientes.", list: ["Instagram, Facebook, LinkedIn y TikTok", "Calendario editorial", "Diseño de piezas y vídeos cortos", "Gestión de comunidad"] },
    sem: { icon: "🎯", title: "SEM / Publicidad PPC", text: "Campañas en Google Ads y Meta Ads enfocadas en resultados, con cada euro medido.", list: ["Google Ads y Meta Ads", "Landing pages de conversión", "Seguimiento de conversiones", "Optimización semanal"] },
    apps: { icon: "📱", title: "Desarrollo de Apps", text: "Aplicaciones móviles y web a medida para iOS y Android que resuelven problemas reales de tu negocio.", list: ["iOS y Android", "Diseño UX/UI", "Integración con tus sistemas", "Soporte y mantenimiento"] },
    ia: { icon: "🤖", title: "Soluciones con IA", text: "Automatizamos tareas repetitivas con inteligencia artificial para que tu equipo se centre en lo importante.", list: ["Chatbots de atención al cliente", "Automatización de procesos", "Asistentes internos", "Integración con tus herramientas"] },
    reputacion: { icon: "⭐", title: "Reputación y Reseñas", text: "Te ayudamos a conseguir más reseñas positivas y a gestionar tu reputación online.", list: ["Solicitud automática de reseñas", "Respuesta a reseñas", "Monitorización de marca", "Widgets de reseñas en tu web"] },
    local: { icon: "📍", title: "SEO Local y Google Business", text: "Destaca en Google Maps y en las búsquedas locales de tu ciudad.", list: ["Optimización de Google Business Profile", "Citas en directorios locales", "Coherencia de datos NAP", "Publicaciones y fotos"] },
    sistemas: { icon: "⚡", title: "Sistemas de negocio a medida", text: "Herramientas a medida para presupuestos, leads, reservas y facturación que se adaptan a tu forma de trabajar.", list: ["CRM y gestión de leads", "Reservas y citas online", "Presupuestos automáticos", "Paneles de control"] },
  };
  servicesByLang.en = {
    web: { icon: "🖥️", title: "Web Development", text: "Fast, modern websites built to turn visitors into customers. You approve the design, we handle everything else.", list: ["Custom, responsive design", "Built for SEO and speed", "Easy-to-edit dashboard", "GDPR and cookie compliance (EU-ready)"] },
    dominio: { icon: "🌐", title: "Domain, Email, Hosting & Care", text: "We take care of the technical side — domains, email, hosting, updates, and backups — so your website just works.", list: [".es / .com domain registration", "Professional email", "Fast, secure hosting in the EU", "SSL, updates, and daily backups"] },
    seo: { icon: "🔍", title: "Full-Service SEO", text: "We get your business ranking on Google, so the customers already searching for what you offer can actually find you.", list: ["Full technical audit", "Keyword research", "Optimised content", "Plain-English monthly reports"] },
    "ia-vis": { icon: "✨", title: "AI Visibility", text: "We check what ChatGPT, Claude, and Gemini say about your business, track it every month, and fix what is holding you back.", list: ["AI mention analysis", "Structured data (schema)", "An llms.txt file built for AI tools", "Prioritised improvement plan"] },
    social: { icon: "📣", title: "Social Media Marketing", text: "Content and community management that builds your brand and starts conversations with customers.", list: ["Instagram, Facebook, LinkedIn and TikTok", "Content calendar", "Post design and short-form video", "Community management"] },
    sem: { icon: "🎯", title: "SEM / PPC Advertising", text: "Google Ads and Meta Ads campaigns focused on real results, with every euro tracked.", list: ["Google Ads and Meta Ads", "High-converting landing pages", "Conversion tracking", "Weekly optimization"] },
    apps: { icon: "📱", title: "App Development", text: "Custom mobile and web apps for iOS and Android that solve real problems in your business.", list: ["iOS and Android", "UX/UI design", "Integration with your systems", "Support and maintenance"] },
    ia: { icon: "🤖", title: "AI Solutions", text: "We use AI to automate the repetitive tasks, so your team can focus on the work that matters.", list: ["Customer service chatbots", "Process automation", "Internal assistants", "Integration with your tools"] },
    reputacion: { icon: "⭐", title: "Reputation & Review", text: "We help you earn more 5-star reviews and stay on top of your online reputation.", list: ["Automatic review requests", "Review responses", "Brand monitoring", "Review widgets for your website"] },
    local: { icon: "📍", title: "Local Listings & Citations", text: "Stand out on Google Maps and in local searches across Córdoba and beyond.", list: ["Google Business Profile optimization", "Local directory citations", "Consistent NAP data", "Posts and photos"] },
    sistemas: { icon: "⚡", title: "Business Systems", text: "Custom tools for quotes, leads, bookings and billing that fit the way you work.", list: ["CRM and lead management", "Online bookings and appointments", "Automatic quotes", "Dashboards"] },
  };
  const services = servicesByLang[LANG];
  const modal = $("#serviceModal");
  let lastFocus = null;
  const openModal = (key) => {
    const s = services[key];
    if (!s) return;
    $("#modalIcon").textContent = s.icon;
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
