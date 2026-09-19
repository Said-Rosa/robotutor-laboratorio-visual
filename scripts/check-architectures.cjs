const assert=require('node:assert/strict');
const {cargar}=require('./sandbox.cjs');
const P=cargar(['ROBOT_ARCHITECTURES','makeArchitectureExercise','mechanicalScene','mechanicalPlateSvg','mechanicalWorkedSolution','exerciseTopicKey','solutionReasoning','choiceFailureReason']);
let seed=343;const old=Math.random;Math.random=()=>((seed=(1664525*seed+1013904223)>>>0)/4294967296);
const sin=x=>Math.sin(x*Math.PI/180),cos=x=>Math.cos(x*Math.PI/180),close=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
function rank(a){a=a.map(r=>[...r]);let r=0;for(let c=0;c<a[0].length&&r<a.length;c++){let p=r;for(let i=r+1;i<a.length;i++)if(Math.abs(a[i][c])>Math.abs(a[p][c]))p=i;if(Math.abs(a[p][c])<1e-7)continue;[a[r],a[p]]=[a[p],a[r]];const v=a[r][c];a[r]=a[r].map(x=>x/v);for(let i=r+1;i<a.length;i++){const f=a[i][c];a[i]=a[i].map((x,j)=>x-f*a[r][j])}r++}return r}
function mobility(k){const end=k.positions.at(-1),cols=k.jointTypes.map((type,i)=>{const m=i?k.cumulative[i-1]:[[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]],z=m.slice(0,3).map(r=>r[2]),v=[end.x-m[0][3],end.y-m[1][3],end.z-m[2][3]];return type==='P'?[...z,0,0,0]:[z[1]*v[2]-z[2]*v[1],z[2]*v[0]-z[0]*v[2],z[0]*v[1]-z[1]*v[0],...z]});return rank(Array.from({length:6},(_,i)=>cols.map(c=>c[i])))}
let count=0;
try{for(const def of P.ROBOT_ARCHITECTURES){let maxMobility=0;
 for(let sample=0;sample<12;sample++)for(const task of ['dh','direct','identify']){
  const ask=['sequence','family','mobility'][sample%3],e=P.makeArchitectureExercise(1+sample%4,def.id,task,ask),k=e.kinematics||e.params.kinematics,t=k.table,n=def.types.length,scene=P.mechanicalScene({...e,kinematics:k});count++;
  assert.equal(e.chapter,4);assert.equal(P.exerciseTopicKey(e),task==='dh'?'4.3':'4.1');assert.equal(k.jointTypes.join(''),def.types);assert.equal(t.length,n);
  assert.equal(scene.solids.filter(s=>s.part==='revolute').length,[...def.types].filter(x=>x==='R').length,'every revolute must have a physical bearing');
  assert.equal(scene.solids.filter(s=>s.part==='pad').length,2);
  const pads=scene.solids.filter(s=>s.part==='pad');for(let j=0;j<3;j++)close((pads[0].b[j]+pads[1].b[j])/2,scene.tip[j]);
  for(const s of scene.solids){assert.ok(s.a.concat(s.b,[s.width,s.height]).every(Number.isFinite));assert.ok(Math.hypot(...s.a.map((v,j)=>v-s.b[j]))>1e-8);if(s.side)close(s.b.reduce((sum,v,j)=>sum+(v-s.a[j])*s.side[j],0),0)}
  const end=k.positions.at(-1);let xyz;
  if(def.id==='cartesian3')xyz=[t[2].d,t[1].d,t[0].d];
  if(def.id==='cylindrical3')xyz=[-t[2].d*sin(t[0].theta),t[2].d*cos(t[0].theta),t[0].d+t[1].d];
  if(def.id==='polar3')xyz=[-t[2].d*sin(t[1].theta)*cos(t[0].theta),-t[2].d*sin(t[1].theta)*sin(t[0].theta),t[0].d+t[2].d*cos(t[1].theta)];
  if(def.id==='scara4')xyz=[t[0].a*cos(t[0].theta)+t[1].a*cos(t[0].theta+t[1].theta),t[0].a*sin(t[0].theta)+t[1].a*sin(t[0].theta+t[1].theta),t[0].d-t[2].d-t[3].d];
  if(xyz)xyz.forEach((x,i)=>close(x,[end.x,end.y,end.z][i]));
  maxMobility=Math.max(maxMobility,mobility(k));
  const solution=P.mechanicalWorkedSolution(e);assert.match(solution,/Solución paso a paso/);assert.doesNotMatch(solution,/undefined|NaN|Infinity/);assert.ok(P.solutionReasoning(e));
  if(task==='identify'){
   assert.ok(e.options.includes(e.answer));assert.equal(e.chips.length,0);assert.equal(scene.dimensions.length,0);assert.equal(scene.frames,null);assert.ok(!e.statement.includes(def.types));
   for(const o of e.options.filter(o=>o!==e.answer))assert.ok(P.choiceFailureReason(e,o).length>25);
  }else if(task==='dh')assert.deepEqual(JSON.parse(JSON.stringify(e.answer)),JSON.parse(JSON.stringify(t.map(r=>[r.a,r.alpha,r.d,r.theta]))));else e.answer.forEach((r,i)=>close(r[0],[end.x,end.y,end.z][i]));
  if(sample===0){const svg=P.mechanicalPlateSvg({...e,kinematics:k});assert.doesNotMatch(svg,/data-joint-label|NaN|Infinity/);assert.equal((svg.match(/data-base-axis=/g)||[]).length,task==='dh'?3:0);}
 }
 assert.equal(maxMobility,def.types.length,def.id+': independent motion count');
}}finally{Math.random=old}
console.log(`${count} architecture exercises: analytic positions, 3–6 independent motions, joint solids, DH rows, identification feedback and hidden answers passed.`);
