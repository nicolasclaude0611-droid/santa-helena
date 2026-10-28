#!/usr/bin/env python3
"""
Quita el fondo verde de un video de Helenita y genera las versiones para la web.

    python3 helenita/tools/keyer.py entrada.mp4 nombre [--size 720]

Salidas en media/helenita/:
    nombre.webm       VP9 con transparencia (Chrome, Edge, Firefox, Android)
    nombre-stack.mp4  "apilado": color arriba, máscara abajo (Safari / iPhone, vía helenita-player.js)
    nombre.png        primer cuadro transparente (póster)

Cómo recorta: la transparencia sale de cuánto domina el verde sobre el rojo y el azul.
Amarillos, piel, cabello y el azul del uniforme nunca tienen el verde por encima de ambos,
así que quedan opacos. En los bordes y en el desenfoque de movimiento se "desmezcla"
el verde para recuperar el color real (sin halos verdes ni tonos rosados).
"""
import argparse
import subprocess
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[2]


def key_frame(rgb, bg, lo, hi):
    f = rgb.astype(np.float32)
    r, g, b = f[..., 0], f[..., 1], f[..., 2]
    spill = g - np.maximum(r, b)                       # cuánto domina el verde
    a = 1.0 - np.clip((spill - lo) / (hi - lo), 0, 1)  # 1 = personaje, 0 = fondo
    # desmezcla: C = a*F + (1-a)*BG  ->  F = (C - (1-a)*BG) / a
    am = np.maximum(a, 1e-3)[..., None]
    fg = (f - (1 - a)[..., None] * bg) / am
    fg = np.clip(fg, 0, 255)
    # ningún color del personaje tiene el verde por encima del rojo y del azul:
    # donde aparezca, es contaminación del fondo y se limpia
    # (donde el verde supera a ambos, se lleva al promedio de rojo y azul: tono piel/cabello, no amarillo)
    gmax = np.maximum(fg[..., 0], fg[..., 2])
    gavg = (fg[..., 0] + fg[..., 2]) / 2
    fg[..., 1] = np.where(fg[..., 1] > gmax, gavg, fg[..., 1])
    a[a < 0.05] = 0
    fg[a == 0] = 0  # lo transparente queda negro y limpio (comprime mucho mejor)
    return fg, a


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('input'); ap.add_argument('name')
    ap.add_argument('--size', type=int, default=720)
    ap.add_argument('--lo', type=float, default=8, help='verde extra tolerado como personaje')
    ap.add_argument('--hi', type=float, default=130, help='verde extra a partir del cual es fondo')
    ap.add_argument('--out', default=str(ROOT / 'media' / 'helenita'))
    o = ap.parse_args()
    out = Path(o.out); out.mkdir(parents=True, exist_ok=True)
    S = o.size

    probe = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries',
                            'stream=r_frame_rate', '-of', 'csv=p=0', o.input], capture_output=True, text=True)
    fps = probe.stdout.strip() or '24'

    dec = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', o.input, '-vf', f'scale={S}:{S}:flags=lanczos',
                            '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
    webm = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', f'{S}x{S}',
                             '-r', fps, '-i', '-', '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p',
                             '-crf', '36', '-b:v', '0', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '2',
                             '-auto-alt-ref', '0', str(out / f'{o.name}.webm')], stdin=subprocess.PIPE)
    stack = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{S}x{S * 2}',
                              '-r', fps, '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', '22',
                              '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(out / f'{o.name}-stack.mp4')],
                             stdin=subprocess.PIPE)

    bg = None
    n = 0
    while True:
        buf = dec.stdout.read(S * S * 3)
        if len(buf) < S * S * 3:
            break
        rgb = np.frombuffer(buf, np.uint8).reshape(S, S, 3)
        if bg is None:  # color de fondo: mediana de las esquinas del primer cuadro
            c = np.concatenate([rgb[:20, :20], rgb[:20, -20:], rgb[-20:, :20], rgb[-20:, -20:]]).reshape(-1, 3)
            bg = np.median(c, axis=0).astype(np.float32)
        fg, a = key_frame(rgb, bg, o.lo, o.hi)
        rgba = np.dstack([fg, a * 255]).round().astype(np.uint8)
        webm.stdin.write(rgba.tobytes())
        premul = (fg * a[..., None]).round().astype(np.uint8)
        mask = np.repeat((a * 255).round().astype(np.uint8)[..., None], 3, axis=2)
        stack.stdin.write(np.vstack([premul, mask]).tobytes())
        if n == 0:
            from PIL import Image
            Image.fromarray(rgba, 'RGBA').save(out / f'{o.name}.png', optimize=True)
        n += 1

    for p in (webm, stack):
        p.stdin.close(); p.wait()
    dec.wait()
    print(f'{o.name}: {n} cuadros · fondo {bg.round().tolist()} → {out}')


if __name__ == '__main__':
    main()
