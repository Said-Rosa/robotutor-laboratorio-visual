/* Barrido de todo lo que la aplicación puede poner delante del alumno.
 *
 * Genera ejercicios por las tres vías reales —la rotación de cada capítulo, la
 * práctica de cada tema declarado y la composición de exámenes— y exige de cada
 * uno lo mínimo para que sea utilizable: que tenga enunciado, que su respuesta
 * cuadre con la forma declarada, que la correcta esté entre las opciones y que
 * su familia exista en su capítulo.
 *
 * Escribiéndolo aparecieron dos fallos que llevaban tiempo ahí:
 *
 *  · La variante de superficie del RP telescópico caía en un retorno sin
 *    enunciado, así que el alumno veía la figura y un hueco donde debía estar
 *    la pregunta.
 *  · La práctica del tema de cinemática directa incluía un generador que sortea
 *    su variante, y una de ellas pertenece a otro tema. Al salir, la propia
 *    guardia de makeTopicExercise lanzaba una excepción que nadie recogía: una
 *    de cada cuatro veces que tocaba ese generador, el ejercicio no aparecía.
 *
 * Los dos son del tipo que un sorteo destapa de vez en cuando, y ninguno lo
 * habría visto una revisión a mano.
 *
 * Uso: node scripts/check-exercises.cjs [ruta/al/robotutor.html]
 *      SORTEOS=200 node scripts/check-exercises.cjs   (más muestreo)
 */
const {cargar,RUTA_POR_DEFECTO}=require('./sandbox.cjs');

const P=cargar(['DIFFICULTY_LEVELS','chapters','makeFoundationExercise','makeChapter3','makeChapter5',
 'makeKinematicsExercise','makeTopicExercise','topicPracticeAvailability','topicByKey','composeExam',
 'exerciseFamily','familyIds','buildPedagogyTrace','solutionStepsMarkup','solutionProcedureMarkup',
 'solutionReasoningMarkup','exerciseTopicKey'],process.argv[2]||RUTA_POR_DEFECTO);

const SORTEOS=Number(process.env.SORTEOS||90);
const problemas=new Map();
const anota=(donde,motivo)=>{const clave=donde+' :: '+motivo;problemas.set(clave,(problemas.get(clave)||0)+1)};
let revisados=0;

function revisa(e,donde){
 if(!e){anota(donde,'el generador no devolvió ejercicio');return}
 revisados++;
 if(!e.title||!String(e.title).trim())anota(donde,'sin título');
 /* El enunciado es lo único que no puede faltar nunca: sin él la pantalla
    muestra la figura y un hueco donde debería estar la pregunta. */
 if(!e.statement||!String(e.statement).trim())anota(donde,'sin enunciado ('+(e.id||e.type)+')');
 if(!['matrix','number','choice','symbolic','open'].includes(e.type)){anota(donde,'tipo inválido: '+e.type);return}
 if(e.type==='matrix'){
  if(!Array.isArray(e.answer)||e.answer.length!==e.rows)anota(donde,'la respuesta no tiene las filas declaradas ('+e.id+')');
  else if(!e.answer.every(f=>Array.isArray(f)&&f.length===e.cols&&f.every(v=>Number.isFinite(v))))anota(donde,'alguna celda no es un número finito ('+e.id+')');
 }
 if(e.type==='number'&&!Number.isFinite(e.answer))anota(donde,'respuesta no finita ('+e.id+')');
 if(e.type==='choice'){
  if(!Array.isArray(e.options)||e.options.length<2)anota(donde,'menos de dos opciones');
  else if(!e.options.includes(e.answer))anota(donde,'la respuesta correcta no está entre las opciones');
 }
 /* Una familia que su capítulo no declara deja al ejercicio fuera del filtro:
    ni se puede pedir ni se puede excluir. */
 const familia=P.exerciseFamily(e);
 if(familia&&!P.familyIds(Number(e.chapter)).includes(familia))anota(donde,`familia «${familia}» ajena al capítulo ${e.chapter} (${e.id})`);
 try{P.buildPedagogyTrace(e)}catch(err){anota(donde,'buildPedagogyTrace falla · '+err.message)}
 try{P.solutionStepsMarkup(e);P.solutionProcedureMarkup(e);P.solutionReasoningMarkup(e)}
 catch(err){anota(donde,'la solución falla · '+err.message)}
}

// ---- 1. la rotación de cada capítulo ----
const rotacion=[[1,n=>P.makeFoundationExercise(1,n)],[2,n=>P.makeFoundationExercise(2,n)],
 [3,n=>P.makeChapter3(n)],[4,n=>P.makeKinematicsExercise(n)],[5,n=>P.makeChapter5(n)]];
for(const nivel of P.DIFFICULTY_LEVELS)for(const [capitulo,make] of rotacion)for(let i=0;i<SORTEOS;i++){
 try{revisa(make(nivel),`capítulo ${capitulo} · nivel ${nivel}`)}
 catch(err){anota(`capítulo ${capitulo} · nivel ${nivel}`,'EXCEPCIÓN · '+err.message)}
}

// ---- 2. la práctica de cada tema declarado ----
let temas=0,practicables=0;
for(const capitulo of P.chapters)for(const tema of capitulo.topics){
 const clave=tema.claveOriginal||String(tema.title).split(' ')[0];
 temas++;
 if(!P.topicByKey(clave))anota('tema '+clave,'no se resuelve por su propia clave');
 let alguno=false;
 for(const nivel of P.DIFFICULTY_LEVELS){
  if(!P.topicPracticeAvailability(clave,nivel).available)continue;
  alguno=true;
  for(let i=0;i<Math.max(20,Math.round(SORTEOS/2));i++){
   /* makeTopicExercise lanza si el ejercicio sorteado no pertenece al tema
      pedido, y quien la llama no recoge esa excepción. */
   try{revisa(P.makeTopicExercise(clave,nivel),`tema ${clave} · nivel ${nivel}`)}
   catch(err){anota(`tema ${clave} · nivel ${nivel}`,'EXCEPCIÓN · '+err.message)}
  }
 }
 if(alguno)practicables++;
}

// ---- 3. exámenes de un capítulo y de varios ----
const combinaciones=[[1],[2],[3],[4],[5],[3,4],[1,2,3,4,5]];
for(const nivel of P.DIFFICULTY_LEVELS)for(const capitulos of combinaciones)for(let i=0;i<3;i++){
 const donde=`examen [${capitulos.join(',')}] · nivel ${nivel}`;
 try{
  const examen=P.composeExam({capitulos,dificultad:nivel,preguntas:10});
  const preguntas=Array.isArray(examen)?examen:(examen&&examen.preguntas);
  if(!preguntas||!preguntas.length)anota(donde,'compuso un examen sin preguntas');
  else for(const e of preguntas)revisa(e,donde);
 }catch(err){anota(donde,'EXCEPCIÓN · '+err.message)}
}

if(problemas.size){
 console.error('Ejercicios que la aplicación no debería poder mostrar:\n');
 for(const [clave,veces] of [...problemas].sort())console.error(`  ·${veces}×  ${clave}`);
 process.exit(1);
}
console.log(`Ejercicios validados: ${revisados} por las tres vías · ${practicables} de ${temas} temas ofrecen práctica.`);
