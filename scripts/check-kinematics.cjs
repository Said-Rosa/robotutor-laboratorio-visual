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
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');

const file=process.argv[2]||path.join(__dirname,'..','robotutor.html');
const source=fs.readFileSync(file,'utf8');
const scripts=[...source.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1]);
let main=scripts.find(s=>s.includes('const APP_VERSION='));
assert.ok(main,'no se encontró el script principal');
/* Se corta justo antes del arranque: a partir de ahí el script pinta la
   interfaz y genera el primer ejercicio, que sin DOM de verdad no tiene
   sentido. Todo lo anterior son declaraciones y enganches de eventos. */
const corte=main.indexOf('document.getElementById("appVersionLabel")');
assert.ok(corte>0,'no se encontró el arranque de la aplicación');
main=main.slice(0,corte);

/* Objeto camaleón: responde a cualquier propiedad y a cualquier llamada. Basta
   para los enganches de eventos del nivel superior, que es lo único que el
   script toca antes del arranque. */
const fake=()=>new Proxy(function(){},{
 get(t,k){
  if(k===Symbol.toPrimitive)return()=>'';
  if(k===Symbol.iterator)return function*(){};
  if(k==='then')return undefined;
  if(k==='length')return 0;
  if(k==='dataset')return{};
  if(k==='textContent'||k==='innerHTML'||k==='value'||k==='id'||k==='className')return'';
  if(k==='hidden'||k==='disabled'||k==='checked')return false;
  if(k==='children'||k==='options')return[];
  return fake();
 },
 set(){return true},apply(){return fake()},construct(){return fake()},has(){return true}
});
const almacen=new Map();
const ctx={console,Math,JSON,Date,Number,String,Boolean,Array,Object,Map,Set,WeakMap,WeakSet,Promise,Symbol,RegExp,Error,isNaN,isFinite,parseFloat,parseInt,
 setTimeout:()=>0,clearTimeout(){},setInterval:()=>0,clearInterval(){},queueMicrotask(){},requestAnimationFrame:()=>0,
 localStorage:{getItem:k=>almacen.has(k)?almacen.get(k):null,setItem:(k,v)=>almacen.set(k,String(v)),removeItem:k=>almacen.delete(k)},
 document:fake(),navigator:{userAgent:'node'},location:{href:'file:///robotutor.html'},performance:{now:()=>0},
 matchMedia:()=>({matches:false,addEventListener(){},addListener(){}}),getComputedStyle:()=>fake(),
 CustomEvent:function(){},Event:function(){},addEventListener(){},removeEventListener(){},dispatchEvent:()=>true,
 alert(){},confirm:()=>false,scrollTo(){},innerWidth:1280,innerHeight:900,devicePixelRatio:1,
 MutationObserver:function(){return{observe(){},disconnect(){},takeRecords:()=>[]}},
 ResizeObserver:function(){return{observe(){},disconnect(){}}},IntersectionObserver:function(){return{observe(){},disconnect(){}}},
 TextEncoder,TextDecoder,structuredClone};
ctx.window=ctx;ctx.globalThis=ctx;ctx.self=ctx;
const sonda='\n;globalThis.__probe={makeDhAssignment,makeDhAssignment6R,cleanMechanismSvg,KinematicsEngine,exerciseTopicKey,DIFFICULTY_LEVELS,spatialPostureIsPlausible,kinematicsCandidates,topicNumericGenerators,buildPedagogyTrace,solutionReasoningMarkup};\n';
vm.createContext(ctx);
new vm.Script(main+sonda,{filename:'robotutor-main.js'}).runInContext(ctx);
const P=ctx.__probe;

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

let generados=0;
for(const nivel of P.DIFFICULTY_LEVELS)for(let i=0;i<SORTEOS;i++){
 // ---- tres ejes (primera entrega) ----
 const e3=P.makeDhAssignment(nivel);generados++;
 const donde3='3R nivel '+nivel;
 assert.equal(e3.type,'matrix',donde3);assert.equal(e3.rows,3,donde3);assert.equal(e3.cols,4,donde3);
 assert.equal(P.exerciseTopicKey(e3),'4.3',donde3);
 const svg3=P.cleanMechanismSvg(e3.params.kinematics,{bare:true,dimensions:e3.params.dimensions}),r3=rotulosDe(svg3);
 assert.equal((svg3.match(/data-joint-arrow=/g)||[]).length,3,donde3+': debe haber una flecha por articulación');
 for(const n of ['1','2','3'])assert.ok(r3.includes(n),donde3+': falta la articulación '+n);
 for(const cota of e3.params.dimensions)if(cota)assert.ok(r3.includes(cota),donde3+': falta la cota '+cota);
 laminaHonesta(r3,donde3);

 // ---- seis ejes con muñeca esférica (segunda entrega) ----
 const e6=P.makeDhAssignment6R(nivel);generados++;
 const donde6='6R nivel '+nivel,k=e6.params.kinematics,pos=k.positions;
 assert.equal(e6.type,'matrix',donde6);assert.equal(e6.rows,6,donde6);assert.equal(e6.cols,4,donde6);
 assert.equal(P.exerciseTopicKey(e6),'4.3',donde6);
 /* Muñeca esférica: los tres últimos ejes se cortan en un punto, así que sus
    orígenes coinciden y entre ellos no hay distancia que recorrer. */
 assert.ok(dist(pos[3],pos[4])<1e-9&&dist(pos[4],pos[5])<1e-9,donde6+': los ejes de la muñeca no concurren');
 for(const fila of [3,4]){
  assert.equal(e6.answer[fila][0],0,donde6+': a'+(fila+1)+' debería ser 0 en una muñeca concurrente');
  assert.equal(e6.answer[fila][2],0,donde6+': d'+(fila+1)+' debería ser 0 en una muñeca concurrente');
 }
 assert.ok(Math.abs(dist(pos[5],pos[6])-e6.params.L6)<1e-9,donde6+': la herramienta no mide L6');
 assert.ok(P.spatialPostureIsPlausible(k),donde6+': la postura dibujada se hunde bajo el suelo');
 const svg6=P.cleanMechanismSvg(k,{bare:true,dimensions:e6.params.dimensions}),r6=rotulosDe(svg6);
 assert.equal((svg6.match(/data-joint-arrow=/g)||[]).length,6,donde6+': debe haber una flecha por articulación');
 assert.ok(r6.includes('4·5·6'),donde6+': los ejes concurrentes deben numerarse juntos · '+JSON.stringify(r6));
 for(const cota of ['H','L₂','L₃','L₆'])assert.ok(r6.includes(cota),donde6+': falta la cota '+cota+' · '+JSON.stringify(r6));
 laminaHonesta(r6,donde6);

 for(const par of [[e3,donde3],[e6,donde6]]){
  const e=par[0],donde=par[1];
  /* La tabla que se pide debe reproducir la cadena dibujada. */
  const filas=e.answer.map(f=>({a:f[0],alpha:f[1],d:f[2],theta:f[3]}));
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
 for(const f of ['2d','3d','area','concepto','jacobiano'])assert.ok(familias.has(f),'nivel '+nivel+': falta la familia '+f+' en el capítulo 4');
 assert.ok(P.topicNumericGenerators('4.3',nivel).length>=2,'nivel '+nivel+': el tema 4.3 se quedó sin generadores');
}
console.log('Asignación de marcos DH validada: '+generados+' ejercicios sorteados, láminas y tablas coherentes.');
