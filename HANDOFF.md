# Estado actual · 6 de octubre de 2026

Esta sección describe el proyecto **tal como está hoy**. Todo lo que sigue a «Historial» es el registro de cómo se llegó aquí; si algo de abajo contradice a esta sección, manda esta.

## Versión y publicación

- **3.55.0**, publicada en https://said-rosa.github.io/robotutor-laboratorio-visual/ .
- **GitHub Pages es el único destino.** Las copias de `chatgpt.site` y de Sites que aparecen en el historial ya no se actualizan.

## Cómo se trabaja

- `robotutor.html` es la única fuente. `docs/index.html` lo regenera `build-pages.yml` en cada push a `main`, que el robot de Actions sube directamente a `main`. **No se edita a mano.**
- El bloque 3D de las láminas se genera con `npm ci && npm run build:plates` a partir de `scripts/mechanical-renderer.mjs`. El CI comprueba que el bloque del HTML está al día.
- Para cada cambio: actualizar desde `main`, trabajar en una rama propia, abrir un PR, esperar el CI en verde y fusionar.
- Los dos agentes usan la misma cuenta (`Said-Rosa`): las revisiones entre nosotros van como comentarios.

## Protección de `main`

Regla de repositorio **«Proteger main»**, sin excepciones para nadie: **no se puede borrar la rama ni reescribir su historia** (force-push bloqueado). Sobre las ramas de trabajo no hay restricciones.

**No exige PR ni CI en verde, y no es un olvido.** `build-pages.yml` empuja a `main`, y la excepción que permitiría a ese robot saltarse la regla solo existe en organizaciones, no en repositorios personales. Con la exigencia puesta, la página dejaría de actualizarse sin avisar. La salida sería convertir `build-pages.yml` en una comprobación que falle si `docs/index.html` no está al día, en vez de corregirlo empujando. **Es una decisión pendiente del usuario.**

## Finales de línea

`.gitattributes` fija **LF** para todo. Sin eso, una copia en Windows guardaba el HTML con CRLF, y `npm run build:plates && git diff --exit-code` veía el fichero entero como modificado aunque nadie hubiera tocado el renderizador.

## Seguridad

- La página no pide nada a la red: KaTeX, sus fuentes y three.js van dentro del HTML. La **política de contenido** va en un `meta`, con `connect-src 'none'`, `font-src data:`, `img-src` sin destinos externos y sin `unsafe-eval`. Añadir un recurso externo la rompe, y `check-security` lo detecta.
- `feedback(tipo, texto)` **escapa el texto por defecto**. Usad `{html:true}` solo con marcado escrito por nosotros; nunca con texto que venga de un archivo o del alumno. **Y al revés: un aviso con etiquetas propias tiene que pedirlo**, o el alumno las ve escritas tal cual. `check-security` vigila las dos cosas.
- Al importar un progreso, `validateProgressData` reconstruye sobre un objeto por defecto. Una autoprueba exige que ninguna cadena de un archivo hostil sobreviva.

## Comprobaciones

En el CI de cada PR: `check-source`, `check-worked-solutions`, `check-mechanical-plates`, `check-architectures`, `check-inverse`, `check-kinematics`, `check-selftests`, `check-exercises` y `check-security`, más el build en sus dos modos y `check-source`/`check-security` sobre cada uno.

- **Autopruebas: 390/432 sin navegador.** Las 42 restantes necesitan DOM real y están listadas en `check-selftests.cjs`; si añadís una que lo necesite, añadidla ahí con su nombre exacto.
- **Todo ejercicio practicable tiene desarrollo escrito**, y `check-exercises` falla si llega uno sin él: el botón de solución no debería volver a decir «Sin desarrollo escrito».
- En un cambio grande, **comparad contra `main`**: ejecutad la batería en las dos versiones y restad los fallos. Lo que solo aparezca en vuestra rama es vuestro.
- `check-modeled-plates.cjs` necesita `playwright` y **no está en el CI**; en una copia sin él falla igual en `main`.

## Convenciones que no se deben romper

- **Claves de tema ≠ números en pantalla.** El código usa los números del fuente (`claveOriginal`); `applyTopicOrder` renumera al mostrar. En el capítulo 4:

  | Fuente | En pantalla | Tema |
  |---|---|---|
  | 4.5 | 4.1 | Cadena cinemática y producto de transformaciones |
  | 4.1 | 4.2 | Cinemática directa |
  | 4.2 | 4.3 | Denavit–Hartenberg |
  | 4.3 | 4.4 | Asignación de marcos DH |
  | 4.6 | 4.5 | Denavit–Hartenberg: algoritmo auditable |
  | 4.8 | 4.6 | DH estándar y modificado |
  | 4.4 | 4.7 | Cinemática inversa |
  | 4.7 | 4.8 | Cinemática inversa: ramas, límites y robustez |

  **En textos para el alumno, citad los temas por su nombre**, no por número.
- **T = [n o a p].** La matriz del robot se nombra por sus columnas: n (normal, eje x del extremo), o (orientación, eje y), a (aproximación, eje z) y p (posición). Es la notación del curso y la que usa la cinemática inversa. Las celdas de T se nombran así en el diagnóstico (`px`, `az`).
- **Enunciados breves.** El usuario lo pidió el 6 de octubre: «solo los datos, no explicando todo el ejercicio». `statement` lleva la tarea en una frase; los datos van en `chips` o en tablas. El convenio que hace única la respuesta, la descripción del montaje y las reglas de puntuación van en **`notes`**, que `statementNotesMarkup` pinta plegado bajo el enunciado («Convenio y aclaraciones»). No se borra nada de eso: se mueve. La autoprueba «El enunciado es breve…» limita el texto a 190 caracteres sin contar tablas, y exige que todo dato con número citado en las notas esté también en las fichas.
- **El libro del curso es *Fundamentos de robótica* (Barrientos, Peñín, Balaguer y Aracil), y manda.** El usuario lo fijó el 6 de octubre como criterio: lo que venga de otras fuentes solo entra si casa con él. La cinemática es su capítulo 4. De él salen el orden θ, d, a, α de la tabla, el algoritmo de 16 pasos, T = [n o a p] y los tres métodos de cinemática inversa. La teoría lo cita por sección y lo explica con palabras propias: no se copia su texto.
- **Cinemática inversa** (`kind:'ik-noap'`, `matrixLayout:'ikNoap'`). La respuesta es un vector de coordenadas articulares y **no se compara con una solución guardada:** `ikNoapReaches` comprueba con la cinemática directa que lleva el extremo adonde se pide, y `ikNoapGrade` puntúa por articulación contra la solución válida más parecida. Qué es «adonde se pide» lo decide `ikNoapCriterion`, con el criterio del libro, a partir de `ik.dato`:
  - `"p"` · **método geométrico** (`makeInverseNoap` con el antropomórfico). El enunciado da solo la posición. Valen las dos posturas del codo y las dos de la base: hasta cuatro soluciones.
  - `"T"` · **método de la matriz homogénea** (`makeInverseNoap` con los demás). El enunciado da T = [n o a p]. Con tres grados de libertad basta alcanzar p, como hace el libro, que despeja con la cuarta columna: el polar tiene dos soluciones. Con cuatro (SCARA) hay que reproducir la T completa.
  - `"R"` · **desacoplo cinemático** (`makeWristAngles`, `ik.id==='wrist3'`, `ik.primera=4`). Se resuelve la muñeca: solo se compara la orientación, y hay dos soluciones.

  **No volver a exigir la T completa a un robot de tres ejes:** la 3.50 lo hacía y rechazaba el otro codo, que el libro da por bueno. El criterio se deduce del ejercicio y no se guarda, para que un examen empezado con otra versión se corrija igual. La lámina se dibuja en `IK_NOAP_REFERENCE`, nunca en la postura pedida. Son de solo enunciado. Para añadir un robot hacen falta sus candidatos en `ikNoapSolutions`, su desarrollo en `ikNoapSteps`, su postura de referencia y sus ecuaciones en `check-inverse.cjs`.
- **Cinemática inversa completa** (`kind:'ik-chain'`, `matrixLayout:'ikChain'`, `makeInverseChain`). Dos partes: la tabla DH del mecanismo en la postura dibujada, y las coordenadas articulares que alcanzan lo pedido. Se construye sobre `makeInverseNoap` y usa su mismo `params.ik`. La respuesta es una matriz de cuatro columnas: n filas de tabla y una fila con las articulaciones; con tres ejes, la cuarta celda de esa fila va fija y oculta (`matrixCellPolicy`). `ikChainGrade` da 5 puntos a la tabla y reparte otros 5 entre las articulaciones, con arrastre: si la tabla está mal, valen las articulaciones que alcanzan lo pedido según esa tabla. Es de solo enunciado, pero **sí enseña las fichas** (`showsDataChips`), porque las dimensiones y la postura dibujada solo están ahí. Por eso `IK_NOAP_REFERENCE` usa en las prismáticas valores que el generador no sortea: la postura de las fichas no debe coincidir con la respuesta.
- **Ecuaciones de cada robot: `IK_EQ`.** La T con letras de los cinco robots de la inversa y sus ecuaciones inversas están escritas una sola vez, en la sintaxis de `ikeqEvaluate`. De ahí salen el desarrollo simbólico de todas las soluciones de la inversa (`ikSymbolicSteps`, que `ikNoapSteps` antepone a los pasos numéricos), las respuestas de la actividad de ecuaciones y lo que `check-inverse.cjs` contrasta con el motor. Si se cambia la tabla DH de un robot, hay que cambiar su entrada.
- **Actividad de ecuaciones** (`kind:'ik-equations'`, `type:'symbolic'`, `symbolEngine:'evalua'`, `makeInverseEquations`). El alumno escribe las ecuaciones de la posición y las de las articulaciones. **No se comparan como álgebra, sino dándoles valores** (`ikeqCanonical`): dos expresiones son la misma si dan lo mismo en las posturas de prueba de `IK_EQ[id].muestras`, que son fijas para que un examen guardado se corrija igual otro día. Los ángulos se comparan sin contar vueltas. `usa` limita las variables de cada respuesta; sin eso valdría «q3 = q3». Las muestras están en la rama principal, donde las formas del libro con arctan coinciden con atan2. **El analizador es propio y no ejecuta texto:** la política de contenido prohíbe `eval` y `Function`, y así debe seguir. Las etiquetas de los campos van sin marcado, porque también salen en avisos que escapan lo que reciben.
- **La solución de la inversa completa va entera** (`makeInverseChain`): los ejes de cada articulación, una fila cada vez con el porqué de sus cuatro parámetros (`dhRowReasoning`, que lo deduce de la propia tabla), la tabla, las matrices con letras (`dhSymbolicMatrix`), su producto T = [n o a p] y, solo entonces, los números.
- **Desacoplo cinemático.** Dos ejercicios sin lámina sobre el robot de seis ejes del libro (`wristRobotRows`): `makeWristCenter` (p_m = p − l₄·a, matriz 3×1 corriente) y `makeWristAngles` (q₄, q₅ y q₆ a partir de ³R₆; en los niveles 3 y 4, a partir de ⁰R₃ y [n o a]). `isWristExercise` los reconoce y los cuenta como «mecánicos» para que el selector de actividad no desaparezca al generarlos. **El elemento (2,3) de ³R₆ es s₄s₅.** En el ejemplar del libro que usa el curso está impreso −s₄c₅; la aplicación usa el valor que sale de multiplicar los tres bloques de giro, y la teoría lo avisa. `check-inverse.cjs` comprueba la matriz elemento a elemento.
- **Desfases en la tabla DH.** `makeDhRowMatrix` saca en los niveles 3 y 4, una de cada tres veces, una fila con θ = q ± 90°, como la tercera del robot de seis ejes del libro. `params.row.theta` es el ángulo ya sumado; `params.q` y `params.desfase`, lo que ve el alumno.
- **Columnas DH: θ, d, a, α.** El orden lo fija `DH_COLUMNS`. No indexéis columnas DH por posición: usad `dhRowCells`, `dhRowFromCells` o `dhColumnIndex('a')`.
- **Ejercicios de asignación DH** (`kind:'dh-assignment'`): `kinematics` va solo en `params`, y su `pedagogyTrace` es la tabla. El banco de matrices ⁰A₁ … T usa su propio trazo (`stageTrace`) y **solo se abre con la tabla resuelta o la solución vista**, porque cada ⁱ⁻¹Aᵢ contiene su fila. En examen no aparece.
- **Problema completo DH** (`kind:'dh-chain'`, `matrixLayout:'dhChain'`). Su respuesta es una matriz de (n+5)×4 con tres bloques: las n filas de la tabla, las 4 de T y la posición en homogéneas [x y z 1]. `dhChainGrade` la puntúa por partes (tabla 4, T 4, posición 2) **con arrastre**: una T que es la de la tabla escrita, o una posición que es la cuarta columna de la T escrita, puntúan aunque la tabla esté mal. En examen se captura celda a celda (vacía = `NaN`), y la guarda de valores finitos es imprescindible: del disco `NaN` vuelve como `null`, y `null−0` vale 0. No lleva banco de matrices, porque T es parte de la respuesta.
- **Nota de examen.** `acierto` sigue siendo binario (entera y bien), así que las estadísticas por tema y la racha no cambian. Aparte, `examQuestionScore` da una nota de 0 a 1 por pregunta, y su suma se guarda como `puntos` en `progress.exams`. `validateProgressData` la acota entre los aciertos y el número de preguntas; las filas anteriores a 3.46 valen sus aciertos.
- **Repaso espaciado** (`progress.review`). Agenda por tema: `{caja, vence, nivel, ids, fallos}`, con intervalos de 1, 3, 7, 14 y 30 días (`REVIEW_INTERVAL_DAYS`). `reviewRecord` se llama en `check()` y en `submitExam`. Cuenta como fallo fallar, fallar en examen o acertar con ayuda; acertar antes de que venza no cambia nada. `vence` es una medianoche local: se repasa por días de calendario. El repaso genera un ejercicio **nuevo** del tema (`reviewExercise`), preferentemente de una familia fallada. `validateProgressData` limpia la agenda sin leer `REVIEW_INTERVAL_DAYS`, que se declara después (por eso la caja máxima va escrita a mano).
- **Tolerancias de las autopruebas.** Las respuestas se redondean a 7 decimales, y en los ejercicios de punto ese error se multiplica por las coordenadas. No comparéis con 1e-9: medid el desvío por redondeo y el del error que queréis detectar, y poned la tolerancia entre ambos.
- **Exámenes guardados.** `loadStoredExam` restaura las preguntas tal como se guardaron. Si cambiáis la forma de una pregunta (orden de celdas, forma de la respuesta), hay que migrarla ahí, como hace `migrateDhColumns`.
- **Orden de declaración.** `loadProgress()` se ejecuta en la línea ~3.850, antes de muchas `const`. Lo que se llame durante la carga no puede leerlas: por ejemplo, `EXAM_FORMATS` dentro de `validateProgressData` rompería el arranque.
- **Pasos de las soluciones escritas.** `solutionStepsMarkup` inserta la primera línea de cada paso como HTML, y el resto va en un bloque de fórmula. No pongáis «<» en esos textos: un «0<θ<π» rompería el panel.
- **Nada de `eval` ni `new Function`.** La política de contenido no lleva `unsafe-eval`, así que en el navegador fallarían, y `check-security` los rechaza. Si una prueba necesita evaluar una expresión, que lo haga en un script de `scripts/`, no dentro de la página.
- **Fórmulas en plantillas `String.raw`.** Escribid `$$ {}^{i-1}A_i`, con un espacio: `$${` abre una interpolación de JavaScript y la página deja de cargar.

## Pendiente

Comprobado sobre `main` el 26 de septiembre:

- **2 temas sin práctica:** 3.1 «Sistemas de referencia y posición» y 3.5 «Ejemplo completo y controles» (claves del fuente).
- **`industrial6R`** conserva la muñeca desplazada de lado respecto del antebrazo (§10). Revisable.
- **Ramas.** El 26 de septiembre se cerró el PR #22 sin fusionar y se borraron todas las ramas remotas salvo `main` y `codex/geometria-y-notacion`, que se conserva a propósito (§5) hasta que Codex confirme que no le falta nada. La del #22 también se borró: su contenido está en `main` por el #23. Las ramas de un PR fusionado se pueden borrar al fusionarlo.
- **Exigir PR y CI en `main`:** ver «Protección de `main`».

**Decisiones abiertas del usuario** sobre el problema completo DH. El reparto de la nota (tabla 4, T 4, posición 2) está en `DH_CHAIN_PARTS`, y que una parte bien por arrastre reciba la nota entera está en `dhChainGrade`. Si su profesor puntúa de otra forma, cada cosa se cambia en una línea.

**Propuestas del 26 de septiembre que el usuario aún no ha pedido**, en el orden en que se le recomendaron:

- Ejecutar en el CI las 42 autopruebas que necesitan navegador. Hoy solo corren abriendo la página; `check-modeled-plates` ya usa `playwright` y podría servir de base.

---

# Historial

Lo que sigue es el registro en el orden en que se escribió: primero las revisiones de Codex, de la más reciente a la más antigua; después el diario de Claude, en orden cronológico.

---

# Revisión 3.42.0 · muñeca sin numeración y detalle mecánico

Parte de `main` a3de312 (3.41.1). Publicar en la misma GitHub Pages.

- Petición explícita: quitar la numeración del mecanismo. Desaparecen los rótulos 1–6; se mantienen cotas de longitud y, en asignación DH, marco base y sentidos positivos de los ejes. Se actualizan la leyenda, descripción y pruebas de ese contrato.
- La muñeca esférica deja de compartir una sola carcasa: alojamiento de entrada, horquilla abierta con dos mejillas, pivote transversal y acople de salida. Los tres cojinetes están sobre las rectas DH originales y sus orígenes siguen concurrentes. No se cambian tablas, posturas ni resultados.
- Se ofrece debajo una ampliación fija de la muñeca/pinza en los modelos concurrentes. No contiene números, marcos locales ni desarrollo de la respuesta.
- RRRP: cuello de transición en la unión al cojinete, camisa hueca de cuatro paredes y borde de salida con apertura definida. La ampliación muestra exclusivamente el extremo de la camisa, corredera y pinza, también en posturas plegadas. El TCP sigue entre las puntas y q4 conserva su significado.
- El renderizador incluye el material de la horquilla y omite la sombra de pedestal en las ampliaciones. Se conserva alternativa SVG y caché limitada.

Validación: pruebas geométricas de ejes concurrentes y TCP, 72 láminas, 480 ejercicios DH; 18 casos WebGL sin red a 390/1280 px incluyendo ampliaciones sin numeración y sin desbordamiento. Capturas reales de posturas extendidas/plegadas revisadas. Se conserva la política de contenido y las fuentes integradas de las revisiones anteriores.

---

# Revisión 3.41.1 · fuentes compatibles con la política de contenido

Tras integrar el 3D (#21), Claude publicó la política CSP en #23 (3.41.0). La prueba real de las 18 láminas detectó once fuentes KaTeX todavía referidas a `fonts/` que no existen en el repositorio y que `font-src data:` bloquea. Se incorporan los WOFF2 originales de KaTeX 0.18.1 al HTML, igual que el resto de fuentes. No se relaja la política. La prueba de seguridad comprueba todas las declaraciones de fuentes; la de navegador exige cargarlas con la red bloqueada. El modelo 3D y las correcciones de Claude se conservan.

---

# Revisión 3.40.0 · modelado 3D de las láminas

Parte de `main` fca0aa0. Destino: https://said-rosa.github.io/robotutor-laboratorio-visual/ .

- Las láminas de cinemática directa y asignación DH usan mallas reales, profundidad WebGL, iluminación, materiales, cantos redondeados y sombra suave de apoyo. Se mantiene una postura fija. La misma cámara ortográfica proyecta el modelo y sus cotas SVG; no se alteran matrices, ángulos ni respuestas.
- Revolutas con cuerpos cilíndricos y tapas; prismáticas con guía oscura y corredera clara. Se corrigió la orientación de las cuatro paredes de la camisa RRRP: sus secciones comparten ahora una base ortonormal. Se corrigió también la perpendicularidad de los dedos de la pinza respecto de su avance.
- Pedestal debajo del cojinete, muñeca concurrente más compacta y herramienta proporcionada al tramo final para evitar que la carcasa oculte la pinza. La cámara DH penaliza las vistas que superponen los dos dedos. E sigue señalando el punto medio de sus extremos.
- No se añaden ejes ni números a cinemática directa. Asignación DH conserva exclusivamente el marco base y los sentidos/números articulares necesarios para resolverla.
- Three.js 0.185.0 se incorpora al HTML con licencia MIT. `scripts/mechanical-renderer.mjs` es el fuente legible del motor; `npm ci && npm run build:plates` regenera su bloque. Un solo contexto WebGL, caché máxima de ocho imágenes y liberación de recursos GPU por render. Sin WebGL se conserva el dibujo vectorial.
- Validación: 18 láminas WebGL en Chrome a 390/1280 px con red bloqueada; cotas alineadas, sin desbordamiento, reglas de ejes, caché y alternativa SVG. Capturas revisadas. 393/393 autopruebas reales; 72 láminas geométricas, 480 casos DH, 9.570 ejercicios y 36 soluciones. Se verificó otra vez el flujo de errores/solución/reintento/resize y la protección de Examen. No se probó en un iPhone físico.

---

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

*(Superado desde 3.38.0: el único destino es GitHub Pages.)* La publicación habitual en https://robotutor-laboratorio-visual.rainy-jay-3988.chatgpt.site usa una copia de la misma fuente validada y un servicio separado de GitHub Pages. Una fusión de Claude en GitHub no actualiza por sí sola ese servicio: Codex debe recuperar esos cambios antes de su siguiente publicación. No hay sincronización permanente ni comunicación directa entre agentes configurada por este PR.

---

# Pendiente de revisión · Codex

Añadido por Claude el 8 de septiembre de 2026, sabiendo que Codex no estaría disponible durante cinco días. Esta sección lista lo que se hizo en su ausencia y lo que conviene que revise al volver.

**Actualizado el 17 de septiembre de 2026: todo lo de abajo ya está fusionado en `main` y publicado.** La versión en vivo era entonces la **v3.37.0**; la actual está en «Estado actual». Cuando se escribió esta sección nada estaba fusionado; esa frase quedó obsoleta y se corrige aquí para que no engañe.

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

- Generador `makeDhAssignment`: brazo articulado de 3 ejes, tabla canónica `[{a:0,α:90,d:H,θ:q₁},{a:L₂,α:0,d:0,θ:q₂},{a:L₃,α:0,d:0,θ:q₃}]`. Respuesta de tipo `matrix` con `matrixLayout:"dh"`, que `renderExercise` pinta como tabla con cabeceras `i · aᵢ(m) · αᵢ(°) · dᵢ(m) · θᵢ(°)` *(desde 3.45.0, θ · d · a · α)*. Las celdas conservan la clase `.cell` y el orden por filas, así que la calificación no se tocó.
- Modo `bare` en `cleanMechanismSvg`: fuera la leyenda `d₁, a₂, a₃, d₄, a₅=0, d₆` —que **era la respuesta**— y fuera el panel de marcos ya asignados. Quedan el mecanismo, las articulaciones numeradas, la recta del eje de giro de cada una, cotas con nombre mecánico neutro (H, L₂, L₃) y el marco base, dibujado al pie del robot y más grande, porque aquí no es una referencia: es el único dato.
- `diagnoseCell` nombra el parámetro: «**α2**: esperado 0, ingresado 90» en vez de «Celda (2,2)». Confundir aᵢ con dᵢ es el error que el ejercicio persigue.
- La convención va fijada en el enunciado (`DH_ASSIGN_CONVENTION`). **Decisión deliberada:** una asignación DH no es única, y sin fijar z₀ y el apoyo de xᵢ el programa marcaría como error tablas perfectamente válidas.
- `kinematics` se guarda **solo en `params`**, no en el ejercicio, para que `buildPedagogyTrace` devuelva `source:"verified-output"` y el banco de trabajo por etapas no se muestre. Si aparece, delata la respuesta. *(Desde 3.44.0 se abre, con trazo propio, solo después de resolver la tabla.)*
- El tema 4.3 gana un ejemplo resuelto espacial. El único que había era un 2R plano, donde todos los ejes salen del papel y nunca aparece una torsión.

**Dos autopruebas se rompieron al añadir el generador, sin que fallara ninguna comprobación real.** Exigían un mínimo de muestras de un sorteo aleatorio, y un generador más diluye ese sorteo: `conBloque` bajaba de >15 a 10–14. Se midió en cinco desplazamientos de la secuencia para confirmar que las aserciones de fondo siempre pasaban, y se reescribieron de forma determinista (llamando a los generadores por nombre y consultando `topicChoicePool` / `topicNumericGenerators` directamente), el mismo tratamiento que ya se dio a la de SO(3) en el #3.

**Estado: 394/394.** Verificado en la página publicada, sin errores de consola.

### Lo que se dejó fuera a propósito

El brazo de **seis ejes con muñeca esférica**. Las torsiones α₄ y α₅ dependen de detalles del dibujo que un esquema no fija sin ambigüedad, y prefiero resolver eso antes que soltar un ejercicio capaz de marcar como error una tabla correcta. **Si tienes criterio sobre cómo fijar esa muñeca sin sobrecargar la lámina, es el mejor sitio donde ayudar.**

Queda también la variante encadenada que describió el usuario: tabla DH + matriz homogénea + coordenadas del efector final en un mismo ejercicio, usando el banco de trabajo por etapas como paso obligatorio y calificado. *(3.44.0 añadió la cadena como práctica opcional; sigue sin calificarse.)*

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


`APP_VERSION` se quedó en 3.34.0 durante los PR #8, #9 y #10, y se subió a 3.35.0 al ponerlo al día. Desde entonces: **3.36.0** con el PR #14 y **3.37.0** con el #16. Las versiones posteriores tienen su propia entrada; la vigente está en «Estado actual».

## Nota sobre las cuentas de GitHub

Codex y Claude operan con la misma cuenta (`Said-Rosa`), así que GitHub no permite «solicitar cambios» de forma  formal en el PR del otro: las revisiones van como comentarios. Si interesa la señal formal de aprobación, habría que dar a uno de los dos una cuenta propia.


## 3.41.0 · Política de contenido y la única entrada de texto ajeno (Claude)

PR #23. El primer intento, el #22, chocaba con todo el fichero tras los PR #19 a #21, y los cambios se rehicieron sobre `main`. El #22 quedó abierto por error (ver «Pendiente»).

El modelo de amenaza es estrecho: sin servidor, sin cuentas y sin base de datos, el progreso vive en el `localStorage` de cada alumno. Lo que sí podía pasar es que entrara texto de fuera y se interpretara como marcado. Había una vía, y se reprodujo antes de tocar nada: al importar un progreso mal formado, el mensaje de `JSON.parse` —V8 copia dentro un trozo literal del archivo, con sus `<` y `>`— acababa en `innerHTML`. Ahora `feedback` escapa por defecto y solo la pista pide `{html:true}`.

- El formato de examen era la única cadena del archivo que se guardaba tal cual. Se limpia a `[a-z0-9_-]`. **No se compara contra `EXAM_FORMATS` porque se declara después de `loadProgress()`**: leerla ahí rompía el arranque.
- Un archivo de más de 2 MB se rechaza antes de analizarse.
- Política de contenido por `meta` y `referrer: no-referrer`. `frame-ancestors` necesitaría una cabecera HTTP, que GitHub Pages no permite.
- `check-security.cjs` distingue el código de la aplicación de los paquetes embebidos: en KaTeX, `fetch` es también el nombre de un método de su analizador.
- En el mismo PR entró `.gitattributes` (LF). Después se creó la regla «Proteger main». Ambas cosas se explican en «Estado actual».

Codex completó el trabajo en 3.41.1, incrustando las fuentes de KaTeX que `font-src data:` bloqueaba.

## 3.43.0 · Vista única y variedad de arquitecturas (Codex)

Petición actual del usuario: poder identificar el robot a partir de una única figura, como en el parcial, sin depender de la ampliación de la muñeca introducida en 3.42. Se retira esa segunda lámina de las fichas. La muñeca esférica mantiene sus ejes concurrentes, pero gana separación física entre el alojamiento de entrada, la horquilla y el acople de salida. La cámara evita ocultar el extremo detrás de los brazos. No hay números sobre las articulaciones.

`ROBOT_ARCHITECTURES` y `makeArchitectureExercise` añaden PPP, PPPRR, PPPRRR, RPP, RPPRRR, RRP, RRPR, RRR y 6R. La escena interpreta los tipos R/P: cojinetes para giro y camisas cuadradas con carros para desplazamiento. El SCARA conserva sus brazos horizontales y distingue su último giro del desplazamiento vertical. Todos usan el mismo motor DH; los generadores previos siguen en el banco.

Tres actividades en el selector del capítulo 4: identificar (familia, secuencia o movilidad), construir tabla DH y calcular posición. Las preguntas de identificación no muestran cotas, ejes, nombre del robot ni número de GDL antes de responder. DH conserva la base y los sentidos de los ejes para fijar la convención; se declara el cierre del marco final. Las soluciones completas continúan apareciendo después del intento y permanecen bloqueadas en examen.

Validación nueva: 324 casos de arquitectura con fórmulas independientes para PPP, RPP, RRP y SCARA, movilidad de 3–6 ejes, coincidencia del TCP con la pinza y reglas R/P. El chequeo opcional de navegador cubre ahora 72 láminas antiguas y nuevas, sin red, a 390/1280 px, y exige una sola imagen. Se mantienen las suites previas de geometría, ejercicios, seguridad y autopruebas.

## 3.44.0 · De la tabla DH a T y los dieciséis pasos (Claude)

Petición del usuario: que la tabla DH siga con ⁰A₁, ¹A₂, … y que la teoría recoja los dieciséis pasos D-H del libro (*Fundamentos de robótica*, §4.1.2).

**Ejercicio.** Los ejercicios `kind:'dh-assignment'` —3R, 6R y todas las arquitecturas de `makeArchitectureExercise(…,'dh')`— terminaban en la tabla; las matrices solo existían en la solución, para leerlas. Ahora el banco de etapas les pide ⁰A₁ … ⁿ⁻¹Aₙ (D-H 14) y una etapa final T (D-H 15); al acertar T el mensaje da la lectura de D-H 16. El trazo es propio (`dhMatrixTrace`), y el banco lo pide con `stageTrace(e)` en lugar de leer `pedagogyTrace`.

Lo que conviene no romper:

- **El banco se abre después de la tabla** (`dhMatrixStagesUnlocked`: `practiceSolved || solutionSeen`). Cada ⁱ⁻¹Aᵢ contiene su fila de la tabla; abrirlo antes regalaría la respuesta. Se respeta así vuestro «never expose a solved trace».
- **`pedagogyTrace` de estos ejercicios sigue siendo la tabla.** Una autoprueba lo vigila.
- **`firstCapturedStageDifference` devuelve `null` en los DH.** El caso real es el SCARA: su tabla es 4×4, el trazo general la toma por una matriz con una etapa, y sin la guarda un fallo en ⁰A₁ se citaba como fallo de la tabla.
- En examen el banco DH se oculta.

**Solución detallada.** Solo en `visual:'dhAssignment'`: títulos con su paso («Paso D-H 14 · Sustituir la fila 2»), notación ⁱ⁻¹Aᵢ y ⁰Aᵢ, y los productos se aplazan hasta tener todas las matrices, como en el libro (D-H 14 completo, luego D-H 15). El resto de ejercicios queda idéntico. **`check-worked-solutions.cjs` cambia en una línea:** el recuento de las 16 entradas por producto acepta `T₀i[r,c]` y `⁰Aᵢ[r,c]`; el recuento en sí no se relaja.

**Teoría.** En «Asignación de marcos DH» la lista de seis pasos pasa a ser la tabla de los dieciséis, en cuatro bloques y redactada con palabras propias. Las dos ideas de la lista antigua que el libro no trae —dibujar en postura de referencia y declarar la relación q↔θ/d— se conservan. Los temas se citan por su nombre: la aplicación renumera al mostrar, y «4.2» en el código es «4.3» en pantalla.

Se dejó sin tocar el **orden de columnas** (a, α, d, θ en la app; θ, d, a, α en los pasos). *Resuelto en 3.45.0: el usuario pidió el orden de los pasos.*

Batería 357/399, cinco autopruebas nuevas, dos de ellas comprobadas con mutaciones.

## 3.45.0 · Columnas DH en el orden de los pasos: θ, d, a, α (Claude)

Petición del usuario: las tablas DH con las columnas en el orden en que los pasos D-H 10 a 13 obtienen los parámetros, que es también el de los factores de ⁱ⁻¹Aᵢ. Antes eran a, α, d, θ.

**Una sola fuente.** `DH_COLUMNS` (junto a `ROBOT_ARCHITECTURES`) fija el orden. Todo lo lee de ahí: las respuestas de los tres generadores (`dhRowCells`), la tabla que rellena el alumno, `dhTableMarkup`, el diagnóstico por celda (`dhColumnLabel`) y la reconstrucción de filas (`dhRowFromCells`). **No indexéis columnas DH por posición:** usad `dhColumnIndex('a')` o `dhRowFromCells`. `check-kinematics` y `check-architectures` ya lo hacen así. Una autoprueba fija el orden a mano, para que un cambio en la lista no pase inadvertido.

**Exámenes guardados.** Un examen empezado con 3.44 guardaba la pregunta y lo tecleado en el orden viejo. `loadStoredExam` los migra con `migrateDhColumns`. Las preguntas nuevas llevan `dhColumns:'theta,d,a,alpha'`, y la ausencia de esa marca significa orden viejo. Comprobado con una recarga real de la página.

Cambiado también: las tres tablas escritas en la teoría, el ejemplo «(θ,d,a,α)=(90°,1,2,90°)», los chips de la cadena DH 3R, la línea de sustitución de la solución y el texto de cada fila en `makeArchitectureExercise`.

Hay dos autopruebas que reconstruían filas con `([a,alpha,d,theta])`, y habrían dejado de comprobar lo que decían; ahora van por nombre. Batería 360/402, tres pruebas nuevas, dos verificadas con mutaciones.

## 3.46.0 · Problema completo DH, calificado por partes (Claude)

Petición del usuario: el ejercicio de examen entero —tabla DH, matriz T y posición del efector— como una sola pregunta calificada por partes, también en Examen. Hasta 3.45 solo se calificaba la tabla, y las matrices eran práctica opcional.

- **Dónde aparece.** Cuarta opción del selector «Actividad» del capítulo 4 («Problema completo · tabla, T y posición»), práctica del tema «Asignación de marcos DH», y la rotación del capítulo, de donde salen también las preguntas de examen. El tamaño del robot sube con el nivel (`dhChainModel`): 3 ejes en los niveles 1 y 2, hasta 4 en el 3 y hasta 6 en el 4.
- **Cómo se puntúa.** Tabla 4, T 4, posición 2, **con arrastre**: un error de la tabla se cobra una vez. En práctica, las celdas bien por arrastre se pintan en ámbar (`.cell.carry`), no en rojo, y el aviso da la nota por partes. El informe del examen añade «Puntos por partes» y el desglose de cada pregunta; el historial muestra los puntos cuando difieren de los aciertos.
- **Dos trampas del examen, resueltas.** Una celda vacía anulaba la respuesta entera (`valor=null`): ahora esta pregunta se captura celda a celda. Y una celda en blanco cuyo valor correcto es 0 habría contado como acertada después de recargar (`null−0`); una autoprueba lo vigila.
- La solución escrita reutiliza la de la tabla DH y cierra con «Paso D-H 16 · Leer T y la posición». `check-worked-solutions` incluye ahora el problema completo (40 soluciones).

Comprobado en la página real: selector, tabla con un error y el resto coherente (6/10, celdas en ámbar, solución abierta), examen respondido solo con la tabla (0,4 puntos), informe, historial y recarga. Seis autopruebas nuevas; tres verificadas con mutaciones.

## 3.47.0 · Desarrollo escrito para las 15 familias que no lo tenían (Claude)

Petición del usuario. Al fallar una de estas familias, el botón de solución decía «Sin desarrollo escrito». Ahora ninguna familia practicable queda así, y `check-exercises` lo exige de aquí en adelante.

- **Cadenas «tipo parcial», numéricas** (`narrative_fixed`, `_mobile`, `_mixed`, `_point`, `_inversePoint`). La solución se escribe con las mismas piezas que las cadenas 3.6 y 3.7 (`chainSideBreakdown`, `chainProductText`) y añade la matriz de cada operación, el acumulado tras cada una y, si se pide un punto, el cambio de coordenadas, con T⁻¹ construida con Rᵀ y −Rᵀp.
- **Cadenas simbólicas** (`narrative_symbolic_*`). Las mismas etapas, con las matrices escritas en la sintaxis de las casillas (alpha, cos(…)), porque es así como se teclea la respuesta. Cierra con una comprobación por casos particulares.
- **Área de trabajo simbólica de tres eslabones** (`workspace_symbolic_three_*`): radio exterior, interior (eslabón dominante o disco), la reducción a un 2R con el teorema del coseno cuando q₃ está bloqueado, y una comprobación con las longitudes de ejemplo del propio ejercicio.
- Dos explicaciones «por qué se resuelve así» nuevas (`narrative`, `workspace_symbolic_three`).
- **La primera línea de cada paso se inserta como HTML**: estos textos evitan el signo menor que.

Las autopruebas contrastan lo escrito con algo independiente. Las cadenas se recalculan aplicando cada operación en coordenadas del mundo, con Rodrigues para los giros sobre ejes móviles y sin usar la regla fijo/móvil. Los radios del área de trabajo se contrastan barriendo las articulaciones del brazo. No se evalúan expresiones con `Function`, porque la política de contenido lo prohíbe. Tres autopruebas nuevas; tres mutaciones detectadas (el signo del teorema del coseno, la regla fijo/móvil y las casillas).

## 3.48.0 · Repetición espaciada (Claude)

Petición del usuario. «Temas por reforzar» decía qué flojeaba, pero nada volvía a ponerlo delante.

- **Qué vuelve.** El tema fallado, con un ejercicio nuevo generado para ese tema y preferentemente de la familia fallada (se recuerdan hasta tres). No se repite el mismo ejercicio: con los mismos números se entrenaría la memoria de la respuesta, no el método.
- **Cuándo.** Al día siguiente y, mientras se acierte sin ayuda, a los 3, 7, 14 y 30 días (Leitner). Tras el último acierto sale de la agenda. Un fallo la devuelve a mañana. Se cuenta por días de calendario, desde medianoche.
- **Dónde.** Un aviso «Repaso de hoy» en Practicar cuando algo vence, con «Repasar ahora». Durante el repaso, el aviso dice en qué paso está y, al responder, cuándo vuelve. La barra de progreso muestra la agenda completa. Nada se inserta solo en la práctica: el repaso se pide.
- La fila «Repetición espaciada» sale de «Mejoras futuras».

**Prueba inestable corregida.** La autoprueba de las cadenas «tipo parcial» (3.47) comparaba con 1e-9, pero las respuestas van redondeadas: fallaba en torno a una ejecución de cada tres sin que nada estuviera mal. Medido en 20.000 casos, el redondeo desvía como mucho 1,5e-5 y el error que la prueba debe cazar (la regla fijo/móvil al revés), como poco 0,29. Ahora usa 1e-3, y sigue detectando ese error.

Comprobado en la página real, con clics: fallar programa el tema para mañana; tras adelantar la fecha y recargar aparece «Repaso de hoy»; «Repasar ahora» sirve un ejercicio nuevo de la misma familia; acertarlo lo lleva a «vuelve en 3 días». Cinco autopruebas nuevas, con fechas fijas; cuatro mutaciones detectadas (adelantar al acertar pronto, contar por horas en vez de por días, importar temas inexistentes y la regla fijo/móvil con la tolerancia nueva).

## 3.49.0 · Cinemática directa por D-H: noap, el peldaño que faltaba y un aviso roto (Claude)

Petición del usuario: mejorar, rediseñar y rectificar la cinemática directa por D-H, con la notación **noap** que usa su profesor. Una auditoría del capítulo 4, generando ejercicios reales de cada tema, dio tres defectos.

- **noap no aparecía en ningún sitio.** T se describía como «bloque de rotación y cuarta columna». Ahora el tema «Denavit–Hartenberg» explica T = [n o a p] y qué es cada vector; el paso D-H 16 lo nombra; el problema completo rotula las columnas de T y llama `px`, `az`… a sus celdas; y las soluciones lo usan.
- **«Denavit–Hartenberg» no tenía cálculo en los niveles 1 y 2.** Nuevo `makeDhRowMatrix`: de una fila de la tabla a su matriz ⁱ⁻¹Aᵢ (D-H 14), en los cuatro niveles. Reconoce dos errores típicos (θ↔α y a↔d). No lleva `kinematics`, para que el banco de etapas no pida como etapa la propia respuesta.
- **La inversa del 2R estaba archivada en «Asignación de marcos DH»**, y los temas de cinemática inversa no ofrecían ni un ejercicio de cálculo. Ahora vive en su tema (clave 4.4 del fuente).

**Regresión corregida, publicada desde 3.41.** Al hacer que `feedback()` escapara por defecto se dijo que solo una llamada necesitaba marcado. Eran cuatro. El aviso de respuesta incorrecta, con su lista de diferencias, y la razón de los verdadero/falso se mostraban con las etiquetas escritas tal cual. No se vio porque en los ejercicios de lámina ese aviso se sustituye por otro. Corregido, y `check-security` falla ahora si un aviso con marcado no pide `{html:true}`, o si lo pide junto a un mensaje de error.

Comprobado en la página: el ejercicio nuevo y su diagnóstico, los rótulos alineados sobre T, la teoría, el aviso de fallo y la razón de un verdadero/falso. Tres autopruebas nuevas: la matriz de una fila contra el producto de sus cuatro movimientos elementales, y n = o × a sobre las T del motor. Tres mutaciones detectadas. Los scripts auxiliares de mutación ya no están en la carpeta temporal: `node scripts/check-selftests.cjs <ruta>` sirve para lo mismo.

## 3.50.0 · Cinemática inversa por el método de la matriz homogénea (Claude)

Petición del usuario: ejercicios de cinemática inversa con el criterio de los anteriores y con **noap**, que es como la explica su profesor. Los dos temas de cinemática inversa solo tenían preguntas de concepto.

- **Ejercicio.** Se da el robot (lámina y tabla DH con q₁…qₙ sin valor) y la localización T = [n o a p]; se piden las coordenadas articulares. Cinco robots, de menos a más: cartesiano y cilíndrico (niveles 1–2), polar (2–3), SCARA y antropomórfico (3–4). Está en el selector «Actividad» («Cinemática inversa · de T a las articulaciones»), en la práctica del tema y en la rotación del capítulo, de donde salen las preguntas de examen.
- **Corrección.** Por articulación, y aceptando cualquier solución que reproduzca T. En examen se captura celda a celda, como el problema completo DH, y suma a los puntos por partes.
- **La orientación importa.** En el polar o = (−s₁, c₁, 0); en el antropomórfico a = (s₁, −c₁, 0), y además n_z = s₂₃ y o_z = c₂₃ dan q₂ + q₃ sin la ambigüedad del codo. El desarrollo escrito lo usa para elegir entre los candidatos que deja la posición.
- **Teoría.** En «Cinemática inversa»: el método en cinco pasos, con el robot polar resuelto y la explicación de para qué sirve la orientación.
- **`scripts/check-inverse.cjs`**, nuevo y en el CI: 800 ejercicios por ejecución. Rehace la cinemática directa con los cuatro movimientos elementales de cada fila, sin el motor, y comprueba que cada solución reproduce T, que las ecuaciones del desarrollo se cumplen, la calificación y que la lámina no delata la respuesta.

Dos defectos encontrados al verificar 3.000 ejercicios en local, corregidos antes de publicar: la postura de referencia del cartesiano coincidía a veces con la respuesta, y con el codo estirado el redondeo de T daba dos soluciones de ±0,01° que son la misma.

Comprobado en la página con clics: el selector, una respuesta con el otro codo y una articulación mal (3 de 4, sin revelar el valor), su corrección, la solución, la teoría y el examen. Cuatro autopruebas nuevas; cuatro mutaciones detectadas. La de las prismáticas negativas no mordía en su primera versión, porque quien rechazaba esa respuesta era la orientación; se reescribió.

## 3.51.0 · El libro del curso como criterio: tres métodos de inversa y desacoplo de la muñeca (Claude)

Petición del usuario: el libro principal es *Fundamentos de robótica* (Barrientos); de los cinco PDF que envió antes hay que tomar lo que se relacione con él y llevarlo a la teoría y a la práctica, y usar n, o, a y p cuando lo usa el libro. Se leyó el capítulo 4 entero, que venía escaneado.

**Cuándo usa el libro n, o, a y p.** En la directa, T = [n o a p] es el resultado. En la inversa depende del método: el geométrico parte solo de la posición; el de la matriz homogénea parte de T, pero con un robot de tres ejes despeja todo de la cuarta columna; y el desacoplo cinemático los necesita de verdad, a para el centro de la muñeca y [n o a] para sus tres giros.

- **Rectificación de la 3.50.** Exigía la T completa también a los robots de tres ejes, así que rechazaba el otro codo del antropomórfico y la otra postura del polar. Ahora vale cualquier postura que alcance la posición. El antropomórfico pasa al método geométrico, con p como dato; los demás siguen con T. El SCARA, con cuatro ejes, sigue exigiendo la orientación.
- **Desacoplo cinemático**, nuevo: «centro de la muñeca» y «giros de la muñeca», en el selector («Desacoplo cinemático · muñeca de seis ejes»), en la práctica del tema y en la rotación del capítulo.
- **Desfases**, nuevo: filas con θ = q ± 90° en «De una fila de la tabla a su matriz».
- **Teoría.** «Cinemática inversa»: tabla de los tres métodos y el papel de n, o y a en cada uno, método geométrico del robot articular, la inversa de una matriz homogénea, el polar con sus dos premultiplicaciones y el desacoplo paso a paso. «Denavit–Hartenberg»: los dos ejemplos del libro, el cilíndrico de cuatro grados de libertad con su T y el de seis ejes con θ₃ − 90°.
- **De los otros PDF** entró lo que coincide con el libro: las dos soluciones del 3R (Ramírez), el centro de la muñeca como p menos la longitud del último eslabón por a (tesis del Stanford) y que con tres grados de libertad solo se impone la posición (Williams). El planar 3R con orientación y el DH modificado de Craig no son del libro y no se tocaron.
- **Errata del libro.** En las ecuaciones de la muñeca, el elemento (2,3) de ³R₆ aparece como −s₄c₅; multiplicando sus propias matrices sale s₄s₅. La teoría lo avisa y propone comentarlo con el profesor.
- **Prueba inestable, arreglada de paso.** «El tiempo se acumula en la pregunta donde se está» usaba el reloj de verdad con medio segundo de margen: lo que tardaba en pintarse cada pregunta se cargaba a la anterior, y con la máquina ocupada fallaba una de cada treinta veces. Ahora detiene el reloj y compara exacto. No era de este cambio, pero podía tumbar el CI al azar.

Verificación: `check-inverse.cjs` ampliado (criterio escrito aparte, sin preguntarle a la aplicación; 19.600 ejercicios en local), seis autopruebas nuevas o reescritas, nueve mutaciones detectadas, batería 385/427 sin navegador y 427/427 en la página. Con clics: el otro codo y la otra postura del polar se aceptan, el SCARA con la herramienta mal girada da 3 de 4, las dos partes del desacoplo, la teoría y el examen.

## 3.52.0 · Enunciados breves (Claude)

Petición del usuario, con una captura de «Construir la tabla DH» del SCARA y su párrafo de ocho líneas: «no asignes tanto texto, solo los datos, no explicando todo el ejercicio».

- El enunciado queda en una frase («Asigna los marcos y completa la tabla DH del robot mostrado.») y los datos, en las fichas. Faltaba la de H en el SCARA, el polar y los cartesianos con muñeca: se añadió.
- El convenio DH, cómo está montado el mecanismo, la regla para cerrar la tabla y la puntuación del problema completo pasan a `notes`, plegado. Siguen haciendo falta para que la tabla tenga una sola respuesta.
- Mismo tratamiento para la asignación de marcos 3R y 6R, el problema completo, la cinemática directa por arquitectura, la inversa y las dos partes del desacoplo.
- De paso: «UI selecciona visual correcto» fallaba si el ejercicio en pantalla era de asignación de marcos, porque su condición no los contaba. No era de este cambio.

Verificación: batería 386/428 sin navegador y 428/428 en la página, también con un ejercicio de tabla DH en pantalla; una autoprueba nueva y cuatro mutaciones detectadas; todos los controles del CI en local. En la página, el ejercicio de la captura: una frase, el plegable cerrado y ocho fichas.

## 3.53.0 · Cinemática inversa completa (Claude)

Petición del usuario: otra actividad con la cinemática inversa entera, «primero resolver por método D-H y luego aplicar cinemática inversa».

- **Actividad nueva**, en el selector («Cinemática inversa completa · tabla DH y articulaciones»), en la práctica del tema y en la rotación del capítulo. Parte 1: asignar marcos y completar la tabla DH del mecanismo dibujado. Parte 2: con esa tabla, las coordenadas articulares que llevan el extremo a T = [n o a p], o al punto p en el antropomórfico. Los cinco robots de la inversa.
- **Nota por partes:** tabla 5 y articulaciones 5, estas repartidas una a una. Un error de la tabla no se cobra dos veces. En examen suma a los puntos por partes.
- **Enunciado breve**, como pidió: la tarea en una frase y los datos en las fichas; el convenio, plegado.
- `check-inverse.cjs` cubre la actividad: la tabla pedida es la del mecanismo dibujado, la nota separa las dos partes y la postura de las fichas no regala ningún valor de la respuesta.

Encontrado al probar con clics: las fichas no se veían, porque los ejercicios de solo enunciado las ocultan; y en el cilíndrico, dos desplazamientos de la respuesta coincidían a veces con los de la postura dibujada. Corregidas las dos cosas.

Verificación: una autoprueba nueva y seis mutaciones detectadas (una, tras ampliar la prueba, que no la veía); batería 387/429 sin navegador y 429/429 en la página; en la página, una articulación mal (8,33 de 10), la otra postura del polar, y el examen con celdas en blanco (6,67 de 10, recuperadas al volver a la pregunta).

## 3.54.0 · Teoría: n, o, a, p y la inversa en el espacio, con ejemplos resueltos (Claude)

Petición del usuario: «en la teoría explica noap, da más detalles sobre resolver cinemática inversa (3D)». Solo teoría; ningún ejercicio cambia.

Todo en el tema «Cinemática inversa»:

- **n, o, a y p.** Qué es cada vector, con una figura de la pinza; que son direcciones y no puntos, que van expresados en la base y que n = o × a. Cómo escribir T a partir de una frase («entrando desde arriba, con los dedos cerrándose a lo largo de y») y cómo comprobar que una T está bien escrita.
- **Procedimiento en siete pasos** para un robot espacial, y una tabla con lo que queda en el plano tras fijar la base en cada uno de los cinco robots.
- **Tres ejemplos resueltos con números:** el brazo articulado por el método geométrico, con sus dos codos dibujados y las cuatro soluciones; el SCARA, donde q₄ solo sale de n; y el robot de seis ejes completo por desacoplo, de T a los seis ángulos.
- **Glosario:** «noap (n, o, a, p)», «Centro de la muñeca» y «Desacoplo cinemático».

Los números de los ejemplos están escritos a mano en la teoría. La autoprueba «Los ejemplos resueltos de la teoría de la inversa dan lo que dicen» los recalcula con el motor y comprueba además que el texto los cita: si alguien cambia un ejemplo, tiene que cambiar los dos sitios. La prueba busca el tema por su nombre, no por su número, porque el número en pantalla no es el de la clave.

Verificación: batería 388/430 sin navegador y 430/430 en la página, que incluye el dibujo de las dos láminas nuevas; 58 fórmulas del tema sin errores de KaTeX.

## 3.55.0 · Actividad de ecuaciones y solución completa de la inversa (Claude)

Petición del usuario, sobre «Cinemática inversa completa»: otra actividad con ecuaciones, y que la solución enseñe paso a paso cómo se saca todo.

- **Actividad nueva: «Cinemática inversa · ecuaciones del robot».** Se da la tabla DH con las articulaciones y las dimensiones como letras. Parte 1: las ecuaciones de la posición, px, py y pz, en función de las articulaciones. Parte 2: las articulaciones en función de la posición. Los cinco robots; en el SCARA entra también el giro de la herramienta, que sale de n. Cada ecuación se marca por separado, y en examen puntúa su fracción.
- **Cómo se corrige.** Dándole valores a la expresión, no comparando su forma: vale `atan(py/px)` donde se espera `atan2(py, px)`, la forma del libro para q₂ y q₃ del polar, senos desarrollados, subíndices y el menos tipográfico. Lo mal escrito no se da por malo: se dice qué no se entiende.
- **Solución de la inversa completa**, rehecha: antes listaba la tabla y saltaba a los números. Ahora razona cada fila, escribe las matrices con letras, las multiplica y solo después sustituye. La inversa sencilla gana también las matrices y T con letras.
- `check-inverse.cjs` evalúa cada ecuación esperada con JavaScript, no con el analizador de la aplicación, en posturas sorteadas y con las dimensiones de cada ejercicio; y comprueba que los dos evaluadores coinciden.

Verificación: tres autopruebas nuevas o ampliadas, nueve mutaciones detectadas, batería 390/432 sin navegador y 432/432 en la página; 13.200 ejercicios en local. Con clics: una ecuación mal escrita (aviso con el motivo), dos mal de ocho (señaladas, «6 de 8»), todas bien con las formas del libro, la solución y el examen (cinco de seis, 0,83).
