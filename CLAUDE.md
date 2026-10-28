# Santa Helena del Valle IPS · sitio web

Sitio estático (HTML + CSS + JS, sin build) de **Santa Helena del Valle IPS**, institución de salud de
baja y mediana complejidad con 20 años en el Cesar y La Guajira (Colombia). Lema:
**"¡La salud, nuestro compromiso!"**. Todo el contenido y la comunicación con el usuario van en español.

## Qué hace la página

- **Agendar cita**: formulario por pasos (sede → servicio → datos del paciente) que abre WhatsApp
  con el mensaje listo. La página no guarda datos.
- Sedes: **Valledupar**, **La Jagua de Ibirico** y **San Juan del Cesar**.
- Secciones: inicio (hero), respaldo institucional, agendar, servicios, atención primaria,
  servicios de apoyo, sedes, nosotros, preguntas frecuentes, para EPS y empresas.
- Contacto: WhatsApp 311 339 8988 (`https://wa.me/573113398988`), línea (605) 588 5690 ext. 201 a 301,
  móviles 314 535 6846 y 318 768 9174.

## Archivos

| Ruta | Contenido |
|---|---|
| `index.html`, `styles.css`, `script.js` | El sitio |
| `img/` | Logo (`logo.png`), sol de la marca (`sol.png`), imágenes de Helenita |
| `media/` | Videos actuales de Helenita (con fondo) |
| `media/helenita/` | **Animaciones de Helenita sin fondo** (WebM transparente, MP4 para Safari, PNG) |
| `helenita/` | Todo lo de Helenita: reproductor, demo, recortador, versión vectorial |
| `fotos/` | Fotos de las sedes (ver `fotos/LEEME.txt`) |

## Marca

- Colores (`styles.css`): tinta/navy `#0A2233`, azul `#0596C8`, azul profundo `#06709A`,
  amarillo `#FFE81A`, neblina `#EFF4F7`.
- Tipografías: Bricolage Grotesque (títulos) y Figtree (texto).
- Logo: sol amarillo con la "S" azul, "Santa Helena del Valle" en azul e "IPS" en amarillo.

## Helenita (la guía virtual)

Enfermera ilustrada, estilo 2D: cabello castaño rojizo con flequillo, trenza en la línea del cabello
y cola de caballo ondulada sobre el hombro derecho; ojos cafés grandes; scrub azul rey con cuello mao,
escote en V y el logo bordado en el pecho; pantalón azul rey. Referencias:
`img/helenita-referencia.jpg` (cuerpo) e `img/helenita-closeup.jpg` (rostro).

Animaciones sin fondo disponibles: `saludar`, `reposo`, `hablar`, `pensar`, `senalar`, `pulgar`. Se insertan con:

```html
<div data-helenita="saludar" aria-label="Helenita saludando"></div>
<script src="helenita/helenita-player.js" defer></script>
```

Detalles en `helenita/README.md`.

### Generar nuevas animaciones con ElevenLabs

Seguir **`helenita/ELEVENLABS.md`**: está el flujo de ElevenLabs ya armado (ids de nodos), los
prompts que funcionaron, los costos y el recorte del fondo verde. Puntos clave:

- Usar Kling 2.5 Turbo (~2.121 créditos por clip de 5 s, el más barato que funciona bien),
  con la imagen base como cuadro inicial **y** final para que haga loop.
- Estimar con `estimate_only` antes de generar; nunca repetir una generación para reintentar.
- Generar sobre verde y quitar el fondo con `python3 helenita/tools/keyer.py` (gratis).

## Convenciones

- Sin dependencias ni paso de build: los archivos se sirven tal cual.
- Para probar videos/reproductor, servir por HTTP: `python3 -m http.server` (no abrir con `file://`).
- Rama de trabajo de todo el sitio (no solo Helenita): `claude/helenita-motion-graphics-h3pdro`. Hacer commit y push al terminar cada cambio.
