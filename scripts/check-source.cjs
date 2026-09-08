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
const geometryStart=main.indexOf('function makeGeometric2R('),geometryEnd=main.indexOf('function planarExamSvg(',geometryStart);
assert.ok(geometryStart>=0&&geometryEnd>geometryStart);
const generators=vm.runInNewContext(main.slice(geometryStart,geometryEnd)+'\n({makeGeometric2R,makeWorkspaceRP})',{
 ri:(a,b)=>Math.floor((a+b)/2),pick:values=>values[0],rad:degrees=>degrees*Math.PI/180
});
const rr=generators.makeGeometric2R(2,'point'),rp=generators.makeWorkspaceRP(2,'area');
assert.equal(rr.answer.length,2);
const rrRadius2=rr.answer[0][0]**2+rr.answer[1][0]**2;
assert.ok(Math.abs(rrRadius2-(rr.params.L1**2+rr.params.L2**2+2*rr.params.L1*rr.params.L2*Math.cos(rr.params.q2*Math.PI/180)))<1e-9);
assert.ok(Math.abs(rp.answer-(rp.params.amax-rp.params.amin)/360*Math.PI*((rp.params.L+rp.params.qmax)**2-(rp.params.L+rp.params.qmin)**2))<1e-9);
assert.equal(generators.makeWorkspaceRP(3,'offset').answer.x,'(L+q2)*cos(q1)');
assert.match(main,/planarJoint:\{[^\n]*dof:3/);
assert.match(source,/id="newPlanarSymbolic"/);
console.log('Standalone HTML, inline JavaScript, SCARA geometry, planar worksheets and RP workspace validated.');
