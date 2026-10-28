/*!
 * Reproductor de Helenita sin fondo.
 *
 * Uso en HTML:
 *   <div class="helenita" data-helenita="saludar" aria-label="Helenita saludando"></div>
 *   <script src="helenita/helenita-player.js" defer></script>
 *
 * Opciones (atributos):
 *   data-helenita="nombre"   animación: saludar, reposo, hablar, senalar, pulgar, pensar
 *   data-loop="false"        reproducir una sola vez (por defecto se repite)
 *   data-src="ruta/"         carpeta de los videos (por defecto media/helenita/)
 *
 * Cambiar de animación desde JS:  Helenita.play(elemento, 'pulgar')
 *
 * Chrome, Edge, Firefox y Android usan el WebM con transparencia.
 * Safari (Mac, iPhone, iPad) no muestra la transparencia de WebM, así que usa el
 * MP4 "apilado" (color arriba, máscara abajo) y lo compone en un <canvas> con WebGL.
 */
(function () {
  'use strict';

  const isApple = /AppleWebKit/.test(navigator.userAgent) && !/Chrome|Chromium|Edg|Firefox|FxiOS|CriOS|EdgiOS/.test(navigator.userAgent)
    || /iPad|iPhone|iPod/.test(navigator.userAgent);
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function makeVideo(src, loop) {
    const v = document.createElement('video');
    v.muted = true; v.playsInline = true; v.loop = loop; v.autoplay = !reduceMotion;
    v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
    v.preload = 'auto'; v.src = src; v.crossOrigin = 'anonymous';
    return v;
  }

  // --- Safari: compone color + máscara en WebGL ---
  function stackedPlayer(el, src, loop) {
    const video = makeVideo(src, loop);
    const canvas = document.createElement('canvas');
    canvas.setAttribute('role', 'img');
    const gl = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true });
    if (!gl) return null;
    const vs = 'attribute vec2 p;varying vec2 uv;void main(){uv=vec2((p.x+1.)/2.,(1.-p.y)/2.);gl_Position=vec4(p,0.,1.);}';
    const fs = 'precision mediump float;uniform sampler2D t;varying vec2 uv;void main(){vec3 c=texture2D(t,vec2(uv.x,uv.y*.5)).rgb;float a=texture2D(t,vec2(uv.x,.5+uv.y*.5)).r;gl_FragColor=vec4(c,a);}';
    const sh = (type, s) => { const o = gl.createShader(type); gl.shaderSource(o, s); gl.compileShader(o); return o; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog); gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach(k => gl.texParameteri(gl.TEXTURE_2D, k, gl.CLAMP_TO_EDGE));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    let raf = 0;
    const draw = () => {
      if (video.readyState >= 2) {
        const w = video.videoWidth, h = video.videoHeight / 2;
        if (canvas.width !== w) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, video);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
      raf = (video.requestVideoFrameCallback ? video.requestVideoFrameCallback(draw) : requestAnimationFrame(draw));
    };
    video.addEventListener('loadeddata', draw, { once: true });
    video.style.display = 'none';
    el.append(canvas, video);
    return { video, media: canvas, stop() { cancelAnimationFrame(raf); } };
  }

  function mount(el, name) {
    name = name || el.dataset.helenita;
    const base = el.dataset.src || (document.currentScript && document.currentScript.dataset.src) || 'media/helenita/';
    const loop = el.dataset.loop !== 'false';
    if (el._helenita) { el._helenita.stop && el._helenita.stop(); el.replaceChildren(); }

    let p = null;
    if (isApple) p = stackedPlayer(el, `${base}${name}-stack.mp4`, loop);
    if (!p) {
      const video = makeVideo(`${base}${name}.webm`, loop);
      video.poster = `${base}${name}.png`;
      el.append(video);
      p = { video, media: video };
    }
    p.media.setAttribute('aria-label', el.getAttribute('aria-label') || 'Helenita');
    p.media.style.width = '100%'; p.media.style.height = '100%'; p.media.style.objectFit = 'contain'; p.media.style.display = 'block';
    p.video.addEventListener('ended', () => el.dispatchEvent(new CustomEvent('helenita:ended', { detail: name })));
    if (!reduceMotion) p.video.play().catch(() => {});
    el._helenita = p; el.dataset.helenita = name;
    return p;
  }

  // Solo reproduce cuando está en pantalla (ahorra batería y datos)
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(e => {
      const p = e.target._helenita; if (!p || reduceMotion) return;
      e.isIntersecting ? p.video.play().catch(() => {}) : p.video.pause();
    });
  }, { rootMargin: '120px' }) : null;

  function init() {
    document.querySelectorAll('[data-helenita]').forEach(el => { mount(el); io && io.observe(el); });
  }
  window.Helenita = Object.assign(window.Helenita || {}, { play: mount, init });
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
})();
