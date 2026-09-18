// Rebuild the offline 3D renderer embedded in the standalone HTML: npm ci && npm run build:plates.
const fs=require('node:fs'),path=require('node:path'),esbuild=require('esbuild');
const root=path.resolve(__dirname,'..');
(async()=>{
 const result=await esbuild.build({entryPoints:[path.join(__dirname,'mechanical-renderer.mjs')],bundle:true,minify:true,format:'iife',globalName:'RoboTutorMechanical3D',target:['es2020'],supported:{'template-literal':false},write:false,legalComments:'inline'});
 const license=fs.readFileSync(path.join(root,'node_modules/three/LICENSE'),'utf8');
 const block='<!-- ROBOTUTOR_MECHANICAL_3D_BEGIN -->\n<script>/* Three.js 0.185.0\n'+license+'\n*/\n'+result.outputFiles[0].text.replace(/<\/script/gi,'<\\/script')+'</script>\n<!-- ROBOTUTOR_MECHANICAL_3D_END -->';
 const file=path.join(root,'robotutor.html'),html=fs.readFileSync(file,'utf8');
 fs.writeFileSync(file,html.includes('<!-- ROBOTUTOR_MECHANICAL_3D_BEGIN -->')?html.replace(/<!-- ROBOTUTOR_MECHANICAL_3D_BEGIN -->[\s\S]*?<!-- ROBOTUTOR_MECHANICAL_3D_END -->/,()=>block):html.replace('</head>',()=>block+'\n</head>'));
 console.log('Embedded offline 3D renderer: '+result.outputFiles[0].text.length+' bytes.');
})();
