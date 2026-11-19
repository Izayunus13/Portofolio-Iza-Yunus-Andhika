import * as T from 'three';
import {createKit,type V3} from './three-kit';
import {createHarborScene} from './prologue-harbor';
import {shipColors as C} from './ship-hull';
import {batchStaticDetails} from './voyage-render';

export type PirateEnvironment={dispose:()=>void;setReduced:(reduced:boolean)=>void;setSuspended:(suspended:boolean)=>void};
type Kind='harbor'|'cabin';

function chartTexture(){
 const canvas=document.createElement('canvas');canvas.width=768;canvas.height=512;
 const c=canvas.getContext('2d')!;c.fillStyle='#d6c299';c.fillRect(0,0,768,512);
 c.strokeStyle='#9c8c6a';c.lineWidth=1;
 for(let x=32;x<768;x+=48){c.beginPath();c.moveTo(x,0);c.lineTo(x,512);c.stroke();}
 for(let y=16;y<512;y+=48){c.beginPath();c.moveTo(0,y);c.lineTo(768,y);c.stroke();}
 c.fillStyle='#8c9b7d';c.strokeStyle='#666c50';c.lineWidth=3;
 for(let i=0;i<5;i++){
  const x=100+i*140,y=160+Math.sin(i*2.7)*90;c.beginPath();
  for(let j=0;j<=24;j++){const a=j/24*Math.PI*2,r=35+Math.sin(j*1.7+i)*13;c.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r*.8);}
  c.closePath();c.fill();c.stroke();
 }
 c.strokeStyle='#875c42';c.setLineDash([10,9]);c.lineWidth=3;c.beginPath();c.moveTo(80,360);c.bezierCurveTo(240,80,380,430,650,190);c.stroke();c.setLineDash([]);
 c.save();c.translate(630,390);c.strokeStyle='#66533c';
 for(let i=0;i<8;i++){c.rotate(Math.PI/4);c.beginPath();c.moveTo(0,-48);c.lineTo(10,0);c.lineTo(0,30);c.lineTo(-10,0);c.closePath();c.stroke();}
 c.restore();c.fillStyle='#66533c';c.font='italic 24px Georgia';c.fillText('The Creative Voyage',40,465);
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;return texture;
}

/** Uses the portfolio ship itself and its wood/brass palette, with no mountain assets. */
export function createPirateEnvironment(host:HTMLDivElement,kind:Kind,reducedMotion:boolean):PirateEnvironment|null{
 const canvas=document.createElement('canvas');
 const context=canvas.getContext('webgl2',{alpha:true,antialias:true,powerPreference:'low-power'});
 if(!context)return null;
 let renderer:T.WebGLRenderer;
 try{renderer=new T.WebGLRenderer({canvas,context,alpha:true,antialias:true,powerPreference:'low-power'});}catch{return null;}
 const phone=host.clientWidth<700;
 renderer.setPixelRatio(Math.min(devicePixelRatio,phone?1.15:1.5));
 renderer.setClearColor(0x000000,0);renderer.outputColorSpace=T.SRGBColorSpace;
 renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=kind==='harbor'?1.16:1.2;
 renderer.shadowMap.enabled=kind==='harbor'||!phone;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;
 canvas.setAttribute('aria-hidden','true');canvas.style.cssText='display:block;width:100%;height:100%';
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(kind==='harbor'?48:57,1,.1,260);
 const world=new T.Group();world.name='pirate-prologue-'+kind;scene.add(world);
 const k=createKit(),up=new T.Vector3(0,1,0);
 const updateObjects:((time:number,dt:number,reduced:boolean)=>void)[]=[];
 let harbor:ReturnType<typeof createHarborScene>|undefined;
 function beam(a:V3,b:V3,radius:number,color=C.darkWood){
  const start=new T.Vector3(...a),end=new T.Vector3(...b),direction=end.clone().sub(start);
  const m=k.cylinder(world,radius,direction.length(),start.add(end).multiplyScalar(.5).toArray() as V3,color);
  m.quaternion.setFromUnitVectors(up,direction.normalize());return m;
 }
 function barrel(x:number,y:number,z:number,size=1){
  const group=new T.Group();group.position.set(x,y,z);group.scale.setScalar(size);world.add(group);
  const profile=[new T.Vector2(.48,0),new T.Vector2(.59,.25),new T.Vector2(.65,.7),new T.Vector2(.59,1.15),new T.Vector2(.48,1.4)];
  k.mesh(group,new T.LatheGeometry(profile,14),C.plank,[0,0,0]);
  for(const h of [.15,.43,1.02,1.27])k.ring(group,h<.2||h>1.2?.54:.63,.04,[0,h,0],C.iron,[Math.PI/2,0,0]);
  k.cylinder(group,.48,.04,[0,1.4,0],C.lightWood);
  for(let i=0;i<14;i++){const a=i/14*Math.PI*2;k.rope(group,[[Math.sin(a)*.49,.04,Math.cos(a)*.49],[Math.sin(a)*.65,.7,Math.cos(a)*.65],[Math.sin(a)*.49,1.36,Math.cos(a)*.49]],C.darkWood,.009);}
 }
 function lantern(x:number,y:number,z:number,size=1){
  const group=new T.Group();group.name='brass-cabin-lantern';group.position.set(x,y,z);group.scale.setScalar(size);world.add(group);
  k.mesh(group,new T.BoxGeometry(.32,.5,.32),new T.MeshStandardMaterial({color:'#e3b66d',emissive:'#ffb951',emissiveIntensity:1.9,roughness:.45}));
  for(const dx of [-.19,.19])for(const dz of [-.19,.19])k.box(group,[.035,.62,.035],[dx,0,dz],C.ink);
  for(const h of [-.31,.31])k.box(group,[.45,.055,.45],[0,h,0],C.gold);
  k.mesh(group,new T.ConeGeometry(.35,.24,4),C.ink,[0,.46,0],[0,Math.PI/4,0]);
  k.ring(group,.11,.022,[0,.67,0],C.gold);
  const light=new T.PointLight('#ffd292',5,7,1.6);light.position.set(x,y,z+.35);scene.add(light);
  updateObjects.push(time=>{group.rotation.z=Math.sin(time*.65+x)*.035;light.intensity=5+Math.sin(time*2.2+x)*.18;});
 }
 if(kind==='harbor'){
  harbor=createHarborScene(scene,camera,host);
 }else{
  scene.fog=new T.FogExp2('#292d27',.014);
  camera.position.set(phone?1:0,3.5,11.8);camera.lookAt(phone?1:0,3,-5);
  scene.add(new T.HemisphereLight('#a7c8c3','#453224',1.45));
  const sun=new T.DirectionalLight('#ffe4b5',3.5);sun.position.set(8,8,-6);sun.target.position.set(-3,0,5);sun.castShadow=!phone;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-15;sun.shadow.camera.right=15;sun.shadow.camera.top=12;sun.shadow.camera.bottom=-12;sun.shadow.camera.far=45;sun.shadow.normalBias=.035;scene.add(sun,sun.target);
  const cabin=new T.Group();cabin.name='captains-cabin';world.add(cabin);
  // Individual deck boards, hull ribs and beams make this a room with real depth.
  for(let i=0;i<38;i++){
   const x=-13+i*.7;
   k.box(cabin,[.68,.15,24],[x,-.16,1],i%4===0?C.wood:i%3===0?C.plank:'#96704c');
   for(let j=0;j<4;j++)k.box(cabin,[.66,.014,.018],[x,-.078,-10+j*6+(i%2)*2.8],C.darkWood);
  }
  for(const sign of [-1,1]){
   for(let y=.35;y<8.5;y+=.48)k.box(cabin,[.28,.455,23],[sign*13,y,1],y%1>.5?C.wood:C.darkWood);
   for(const z of [-8,-3,2,7,12]){
    beam([sign*12.8,0,z],[sign*12,6.6,z],.24);
    beam([sign*12,6.6,z],[sign*8,8,z],.26);
   }
  }
  k.box(cabin,[27,.25,25],[0,8.1,1],C.darkWood);
  for(const z of [-8,-3,2,7,12])k.box(cabin,[26,.38,.42],[0,7.5,z],C.wood);
  // Stern glazing opens directly onto a turquoise sea, crossed by brass mullions.
  const outside=new T.Mesh(new T.PlaneGeometry(29,11),new T.MeshBasicMaterial({color:'#9ebfbb'}));outside.position.set(0,4.2,-8.5);cabin.add(outside);
  k.mesh(cabin,new T.PlaneGeometry(29,3.8),new T.MeshBasicMaterial({color:'#587f7b'}),[0,1.55,-8.4]);
  for(let y=.25;y<2.35;y+=.44)k.box(cabin,[26,.42,.24],[0,y,-8],y<1?C.darkWood:C.wood);
  k.box(cabin,[26,1.3,.3],[0,7.1,-8],C.darkWood);
  for(let i=0;i<6;i++){
   const x=-12.5+i*5;
   k.box(cabin,[.4,4.4,.55],[x,4.35,-7.9],C.wood);
   k.box(cabin,[.065,3.9,.58],[x+.25,4.35,-7.88],C.gold);
  }
  for(const y of [2.35,6.5]){
   k.box(cabin,[26,.23,.65],[0,y,-7.75],C.lightWood);
   k.box(cabin,[26,.045,.7],[0,y+.15,-7.7],C.gold);
  }
  for(const x of [-10,-5,0,5,10]){
   k.box(cabin,[.055,4.0,.06],[x,4.4,-7.7],C.gold);
   k.box(cabin,[4.7,.065,.065],[x,4.4,-7.7],C.gold);
  }
  // Low horizon ripples are visible through the stern windows.
  for(let i=0;i<16;i++)k.box(cabin,[1.2+(i%3)*.7,.025,.01],[-13+(i*3.7)%26,2.45+(i%4)*.18,-8.35],'#b4c3ad');
  const desk=new T.Group();desk.name='captains-chart-table';desk.position.set(5.6,0,-2.4);desk.rotation.y=-.14;world.add(desk);
  k.box(desk,[6.6,.22,3.4],[0,1.9,0],C.plank);
  k.box(desk,[6.8,.12,3.6],[0,1.73,0],C.darkWood);
  for(const x of [-2.8,2.8])for(const z of [-1.2,1.2])k.cylinder(desk,.14,1.7,[x,.85,z],C.darkWood);
  const chart=k.mesh(desk,new T.PlaneGeometry(4.4,2.6,8,6),new T.MeshStandardMaterial({map:chartTexture(),roughness:1,side:T.DoubleSide}),[-.25,2.025,.05],[-Math.PI/2,0,-.1]);chart.name='navigation-chart';
  for(const x of [-2.5,2.1])k.cylinder(desk,.13,2.75,[x,2.12,.05],C.ivory,[Math.PI/2,0,0]);
  k.cylinder(desk,.34,.09,[2.4,2.08,1],C.gold);
  k.mesh(desk,new T.ConeGeometry(.18,.065,4),C.ink,[2.4,2.16,1],[0,.4,0]);
  for(let i=0;i<3;i++){k.box(desk,[.8,.14,.62],[-2.3,2.09+i*.16,-.9],i%2?C.ink:C.darkWood,[0,.12*i,0]);k.box(desk,[.71,.085,.6],[-2.25,2.09+i*.16,-.9],C.ivory,[0,.12*i,0]);}
  barrel(10.5,0,-3,1.35);barrel(11.5,0,-5.3,1.1);barrel(-10.5,0,-4,1.3);
  // Brass-bound chest matches the treasure fittings on the original model.
  const chest=new T.Group();chest.position.set(-7.5,0,-3.6);chest.rotation.y=.16;world.add(chest);
  k.box(chest,[2.7,1.2,1.65],[0,.6,0],C.wood);
  const lid=k.mesh(chest,new T.CylinderGeometry(.82,.82,2.7,16,1,false,0,Math.PI),C.plank,[0,1.2,0],[0,0,Math.PI/2]);lid.rotation.y=Math.PI/2;
  for(const x of [-.95,.95]){k.box(chest,[.12,1.2,1.7],[x,.6,0],C.gold);k.ring(chest,.84,.055,[x,1.2,0],C.gold,[0,Math.PI/2,0]);}
  k.box(chest,[.3,.37,.06],[0,.95,.87],C.gold);
  lantern(-10,4.5,-6.8,1.25);lantern(10,4.5,-6.8,1.25);lantern(7.8,2.55,-2.8,1.1);
  // A hanging compass rose and chart shelf leave the centre of the cabin open.
  k.ring(world,.65,.08,[-10.6,4,-7.3],C.gold);
  for(let i=0;i<4;i++)k.box(world,[.06,1.55,.055],[-10.6,4,-7.25],C.gold,[0,0,i*Math.PI/4]);
  k.box(world,[3.3,.16,.7],[-8.5,2,-7.3],C.darkWood);
  for(let i=0;i<6;i++)k.cylinder(world,.12,1.1,[-9.6+i*.37,2.25,-7.2],C.ivory,[Math.PI/2,0,.06*(i%2)]);
  host.dataset.interior='captains-cabin';host.dataset.palette='portfolio-ship';
  batchStaticDetails(cabin);
 }
 const reduced={value:reducedMotion};let frame=0,disposed=false,suspended=false,last=0,elapsed=0;
 // Foreground sailing follows the display on desktop; quiet cabin motion needs fewer frames.
 const frameInterval=1000/(phone||kind==='cabin'?30:60);
 const update=(now:number)=>{
  const delta=last?Math.max(0,(now-last)/1000):0,dt=Math.min(delta,.1);
  if(!reduced.value)elapsed+=delta;
  const time=elapsed;
  harbor?.update(time,dt,reduced.value);
  updateObjects.forEach(update=>update(time,dt,reduced.value));
  if(kind==='cabin'){camera.rotation.z=reduced.value?0:Math.sin(time*.21)*.0018;}
  renderer.render(scene,camera);renderer.shadowMap.needsUpdate=false;host.dataset.frameTime=String(time.toFixed(2));last=now;
 };
 const render=(now:number)=>{
  frame=0;
  if(disposed||suspended||document.hidden)return;
  if(!last||now-last>=frameInterval-1)update(now);
  if(!reduced.value)frame=requestAnimationFrame(render);
 };
 const resize=()=>{
  if(disposed||!host.clientWidth||!host.clientHeight)return;
  renderer.setSize(host.clientWidth,host.clientHeight,false);camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix();harbor?.resize();renderer.shadowMap.needsUpdate=true;update(performance.now());
 };
 host.appendChild(canvas);const observer=new ResizeObserver(resize);observer.observe(host);
 const resume=()=>{cancelAnimationFrame(frame);frame=0;last=0;if(!disposed&&!suspended&&!document.hidden)frame=requestAnimationFrame(render);};
 const visibility=()=>resume();
 document.addEventListener('visibilitychange',visibility);resize();frame=requestAnimationFrame(render);
 return {
  setReduced(value){if(reduced.value===value)return;reduced.value=value;resume();},
  setSuspended(value){if(suspended===value)return;suspended=value;host.dataset.suspended=String(value);resume();},
  dispose(){
   disposed=true;cancelAnimationFrame(frame);observer.disconnect();document.removeEventListener('visibilitychange',visibility);
   const geometries=new Set<T.BufferGeometry>(),materials=new Set<T.Material>(),textures=new Set<T.Texture>();
   scene.traverse(object=>{
    if(object instanceof T.Mesh){geometries.add(object.geometry);for(const material of Array.isArray(object.material)?object.material:[object.material]){materials.add(material);for(const value of Object.values(material))if(value instanceof T.Texture)textures.add(value);}}
    if(object instanceof T.Light&&'shadow' in object)(object as T.DirectionalLight).shadow?.map?.dispose();
   });
   geometries.forEach(value=>value.dispose());materials.forEach(value=>value.dispose());textures.forEach(value=>value.dispose());renderer.dispose();renderer.forceContextLoss();canvas.remove();
  }
 };
}
