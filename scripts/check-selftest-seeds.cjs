/* Pasa la batería de runSelfTests con varias semillas distintas de la del CI.
 *
 * La batería va con semilla fija (SELFTEST_SEED), así que `check-selftests`
 * sortea siempre los mismos ejercicios: no falla al azar, y por eso mismo no
 * ve una prueba que solo pasa por casualidad. Esa prueba se rompe en cuanto
 * alguien añade otra delante —cambia cuántos sorteos se han consumido— y puede
 * salir en rojo en el navegador, donde las pruebas de interfaz consumen otra
 * cantidad de sorteos.
 *
 * Este guion ejecuta `check-selftests.cjs --semilla=N` con una lista fija de
 * semillas y falla si alguna prueba que no depende del DOM sale en rojo con
 * alguna. La lista es fija a propósito: el resultado es repetible, y un rojo
 * se reproduce con la semilla que se imprime.
 *
 * Que salga en cero no demuestra que una prueba sea sólida: una condición que
 * falla una vez de cada mil pasa casi siempre por aquí. Para eso, copiar sus
 * condiciones a un guion que use `sandbox.cjs` fuera de runSelfTests y
 * pasarlas sobre mil casos o más (HANDOFF, «La batería va con semilla fija»).
 *
 * Uso: node scripts/check-selftest-seeds.cjs [ruta/al/robotutor.html] [--semillas=24] [--procesos=N]
 */
const {execFile}=require('node:child_process');
const os=require('node:os'),path=require('node:path');

const argumentos=process.argv.slice(2);
const opcion=(nombre,porDefecto)=>{
 const texto=argumentos.find(a=>a.startsWith('--'+nombre+'='));
 if(!texto)return porDefecto;
 const valor=Number(texto.slice(nombre.length+3));
 if(!Number.isInteger(valor)||valor<1){console.error('--'+nombre+' espera un entero positivo');process.exit(2)}
 return valor;
};
const ruta=argumentos.find(a=>!a.startsWith('--'));
const cuantas=opcion('semillas',24);
const procesos=Math.min(cuantas,opcion('procesos',Math.max(1,(os.availableParallelism?os.availableParallelism():os.cpus().length)-1)));
/* Las mismas con las que se midió el 8 de octubre de 2026. Ninguna coincide con
   la del CI, que ya la cubre `check-selftests`. */
const semillas=Array.from({length:cuantas},(_,k)=>7919*k+13);
const guion=path.join(__dirname,'check-selftests.cjs');

function pasar(semilla){
 return new Promise(resolver=>{
  execFile(process.execPath,[guion,...(ruta?[ruta]:[]),'--semilla='+semilla],{maxBuffer:1<<24},(error,stdout,stderr)=>{
   /* `check-selftests` escribe cada rojo como «  · nombre  [error]». */
   const rojos=[...String(stderr).matchAll(/^ {2}· (.+?)(?: {2}\[.*\])?$/gm)].map(m=>m[1]);
   /* Un fallo sin rojos reconocibles es otra cosa (no arrancó, no encontró la
      constante): se enseña entero en vez de contarlo como una pasada limpia. */
   resolver({semilla,rojos,roto:error&&!rojos.length?String(stderr||error.message).trim():null});
  });
 });
}

(async()=>{
 const pendientes=[...semillas],resultados=[];
 await Promise.all(Array.from({length:procesos},async()=>{
  while(pendientes.length)resultados.push(await pasar(pendientes.shift()));
 }));
 const rotos=resultados.filter(r=>r.roto);
 if(rotos.length){
  console.error('La batería no llegó a ejecutarse con la semilla '+rotos[0].semilla+':\n'+rotos[0].roto);
  process.exit(1);
 }
 const porPrueba=new Map();
 for(const {semilla,rojos} of resultados)for(const nombre of rojos){
  if(!porPrueba.has(nombre))porPrueba.set(nombre,[]);
  porPrueba.get(nombre).push(semilla);
 }
 if(porPrueba.size){
  console.error(`Autopruebas que dependen de la semilla (${cuantas} semillas):\n`);
  for(const [nombre,lista] of [...porPrueba].sort((a,b)=>b[1].length-a[1].length)){
   lista.sort((a,b)=>a-b);
   console.error(`  · ${nombre}\n      ${lista.length} de ${cuantas} · semillas ${lista.join(', ')}`);
  }
  console.error('\nPara reproducir una: node scripts/check-selftests.cjs --semilla=N');
  console.error('Antes de tocar la prueba, mide sus condiciones sobre mil casos o más con sandbox.cjs: hay que saber si falla la prueba o el generador.');
  process.exit(1);
 }
 console.log(`Batería estable con ${cuantas} semillas distintas de la del CI: ninguna autoprueba fuera de las que dependen del DOM sale en rojo.`);
})();
