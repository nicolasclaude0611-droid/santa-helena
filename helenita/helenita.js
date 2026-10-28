/*!
 * Helenita · rig vectorial animable
 * Santa Helena del Valle IPS
 *
 * Personaje construido en SVG por capas con articulaciones:
 *   cuerpo → torso → cabeza (ojos, cejas, boca, mejillas, flequillo, cola de caballo)
 *                  → brazos (hombro → codo → muñeca → mano intercambiable)
 *
 * Convención de lados: "R" = brazo DERECHO de Helenita (a la IZQUIERDA del espectador),
 *                      "L" = brazo IZQUIERDO de Helenita (a la DERECHA del espectador).
 * Ángulos de brazo en grados: 0 = colgando recto; positivo = hacia afuera / arriba.
 *
 * Uso:
 *   const h = Helenita.create(document.querySelector('#stage'));
 *   h.pose({ rSh: 45, rEl: 120, rHand: 'open' });
 */
(function (global) {
  'use strict';

  // Paleta tomada de la ilustración oficial de Helenita.
  const HEAD_SCALE = 0.93;
  const HS = `translate(618,200) scale(${HEAD_SCALE}) translate(-618,-200)`;

  const C = {
    skin: '#FCC39D', skinShade: '#F1A882', skinDeep: '#E28E6B', skinLight: '#FFD9BC',
    hair: '#8A3D1D', hairDark: '#5C2210', hairLight: '#B8642F', hairShine: '#D9884E',
    scrub: '#1441C8', scrubDark: '#0B2D9C', scrubDeep: '#08237F', scrubLight: '#2E5BE0',
    pants: '#0C2EA3', pantsDark: '#071D78',
    iris: '#8A3E1A', irisDark: '#4B1909', lash: '#2A0F07',
    mouth: '#8C2828', tongue: '#E8746C', teeth: '#FFFFFF', lip: '#E98A79',
    blush: '#F7876F', gold: '#FFD126', goldDark: '#F2A900', logoBlue: '#4190C8',
    shoe: '#F5F7FA', shoeLine: '#C7D2DC', white: '#FFFFFF'
  };

  // Puntos de pivote (coordenadas del personaje, lienzo 1236 de alto, centro x = 618)
  const P = {
    neck: [618, 200],
    pony: [552, 128],
    shR: [532, 276], shL: [704, 276],
    upper: 130, fore: 110,
    eyeR: [583, 113], eyeL: [653, 113],
    mouth: [618, 161]
  };

  // ---------- Manos (coordenadas locales: muñeca en 0,0, dedos hacia +y) ----------
  const HANDS = {
    relaxed: `
      <path d="M-13,-2 C-17,10 -17,26 -13,38 C-10,47 -2,52 6,50 C14,48 16,40 15,30 C15,20 14,8 12,-2 Z" fill="${C.skin}" />
      <path d="M-13,30 C-10,41 -3,47 5,47" fill="none" stroke="${C.skinShade}" stroke-width="2" stroke-linecap="round"/>
      <path d="M-6,34 C-3,40 2,42 7,41 M-8,24 C-5,30 1,32 7,31" fill="none" stroke="${C.skinDeep}" stroke-width="1.4" stroke-linecap="round" opacity=".55"/>
      <path d="M12,4 C19,10 21,20 17,28 C15,31 12,29 12,26 C13,20 11,13 9,9 Z" fill="${C.skin}" stroke="${C.skinShade}" stroke-width="1.2"/>`,
    open: `
      <g fill="${C.skin}" stroke="${C.skinShade}" stroke-width="1.3" stroke-linejoin="round">
        <path d="M-15,0 C-18,12 -19,26 -16,38 L16,38 C18,26 18,12 15,0 Z" stroke="none"/>
        <rect x="-15.5" y="30" width="8.6" height="30" rx="4.3" transform="rotate(8 -11 32)"/>
        <rect x="-6.6" y="32" width="8.6" height="34" rx="4.3" transform="rotate(2 -2 34)"/>
        <rect x="2.4" y="32" width="8.4" height="32" rx="4.2" transform="rotate(-4 6 34)"/>
        <rect x="10.6" y="29" width="7.6" height="25" rx="3.8" transform="rotate(-11 14 31)"/>
        <path d="M-15,0 C-18,12 -19,26 -16,38 C-6,44 8,44 16,38 C18,26 18,12 15,0" fill="${C.skin}" stroke="none"/>
        <path d="M-15,8 C-24,12 -32,20 -34,30 C-35,35 -30,37 -27,33 C-23,27 -18,24 -13,22 Z"/>
      </g>
      <path d="M-8,18 C-2,24 6,24 10,18" fill="none" stroke="${C.skinDeep}" stroke-width="1.3" stroke-linecap="round" opacity=".5"/>`,
    point: `
      <g fill="${C.skin}" stroke="${C.skinShade}" stroke-width="1.3" stroke-linejoin="round">
        <rect x="-6" y="24" width="9" height="42" rx="4.5"/>
        <path d="M-15,0 C-18,12 -18,26 -14,36 C-8,44 8,44 14,36 C18,26 17,12 14,0 Z"/>
        <path d="M-12,34 C-10,40 -4,42 0,40" fill="none"/>
        <path d="M2,38 C6,42 12,40 14,34" fill="none"/>
        <path d="M14,8 C22,14 22,24 16,30 C13,32 10,30 11,26 C13,22 12,16 9,12 Z"/>
      </g>`,
    fist: `
      <g fill="${C.skin}" stroke="${C.skinShade}" stroke-width="1.3" stroke-linejoin="round">
        <path d="M-15,0 C-18,12 -18,26 -14,36 C-8,44 8,44 14,36 C18,26 17,12 14,0 Z"/>
        <path d="M-12,34 C-10,40 -4,42 -1,40 M1,40 C4,43 10,41 13,35" fill="none"/>
        <path d="M14,8 C22,14 22,24 16,30 C13,32 10,30 11,26 C13,22 12,16 9,12 Z"/>
      </g>`,
    thumb: `
      <g fill="${C.skin}" stroke="${C.skinShade}" stroke-width="1.3" stroke-linejoin="round">
        <rect x="-15" y="18" width="11" height="44" rx="5.5" transform="rotate(4 -10 20)"/>
        <path d="M-14,0 C-18,12 -18,28 -13,38 C-7,44 7,44 13,38 C17,28 17,12 14,0 Z"/>
        <path d="M-5,16 C2,15 9,15 15,16 M-5,25 C2,24 9,24 16,25 M-4,34 C2,33 8,33 14,34" fill="none" opacity=".75"/>
        <path d="M-12,40 C-12,44 -8,46 -4,44" fill="none" stroke="${C.skinDeep}" opacity=".6"/>
      </g>`,
    pocket: `
      <path d="M-13,-2 C-16,10 -16,26 -13,40 L14,40 C16,26 15,10 12,-2 Z" fill="${C.skin}"/>`
  };
  const HAND_NAMES = Object.keys(HANDS);

  function armSVG(side) {
    const id = side; // 'R' | 'L'
    const [px, py] = side === 'R' ? P.shR : P.shL;
    const mirror = side === 'R' ? '' : ' scale(-1,1)';
    return `
    <g data-arm="${id}" transform="translate(${px},${py})${mirror}">
      <g data-j="${id}Sh">
        <!-- brazo superior -->
        <path d="M-18,20 C-20,60 -19,100 -16,132 L16,132 C18,100 18,60 16,20 Z" fill="${C.skin}"/>
        <path d="M-18,60 C-19,90 -18,110 -16,132" fill="none" stroke="${C.skinShade}" stroke-width="2.5" opacity=".7"/>
        <g data-j="${id}El" transform="translate(0,${P.upper})">
          <!-- antebrazo -->
          <path d="M-16,-6 C-17,30 -15,80 -12,${P.fore + 4} L12,${P.fore + 4} C15,80 16,30 16,-6 Z" fill="${C.skin}"/>
          <circle cx="0" cy="0" r="16" fill="${C.skin}"/>
          <path d="M-16,4 C-16,40 -14,80 -12,${P.fore}" fill="none" stroke="${C.skinShade}" stroke-width="2.2" opacity=".6"/>
          <g data-j="${id}Wr" transform="translate(0,${P.fore})">
            <g transform="scale(1.2)">${HAND_NAMES.map(n => `<g data-hand="${id}:${n}" style="display:none">${HANDS[n]}</g>`).join('')}</g>
          </g>
        </g>
        <!-- manga corta del scrub -->
        <path d="M-30,-8 C-38,14 -42,50 -44,88 C-28,96 4,96 18,88 C18,50 16,10 10,-22 C-2,-30 -20,-24 -30,-8 Z" fill="url(#h-sleeve)"/>
        <path d="M-44,88 C-28,96 4,96 18,88" fill="none" stroke="${C.scrubDeep}" stroke-width="2.5" opacity=".55"/>
        <path d="M-42,80 C-26,87 2,88 17,80" fill="none" stroke="${C.scrubDeep}" stroke-width="1.2" stroke-dasharray="3 3" opacity=".4"/>
        <path d="M-28,4 C-32,30 -34,56 -36,82" fill="none" stroke="${C.scrubDeep}" stroke-width="5" opacity=".18" stroke-linecap="round"/>
      </g>
    </g>`;
  }

  function eyeSVG(key, cx, cy) {
    // ojo grande estilo ilustración: esclerótica, iris degradado, pupila, brillos, pestañas
    const clip = `h-eyeclip-${key}`;
    const out = key === 'R' ? -1 : 1; // lado exterior del ojo
    const shape = `M${cx - 21},${cy + 2} C${cx - 16},${cy - 16} ${cx + 14},${cy - 18} ${cx + 21},${cy} C${cx + 16},${cy + 15} ${cx - 14},${cy + 18} ${cx - 21},${cy + 2} Z`;
    const g = (d) => `<g transform="translate(${cx},${cy}) scale(${out === -1 ? -1 : 1},1) translate(${-cx},${-cy})">${d}</g>`;
    return `
    <g data-eye="${key}">
      <g data-eyeopen="${key}">
        <clipPath id="${clip}"><path d="${shape}"/></clipPath>
        <path d="${shape}" fill="#FFFFFF"/>
        <g clip-path="url(#${clip})">
          <g data-iris="${key}">
            <ellipse cx="${cx}" cy="${cy + 1.5}" rx="14.5" ry="16.5" fill="url(#h-iris)"/>
            <ellipse cx="${cx}" cy="${cy + 3}" rx="7" ry="8" fill="${C.irisDark}"/>
            <ellipse cx="${cx}" cy="${cy + 1.5}" rx="14.5" ry="16.5" fill="none" stroke="${C.irisDark}" stroke-width="1.6" opacity=".75"/>
            <path d="M${cx - 9},${cy + 9} C${cx - 4},${cy + 14} ${cx + 5},${cy + 14} ${cx + 10},${cy + 8}" fill="none" stroke="#E0A060" stroke-width="2.2" opacity=".55" stroke-linecap="round"/>
            <circle cx="${cx + 5.5}" cy="${cy - 5}" r="5.2" fill="#FFFFFF"/>
            <circle cx="${cx - 5.5}" cy="${cy + 7}" r="2.2" fill="#FFFFFF" opacity=".9"/>
          </g>
          <path d="M${cx - 22},${cy - 18} L${cx + 22},${cy - 18} L${cx + 22},${cy - 6} C${cx + 8},${cy - 13} ${cx - 8},${cy - 13} ${cx - 22},${cy - 4} Z" fill="${C.skinShade}" opacity=".35"/>
        </g>
        ${g(`
        <!-- pestaña superior gruesa con ala exterior -->
        <path d="M${cx - 23},${cy + 3} C${cx - 18},${cy - 16} ${cx + 13},${cy - 20} ${cx + 22},${cy - 3} L${cx + 27},${cy - 9} L${cx + 25},${cy - 1} L${cx + 29},${cy - 3} L${cx + 23},${cy + 3} C${cx + 14},${cy - 13} ${cx - 15},${cy - 11} ${cx - 21},${cy + 4} Z" fill="${C.lash}"/>
        <path d="M${cx + 13},${cy + 13} C${cx + 18},${cy + 9} ${cx + 21},${cy + 5} ${cx + 22},${cy + 2}" fill="none" stroke="${C.lash}" stroke-width="1.4" stroke-linecap="round" opacity=".7"/>`)}
        <!-- línea inferior -->
        <path d="M${cx - 14},${cy + 14} C${cx - 4},${cy + 18} ${cx + 8},${cy + 17} ${cx + 16},${cy + 11}" fill="none" stroke="${C.irisDark}" stroke-width="1.1" opacity=".4" stroke-linecap="round"/>
        <!-- pliegue del párpado -->
        <path d="M${cx - 16},${cy - 16} C${cx - 6},${cy - 23} ${cx + 9},${cy - 23} ${cx + 18},${cy - 15}" fill="none" stroke="${C.skinDeep}" stroke-width="1.3" opacity=".55" stroke-linecap="round"/>
      </g>
      <!-- ojo cerrado (parpadeo) -->
      <path data-eyeclosed="${key}" d="M${cx - 22},${cy + 3} C${cx - 10},${cy + 11} ${cx + 10},${cy + 11} ${cx + 23},${cy + 2}" fill="none" stroke="${C.lash}" stroke-width="3.4" stroke-linecap="round" opacity="0"/>
      <!-- ojo feliz ^^ -->
      <path data-eyehappy="${key}" d="M${cx - 20},${cy + 5} C${cx - 11},${cy - 9} ${cx + 11},${cy - 9} ${cx + 20},${cy + 4}" fill="none" stroke="${C.lash}" stroke-width="4" stroke-linecap="round" opacity="0"/>
    </g>`;
  }

  function buildSVG(uid) {
    const [ex1, ey] = P.eyeR, [ex2] = P.eyeL;
    return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1236 1236" data-helenita="${uid}" overflow="visible">
  <defs>
    <linearGradient id="h-iris" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${C.irisDark}"/><stop offset=".45" stop-color="${C.iris}"/><stop offset="1" stop-color="#B8642C"/>
    </linearGradient>
    <linearGradient id="h-torso" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${C.scrubDark}"/><stop offset=".22" stop-color="${C.scrub}"/>
      <stop offset=".55" stop-color="${C.scrubLight}"/><stop offset=".85" stop-color="${C.scrub}"/><stop offset="1" stop-color="${C.scrubDark}"/>
    </linearGradient>
    <linearGradient id="h-sleeve" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${C.scrubDark}"/><stop offset=".55" stop-color="${C.scrub}"/><stop offset="1" stop-color="${C.scrubLight}"/>
    </linearGradient>
    <linearGradient id="h-pants" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${C.pantsDark}"/><stop offset=".45" stop-color="${C.pants}"/><stop offset="1" stop-color="${C.pantsDark}"/>
    </linearGradient>
    <linearGradient id="h-hair" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${C.hairLight}"/><stop offset=".55" stop-color="${C.hair}"/><stop offset="1" stop-color="${C.hairDark}"/>
    </linearGradient>
    <linearGradient id="h-pony" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${C.hairDark}"/><stop offset=".35" stop-color="${C.hair}"/><stop offset=".7" stop-color="${C.hairLight}"/><stop offset="1" stop-color="${C.hair}"/>
    </linearGradient>
    <radialGradient id="h-face" cx=".5" cy=".42" r=".62">
      <stop offset="0" stop-color="${C.skinLight}"/><stop offset=".7" stop-color="${C.skin}"/><stop offset="1" stop-color="${C.skinShade}"/>
    </radialGradient>
    <filter id="h-soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4"/></filter>
    <filter id="h-shadow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10"/></filter>
    <clipPath id="h-mouthclip"><path data-mouthclip d=""/></clipPath>
  </defs>

  <g data-root>
    <!-- sombra en el piso -->
    <ellipse data-floor cx="618" cy="1212" rx="150" ry="16" fill="#0A2233" opacity=".14" filter="url(#h-shadow)"/>

    <!-- piernas y zapatos -->
    <g data-legs>
      <path d="M506,600 L732,600 C740,800 730,1000 716,1176 L628,1176 C626,1000 624,820 620,712 L616,712 C612,820 610,1000 608,1176 L520,1176 C506,1000 498,800 506,600 Z" fill="url(#h-pants)"/>
      <path d="M618,640 L618,712" stroke="${C.pantsDark}" stroke-width="2"/>
      <path d="M560,700 C566,850 566,1000 568,1170 M676,700 C672,850 670,1000 666,1170" stroke="${C.pantsDark}" stroke-width="2" fill="none" opacity=".35"/>
      <path d="M528,1150 L612,1150 M626,1150 L706,1150" stroke="${C.pantsDark}" stroke-width="2" opacity=".6"/>
      <g fill="${C.shoe}" stroke="${C.shoeLine}" stroke-width="2">
        <path d="M528,1172 C526,1196 540,1210 572,1210 C600,1210 616,1204 614,1186 L612,1170 Z"/>
        <path d="M624,1170 L622,1186 C620,1204 636,1210 664,1210 C696,1210 710,1196 708,1172 Z"/>
      </g>
      <path d="M530,1200 C560,1206 600,1206 614,1198 M622,1198 C640,1206 680,1206 706,1200" stroke="${C.shoeLine}" stroke-width="3" fill="none"/>
    </g>

    <g data-upper>
      <!-- cabello de atrás -->
      <g data-head-back>
        <path data-hairback d="M542,166 C522,118 526,46 578,18 C612,4 654,6 684,26 C712,48 712,104 702,136 C698,146 692,146 688,140 C670,134 572,146 558,172 C554,178 546,174 542,166 Z" fill="url(#h-hair)"/>
      </g>

      <!-- cuello -->
      <path d="M597,168 L596,236 C606,246 630,246 640,236 L639,168 Z" fill="${C.skin}"/>
      <path d="M597,180 C606,206 630,206 639,180 L639,168 L597,168 Z" fill="${C.skinShade}"/>

      <!-- cola de caballo (dos segmentos para seguimiento) -->
      <g data-pony transform="translate(${P.pony[0]},${P.pony[1]})">
        <path d="M16,-20 C-12,-18 -40,0 -48,28 C-54,50 -40,64 -50,86 C-58,104 -66,114 -60,132 C-44,146 -10,144 -2,130 C-10,116 -2,102 0,88 C2,70 -8,58 -2,40 C4,22 18,8 30,-2 Z" fill="url(#h-pony)"/>
        <path d="M6,-12 C-16,2 -32,22 -36,40 C-40,58 -30,70 -36,90 C-40,104 -48,116 -48,130 M18,-6 C0,10 -14,30 -16,50 C-18,70 -8,84 -14,104" fill="none" stroke="${C.hairDark}" stroke-width="2.2" opacity=".5" stroke-linecap="round"/>
        <path d="M-4,2 C-16,16 -22,30 -22,46 C-22,60 -16,70 -20,86" fill="none" stroke="${C.hairShine}" stroke-width="4" opacity=".45" stroke-linecap="round"/>
        <g data-pony2 transform="translate(-30,118)">
          <path d="M-32,-6 C-46,10 -38,28 -48,46 C-58,60 -68,68 -68,88 C-68,106 -58,116 -66,134 C-48,130 -40,116 -40,100 C-34,118 -20,130 -6,132 C-20,116 -18,100 -12,88 C-6,102 6,110 18,110 C6,96 4,80 10,64 C18,48 30,34 26,14 C24,2 22,-4 20,-8 Z" fill="url(#h-pony)"/>
          <path d="M-18,0 C-28,18 -24,32 -34,48 C-42,62 -52,78 -52,100 M0,4 C-2,24 -6,42 -12,58 C-16,72 -16,86 -12,98 M14,4 C16,22 10,40 4,56" fill="none" stroke="${C.hairDark}" stroke-width="2.2" opacity=".5" stroke-linecap="round"/>
          <path d="M8,6 C10,22 2,40 -4,54 M-28,34 C-34,46 -40,58 -44,70" fill="none" stroke="${C.hairShine}" stroke-width="4" opacity=".38" stroke-linecap="round"/>
          <path d="M-56,74 C-62,90 -58,104 -62,118 M-26,94 C-24,106 -18,116 -10,122" fill="none" stroke="${C.hairDark}" stroke-width="1.6" opacity=".5" stroke-linecap="round"/>
        </g>
        <ellipse cx="14" cy="-10" rx="11" ry="9" fill="${C.hairDark}"/>
      </g>

      <!-- torso (scrub) -->
      <g data-torso>
        <path d="M596,226 C570,232 540,242 524,256 C508,270 506,300 512,330 C516,372 536,412 546,448 C540,516 510,580 502,640 C560,652 676,652 734,640 C726,580 696,516 690,448 C700,412 720,372 724,330 C730,300 728,270 712,256 C696,242 666,232 640,226 Z" fill="url(#h-torso)"/>
        <!-- costuras princesa -->
        <path d="M570,262 C576,330 572,400 566,458 C560,530 556,590 556,646 M666,262 C660,330 664,400 670,458 C676,530 680,590 680,646" fill="none" stroke="${C.scrubDeep}" stroke-width="1.6" opacity=".35"/>
        <!-- volumen de busto y cintura -->
        <path d="M540,352 C560,376 596,380 612,362 M624,362 C640,380 676,376 696,352" fill="none" stroke="${C.scrubDeep}" stroke-width="2.4" opacity=".35" stroke-linecap="round"/>
        <path d="M546,300 C556,330 590,344 606,330" fill="none" stroke="${C.scrubLight}" stroke-width="7" opacity=".35" stroke-linecap="round"/>
        <path d="M512,330 C516,372 536,412 546,448 C540,516 510,580 502,640 L522,640 C530,580 554,516 558,448 C548,412 530,372 526,330 Z" fill="${C.scrubDeep}" opacity=".25"/>
        <path d="M546,448 C590,462 646,462 690,448" fill="none" stroke="${C.scrubDeep}" stroke-width="2" opacity=".22"/>
        <!-- aberturas laterales -->
        <path d="M510,604 L506,642 M726,604 L730,642" stroke="${C.scrubDeep}" stroke-width="2.4" opacity=".6"/>
        <path d="M502,640 C560,652 676,652 734,640" fill="none" stroke="${C.scrubDeep}" stroke-width="2.4" opacity=".5"/>
        <!-- bolsillos -->
        <path d="M534,520 L598,522 L598,598 C598,606 592,610 584,610 L546,608 C538,608 534,602 534,594 Z M638,522 L702,520 L702,594 C702,602 698,608 690,608 L652,610 C644,610 638,606 638,598 Z" fill="none" stroke="${C.scrubDeep}" stroke-width="1.8" opacity=".5"/>
        <path d="M534,528 L598,530 M638,530 L702,528" stroke="${C.scrubDeep}" stroke-width="1.2" stroke-dasharray="3 3" opacity=".45"/>
        <!-- escote en V con piel -->
        <path d="M598,232 C606,256 612,280 618,304 C624,280 630,256 638,232 Z" fill="${C.skin}"/>
        <path d="M598,232 C610,240 626,240 638,232 L636,244 C626,250 610,250 600,244 Z" fill="${C.skinShade}" opacity=".6"/>
        <path d="M618,304 L618,342" stroke="${C.scrubDeep}" stroke-width="1.6" opacity=".35"/>
        <!-- cuello mao: banda trasera + dos solapas -->
        <path d="M586,242 C586,230 600,222 618,222 C636,222 650,230 650,242 L644,242 C640,236 630,231 618,231 C606,231 596,236 592,242 Z" fill="${C.scrubDark}"/>
        <path d="M586,240 C586,230 590,222 596,218 C598,236 606,256 618,304 C604,282 590,262 586,240 Z" fill="${C.scrub}" stroke="${C.scrubDeep}" stroke-width="1.6" stroke-linejoin="round"/>
        <path d="M650,240 C650,230 646,222 640,218 C638,236 630,256 618,304 C632,282 646,262 650,240 Z" fill="${C.scrubLight}" stroke="${C.scrubDeep}" stroke-width="1.6" stroke-linejoin="round"/>
        <!-- logo bordado -->
        <g data-logo transform="translate(628,316) scale(.8)">
          <g transform="translate(14,14)">
            ${[0, 40, 80, 120, 160, 200, 240, 280, 320].map(a => `<path d="M0,0 C3,-5 5,-11 2,-16 C-1,-12 -3,-6 0,0 Z" fill="${C.gold}" transform="rotate(${a})"/>`).join('')}
            <path d="M-2,4 C-6,12 -12,18 -18,22" stroke="${C.gold}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
            <path d="M5,-7 C-2,-9 -6,-3 -1,0 C4,3 2,9 -5,7" stroke="${C.logoBlue}" stroke-width="3.2" fill="none" stroke-linecap="round"/>
          </g>
          <text x="22" y="16" font-family="Figtree, 'Trebuchet MS', Arial, sans-serif" font-weight="700" font-style="italic" font-size="11.5" fill="#FFFFFF" letter-spacing="-.2">anta Helena</text>
          <text x="24" y="27" font-family="Figtree, 'Trebuchet MS', Arial, sans-serif" font-weight="600" font-style="italic" font-size="8.6" fill="#FFFFFF">del Valle <tspan fill="${C.gold}" font-weight="800">IPS</tspan></text>
        </g>
      </g>

      <!-- brazos -->
      ${armSVG('R')}
      ${armSVG('L')}

      <!-- frente de bolsillos (solo visible en pose "manos en bolsillos") -->
      <g data-pocketfront opacity="0">
        <path d="M534,526 L598,528 L598,598 C598,606 592,610 584,610 L546,608 C538,608 534,602 534,594 Z" fill="${C.scrub}" stroke="${C.scrubDeep}" stroke-width="1.8"/>
        <path d="M638,528 L702,526 L702,594 C702,602 698,608 690,608 L652,610 C644,610 638,606 638,598 Z" fill="${C.scrub}" stroke="${C.scrubDeep}" stroke-width="1.8"/>
        <path d="M536,530 C556,536 580,536 598,532 M638,532 C656,536 680,536 700,530" stroke="${C.scrubDeep}" stroke-width="2.4" fill="none"/>
      </g>

      <!-- cabeza -->
      <g data-head>
        <!-- orejas -->
        <g data-ears>
          <path d="M690,104 C702,100 708,112 704,126 C701,136 694,140 688,138 Z" fill="${C.skin}" stroke="${C.skinShade}" stroke-width="1.5"/>
          <path d="M694,112 C699,114 699,124 694,130" fill="none" stroke="${C.skinDeep}" stroke-width="1.5" opacity=".6"/>
        </g>
        <!-- rostro -->
        <path data-face d="M548,92 C546,126 556,160 584,182 C598,193 610,198 618,198 C628,198 640,193 654,182 C682,160 690,126 688,92 C688,58 660,40 618,40 C576,40 548,58 548,92 Z" fill="url(#h-face)"/>
        <!-- facciones (se desplazan con el giro de cabeza) -->
        <g data-features>
          <g data-blush>
            <ellipse cx="566" cy="140" rx="15" ry="8" fill="${C.blush}" filter="url(#h-soft)"/>
            <ellipse cx="670" cy="140" rx="15" ry="8" fill="${C.blush}" filter="url(#h-soft)"/>
          </g>

          ${eyeSVG('R', ex1, ey)}
          ${eyeSVG('L', ex2, ey)}
          <!-- nariz -->
          <path d="M617,134 C621,138 623,142 618,145" fill="none" stroke="${C.skinDeep}" stroke-width="2" stroke-linecap="round" opacity=".75"/>
          <ellipse cx="614" cy="133" rx="2.2" ry="4" fill="#FFFFFF" opacity=".35"/>
          <!-- boca -->
          <g data-mouth>
            <path data-mouthfill d="" fill="${C.mouth}"/>
            <g clip-path="url(#h-mouthclip)">
              <rect data-teeth x="590" y="150" width="56" height="8" fill="${C.teeth}"/>
              <ellipse data-tongue cx="618" cy="176" rx="14" ry="8" fill="${C.tongue}"/>
            </g>
            <path data-lowlip d="" fill="none" stroke="${C.lip}" stroke-width="2" stroke-linecap="round" opacity=".7"/>
            <path data-mouthline d="" fill="none" stroke="#7A2A22" stroke-width="2.4" stroke-linecap="round"/>
          </g>
        </g>

        <!-- cabello frontal: flequillo y mechones -->
        <g data-fringe>
          <!-- coronilla con volumen -->
          <path d="M542,122 C530,58 568,12 620,10 C674,10 708,54 698,120 C692,98 684,80 668,66 C648,52 590,52 570,64 C556,76 546,98 540,124 Z" fill="url(#h-hair)"/>
          <!-- trenza en la línea del cabello (lado derecho de Helenita) -->
          <g stroke="${C.hairDark}" stroke-width="1.3" stroke-linejoin="round">
            ${[[553, 92, -78], [557, 76, -66], [564, 61, -54], [574, 48, -40], [587, 38, -26], [602, 31, -12], [618, 28, 0]]
              .map(([x, y, r], i) => `<path d="M-11,0 C-6,-8 6,-8 11,0 C6,6 -6,6 -11,0 Z" transform="translate(${x},${y}) rotate(${r + (i % 2 ? 16 : -16)})" fill="${i % 2 ? C.hair : C.hairLight}"/>`).join('')}
          </g>
          <!-- flequillo suave en mechones -->
          <path d="M550,108 C548,70 576,46 620,44 C664,46 692,70 690,108
                   C686,98 680,90 674,86 C674,94 672,100 668,104 C664,92 656,82 646,76 C648,86 648,94 644,100
                   C640,88 632,76 622,70 C622,80 620,90 614,98 C612,86 606,76 598,72 C598,82 594,90 588,96
                   C586,86 582,80 576,78 C574,88 570,96 564,100 C560,94 556,98 550,108 Z" fill="url(#h-hair)"/>
          <path d="M580,58 C576,68 572,78 570,86 M602,52 C600,62 598,72 594,82 M624,50 C624,60 622,70 620,80 M646,54 C648,62 648,72 646,82 M666,62 C670,70 672,78 672,86" fill="none" stroke="${C.hairDark}" stroke-width="1.5" opacity=".45" stroke-linecap="round"/>
          <path d="M592,26 C614,18 646,20 670,34" fill="none" stroke="${C.hairShine}" stroke-width="6" opacity=".35" stroke-linecap="round"/>
          <path d="M600,60 C620,54 644,56 660,62" fill="none" stroke="${C.hairShine}" stroke-width="3" opacity=".3" stroke-linecap="round"/>
          <!-- mechones laterales finos -->
          <path data-lockR d="M554,86 C544,104 544,128 548,150 C551,164 556,174 562,182 C560,166 558,150 560,134 C561,118 564,102 568,92 Z" fill="${C.hair}"/>
          <path d="M556,104 C552,124 553,150 559,172" fill="none" stroke="${C.hairDark}" stroke-width="1.3" opacity=".5"/>
          <path data-lockL d="M682,84 C694,102 698,128 694,154 C692,168 686,180 678,188 C682,170 684,152 682,136 C680,118 676,102 670,92 Z" fill="${C.hair}"/>
          <path d="M686,100 C692,120 692,146 684,176" fill="none" stroke="${C.hairDark}" stroke-width="1.3" opacity=".5"/>
        </g>
        <g data-browwrap>
          <g data-brows>
            <path d="M564,93 C573,87 590,86 602,90" fill="none" stroke="${C.hairDark}" stroke-width="3.2" stroke-linecap="round"/>
            <path d="M634,90 C646,86 663,87 672,93" fill="none" stroke="${C.hairDark}" stroke-width="3.2" stroke-linecap="round"/>
          </g>
        </g>
      </g>
    </g>
  </g>
</svg>`;
  }

  // ---------- Pose por defecto ----------
  const DEFAULT_POSE = {
    x: 0, y: 0, bodyRot: 0, breath: 0, squash: 0,
    headRot: 0, headYaw: 0, headNod: 0,
    blink: 0, happy: 0, lookX: 0, lookY: 0, brow: 0,
    mouth: 0.55, smile: 1, blush: 0.5,
    rSh: 7, rEl: -5, rWr: 0, rHand: 'relaxed',
    lSh: 7, lEl: -5, lWr: 0, lHand: 'relaxed',
    pocket: 0, pony: 0, pony2: 0
  };

  let counter = 0;

  function create(container) {
    const uid = 'h' + (++counter);
    container.insertAdjacentHTML('beforeend', buildSVG(uid));
    const svg = container.querySelector(`svg[data-helenita="${uid}"]`);
    const q = s => svg.querySelector(s);
    const qa = s => Array.from(svg.querySelectorAll(s));

    const el = {
      root: q('[data-root]'), upper: q('[data-upper]'), torso: q('[data-torso]'),
      head: q('[data-head]'), features: q('[data-features]'), fringe: q('[data-fringe]'),
      hairback: q('[data-head-back]'), ears: q('[data-ears]'), floor: q('[data-floor]'),
      pony: q('[data-pony]'), pony2: q('[data-pony2]'), pocket: q('[data-pocketfront]'),
      brows: q('[data-brows]'), browwrap: q('[data-browwrap]'), blush: q('[data-blush]'),
      mouthFill: q('[data-mouthfill]'), mouthClip: q('[data-mouthclip]'), mouthLine: q('[data-mouthline]'),
      lowLip: q('[data-lowlip]'), teeth: q('[data-teeth]'), tongue: q('[data-tongue]'),
      eyes: ['R', 'L'].map(k => ({
        open: q(`[data-eyeopen="${k}"]`), closed: q(`[data-eyeclosed="${k}"]`),
        happy: q(`[data-eyehappy="${k}"]`), iris: q(`[data-iris="${k}"]`),
        c: k === 'R' ? P.eyeR : P.eyeL
      })),
      arms: {}
    };
    ['R', 'L'].forEach(s => {
      el.arms[s] = {
        sh: q(`[data-j="${s}Sh"]`), el: q(`[data-j="${s}El"]`), wr: q(`[data-j="${s}Wr"]`),
        hands: Object.fromEntries(HAND_NAMES.map(n => [n, q(`[data-hand="${s}:${n}"]`)])),
        current: null
      };
    });

    const state = Object.assign({}, DEFAULT_POSE);

    function mouthPaths(open, smile) {
      const [mx, my] = P.mouth;
      const w = 19 + smile * 3 + open * 3;
      const cy = my - smile * 3 + open * 1;          // altura de comisuras
      const top = cy + 3 + smile * 2 - open * 1;      // control labio superior
      const depth = cy + 2 + open * 40;               // control labio inferior
      const upper = `M${mx - w},${cy} Q${mx},${top} ${mx + w},${cy}`;
      const fill = `${upper} Q${mx},${depth} ${mx - w},${cy} Z`;
      return { upper, fill, cy, w, depth };
    }

    function apply(p) {
      Object.assign(state, p);
      const s = state;

      el.root.setAttribute('transform',
        `translate(${s.x},${s.y}) rotate(${s.bodyRot},618,1200) translate(618,1200) scale(${1 - s.squash * 0.5},${1 + s.squash}) translate(-618,-1200)`);
      el.floor.setAttribute('transform', `translate(0,${-s.y}) translate(618,1212) scale(${1 - Math.min(0.4, Math.abs(s.y) / 300)}) translate(-618,-1212)`);
      const b = s.breath;
      el.upper.setAttribute('transform', `translate(0,${-b * 2.4})`);
      el.torso.setAttribute('transform', `translate(618,460) scale(${1 + b * 0.006},${1 + b * 0.01}) translate(-618,-460)`);

      // cabeza
      el.head.setAttribute('transform', `${HS} rotate(${s.headRot},${P.neck[0]},${P.neck[1]}) translate(0,${s.headNod * 2})`);
      el.hairback.setAttribute('transform', `${HS} rotate(${s.headRot},${P.neck[0]},${P.neck[1]}) translate(${-s.headYaw * 4},${s.headNod * 1})`);
      el.features.setAttribute('transform', `translate(${s.headYaw * 11},${s.headNod * 4})`);
      el.fringe.setAttribute('transform', `translate(${s.headYaw * 6},${s.headNod * 1.5})`);
      el.ears.setAttribute('transform', `translate(${-s.headYaw * 5},0)`);
      el.brows.setAttribute('transform', `translate(0,${-s.brow * 4.5})`);
      el.browwrap.setAttribute('transform', `translate(${s.headYaw * 10},${s.headNod * 3.5})`);
      el.blush.setAttribute('opacity', s.blush);

      // ojos
      const openness = Math.max(0, (1 - s.blink) * (1 - s.happy));
      el.eyes.forEach(e => {
        const [cx, cy] = e.c;
        const k = Math.max(0.04, openness);
        e.open.setAttribute('transform', `translate(0,${cy + 6}) scale(1,${k}) translate(0,${-(cy + 6)})`);
        e.open.setAttribute('opacity', openness < 0.12 ? 0 : 1);
        e.closed.setAttribute('opacity', s.happy < 0.5 && openness < 0.12 ? 1 : 0);
        e.happy.setAttribute('opacity', s.happy >= 0.5 ? 1 : 0);
        e.iris.setAttribute('transform', `translate(${s.lookX * 4.5},${s.lookY * 3.5})`);
      });

      // boca
      const m = mouthPaths(Math.max(0, s.mouth), s.smile);
      el.mouthLine.setAttribute('d', m.upper);
      const showFill = s.mouth > 0.02;
      el.mouthFill.setAttribute('d', showFill ? m.fill : '');
      el.mouthClip.setAttribute('d', showFill ? m.fill : '');
      el.lowLip.setAttribute('d', showFill ? `M${P.mouth[0] - m.w * 0.5},${(m.cy + m.depth) / 2 + 2} Q${P.mouth[0]},${(m.cy + m.depth) / 2 + 5} ${P.mouth[0] + m.w * 0.5},${(m.cy + m.depth) / 2 + 2}` : '');
      el.teeth.setAttribute('y', m.cy - 2);
      el.tongue.setAttribute('cy', (m.cy + m.depth) / 2 + 1);

      // brazos
      ['R', 'L'].forEach(side => {
        const a = el.arms[side], k = side.toLowerCase();
        a.sh.setAttribute('transform', `rotate(${s[k + 'Sh']})`);
        a.el.setAttribute('transform', `translate(0,${P.upper}) rotate(${s[k + 'El']})`);
        a.wr.setAttribute('transform', `translate(0,${P.fore}) rotate(${s[k + 'Wr']})`);
        const hand = HANDS[s[k + 'Hand']] ? s[k + 'Hand'] : 'relaxed';
        if (a.current !== hand) {
          if (a.current) a.hands[a.current].style.display = 'none';
          a.hands[hand].style.display = '';
          a.current = hand;
        }
      });
      el.pocket.setAttribute('opacity', s.pocket > 0.5 ? 1 : 0);

      // cola de caballo
      el.pony.setAttribute('transform', `${HS} rotate(${s.headRot},${P.neck[0]},${P.neck[1]}) translate(${P.pony[0] - s.headYaw * 4},${P.pony[1]}) rotate(${s.pony}) scale(1.18)`);
      el.pony2.setAttribute('transform', `translate(-30,118) rotate(${s.pony2})`);
      return state;
    }

    apply({});
    return { svg, pose: apply, get state() { return Object.assign({}, state); }, defaults: DEFAULT_POSE };
  }

  // ---------- Motor de animación ----------
  const EASE = {
    lin: t => t,
    io: t => 0.5 - 0.5 * Math.cos(Math.PI * t),
    in: t => t * t * t,
    out: t => 1 - Math.pow(1 - t, 3),
    back: t => { const c = 1.70158 * 1.2; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
    // entrada y salida suaves con un pequeño rebote al final (gestos naturales)
    soft: t => { const c = 1.2; return t < 0.5 ? (Math.pow(2 * t, 2) * ((c + 1) * 2 * t - c)) / 2 : (Math.pow(2 * t - 2, 2) * ((c + 1) * (t * 2 - 2) + c) + 2) / 2; },
    step: t => (t < 1 ? 0 : 1)
  };

  function sampleTrack(keys, t) {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      const [t1, v1, e = 'io'] = keys[i];
      if (t <= t1) {
        const [t0, v0] = keys[i - 1];
        if (typeof v1 !== 'number') return t >= t1 ? v1 : v0; // valores de texto: cambio instantáneo
        const u = (t - t0) / Math.max(1e-6, t1 - t0);
        return v0 + (v1 - v0) * EASE[e](u);
      }
    }
    return keys[keys.length - 1][1];
  }

  // Capa "viva": respiración, parpadeo y vaivén del cabello. Determinista según el tiempo
  // para que el render cuadro a cuadro sea idéntico a la reproducción en vivo.
  const BLINKS = [0.9, 3.4, 3.62, 6.1, 8.7, 11.2];
  function lifeLayer(t, motion) {
    const out = {};
    out.breath = Math.sin(t * Math.PI * 2 / 3.6);
    const T = motion.duration || 12;
    const tl = motion.loop ? t % T : t;
    let blink = 0;
    const blinkTimes = motion.blinks || BLINKS.filter(b => b < T - 0.2);
    for (const bt of blinkTimes) {
      const d = tl - bt;
      if (d >= 0 && d < 0.18) blink = Math.sin(Math.PI * d / 0.18);
    }
    out.blink = blink;
    out.pony = Math.sin(t * 1.7) * 1.6;
    out.pony2 = Math.sin(t * 1.7 - 0.9) * 2.4;
    return out;
  }

  function evaluate(motion, t) {
    const T = motion.duration;
    const tl = motion.loop ? ((t % T) + T) % T : Math.min(t, T);
    const pose = Object.assign({}, DEFAULT_POSE);
    for (const [k, keys] of Object.entries(motion.keys || {})) pose[k] = sampleTrack(keys, tl);
    const life = lifeLayer(t, motion);
    pose.breath += life.breath;
    if (!motion.keys || !motion.keys.blink) pose.blink = Math.max(pose.blink, life.blink);
    // el vaivén reacciona a la inclinación de la cabeza y del cuerpo
    pose.pony += life.pony - pose.headRot * 0.6 - pose.bodyRot * 0.8;
    pose.pony2 += life.pony2 - pose.headRot * 0.4;
    if (motion.fx) motion.fx(tl, pose, t);
    return pose;
  }

  function player(rig, motions) {
    let current = null, t0 = 0, playing = false, raf = 0, t = 0, onTick = null;
    function frame(now) {
      if (!playing) return;
      t = (now - t0) / 1000;
      if (!current.loop && t > current.duration) { t = current.duration; playing = false; }
      rig.pose(evaluate(current, t));
      onTick && onTick(t, current);
      if (playing) raf = requestAnimationFrame(frame);
    }
    return {
      play(name) {
        current = typeof name === 'string' ? motions[name] : name;
        cancelAnimationFrame(raf); playing = true; t0 = performance.now(); raf = requestAnimationFrame(frame);
      },
      pause() { playing = false; cancelAnimationFrame(raf); },
      resume() { if (!current) return; playing = true; t0 = performance.now() - t * 1000; raf = requestAnimationFrame(frame); },
      seek(sec) { t = sec; t0 = performance.now() - sec * 1000; rig.pose(evaluate(current, sec)); onTick && onTick(t, current); },
      renderAt(sec) { rig.pose(evaluate(current, sec)); },
      get time() { return t; }, get motion() { return current; }, get playing() { return playing; },
      set onTick(fn) { onTick = fn; }
    };
  }

  global.Helenita = { create, evaluate, player, EASE, DEFAULT_POSE, HANDS: HAND_NAMES, COLORS: C };
})(window);
