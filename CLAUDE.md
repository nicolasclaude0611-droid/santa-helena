# Santa Helena del Valle IPS · sitio web

Sitio estático (HTML + CSS + JS, sin build) de **Santa Helena del Valle IPS**, institución de salud de
baja y mediana complejidad con 20 años en el Cesar y La Guajira (Colombia). Lema:
**"¡La salud, nuestro compromiso!"**. Todo el contenido y la comunicación con el usuario van en español.

## Qué hace la página

- **Agendar cita**: formulario por pasos (sede → servicio → datos del paciente) que abre WhatsApp
  con el mensaje listo. La página no guarda datos.
- Sedes: **Valledupar**, **La Jagua de Ibirico** y **San Juan del Cesar**.
- Secciones: inicio (hero), respaldo institucional, agendar, servicios, noticias (carrusel),
  atención primaria, servicios de apoyo, sedes, nosotros, preguntas frecuentes, PQRS, para EPS y empresas.
- Pantalla de carga (una vez por sesión): logo con lema sobre fondo navy (`.intro`).
- **Noticias**: tarjetas `.post` en `index.html` (sección `#noticias`). Las actuales son **ejemplos**; reemplazar
  por noticias reales (la portada puede ser una foto `<img>` dentro de `.post__cover`).
- **PQRS** (`#pqrs`): formulario que abre el correo (`mailto:`) a siau@santahelenadelvalleips.com con copia a
  calidad@santahelenadelvalleips.com. El usuario elige entre escribir la PQRS en el formulario o adjuntar su
  propio documento en el correo (sin servidor el navegador no puede adjuntar archivos; no hay campo de archivo).
- Sonidos del formulario de citas: sintetizados con Web Audio en `script.js` (`sound(...)`), con botón para silenciarlos.
- Todos los enlaces internos (`#seccion`) centran la sección bajo la barra (`scrollToBook` para agendar,
  `scrollToSection` para el resto, en `script.js`). Desde "Nuestros servicios" el formulario siempre pide la sede primero.
- Contacto: WhatsApp 311 339 8988 (`https://wa.me/573113398988`), línea (605) 588 5690 ext. 201 a 301,
  móviles 314 535 6846 y 318 768 9174.

### Servicios y EPS por sede

- Fuente única en `script.js`: `AREAS` (áreas y servicios, usada en "Nuestros servicios" y en el formulario)
  y `SEDES` (servicios habilitados en el REPS y EPS/convenios de cada sede). Solo se publican servicios
  habilitados; la franja de especialidades de `index.html` debe coincidir con ellos.
- Habilitados: Valledupar 29, La Jagua de Ibirico 15, San Juan del Cesar 10.
- **Pendiente:** EPS de La Jagua de Ibirico (`eps: null` → el campo queda de texto libre).

## Archivos

| Ruta | Contenido |
|---|---|
| `index.html`, `styles.css`, `script.js` | El sitio |
| `img/` | Logo sin fondo (`logo.png` sin lema, `logo-lema.png` con lema blanco para fondos oscuros), sol de la marca (`sol.png` marca de agua, `sol-solido.png`), imágenes de Helenita. Original vectorial: `img/fuentes/logo.pdf` |
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
- **Caché:** `index.html` carga `styles.css`, `script.js` y el reproductor con `?v=AAAAMMDDx`. Al cambiar
  cualquiera de ellos, subir esa versión en los tres (si no, los celulares siguen mostrando la versión vieja).
- Para probar videos/reproductor, servir por HTTP: `python3 -m http.server` (no abrir con `file://`).
- **Rama oficial: `main`.** Todos los cambios del sitio se hacen, se confirman (commit) y se suben (push) en `main`.
- **Vista en vivo (artefacto):** https://claude.ai/artifact/2poqmHYxwFxYengX7qBsuA. Después de cada
  cambio, volver a publicarlo con la herramienta Artifact usando ese `url` (o el mismo `index.html`
  desde esta sesión) e incluir en `files` todos los archivos que use la página (CSS, JS, `img/`, `media/`).
  El mapa de Google (iframe) no se ve dentro del artefacto; en el sitio real sí.
