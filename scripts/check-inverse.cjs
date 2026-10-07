/* Cinemática inversa: métodos geométrico, de la matriz homogénea (noap) y de
 * desacoplo cinemático.
 *
 * Un ejercicio de inversa mal resuelto por la propia aplicación es de lo peor
 * que puede pasar: marcaría como error una respuesta correcta, o daría por
 * buena una que no lleva el extremo adonde se pide. Este script sortea
 * ejercicios de los cinco robots y de la muñeca de seis ejes en los cuatro
 * niveles y comprueba, sin navegador y sin fiarse del motor:
 *
 *  · que cada solución lleva el extremo adonde se pide. La cinemática directa
 *    se calcula aquí con los cuatro movimientos elementales de cada fila;
 *  · que el criterio es el del libro del curso (Barrientos, cap. 4): con tres
 *    grados de libertad basta la posición, y valen las dos posturas del codo y
 *    las dos de la base; con cuatro (SCARA) hace falta la T completa;
 *  · que la postura con la que se generó el ejercicio está entre las soluciones;
 *  · que las ecuaciones que escribe el desarrollo se cumplen con números;
 *  · que la calificación da la nota entera a cualquier solución válida y no a
 *    una respuesta con una articulación equivocada o con celdas en blanco;
 *  · que la lámina no está dibujada en la postura que se pide;
 *  · en el desacoplo: que el centro de la muñeca es el punto donde se cortan
 *    sus ejes, y que los giros reproducen ³R₆ = (⁰R₃)ᵀ·[n o a];
 *  · en la inversa completa: que la tabla pedida es la del mecanismo dibujado
 *    y que la nota separa la tabla de las articulaciones.
 *
 * Uso: node scripts/check-inverse.cjs [ruta/al/robotutor.html]
 *      SORTEOS=150 node scripts/check-inverse.cjs   (más muestreo)
 */
const assert=require('node:assert/strict');
const {cargar,RUTA_POR_DEFECTO}=require('./sandbox.cjs');

const P=cargar(['makeInverseNoap','makeInverseChain','ikChainGrade','ikChainSummary','dhRowFromCells','makeWristCenter','makeWristAngles','IK_NOAP_REFERENCE','ikNoapGrade','ikNoapSolutions','ikNoapSummary','mul','hom','rot','translation4',
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

/* Cuántas soluciones tiene cada robot y qué columnas de T debe reproducir
   cada una. Va escrito aquí, sin preguntar a la aplicación: es el criterio del
   libro, y lo que se comprueba es que la aplicación lo cumple.
    · polar: dos, con la base girada media vuelta y q₂ cambiado de signo;
    · antropomórfico: cuatro, dos codos por cada lado de la base, que se quedan
      en dos cuando el brazo llega estirado. */
const SOLUCIONES={cartesian3:[1],cylindrical3:[1],polar3:[2],scara4:[2],anthropomorphic3:[2,4]};
const COLUMNAS={cartesian3:[3],cylindrical3:[3],polar3:[3],anthropomorphic3:[3],scara4:[0,1,2,3]};
let casos=0;

for(const id of Object.keys(P.IK_NOAP_REFERENCE))for(const nivel of [1,2,3,4])for(let rep=0;rep<SORTEOS;rep++){
 const e=P.makeInverseNoap(nivel,id),ik=e.params.ik,T=ik.T,n=ik.types.length,donde=`${id} · nivel ${nivel}`;
 const q0=ik.rows.map((f,i)=>ik.types[i]==='R'?f.theta:f.d),vector=sol=>sol.map(v=>[v]);
 casos++;

 assert.ok(SOLUCIONES[id].includes(ik.solutions.length),`${donde}: ${ik.solutions.length} soluciones`);
 for(const sol of ik.solutions){
  const Ti=directa(ik,sol);
  for(let i=0;i<3;i++)for(const j of COLUMNAS[id])assert.ok(cerca(Ti[i][j],T[i][j],2e-3),`${donde}: una solución no reproduce T en (${i+1},${j+1})`);
  assert.ok(sol.every((v,i)=>ik.types[i]!=='P'||v>=0),donde+': desplazamiento negativo en una prismática');
 }
 /* Las soluciones son distintas entre sí. */
 ik.solutions.forEach((u,a)=>ik.solutions.forEach((v,b)=>{if(a<b)assert.ok(u.some((x,i)=>ik.types[i]==='R'?!mismoAngulo(x,v[i],.5):!cerca(x,v[i],.01)),donde+': dos soluciones repetidas')}));
 /* El método y el dato del enunciado: p en el geométrico, T en los demás. */
 assert.equal(ik.dato,id==='anthropomorphic3'?'p':'T',donde+': dato');
 assert.equal(/<th>n<\/th>/.test(e.statement),id!=='anthropomorphic3',donde+': el enunciado no enseña el dato que corresponde');
 assert.equal(/geométrico/.test(e.title),id==='anthropomorphic3',donde+': título');
 /* El resolvedor, por sí solo, tiene que encontrar la postura generadora. */
 assert.ok(P.ikNoapSolutions(ik).some(sol=>sol.every((v,i)=>ik.types[i]==='R'?mismoAngulo(v,q0[i],.5):cerca(v,q0[i],.01))),donde+': el resolvedor no encuentra la postura con la que se generó');

 /* Las ecuaciones que escribe el desarrollo, robot a robot. */
 const [q1,q2,q3]=ik.solutions[0],[nx,ox,ax,px]=T[0],[ny,oy,ay,py]=T[1],[nz,oz,az,pz]=T[2],d1=ik.rows[0].d;
 if(id==='cartesian3')assert.ok(cerca(px,q3)&&cerca(py,q2)&&cerca(pz,q1),donde+': p = (q3, q2, q1)');
 if(id==='cylindrical3')assert.ok(cerca(c(q1)*px+s(q1)*py,0)&&cerca(-s(q1)*px+c(q1)*py,q3)&&cerca(pz-d1,q2)&&cerca(ax,-s(q1))&&cerca(ay,c(q1)),donde+': ecuaciones del cilíndrico');
 if(id==='polar3'){
  assert.ok(cerca(ox,-s(q1))&&cerca(oy,c(q1))&&cerca(oz,0),donde+': orientación del polar');
  for(const [u1,u2,u3] of ik.solutions){
   /* primera y segunda premultiplicación del ejemplo del libro */
   const u=c(u1)*px+s(u1)*py;
   assert.ok(cerca(u,-s(u2)*u3,2e-3)&&cerca(pz-d1,c(u2)*u3,2e-3)&&cerca(s(u1)*px-c(u1)*py,0,2e-3),donde+': ecuaciones del polar');
   assert.ok(cerca(c(u2)*u+s(u2)*(pz-d1),0,2e-3)&&cerca(-s(u2)*u+c(u2)*(pz-d1),u3,2e-3),donde+': segunda premultiplicación del polar');
  }
  /* la otra postura: base media vuelta, q₂ con el signo cambiado, y la
     herramienta girada media vuelta sobre a */
  const otra=directa(ik,[q1+180,-q2,q3]);
  assert.ok([0,1,2].every(i=>cerca(otra[i][3],T[i][3],2e-3)&&cerca(otra[i][0],-T[i][0],2e-3)&&cerca(otra[i][1],-T[i][1],2e-3)&&cerca(otra[i][2],T[i][2],2e-3)),donde+': la otra postura del polar');
  assert.equal(P.ikNoapGrade(e,vector([q1+180,-q2,q3])).nota,1,donde+': la otra postura del polar no da la nota entera');
 }
 if(id==='anthropomorphic3'){
  const a2=ik.rows[1].a,a3=ik.rows[2].a,r=Math.hypot(px,py),z=pz-d1;
  for(const [u1,u2,u3] of ik.solutions){
   /* método geométrico: plano vertical, teorema del coseno y q₂ = β − α */
   const rr=c(u1)*px+s(u1)*py;
   assert.ok(cerca(Math.abs(rr),r,2e-3)&&cerca(s(u1)*px-c(u1)*py,0,2e-3),donde+': plano del brazo');
   assert.ok(cerca(r*r+z*z,a2*a2+a3*a3+2*a2*a3*c(u3),5e-3),donde+': teorema del coseno');
   const beta=Math.atan2(z,rr)*180/Math.PI,alfa=Math.atan2(a3*s(u3),a2+a3*c(u3))*180/Math.PI;
   assert.ok(mismoAngulo(u2,beta-alfa,.05),donde+': q2 = β − α');
  }
  /* el otro codo, calculado aquí: vale, y con la nota entera */
  const alfa=Math.atan2(a3*s(q3),a2+a3*c(q3))*180/Math.PI,codo=[q1,q2+2*alfa,-q3],Tc=directa(ik,codo);
  assert.ok([0,1,2].every(i=>cerca(Tc[i][3],T[i][3],2e-3)),donde+': el otro codo no llega al punto');
  assert.equal(P.ikNoapGrade(e,vector(codo)).nota,1,donde+': el otro codo no da la nota entera');
  assert.ok(P.answerIsCorrect(e,vector(codo)),donde+': el otro codo no cuenta como acierto');
 }
 if(id==='scara4'){
  const a1=ik.rows[0].a,a2=ik.rows[1].a,d4=ik.rows[3].d;
  for(const [u1,u2,u3,u4] of ik.solutions)assert.ok(cerca(pz,d1-u3-d4)&&cerca(px*px+py*py,a1*a1+a2*a2+2*a1*a2*c(u2),1e-3)&&cerca(nx,c(u1+u2-u4))&&cerca(ny,s(u1+u2-u4))&&cerca(az,-1),donde+': ecuaciones del SCARA');
  /* con cuatro grados de libertad la orientación sí cuenta: girar la
     herramienta no mueve el extremo, y aun así no es solución */
  const girada=[...ik.solutions[0]];girada[3]+=30;
  const Tg=directa(ik,girada);
  assert.ok([0,1,2].every(i=>cerca(Tg[i][3],T[i][3])),donde+': girar la herramienta mueve el extremo');
  const gg=P.ikNoapGrade(e,vector(girada));
  assert.ok(gg.aciertos===3&&!gg.partes[3],donde+': se acepta una herramienta mal girada');
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

/* ---------- Desacoplo cinemático ---------- */
const giro=(eje,g)=>P.rot(eje,g),tras=M=>M[0].map((_,j)=>M.map(f=>f[j]));
const prod=(...Ms)=>Ms.reduce((A,B)=>P.mul(A,B));
/* Bloque de giro de una fila DH: girar θ sobre z y α sobre x. */
const giroFila=(f,theta=f.theta)=>prod(giro('z',theta),giro('x',f.alpha));
let muneca=0;
for(const nivel of [1,2,3,4])for(let rep=0;rep<SORTEOS;rep++){
 /* Centro de la muñeca. */
 const e=P.makeWristCenter(nivel),{rows,lengths,T}=e.params,pm=e.answer.map(f=>f[0]),donde=`centro de la muñeca · nivel ${nivel}`;
 muneca++;
 /* El robot es el de la teoría: brazo de tres ejes y muñeca esférica. */
 /* Se compara como texto: los objetos vienen de otro contexto de ejecución. */
 assert.equal(JSON.stringify(rows.map(f=>[f.d,f.a,f.alpha])),JSON.stringify([[lengths.l1,0,-90],[0,lengths.l2,0],[0,0,90],[lengths.l3,0,-90],[0,0,90],[lengths.l4,0,0]]),donde+': tabla');
 const q=rows.map(f=>f.theta),ik6={rows,types:['R','R','R','R','R','R']};
 const T6=directa(ik6,q);
 for(let i=0;i<3;i++)for(let j=0;j<4;j++)assert.ok(cerca(T6[i][j],T[i][j],1e-4),donde+': la T del enunciado no es la del robot');
 /* p_m = p − l₄·a, y es el punto donde se cortan los ejes: el origen del
    sistema 4, al que no le afectan q₄, q₅ ni q₆. */
 [0,1,2].forEach(i=>assert.ok(cerca(pm[i],T[i][3]-lengths.l4*T[i][2],1e-6),donde+': p − l4·a'));
 for(const giros of [[q[3],q[4],q[5]],[q[3]+50,q[4]-70,q[5]+110],[0,0,0]]){
  const T4=directa({rows:rows.slice(0,4),types:['R','R','R','R']},[q[0],q[1],q[2],giros[0]]);
  [0,1,2].forEach(i=>assert.ok(cerca(pm[i],T4[i][3],1e-4),donde+': el centro de la muñeca se mueve con sus giros'));
  const Tm=directa(ik6,[q[0],q[1],q[2],...giros]);
  [0,1,2].forEach(i=>assert.ok(cerca(Tm[i][3]-lengths.l4*Tm[i][2],pm[i],1e-4),donde+': p − l4·a no da el centro'));
 }
 assert.ok(P.answerIsCorrect(e,e.answer),donde+': la respuesta no cuenta como acierto');
 for(const alt of e.diagnosticAlternatives)assert.ok(!P.answerIsCorrect(e,alt.matrix),donde+': un error típico cuenta como acierto');
 assert.equal(P.exerciseTopicKey(e),'4.4',donde+': tema');
 assert.ok(P.solutionHasContent({...e,attempted:true}),donde+': sin desarrollo escrito');
 assert.ok(!e.steps.some(t=>String(t).split('\n')[0].includes('<')),donde+': un paso lleva el signo menor que en su primera línea');
 assert.doesNotMatch(e.steps.join(' ')+e.statement,/undefined|NaN/,donde+': texto');

 /* Giros de la muñeca. */
 const w=P.makeWristAngles(nivel),ik=w.params.ik,R=ik.T.slice(0,3).map(f=>f.slice(0,3)),lugar=`giros de la muñeca · nivel ${nivel}`,vector=sol=>sol.map(v=>[v]);
 assert.equal(JSON.stringify(ik.rows.map(f=>[f.a,f.alpha])),'[[0,-90],[0,90],[0,0]]',lugar+': tabla');
 assert.equal(ik.solutions.length,2,lugar+': número de soluciones');
 for(const sol of ik.solutions){
  const Rs=prod(giroFila(ik.rows[0],sol[0]),giroFila(ik.rows[1],sol[1]),giroFila(ik.rows[2],sol[2]));
  for(let i=0;i<3;i++)for(let j=0;j<3;j++)assert.ok(cerca(Rs[i][j],R[i][j],2e-3),`${lugar}: una solución no reproduce ³R₆ en (${i+1},${j+1})`);
  /* la forma de ³R₆ que escribe la teoría, elemento a elemento */
  const [q4,q5,q6]=sol,forma=[[c(q4)*c(q5)*c(q6)-s(q4)*s(q6),-c(q4)*c(q5)*s(q6)-s(q4)*c(q6),c(q4)*s(q5)],[s(q4)*c(q5)*c(q6)+c(q4)*s(q6),-s(q4)*c(q5)*s(q6)+c(q4)*c(q6),s(q4)*s(q5)],[-s(q5)*c(q6),s(q5)*s(q6),c(q5)]];
  for(let i=0;i<3;i++)for(let j=0;j<3;j++)assert.ok(cerca(forma[i][j],R[i][j],2e-3),`${lugar}: la expresión de ³R₆ falla en (${i+1},${j+1})`);
  assert.equal(P.ikNoapGrade(w,vector(sol)).nota,1,lugar+': una solución válida no da la nota entera');
  assert.ok(P.answerIsCorrect(w,vector(sol)),lugar+': una solución válida no cuenta como acierto');
 }
 const [a,b]=ik.solutions;
 assert.ok(mismoAngulo(b[0],a[0]+180,.05)&&mismoAngulo(b[1],-a[1],.05)&&mismoAngulo(b[2],a[2]+180,.05),lugar+': la segunda solución no es (q4+180, −q5, q6+180)');
 assert.ok(Math.abs(s(a[1]))>.3,lugar+': muñeca demasiado cerca de la singularidad');
 const mal=P.ikNoapGrade(w,vector([a[0]+180,a[1],a[2]+180]));
 assert.ok(mal.nota<1&&!mal.partes[1],lugar+': se acepta media vuelta sin cambiar q5');
 assert.match(P.ikNoapSummary(mal),/q₄: bien · q₅: por revisar · q₆: bien/,lugar+': resumen');
 assert.ok(P.examQuestionScore(w,[[a[0]],[null],[null]])<=1/3+1e-9,lugar+': las celdas en blanco puntúan');
 /* En los niveles altos se da ⁰R₃ y [n o a]; de ellos tiene que salir ³R₆. */
 assert.equal(Boolean(ik.R03),nivel>=3,lugar+': dato');
 if(ik.R03){
  const R36=prod(tras(ik.R03),ik.noa);
  for(let i=0;i<3;i++)for(let j=0;j<3;j++)assert.ok(cerca(R36[i][j],R[i][j],2e-3),lugar+': (⁰R₃)ᵀ·[n o a] no da ³R₆');
  /* ⁰R₃ es ortonormal y propia: si no, trasponer no sería invertir */
  const I=prod(tras(ik.R03),ik.R03);
  for(let i=0;i<3;i++)for(let j=0;j<3;j++)assert.ok(cerca(I[i][j],i===j?1:0,1e-4),lugar+': ⁰R₃ no es ortonormal');
 }
 assert.equal(P.exerciseTopicKey(w),'4.4',lugar+': tema');
 assert.ok(P.isStatementOnlyExercise(w)&&!P.hasMechanicalWorkedSolution(w),lugar+': no debe revelar el valor esperado');
 assert.ok(P.solutionHasContent({...w,attempted:true}),lugar+': sin desarrollo escrito');
 assert.ok(!w.steps.some(t=>String(t).split('\n')[0].includes('<')),lugar+': un paso lleva el signo menor que en su primera línea');
 assert.doesNotMatch(w.steps.join(' ')+w.statement,/undefined|NaN/,lugar+': texto');
 assert.match(w.statement,/q<sub>4<\/sub>/,lugar+': las articulaciones de la muñeca son la 4, la 5 y la 6');
}

/* ---------- Inversa completa: tabla DH y articulaciones ---------- */
let completas=0;
for(const id of Object.keys(P.IK_NOAP_REFERENCE))for(const nivel of [1,2,3,4])for(let rep=0;rep<Math.max(3,SORTEOS/8);rep++){
 const e=P.makeInverseChain(nivel,id),ik=e.params.ik,n=ik.types.length,donde=`inversa completa · ${id} · nivel ${nivel}`,ref=P.IK_NOAP_REFERENCE[id];
 completas++;
 assert.ok(e.rows===n+1&&e.cols===4&&e.answer.length===n+1,donde+': forma de la respuesta');
 /* La tabla pedida: mismas constantes que la del problema, con la postura
    dibujada —la de las fichas— en las celdas variables. */
 const filas=e.answer.slice(0,n).map(f=>P.dhRowFromCells(f));
 filas.forEach((f,i)=>{
  const g=ik.rows[i],variable=ik.types[i]==='R'?'theta':'d';
  for(const clave of ['theta','d','a','alpha'])assert.ok(cerca(f[clave],clave===variable?ref[i]:g[clave]),`${donde}: fila ${i+1}, ${clave}`);
 });
 /* Con esa tabla, el extremo cae donde lo dibuja la lámina. */
 const Tl=directa({rows:filas,types:ik.types},ref),fin=e.params.kinematics.positions.at(-1);
 assert.ok(cerca(Tl[0][3],fin.x,1e-3)&&cerca(Tl[1][3],fin.y,1e-3)&&cerca(Tl[2][3],fin.z,1e-3),donde+': la tabla no es la del mecanismo dibujado');
 /* Las fichas dan la postura dibujada, no la que se pide. */
 const fichas=e.chips.join(' ');
 ref.forEach((v,i)=>assert.ok(fichas.includes(`=${String(Number(v.toFixed(2)))}${ik.types[i]==='R'?'°':' m'}`),donde+': falta la postura en las fichas'));
 assert.equal(/<th>n<\/th>/.test(e.statement),id!=='anthropomorphic3',donde+': dato del enunciado');
 /* La postura de las fichas no regala ningún desplazamiento de la respuesta:
    la de referencia usa valores que el generador no sortea. */
 ik.solutions[0].forEach((v,i)=>{if(ik.types[i]==='P')assert.ok(!cerca(v,ref[i],1e-6),`${donde}: q${i+1} de la respuesta coincide con la postura dibujada`)});
 /* Nota: 10 con todo bien y cualquier solución; 5 y 5 por separado. */
 const tabla=()=>e.answer.slice(0,n).map(f=>[...f]),relleno=Array(4-n).fill(0);
 for(const sol of ik.solutions){
  const Ts=directa(ik,sol);
  for(let i=0;i<3;i++)for(const j of COLUMNAS[id])assert.ok(cerca(Ts[i][j],ik.T[i][j],2e-3),donde+': una solución no alcanza lo pedido');
  const a=[...tabla(),[...sol,...relleno]];
  assert.equal(P.ikChainGrade(e,a).puntos,10,donde+': todo bien no da 10');
  assert.ok(P.answerIsCorrect(e,a),donde+': todo bien no cuenta como acierto');
 }
 const soloTabla=[...tabla(),[null,null,null,null]];
 assert.equal(P.ikChainGrade(e,soloTabla).puntos,5,donde+': solo la tabla no da 5');
 assert.ok(cerca(P.examQuestionScore(e,soloTabla),.5),donde+': nota de examen con solo la tabla');
 const soloQ=[...Array.from({length:n},()=>[NaN,NaN,NaN,NaN]),[...ik.solutions[0],...relleno]];
 assert.equal(P.ikChainGrade(e,soloQ).puntos,5,donde+': solo las articulaciones no da 5');
 const tablaMal=tabla();tablaMal[0][0]+=33;tablaMal[0][2]+=1.7;
 const gm=P.ikChainGrade(e,[...tablaMal,[...ik.solutions[0],...relleno]]);
 assert.ok(!gm.tabla.ok&&gm.puntos===5&&!gm.q.arrastre,donde+': una tabla equivocada puntúa');
 assert.ok(!P.answerIsCorrect(e,[...tablaMal,[...ik.solutions[0],...relleno]]),donde+': una tabla equivocada cuenta como acierto');
 assert.match(P.ikChainSummary(gm),/Tabla DH: por revisar/,donde+': resumen');
 assert.equal(P.exerciseTopicKey(e),'4.4',donde+': tema');
 assert.ok(P.isStatementOnlyExercise(e)&&!P.hasMechanicalWorkedSolution(e),donde+': no debe revelar el valor esperado');
 assert.ok(P.solutionHasContent({...e,attempted:true}),donde+': sin desarrollo escrito');
 assert.ok(!e.steps.some(t=>String(t).split('\n')[0].includes('<')),donde+': un paso lleva el signo menor que en su primera línea');
 assert.doesNotMatch(e.steps.join(' ')+e.statement+e.notes,/undefined|NaN/,donde+': texto');
 if(rep<1)assert.doesNotMatch(P.mechanicalPlateSvg({...e,kinematics:e.params.kinematics}),/NaN|undefined|Infinity/,donde+': lámina');
}

console.log(`Cinemática inversa validada: ${casos} ejercicios de 5 robots, ${completas} completos y ${muneca*2} de desacoplo; cada solución lleva el extremo adonde se pide por un cálculo independiente, con el criterio del libro, y las ecuaciones del desarrollo se cumplen.`);
