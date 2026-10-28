# Helenita · motion graphics

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
