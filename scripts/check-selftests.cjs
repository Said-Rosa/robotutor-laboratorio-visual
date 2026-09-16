/* Ejecuta la batería de runSelfTests fuera del navegador.
 *
 * La batería vive dentro de la página y buena parte de sus comprobaciones miran
 * la interfaz, así que en un DOM postizo no pueden pasar. Lo que sí se puede es
 * exigir que **no aparezcan fallos nuevos**: las que dependen del DOM están
 * listadas abajo una a una, y cualquier otra que falle detiene el CI.
 *
 * Esto no sustituye a abrir la página: las 42 listadas siguen necesitando un
 * navegador de verdad. Cubre las demás, que son la mayoría, y las cubre en cada
 * PR en vez de cuando alguien se acuerde de pulsar el botón.
 *
 * Si una comprobación de la lista empieza a pasar, no pasa nada: la lista marca
 * lo que se tolera, no lo que se espera. Si añades una comprobación que necesita
 * DOM de verdad, añádela aquí con su nombre exacto.
 *
 * Uso: node scripts/check-selftests.cjs [ruta/al/robotutor.html]
 */
const assert=require('node:assert/strict');
const {cargar,RUTA_POR_DEFECTO}=require('./sandbox.cjs');

/* Comprobaciones que leen la interfaz: miden elementos, consultan estilos
   calculados, animan o sincronizan mandos. Sin DOM real no pueden pasar. */
const DEPENDEN_DEL_DOM=new Set([
 'Abrir la aplicación no ejecuta la batería de verificación',
 'Antifraude bloquea auditoría antes del intento',
 'Arrastre de diana solo existe en el laboratorio',
 'Cambiar de tema repinta todo lo que lee colores',
 'Durante el examen la respuesta no aparece en ningún texto visible',
 'Durante el examen no se puede generar un ejercicio suelto',
 'Durante el examen no se ve la solución ni las pistas',
 'Ecuaciones LaTeX de la teoría llegan íntegras al renderizador',
 'El TCP lleva un solo rótulo, no dos superpuestos',
 'El aviso de comprobación se deja ver sin dejar estilos pegados',
 'El colocador de etiquetas resuelve zonas congestionadas',
 'El contenido del ejercicio sí puede desplazarse al entrar',
 'El enunciado con fórmula no estira la columna en pantalla estrecha',
 'El pie declara una única versión',
 'El recorrido puede limitarse a las preguntas marcadas',
 'El reloj entrega solo cuando se acaba el tiempo',
 'El tema cambia aunque la transición no exista o falle',
 'La altura del plegable cerrado es la de su resumen',
 'La barra del examen se ve exactamente cuando hay examen en curso',
 'La hoja de estilo contempla pantalla táctil y áreas seguras',
 'La lámina de marcos dibuja contenido real',
 'La medida aproximada de texto no se queda corta',
 'La vista de marcos rotula también el sistema del extremo',
 'Las autopruebas no animan nada',
 'Las láminas que piden las lecciones se dibujan todas',
 'Las puntas de las posturas límite caen sobre sus circunferencias',
 'Las vistas se atenúan sin transformarse',
 'Los cuatro niveles están declarados y nombrados',
 'Los lienzos interactivos no arrastran la página',
 'Los mandos del examen no hacen nada sin examen',
 'Lámina espacial separada en dos vistas',
 'Ninguna lámina fija del ejercicio queda sobre trama',
 'Ninguna vista se queda invisible ni transformada',
 'Píldora teórica inicia cerrada',
 'Sin movimiento la solución sigue abriéndose y cerrándose',
 'Solo se acerca lo que se abre por debajo del pliegue',
 'Solo se señalan las casillas erróneas cuando son unas pocas',
 'UI selecciona visual correcto',
 'UI sincroniza capítulo',
 'UI sincroniza teclado',
 'Un hueco de lámina con nombre inventado no rompe la lección',
 'Un plegable sigue abriéndose y cerrándose sin movimiento'
]);

const {runSelfTests}=cargar(['runSelfTests'],process.argv[2]||RUTA_POR_DEFECTO);
/* La batería vuelca sus fallos por consola. Aquí estorba: este script decide
   cuáles importan y los imprime él, con su motivo. */
const registro=console.error;console.error=()=>{};
let informe;try{informe=runSelfTests()}finally{console.error=registro}
assert.ok(informe&&informe.total>0,'la batería no devolvió resultados');

const inesperados=(informe.results||[]).filter(r=>!r.ok&&!DEPENDEN_DEL_DOM.has(r.name));
if(inesperados.length){
 console.error('Autopruebas en rojo que no dependen del DOM:\n');
 for(const r of inesperados)console.error('  · '+r.name+(r.error?'  ['+r.error+']':''));
 console.error('\nAbre robotutor.html y pulsa la insignia del pie para verlas en su entorno real.');
 process.exit(1);
}
const toleradas=(informe.results||[]).filter(r=>!r.ok).length;
console.log(`Batería ejecutada sin navegador: ${informe.passed}/${informe.total} · ${toleradas} dependen del DOM y se comprueban abriendo la página.`);
