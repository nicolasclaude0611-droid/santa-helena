(() => {
  const WA_NUMBER = '573113398988';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- Servicios (una sola fuente para pestañas y formulario) ---------- */
  const AREAS = [
    { id: 'general', name: 'Medicina general y enfermería',
      text: 'Consulta médica general y de enfermería para la atención, el seguimiento y la remisión oportuna, con el apoyo de un equipo interdisciplinario.',
      items: ['Medicina general', 'Enfermería'] },
    { id: 'especialidades', name: 'Especialidades médicas',
      text: 'Consulta externa especializada que garantiza la continuidad y la integralidad de su atención.',
      items: ['Ginecobstetricia', 'Pediatría', 'Medicina interna', 'Cardiología', 'Cirugía general', 'Ortopedia y/o traumatología', 'Otorrinolaringología', 'Psiquiatría', 'Reumatología', 'Infectología', 'Medicina física y rehabilitación', 'Medicina física y del deporte', 'Dolor y cuidados paliativos', 'Toxicología', 'Medicina del trabajo y medicina laboral'] },
    { id: 'apoyo', name: 'Nutrición, psicología y terapias',
      text: 'Nutrición, psicología y una unidad de terapia integral para la recuperación funcional de niños y adultos.',
      items: ['Nutrición y dietética', 'Psicología', 'Fisioterapia', 'Terapia respiratoria', 'Terapia ocupacional', 'Fonoaudiología y/o terapia del lenguaje'] },
    { id: 'oral', name: 'Odontología y optometría',
      text: 'Consulta de odontología general y de optometría para el cuidado de la salud oral y visual.',
      items: ['Odontología general', 'Optometría'] },
    { id: 'vacunacion', name: 'Vacunación',
      text: 'Centro de referencia del Programa Ampliado de Inmunizaciones (PAI), en modalidad intramural, domiciliaria y extramural.',
      items: ['Vacunación'] },
    { id: 'muestras', name: 'Toma de muestras y diagnóstico',
      text: 'Toma de muestras de laboratorio clínico, procesadas por el Laboratorio Cristiam Gram mediante contrato de interdependencia; toma de muestras de cuello uterino y ginecológicas, y diagnóstico vascular.',
      items: ['Toma de muestras de laboratorio clínico', 'Toma de muestras de cuello uterino y ginecológicas', 'Diagnóstico vascular'] },
  ];

  /* ---------- Sonidos del formulario (sintetizados, sin archivos) ---------- */
  const sound = (() => {
    let ctx = null, on = true;
    try { on = localStorage.getItem('shv-sound') !== 'off'; } catch (e) {}
    const NOTES = { tick: [[880, 0, 0.05]], next: [[660, 0, 0.07], [990, 0.07, 0.09]], back: [[740, 0, 0.07], [520, 0.07, 0.08]],
      error: [[220, 0, 0.12], [196, 0.1, 0.14]], done: [[660, 0, 0.1], [830, 0.09, 0.1], [990, 0.18, 0.22]] };
    const play = (name) => {
      if (!on) return;
      try {
        ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
        if (ctx.state === 'suspended') ctx.resume();
        const t0 = ctx.currentTime + 0.01;
        NOTES[name].forEach(([f, at, len]) => {
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.type = name === 'error' ? 'triangle' : 'sine'; o.frequency.value = f;
          g.gain.setValueAtTime(0.0001, t0 + at);
          g.gain.exponentialRampToValueAtTime(0.12, t0 + at + 0.008);
          g.gain.exponentialRampToValueAtTime(0.0001, t0 + at + len);
          o.connect(g).connect(ctx.destination); o.start(t0 + at); o.stop(t0 + at + len + 0.02);
        });
      } catch (e) {}
    };
    const btn = document.getElementById('sound-toggle');
    if (btn) {
      btn.setAttribute('aria-pressed', on);
      btn.addEventListener('click', () => {
        on = !on; btn.setAttribute('aria-pressed', on);
        try { localStorage.setItem('shv-sound', on ? 'on' : 'off'); } catch (e) {}
        play('tick');
      });
    }
    return play;
  })();

  /* ---------- Intro (una vez por sesión) ---------- */
  const intro = $('.intro');
  const hero = $('.hero');
  let seen = false;
  try { seen = sessionStorage.getItem('shv-intro') === '1'; sessionStorage.setItem('shv-intro', '1'); } catch (e) { seen = true; }
  const startHero = () => hero.classList.add('is-ready');
  if (intro && !seen && !reduce) {
    intro.classList.add('is-on');
    setTimeout(startHero, 1450);
    setTimeout(() => intro.remove(), 1900);
  } else {
    intro && intro.remove();
    requestAnimationFrame(startHero);
  }

  /* ---------- Helenita (videos) ---------- */
  const typeInto = (p, text) => {
    if (reduce) { p.textContent = text; return; }
    p.textContent = "";
    let i = 0;
    const tick = () => { p.textContent = text.slice(0, ++i); if (i < text.length) setTimeout(tick, 22); };
    tick();
  };
  setTimeout(() => { const p = $(".bubble--hero p"); p && typeInto(p, p.dataset.type); }, seen || reduce ? 500 : 1300);
  // Las animaciones sin fondo las maneja helenita/helenita-player.js (pausa fuera de pantalla y respeta "reducir movimiento").
  // En "Agende su cita" Helenita acompaña cada paso: señala el formulario, piensa, explica y celebra.
  const guideEl = $('#book-helenita');
  const act = (name) => { if (guideEl && window.Helenita) window.Helenita.play(guideEl, name); };
  const STEP_ANIM = ['senalar', 'pensar', 'hablar'];

  const say = (text) => {
    const bubble = $('.bubble--guide');
    const p = $('#guide-text');
    if (!p || p.textContent === text) return;
    p.textContent = text;
    bubble.classList.remove('is-new'); void bubble.offsetWidth; bubble.classList.add('is-new');
  };

  /* ---------- Formulario de cita ---------- */
  const form = $('#wizard');
  const panels = $$('.panel', form);
  const labels = $$('.wizard__steps li', form);
  const bar = $('.wizard__bar span', form);
  const catSel = $('#f-cat');
  const list = $('#service-list');
  const GUIDE = [
    'Para comenzar, seleccione la sede donde desea ser atendido.',
    'Ahora indique el área de atención y el servicio que necesita.',
    'Por último, registre los datos del paciente. Le confirmaremos la cita por WhatsApp.',
  ];
  let step = 1;

  /* Servicios habilitados (REPS) y convenios por sede. Fuente: registro de habilitación de cada sede. */
  const BOOK_AREAS = AREAS; // una sola lista para la sección de servicios y el formulario
  const SEDES = {
    'Valledupar': { services: ['Medicina general', 'Enfermería', 'Ginecobstetricia', 'Pediatría', 'Medicina interna', 'Cardiología', 'Cirugía general', 'Ortopedia y/o traumatología', 'Otorrinolaringología', 'Psiquiatría', 'Reumatología', 'Infectología', 'Medicina física y rehabilitación', 'Medicina física y del deporte', 'Dolor y cuidados paliativos', 'Toxicología', 'Medicina del trabajo y medicina laboral', 'Nutrición y dietética', 'Psicología', 'Fisioterapia', 'Terapia respiratoria', 'Terapia ocupacional', 'Fonoaudiología y/o terapia del lenguaje', 'Odontología general', 'Optometría', 'Vacunación', 'Toma de muestras de laboratorio clínico', 'Toma de muestras de cuello uterino y ginecológicas', 'Diagnóstico vascular'],
      eps: ['EPS Sanitas', 'Salud Total', 'Unisalud', 'Suramericana (SURA)', 'FOMAG', 'Ecopetrol', 'AXA Colpatria', 'Colsanitas', 'Particular'] },
    // eps: null = aún sin lista confirmada; el campo queda para escribir libremente.
    'La Jagua de Ibirico': { services: ['Medicina general', 'Enfermería', 'Ginecobstetricia', 'Pediatría', 'Medicina interna', 'Medicina del trabajo y medicina laboral', 'Nutrición y dietética', 'Psicología', 'Fisioterapia', 'Terapia respiratoria', 'Terapia ocupacional', 'Fonoaudiología y/o terapia del lenguaje', 'Odontología general', 'Toma de muestras de laboratorio clínico', 'Toma de muestras de cuello uterino y ginecológicas'], eps: null },
    'San Juan del Cesar': { services: ['Medicina general', 'Enfermería', 'Ginecobstetricia', 'Pediatría', 'Medicina interna', 'Nutrición y dietética', 'Psicología', 'Vacunación', 'Toma de muestras de laboratorio clínico', 'Toma de muestras de cuello uterino y ginecológicas'], eps: ['EPS Sanitas', 'Particular'] },
  };

  const value = (n) => { const el = form.elements[n]; if (!el) return ''; if (el instanceof RadioNodeList) return el.value; return (el.type === 'checkbox' ? el.checked : el.value.trim()); };
  const areasFor = (sede) => {
    const ok = SEDES[sede] && SEDES[sede].services;
    return BOOK_AREAS.map((a) => ({ ...a, items: ok ? a.items.filter((s) => ok.includes(s)) : a.items })).filter((a) => a.items.length);
  };
  const fillAreas = (keep) => {
    const areas = areasFor(value('sede'));
    catSel.innerHTML = '<option value="">Seleccione un área</option>' + areas.map((a) => `<option value="${a.id}">${a.name}</option>`).join('');
    catSel.value = areas.some((a) => a.id === keep) ? keep : '';
    const hint = $('#svc-hint'); if (hint) hint.textContent = value('sede') ? `Servicios habilitados en la sede ${value('sede')}.` : '';
  };
  const epsSel = $('#f-eps'), epsTxt = $('#f-eps-otra');
  const epsField = () => (epsSel.hidden ? 'eps_otra' : 'eps');
  const fillEps = () => {
    const list = (SEDES[value('sede')] || {}).eps;
    const keep = epsSel.value;
    epsSel.hidden = !list; epsTxt.hidden = !!list;
    if (list) {
      epsSel.innerHTML = '<option value="">Seleccione</option>' + list.map((o) => `<option>${o}</option>`).join('');
      if (list.includes(keep)) epsSel.value = keep;
    }
  };
  fillAreas();

  const renderServices = (areaId, keep) => {
    const area = areasFor(value('sede')).find((a) => a.id === areaId);
    list.innerHTML = area ? area.items.map((s) => `<label class="svc-opt"><input type="radio" name="servicio" value="${s}"${s === keep ? ' checked' : ''}><span>${s}</span></label>`).join('') : '';
    if (!reduce) { list.classList.remove('is-swapping'); void list.offsetWidth; list.classList.add('is-swapping'); }
  };
  catSel.addEventListener('change', () => renderServices(catSel.value));

  const go = (n, quiet) => {
    const back = n < step;
    step = n;
    panels.forEach((p) => {
      const on = +p.dataset.step === n;
      p.hidden = !on;
      p.classList.toggle('is-active', on);
      p.classList.remove('is-entering', 'from-left');
      if (on && !reduce) { void p.offsetWidth; p.classList.add('is-entering'); if (back) p.classList.add('from-left'); }
    });
    labels.forEach((l, i) => { l.classList.toggle('is-current', i + 1 === n); l.classList.toggle('is-done', i + 1 < n); });
    bar.style.transform = `scaleX(${n / 3})`;
    say(GUIDE[n - 1]);
    act(STEP_ANIM[n - 1]);
    if (n === 3) renderSummary();
    const top = form.getBoundingClientRect().top;
    if (quiet) return; // quien llama se encarga del desplazamiento (Safari cancela dos desplazamientos seguidos)
    if (top < 80) form.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    const first = $('.panel.is-active input, .panel.is-active select', form);
    first && first.focus({ preventScroll: true });
  };

  const showErr = (key, on) => { const e = $(`[data-error="${key}"]`, form); if (e) e.hidden = !on; };
  const validate = (n) => {
    if (n === 1) { const ok = !!value('sede'); showErr('sede', !ok); return ok; }
    if (n === 2) { const ok = !!value('servicio'); showErr('servicio', !ok); return ok; }
    let ok = true;
    ['nombre', 'tipo', 'documento', 'nacimiento', 'celular', epsField()].forEach((n2) => {
      const el = form.elements[n2]; const bad = !el.value.trim();
      el.closest('.field').classList.toggle('is-invalid', bad);
      el.setAttribute('aria-invalid', bad ? 'true' : 'false');
      if (bad) ok = false;
    });
    const cel = form.elements.celular;
    if (cel.value.trim() && cel.value.replace(/\D/g, '').length < 7) { cel.closest('.field').classList.add('is-invalid'); ok = false; }
    const consent = form.elements.consentimiento;
    consent.closest('.check').classList.toggle('is-invalid', !consent.checked);
    if (!consent.checked) ok = false;
    showErr('datos', !ok);
    if (!ok) { const firstBad = $('.is-invalid input, .is-invalid select', form); firstBad && firstBad.focus(); }
    return ok;
  };

  const renderSummary = () => {
    const area = BOOK_AREAS.find((a) => a.id === catSel.value);
    $('#summary').innerHTML = [value('sede') && `Sede ${value('sede')}`, value('servicio'), area && area.name].filter(Boolean).map((t) => `<span>${t}</span>`).join('');
  };

  form.addEventListener('click', (e) => {
    if (e.target.closest('[data-next]')) { if (validate(step)) { sound('next'); go(step + 1); } else sound('error'); }
    if (e.target.closest('[data-prev]')) { sound('back'); go(step - 1); }
  });
  form.addEventListener('change', (e) => {
    if (e.target.matches('input[type=radio], input[type=checkbox], select')) sound('tick');
    if (e.target.name === 'sede') { fillAreas(catSel.value); renderServices(catSel.value, value('servicio')); fillEps(); showErr('sede', false); say(`Excelente. Sede ${e.target.value} seleccionada. Continúe para elegir el servicio.`); }
    if (e.target.name === 'servicio') { showErr('servicio', false); say(`${e.target.value}: entendido. Continúe para registrar los datos del paciente.`); }
    const f = e.target.closest('.field, .check'); if (f && f.classList.contains('is-invalid') && (e.target.value || e.target.checked)) f.classList.remove('is-invalid');
  });

  const fmtDate = (v) => { if (!v) return ''; const [y, m, d] = v.split('-'); return `${d}/${m}/${y}`; };
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validate(3)) { sound('error'); return; }
    sound('done');
    const area = BOOK_AREAS.find((a) => a.id === catSel.value);
    const lines = [
      'Cordial saludo. Deseo solicitar una cita en Santa Helena del Valle IPS.',
      '',
      `*Sede:* ${value('sede')}`,
      `*Servicio:* ${value('servicio')}${area ? ` (${area.name})` : ''}`,
      `*Paciente:* ${value('nombre')}`,
      `*Documento:* ${value('tipo')} ${value('documento')}`,
      `*Fecha de nacimiento:* ${fmtDate(value('nacimiento'))}`,
      `*Celular:* ${value('celular')}`,
      `*EPS o convenio:* ${value(epsField())}`,
      `*Jornada de preferencia:* ${value('jornada')}`,
    ];
    if (value('observaciones')) lines.push(`*Observaciones:* ${value('observaciones')}`);
    lines.push('', 'Autorizo el tratamiento de mis datos personales para la gestión de esta solicitud. Quedo atento(a) a su confirmación.');
    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
    say('Su mensaje está listo en WhatsApp. Solo debe enviarlo.');
    act('pulgar');
    window.open(url, '_blank', 'noopener');
  });

  // Ir a "Agendar": deja el contenido centrado bajo la barra; si no cabe (celular), muestra el formulario completo
  const scrollToBook = () => {
    const barH = $('.bar').getBoundingClientRect().height;
    const avail = innerHeight - barH;
    // posición en la página sin contar las animaciones de entrada (transform)
    const docTop = (el) => { let t = 0; for (; el; el = el.offsetParent) t += el.offsetTop; return t; };
    const box = (els) => ({ top: Math.min(...els.map(docTop)), bottom: Math.max(...els.map((el) => docTop(el) + el.offsetHeight)) });
    let b = box([$('.book__aside'), form]);
    if (b.bottom - b.top > avail - 24) b = box([form]);
    const y = b.top - barH - Math.max(12, (avail - (b.bottom - b.top)) / 2);
    scrollTo({ top: Math.max(0, y), behavior: reduce ? 'auto' : 'smooth' });
  };
  // Resto de secciones: centra el contenido (sin el margen interno de la sección); si no cabe, lo deja justo bajo la barra
  const scrollToSection = (sec) => {
    if (sec.id === 'inicio') { scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); return; }
    const barH = $('.bar').getBoundingClientRect().height;
    const avail = innerHeight - barH;
    const docTop = (el) => { let t = 0; for (; el; el = el.offsetParent) t += el.offsetTop; return t; };
    const cs = getComputedStyle(sec);
    const top = docTop(sec) + parseFloat(cs.paddingTop);
    const h = sec.offsetHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    const y = top - barH - (h <= avail - 32 ? (avail - h) / 2 : 16);
    scrollTo({ top: Math.max(0, y), behavior: reduce ? 'auto' : 'smooth' });
  };
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented) return;
    const id = a.getAttribute('href').slice(1);
    const sec = id && id !== 'contenido' && document.getElementById(id);
    if (!sec) return;
    e.preventDefault();
    if (history.replaceState) history.replaceState(null, '', '#' + id);
    requestAnimationFrame(() => (id === 'agendar' ? scrollToBook() : scrollToSection(sec)));
  });

  // Preseleccionar un servicio desde la sección de servicios
  const preselect = (areaId, service) => {
    // Siempre pregunta la sede primero (sin heredar una sede marcada antes)
    $$('input[name="sede"]', form).forEach((r) => { r.checked = false; });
    fillAreas(areaId); fillEps(); renderServices(catSel.value, service);
    go(1, true);
    requestAnimationFrame(scrollToBook);
    const area = BOOK_AREAS.find((a) => a.id === areaId);
    say(`Con gusto le ayudo con ${service ? service.toLowerCase() : area ? area.name.toLowerCase() : 'su cita'}. Primero, seleccione la sede.`);
  };

  /* ---------- Pestañas de servicios ---------- */
  const tabsList = $('#tabs-list');
  const tabsPanel = $('#tabs-panel');
  tabsList.innerHTML = AREAS.map((a, i) => `<button type="button" class="tab" role="tab" id="tab-${a.id}" aria-controls="tabs-panel" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-area="${a.id}">${a.name}</button>`).join('');
  const showArea = (id, animate) => {
    const a = AREAS.find((x) => x.id === id);
    $$('.tab', tabsList).forEach((t) => { const on = t.dataset.area === id; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; });
    tabsPanel.setAttribute('aria-labelledby', `tab-${id}`);
    tabsPanel.innerHTML = `<h3>${a.name}</h3><p>${a.text}</p><ul class="tabs__items">${a.items.map((s) => `<li>${s}</li>`).join('')}</ul><button type="button" class="btn btn--ink" data-book="${a.id}">Agendar en esta área</button>`;
    if (animate && !reduce) { tabsPanel.classList.remove('is-swapping'); void tabsPanel.offsetWidth; tabsPanel.classList.add('is-swapping'); }
  };
  showArea(AREAS[0].id, false);
  tabsList.addEventListener('click', (e) => { const t = e.target.closest('.tab'); if (t) showArea(t.dataset.area, true); });
  tabsList.addEventListener('keydown', (e) => {
    const tabs = $$('.tab', tabsList); const i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    const k = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    if (!k) return; e.preventDefault();
    const n = tabs[(i + k + tabs.length) % tabs.length]; n.focus(); showArea(n.dataset.area, true);
  });
  tabsPanel.addEventListener('click', (e) => { const b = e.target.closest('[data-book]'); if (b) preselect(b.dataset.book); });

  /* ---------- Mapa de sedes (Google Maps) ---------- */
  const SITES = [
    { name: "Valledupar", q: "Santa Helena del Valle IPS, Cra. 11 #14-34, Valledupar, Cesar", dest: "10.4756282,-73.2495789" },
    { name: "La Jagua de Ibirico", q: "9.561919694521654,-73.33216731853685 (Santa Helena del Valle IPS - La Jagua)", z: 17, dest: "9.561919694521654,-73.33216731853685" },
    { name: "San Juan del Cesar", q: "Santa Helena del Valle IPS, Cl. 7 #9-73, San Juan del Cesar, La Guajira", dest: "10.7741577,-73.0027359" },
  ];
  const mapEl = $("#map");
  const frame = $("#map-frame");
  const go2 = $("#map-go");
  const siteBtns = $$(".site");
  const selectSite = (i) => {
    const s = SITES[i];
    siteBtns.forEach((b, j) => b.setAttribute("aria-pressed", j === i));
    mapEl.classList.add("is-loading");
    frame.src = `https://maps.google.com/maps?q=${encodeURIComponent(s.q)}&z=${s.z || 16}&hl=es&output=embed`;
    go2.href = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(s.dest)}`;
    go2.textContent = `Cómo llegar a la sede ${s.name}`;
  };
  frame.addEventListener("load", () => mapEl.classList.remove("is-loading"));
  siteBtns.forEach((b, i) => b.addEventListener("click", () => { sound("tick"); selectSite(i); }));

  /* ---------- Contadores ---------- */
  const fmt = new Intl.NumberFormat('es-CO');
  const countUp = (el) => {
    const to = +el.dataset.count;
    if (reduce) { el.textContent = fmt.format(to); return; }
    const t0 = performance.now(), dur = 1600;
    const step2 = (t) => { const k = Math.min(1, (t - t0) / dur); const e = 1 - Math.pow(1 - k, 4); el.textContent = fmt.format(Math.round(to * e)); if (k < 1) requestAnimationFrame(step2); };
    requestAnimationFrame(step2);
  };

  /* ---------- Entradas al hacer scroll ---------- */
  const groups = [
    ['.trust', '.trust__item'],
    ['.book', '.book__aside > *, .wizard'],
    ['.services', '.services__head > *, .tab, .tabs__panel'],
    ['.news', '.news__head > *, .post'],
    ['.community', '.community__head > *, .community__grid article'],
    ['.support', '.h3-title, .support__grid article'],
    ['.sites', '.sites__head > *, .site'],
    ['.about', '.about__intro > *, .about__rows > div'],
    ['.faq', '.faq__head > *, .q, .faq__foot > *'],
    ['.pqrs', '.pqrs__aside > *, .pqrs__form'],
    ['.partners', '.h3-title, .partners__grid > div'],
    ['.foot', '.foot__slogan, .foot__cols > div'],
  ];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in'); io.unobserve(e.target);
      $$('[data-count]', e.target).forEach(countUp);
    }), { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    groups.forEach(([sec, sel]) => {
      const root = $(sec); if (!root) return;
      $$(sel, root).forEach((el, i) => { el.classList.add('rv'); el.style.setProperty('--i', reduce ? 0 : Math.min(i, 6)); io.observe(el); });
    });
    // The map starts fully clipped, so watch its container instead of the map itself.
    mapEl.classList.add('rv-clip');
    const mio = new IntersectionObserver(([e]) => { if (e.isIntersecting) { mapEl.classList.add('in'); mio.disconnect(); } }, { threshold: 0.15 });
    mio.observe(mapEl.parentElement);
  }

  /* ---------- Menú en tablet y celular ---------- */
  const menuBtn = $('.bar__menu');
  const nav = $('#menu-principal');
  const setMenu = (open) => { menuBtn.setAttribute('aria-expanded', open); nav.classList.toggle('is-open', open); };
  menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); menuBtn.focus(); } });
  addEventListener('resize', () => { if (innerWidth > 900) setMenu(false); });

  /* ---------- Barra superior, progreso y guía flotante ---------- */
  const barEl = $('.bar');
  const prog = $('.progress span');
  const fab = $('.guide-fab');
  const book = $('#agendar');
  let heroVisible = true, trustVisible = true, bookVisible = false, footVisible = false, tipShown = false;
  const syncFab = () => fab.classList.toggle('is-on', !heroVisible && !trustVisible && !bookVisible && !footVisible);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; syncFab(); }, { threshold: 0.15 }).observe(hero);
    new IntersectionObserver(([e]) => { trustVisible = e.isIntersecting; syncFab(); }).observe($('.trust'));
    new IntersectionObserver(([e]) => { bookVisible = e.isIntersecting; syncFab(); }, { threshold: 0.1 }).observe(book);
    new IntersectionObserver(([e]) => { footVisible = e.isIntersecting; syncFab(); }).observe($('.foot'));
  }
  let ticking = false;
  const onScroll = () => {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY; const max = document.documentElement.scrollHeight - innerHeight;
      prog.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
      barEl.classList.toggle('is-scrolled', y > 24);
      if (!tipShown && fab.classList.contains('is-on')) {
        tipShown = true; fab.classList.add('show-tip');
        setTimeout(() => fab.classList.remove('show-tip'), 5000);
      }
      ticking = false;
    });
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- Carrusel de noticias ---------- */
  const track = $('#news-track');
  if (track) {
    const btns = $$('.news__btn');
    const sync = () => {
      const max = track.scrollWidth - track.clientWidth - 2;
      btns.forEach((b) => { b.disabled = b.dataset.dir < 0 ? track.scrollLeft <= 2 : track.scrollLeft >= max; });
    };
    btns.forEach((b) => b.addEventListener('click', () => {
      const card = $('.post', track);
      const stepW = card.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0);
      track.scrollBy({ left: stepW * b.dataset.dir, behavior: reduce ? 'auto' : 'smooth' });
    }));
    track.addEventListener('scroll', () => requestAnimationFrame(sync), { passive: true });
    addEventListener('resize', sync); sync();
  }

  /* ---------- PQRS: abre el correo con el mensaje listo ---------- */
  const pq = $('#pqrs-form');
  if (pq) {
    const SIAU = 'siau@santahelenadelvalleips.com', CALIDAD = 'calidad@santahelenadelvalleips.com';
    const done = $('#pqrs-done');
    const pv = (n) => { const el = pq.elements[n]; if (!el) return ''; if (el instanceof RadioNodeList) return el.value; return el.type === 'checkbox' ? el.checked : el.value.trim(); };
    const checkPq = () => {
      let ok = true;
      $$('[required]', pq).forEach((el) => {
        if (el.type === 'radio') return;
        const bad = el.type === 'checkbox' ? !el.checked : !el.value.trim() || (el.type === 'email' && !el.checkValidity());
        el.closest('.field, .check').classList.toggle('is-invalid', bad); if (bad) ok = false;
      });
      const noType = !pv('tipo_pqrs');
      $('[data-perr="tipo_pqrs"]', pq).hidden = !noType; if (noType) ok = false;
      $('[data-perr="form"]', pq).hidden = ok;
      if (!ok) { const first = $('.is-invalid input, .is-invalid select, .is-invalid textarea', pq) || $('.pill input', pq); first && first.focus(); }
      return ok;
    };
    pq.addEventListener('input', (e) => { const f = e.target.closest('.field, .check'); if (f) f.classList.remove('is-invalid'); });
    const msg = $('#p-msg');
    const syncModo = () => {
      const adj = pv('modo') === 'adjuntar';
      $('#p-msg-field').hidden = adj; msg.required = !adj; $('#p-attach-note').hidden = !adj;
      if (adj) $('#p-msg-field').classList.remove('is-invalid');
    };
    pq.addEventListener('change', (e) => {
      if (e.target.name === 'tipo_pqrs') $('[data-perr="tipo_pqrs"]', pq).hidden = true;
      if (e.target.name === 'modo') syncModo();
    });
    syncModo();
    pq.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!checkPq()) return;
      const adj = pv('modo') === 'adjuntar';
      const tipo = pv('tipo_pqrs');
      const subject = `PQRS · ${tipo} · ${pv('asunto')}`;
      const body = [
        'Señores',
        'Sistema de Información y Atención al Usuario (SIAU)',
        'Santa Helena del Valle IPS',
        '',
        `Cordial saludo. Por medio de este correo presento ${tipo === 'Reclamo' ? 'un' : 'una'} ${tipo.toLowerCase()} con los siguientes datos:`,
        '',
        'DATOS DEL SOLICITANTE',
        `- Nombre: ${pv('nombre')}`,
        `- Documento: ${pv('tipo_doc')} N.° ${pv('documento')}`,
        `- Celular: ${pv('celular')}`,
        `- Correo electrónico: ${pv('correo')}`,
        `- Sede: ${pv('sede')}`,
        '',
        'SOLICITUD',
        `- Tipo: ${tipo}`,
        `- Asunto: ${pv('asunto')}`,
        '',
        ...(adj ? ['Adjunto a este correo el documento con el detalle de mi solicitud.'] : ['DESCRIPCIÓN', pv('mensaje')]),
        '',
        'Autorizo el tratamiento de mis datos personales para la gestión de esta solicitud, de acuerdo con la Ley 1581 de 2012.',
        '',
        'Quedo atento(a) a su respuesta.',
        '',
        'Atentamente,',
        pv('nombre'),
      ].join('\r\n'); // salto de línea estándar de correo (Outlook y Gmail ignoran el \n solo)
      const url = `mailto:${SIAU}?cc=${CALIDAD}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      done.innerHTML = `<strong>Su correo está listo.</strong>Revise el mensaje en su aplicación de correo y presione enviar.`
        + (adj ? ' <b>Antes de enviar, adjunte el documento con su PQRS.</b>' : '')
        + `<br>Si no se abrió su correo, escriba a <a href="mailto:${SIAU}">${SIAU}</a> con copia a <a href="mailto:${CALIDAD}">${CALIDAD}</a>. <br><button type="button" class="btn btn--ghost" id="pqrs-copy">Copiar el mensaje</button>`;
      done.hidden = false;
      $('#pqrs-copy').addEventListener('click', (ev) => {
        const t = `Para: ${SIAU}\r\nCC: ${CALIDAD}\r\nAsunto: ${subject}\r\n\r\n${body}`;
        (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => { ev.target.textContent = 'Mensaje copiado'; }, () => { ev.target.textContent = 'No se pudo copiar'; });
      });
      location.href = url;
    });
  }
})();
