/* Abre robotutor.html en un Chromium sin ventana y lo conduce.
 *
 * Las 43 autopruebas que miran la interfaz no pueden pasar en el DOM postizo de
 * `check-selftests`, y hasta ahora solo corrían cuando alguien abría la página
 * y pulsaba la insignia. Este guion las ejecuta en un navegador de verdad, y
 * sirve además para ver cómo queda un cambio: hace capturas.
 *
 * No usa playwright ni ningún otro módulo: habla con el navegador por su
 * protocolo de depuración, con el fetch y el WebSocket que trae Node (22 o
 * posterior).
 *
 * No va en el CI: necesita un Chromium instalado. Lo busca en CHROME_PATH, en
 * los navegadores de playwright y en las rutas habituales de Chrome y Edge.
 *
 * Uso:
 *   node scripts/headless.cjs --bateria [ruta/al/robotutor.html]
 *       Pasa la batería completa en el navegador y falla si alguna sale en rojo.
 *   node scripts/headless.cjs --guion=mi-guion.js [ruta] [--ancho=1200] [--alto=900]
 *       Ejecuta un guion propio. El archivo contiene una función asíncrona:
 *         async pagina => {
 *           const titulo = await pagina.eval(`return document.title`);
 *           await pagina.foto('captura.png');             // lo que se ve
 *           await pagina.foto('trozo.png', {x:0,y:0,width:800,height:2000});
 *         }
 *       `pagina.eval(js)` evalúa el cuerpo de una función asíncrona en la
 *       página y devuelve su valor; `pagina.espera(ms)` espera.
 *   Con --3d el navegador dibuja WebGL por software, y las láminas salen con
 *   el modelo 3D sombreado, como en pantalla. Sin él se ve el dibujo técnico de
 *   reserva, que es el que usa la página cuando no hay WebGL.
 */
const {spawn}=require('node:child_process'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');

const argumentos=process.argv.slice(2);
const opcion=(nombre,porDefecto)=>{const a=argumentos.find(x=>x.startsWith('--'+nombre+'='));return a?a.slice(nombre.length+3):porDefecto};
const ruta=argumentos.find(a=>!a.startsWith('--'))||path.join(__dirname,'..','robotutor.html');
const bateria=argumentos.includes('--bateria'),guion=opcion('guion',null);
const ancho=Number(opcion('ancho',1200)),alto=Number(opcion('alto',900));
if(!bateria&&!guion){console.error('Indica --bateria o --guion=archivo.js');process.exit(2)}

function buscaChromium(){
 const candidatos=[];
 if(process.env.CHROME_PATH)candidatos.push(process.env.CHROME_PATH);
 const playwright=process.env.LOCALAPPDATA?path.join(process.env.LOCALAPPDATA,'ms-playwright'):path.join(os.homedir(),'.cache','ms-playwright');
 try{
  for(const carpeta of fs.readdirSync(playwright).filter(n=>/^chromium-\d+$/.test(n)).sort().reverse())
   for(const interno of ['chrome-win64/chrome.exe','chrome-win/chrome.exe','chrome-linux/chrome','chrome-mac/Chromium.app/Contents/MacOS/Chromium'])
    candidatos.push(path.join(playwright,carpeta,interno));
 }catch{}
 candidatos.push('C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','/usr/bin/google-chrome','/usr/bin/chromium','/usr/bin/chromium-browser',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome');
 return candidatos.find(c=>{try{return fs.statSync(c).isFile()}catch{return false}});
}

const espera=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const ejecutable=buscaChromium();
 if(!ejecutable){console.error('No encuentro un Chromium. Define CHROME_PATH con la ruta de Chrome, Edge o Chromium.');process.exit(2)}
 const puerto=9300+Math.floor(Math.random()*500),perfil=fs.mkdtempSync(path.join(os.tmpdir(),'robotutor-headless-'));
 const navegador=spawn(ejecutable,['--headless',...(argumentos.includes('--3d')?['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']:['--disable-gpu']),'--no-sandbox','--hide-scrollbars',`--remote-debugging-port=${puerto}`,`--user-data-dir=${perfil}`,`--window-size=${ancho},${alto}`,'about:blank'],{stdio:'ignore'});
 const cierra=async()=>{navegador.kill();await espera(300);try{fs.rmSync(perfil,{recursive:true,force:true})}catch{}};
 let salida=0;
 try{
  let destino=null;
  for(let i=0;i<80&&!destino;i++){
   await espera(250);
   try{destino=(await (await fetch(`http://127.0.0.1:${puerto}/json`)).json()).find(t=>t.type==='page')}catch{}
  }
  if(!destino)throw Error('El navegador no arrancó');
  const ws=new WebSocket(destino.webSocketDebuggerUrl);
  await new Promise((ok,mal)=>{ws.onopen=ok;ws.onerror=()=>mal(Error('No pude conectar con el navegador'))});
  let n=0;const pendientes=new Map(),errores=[];
  ws.onmessage=m=>{
   const d=JSON.parse(m.data);
   if(d.id&&pendientes.has(d.id)){const [ok,mal]=pendientes.get(d.id);pendientes.delete(d.id);d.error?mal(Error(d.error.message)):ok(d.result)}
   else if(d.method==='Runtime.exceptionThrown')errores.push(d.params.exceptionDetails.exception?.description||d.params.exceptionDetails.text);
  };
  const manda=(metodo,params={})=>new Promise((ok,mal)=>{const id=++n;pendientes.set(id,[ok,mal]);ws.send(JSON.stringify({id,method:metodo,params}))});
  await manda('Page.enable');await manda('Runtime.enable');
  await manda('Emulation.setDeviceMetricsOverride',{width:ancho,height:alto,deviceScaleFactor:1,mobile:false});
  const url=/^https?:/.test(ruta)?ruta:'file:///'+path.resolve(ruta).replaceAll('\\','/');
  await manda('Page.navigate',{url});
  let lista=false;
  for(let i=0;i<120&&!lista;i++){await espera(250);lista=(await manda('Runtime.evaluate',{expression:'document.readyState==="complete"&&typeof runSelfTests==="function"',returnByValue:true})).result.value}
  if(!lista)throw Error('La página no terminó de cargar');
  const pagina={
   espera,errores,
   eval:async js=>{
    const r=await manda('Runtime.evaluate',{expression:`(async()=>{${js}})()`,awaitPromise:true,returnByValue:true});
    if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);
    return r.result.value;
   },
   foto:async(archivo,recorte)=>{
    const r=await manda('Page.captureScreenshot',{format:'png',...(recorte?{clip:{...recorte,scale:1},captureBeyondViewport:true}:{})});
    fs.writeFileSync(archivo,Buffer.from(r.data,'base64'));
   }
  };
  if(bateria){
   const informe=await pagina.eval(`const i=runSelfTests();return{total:i.total,pasan:i.passed,rojas:i.results.filter(r=>!r.ok).map(r=>r.name+(r.error?'  ['+r.error+']':''))}`);
   if(informe.rojas.length){console.error('Autopruebas en rojo en el navegador:\n');for(const r of informe.rojas)console.error('  · '+r);salida=1}
   else console.log(`Batería completa en el navegador: ${informe.pasan}/${informe.total}.`);
  }
  if(guion)await (eval(fs.readFileSync(guion,'utf8')))(pagina);
  if(errores.length){console.error('Errores de la página:\n  '+errores.slice(0,5).join('\n  '));salida=1}
  ws.close();
 }catch(e){console.error(e.message);salida=1}
 await cierra();
 process.exit(salida);
})();
