// Optional real-browser QA. Set PLAYWRIGHT_MODULE and CHROME_PATH when using a bundled runtime.
const assert=require('node:assert/strict'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const launch={headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})};
 const browser=await chromium.launch(launch),page=await browser.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error'||m.text().startsWith('Lámina 3D:'))errors.push(m.text())});
 const url='file:///'+path.resolve(__dirname,'../robotutor.html').replaceAll('\\','/');
 try{
  // The complete renderer must work without CDN/network access.
  await page.route('https://**/*',r=>r.abort());await page.goto(url);await page.waitForFunction(()=>window.RoboTutor);
  await page.evaluate(async()=>{await Promise.all([...document.fonts].map(font=>font.load()))});
  await page.evaluate(()=>{let seed=340;Math.random=()=>((seed=(1664525*seed+1013904223)>>>0)/4294967296)});
  let checked=0;
  for(const width of [390,1280]){
   await page.setViewportSize({width,height:980});
   for(const name of ['makeSpatial2R','makeSpatial3R','makeScara','makeRrrp','makeIndustrial6R','makeDhAssignment','makeDhAssignment6R','scara','cylindrical']){
    const state=await page.evaluate(name=>{
     const e=['scara','cylindrical'].includes(name)?makeTextbookExercise(3,name):window[name](3);
     appState.currentView='practice';appState.currentChapter=4;appState.exam=null;appState.currentExercise=e;renderExercise();
     const target=document.getElementById(e.visual==='dhAssignment'?'exerciseDhPanel':'workspaceActivity'),svg=target.querySelector('.mechanical-plate-svg'),image=svg?.querySelector('[data-modeled-3d]');
     if(!svg||!image)return {modeled:false};
     const box=svg.viewBox.baseVal;
     return {modeled:!!image.getAttribute('href').startsWith('data:image/png;base64,'),aligned:Math.abs(+image.getAttribute('width')-box.width)<.01&&Math.abs(+image.getAttribute('x')-box.x)<.01,overflow:document.documentElement.scrollWidth>innerWidth+1,axes:svg.querySelectorAll('[data-base-axis]').length,dh:e.visual==='dhAssignment',labels:[...svg.querySelectorAll('[data-dimension-label]')].length};
    },name);
    assert.equal(state.modeled,true,name+': missing offline WebGL image');assert.equal(state.aligned,true);assert.equal(state.overflow,false);assert.equal(state.axes,state.dh?3:0);assert.ok(state.labels>=2);checked++;
   }
  }
  // Repeat renders reuse an image; an unavailable renderer retains the technical plate.
  const fallback=await page.evaluate(()=>{
   const e=makeRrrp(3),a=mechanicalPlateSvg(e,{modeled:true}),b=mechanicalPlateSvg(e,{modeled:true});
   const render=RoboTutorMechanical3D;RoboTutorMechanical3D=undefined;const compatible=mechanicalPlateSvg(e,{modeled:true});RoboTutorMechanical3D=render;
   return {same:a===b,fallback:compatible.includes('data-visible-edge')&&!compatible.includes('data-modeled-3d')};
  });
  assert.deepEqual(fallback,{same:true,fallback:true});
  // Network-blocked fonts/favicon may log net errors; shader/application errors may not.
  assert.deepEqual(errors.filter(e=>!e.includes('net::ERR_FAILED')),[]);
  console.log(`${checked} offline WebGL plates: desktop/mobile, aligned dimensions, correct axes, bounded layout, cached rendering and SVG fallback passed.`);
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
