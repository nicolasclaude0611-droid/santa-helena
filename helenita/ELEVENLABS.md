# Receta: animaciones de Helenita con ElevenLabs

Guía paso a paso para generar nuevas animaciones de Helenita **sin fondo** con el conector de
ElevenLabs (herramientas `mcp__ElevenLabs__creative_*`). Sirve para una persona en la web de
ElevenLabs o para Claude en cualquier sesión.

## Resumen del método

1. **Una sola imagen base** de Helenita sobre verde chroma (ya existe, no hay que rehacerla).
2. **Imagen a video** con Kling 2.5 Turbo: la imagen base es el **cuadro inicial y el cuadro final**,
   así la animación termina en la misma pose y se repite sin corte.
3. **Quitar el verde localmente** con `helenita/tools/keyer.py` (gratis). No se usa el removedor de
   fondo de ElevenLabs.
4. Publicar en `media/helenita/` y usar con `helenita/helenita-player.js`.

## Lo que ya existe en ElevenLabs

Flujo **"Helenita · animaciones web"** en la cuenta actual, id `AJAfEJsy6Qq6KRPY6h89`.

| Nodo | id |
|---|---|
| Imagen base · verde (subida desde `helenita/fuentes/helenita-base-verde.png`) | `IOkSMzBv4r5HiNtu8gKG` |
| 04 · Señalar (Kling 2.5 Turbo) | `SzIPZkfp3TyOXdbDyIdG` · hecho |
| 05 · Pulgar arriba (Kling 2.5 Turbo) | `woGMbA09k0y79ssVUctX` · hecho |

Para una animación nueva se reutiliza `IOkSMzBv4r5HiNtu8gKG` como `start_frame` y `end_frame`.

**Si cambias de cuenta de ElevenLabs** (los flujos no se comparten entre cuentas), no hace falta
volver a generar la imagen base: se crea un flujo nuevo con `creative_create_flow` y se sube la base
con `creative_attach_reference_file` usando su URL pública:
`https://raw.githubusercontent.com/nicolasclaude0611-droid/santa-helena/main/helenita/fuentes/helenita-base-verde.png`
Luego se sigue desde el paso 1, reemplazando `flow_id` y el id del nodo base en los ejemplos.

Historial: las primeras 4 animaciones (saludar, reposo, hablar, pensar) se hicieron en otra cuenta,
flujo `oyyDrMJREPp3iuenJcMs`; ahí la base se generó con Nano Banana 2 a partir de
`img/helenita-referencia.jpg`.

## Costos medidos (octubre 2026)

| Paso | Modelo | Créditos |
|---|---|---|
| Imagen base 1:1, 1K, 1 variación | `gemini-3.1-flash-image` (Nano Banana 2) | ~609 |
| Video 5 s, 1:1, sin audio | `kling-2.5-turbo` | **~2.121** ← el usado |
| Video 5 s, 1:1, 720p, sin audio | `bytedance-seedance-v2-mini` | ~4.581 |
| Video 5 s, 1:1, 720p, sin audio | `bytedance-seedance-v2-fast` | ~7.333 |

El plan tiene un tope de 40.000 créditos. Antes de generar, estimar siempre con
`estimate_only: true` (no cobra). Una generación que falla por cuota no se cobra.

## Paso a paso (con el conector de Claude)

### 0. Reutilizar o crear el flujo

- Reutilizar: usar `flow_id = AJAfEJsy6Qq6KRPY6h89` y `base_node = IOkSMzBv4r5HiNtu8gKG`.
- Cuenta nueva: ver arriba (subir la base del repo, sin regenerarla).
- Crear todo desde cero (solo si se quiere una base distinta):
  1. `creative_create_flow` con nombre "Helenita · animaciones web".
  2. `creative_attach_reference_file` con `flow_id` y la URL pública de la ilustración:
     `https://raw.githubusercontent.com/nicolasclaude0611-droid/santa-helena/main/img/helenita-referencia.jpg`
     Para un archivo local, usar `creative_create_asset_upload` → PUT de los bytes →
     `creative_finalize_asset_upload`.
  3. Imagen base: `creative_add_flow_node` tipo `image-generation`, modelo `gemini-3.1-flash-image`,
     `model_parameters: {"aspect_ratio": "1:1", "resolution": "1K"}`, `connect_from: [nodo referencia]`,
     con el **prompt de imagen base** (abajo). Ejecutar con `creative_run_flow_nodes` y
     `generations_count: 1`.

### 1. Crear el nodo de video

`creative_add_flow_node`:

```json
{
  "flow_id": "AJAfEJsy6Qq6KRPY6h89",
  "node_type": "video-generation",
  "model_id": "kling-2.5-turbo",
  "label": "07 · <Nombre>",
  "connect_from": ["IOkSMzBv4r5HiNtu8gKG"],
  "model_parameters": {
    "aspect_ratio": "1:1",
    "duration_secs": 5,
    "cfg_scale": 0.6,
    "negative_prompt": "camera movement, zoom, pan, background change, shadows on the background, floor, morphing clothes, distorted hands, extra fingers, flickering, changing face, changing logo, text, blur"
  },
  "prompt": "<prompt de animación, ver plantilla>"
}
```

`connect_from` conecta la base a `start_frame`. Luego conectar también el cuadro final:

```json
creative_connect_flow_nodes {
  "flow_id": "AJAfEJsy6Qq6KRPY6h89",
  "edges": [{ "source_node_id": "IOkSMzBv4r5HiNtu8gKG", "target_node_id": "<nuevo nodo>", "target_port": "end_frame" }]
}
```

### 2. Estimar y generar

1. `creative_run_flow_nodes` con `estimate_only: true` → confirmar ~2.121 créditos.
2. `creative_run_flow_nodes` sin `estimate_only` (los nodos de video producen 1 clip).
   **Nunca repetir la llamada para "reintentar"**: cobra otra vez.
3. Consultar `creative_get_flow_run_status` con `flow_id` y `session_ids`, esperando
   `poll_after_seconds` entre consultas (tarda ~2 a 4 minutos), hasta `all_completed`.

### 3. Descargar y revisar

Del estado completado, tomar `content_url` (MP4 1440×1440, 24 fps, ~5 s, URL firmada que vence en 2 h):

```bash
curl -s -o /tmp/nombre.mp4 "<content_url>"
ffmpeg -v error -y -i /tmp/nombre.mp4 -vf "fps=2,scale=240:-1,tile=11x1" /tmp/hoja.png   # hoja de contacto
```

Revisar que: el fondo verde no cambie, la cámara no se mueva, Helenita no cambie de cara ni de
uniforme y termine en la pose inicial.

### 4. Quitar el fondo y publicar

```bash
python3 helenita/tools/keyer.py /tmp/nombre.mp4 nombre
# guardar el original para futuros recortes
ffmpeg -v error -y -i /tmp/nombre.mp4 -an -vf scale=1080:1080 -c:v libx264 -crf 16 -preset slow -pix_fmt yuv420p helenita/fuentes/nombre-verde.mp4
```

Genera en `media/helenita/`: `nombre.webm` (transparente), `nombre-stack.mp4` (Safari/iPhone) y
`nombre.png` (póster transparente). Agregar la tarjeta en `helenita/demo.html` y la fila en la tabla
de `helenita/README.md`.

Para probar el reproductor hay que servir por HTTP (no `file://`):
`python3 -m http.server 8765` y abrir `http://localhost:8765/helenita/demo.html`.
Con `data-format="stack"` se fuerza el modo Safari para probarlo en Chrome.

## Prompts

### Imagen base (solo si hay que rehacerla)

> Recreate exactly the same character from the reference image: same face, big brown eyes, warm smile,
> auburn-brown hair with side-swept bangs, small braid along the hairline and a long wavy ponytail over
> her right shoulder; same royal blue medical scrub top with mandarin collar and V-neck, with the small
> "Santa Helena del Valle IPS" logo (yellow sun) on the left chest; same royal blue scrub pants. Same soft
> 2D illustrated cartoon style, same colors and proportions. Pose: standing facing the camera, relaxed and
> friendly, both arms hanging naturally at her sides, hands fully visible. Framing: centered, from the top
> of the head down to mid-thigh, the character occupies about 75% of the image height, with empty space on
> both sides and above the head. Background: perfectly flat solid chroma-key green (#00FF00), uniform, no
> shadows, no gradient, no floor, no other objects. Crisp clean edges.

### Plantilla de animación (Kling 2.5 Turbo)

> The young nurse cartoon character in the blue scrubs stands on a flat solid chroma-key green background.
> **[UNA sola acción, en orden, con detalle de manos y mirada]**, then [baja la mano / vuelve a mirar al
> espectador] and settles back exactly into her starting pose. Static locked-off camera, medium shot, no
> camera movement. Smooth 2D animated cartoon style, same character, the green background stays perfectly
> flat and unchanged.

Reglas que funcionaron:
- Una acción principal por clip (Kling 2.5 Turbo se confunde con muchas).
- Siempre cerrar con "settles back exactly into her starting pose" (con el `end_frame` da loop perfecto).
- Siempre "static locked-off camera" y "green background stays perfectly flat".
- Su mano derecha queda a la izquierda de la pantalla. Para señalar hacia el contenido a la derecha
  de la pantalla, usar "her left arm ... toward the right edge".

### Acciones ya usadas

| Clip | Acción (parte central del prompt) |
|---|---|
| saludar | She smiles warmly at the viewer, raises her right hand to shoulder height with the palm open and waves hello in a friendly way three times, tilting her head slightly, then lowers her arm |
| reposo | She breathes softly, blinks naturally twice, smiles at the viewer, her head tilts very slightly and her ponytail sways gently; arms stay relaxed at her sides. Subtle, calm, looping idle animation (negativo extra: "walking, big movements") |
| hablar | talks warmly to the viewer, explaining something helpful: her mouth moves as she speaks, she nods gently, raises her left hand in front of her chest with an open palm in a welcoming explaining gesture, then lowers it |
| señalar | She smiles, extends her left arm out to the right side of the frame and points with her index finger toward the right edge, turning her head and eyes to look in that direction as if inviting the viewer to look there, then looks back at the viewer with a smile, lowers her arm |
| pulgar | She gives the viewer a happy, confident thumbs up with her right hand raised in front of her chest, smiling broadly with a cheerful little nod and a quick wink, then lowers her hand |
| pensar | She thinks for a moment: she raises her right hand and gently touches her chin with her index finger, looks up and to the side with a curious, thoughtful expression, then her face lights up with a friendly smile as if she found the answer, she lowers her hand (negativo extra: "sad, worried") |

Ideas para nuevas: despedirse, aplaudir, sostener un celular (WhatsApp), señalar hacia abajo,
llevarse la mano al corazón (gracias), sostener una tabla de citas.

## Problemas conocidos

- El texto del logo en la imagen base sale algo borroso ("oel Valls IPS"). A tamaño web no se nota.
- En movimientos rápidos la mano queda difusa en 2 o 3 cuadros (desenfoque de movimiento del modelo).
- No usar `despill` de ffmpeg: vuelve naranja el sol amarillo del logo. `keyer.py` ya lo resuelve.
