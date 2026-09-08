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
