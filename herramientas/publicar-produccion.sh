#!/bin/bash
# Arma la rama «produccion» (lo que Hostinger copia a public_html) con SOLO los archivos de herramientas/publicar.txt.
# Cada cambio en «produccion» sale EN VIVO: úsalo solo después del «publica» de Nicolas.
#
#   herramientas/publicar-produccion.sh [rama-origen]             -> muestra qué cambiaría (no sube nada)
#   herramientas/publicar-produccion.sh [rama-origen] --confirmar -> crea el commit y lo sube a «produccion»
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
ORIGEN="${1:-main}"; CONFIRMAR="${2:-}"
[ "$ORIGEN" = "--confirmar" ] && { ORIGEN=main; CONFIRMAR=--confirmar; }
git fetch -q origin "$ORIGEN" produccion 2>/dev/null || git fetch -q origin "$ORIGEN"
REF=$(git rev-parse "origin/$ORIGEN" 2>/dev/null || git rev-parse "$ORIGEN")
TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT
mkdir -p "$TMP/src"; git archive "$REF" | tar -x -C "$TMP/src"
mkdir -p "$TMP/out"
( cd "$TMP/src"
  grep -v '^\s*#' herramientas/publicar.txt | grep -v '^\s*$' | while read -r pat; do
    found=0
    for f in $pat; do [ -f "$f" ] && { mkdir -p "$TMP/out/$(dirname "$f")"; cp "$f" "$TMP/out/$f"; found=1; }; done
    [ $found = 1 ] || { echo "FALTA: $pat" >&2; exit 1; }
  done )
# Nunca deben salir notas internas
if find "$TMP/out" -name '*.md' -o -name '_config.yml' -o -path '*/fuentes/*' | grep -q .; then echo "Hay archivos internos en la lista" >&2; exit 1; fi
export GIT_INDEX_FILE="$TMP/index"
git --work-tree="$TMP/out" add -A .
TREE=$(git write-tree)
PADRE=$(git rev-parse -q --verify origin/produccion || true)
if [ -n "$PADRE" ] && [ "$(git rev-parse "$PADRE^{tree}")" = "$TREE" ]; then echo "Sin cambios: «produccion» ya es igual a $ORIGEN."; exit 0; fi
echo "Archivos: $(git ls-tree -r "$TREE" | wc -l)  ·  origen: $ORIGEN ($(git rev-parse --short "$REF"))"
[ -n "$PADRE" ] && git diff --stat "$PADRE" "$TREE" | tail -15
if [ "$CONFIRMAR" != "--confirmar" ]; then echo "Vista previa. Para publicar EN VIVO agrega --confirmar."; exit 0; fi
MSG="Publicación desde $ORIGEN $(git rev-parse --short "$REF") ($(date +%F))"
COMMIT=$(git commit-tree "$TREE" ${PADRE:+-p "$PADRE"} -m "$MSG")
git push origin "$COMMIT:refs/heads/produccion"
echo "Publicado: produccion -> $(git rev-parse --short "$COMMIT")"
