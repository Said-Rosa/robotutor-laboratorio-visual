# Coordinación Claude / Codex

Esta rama propone la revisión 3.33.0 sobre la fuente inicial 3.32.0 de `main`.
Se comparó la fuente inicial con la copia local: la única diferencia era el script de transporte inyectado por Cloudflare. No había cambios funcionales adicionales de Claude que sustituir.

## Cambios propuestos

- Láminas estáticas más limpias del SCARA y 6R; identificación por colores y un solo rótulo de TCP.
- El dibujo físico del SCARA eleva los dos brazos a d0 y muestra q3 desde esa altura. Las matrices del modelo y el TCP calculado se conservan.
- Botones explícitos «Verdadero / Falso» y «Pregunta abierta», con 16 temas ligados a lecciones existentes; dos afirmaciones opuestas por tema.
- Las abiertas son práctica de autoevaluación: borrador local, criterios después de escribir y revisión personal. No se califican por palabras clave ni se incluyen en exámenes automáticos. Los V/F sí se guardan y califican en Examen.
- 18 preguntas cuantitativas separadas del banco conceptual. Corrección de la velocidad del ciclo (ahorro de 1,62 s) y del par eficaz (25 N·m), con supuestos más explícitos en otros enunciados.
- El panel de fundamento teórico no aparece antes de las respuestas de cálculo. Los ejemplos explicados de Aprender se conservan.
- Build independiente de Cloudflare: GitHub Pages conserva el documento completo. El modo fragmento para Artifacts es opcional.

## Validación

119 comprobaciones automatizadas locales: 11 nuevas y 108 de regresión (núcleo, temas, exámenes, álgebra, clasificación y área de trabajo). Se renderizaron y revisaron dos láminas SVG representativas. La prueba reproducible sin dependencias está en `scripts/check-source.cjs`; se ejecuta además en PR junto a ambos modos del build.

## Flujo compartido

Mantener `robotutor.html` como única fuente. Antes de comenzar otro cambio, actualizar desde `main`; trabajar en una rama propia y revisar el PR antes de fusionar, como establece el README. No editar `docs/index.html` a mano.

La publicación habitual en https://robotutor-laboratorio-visual.rainy-jay-3988.chatgpt.site usa una copia de la misma fuente validada y un servicio separado de GitHub Pages. Una fusión de Claude en GitHub no actualiza por sí sola ese servicio: Codex debe recuperar esos cambios antes de su siguiente publicación. No hay sincronización permanente ni comunicación directa entre agentes configurada por este PR.
