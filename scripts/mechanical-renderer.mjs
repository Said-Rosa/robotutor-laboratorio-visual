/* Fixed CAD-style plates. Meshes use the exercise's world coordinates; the
 * orthographic camera is shared with SVG dimensions. No animation or controls.
 * One reusable WebGL context, bounded image cache and explicit GPU disposal.
 */
import {Scene,Color,Vector3,Matrix4,Box3,Mesh,MeshStandardMaterial,MeshBasicMaterial,CanvasTexture,OrthographicCamera,
 WebGLRenderer,DirectionalLight,HemisphereLight,CylinderGeometry,PlaneGeometry,
 Shape,ExtrudeGeometry,PCFSoftShadowMap,ACESFilmicToneMapping,SRGBColorSpace} from 'three';
let renderer,unavailable=false;
const cache=new Map();
const vec=a=>new Vector3(...a);
function roundedBeam(width,height,length){
 const radius=Math.min(width,height,length)*.09,x=width/2-radius,y=height/2-radius;
 const shape=new Shape();
 shape.moveTo(-x,-height/2);shape.lineTo(x,-height/2);shape.quadraticCurveTo(width/2,-height/2,width/2,-y);
 shape.lineTo(width/2,y);shape.quadraticCurveTo(width/2,height/2,x,height/2);
 shape.lineTo(-x,height/2);shape.quadraticCurveTo(-width/2,height/2,-width/2,y);
 shape.lineTo(-width/2,-y);shape.quadraticCurveTo(-width/2,-height/2,-x,-height/2);
 const bevel=Math.min(radius*.4,length*.04);
 const geometry=new ExtrudeGeometry(shape,{depth:Math.max(.0001,length-2*bevel),bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:bevel,bevelThickness:bevel,curveSegments:5});
 geometry.translate(0,0,-length/2+bevel);return geometry;
}
export function render(description,view,scale,rect){
 if(unavailable)return null;
 const key=JSON.stringify([description.solids,view,scale,rect]);
 if(cache.has(key))return cache.get(key);
 const scene=new Scene(),geometries=[],materials=[],lights=[],textures=[];
 try{
  if(!renderer){
   renderer=new WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:true,powerPreference:'low-power'});
   renderer.outputColorSpace=SRGBColorSpace;renderer.toneMapping=ACESFilmicToneMapping;renderer.toneMappingExposure=1.18;
   renderer.shadowMap.enabled=true;renderer.shadowMap.type=PCFSoftShadowMap;
   renderer.domElement.addEventListener('webglcontextlost',()=>{unavailable=true;cache.clear()});
  }
  const [x,y,w,h]=rect,density=Math.min(2,1500/Math.max(w,h));
  renderer.setPixelRatio(1);renderer.setSize(Math.ceil(w*density),Math.ceil(h*density),false);
  scene.background=new Color('#f5f7f9');
  const radius=Math.max(2,...description.solids.flatMap(s=>[Math.hypot(...s.a)+s.width,Math.hypot(...s.b)+s.width]));
  const camera=new OrthographicCamera(x/scale,(x+w)/scale,-y/scale,-(y+h)/scale,.01,radius*8);
  camera.position.copy(vec(view).multiplyScalar(radius*3));camera.up.set(0,0,1);camera.lookAt(0,0,0);
  const material=(color,metalness=.25,roughness=.34)=>{const m=new MeshStandardMaterial({color,metalness,roughness});materials.push(m);return m};
  const palette={link:material('#a8b8ca'),revolute:material('#728ba3'),hub:material('#344d62',.48,.26),tool:material('#198c91',.32,.28),pad:material('#172d35',.02,.68),slider:material('#dae2e8',.65,.23),guide:material('#637b90')};
  for(const solid of description.solids){
   const a=vec(solid.a),b=vec(solid.b),axis=b.clone().sub(a).normalize(),length=a.distanceTo(b);
   const geometry=solid.kind==='cylinder'?new CylinderGeometry(solid.width,solid.width,length,64):roundedBeam(solid.width,solid.height,length);
   geometries.push(geometry);const mesh=new Mesh(geometry,palette[solid.part]||palette.link);
   mesh.position.copy(a).add(b).multiplyScalar(.5);
   if(solid.kind==='cylinder')mesh.quaternion.setFromUnitVectors(new Vector3(0,1,0),axis);
   else{
    const reference=Math.abs(axis.z)>.85?new Vector3(1,0,0):new Vector3(0,0,1);
    const u=solid.side?vec(solid.side).normalize():axis.clone().cross(reference).normalize(),v=axis.clone().cross(u).normalize();
    mesh.quaternion.setFromRotationMatrix(new Matrix4().makeBasis(u,v,axis));
   }
   mesh.castShadow=true;mesh.receiveShadow=true;scene.add(mesh);
  }
  const fill=new HemisphereLight('#f2f7ff','#5f7183',2.0);fill.position.set(0,0,1);scene.add(fill);
  const keyLight=new DirectionalLight('#fff5e8',3.5);
  // Lighting relative to camera keeps the rounded bearing faces readable for every posture.
  const right=new Vector3(-view[1],view[0],0).normalize();
  keyLight.position.copy(vec(view).multiplyScalar(radius)).addScaledVector(right,-radius*.7).add(new Vector3(0,0,radius*1.7));
  keyLight.castShadow=true;keyLight.shadow.mapSize.set(2048,2048);
  Object.assign(keyLight.shadow.camera,{left:-radius,right:radius,top:radius,bottom:-radius,near:.1,far:radius*6});
  keyLight.shadow.normalBias=.015;keyLight.shadow.bias=-.00008;keyLight.shadow.radius=3;
  lights.push(keyLight);scene.add(keyLight);
  const rim=new DirectionalLight('#c4e2ff',2);rim.position.copy(right.multiplyScalar(radius*2)).add(new Vector3(0,0,radius));scene.add(rim);
  // A soft contact shadow grounds the pedestal without a long arm silhouette
  // crossing dimensions or being cut off by the tightly fitted worksheet.
  scene.updateMatrixWorld(true);const floor=new Box3().setFromObject(scene).min.z-.012;
  const groundGeometry=new PlaneGeometry(radius*30,radius*30);geometries.push(groundGeometry);
  const ground=new Mesh(groundGeometry,material('#f5f7f9',0,.95));
  ground.position.z=floor;scene.add(ground);
  const canvas=document.createElement('canvas');canvas.width=canvas.height=128;
  const context=canvas.getContext('2d'),gradient=context.createRadialGradient(64,64,8,64,64,64);
  gradient.addColorStop(0,'rgba(30,48,66,.27)');gradient.addColorStop(.5,'rgba(30,48,66,.13)');gradient.addColorStop(1,'rgba(30,48,66,0)');
  context.fillStyle=gradient;context.fillRect(0,0,128,128);
  const texture=new CanvasTexture(canvas);textures.push(texture);
  const shadowMaterial=new MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,toneMapped:false});materials.push(shadowMaterial);
  const footRadius=description.solids[0].width,shadowGeometry=new PlaneGeometry(footRadius*4.5,footRadius*4.5);geometries.push(shadowGeometry);
  const contact=new Mesh(shadowGeometry,shadowMaterial);contact.position.set(0,0,floor+.003);scene.add(contact);
  renderer.render(scene,camera);
  const image=renderer.domElement.toDataURL('image/png');
  cache.set(key,image);while(cache.size>8)cache.delete(cache.keys().next().value);
  return image;
 }catch(error){
  unavailable=true;console.warn('Lámina 3D: se conserva el dibujo técnico compatible.',error.message);return null;
 }finally{
  geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());lights.forEach(l=>l.shadow.map?.dispose());renderer?.renderLists.dispose();
 }
}
