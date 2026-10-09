/* Repite autopruebas concretas muchas veces con el Math.random de verdad.
 *
 * Dentro de la batería, Math.random es un generador con semilla fija y cada
 * prueba ve siempre los mismos ejercicios. Aquí se ejecutan las pruebas que se
 * nombren, tal como están escritas en el archivo y con su mismo aislamiento,
 * pero sin fijar la semilla: cada repetición sortea ejercicios distintos. Una
 * prueba sólida da cero rojos en mil repeticiones; una que pasa por casualidad
 * enseña aquí cada cuánto falla.
 *
 * Dice si la prueba falla, no por qué. Para saber qué condición falla —y si la
 * equivocada es la prueba o el generador— hay que copiar sus condiciones a un
 * guion propio con `sandbox.cjs` y contarlas una a una.
 *
 * No va en el CI: su resultado cambia de una ejecución a otra.
 *
 * Uso: node scripts/repeat-selftests.cjs [ruta/al/robotutor.html] [--veces=1000] --prueba="Nombre exacto" [--prueba="Otro"]
 */
const assert=require('node:assert/strict');
const {cargar,RUTA_POR_DEFECTO}=require('./sandbox.cjs');

const argumentos=process.argv.slice(2);
const ruta=argumentos.find(a=>!a.startsWith('--'))||RUTA_POR_DEFECTO;
const nombres=argumentos.filter(a=>a.startsWith('--prueba=')).map(a=>a.slice('--prueba='.length));
const opcionVeces=argumentos.find(a=>a.startsWith('--veces='));
const veces=opcionVeces?Number(opcionVeces.slice('--veces='.length)):1000;
assert.ok(nombres.length,'falta --prueba="Nombre exacto de la autoprueba"');
assert.ok(Number.isInteger(veces)&&veces>0,'--veces espera un entero positivo');

/* Dos cambios en el texto que se evalúa, no en el archivo: la batería no fija
   la semilla y solo ejecuta las pruebas pedidas. Si esas líneas dejaran de
   escribirse así, mejor fallar que repetir otra cosa. */
const una=(fuente,busca,pon)=>{
 const hay=fuente.split(busca).length-1;
 assert.equal(hay,1,'runSelfTests ya no contiene «'+busca.trim()+'» una sola vez: hay que adaptar este guion');
 return fuente.replace(busca,pon);
};
const ajustar=fuente=>una(
 una(fuente,' familyFilterSuspended=true;\n beginDeterministicRun();\n',' familyFilterSuspended=true;\n'),
 'safeStorage.aislar(()=>tests.map(([name,test])=>',
 `safeStorage.aislar(()=>tests.filter(([name])=>${JSON.stringify(nombres)}.includes(name)).map(([name,test])=>`);

const {runSelfTests}=cargar(['runSelfTests'],ruta,ajustar);
/* La batería anuncia su resultado por consola en cada ejecución: aquí estorba. */
const registro={error:console.error,info:console.info};console.error=console.info=()=>{};
const rojos=new Map(nombres.map(nombre=>[nombre,{veces:0,errores:new Map()}]));
let vistas=null;
try{
 for(let i=0;i<veces;i++){
  const informe=runSelfTests();
  vistas=new Set(informe.results.map(r=>r.name));
  for(const r of informe.results)if(!r.ok){
   const cuenta=rojos.get(r.name);cuenta.veces++;
   if(r.error)cuenta.errores.set(r.error,(cuenta.errores.get(r.error)||0)+1);
  }
 }
}finally{Object.assign(console,registro)}

let mal=false;
for(const nombre of nombres){
 if(!vistas.has(nombre)){console.error(`  · ${nombre}\n      no hay ninguna autoprueba con ese nombre exacto`);mal=true;continue}
 const {veces:n,errores}=rojos.get(nombre);
 if(n)mal=true;
 console.log(`  · ${nombre}\n      ${n} rojos en ${veces} repeticiones${n?' ('+(100*n/veces).toFixed(1)+' %)':''}`);
 for(const [texto,cuantas] of errores)console.log(`      ${cuantas}× excepción: ${texto}`);
}
process.exit(mal?1:0);
