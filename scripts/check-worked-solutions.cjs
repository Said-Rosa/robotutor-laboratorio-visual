const assert=require('node:assert/strict');const {cargar}=require('./sandbox.cjs');
const P=cargar(['mechanicalWorkedSolution','mechanicalScene','makeSpatial2R','makeSpatial3R','makeRrrp','makeScara','makeTextbookExercise','makeIndustrial6R','makeDhAssignment','makeDhAssignment6R','KinematicsEngine']);
let count=0;
for(const gen of[P.makeSpatial2R,P.makeSpatial3R,P.makeRrrp,P.makeScara,d=>P.makeTextbookExercise(d,'scara'),d=>P.makeTextbookExercise(d,'cylindrical'),P.makeIndustrial6R,P.makeDhAssignment,P.makeDhAssignment6R])for(let i=0;i<4;i++){
 const e=gen(i+1),k=e.kinematics||e.params.kinematics,html=P.mechanicalWorkedSolution(e),before=JSON.stringify(k),scene=P.mechanicalScene({...e,kinematics:k});
 assert.match(html,/Solución paso a paso/);assert.doesNotMatch(html,/undefined|NaN|Infinity/);assert.match(html,/revoluta tiene θ variable y d fijo/);assert.match(html,/prismática tiene d variable y θ fijo/);
 assert.equal(JSON.stringify(k),before);const pads=scene.solids.filter(s=>s.part==='pad');assert.equal(pads.length,2);for(let j=0;j<3;j++)assert.ok(Math.abs((pads[0].b[j]+pads[1].b[j])/2-scene.tip[j])<1e-9,'gripper tips must surround the actual TCP');
 for(const solid of scene.solids.filter(s=>s.side)){
  const axis=solid.b.map((x,i)=>x-solid.a[i]),length=Math.hypot(...axis);
  assert.ok(Math.abs(axis.reduce((n,x,i)=>n+x*solid.side[i],0))<1e-8*length,'jaw and sleeve sections must be perpendicular to their length');
  assert.ok(Math.abs(Math.hypot(...solid.side)-1)<1e-8,'cross-section basis must be normalized');
 }
 const n=[...html.matchAll(/<h4>(\d+)\. /g)].map(m=>+m[1]);assert.deepEqual(n,n.map((_,i)=>i+1));
 if(e.model==='RRRP'){assert.match(html,/Longitud efectiva = L₃ \+ q₄/);assert.equal(scene.solids.filter(s=>s.part==='revolute').length,3)}
 if(e.model==='SCARA_RRP')assert.equal(scene.solids.filter(s=>s.part==='revolute').length,2);
 if(e.visual==='dhAssignment'||e.model==='Industrial6R'||e.rows===4)assert.equal((html.match(/(?:T₀\d+|⁰A[₁-₉]+)\[\d,\d\]/g)||[]).length,k.individual.length*16);
 count++;
}
const e=P.makeSpatial3R(3);e.params={h:3,l2:3,l3:5,q1:120,q2:30,q3:-45};e.kinematics=P.KinematicsEngine.spatial3R(e.params);e.answer=e.kinematics.positions.at(-1).z;const html=P.mechanicalWorkedSolution(e);assert.match(html,/\(30\) \+ \(-45\) = -15°/);assert.match(html,/Z = h \+ L₂ sen\(q₂\) \+ L₃ sen\(q₂ \+ q₃\)/);
console.log(`${count} worked solutions validated: DH variables, complete products, step order, gripper TCP and joint geometry.`);
