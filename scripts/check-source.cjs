const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const source=fs.readFileSync(process.argv[2]||path.join(__dirname,'../robotutor.html'),'utf8');
if(!process.argv.includes('--artifact')){assert.match(source,/<!DOCTYPE html>/i);assert.match(source,/<meta name="viewport"/);assert.match(source,/<\/body>/i)}
const scripts=[...source.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];for(const [i,s] of scripts.entries())new vm.Script(s[1],{filename:'inline-'+i});
const main=scripts.find(s=>s[1].includes('const APP_VERSION='))[1];
const start=main.indexOf('function cleanMechanismPoints('),end=main.indexOf('function cleanMechanismSvg(',start);
const points=vm.runInNewContext(main.slice(start,end)+'\ncleanMechanismPoints');
const k={model:'SCARA_RRP',geometry:{d0:2},positions:[{x:0,y:0,z:0},{x:3,y:0,z:0},{x:3,y:4,z:0},{x:3,y:4,z:1}]},before=JSON.stringify(k),p=points(k);
assert.deepEqual(Array.from(p.slice(1,4),v=>v.z),[2,2,2]);assert.equal(JSON.stringify(p.at(-1)),JSON.stringify(k.positions.at(-1)));assert.equal(JSON.stringify(k),before);
assert.match(source,/id="newVF"/);assert.match(source,/id="newOpen"/);assert.match(main,/type===?"open"/);
assert.doesNotMatch(source,/__CF\$cv\$params/);
console.log('Standalone HTML, inline JavaScript, SCARA geometry and reflection controls validated.');
// Test the actual chain implementation against independently derived coordinates.
const math=main.slice(main.indexOf('function mulExact('),main.indexOf('function dhTransform('));
const chain=main.slice(main.indexOf('function textbookChain('),main.indexOf('function makeTextbookExercise('));
const identity=main.match(/function identityMatrix\(n\)\{[^\n]+/)[0];
const models=vm.runInNewContext('const rad=d=>d*Math.PI/180,JOINT_AXIS_Z=[0,0,1];\n'+identity+'\n'+math+'\n'+chain+'\n({textbookScara,textbookCylindrical})');
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-10,`${a} != ${b}`),r=d=>d*Math.PI/180;
for(const q1 of [-90,0,30,75])for(const q2 of [-60,0,45])for(const q4 of [-45,0,90]){
 const k=models.textbookScara({l1:5,l2:4,l3:3,q1,q2,q3:1.5,q4});
 near(k.pose[0][3],4*Math.cos(r(q1))+3*Math.cos(r(q1+q2)));
 near(k.pose[1][3],4*Math.sin(r(q1))+3*Math.sin(r(q1+q2)));
 near(k.pose[2][3],3.5);near(k.pose[0][0],Math.cos(r(q1+q2+q4)));assert.equal(k.individual.length,4);
 const c=models.textbookCylindrical({l1:1.5,l4:1.2,theta1:q1,d2:3,d3:4,theta4:q4});
 near(c.pose[0][3],5.2*Math.cos(r(q1)));near(c.pose[1][3],5.2*Math.sin(r(q1)));near(c.pose[2][3],4.5);near(c.pose[2][1],Math.sin(r(q4)));assert.equal(c.individual.length,4);
}
console.log('SCARA RRPR and cylindrical RPPR: 108 independent pose comparisons passed.');
