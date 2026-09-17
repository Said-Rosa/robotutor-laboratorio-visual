const assert=require('node:assert/strict');
const {cargar}=require('./sandbox.cjs');
const P=cargar(['mechanicalVisibility','mechanicalScene','mechanicalPlateSvg','makeRrrp','makeDhAssignment','makeDhAssignment6R','makeTextbookExercise','makeScara','makeIndustrial6R','makeSpatial2R','makeSpatial3R','KinematicsEngine']);
const square=(x0,y0,x1,y1,z)=>[[x0,y0,z],[x1,y0,z],[x1,y1,z],[x0,y1,z]];
const area=p=>Math.abs(p.reduce((s,a,i)=>{const b=p[(i+1)%p.length];return s+a[0]*b[1]-a[1]*b[0]},0))/2;
// A nearer face clips only the covered portion, including rear contour edges.
const visibility=P.mechanicalVisibility([{owner:0,points:square(-2,-1,2,1,0),color:'rear'},{owner:1,points:square(-1,-2,1,2,1),color:'front'}],[{points:[[-2,0,0],[2,0,0]]}]);
assert.equal(visibility.surfaces.filter(f=>f.color==='rear').reduce((s,f)=>s+area(f.points),0),4);
assert.equal(visibility.lines.length,2);assert.ok(Math.abs(visibility.lines[0][1][0]+1)<1e-5);assert.ok(Math.abs(visibility.lines[1][0][0]-1)<1e-5);
// Intersecting planes require per-point depth, not sorting by average depth.
const slope=P.mechanicalVisibility([{owner:0,points:square(-1,-1,1,1,0),color:'flat'},{owner:1,points:[[-1,-1,-1],[1,-1,1],[1,1,1],[-1,1,-1]],color:'slope'}],[]);
for(const color of ['flat','slope'])assert.ok(Math.abs(slope.surfaces.filter(f=>f.color===color).reduce((s,f)=>s+area(f.points),0)-2)<1e-5);
let seed=338;const old=Math.random;Math.random=()=>((seed=(1664525*seed+1013904223)>>>0)/4294967296);
const generators=[()=>P.makeRrrp(3),()=>P.makeDhAssignment(3),()=>P.makeDhAssignment6R(3),()=>P.makeTextbookExercise(3,'scara'),()=>P.makeTextbookExercise(3,'cylindrical'),()=>P.makeIndustrial6R(3),()=>P.makeScara(3),()=>P.makeSpatial2R(3),()=>P.makeSpatial3R(3)];
let count=0;
for(const generate of generators)for(let i=0;i<8;i++){
 const e=generate();if(e.visual==='dhAssignment')e.kinematics=e.params.kinematics;const before=JSON.stringify(e.kinematics),scene=P.mechanicalScene(e),svg=P.mechanicalPlateSvg(e,{mobile:i%2===0});count++;
 assert.equal(JSON.stringify(e.kinematics),before);assert.deepEqual(Array.from(scene.tip),Object.values(e.kinematics.positions.at(-1)));
 assert.doesNotMatch(svg,/NaN|Infinity/);assert.match(svg,/data-visible-edge/);assert.match(svg,/data-endpoint-label="true" data-anchor-x=/);
 for(const d of scene.dimensions)assert.ok(svg.includes(`data-dimension-label="${d.label}"`),e.model+': missing '+d.label);
 if(e.model==='RRRP'){assert.match(svg,/data-dimension-label="q₄" data-dimension-variable="1"/);assert.equal(scene.dimensions.at(-1).variable,true)}
 if(e.visual==='dhAssignment'){assert.equal((svg.match(/data-joint-axis=/g)||[]).length,e.rows);assert.equal((svg.match(/data-base-axis=/g)||[]).length,3);if(e.rows===3)assert.ok(e.kinematics.positions.slice(1).every(p=>p.z>.3))}else assert.doesNotMatch(svg,/data-base-axis=|data-joint-axis=/);
 const view=svg.match(/viewBox="([^"]+)"/)[1].split(' ').map(Number),boxes=[...svg.matchAll(/<g [^>]*><rect x="([^"]+)" y="([^"]+)" width="([^"]+)" height="([^"]+)"/g)].map(m=>m.slice(1).map(Number));
 for(const [x,y,w,h] of boxes)assert.ok(x>=view[0]&&y>=view[1]&&x+w<=view[0]+view[2]&&y+h<=view[1]+view[3],'clipped label');
 for(let a=0;a<boxes.length;a++)for(let b=a+1;b<boxes.length;b++){const [x,y,w,h]=boxes[a],[X,Y,W,H]=boxes[b];assert.ok(!(x<X+W&&x+w>X&&y<Y+H&&y+h>Y),`${e.model}: overlapping labels ${a}/${b}`)}
}
const e=P.makeRrrp(3);e.params={l1:2,l2:3,l3:2,q1:0,q2:0,q3:0,q4:1};e.kinematics=P.KinematicsEngine.rrrp(e.params);const svg=P.mechanicalPlateSvg(e),v=svg.match(/viewBox="([^"]+)"/)[1].split(' ').map(Number);assert.ok(v[2]/v[3]>1.8,'horizontal mechanism should have a wide frame');
Math.random=old;console.log(`Hidden surfaces, exact depth, endpoint, variable dimensions, label separation and framing validated: ${count} plates.`);
