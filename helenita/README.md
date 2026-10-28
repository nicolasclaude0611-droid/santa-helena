# Helenita · animaciones sin fondo (ElevenLabs)

Animaciones generadas con **ElevenLabs** (imagen base con Nano Banana 2, videos con Kling 2.5 Turbo)
sobre fondo verde y recortadas a transparencia. Están en `media/helenita/` y cada una se repite sin corte
(empieza y termina en la misma pose).

| Animación | Uso sugerido en la página |
|---|---|
| `saludar` | Hero: "Hola, soy Helenita" |
| `reposo` | Cualquier sección; estado de espera |
| `hablar` | Guía del formulario "Agende su cita" y burbujas de texto |
| `pensar` | Preguntas frecuentes |

Por cada animación hay tres archivos:

- `nombre.webm`: video con transparencia (Chrome, Edge, Firefox, Android). ~0,3–0,5 MB.
- `nombre-stack.mp4`: versión para Safari y iPhone (no muestran la transparencia de WebM).
- `nombre.png`: primer cuadro transparente, como imagen de respaldo.

### Usarla en la página

```html
<div class="helenita" data-helenita="saludar" aria-label="Helenita saludando"></div>
<script src="helenita/helenita-player.js" defer></script>
```

El reproductor elige solo el formato correcto según el navegador, pausa el video cuando no está
en pantalla y respeta "reducir movimiento". Para cambiar de animación desde JS:
`Helenita.play(elemento, 'hablar')`. Demostración: `helenita/demo.html` (abrir con un servidor web,
no con doble clic).

### Volver a recortar o agregar animaciones

Receta completa (flujo de ElevenLabs, prompts, costos y pasos): **[ELEVENLABS.md](ELEVENLABS.md)**.

Los originales en verde están en `helenita/fuentes/`. Para procesar uno nuevo:

```bash
python3 helenita/tools/keyer.py video-verde.mp4 nombre
```

El flujo de ElevenLabs se llama **"Helenita · animaciones web"**: ahí está la imagen base y cada
animación como nodo; para crear una nueva, duplique un nodo de video, cambie el texto y ejecútelo
(cada clip de 5 s cuesta ~2.100 créditos con Kling 2.5 Turbo).

---

# Helenita · versión vectorial (motion graphics en código)

Helenita recreada como **personaje vectorial articulado (SVG)**, basada en la ilustración oficial
(`img/helenita-closeup.jpg`) y el video de saludo (`media/helenita-saludando.mp4`).
Al ser un rig, se pueden crear movimientos nuevos sin volver a dibujarla.

## Archivos

| Archivo | Qué es |
|---|---|
| `helenita.js` | El personaje (dibujo + articulaciones) y el motor de animación |
| `motions.js` | Biblioteca de movimientos (keyframes) |
| `index.html` | Estudio para ver y probar movimientos en el navegador |
| `render.js` | Exporta cualquier movimiento a MP4 (y WebM transparente) |
| `renders/` | Videos ya exportados, 1280×720 a 30 fps, en bucle |

## Movimientos incluidos

- `saludar`: recreación del video original (ojos sonrientes → saluda con la mano → vuelve)
- `respirar`: reposo vivo (respira, parpadea, la cola de caballo se mece)
- `hablar`: labios y gestos con la mano, para locuciones
- `senalar`: apunta a la derecha de la pantalla (p. ej. "agende aquí")
- `pulgar`: pulgar arriba ("¡cita agendada!")
- `bolsillos`: la pose de la ilustración oficial
- `celebrar`: saltito con los brazos arriba

## Ver el estudio

Abra `helenita/index.html` en el navegador. Puede cambiar el movimiento, el encuadre
(medio cuerpo, cuerpo entero, primer plano) y el fondo (blanco, de marca, transparente).

## Exportar video

Requiere Node, Playwright (Chromium) y ffmpeg.

```bash
node helenita/render.js saludar                 # → renders/helenita-saludar.mp4
node helenita/render.js hablar --loops 3        # repetir 3 veces
node helenita/render.js celebrar --frame cuerpo --bg marca
node helenita/render.js saludar --alpha         # además .webm con fondo transparente
```

## Crear un movimiento nuevo

Copie un bloque de `motions.js` y cambie los keyframes. Cada parámetro recibe una lista
`[tiempo, valor, curva]`:

```js
asentir: {
  label: 'Asentir',
  duration: 2, loop: true,
  keys: {
    headNod: [[0, 0], [0.4, 1.5], [0.8, 0], [1.2, 1.5], [1.6, 0], [2, 0]],
    happy:   [[0, 0], [0.3, 1], [1.6, 1], [1.8, 0], [2, 0]],
    mouth:   [[0, 0.4], [2, 0.4]]
  }
}
```

### Parámetros

| Parámetro | Rango | Efecto |
|---|---|---|
| `x`, `y`, `bodyRot`, `squash` | px, grados, ±0.03 | Mover, inclinar y estirar todo el cuerpo |
| `headRot`, `headYaw`, `headNod` | grados, −1…1, −1…2 | Inclinar, girar y bajar la cabeza |
| `blink`, `happy` | 0…1 | Parpadeo, ojos sonrientes ^^ |
| `lookX`, `lookY` | −1…1 | Dirección de la mirada |
| `brow` | −1…1 | Cejas arriba/abajo |
| `mouth`, `smile` | 0…1 | Apertura de boca y sonrisa |
| `blush` | 0…1 | Rubor |
| `rSh`, `rEl`, `rWr` | grados | Brazo derecho de Helenita (izquierda de la pantalla): hombro, codo, muñeca |
| `lSh`, `lEl`, `lWr` | grados | Brazo izquierdo de Helenita (derecha de la pantalla) |
| `rHand`, `lHand` | `relaxed` `open` `point` `fist` `thumb` `pocket` | Forma de la mano |
| `pocket` | 0 / 1 | Muestra el frente de los bolsillos (manos dentro) |
| `pony`, `pony2` | grados | Movimiento extra de la cola de caballo |

En los brazos, 0° = colgando y los valores positivos van hacia afuera y hacia arriba.
Curvas disponibles: `io` (por defecto), `soft` (con pequeño rebote), `out`, `in`, `lin`, `back`, `step`.
La respiración, el parpadeo y el vaivén del cabello se agregan solos a cualquier movimiento.
