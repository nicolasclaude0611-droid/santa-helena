#!/usr/bin/env python3
"""
Pone un accesorio (p. ej. el gorro de Navidad) sobre la cabeza de Helenita en cada cuadro de una animación.

    python3 helenita/tools/gorro.py saludar [--accesorio helenita/navidad/gorro.png]

Lee media/helenita/<nombre>-stack.mp4 (color + máscara), sigue el movimiento de la cabeza cuadro a cuadro
(OpenCV, alineación ECC sobre la zona de la cabeza), pega el accesorio con la misma posición, giro y escala,
y escribe en media/helenita/navidad/: <nombre>.webm, <nombre>-stack.mp4 y <nombre>.png.
La animación se reduce un poco (ESCALA) para que el gorro quepa dentro del cuadro.
"""
import argparse, subprocess
from pathlib import Path
import cv2, numpy as np

ROOT = Path(__file__).resolve().parents[2]
S = 720
ESCALA = 0.87                      # tamaño de Helenita dentro del cuadro (deja espacio arriba para el gorro)
# Colocación del gorro sobre el primer cuadro (coordenadas del video original de 720 px)
CABEZA = (250, 15, 460, 210)       # zona que se sigue: x0, y0, x1, y1
ALA_CENTRO = (354, 100)             # centro del borde blanco del gorro sobre la frente
ALA_ANCHO = 186                    # ancho del borde blanco en px
ALA_GIRO = 8                       # grados (positivo = inclinado hacia la derecha de la imagen)

def leer(path):
    p = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(path), '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True, check=True)
    fr = np.frombuffer(p.stdout, np.uint8).reshape(-1, S * 2, S, 3)
    return fr[:, :S].astype(np.float32), fr[:, S:, :, 0].astype(np.float32) / 255

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('nombre')
    ap.add_argument('--accesorio', default=str(ROOT / 'helenita/navidad/gorro.png'))
    o = ap.parse_args()
    color, alpha = leer(ROOT / f'media/helenita/{o.nombre}-stack.mp4')
    fps = '24'
    hat = cv2.imread(o.accesorio, cv2.IMREAD_UNCHANGED).astype(np.float32)
    hat_rgb, hat_a = hat[..., 2::-1], hat[..., 3] / 255
    hh, hw = hat_a.shape
    # borde blanco (ala) dentro de la imagen del gorro: filas inferiores, del 25 % al 100 % del ancho
    ala_x0, ala_x1, ala_y = 0.245 * hw, 0.995 * hw, 0.80 * hh
    k = ALA_ANCHO / (ala_x1 - ala_x0)
    t = np.deg2rad(ALA_GIRO)
    R = np.array([[np.cos(t), -np.sin(t)], [np.sin(t), np.cos(t)]]) * k
    centro_ala = np.array([(ala_x0 + ala_x1) / 2, ala_y])
    base = np.hstack([R, (np.array(ALA_CENTRO) - R @ centro_ala)[:, None]])  # gorro -> cuadro 0

    # seguimiento de la cabeza (cuadro 0 -> cuadro i)
    x0, y0, x1, y1 = CABEZA
    gris = lambda i: cv2.GaussianBlur(cv2.cvtColor(color[i].astype(np.uint8), cv2.COLOR_RGB2GRAY), (5, 5), 0)[y0:y1, x0:x1].astype(np.float32)
    ref = gris(0)
    warps, w = [], np.eye(2, 3, dtype=np.float32)
    for i in range(len(color)):
        try:
            _, w = cv2.findTransformECC(ref, gris(i), w.copy(), cv2.MOTION_EUCLIDEAN,
                                        (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 80, 1e-5), None, 5)
        except cv2.error:
            pass
        warps.append(w.copy())
    W = np.array(warps)
    # suavizado (la animación es un loop: promedio circular de 5 cuadros)
    n = len(W); Ws = np.stack([np.mean([W[(i + d) % n] for d in range(-2, 3)], axis=0) for i in range(n)])

    out = ROOT / 'media/helenita/navidad'; out.mkdir(parents=True, exist_ok=True)
    webm = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', f'{S}x{S}', '-r', fps, '-i', '-',
                             '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p', '-crf', '36', '-b:v', '0', '-row-mt', '1', '-deadline', 'good',
                             '-cpu-used', '2', '-auto-alt-ref', '0', str(out / f'{o.nombre}.webm')], stdin=subprocess.PIPE)
    stack = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{S}x{S * 2}', '-r', fps, '-i', '-',
                              '-c:v', 'libx264', '-preset', 'slow', '-crf', '22', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
                              str(out / f'{o.nombre}-stack.mp4')], stdin=subprocess.PIPE)
    # encoger y bajar a Helenita: x' = ESCALA*x + dx, y' = ESCALA*y + dy (pegada abajo y centrada)
    dx, dy = (S - S * ESCALA) / 2, S - S * ESCALA
    shrink = np.array([[ESCALA, 0, dx], [0, ESCALA, dy]], np.float32)
    to3 = lambda m: np.vstack([m, [0, 0, 1]])
    off = np.array([[1, 0, -x0], [0, 1, -y0], [0, 0, 1]]); off_inv = np.linalg.inv(off)
    for i in range(n):
        a = cv2.warpAffine(alpha[i], shrink, (S, S), flags=cv2.INTER_AREA)
        c = cv2.warpAffine(color[i], shrink, (S, S), flags=cv2.INTER_AREA)          # color premultiplicado
        # cuadro0 -> cuadro i en coordenadas completas (ECC trabaja en la zona recortada)
        wi = off_inv @ to3(Ws[i]) @ off   # ECC: la transformación lleva coordenadas del cuadro 0 al cuadro i
        M = (to3(shrink) @ wi @ to3(base))[:2].astype(np.float32)
        ha = cv2.warpAffine(hat_a, M, (S, S), flags=cv2.INTER_LINEAR)
        hc = cv2.warpAffine(hat_rgb * hat_a[..., None], M, (S, S), flags=cv2.INTER_LINEAR)
        c = hc + c * (1 - ha[..., None]); a = ha + a * (1 - ha)
        c = np.clip(c, 0, 255)
        fg = np.where(a[..., None] > 1e-3, c / np.maximum(a[..., None], 1e-3), 0)
        rgba = np.dstack([np.clip(fg, 0, 255), a * 255]).round().astype(np.uint8)
        webm.stdin.write(rgba.tobytes())
        mask = np.repeat((a * 255).round().astype(np.uint8)[..., None], 3, axis=2)
        stack.stdin.write(np.vstack([c.round().astype(np.uint8), mask]).tobytes())
        if i == 0:
            cv2.imwrite(str(out / f'{o.nombre}.png'), cv2.cvtColor(rgba, cv2.COLOR_RGBA2BGRA))
    for p in (webm, stack): p.stdin.close(); p.wait()
    print(o.nombre, n, 'cuadros; movimiento máx. de la cabeza (px):', np.abs(W[:, :, 2]).max(axis=0).round(1))

if __name__ == '__main__':
    main()
