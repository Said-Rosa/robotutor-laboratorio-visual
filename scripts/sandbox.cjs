/* Carga el script principal de robotutor.html en un `vm` con un DOM postizo.
 *
 * La aplicación es un único HTML pensado para el navegador, así que sus
 * funciones no se pueden importar. Este módulo evalúa el script principal en un
 * contexto aislado y devuelve lo que se le pida, de modo que las comprobaciones
 * de `scripts/` puedan ejercitar la lógica real sin abrir un navegador.
 *
 * El DOM postizo responde a cualquier propiedad y a cualquier llamada. Alcanza
 * para los enganches de eventos del nivel superior, que es lo único que el
 * script toca antes de arrancar; el arranque en sí se recorta, porque pinta la
 * interfaz y no tiene sentido sin un DOM de verdad.
 */
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');

const RUTA_POR_DEFECTO=path.join(__dirname,'..','robotutor.html');

function elementoPostizo(){
 return new Proxy(function(){},{
  get(destino,prop){
   if(prop===Symbol.toPrimitive)return()=>'';
   if(prop===Symbol.iterator)return function*(){};
   if(prop==='then')return undefined;
   if(prop==='length')return 0;
   if(prop==='dataset')return{};
   if(prop==='textContent'||prop==='innerHTML'||prop==='value'||prop==='id'||prop==='className')return'';
   if(prop==='hidden'||prop==='disabled'||prop==='checked')return false;
   if(prop==='children'||prop==='options')return[];
   return elementoPostizo();
  },
  set(){return true},apply(){return elementoPostizo()},construct(){return elementoPostizo()},has(){return true}
 });
}

/* Devuelve las funciones y constantes que se nombren en `expone`, tal como el
   script principal las define. `file` admite una ruta alternativa para poder
   comprobar también la salida del build. */
function cargar(expone,file=RUTA_POR_DEFECTO){
 const source=fs.readFileSync(file,'utf8');
 const scripts=[...source.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1]);
 let main=scripts.find(s=>s.includes('const APP_VERSION='));
 if(!main)throw new Error('no se encontró el script principal en '+file);
 const corte=main.indexOf('document.getElementById("appVersionLabel")');
 if(corte<0)throw new Error('no se encontró el arranque de la aplicación');
 main=main.slice(0,corte);

 const almacen=new Map();
 const ctx={console,Math,JSON,Date,Number,String,Boolean,Array,Object,Map,Set,WeakMap,WeakSet,Promise,Symbol,RegExp,Error,isNaN,isFinite,parseFloat,parseInt,
  setTimeout:()=>0,clearTimeout(){},setInterval:()=>0,clearInterval(){},queueMicrotask(){},requestAnimationFrame:()=>0,
  localStorage:{getItem:k=>almacen.has(k)?almacen.get(k):null,setItem:(k,v)=>almacen.set(k,String(v)),removeItem:k=>almacen.delete(k)},
  document:elementoPostizo(),navigator:{userAgent:'node'},location:{href:'file:///robotutor.html'},performance:{now:()=>0},
  matchMedia:()=>({matches:false,addEventListener(){},addListener(){}}),getComputedStyle:()=>elementoPostizo(),
  CustomEvent:function(){},Event:function(){},addEventListener(){},removeEventListener(){},dispatchEvent:()=>true,
  alert(){},confirm:()=>false,scrollTo(){},innerWidth:1280,innerHeight:900,devicePixelRatio:1,
  MutationObserver:function(){return{observe(){},disconnect(){},takeRecords:()=>[]}},
  ResizeObserver:function(){return{observe(){},disconnect(){}}},IntersectionObserver:function(){return{observe(){},disconnect(){}}},
  TextEncoder,TextDecoder,structuredClone};
 ctx.window=ctx;ctx.globalThis=ctx;ctx.self=ctx;
 vm.createContext(ctx);
 const sonda='\n;globalThis.__expuesto={'+expone.join(',')+'};\n';
 new vm.Script(main+sonda,{filename:'robotutor-main.js'}).runInContext(ctx);
 return ctx.__expuesto;
}

module.exports={cargar,RUTA_POR_DEFECTO};
