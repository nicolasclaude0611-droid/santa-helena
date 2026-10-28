#!/usr/bin/env python3
"""Empaqueta el sitio en un solo archivo HTML que funciona sin servidor (doble clic).

Uso:  python3 tools/empaquetar.py [salida.html]      (por defecto: santa-helena.html)

Orden del archivo generado, para que sea cómodo de editar:
  1. <style> con todo styles.css
  2. El HTML del sitio
  3. <script> del reproductor de Helenita y <script> del sitio
  4. Al final, los videos de Helenita en base64 (no hace falta tocarlos)

Las fotos de las sedes siguen apuntando a fotos/*.jpg: basta con poner esa carpeta
junto al archivo HTML para que aparezcan.
"""
import base64
import io
import re
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / 'santa-helena.html'
ANIMS = ['saludar', 'reposo', 'hablar', 'pensar', 'senalar', 'pulgar']


def b64(data):
    return base64.b64encode(data).decode('ascii')


def data_uri(path, mime):
    return f'data:{mime};base64,{b64((ROOT / path).read_bytes())}'


def webp(path):
    buf = io.BytesIO()
    Image.open(ROOT / path).save(buf, 'WEBP', quality=80, method=6)
    return buf.getvalue()


html = (ROOT / 'index.html').read_text(encoding='utf-8')
css = (ROOT / 'styles.css').read_text(encoding='utf-8')
player = (ROOT / 'helenita/helenita-player.js').read_text(encoding='utf-8')
site = (ROOT / 'script.js').read_text(encoding='utf-8')
# Un '</script>' dentro del código (aunque sea en un comentario) cerraría la etiqueta antes de tiempo.
player, site = (t.replace('</script', '<\\/script') for t in (player, site))

# Imágenes pequeñas: el sol se declara una vez como variable CSS; logo y foto van en línea.
css = css.replace('url(img/sol.png)', 'var(--sol)')
images_css = f':root {{ --sol: url({data_uri("img/sol.png", "image/png")}); }}'
logo = data_uri('img/logo.png', 'image/png')
html = html.replace('src="img/logo.png"', f'src="{logo}"').replace('href="img/logo.png"', f'href="{logo}"')
html = html.replace('src="img/helenita-closeup.jpg"', f'src="{data_uri("img/helenita-closeup.jpg", "image/jpeg")}"')

# Hojas y scripts externos -> en línea.
html = html.replace('<link rel="stylesheet" href="styles.css">',
                    f'<style>\n{css}\n</style>\n  <style>{images_css}</style>')
media = ',\n'.join(
    [f'"media/helenita/{n}.webm":"{b64((ROOT / f"media/helenita/{n}.webm").read_bytes())}"' for n in ANIMS]
    + [f'"media/helenita/{n}-stack.mp4":"{b64((ROOT / f"media/helenita/{n}-stack.mp4").read_bytes())}"' for n in ANIMS]
    + [f'"media/helenita/{n}.png":"{b64(webp(f"media/helenita/{n}.png"))}"' for n in ANIMS]
)
html = html.replace('  <script src="helenita/helenita-player.js" defer></script>\n  <script src="script.js" defer></script>',
                    f'  <script>\n{player}</script>\n  <script>\n{site}</script>\n\n'
                    f'  <!-- Videos de Helenita incrustados (generado por tools/empaquetar.py). -->\n'
                    f'  <script>window.HELENITA_MEDIA = {{\n{media}\n}};</script>')

assert 'src="img/' not in html and 'styles.css' not in html and 'script.js' not in html, 'quedó una referencia externa'
OUT.write_text(html, encoding='utf-8')
print(f'{OUT}  ({OUT.stat().st_size / 1e6:.1f} MB)')
