#!/usr/bin/env bash
# Convierte robotutor.html (documento completo, tal como lo sirve chatgpt.site)
# en robotutor-artifact.html, listo para publicar como Artifact de Claude.
#
# Qué hace:
#  1. Quita <!DOCTYPE>, <html>, <head>, <body> — Artifacts aporta su propio envoltorio.
#  2. Sube el <title> al principio: Artifacts solo lo busca en los primeros 8 KB
#     y el CSS de KaTeX (200 KB) lo dejaba fuera de alcance.
#  3. Restaura por JS los <meta> de la app (viewport-fit=cover y los de iOS),
#     que se perdían al desaparecer el <head> original.
#  4. Elimina el script de bot-management que Cloudflare inyecta al servir.
set -euo pipefail
SRC=${1:-robotutor.html}
OUT=${2:-robotutor-artifact.html}

# Localiza los límites en lugar de fijarlos a mano: así el script sobrevive
# a que GPT añada o quite líneas en el original.
L_TITLE=$(grep -n -m1 '^ *<title>' "$SRC" | cut -d: -f1)
L_KTX_STYLE=$(grep -n -m1 '^ *<style>' "$SRC" | cut -d: -f1)
L_HEAD_END=$(grep -n -m1 '^ *</head>' "$SRC" | cut -d: -f1)
L_BODY=$(grep -n -m1 '^ *<body>' "$SRC" | cut -d: -f1)
L_CF=$(grep -n -m1 'CF\$cv\$params' "$SRC" | cut -d: -f1)

{
  # Titulo recortado: Artifacts lo usa como nombre en la galeria y en la pestana,
  # y debe mantenerse estable entre republicaciones.
  echo "<title>RoboTutor Laboratorio Visual</title>"
  cat <<'META'
<script>
/* Los <meta> de la app viajaban en el <head> original, que Artifacts sustituye
   por el suyo. Se reponen aquí para conservar el comportamiento en iOS. */
(function(){
 var vp=document.querySelector('meta[name="viewport"]');
 if(!vp){vp=document.createElement("meta");vp.setAttribute("name","viewport");document.head.appendChild(vp)}
 vp.setAttribute("content","width=device-width, initial-scale=1.0, viewport-fit=cover");
 var extra={"apple-mobile-web-app-capable":"yes","mobile-web-app-capable":"yes",
  "apple-mobile-web-app-status-bar-style":"black-translucent",
  "apple-mobile-web-app-title":"RoboTutor","format-detection":"telephone=no",
  "theme-color":"#082458"};
 Object.keys(extra).forEach(function(n){
  var e=document.querySelector('meta[name="'+n+'"]');
  if(!e){e=document.createElement("meta");e.setAttribute("name",n);document.head.appendChild(e)}
  e.setAttribute("content",extra[n]);
 });
})();
</script>
META
  # CSS y JS de KaTeX, hasta justo antes del <title>
  sed -n "${L_KTX_STYLE},$((L_TITLE-1))p" "$SRC"
  # Resto del head (CSS de la app) sin la etiqueta </head>
  sed -n "$((L_TITLE+1)),$((L_HEAD_END-1))p" "$SRC"
  # Cuerpo, sin <body> y cortando antes del script de Cloudflare
  sed -n "$((L_BODY+1)),$((L_CF-1))p" "$SRC"
} > "$OUT"

echo "$OUT: $(wc -c < "$OUT") bytes, $(wc -l < "$OUT") lineas"
