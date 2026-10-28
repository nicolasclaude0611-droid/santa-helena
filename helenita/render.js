#!/usr/bin/env node
/*
 * Exporta un movimiento de Helenita a video, cuadro a cuadro.
 *
 *   node helenita/render.js <movimiento> [opciones]
 *
 * Opciones:
 *   --fps 30            cuadros por segundo (defecto 30)
 *   --loops 1           repeticiones del movimiento
 *   --frame medio       medio | cuerpo | primer
 *   --bg blanco         blanco | marca | transparente
 *   --alpha             además del MP4, exporta WebM con transparencia (VP9 + alfa)
 *   --png               exporta un PNG del primer cuadro (póster)
 *   --out helenita/renders
 *
 * Requiere Playwright (Chromium) y ffmpeg.
 */
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const args = process.argv.slice(2);
const motion = args[0] && !args[0].startsWith('--') ? args[0] : 'saludar';
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const flag = k => args.includes('--' + k);

const fps = +opt('fps', 30);
const loops = +opt('loops', 1);
const frame = opt('frame', 'medio');
const alpha = flag('alpha');
const bg = alpha ? 'transparente' : opt('bg', 'blanco');
const outDir = path.resolve(opt('out', path.join(__dirname, 'renders')));
fs.mkdirSync(outDir, { recursive: true });

function ffmpeg(argsList) {
  const p = spawn('ffmpeg', ['-y', '-loglevel', 'error', ...argsList], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => p.on('close', c => (c === 0 ? res() : rej(new Error('ffmpeg ' + c)))));
  return { stdin: p.stdin, done };
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  const url = 'file://' + path.join(__dirname, 'index.html') + `?render=1&motion=${motion}&frame=${frame}&bg=${bg}`;
  await page.goto(url);
  await page.evaluate(() => document.fonts.ready);
  const duration = await page.evaluate(() => window.helenita.player.motion.duration);
  const total = Math.round(duration * loops * fps);
  const base = path.join(outDir, `helenita-${motion}${frame !== 'medio' ? '-' + frame : ''}`);

  const encoders = [];
  encoders.push(ffmpeg(['-f', 'image2pipe', '-framerate', String(fps), '-i', '-',
      '-vf', alpha ? 'format=rgba,split[a][b];[a]drawbox=c=white:t=fill[w];[w][b]overlay,format=yuv420p' : 'format=yuv420p',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-movflags', '+faststart', base + '.mp4']));
  if (alpha) {
    encoders.push(ffmpeg(['-f', 'image2pipe', '-framerate', String(fps), '-i', '-',
      '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p', '-b:v', '0', '-crf', '28', '-auto-alt-ref', '0', base + '.webm']));
  }

  for (let i = 0; i < total; i++) {
    const t = i / fps;
    await page.evaluate(t => window.helenita.player.renderAt(t), t);
    const buf = await page.screenshot({ omitBackground: alpha, type: 'png', clip: { x: 0, y: 0, width: 1280, height: 720 } });
    if (i === 0 && flag('png')) fs.writeFileSync(base + '.png', buf);
    for (const e of encoders) { if (!e.stdin.write(buf)) await new Promise(r => e.stdin.once('drain', r)); }
    if (i % fps === 0) process.stdout.write(`\r${motion}: ${i}/${total}`);
  }
  encoders.forEach(e => e.stdin.end());
  await Promise.all(encoders.map(e => e.done));
  await browser.close();
  console.log(`\r${motion}: listo → ${path.relative(process.cwd(), base)}.mp4${alpha ? ' + .webm' : ''}`);
})().catch(e => { console.error(e); process.exit(1); });
