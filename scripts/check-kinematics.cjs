/* Comprobación sin navegador de los ejercicios de asignación de marcos DH.
 *
 * La batería de runSelfTests vive dentro de la página y necesita un DOM real,
 * así que solo se puede ejecutar abriendo el HTML. Este script carga el script
 * principal dentro de un vm con un DOM postizo y ejercita las funciones puras
 * —generadores y láminas—, que no necesitan interfaz.
 *
 * No sustituye a runSelfTests: no mira nada que dependa de la interfaz. Cubre
 * lo que un sorteo aleatorio solo destapa de vez en cuando. Escribiéndolo
 * apareció un caso real: la cota de la herramienta desaparecía cuando su eje
 * apuntaba hacia la cámara y el tramo quedaba escorzado por debajo del umbral
 * de rotulado, de modo que la lámina dejaba de nombrar un dato del enunciado.
 *
 * Uso: node scripts/check-kinematics.cjs [ruta/al/robotutor.html]
 */
const assert=require('node:assert/strict');
const {cargar,RUTA_POR_DEFECTO}=require('./sandbox.cjs');

const P=cargar(['makeDhAssignment','makeDhAssignment6R','dhColumnIndex','dhRowFromCells','KinematicsEngine','exerciseTopicKey',
  'DIFFICULTY_LEVELS','spatialPostureIsPlausible','kinematicsCandidates','topicNumericGenerators','mechanicalPlateSvg',
  'buildPedagogyTrace','solutionReasoningMarkup'],process.argv[2]||RUTA_POR_DEFECTO);

const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
const rotulosDe=svg=>[...svg.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map(m=>m[1].trim());
const SORTEOS=Number(process.env.SORTEOS||60);

function laminaHonesta(rotulos,donde){
 /* La lámina no puede nombrar parámetros DH ni dibujar marcos ya asignados:
    eso es justo lo que el ejercicio pide construir. */
 assert.ok(!rotulos.some(t=>/^(a|d|α|θ)[₀-₉0-9]/.test(t)),donde+': la lámina nombra un parámetro DH · '+JSON.stringify(rotulos));
 assert.ok(!rotulos.some(t=>/^[xz][₀-₉0-9]/.test(t)),donde+': la lámina dibuja una terna local ya resuelta · '+JSON.stringify(rotulos));
 for(const eje of ['X','Y','Z'])assert.ok(rotulos.includes(eje),donde+': falta el eje '+eje+' del marco base');
}
/* La cota de un tramo declarado debe llegar al dibujo. Un tramo de longitud
   nula no lleva cota: la muñeca esférica no separa orígenes. */
function cotasPresentes(rotulos,cotas,donde){
 for(const cota of cotas)if(cota)assert.ok(rotulos.includes(cota),donde+': falta la cota '+cota+' · '+JSON.stringify(rotulos));
}

let generados=0;
for(const nivel of P.DIFFICULTY_LEVELS)for(let i=0;i<SORTEOS;i++){
 // ---- tres ejes (primera entrega) ----
 const e3=P.makeDhAssignment(nivel);generados++;
 const donde3='3R nivel '+nivel;
 assert.equal(e3.type,'matrix',donde3);assert.equal(e3.rows,3,donde3);assert.equal(e3.cols,4,donde3);
 assert.equal(P.exerciseTopicKey(e3),'4.3',donde3);
 const svg3=P.mechanicalPlateSvg({...e3,kinematics:e3.params.kinematics}),r3=rotulosDe(svg3);
 assert.equal((svg3.match(/data-joint-axis="/g)||[]).length,3,donde3+': debe haber un eje dibujado por articulación');
 assert.ok(!r3.some(n=>/^[1-6]$/.test(n)),donde3+': el mecanismo debe estar sin numerar');
 cotasPresentes(r3,e3.params.dimensions,donde3);
 laminaHonesta(r3,donde3);

 // ---- seis ejes con muñeca esférica (segunda entrega) ----
 const e6=P.makeDhAssignment6R(nivel);generados++;
 const donde6='6R nivel '+nivel,k=e6.params.kinematics,pos=k.positions;
 assert.equal(e6.type,'matrix',donde6);assert.equal(e6.rows,6,donde6);assert.equal(e6.cols,4,donde6);
 assert.equal(P.exerciseTopicKey(e6),'4.3',donde6);
 /* Muñeca esférica: los tres últimos ejes se cortan en un punto, así que sus
    orígenes coinciden y entre ellos no hay distancia que recorrer. */
 assert.ok(dist(pos[3],pos[4])<1e-9&&dist(pos[4],pos[5])<1e-9,donde6+': los ejes de la muñeca no concurren');
 /* Las columnas se buscan por nombre: el orden lo fija la aplicación. */
 const colA=P.dhColumnIndex('a'),colD=P.dhColumnIndex('d');
 for(const fila of [3,4]){
  assert.equal(e6.answer[fila][colA],0,donde6+': a'+(fila+1)+' debería ser 0 en una muñeca concurrente');
  assert.equal(e6.answer[fila][colD],0,donde6+': d'+(fila+1)+' debería ser 0 en una muñeca concurrente');
 }
 assert.ok(Math.abs(dist(pos[5],pos[6])-e6.params.L6)<1e-9,donde6+': la herramienta no mide L6');
 assert.ok(P.spatialPostureIsPlausible(k),donde6+': la postura dibujada se hunde bajo el suelo');
 const svg6=P.mechanicalPlateSvg({...e6,kinematics:k}),r6=rotulosDe(svg6);
 assert.equal((svg6.match(/data-joint-axis="/g)||[]).length,6,donde6+': debe haber un eje dibujado por articulación');
 assert.ok(!r6.some(n=>/^[1-6]$/.test(n)),donde6+': el mecanismo debe estar sin numerar');
 cotasPresentes(r6,['H','L₂','L₃','L₆'],donde6);
 laminaHonesta(r6,donde6);

 for(const par of [[e3,donde3],[e6,donde6]]){
  const e=par[0],donde=par[1];
  /* La tabla que se pide debe reproducir la cadena dibujada. */
  const filas=e.answer.map(P.dhRowFromCells);
  const extremo=P.KinematicsEngine.serialDH(filas).positions.at(-1),dibujado=e.params.kinematics.positions.at(-1);
  for(const eje of ['x','y','z'])assert.ok(Math.abs(extremo[eje]-dibujado[eje])<1e-9,donde+': la tabla esperada no reproduce la lámina ('+eje+')');
  /* El banco de trabajo por etapas delataría la respuesta: no debe abrirse. */
  assert.notEqual(P.buildPedagogyTrace(e).source,'kinematics',donde+': el banco de etapas quedaría visible');
  assert.ok(P.solutionReasoningMarkup(e).trim(),donde+': sin ficha de racional');
 }
}
/* Añadir un generador no puede dejar sin representación a ninguna familia. */
for(const nivel of P.DIFFICULTY_LEVELS){
 const familias=new Set(P.kinematicsCandidates(nivel).map(c=>c.family));
 for(const f of ['2d','3d','concepto'])assert.ok(familias.has(f),'nivel '+nivel+': falta la familia '+f+' en el capítulo 4');
 assert.ok(P.topicNumericGenerators('4.3',nivel).length>=2,'nivel '+nivel+': el tema 4.3 se quedó sin generadores');
}
console.log('Asignación de marcos DH validada: '+generados+' ejercicios sorteados, láminas y tablas coherentes.');
