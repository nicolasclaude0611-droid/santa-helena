/*!
 * Biblioteca de movimientos de Helenita.
 *
 * Cada movimiento es un objeto:
 *   duration  segundos
 *   loop      true si se repite sin corte
 *   keys      { parametro: [[tiempo, valor, easing?], ...] }   easing: io (defecto) | soft | out | in | lin | back | step
 *   fx        función opcional (t, pose) para capas procedurales (ondas, habla, etc.)
 *
 * Parámetros disponibles: ver DEFAULT_POSE en helenita.js.
 * Para crear un movimiento nuevo, copie uno existente y ajuste los keyframes.
 */
(function (global) {
  'use strict';

  const REST = { rSh: 7, rEl: -5, lSh: 7, lEl: -5 };
  const POCKET = { sh: 14, el: -38, wr: 6 };
  const wave = (t, f, ph = 0) => Math.sin((t * f + ph) * Math.PI * 2);
  const env = (t, a, b, fade = 0.25) =>
    t < a || t > b ? 0 : Math.min(1, (t - a) / fade, (b - t) / fade);

  const MOTIONS = {

    // 1 · Respirar — reposo vivo (respira, parpadea, mueve la cola de caballo)
    respirar: {
      label: 'Respirar (reposo)',
      duration: 7.2, loop: true,
      keys: {
        headRot: [[0, -1.5], [3.6, 1.5], [7.2, -1.5]],
        bodyRot: [[0, -0.3], [3.6, 0.3], [7.2, -0.3]],
        lookX: [[0, 0], [2.4, 0], [2.7, -0.5], [4.4, -0.5], [4.7, 0], [7.2, 0]],
        mouth: [[0, 0.35], [7.2, 0.35]]
      },
      blinks: [1.2, 4.9, 5.12]
    },

    // 2 · Saludar — recreación del video original (4 s)
    saludar: {
      label: 'Saludar (video original)',
      duration: 4.2, loop: true,
      keys: {
        happy:   [[0, 1], [0.55, 1], [0.8, 0, 'out'], [3.4, 0], [3.6, 1], [4.2, 1]],
        mouth:   [[0, 0.45], [0.7, 0.8], [3.0, 0.75], [3.8, 0.45], [4.2, 0.45]],
        rSh:     [[0, REST.rSh], [0.05, REST.rSh], [0.85, 46, 'soft'], [2.75, 46], [3.4, REST.rSh, 'io'], [4.2, REST.rSh]],
        rEl:     [[0, REST.rEl], [0.05, REST.rEl], [0.9, 122, 'soft'], [2.7, 122], [3.4, REST.rEl, 'io'], [4.2, REST.rEl]],
        rHand:   [[0, 'relaxed'], [0.35, 'open'], [3.05, 'relaxed'], [4.2, 'relaxed']],
        headRot: [[0, -6], [0.7, 4, 'out'], [2.2, 2], [3.4, -3], [4.2, -6]],
        headYaw: [[0, 0.2], [0.8, -0.15], [3.2, 0], [4.2, 0.2]],
        bodyRot: [[0, -1.2], [0.8, 0.8], [3.2, 0.2], [4.2, -1.2]],
        brow:    [[0, 0.3], [0.9, 0.6], [2.6, 0.4], [4.2, 0.3]],
        blush:   [[0, 0.7], [4.2, 0.7]]
      },
      blinks: [2.8],
      fx(t, p) {
        const e = env(t, 0.85, 2.75, 0.3);
        p.rWr += wave(t, 2.3) * 16 * e;
        p.rEl += wave(t, 2.3, -0.12) * 9 * e;
        p.pony += wave(t, 2.3, -0.3) * 1.5 * e;
      }
    },

    // 3 · Hablar — para diálogos y locuciones (labios + gestos con la mano)
    hablar: {
      label: 'Hablar',
      duration: 6, loop: true,
      keys: {
        lSh:     [[0, REST.lSh], [0.6, 22], [2.6, 24], [3.2, 18], [4.6, 20], [5.4, REST.lSh], [6, REST.lSh]],
        lEl:     [[0, REST.lEl], [0.6, 88, 'out'], [2.6, 96], [3.2, 70], [4.6, 92], [5.4, REST.lEl], [6, REST.lEl]],
        lWr:     [[0, 0], [0.6, -10], [2.6, -18], [3.2, -5], [4.6, -15], [5.4, 0], [6, 0]],
        lHand:   [[0, 'relaxed'], [0.35, 'open'], [5.2, 'relaxed'], [6, 'relaxed']],
        headRot: [[0, 0], [1, 3], [2, -2], [3, 2.5], [4.2, -1.5], [5.2, 1], [6, 0]],
        headNod: [[0, 0], [0.8, 1], [1.2, 0], [2.6, 1], [3.0, 0], [4.4, 0.8], [4.8, 0], [6, 0]],
        headYaw: [[0, 0], [2, 0.15], [4, -0.12], [6, 0]],
        brow:    [[0, 0.2], [0.9, 0.9], [1.4, 0.3], [2.7, 0.8], [3.2, 0.2], [6, 0.2]],
        smile:   [[0, 1], [6, 1]]
      },
      blinks: [1.6, 4.1],
      fx(t, p) {
        // sílabas pseudoaleatorias deterministas, con pausas entre frases
        const talking = env(t, 0.2, 2.8, 0.15) + env(t, 3.2, 5.6, 0.15);
        const syl = Math.abs(Math.sin(t * 13.1) * 0.6 + Math.sin(t * 7.3 + 1) * 0.4);
        p.mouth = 0.12 + talking * syl * 0.8;
        p.lWr += wave(t, 1.4) * 6;
      }
    },

    // 4 · Señalar — apunta hacia la derecha de la pantalla (p. ej. "agende aquí")
    senalar: {
      label: 'Señalar a un lado',
      duration: 4, loop: true,
      keys: {
        lSh:     [[0, REST.lSh], [0.2, REST.lSh], [0.75, 72, 'soft'], [3.0, 72], [3.6, REST.lSh], [4, REST.lSh]],
        lEl:     [[0, REST.lEl], [0.2, REST.lEl], [0.75, 22, 'soft'], [3.0, 22], [3.6, REST.lEl], [4, REST.lEl]],
        lWr:     [[0, 0], [0.75, -8], [3.0, -8], [3.6, 0], [4, 0]],
        lHand:   [[0, 'relaxed'], [0.4, 'point'], [3.3, 'relaxed'], [4, 'relaxed']],
        headYaw: [[0, 0], [0.6, 0.55], [1.7, 0.55], [2.1, -0.05], [3.4, 0], [4, 0]],
        lookX:   [[0, 0], [0.55, 1], [1.7, 1], [2.0, 0], [4, 0]],
        headRot: [[0, 0], [0.7, 4], [1.8, 4], [2.2, -1], [3.6, 0], [4, 0]],
        bodyRot: [[0, 0], [0.8, 1], [3, 1], [3.6, 0], [4, 0]],
        mouth:   [[0, 0.4], [0.8, 0.7], [2.2, 0.75], [4, 0.4]],
        brow:    [[0, 0], [0.8, 0.8], [2.2, 0.5], [4, 0]]
      },
      blinks: [2.05],
      fx(t, p) { p.lEl += wave(t, 1.2) * 2 * env(t, 0.8, 3.0); }
    },

    // 5 · Pulgar arriba — confirmación ("¡listo!", "cita agendada")
    pulgar: {
      label: 'Pulgar arriba',
      duration: 3.6, loop: true,
      keys: {
        rSh:     [[0, REST.rSh], [0.2, REST.rSh], [0.65, 34, 'soft'], [2.6, 34], [3.2, REST.rSh], [3.6, REST.rSh]],
        rEl:     [[0, REST.rEl], [0.2, REST.rEl], [0.65, 128, 'soft'], [2.6, 128], [3.2, REST.rEl], [3.6, REST.rEl]],
        rWr:     [[0, 0], [0.65, 12], [2.6, 12], [3.2, 0], [3.6, 0]],
        rHand:   [[0, 'relaxed'], [0.4, 'thumb'], [2.95, 'relaxed'], [3.6, 'relaxed']],
        happy:   [[0, 0], [0.6, 0], [0.75, 1], [1.9, 1], [2.05, 0], [3.6, 0]],
        headRot: [[0, 0], [0.7, -6, 'soft'], [2.2, -5], [3.2, 0], [3.6, 0]],
        bodyRot: [[0, 0], [0.7, -1.2], [2.6, -1], [3.2, 0], [3.6, 0]],
        mouth:   [[0, 0.4], [0.7, 0.85], [2.4, 0.8], [3.6, 0.4]],
        squash:  [[0, 0], [0.55, 0], [0.65, 0.012], [0.85, -0.006], [1.05, 0], [3.6, 0]],
        blush:   [[0, 0.5], [0.8, 0.85], [2.6, 0.85], [3.6, 0.5]]
      },
      blinks: [2.9],
      fx(t, p) { p.rWr += wave(t, 3) * 3 * env(t, 0.7, 2.4); }
    },

    // 6 · Manos en los bolsillos — la pose de la ilustración oficial
    bolsillos: {
      label: 'Manos en bolsillos (pose oficial)',
      duration: 6, loop: true,
      keys: {
        pocket:  [[0, 1], [6, 1]],
        rHand:   [[0, 'pocket'], [6, 'pocket']], lHand: [[0, 'pocket'], [6, 'pocket']],
        rSh: [[0, POCKET.sh], [6, POCKET.sh]], rEl: [[0, POCKET.el], [6, POCKET.el]], rWr: [[0, POCKET.wr], [6, POCKET.wr]],
        lSh: [[0, POCKET.sh], [6, POCKET.sh]], lEl: [[0, POCKET.el], [6, POCKET.el]], lWr: [[0, POCKET.wr], [6, POCKET.wr]],
        headRot: [[0, -3], [3, 2], [6, -3]],
        bodyRot: [[0, 0.6], [3, -0.6], [6, 0.6]],
        mouth:   [[0, 0.75], [6, 0.75]],
        brow:    [[0, 0.4], [6, 0.4]]
      },
      blinks: [1.5, 4.3]
    },

    // 7 · Celebrar — saltito con ambos brazos arriba
    celebrar: {
      label: 'Celebrar',
      duration: 2.8, loop: true,
      keys: {
        y:       [[0, 0], [0.35, 0], [0.45, 6, 'out'], [0.75, -46, 'out'], [1.05, 0, 'in'], [1.15, 4], [1.3, 0], [2.8, 0]],
        squash:  [[0, 0], [0.35, 0], [0.45, -0.02], [0.6, 0.02], [1.05, 0], [1.12, -0.018], [1.3, 0], [2.8, 0]],
        rSh:     [[0, REST.rSh], [0.4, REST.rSh], [0.75, 150, 'soft'], [1.9, 150], [2.5, REST.rSh], [2.8, REST.rSh]],
        rEl:     [[0, REST.rEl], [0.4, REST.rEl], [0.75, 20, 'soft'], [1.9, 20], [2.5, REST.rEl], [2.8, REST.rEl]],
        lSh:     [[0, REST.lSh], [0.4, REST.lSh], [0.75, 150, 'soft'], [1.9, 150], [2.5, REST.lSh], [2.8, REST.lSh]],
        lEl:     [[0, REST.lEl], [0.4, REST.lEl], [0.75, 20, 'soft'], [1.9, 20], [2.5, REST.lEl], [2.8, REST.lEl]],
        rHand:   [[0, 'relaxed'], [0.55, 'open'], [2.3, 'relaxed'], [2.8, 'relaxed']],
        lHand:   [[0, 'relaxed'], [0.55, 'open'], [2.3, 'relaxed'], [2.8, 'relaxed']],
        happy:   [[0, 0], [0.4, 0], [0.5, 1], [2.1, 1], [2.25, 0], [2.8, 0]],
        mouth:   [[0, 0.4], [0.5, 1], [2.1, 0.9], [2.8, 0.4]],
        blush:   [[0, 0.5], [0.6, 0.9], [2.2, 0.9], [2.8, 0.5]],
        headRot: [[0, 0], [0.75, 3], [1.4, -3], [2.0, 2], [2.8, 0]]
      },
      blinks: [],
      fx(t, p) {
        const e = env(t, 0.8, 1.9, 0.2);
        p.rWr += wave(t, 3) * 14 * e; p.lWr += wave(t, 3, 0.5) * 14 * e;
        p.pony += Math.sin(t * 9) * 6 * env(t, 0.5, 1.6, 0.2);
      }
    }
  };

  global.HELENITA_MOTIONS = MOTIONS;
})(window);
