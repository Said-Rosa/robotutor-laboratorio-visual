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

---

# Pendiente de revisión · Codex

Añadido por Claude el 8 de septiembre de 2026, sabiendo que Codex no estará disponible durante cinco días. Esta sección lista lo que se hizo en su ausencia y lo que conviene que revise al volver. Nada de esto se ha fusionado a `main`: la URL en vivo sigue mostrando la v3.32.0.

## 1 · PR #1 · Tres arreglos aplicados sobre esta misma rama

Commit `f18d12b`. Al revisar el PR aparecieron tres autopruebas que pasaban en `main` y fallaban aquí, más una inconsistencia. Se corrigieron directamente para no bloquear el avance:

- **`cleanMechanismSvg`** recupera la etiqueta «P» del tramo prismático, la cota combinada `d₀ + q₃` en la leyenda del SCARA y una recta discontinua por cada articulación de revolución, reutilizando `jointRotationFrame`. La intención fue conservar el rediseño simplificado y reponer solo la información que las autopruebas señalaban como perdida. **Es la decisión más discutible de todo el lote: si la estética buscada era otra, dilo y se ajusta.**
- **`choicePool`**: la autoprueba de dificultad comparaba contra un recuento que no excluía las preguntas de cálculo. Se corrigió el recuento esperado, no la función.
- **Racional del par eficaz**: decía «da unos 24 N·m» cuando la respuesta ya se había corregido a 25.

## 2 · PR #2 · Seguridad normativa (1.8) y los seis pares elementales (2.1)

Apilado sobre esta rama. **Cambiar su base a `main` cuando #1 se fusione.**

- Tema 1.8: orígenes del riesgo mecánico, tabla de las tres familias de medidas (resguardos, dispositivos de protección incluidos los sensibles a la presión, medios de advertencia) y el método de tres etapas.
- Tema 2.1: `CC_PAIRS` con los seis pares inferiores; `ccSvg` dibuja la planar y la esférica; la unión planar entra en la tabla.
- **La helicoidal pasa a dibujarse como hélice.** Antes salía idéntica a la cilíndrica, así que era imposible distinguir una libertad de dos mirando la figura. Cada lámina tiene ahora tantos trazos de movimiento como grados de libertad.
- Ejercicio nuevo `classification_pair` y seis entradas de verdadero/falso.
- **Fuera de alcance, revisable:** las clasificaciones numéricas declaran `tolerance:0,25` en vez de `0`. Contar coordenadas da un entero y cualquier margen por debajo de media unidad es exacto.

## 3 · PR #3 · Diagnóstico de respuestas

Un solo tema: que al fallar, el alumno lea el nombre del método que confundió en vez de «no es correcta».

- Cinco generadores numéricos no declaraban `numericAlternatives` (los otros 32 sí): `classification_coupled`, `classification_mobility`, `classification_pair`, `workspace_three_area` y `workspace_three_missing`.
- Ninguna de las ocho familias de clasificación de opción múltiple llevaba ficha de racional. Se construye por instancia en `classificationRationale`, derivada de `CC_MODELS`, porque el enunciado es común a todos los modelos y lo que cambia es la figura sorteada.
- Dos casos tenían el texto pero no lo entregaban: `calculation_choice_*` devolvía el ejercicio sin `rationale` —y `choiceFailureReason` lo lee de ahí, no del mapa por enunciado—, y `workspace_three_membership` no tenía ficha.
- Cuatro autopruebas afirmaban sobre estado transitorio y oscilaban entre recargas según qué ejercicio saliera al arrancar. **Se comprobó que ninguna señalaba un defecto real antes de tocarlas**; en particular, la de SO(3) fallaba por muestreo, no por una matriz mal clasificada: 400 generaciones directas no dan ni una discrepancia con `isSO3Matrix`.

**Estado: 385/385 autopruebas, estable en cinco recargas seguidas.** No queda ninguna en rojo.

## 4 · PR #4 · Examen de aula, verdadero/falso con racional y glosario

- Formato **«Examen de aula»**: declara bloques —4 de reconocer la arquitectura y 6 de verdadero o falso— y `composeBlockExam` los respeta. La firma de deduplicación incluye el modelo dibujado, porque el enunciado de las clasificaciones es común a todas. El bloque de reconocimiento sale siempre del capítulo 1 y el resumen del formato lo advierte.
- Los **verdadero/falso no llevaban ficha de racional ni solución guiada**. Cada afirmación falsa lo es por un absoluto, así que las 22 entradas declaran ese cuantificador en un campo `trap` y la ficha lo nombra en vez de decir solo que la frase no es cierta.
- Las clasificaciones aprovechan su ficha para poblar la solución guiada, que estaba vacía.
- Nueve términos nuevos en el glosario, en su posición alfabética.

**Estado: 385/385 autopruebas.** Recorrido completo del formato nuevo por la interfaz.

## Nota sobre las cuentas de GitHub

Codex y Claude operan con la misma cuenta (`Said-Rosa`), así que GitHub no permite «solicitar cambios» de forma  formal en el PR del otro: las revisiones van como comentarios. Si interesa la señal formal de aprobación, habría que dar a uno de los dos una cuenta propia.
