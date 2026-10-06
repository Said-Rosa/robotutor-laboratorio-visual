/* Cinemática inversa por la matriz homogénea (noap).
 *
 * Un ejercicio de inversa mal resuelto por la propia aplicación es de lo peor
 * que puede pasar: marcaría como error una respuesta correcta, o daría por
 * buena una que no lleva el extremo adonde se pide. Este script sortea
 * ejercicios de los cinco robots en los cuatro niveles y comprueba, sin
 * navegador y sin fiarse del motor:
 *
 *  · que cada solución reproduce la T pedida. La cinemática directa se calcula
 *    aquí con los cuatro movimientos elementales de cada fila, no con el motor;
 *  · que la postura con la que se generó el ejercicio está entre las soluciones;
 *  · que las ecuaciones y las afirmaciones sobre n, o y a que escribe el
 *    desarrollo se cumplen con números;
 *  · que la calificación da la nota entera a cualquier solución válida y no a
 *    una respuesta con una articulación equivocada o con celdas en blanco;
 *  · que la lámina no está dibujada en la postura que se pide.
 *
 * Uso: node scripts/check-inverse.cjs [ruta/al/robotutor.html]
 *      SORTEOS=150 node scripts/check-inverse.cjs   (más muestreo)
 */
const assert=require('node:assert/strict');
const {cargar,RUTA_POR_DEFECTO}=require('./sandbox.cjs');

const P=cargar(['makeInverseNoap','IK_NOAP_REFERENCE','ikNoapGrade','ikNoapSolutions','mul','hom','rot','translation4',
 'identityMatrix','mechanicalPlateSvg','solutionHasContent','exerciseTopicKey','isStatementOnlyExercise',
 'hasMechanicalWorkedSolution','answerIsCorrect','examQuestionScore','buildPedagogyTrace'],process.argv[2]||RUTA_POR_DEFECTO);

const SORTEOS=Number(process.env.SORTEOS||40);
const rad=x=>x*Math.PI/180,c=x=>Math.cos(rad(x)),s=x=>Math.sin(rad(x));
const cerca=(a,b,t=1e-4)=>Math.abs(a-b)<t;
const mismoAngulo=(a,b,t=1e-3)=>Math.abs(((a-b+540)%360)-180)<t;

/* Cinemática directa independiente: girar θ y avanzar d sobre z, avanzar a y
   girar α sobre x, fila a fila. */
function directa(ik,q){
 return ik.rows.reduce((T,f,i)=>{
  const theta=ik.types[i]==='R'?q[i]:f.theta,d=ik.types[i]==='P'?q[i]:f.d;
  const A=P.mul(P.mul(P.mul(P.hom(P.rot('z',theta),[0,0,0]),P.translation4(0,0,d)),P.translation4(f.a,0,0)),P.hom(P.rot('x',f.alpha),[0,0,0]));
  return P.mul(T,A);
 },P.identityMatrix(4));
}

/* Cuántas soluciones tiene cada robot cuando el dato es la T completa. */
const SOLUCIONES={cartesian3:1,cylindrical3:1,polar3:1,scara4:2,anthropomorphic3:1};
let casos=0;

for(const id of Object.keys(P.IK_NOAP_REFERENCE))for(const nivel of [1,2,3,4])for(let rep=0;rep<SORTEOS;rep++){
 const e=P.makeInverseNoap(nivel,id),ik=e.params.ik,T=ik.T,n=ik.types.length,donde=`${id} · nivel ${nivel}`;
 const q0=ik.rows.map((f,i)=>ik.types[i]==='R'?f.theta:f.d),vector=sol=>sol.map(v=>[v]);
 casos++;

 assert.equal(ik.solutions.length,SOLUCIONES[id],donde+': número de soluciones');
 for(const sol of ik.solutions){
  const Ti=directa(ik,sol);
  for(let i=0;i<3;i++)for(let j=0;j<4;j++)assert.ok(cerca(Ti[i][j],T[i][j],2e-3),`${donde}: una solución no reproduce T en (${i+1},${j+1})`);
  assert.ok(sol.every((v,i)=>ik.types[i]!=='P'||v>=0),donde+': desplazamiento negativo en una prismática');
 }
 /* El resolvedor, por sí solo, tiene que encontrar la postura generadora. */
 assert.ok(P.ikNoapSolutions(ik).some(sol=>sol.every((v,i)=>ik.types[i]==='R'?mismoAngulo(v,q0[i],.5):cerca(v,q0[i],.01))),donde+': el resolvedor no encuentra la postura con la que se generó');

 /* Las ecuaciones que escribe el desarrollo, robot a robot. */
 const [q1,q2,q3]=ik.solutions[0],[nx,ox,ax,px]=T[0],[ny,oy,ay,py]=T[1],[nz,oz,az,pz]=T[2],d1=ik.rows[0].d;
 if(id==='cartesian3')assert.ok(cerca(px,q3)&&cerca(py,q2)&&cerca(pz,q1),donde+': p = (q3, q2, q1)');
 if(id==='cylindrical3')assert.ok(cerca(c(q1)*px+s(q1)*py,0)&&cerca(-s(q1)*px+c(q1)*py,q3)&&cerca(pz-d1,q2)&&cerca(ax,-s(q1))&&cerca(ay,c(q1)),donde+': ecuaciones del cilíndrico');
 if(id==='polar3')assert.ok(cerca(c(q1)*px+s(q1)*py,-s(q2)*q3)&&cerca(pz-d1,c(q2)*q3)&&cerca(s(q1)*px-c(q1)*py,0)&&cerca(ox,-s(q1))&&cerca(oy,c(q1))&&cerca(oz,0),donde+': ecuaciones del polar');
 if(id==='anthropomorphic3'){
  const a2=ik.rows[1].a,a3=ik.rows[2].a;
  assert.ok(cerca(c(q1)*px+s(q1)*py,a2*c(q2)+a3*c(q2+q3))&&cerca(pz-d1,a2*s(q2)+a3*s(q2+q3))&&cerca(s(q1)*px-c(q1)*py,0),donde+': ecuaciones del antropomórfico');
  assert.ok(cerca(ax,s(q1))&&cerca(ay,-c(q1))&&cerca(nz,s(q2+q3))&&cerca(oz,c(q2+q3)),donde+': orientación del antropomórfico');
 }
 if(id==='scara4'){
  const a1=ik.rows[0].a,a2=ik.rows[1].a,d4=ik.rows[3].d;
  for(const [u1,u2,u3,u4] of ik.solutions)assert.ok(cerca(pz,d1-u3-d4)&&cerca(px*px+py*py,a1*a1+a2*a2+2*a1*a2*c(u2),1e-3)&&cerca(nx,c(u1+u2-u4))&&cerca(ny,s(u1+u2-u4))&&cerca(az,-1),donde+': ecuaciones del SCARA');
 }

 /* Calificación. */
 for(const sol of ik.solutions){
  assert.equal(P.ikNoapGrade(e,vector(sol)).nota,1,donde+': una solución válida no da la nota entera');
  assert.ok(P.answerIsCorrect(e,vector(sol)),donde+': una solución válida no cuenta como acierto');
 }
 const mala=vector(ik.solutions[0]);mala[0]=[mala[0][0]+(ik.types[0]==='R'?20:1.3)];
 const g=P.ikNoapGrade(e,mala);
 assert.ok(g.aciertos<=n-1&&g.nota<1&&!P.answerIsCorrect(e,mala),donde+': una articulación equivocada da la nota entera');
 /* Del disco, una celda en blanco vuelve como null: no puede puntuar. */
 assert.ok(P.examQuestionScore(e,ik.solutions[0].map((v,i)=>i?[null]:[v]))<=1/n+1e-9,donde+': las celdas en blanco puntúan');

 /* La lámina y el encaje con el resto de la aplicación. */
 const ref=P.IK_NOAP_REFERENCE[id],dibujada=e.params.kinematics.table.map((f,i)=>ik.types[i]==='R'?f.theta:f.d);
 assert.ok(dibujada.every((v,i)=>cerca(v,ref[i])),donde+': la lámina no está en la postura de referencia');
 assert.ok(!dibujada.every((v,i)=>cerca(v,ik.solutions[0][i],ik.types[i]==='R'?.5:.05)),donde+': la lámina está dibujada en la postura que se pide');
 if(rep<2)assert.doesNotMatch(P.mechanicalPlateSvg({...e,kinematics:e.params.kinematics}),/NaN|undefined|Infinity/,donde+': lámina');
 assert.equal(P.exerciseTopicKey(e),'4.4',donde+': tema');
 assert.ok(P.isStatementOnlyExercise(e)&&!P.hasMechanicalWorkedSolution(e),donde+': no debe abrirse la solución de cinemática directa');
 assert.ok(P.solutionHasContent({...e,attempted:true}),donde+': sin desarrollo escrito');
 assert.notEqual(P.buildPedagogyTrace(e).source,'kinematics',donde+': el banco de etapas quedaría visible');
 assert.ok(!e.steps.some(t=>String(t).split('\n')[0].includes('<')),donde+': un paso lleva el signo menor que en su primera línea');
 assert.doesNotMatch(e.steps.join(' ')+e.statement,/undefined|NaN/,donde+': texto');
}

console.log(`Cinemática inversa validada: ${casos} ejercicios de 5 robots; cada solución reproduce T por un cálculo independiente y las ecuaciones del desarrollo se cumplen.`);
