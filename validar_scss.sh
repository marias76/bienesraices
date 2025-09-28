#!/bin/bash

# Ruta base del proyecto
BASE="src/scss"

# 1. Verificar mixins huérfanos (llamados pero no definidos)
echo "🔍 Buscando mixins no definidos..."
grep -r '@include' "$BASE" | sed 's/.*@include\s\+\([a-zA-Z0-9_-]\+\).*/\1/' | sort | uniq > /tmp/includes.txt
grep -r '@mixin' "$BASE" | sed 's/.*@mixin\s\+\([a-zA-Z0-9_-]\+\).*/\1/' | sort | uniq > /tmp/mixins.txt
comm -23 /tmp/includes.txt /tmp/mixins.txt > /tmp/huérfanos.txt

if [[ -s /tmp/huérfanos.txt ]]; then
  echo "❌ Mixins no definidos encontrados:"
  cat /tmp/huérfanos.txt
else
  echo "✅ Todos los mixins usados están definidos."
fi

# 2. Verificar rutas rotas en @use
echo -e "\n🔍 Verificando rutas en @use..."
grep -r "@use" "$BASE" | while read -r line; do
  ruta=$(echo "$line" | sed -n "s/.*@use\s\+'\([^']\+\)'.*/\1/p")
  archivo=$(echo "$line" | cut -d: -f1)
  dir=$(dirname "$archivo")
  fullpath="$dir/$ruta.scss"
  fullpath_alt="$dir/$ruta/_$(basename "$ruta").scss"

  if [[ ! -f "$fullpath" && ! -f "$fullpath_alt" ]]; then
    echo "❌ Ruta rota en $archivo → '$ruta'"
  fi
done

# Limpieza
rm /tmp/includes.txt /tmp/mixins.txt /tmp/huérfanos.txt
