import * as T from 'three';
import {createKit,type V3} from './three-kit';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {harborVerticalFov} from './harbor-framing';
import {createPirateShip} from './pirate-ship';
import {shipColors as C} from './ship-hull';
import {batchStaticDetails} from './voyage-render';
import {createHarborOcean,harborWaterHeight} from './harbor-ocean';
import {voyageSeaPalette} from './sea-palette';
import {createHarborFleet} from './harbor-fleet';
import {createHullWaterContact,harborDraft} from './harbor-water-contact';

export const harborLoopSeconds=44;
const shipDepth=-48;
const waveHeight=harborWaterHeight;

/** The whole ship clears each edge before the loop resets out of sight. */
export function harborPass(time:number,extent:number){
 const progress=((time/harborLoopSeconds+.20)%1+1)%1;
 return {x:T.MathUtils.lerp(-extent,extent,progress),progress,cycle:Math.floor(time/harborLoopSeconds+.20)};
}

function makePierWood(){
 const canvas=document.createElement('canvas');canvas.width=128;canvas.height=512;
 const c=canvas.getContext('2d')!;c.fillStyle='#bfb5a0';c.fillRect(0,0,128,512);
 for(let i=0;i<110;i++){
  const x=(i*47.17)%128;c.strokeStyle=i%3?'#654a3426':'#e1c38a40';c.lineWidth=i%4===0?1.5:.6;
  c.beginPath();c.moveTo(x,0);c.bezierCurveTo(x+Math.sin(i)*9,140,x-Math.cos(i)*8,350,x+Math.sin(i*.3)*5,512);c.stroke();
 }
 for(const [x,y] of [[36,115],[87,365]]){
  c.strokeStyle='#71523755';for(let i=0;i<4;i++){c.beginPath();c.ellipse(x,y,3+i*2,8+i*7,.08,0,Math.PI*2);c.stroke();}
 }
 const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;map.anisotropy=4;
 const relief=document.createElement('canvas');relief.width=128;relief.height=512;
 const context=relief.getContext('2d')!,image=c.getImageData(0,0,128,512);
 for(let i=0;i<image.data.length;i+=4){
  const height=Math.max(0,Math.min(255,128+(image.data[i]*.3+image.data[i+1]*.59+image.data[i+2]*.11-177)*2));
  image.data[i]=image.data[i+1]=image.data[i+2]=height;
 }
 context.putImageData(image,0,0);const bumpMap=new T.CanvasTexture(relief);bumpMap.anisotropy=4;
 map.wrapS=map.wrapT=bumpMap.wrapS=bumpMap.wrapT=T.RepeatWrapping;
 return {map,bumpMap};
}

function createWake(scene:T.Scene,scale:number){
 const count=42,positions=new Float32Array((count-1)*2*6*3),colors=new Float32Array((count-1)*2*6*4);
 const geometry=new T.BufferGeometry();
 geometry.setAttribute('position',new T.BufferAttribute(positions,3).setUsage(T.DynamicDrawUsage));
 geometry.setAttribute('color',new T.BufferAttribute(colors,4).setUsage(T.DynamicDrawUsage));
 const material=new T.MeshBasicMaterial({color:'#e8f2df',vertexColors:true,transparent:true,depthWrite:false,side:T.DoubleSide});
 const wake=new T.Mesh(geometry,material);wake.name='harbor-sailing-wake';wake.frustumCulled=false;wake.renderOrder=2;scene.add(wake);
 return {update(time:number,x:number,speed:number,reduced:boolean,extent:number){
  let vertex=0;
  const write=(age:number,side:number,edge:number)=>{
   const wx=x-3.2*scale-speed*age,wz=shipDepth+side*(1.05*scale+age*.42)+edge*(.07+age*.09);
   positions[vertex*3]=wx;positions[vertex*3+1]=waveHeight(wx,wz,time)+.045;positions[vertex*3+2]=wz;
   colors[vertex*4]=1;colors[vertex*4+1]=1;colors[vertex*4+2]=1;colors[vertex*4+3]=Math.pow(1-age/5.5,2)*.55;
   vertex++;
  };
  if(!reduced)for(let i=0;i<count-1;i++){
   const a=i/(count-1)*5.5,b=(i+1)/(count-1)*5.5;
   // The new pass cannot inherit a stripe across the ocean from the previous pass.
   if(x-speed*b < -extent+3)continue;
   for(const side of [-1,1]){
    write(a,side,-1);write(b,side,-1);write(a,side,1);
    write(a,side,1);write(b,side,-1);write(b,side,1);
   }
  }
  geometry.setDrawRange(0,vertex);geometry.attributes.position.needsUpdate=true;geometry.attributes.color.needsUpdate=true;
 }};
}

/** A passing fleet and distant islands beyond a low wooden pier. */
export function createHarborScene(scene:T.Scene,camera:T.PerspectiveCamera,host:HTMLDivElement){
 const phone=host.clientWidth<=700,k=createKit(),scale=phone?1.0:1.35;
 scene.fog=new T.FogExp2(voyageSeaPalette.horizon,.0055);
 camera.fov=48;camera.far=750;camera.position.set(0,6.8,18);camera.lookAt(0,3.8,-28);
 scene.add(new T.HemisphereLight('#edf4fa','#244765',2.05));
 const sun=new T.DirectionalLight('#ffe6b5',2.8);sun.position.set(-35,45,25);sun.castShadow=true;
 sun.target.position.set(0,0,1);sun.shadow.mapSize.set(phone?512:1024,phone?512:1024);
 sun.shadow.camera.left=-30;sun.shadow.camera.right=30;sun.shadow.camera.top=20;sun.shadow.camera.bottom=-20;sun.shadow.camera.far=120;
 sun.shadow.normalBias=.025;sun.shadow.bias=-.00008;scene.add(sun,sun.target);
 const ocean=createHarborOcean(scene,phone),wake=createWake(scene,scale),fleet=createHarborFleet(scene,camera,host);
 const vessel=createPirateShip(),heading=.42,contact=createHullWaterContact(scene,scale,heading);
 const forward=new T.Vector2(Math.cos(heading),-Math.sin(heading)),side=new T.Vector2(Math.sin(heading),Math.cos(heading));
 vessel.ship.name='harbor-passing-pirate-ship';vessel.ship.rotation.order='YXZ';vessel.ship.rotation.y=heading;vessel.ship.scale.setScalar(scale);scene.add(vessel.ship);
 vessel.flagAnimation.update(1,0,{velocityX:2,velocityZ:0,heading,reduced:true});
 // Keep articulated roots and cloth out of the static batches.
 batchStaticDetails(vessel.ship,new Set<T.Object3D>([vessel.flag,...vessel.sails,...vessel.animation.dynamicRoots]));
 const pier=new T.Group();pier.name='foreground-wooden-pier';scene.add(pier);
 const timberMaps=makePierWood();
 const boardMaterials=['#a27b52','#96704c','#ac855a'].map(color=>new T.MeshStandardMaterial({color,...timberMaps,bumpScale:.045,roughness:.84}));
 const fasciaMaterial=new T.MeshStandardMaterial({color:'#745138',...timberMaps,bumpScale:.035,roughness:.9});
 const fasteners:V3[]=[];
 // A solid subdeck seals the seams; individual, bevelled planks provide the depth.
 k.mesh(pier,new T.BoxGeometry(60,.34,20.2),fasciaMaterial,[.07,.13,3]);
 for(let i=0;i<52;i++){
  const x=-29+i*1.14,joins=[-7,-3.3+(i%3)*1.1,3.8+(i%2)*1.3,13];
  for(let segment=0;segment<joins.length-1;segment++){
   const start=joins[segment],end=joins[segment+1],length=end-start;
   const plank=k.mesh(pier,new RoundedBoxGeometry(1.11,.26,length-.026,1,.018),boardMaterials[i%3],[x,.20,(start+end)*.5]);
   const uv=plank.geometry.getAttribute('uv');
   for(let vertex=0;vertex<uv.count;vertex++)uv.setXY(vertex,uv.getX(vertex)+i*.193,uv.getY(vertex)*length/6+segment*.37+i*.11);
   for(const offset of [-.32,.32])for(const z of [start+.14,end-.14])fasteners.push([x+offset,.338,z]);
  }
 }
 k.mesh(pier,new RoundedBoxGeometry(60,.56,.42,1,.035),fasciaMaterial,[0,.03,-7.15]);
 k.box(pier,[60,.065,.10],[0,.33,-7.34],C.lightWood);
 // Low moorings cast a cached shadow onto the boards, without covering the horizon.
 for(const x of phone?[-4.6,4.6]:[-16,-10,10,16]){
  k.cylinder(pier,.25,2,[x,.25,-6.65],C.darkWood);
  k.cylinder(pier,.29,.13,[x,1.25,-6.65],C.lightWood);
  k.cylinder(pier,.31,.045,[x,.352,-6.65],C.iron);
  for(const y of [.78,.88,.98])k.ring(pier,.265,.038,[x,y,-6.65],C.rope,[Math.PI/2,0,0]);
 }
 const nails=new T.InstancedMesh(new T.CylinderGeometry(.032,.032,.012,8),new T.MeshStandardMaterial({color:C.iron,metalness:.4,roughness:.7}),fasteners.length);
 const dummy=new T.Object3D();
 fasteners.forEach((position,index)=>{dummy.position.set(...position);dummy.updateMatrix();nails.setMatrixAt(index,dummy.matrix);});
 nails.receiveShadow=true;pier.add(nails);batchStaticDetails(pier);
 let extent=48;
 const resize=()=>{
  camera.fov=harborVerticalFov(host.clientWidth,host.clientHeight);camera.updateProjectionMatrix();
  const distance=camera.position.z-shipDepth;
  extent=distance*Math.tan(T.MathUtils.degToRad(camera.fov/2))*camera.aspect+7.5;
  host.dataset.shipExtent=extent.toFixed(3);fleet.resize();
  const edge=new T.Vector3(0,.33,-7.34).project(camera);
  host.dataset.pierEdgeY=((1-edge.y)*host.clientHeight*.5).toFixed(3);
  host.dataset.cameraFov=camera.fov.toFixed(4);
 };
 host.dataset.shipModel='portfolio-pirate-ship';host.dataset.foreground='wooden-pier';
 host.dataset.shipLoopSeconds=String(harborLoopSeconds);host.dataset.ocean='waves-and-wake';
 host.dataset.oceanModel='gerstner-turquoise';host.dataset.waterColor=ocean.color;host.dataset.waterline='submerged-hull';
 return {
  resize,
  update(time:number,dt:number,reduced:boolean){
   const pass=harborPass(time,extent),speed=extent*2/harborLoopSeconds;
   const bow=waveHeight(pass.x+forward.x*2.8*scale,shipDepth+forward.y*2.8*scale,time);
   const stern=waveHeight(pass.x-forward.x*2.8*scale,shipDepth-forward.y*2.8*scale,time);
   const starboard=waveHeight(pass.x+side.x*1.05*scale,shipDepth+side.y*1.05*scale,time);
   const port=waveHeight(pass.x-side.x*1.05*scale,shipDepth-side.y*1.05*scale,time);
   const surface=(bow+stern+starboard+port)*.25;
   vessel.ship.position.set(pass.x,surface-harborDraft*scale,shipDepth);
   vessel.ship.rotation.z=Math.atan2(bow-stern,5.6*scale);
   vessel.ship.rotation.x=-Math.atan2(starboard-port,2.1*scale);
   vessel.flagAnimation.update(dt,time,{velocityX:speed,velocityZ:0,heading,reduced});
   vessel.animation.update(dt,time,{speed:reduced?0:speed,turnRate:0,roll:0,pitch:0,sailing:false,reduced});
   ocean.update(time);fleet.update(time);wake.update(time,pass.x,speed,reduced,extent);contact.update(pass.x,shipDepth,time);
   vessel.ship.updateMatrixWorld(true);
   const keel=vessel.ship.localToWorld(new T.Vector3(0,.14,0)),deck=vessel.ship.localToWorld(new T.Vector3(0,1.74,0));
   host.dataset.keelClearance=(keel.y-waveHeight(keel.x,keel.z,time)).toFixed(4);
   host.dataset.deckClearance=(deck.y-waveHeight(deck.x,deck.z,time)).toFixed(4);
   const screen=vessel.ship.position.clone().add(new T.Vector3(0,3*scale,0)).project(camera);
   host.dataset.shipX=pass.x.toFixed(4);host.dataset.shipScreenX=screen.x.toFixed(4);
   host.dataset.shipProgress=pass.progress.toFixed(5);host.dataset.shipCycle=String(pass.cycle);
   host.dataset.waveHeight=waveHeight(4,-12,time).toFixed(5);
  }
 };
}
