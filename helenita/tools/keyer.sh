#!/usr/bin/env bash
# Quita el fondo verde de un video de Helenita y genera las versiones para la web.
#
#   helenita/tools/keyer.sh entrada.mp4 nombre [tamaño]
#
# Salidas en media/helenita/:
#   nombre.webm      VP9 con transparencia (Chrome, Edge, Firefox, Android)
#   nombre-stack.mp4 "apilado": color arriba, máscara abajo (Safari / iPhone, vía helenita-player.js)
#   nombre.png       primer cuadro transparente (póster)
set -euo pipefail
IN="$1"; NAME="$2"; SIZE="${3:-720}"
OUT="$(cd "$(dirname "$0")/../.." && pwd)/media/helenita"
mkdir -p "$OUT"

# Verde del fondo generado (~#05F905). Clave + reducción de derrame verde solo en los bordes.
KEY="chromakey=0x06F806:0.17:0.05"
DESPILL="despill=type=green:mix=0.35:expand=0"
SCALE="scale=${SIZE}:${SIZE}:flags=lanczos"

# 1) WebM VP9 con alfa
ffmpeg -v error -y -i "$IN" -an -vf "${SCALE},${KEY},${DESPILL},format=yuva420p" \
  -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 0 -crf 32 -row-mt 1 -deadline good -cpu-used 2 \
  -auto-alt-ref 0 "$OUT/${NAME}.webm"

# 2) MP4 apilado (H.264): color premultiplicado arriba, alfa en gris abajo
ffmpeg -v error -y -i "$IN" -an -filter_complex \
  "[0]${SCALE},${KEY},${DESPILL},format=rgba,split[a][b];\
   [a]premultiply=inplace=1,format=rgb24[c];\
   [b]alphaextract,format=gray,format=rgb24[m];\
   [c][m]vstack,format=yuv420p" \
  -c:v libx264 -preset slow -crf 22 -movflags +faststart "$OUT/${NAME}-stack.mp4"

# 3) Póster transparente
ffmpeg -v error -y -i "$IN" -frames:v 1 -vf "${SCALE},${KEY},${DESPILL},format=rgba" -update 1 "$OUT/${NAME}.png"

ls -la "$OUT"/"${NAME}"*
