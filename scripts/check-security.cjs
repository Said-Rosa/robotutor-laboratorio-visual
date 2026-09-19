/* Comprobación de las defensas de la página.
 *
 * RoboTutor es un HTML estático sin servidor, sin cuentas y sin base de datos:
 * lo único que guarda es el progreso en el localStorage del propio navegador, y
 * no viaja a ninguna parte. No hay, por tanto, un almacén central que robar.
 *
 * Lo que sí puede fallar en una página así es que entre texto ajeno y acabe
 * ejecutándose, o que alguien añada mañana un recurso externo y con él una
 * dependencia de terceros. Este script comprueba justo eso, en el fichero
 * publicado, sin necesidad de navegador:
 *
 *  · que la política de contenido siga declarada y no se haya relajado;
 *  · que la página no cargue absolutamente nada de fuera;
 *  · que no use eval ni ninguna vía de salida a la red, que es lo que la
 *    política promete y conviene que siga siendo cierto;
 *  · que los enlaces externos no cedan el control de la pestaña;
 *  · que el aviso de la interfaz siga escapando el texto que no escribimos
 *    nosotros.
 *
 * No prueba que el navegador aplique la política —eso solo se ve abriendo la
 * página—, sino que lo declarado y lo que hace el código no se contradicen.
 *
 * Uso: node scripts/check-security.cjs [ruta/al/robotutor.html] [--artifact]
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');

const args=process.argv.slice(2);
const esFragmento=args.includes('--artifact');
const file=args.find(a=>!a.startsWith('--'))||path.join(__dirname,'..','robotutor.html');
const source=fs.readFileSync(file,'utf8');

/* La política se declara por meta porque GitHub Pages no deja poner cabeceras.
   Eso deja fuera frame-ancestors, que solo funciona como cabecera. */
const DIRECTIVAS_EXIGIDAS={
 'default-src':"'self' data: blob:",
 'script-src':"'unsafe-inline'",
 'style-src':"'unsafe-inline'",
 'img-src':"'self' data: blob:",
 'font-src':'data:',
 'connect-src':"'none'",
 'object-src':"'none'",
 'base-uri':"'none'",
 'form-action':"'none'",
 'frame-src':"'none'",
 'worker-src':"'none'",
 'manifest-src':"'none'",
 'media-src':"'none'"
};

if(!esFragmento){
 const meta=source.match(/<meta\s+http-equiv="Content-Security-Policy"\s+content="([^"]+)"/i);
 assert.ok(meta,'falta la política de contenido: el documento no declara Content-Security-Policy');
 const declaradas=new Map(meta[1].split(';').map(d=>d.trim()).filter(Boolean)
  .map(d=>{const [nombre,...valor]=d.split(/\s+/);return [nombre.toLowerCase(),valor.join(' ')]}));
 for(const [nombre,valor] of Object.entries(DIRECTIVAS_EXIGIDAS)){
  assert.ok(declaradas.has(nombre),`la política ya no declara ${nombre}`);
  assert.equal(declaradas.get(nombre),valor,`${nombre} cambió de valor: se esperaba «${valor}»`);
 }
 /* unsafe-eval convertiría una inyección de texto en ejecución de código. */
 assert.ok(!/unsafe-eval/i.test(meta[1]),'la política permite unsafe-eval');
 assert.match(source,/<meta\s+name="referrer"\s+content="no-referrer">/i,'falta la política de referente');
}

/* ---- nada se carga de fuera ---- */
const externos=[];
for(const m of source.matchAll(/<(script|link|img|iframe|source|video|audio|track)\b[^>]*?\s(?:src|href)="([^"]+)"/gi)){
 const url=m[2];
 if(/^(https?:)?\/\//i.test(url))externos.push(`<${m[1]}> → ${url}`);
}
for(const m of source.matchAll(/url\(\s*["']?([a-zA-Z][a-zA-Z0-9+.-]*:)/g)){
 if(!['data:','blob:'].includes(m[1]))externos.push(`css url(${m[1]}…)`);
}
assert.deepEqual(externos,[],'la página carga recursos externos:\n  '+externos.join('\n  '));
// Relative font URLs are also incompatible with font-src data: and a standalone HTML.
for(const font of source.matchAll(/@font-face\s*\{([^}]+)\}/gi)){
 const urls=[...font[1].matchAll(/url\(\s*["']?([^\s)"']+)/g)].map(m=>m[1]);
 assert.ok(urls.length&&urls.every(url=>url.startsWith('data:font/')),'fuente sin incorporar al HTML: '+font[1].slice(0,100));
}

/* ---- ninguna vía de salida a la red ----
   El escrutinio se hace por separado. En el código de la aplicación se puede
   ser estricto. En el paquete de KaTeX, que va minificado, solo se buscan
   formas inequívocas: allí «fetch» es además el nombre de un método de su
   analizador léxico, y confundirlo con la API del navegador daría un falso
   positivo en cada revisión. */
const bloques=[...source.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1]);
const appScript=bloques.find(b=>b.includes('const APP_VERSION='));
assert.ok(appScript,'no se encontró el script principal');
const vendorizado=bloques.filter(b=>b!==appScript).join('\n');

const salidasApp=[
 [/(?<![.\w])fetch\s*\(/,'fetch()'],
 [/new\s+XMLHttpRequest/,'XMLHttpRequest'],
 [/sendBeacon/,'navigator.sendBeacon'],
 [/new\s+WebSocket/,'WebSocket'],
 [/new\s+EventSource/,'EventSource'],
 [/new\s+(Shared)?Worker\s*\(/,'Worker'],
 [/serviceWorker/,'serviceWorker'],
 [/(?<![.\w$])import\s*\(/,'import() dinámico']
];
for(const [patron,nombre] of salidasApp){
 assert.ok(!patron.test(appScript),`la aplicación usa ${nombre}: la política declara connect-src 'none' y dejaría de ser cierta`);
}
const salidasVendor=[
 [/(?:window|globalThis|self)\s*\.\s*fetch\s*\(/,'window.fetch'],
 [/new\s+XMLHttpRequest/,'XMLHttpRequest'],
 [/sendBeacon/,'navigator.sendBeacon'],
 [/new\s+WebSocket/,'WebSocket'],
 [/new\s+EventSource/,'EventSource']
];
for(const [patron,nombre] of salidasVendor){
 assert.ok(!patron.test(vendorizado),`el paquete embebido usa ${nombre}, que la política bloquearía`);
}

/* ---- nada convierte texto en código ---- */
const ejecutores=[
 [/(?<![.\w])eval\s*\(/,'eval()'],
 [/new\s+Function\s*\(/,'new Function()'],
 [/document\s*\.\s*write/,'document.write'],
 [/set(?:Timeout|Interval)\s*\(\s*["'`]/,'setTimeout con cadena']
];
for(const [patron,nombre] of ejecutores){
 assert.ok(!patron.test(appScript),`la aplicación usa ${nombre}, que ejecuta texto como código`);
}

/* ---- elementos que no deberían existir en esta página ---- */
/* Se exige forma de etiqueta —nombre seguido de espacio, barra o cierre— para
   no confundirla con una comparación del código: «dimX<base.x» no es un <base>. */
for(const [patron,nombre] of [[/<form[\s/>]/i,'<form>'],[/<base[\s/>]/i,'<base>'],[/<object[\s/>]/i,'<object>'],[/<embed[\s/>]/i,'<embed>'],[/<iframe[\s/>]/i,'<iframe>']]){
 assert.ok(!patron.test(source),`aparece un ${nombre}, que la política bloquea o que abre superficie sin necesidad`);
}

/* ---- los enlaces externos no ceden el control de la pestaña ---- */
const sinProteger=[];
for(const m of source.matchAll(/<a\b[^>]*?target="_blank"[^>]*>/gi)){
 const rel=(m[0].match(/\srel="([^"]*)"/i)||[,''])[1];
 if(!/noopener/i.test(rel)||!/noreferrer/i.test(rel))sinProteger.push(m[0].slice(0,90));
}
assert.deepEqual(sinProteger,[],'enlaces con target="_blank" sin rel="noopener noreferrer":\n  '+sinProteger.join('\n  '));

/* ---- el aviso escapa el texto que no escribimos nosotros ----
   Al importar un progreso, el mensaje de JSON.parse copia un trozo literal del
   fichero, con sus < y >. Si el aviso volviera a pintar siempre como HTML, ese
   trozo se interpretaría como marcado. */
assert.match(source,/function feedback\(type,msg,\{html=false\}=\{\}\)/,
 'feedback() ya no declara el escape por defecto');
assert.match(source,/if\(html\)f\.innerHTML=msg;else f\.textContent=String\(msg\);/,
 'feedback() ya no escapa el mensaje cuando no se pide marcado');

/* ---- el importador no se traga un archivo desmedido ---- */
assert.match(source,/if\(file\.size>2\*1024\*1024\)/,'la importación de progreso ya no limita el tamaño del archivo');

console.log(esFragmento
 ? 'Fragmento: sin recursos externos, sin salidas de red y sin ejecución de texto.'
 : 'Defensas validadas: política declarada, cero recursos externos, cero salidas de red, cero ejecución de texto.');
