(() => {
  const WA_NUMBER = '573113398988';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- Servicios (una sola fuente para pestañas y formulario) ---------- */
  const AREAS = [
    { id: 'general', name: 'Medicina general y enfermería',
      text: 'Consulta médica general y de enfermería para la atención, el seguimiento y la remisión oportuna, con el apoyo de un equipo interdisciplinario.',
      items: ['Consulta de medicina general', 'Consulta de enfermería', 'Nutrición y dietética', 'Psicología', 'Trabajo social', 'Optometría'] },
    { id: 'especialidades', name: 'Especialidades médicas',
      text: 'Consulta externa especializada que garantiza la continuidad y la integralidad de su atención.',
      items: ['Ginecología', 'Pediatría', 'Medicina interna', 'Cirugía general', 'Psiquiatría', 'Ortopedia y traumatología', 'Medicina del trabajo', 'Infectología', 'Fisiatría', 'Neumología pediátrica', 'Alergología', 'Reumatología pediátrica', 'Endocrinología pediátrica', 'Toxicología'] },
    { id: 'materno', name: 'Salud materno-infantil',
      text: 'Acompañamiento a la madre y al recién nacido desde los primeros días de vida. El control posparto se prioriza dentro de los cinco días posteriores al egreso hospitalario.',
      items: ['Consulta del recién nacido', 'Control de crecimiento y desarrollo', 'Asesoría en lactancia materna', 'Control posparto con ginecología', 'Tamizaje auditivo neonatal'] },
    { id: 'cronicos', name: 'Enfermedades crónicas',
      text: 'Programas de prevención y atención integral para el control de enfermedades crónicas, con seguimiento periódico por un equipo interdisciplinario.',
      items: ['Control de hipertensión arterial', 'Control de diabetes mellitus', 'Control de dislipidemia y obesidad', 'Programa de nefroprotección', 'Control de EPOC', 'Atención de desnutrición aguda'] },
    { id: 'cancer', name: 'Detección temprana de cáncer',
      text: 'Rutas de tamizaje para la detección oportuna de los cánceres de mayor impacto: cuello uterino, mama, próstata, y colon y recto.',
      items: ['Citología cervicouterina', 'Prueba de VPH', 'Colposcopia', 'Examen clínico de mama', 'Mamografía de tamizaje', 'Ecografía mamaria', 'Antígeno prostático (PSA)', 'Consulta de urología', 'Sangre oculta en heces', 'Colonoscopia'] },
    { id: 'vacunacion', name: 'Vacunación',
      text: 'Centro de referencia del Programa Ampliado de Inmunizaciones (PAI) y portafolio de vacunas no incluidas en el plan de beneficios, en modalidad intramural, domiciliaria y extramural.',
      items: ['Vacunación del esquema nacional (PAI)', 'Vacunas no incluidas en el PBS', 'Vacunación domiciliaria', 'Vacuna contra el VPH'] },
    { id: 'diagnostico', name: 'Apoyo diagnóstico',
      text: 'Laboratorio clínico procesado por el Laboratorio Cristiam Gram e imágenes diagnósticas con Radiología e Imágenes Diagnósticas, mediante contratos de interdependencia.',
      items: ['Toma de muestras de laboratorio', 'Ecografía', 'Rayos X', 'Electrocardiograma'] },
    { id: 'terapias', name: 'Terapias y rehabilitación',
      text: 'Unidad de terapia integral para la recuperación funcional de niños y adultos.',
      items: ['Fisioterapia', 'Fonoaudiología', 'Terapia respiratoria', 'Terapia ocupacional'] },
    { id: 'domicilio', name: 'Atención domiciliaria y telesalud',
      text: 'Teleconsulta sincrónica y asincrónica, entrega digital de resultados y atención en el hogar para pacientes con dificultad de desplazamiento.',
      items: ['Atención domiciliaria', 'Teleconsulta'] },
    { id: 'laboral', name: 'Salud ocupacional',
      text: 'Exámenes médicos ocupacionales reglamentarios y asesoría en seguridad y salud en el trabajo para empresas.',
      items: ['Examen ocupacional de ingreso', 'Examen ocupacional periódico', 'Examen ocupacional de egreso'] },
  ];

  /* ---------- Intro (una vez por sesión) ---------- */
  const intro = $('.intro');
  const hero = $('.hero');
  let seen = false;
  try { seen = sessionStorage.getItem('shv-intro') === '1'; sessionStorage.setItem('shv-intro', '1'); } catch (e) { seen = true; }
  const startHero = () => hero.classList.add('is-ready');
  if (intro && !seen && !reduce) {
    intro.classList.add('is-on');
    setTimeout(startHero, 820);
    setTimeout(() => intro.remove(), 1300);
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
  // Reduced motion: keep Helenita still. Otherwise play only while on screen.
  const vids = $$("video");
  vids.forEach((v) => { v.muted = true; if (reduce) { v.removeAttribute("autoplay"); v.pause(); } });
  // Breathing Helenita: half speed, with a 0.2 s rest before each repeat.
  $$("video.slow-loop").forEach((v) => {
    const slow = () => { v.defaultPlaybackRate = 0.5; v.playbackRate = 0.5; };
    slow(); v.addEventListener("loadedmetadata", slow); v.addEventListener("play", slow);
    v.addEventListener("ended", () => setTimeout(() => { v.currentTime = 0; if (v.dataset.onScreen !== "0") v.play().catch(() => {}); }, 200));
  });
  if (!reduce && "IntersectionObserver" in window) {
    const vio = new IntersectionObserver((es) => es.forEach((e) => {
      e.target.dataset.onScreen = e.isIntersecting ? "1" : "0";
      e.isIntersecting ? e.target.play().catch(() => {}) : e.target.pause();
    }));
    vids.forEach((v) => vio.observe(v));
  }

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

  catSel.innerHTML = '<option value="">Seleccione un área</option>' + AREAS.map((a) => `<option value="${a.id}">${a.name}</option>`).join('');
  const renderServices = (areaId, keep) => {
    const area = AREAS.find((a) => a.id === areaId);
    list.innerHTML = area ? area.items.map((s) => `<label class="svc-opt"><input type="radio" name="servicio" value="${s}"${s === keep ? ' checked' : ''}><span>${s}</span></label>`).join('') : '';
    if (!reduce) { list.classList.remove('is-swapping'); void list.offsetWidth; list.classList.add('is-swapping'); }
  };
  catSel.addEventListener('change', () => renderServices(catSel.value));

  const value = (n) => { const el = form.elements[n]; if (!el) return ''; if (el instanceof RadioNodeList) return el.value; return (el.type === 'checkbox' ? el.checked : el.value.trim()); };

  const go = (n) => {
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
    if (n === 3) renderSummary();
    const top = form.getBoundingClientRect().top;
    if (top < 80) form.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    const first = $('.panel.is-active input, .panel.is-active select', form);
    first && first.focus({ preventScroll: true });
  };

  const showErr = (key, on) => { const e = $(`[data-error="${key}"]`, form); if (e) e.hidden = !on; };
  const validate = (n) => {
    if (n === 1) { const ok = !!value('sede'); showErr('sede', !ok); return ok; }
    if (n === 2) { const ok = !!value('servicio'); showErr('servicio', !ok); return ok; }
    let ok = true;
    ['nombre', 'tipo', 'documento', 'nacimiento', 'celular', 'eps'].forEach((n2) => {
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
    const area = AREAS.find((a) => a.id === catSel.value);
    $('#summary').innerHTML = [value('sede') && `Sede ${value('sede')}`, value('servicio'), area && area.name].filter(Boolean).map((t) => `<span>${t}</span>`).join('');
  };

  form.addEventListener('click', (e) => {
    if (e.target.closest('[data-next]')) { if (validate(step)) go(step + 1); }
    if (e.target.closest('[data-prev]')) go(step - 1);
  });
  form.addEventListener('change', (e) => {
    if (e.target.name === 'sede') { showErr('sede', false); say(`Excelente. Sede ${e.target.value} seleccionada. Continúe para elegir el servicio.`); }
    if (e.target.name === 'servicio') { showErr('servicio', false); say(`${e.target.value}: entendido. Continúe para registrar los datos del paciente.`); }
    const f = e.target.closest('.field, .check'); if (f && f.classList.contains('is-invalid') && (e.target.value || e.target.checked)) f.classList.remove('is-invalid');
  });

  const fmtDate = (v) => { if (!v) return ''; const [y, m, d] = v.split('-'); return `${d}/${m}/${y}`; };
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validate(3)) return;
    const area = AREAS.find((a) => a.id === catSel.value);
    const lines = [
      'Cordial saludo. Deseo solicitar una cita en Santa Helena del Valle IPS.',
      '',
      `*Sede:* ${value('sede')}`,
      `*Servicio:* ${value('servicio')}${area ? ` (${area.name})` : ''}`,
      `*Paciente:* ${value('nombre')}`,
      `*Documento:* ${value('tipo')} ${value('documento')}`,
      `*Fecha de nacimiento:* ${fmtDate(value('nacimiento'))}`,
      `*Celular:* ${value('celular')}`,
      `*EPS:* ${value('eps')}`,
      `*Jornada de preferencia:* ${value('jornada')}`,
    ];
    if (value('observaciones')) lines.push(`*Observaciones:* ${value('observaciones')}`);
    lines.push('', 'Autorizo el tratamiento de mis datos personales para la gestión de esta solicitud. Quedo atento(a) a su confirmación.');
    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
    say('Su mensaje está listo en WhatsApp. Solo debe enviarlo.');
    window.open(url, '_blank', 'noopener');
  });

  // Preseleccionar un servicio desde la sección de servicios
  const preselect = (areaId, service) => {
    catSel.value = areaId; renderServices(areaId, service);
    const book = $('#agendar');
    book.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    go(value('sede') ? 3 : 1);
    if (!value('sede')) say(`Con gusto le ayudo con ${service ? service.toLowerCase() : 'su cita'}. Primero, seleccione la sede.`);
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
  siteBtns.forEach((b, i) => b.addEventListener("click", () => selectSite(i)));

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
    ['.community', '.community__head > *, .community__grid article'],
    ['.support', '.h3-title, .support__grid article'],
    ['.sites', '.sites__head > *, .site'],
    ['.about', '.about__intro > *, .about__rows > div'],
    ['.faq', '.faq__head > *, .q'],
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
})();
