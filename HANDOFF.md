# Revisión 3.39.0 · articulaciones, efector y solución tras fallar

Parte de `main` 7f627b2 (3.38.0). Destino: la misma GitHub Pages del repositorio.

- Pinza visible con dos dedos y superficies de contacto; el TCP sigue en el punto medio entre sus puntas. La geometría visual no cambia la respuesta ni añade una articulación al modelo.
- Revolutas con carcasa circular, tapas y eje; los brazos se recortan en las uniones para evitar caras que atraviesen las tapas. Prismáticas con guía rectangular y vástago. No se añaden letras R/P ni otros símbolos al dibujo.
- Se respeta la regla DH: θ variable / d fijo en revolutas, d variable / θ fijo en prismáticas. La notación genérica q del enunciado conserva sus unidades. La explicación distingue las cadenas de movimientos locales de una tabla DH.
- Tras un intento incorrecto en práctica de cinemática directa o asignación DH, se abre el desarrollo completo: datos, ángulos acumulados, trigonometría, proyecciones y operaciones. Para las cadenas matriciales incluye sustitución de parámetros y las 16 entradas de cada producto acumulado. No se enmascaran pasos según dificultad.
- Repetir la respuesta no cuenta otro intento y vuelve a mostrar el desarrollo. Después de verlo, los aciertos cuentan como asistidos. Al iniciar otro ejercicio se cierra. En Examen no se revela.
- El redibujado por resize borraba la solución: ahora conserva el contenido y su visibilidad al girar el móvil.

Validación: 36 soluciones y geometrías en la nueva prueba CI `check-worked-solutions.cjs`; flujo real de Chrome con respuestas incorrectas, repetidas, corregidas, cambio de ejercicio, resize y protección de Examen en seis familias. Capturas de escritorio/móvil revisadas. Batería completa: 393/393 en Chrome; barridos generales: 9.570 ejercicios y 480 láminas DH, todos aprobados.

Referencia de la regla DH: https://www.mathworks.com/help/robotics/ref/rigidbodyjoint.setfixedtransform.html . La regla se explica en la solución, sin convertir los factores de transformación local en una supuesta tabla DH.

---

# Revisión 3.38.0 · correcciones de las láminas

Parte de `main` 0e49c9b (3.37.1), conservando los PR #13–18 de Claude.

- Sustituye la ordenación aproximada de caras y los contornos dibujados encima por recorte de superficies y aristas según profundidad en cada punto. Los cilindros y piezas intersectadas son opacos.
- RRRP: camisa abierta formada por cuatro paredes, vástago interior más estrecho y solapado. L3 mide la parte fija y q4 la extensión adicional; q4 y la prismática del SCARA se identifican como variables.
- Cámara fija elegida para evitar escorzos fuertes, encuadre ajustado al mecanismo y sus anotaciones, cotas exteriores con búsqueda de espacio y E unido al TCP real mediante una llamada.
- DH: rótulos fuera de las piezas y flechas 4, 5 y 6 identificadas individualmente. Se mantienen solo el marco base y los sentidos articulares, sin entregar marcos locales resueltos. La leyenda describe los rótulos actuales. Las posturas del generador 3R mantienen sus extremos sobre el suelo.
- Tipografía mayor en móvil; lámina horizontal sin el antiguo lienzo alto vacío.

Validación: 393/393 autopruebas en Chrome real sin interfaz visible, sin errores de ejecución; barrido de 9.570 ejercicios; 480 casos DH; 72 láminas deterministas y casos analíticos de superficies cruzadas y contornos ocultos. El nuevo `scripts/check-mechanical-plates.cjs` se ejecuta en CI. Revisión de capturas reales de 5 escenas a 1280 y 390 px, sin desbordamiento horizontal. No equivale a una prueba física en Safari/iOS.

**Destino de publicación confirmado por el usuario: GitHub Pages de este repositorio**, https://said-rosa.github.io/robotutor-laboratorio-visual/ . Las siguientes mejoras deben publicarse aquí; la copia histórica de Sites no es el destino de esta revisión. `robotutor.html` sigue siendo la fuente; el workflow genera `docs/index.html` al fusionar.

---

# Revisión 3.36.0 · láminas mecánicas de cinemática directa

Rama `codex/laminas-mecanicas`, basada en `main` 51b8516 (3.35.0). PR pendiente de revisión antes de fusionar, según README.

- Nuevo dibujo vectorial fijo con cuerpos mecánicos, cotas exteriores y extremo E para ejercicios `forward_` espaciales. Sin ejes, marcas de giro, controles de postura ni proyecciones resueltas. Los datos y la referencia permanecen explícitos.
- SCARA RRPR y cilíndrico RPPR de cuatro articulaciones, seleccionables en capítulo 4 / tema 4.1. Posición o transformación homogénea según dificultad. Modelos nuevos independientes del SCARA RRP existente; q3 del SCARA nuevo mide descenso.
- La figura se calcula desde las mismas matrices que la respuesta. El 6R conserva su tabla DH y su geometría, con el nombre «Antropomórfico».
- Se conserva el ejercicio separado de asignación de marcos DH incorporado por Claude. Sus ejes y tabla editable siguen visibles en su propia actividad.
- Fórmulas y convenciones de los modelos nuevos en Aprender 4.1. La lámina de práctica solo muestra enunciado, dimensiones, datos y referencia.

Validación: ocho grupos de integración local con JSDOM (coordenadas, dibujo, interfaz, calificación, guardado/restauración de Examen, transición DH, selector y KaTeX), sin errores de ejecución; 210 escenas aleatorias verificadas. Se revisaron renders vectoriales a anchura de escritorio y 390 px. `scripts/check-source.cjs` añade 108 combinaciones angulares contrastadas con fórmulas independientes para ambos modelos y se ejecuta en CI. No se ha hecho una prueba física en iOS.

Publicación: se prepara la misma fuente para el enlace público de Sites habitual. GitHub Pages seguirá `main` y recibirá esta revisión al fusionar el PR. No existe sincronización permanente entre ambos alojamientos.

---

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

Añadido por Claude el 8 de septiembre de 2026, sabiendo que Codex no estaría disponible durante cinco días. Esta sección lista lo que se hizo en su ausencia y lo que conviene que revise al volver.

**Actualizado el 17 de septiembre de 2026: todo lo de abajo ya está fusionado en `main` y publicado.** La versión en vivo es la **v3.37.0** en https://said-rosa.github.io/robotutor-laboratorio-visual/. Cuando se escribió esta sección nada estaba fusionado; esa frase quedó obsoleta y se corrige aquí para que no engañe.

## 1 · PR #1 · Tres arreglos aplicados sobre esta misma rama

Commit `f18d12b`. Al revisar el PR aparecieron tres autopruebas que pasaban en `main` y fallaban aquí, más una inconsistencia. Se corrigieron directamente para no bloquear el avance:

- **`cleanMechanismSvg`** recupera la etiqueta «P» del tramo prismático, la cota combinada `d₀ + q₃` en la leyenda del SCARA y una recta discontinua por cada articulación de revolución, reutilizando `jointRotationFrame`. La intención fue conservar el rediseño simplificado y reponer solo la información que las autopruebas señalaban como perdida. **Es la decisión más discutible de todo el lote: si la estética buscada era otra, dilo y se ajusta.**
- **`choicePool`**: la autoprueba de dificultad comparaba contra un recuento que no excluía las preguntas de cálculo. Se corrigió el recuento esperado, no la función.
- **Racional del par eficaz**: decía «da unos 24 N·m» cuando la respuesta ya se había corregido a 25.

## 2 · PR #5 (era el #2) · Seguridad normativa (1.8) y los seis pares elementales (2.1)

Se abrió apilado sobre la rama del #1. Al fusionar el #1 con `--delete-branch` desapareció su base, GitHub cerró el #2 automáticamente y no dejó reabrirlo; el mismo trabajo se volvió a presentar como **PR #5**, que es el que quedó fusionado. Error mío de procedimiento, no hay cambios perdidos.

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

## 5 · PR #6 · **Tu propio PR, cerrado por mí. Lee esto primero.**

Codex: abriste el **PR #6** («Adaptar notación del parcial y añadir geometría planar 2R y región RP») antes de quedarte sin tokens. **Lo cerré yo, y el trabajo no se perdió.**

Qué pasó: el usuario me pidió traer a GitHub lo que habías publicado en la copia de `chatgpt.site`, creyendo que no lo habías subido. Importé la revisión 3.34.0 desde esa copia y abrí el **PR #7** sin haber comprobado antes que tu #6 ya traía lo mismo. Cuando lo vi, el #7 ya estaba fusionado, así que cerré el #6 como duplicado en vez de intentar fusionar dos veces el mismo cambio.

**Comprueba que la importación no te dejó nada fuera.** Yo copié desde el HTML publicado; si tu rama tenía algo que no llegó a esa publicación, no está en `main`. La rama `codex/geometria-y-notacion` sigue existiendo, sin borrar, justamente para que puedas comparar.

## 6 · PR #7 · Importación de tu revisión 3.34.0

Notación del libro, par planar y parciales geométricos, tal como estaban en la copia publicada. Se añadió una ficha de racional al ejercicio de pertenencia del RP telescópico, que se importó sin ella.

Aquí cometí dos errores que conviene que conozcas porque afectan al procedimiento compartido:

- Un `git stash pop` dejó marcadores de conflicto (`<<<<<<< Updated upstream`) dentro del script principal y los fusioné sin verlos, porque miré `git status` **después** de `git add`. La página en vivo dejó de arrancar con `SyntaxError: Unexpected token '<<'`. Se corrigió en caliente con el commit `a65d55b`.
- Fusioné con el CI en rojo porque consulté el PR equivocado (`gh pr checks 6` cuando el mío era el #7). El CI había detectado el fallo correctamente.

Ambos casos se habrían evitado leyendo lo que la herramienta devolvía. `scripts/check-source.cjs` los detecta y ahora lo ejecuto en local antes de cada commit.

## 7 · PR #8 · El racional del verdadero/falso también al practicar

El racional que nombra la trampa (el cuantificador absoluto) solo aparecía en el informe del examen. En Practicar el alumno leía «no es correcta» y se quedaba igual. `reflectionExplanation` lo entrega ahora en ambos sitios, acotado estrictamente a `kind==="reflection" && type==="choice"` para no tocar el resto de opciones múltiples.

## 8 · PR #9 · La solución escrita que faltaba en la práctica de temas

Varios ejercicios de práctica por tema abrían un panel de solución vacío. Dos causas distintas:

- `solutionHasContent` no existía: el panel se abría aunque no hubiera nada que mostrar.
- El área del espacio de trabajo del 2R con las dos rotaciones libres no tenía desarrollo escrito. Es un anillo completo, **A = π(L₁+L₂)² − π(L₁−L₂)² = 4πL₁L₂**. El usuario sospechaba que la aplicación se equivocaba al no admitir la media corona; lo que fallaba no era el resultado sino que nunca se enseñaba de dónde salía.

**Quedan dos familias sin desarrollo escrito**, y son buen candidato para ti: las cadenas narrativas del capítulo 3 y dos variantes simbólicas del espacio de trabajo de tres eslabones.

## 9 · PR #10 · Asignación de marcos DH con la lámina desnuda del examen

El cambio con más criterio pedagógico del lote, y el que más conviene que revises.

**El problema:** todos los ejercicios del capítulo 4 entregaban la tabla DH ya hecha y pedían operar con ella. Pero en el parcial del usuario lo único que dan es **el marco de la base**; asignar los marcos y rellenar la tabla es justamente lo que se evalúa. Esa destreza no se practicaba en ninguna parte. Además el tema 4.3 («Asignación de marcos DH») lanzaba al practicar un ejercicio de cinemática inversa, sin relación con su propio contenido.

**Lo que se hizo:**

- Generador `makeDhAssignment`: brazo articulado de 3 ejes, tabla canónica `[{a:0,α:90,d:H,θ:q₁},{a:L₂,α:0,d:0,θ:q₂},{a:L₃,α:0,d:0,θ:q₃}]`. Respuesta de tipo `matrix` con `matrixLayout:"dh"`, que `renderExercise` pinta como tabla con cabeceras `i · aᵢ(m) · αᵢ(°) · dᵢ(m) · θᵢ(°)`. Las celdas conservan la clase `.cell` y el orden por filas, así que la calificación no se tocó.
- Modo `bare` en `cleanMechanismSvg`: fuera la leyenda `d₁, a₂, a₃, d₄, a₅=0, d₆` —que **era la respuesta**— y fuera el panel de marcos ya asignados. Quedan el mecanismo, las articulaciones numeradas, la recta del eje de giro de cada una, cotas con nombre mecánico neutro (H, L₂, L₃) y el marco base, dibujado al pie del robot y más grande, porque aquí no es una referencia: es el único dato.
- `diagnoseCell` nombra el parámetro: «**α2**: esperado 0, ingresado 90» en vez de «Celda (2,2)». Confundir aᵢ con dᵢ es el error que el ejercicio persigue.
- La convención va fijada en el enunciado (`DH_ASSIGN_CONVENTION`). **Decisión deliberada:** una asignación DH no es única, y sin fijar z₀ y el apoyo de xᵢ el programa marcaría como error tablas perfectamente válidas.
- `kinematics` se guarda **solo en `params`**, no en el ejercicio, para que `buildPedagogyTrace` devuelva `source:"verified-output"` y el banco de trabajo por etapas no se muestre. Si aparece, delata la respuesta.
- El tema 4.3 gana un ejemplo resuelto espacial. El único que había era un 2R plano, donde todos los ejes salen del papel y nunca aparece una torsión.

**Dos autopruebas se rompieron al añadir el generador, sin que fallara ninguna comprobación real.** Exigían un mínimo de muestras de un sorteo aleatorio, y un generador más diluye ese sorteo: `conBloque` bajaba de >15 a 10–14. Se midió en cinco desplazamientos de la secuencia para confirmar que las aserciones de fondo siempre pasaban, y se reescribieron de forma determinista (llamando a los generadores por nombre y consultando `topicChoicePool` / `topicNumericGenerators` directamente), el mismo tratamiento que ya se dio a la de SO(3) en el #3.

**Estado: 394/394.** Verificado en la página publicada, sin errores de consola.

### Lo que se dejó fuera a propósito

El brazo de **seis ejes con muñeca esférica**. Las torsiones α₄ y α₅ dependen de detalles del dibujo que un esquema no fija sin ambigüedad, y prefiero resolver eso antes que soltar un ejercicio capaz de marcar como error una tabla correcta. **Si tienes criterio sobre cómo fijar esa muñeca sin sobrecargar la lámina, es el mejor sitio donde ayudar.**

Queda también la variante encadenada que describió el usuario: tabla DH + matriz homogénea + coordenadas del efector final en un mismo ejercicio, usando el banco de trabajo por etapas como paso obligatorio y calificado.

## 10 · PR #13 · Muñeca esférica de seis ejes

Cierra lo que el #10 dejó pendiente. **La clave está en el dibujo, no en el álgebra:** las torsiones α₄ y α₅ dependen del sentido en que se tomen los ejes, y un esquema sin flechas no lo fija —dos tablas opuestas en signo describen el mismo dibujo—, así que la aplicación podía marcar como error una respuesta correcta. Ahora la lámina dibuja el sentido positivo de cada eje y el enunciado lo declara. Eso cierra también el mismo hueco latente en el ejercicio de tres ejes.

Antes de elegir el mecanismo verifiqué por cálculo cuatro disposiciones candidatas. **La que ya usaba `industrial6R` desplaza la muñeca de lado respecto del antebrazo**, que no es la forma que un alumno espera ni la que dibuja un examen; la elegida pone los tres ejes concurrentes en la punta del antebrazo.

**Revisable:** dejé `industrial6R` como estaba, porque sus ejercicios entregan la tabla y no dependen de que la forma sea reconocible. Si te parece que también debería corregirse, adelante.

## 11 · PR #14 · Fuera el jacobiano · el área de trabajo al capítulo 3

Decisión del usuario: el jacobiano no se da en su curso. Fuera los temas 4.5 y 4.9 completos, los tres generadores, su familia, su ficha teórica y 15 preguntas conceptuales.

- Las preguntas **no se borran del banco**: el índice que las liga a un tema es posicional, así que borrarlas lo desalinearía. Quedan marcadas con clave vacía y `choicePool` tiene prohibido sacarlas. Volverían con una línea.
- **Singularidades y desacoplo de muñeca no eran del jacobiano**, así que no se van con él: se reescribieron sin derivadas ni rango y viven en cinemática inversa, que es donde el alumno se los encuentra.
- El **área de trabajo** se muda al capítulo 3 con su teoría y sus ejercicios. Sus preguntas conceptuales siguen escritas en el banco del capítulo 4, así que `topicChoicePool` busca ahora la clave en todos los bancos y `choicePool` descarta lo que ya no pertenece a ese capítulo.
- El capítulo 4 se renumera: ocho temas correlativos. Recuerda que las claves del código son los números **del fuente** (`claveOriginal`) y que los visibles los recalcula `applyTopicOrder` por posición.

## 12 · PR #15 · Los formatos, dentro de cada ejercicio

Las tres barras de formato estaban apiladas sobre el ejercicio y se veían todas a la vez. Ahora cada una viaja con el ejercicio que genera. Antes de moverlas comprobé que los tres tipos siguen teniendo puerta de entrada por «Generar ejercicio» y por la práctica de su tema.

**Revisable:** se descubren menos. Si crees que el verdadero/falso necesita una entrada más visible, el sitio natural es el filtro de tipo de ejercicio.

## 13 · PR #16 · Láminas

La de asignación de marcos pasa a usar el motor técnico de las láminas mecánicas —cuerpos sólidos y cotas acotadas— con la terna de la base, el eje de cada articulación y su número dibujados encima. El modo esquemático de `cleanMechanismSvg` queda sin uso y se retira.

En las láminas de cinemática directa, las **cotas variables van en azul** y las fijas en gris, con la leyenda solo cuando esa lámina tiene alguna. Y «Nuevo ejercicio» estrena «Cualquier modelo», que sortea uno y nunca repite el anterior.

**No pude verificar el aspecto**: en esa sesión no tuve herramientas de navegador. Le mandé al usuario una vista previa renderizada. Si al abrirlo algo no encaja visualmente, es ajuste de parámetros.

## 14 · Comprobación sin navegador · lo más útil de este lote

`runSelfTests` vive dentro de la página y solo corre abriéndola, así que un cambio grande se fusionaba sin batería. Ya no.

- **`scripts/sandbox.cjs`** carga el script principal en un `vm` con un DOM postizo. Recorta el arranque, que pinta interfaz y no tiene sentido sin DOM real.
- **`scripts/check-selftests.cjs`** ejecuta la batería entera sin navegador y **falla ante cualquier rojo que no esté en la lista de las 42 que sí necesitan interfaz**. Si añades una comprobación que necesite DOM de verdad, añádela a esa lista con su nombre exacto.
- **`scripts/check-kinematics.cjs`** ejercita los generadores y láminas de asignación de marcos con 480 sorteos, mucho más muestreo del que hace la batería.

Los tres corren en el CI de los PR. **Encontraron dos cosas que de otro modo se habrían escapado:** una cota que desaparecía cuando su eje apuntaba a la cámara (el PR #13, que mi propia autoprueba habría delatado solo unas veces de cada diez) y **diez regresiones del PR #14**, ninguna de las cuales habría visto a mano.

La forma de usarlo en un cambio grande es comparar contra `main`: se ejecuta la batería en las dos versiones y se restan los conjuntos de fallos. Los del DOM salen en ambas; lo que aparezca solo en tu rama es tuyo.

**No sustituye a abrir la página.** Las 42 listadas siguen necesitando un navegador, y el aspecto no lo comprueba nadie más que tú.

## 15 · Versión


`APP_VERSION` se quedó en 3.34.0 durante los PR #8, #9 y #10, y se subió a 3.35.0 al ponerlo al día. Desde entonces: **3.36.0** con el PR #14 y **3.37.0** con el #16.

## Nota sobre las cuentas de GitHub

Codex y Claude operan con la misma cuenta (`Said-Rosa`), así que GitHub no permite «solicitar cambios» de forma  formal en el PR del otro: las revisiones van como comentarios. Si interesa la señal formal de aprobación, habría que dar a uno de los dos una cuenta propia.
