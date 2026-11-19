import * as T from 'three';
import {buildGateLeaf,gateSealOverhang} from './gate-leaf';
import {prologueDuration} from './prologue-timing';
import {createGateTimberMaps} from './gate-materials';
import {batchStaticDetails} from './voyage-render';

type Phase='idle'|'welcoming'|'revealing'|'about'|'departing';
export type GateEnvironment={setPhase:(phase:Phase)=>void;setReduced:(value:boolean)=>void;dispose:()=>void};
const smooth=(value:number)=>{const t=T.MathUtils.clamp(value,0,1);return t*t*t*(t*(t*6-15)+10);};

/** Two solid timber leaves slide together, swing on outer hinges, then pass the camera. */
export function createPirateGate(host:HTMLDivElement,reducedMotion:boolean,onCover:()=>void=()=>{}):GateEnvironment|null{
 const canvas=document.createElement('canvas'),context=canvas.getContext('webgl2',{alpha:true,antialias:true,powerPreference:'low-power'});
 if(!context)return null;
 const renderer=new T.WebGLRenderer({canvas,context,alpha:true,antialias:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,host.clientWidth<700?1.15:1.5));renderer.setClearColor(0,0);
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap;renderer.shadowMap.autoUpdate=false;
 renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.13;
 canvas.setAttribute('aria-hidden','true');canvas.style.cssText='display:block;width:100%;height:100%';
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(45,1,.5,100);
 camera.position.set(0,0,28);camera.lookAt(0,0,0);
 scene.add(new T.HemisphereLight('#f4e5c8','#233f48',2.15));
 const key=new T.DirectionalLight('#ffe4b7',3.1);key.position.set(-14,20,30);key.castShadow=true;
 const shadowSize=host.clientWidth<700?1024:2048;key.shadow.mapSize.set(shadowSize,shadowSize);key.shadow.radius=1.8;
 key.target.position.set(0,0,3);key.shadow.camera.near=.5;key.shadow.camera.far=100;
 key.shadow.normalBias=.018;key.shadow.bias=-.00002;scene.add(key,key.target);
 const fill=new T.DirectionalLight('#aacbd9',1.25);fill.position.set(16,3,15);scene.add(fill);
 const grain=createGateTimberMaps();
 const timber=new T.MeshStandardMaterial({color:'#936943',...grain,bumpScale:.04,roughness:.86});
 const darkWood=new T.MeshStandardMaterial({color:'#4c3b2c',...grain,bumpScale:.025,roughness:.94});
 const teal=new T.MeshStandardMaterial({color:'#477b72',...grain,bumpScale:.025,roughness:.82});
 const tealDark=new T.MeshStandardMaterial({color:'#3b695f',...grain,bumpScale:.022,roughness:.86});
 const brass=new T.MeshStandardMaterial({color:'#d1b573',metalness:.7,roughness:.3});
 const iron=new T.MeshStandardMaterial({color:'#303e41',metalness:.55,roughness:.5});
 const glass=new T.MeshPhysicalMaterial({color:'#224858',metalness:.22,roughness:.16,clearcoat:1,clearcoatRoughness:.13});
 const left=new T.Group(),right=new T.Group();left.name='port-gate-leaf';right.name='starboard-gate-leaf';scene.add(left,right);
 function label(text:string){
  const image=document.createElement('canvas');image.width=1024;image.height=128;const context=image.getContext('2d')!;
  context.fillStyle='#d7c08b';context.textAlign='center';context.textBaseline='middle';context.font='500 73px Georgia';context.fillText(text,512,69);
  const texture=new T.CanvasTexture(image);texture.colorSpace=T.SRGBColorSpace;
  return new T.MeshBasicMaterial({map:texture,alphaTest:.15,transparent:false,depthWrite:true});
 }
 const labels=[label("CAPTAIN'S"),label('QUARTERS')];
 function buildLeaf(root:T.Group,width:number,side:-1|1){
  buildGateLeaf(root,width,side,{timber,darkWood,teal,tealDark,brass,iron,glass,lettering:labels[side===-1?0:1]});
  batchStaticDetails(root);
 }
 // Fix the light projection for the entire passage; changing it per frame causes shadow swimming.
 function fitShadows(){
  const shadow=key.shadow.camera;
  shadow.position.copy(key.position);shadow.lookAt(key.target.position);shadow.updateMatrixWorld(true);
  const bounds=new T.Box3(),point=new T.Vector3(),span=extent+leafWidth*.25+1;
  for(const x of [-span,span])for(const y of [-13,13])for(const z of [-.6,leafWidth+1.5]){
   point.set(x,y,z).applyMatrix4(shadow.matrixWorldInverse);bounds.expandByPoint(point);
  }
  const width=bounds.max.x-bounds.min.x+2,height=bounds.max.y-bounds.min.y+2;
  const stepX=width/key.shadow.mapSize.x,stepY=height/key.shadow.mapSize.y;
  const centreX=Math.round((bounds.min.x+bounds.max.x)*.5/stepX)*stepX;
  const centreY=Math.round((bounds.min.y+bounds.max.y)*.5/stepY)*stepY;
  shadow.left=centreX-width*.5;shadow.right=centreX+width*.5;
  shadow.bottom=centreY-height*.5;shadow.top=centreY+height*.5;shadow.updateProjectionMatrix();
 }
 function clearGeometry(root:T.Group){root.traverse(object=>{if(object instanceof T.Mesh)object.geometry.dispose();});root.clear();}
 let phase:Phase='idle',reduced=reducedMotion,start=0,frame=0,disposed=false,lastTime=0,extent=16,leafWidth=16,notified=false,lastAspect=0;
 host.dataset.style='captains-double-door';host.dataset.covered='false';
 host.dataset.surface='painted-timber-relief';host.dataset.textureSize='256x512';
 function draw(time:number){
  if(disposed)return;
  const active=phase==='revealing'&&!reduced;
  const close=active?smooth((time-.10)/1.48):0,open=active?smooth((time-2.10)/2.5):0;
  const zoom=active?smooth((time-2.12)/2.65):0;
  camera.position.z=T.MathUtils.lerp(28,11.8,zoom);camera.updateMatrixWorld(true);
  left.position.set(-leafWidth-leafWidth*1.23*(1-close),0,0);
  right.position.set(leafWidth+leafWidth*1.23*(1-close),0,0);
  left.rotation.y=-open*Math.PI*.55;right.rotation.y=open*Math.PI*.55;
  left.visible=right.visible=phase==='idle'||phase==='welcoming'||phase==='revealing';
  scene.updateMatrixWorld(true);
  const project=(root:T.Group,side:-1|1)=>{
   const x0=side===-1?.065:-leafWidth+.065,x1=side===-1?leafWidth+gateSealOverhang-.02:-.065;
   const points=[new T.Vector3(x0,-12.32,.84),new T.Vector3(x1,-12.32,.84),new T.Vector3(x0,12.32,.84),new T.Vector3(x1,12.32,.84)].map(p=>root.localToWorld(p).project(camera));
   return {minX:Math.min(...points.map(p=>p.x)),maxX:Math.max(...points.map(p=>p.x)),minY:Math.min(...points.map(p=>p.y)),maxY:Math.max(...points.map(p=>p.y))};
  };
  const a=project(left,-1),b=project(right,1);
  const covered=active&&open<.0001&&a.minX<=-1.005&&b.maxX>=1.005&&a.maxX>=b.minX&&a.minY<=-1.005&&b.minY<=-1.005&&a.maxY>=1.005&&b.maxY>=1.005;
  const leftCentre=left.localToWorld(new T.Vector3(leafWidth*.5,0,.36)).project(camera),rightCentre=right.localToWorld(new T.Vector3(-leafWidth*.5,0,.36)).project(camera);
  host.dataset.covered=String(covered);host.dataset.closeProgress=close.toFixed(4);host.dataset.openProgress=open.toFixed(4);
  host.dataset.leftX=leftCentre.x.toFixed(4);host.dataset.rightX=rightCentre.x.toFixed(4);
  host.dataset.leftAngle=left.rotation.y.toFixed(4);host.dataset.rightAngle=right.rotation.y.toFixed(4);
  host.dataset.zoom=(28/camera.position.z).toFixed(4);host.dataset.time=time.toFixed(3);
  host.dataset.stage=!active?phase:open>.9999&&zoom>.9999?'clear':time>=2.1?'opening':covered?'closed':'closing';
  renderer.shadowMap.needsUpdate=true;renderer.render(scene,camera);lastTime=time;
  host.dataset.drawCalls=String(renderer.info.render.calls);
  if(covered&&!notified){notified=true;onCover();}
 }
 function animate(now:number){
  if(disposed||phase!=='revealing'||reduced)return;
  const time=(now-start)/1000;draw(time);
  if(time<prologueDuration/1000)frame=requestAnimationFrame(animate);
 }
 function resize(){
  if(disposed||!host.clientWidth||!host.clientHeight)return;
  const aspect=host.clientWidth/host.clientHeight;
  camera.aspect=aspect;camera.updateProjectionMatrix();
  extent=28*Math.tan(T.MathUtils.degToRad(camera.fov/2))*aspect;leafWidth=extent+.30;
  if(Math.abs(aspect-lastAspect)>.0001){
   clearGeometry(left);clearGeometry(right);
   buildLeaf(left,leafWidth,-1);buildLeaf(right,leafWidth,1);
   lastAspect=aspect;
  }
  fitShadows();renderer.setSize(host.clientWidth,host.clientHeight,false);draw(lastTime);
 }
 host.appendChild(canvas);const observer=new ResizeObserver(resize);observer.observe(host);resize();
 return {
  setPhase(value){if(phase===value)return;phase=value;cancelAnimationFrame(frame);if(value==='revealing'){notified=false;start=performance.now();draw(0);if(!reduced)frame=requestAnimationFrame(animate);}else draw(0);},
  setReduced(value){reduced=value;cancelAnimationFrame(frame);if(phase==='revealing'&&!reduced)frame=requestAnimationFrame(animate);else draw(lastTime);},
  dispose(){
   disposed=true;cancelAnimationFrame(frame);observer.disconnect();
   const geometries=new Set<T.BufferGeometry>(),materials=new Set<T.Material>(),textures=new Set<T.Texture>();
   scene.traverse(object=>{if(object instanceof T.Mesh){geometries.add(object.geometry);for(const material of Array.isArray(object.material)?object.material:[object.material]){materials.add(material);for(const value of Object.values(material))if(value instanceof T.Texture)textures.add(value);}}});
   geometries.forEach(value=>value.dispose());materials.forEach(value=>value.dispose());textures.forEach(value=>value.dispose());key.shadow.map?.dispose();renderer.dispose();renderer.forceContextLoss();canvas.remove();
  }
 };
}
