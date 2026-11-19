import * as T from 'three';
import {createCargoModels,type CargoItem} from './pirate-cargo-models';
import {prologueDuration} from './prologue-timing';

type Phase='idle'|'revealing'|'about'|'departing';
export type CargoEnvironment={setPhase:(phase:Phase)=>void;setReduced:(value:boolean)=>void;dispose:()=>void};
type Piece={model:number;x:number;y:number;z:number;base:number;targetX:number;targetY:number;start:number;fall:number;seed:number;cell:boolean;front:number};
type Batch={mesh:T.InstancedMesh;local:T.Matrix4};
type Rect={left:number;right:number;bottom:number;top:number};
const clamp=T.MathUtils.clamp,lerp=T.MathUtils.lerp,growth=1.12;
const smooth=(value:number)=>{const t=clamp(value,0,1);return t*t*t*(t*(t*6-15)+10);};

/** An exact union of conservative, opaque crate rectangles must cover every scanline. */
function coversViewport(rectangles:Rect[]){
 const levels=[-1,1,...rectangles.flatMap(r=>[r.bottom,r.top]).filter(y=>y>-1&&y<1)].sort((a,b)=>a-b);
 for(let i=0;i<levels.length-1;i++){
  if(levels[i+1]-levels[i]<.000001)continue;
  const y=(levels[i]+levels[i+1])*.5;
  const intervals=rectangles.filter(r=>r.bottom<=y&&r.top>=y).sort((a,b)=>a.left-b.left);
  let end=-1;
  for(const interval of intervals){if(interval.left>end+.00001)break;if(interval.right>end)end=interval.right;}
  if(end<1)return false;
 }
 return true;
}

/** A pile of modestly sized pieces assembles, holds, then falls with gravity. */
export function createPirateCargo(host:HTMLDivElement,reducedMotion:boolean,onCover:()=>void=()=>{}):CargoEnvironment|null{
 const canvas=document.createElement('canvas'),context=canvas.getContext('webgl2',{alpha:true,antialias:true,powerPreference:'low-power'});
 if(!context)return null;
 const renderer=new T.WebGLRenderer({canvas,context,alpha:true,antialias:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,host.clientWidth<700?1.15:1.5));renderer.setClearColor(0,0);
 renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
 canvas.setAttribute('aria-hidden','true');canvas.style.cssText='display:block;width:100%;height:100%';
 const scene=new T.Scene(),camera=new T.OrthographicCamera(-15,15,10,-10,.1,250);
 camera.position.set(0,0,90);camera.lookAt(0,0,0);
 scene.add(new T.HemisphereLight('#fff0d3','#2d4d57',2.1));
 const key=new T.DirectionalLight('#ffe3b4',3.4);key.position.set(-12,18,30);scene.add(key);
 const fill=new T.DirectionalLight('#a8c8db',1.25);fill.position.set(16,4,8);scene.add(fill);
 const models=createCargoModels(),batches:Batch[][]=models.map(model=>{
  const result:Batch[]=[];model.root.updateMatrixWorld(true);
  model.root.traverse(object=>{
   if(!(object instanceof T.Mesh))return;
   const mesh=new T.InstancedMesh(object.geometry,object.material,256);mesh.name='stacked-'+model.name;
   mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);mesh.frustumCulled=false;mesh.count=0;scene.add(mesh);
   result.push({mesh,local:object.matrixWorld.clone()});
  });
  return result;
 });
 let phase:Phase='idle',reduced=reducedMotion,start=0,frame=0,disposed=false,lastTime=0,extent=15,notified=false;
 let pieces:Piece[]=[],cellCount=0;
 const dummy=new T.Object3D(),matrix=new T.Matrix4(),corners=[new T.Vector3(),new T.Vector3(),new T.Vector3(),new T.Vector3()];
 host.dataset.gear=models.map(model=>model.name).join(',');host.dataset.covered='false';
 function layout(){
  const phone=host.clientWidth<700,base=phone?.76:1.12,positions=[-.83,-.43,0,.81,.43],depths=[12,14,16,11,10];
  pieces=models.map((model,i)=>{
   const scale=base*(i===1?.78:i===4?.9:1),bottom=i===2?-10.45:i===4?-11.8:-10.5;
   const centre=bottom+model.height*scale*.5;
   return {model:i,x:positions[i]*extent,y:centre,z:depths[i],base:scale,targetX:positions[i]*extent*.96,targetY:centre+1.0,start:.12+i*.4,fall:4.35+i*.075,seed:i,cell:false,front:i};
  });
  const tileScale=base*growth,width=5.4*tileScale,height=4.2*tileScale,pitchX=width*.83,pitchY=height*.80;
  const columns=Math.ceil(extent*2/pitchX)+2,rows=Math.ceil(20/pitchY)+2;
  cellCount=columns*rows;
  for(let row=0;row<rows;row++)for(let col=0;col<columns;col++){
   const serial=row*columns+col,x=-extent-width*.22+col*pitchX,y=-10-height*.2+row*pitchY;
   const begin=.12+row*.32+col*.035,fall=4.35+((serial*17)%cellCount)/cellCount*.72+row/rows*.12;
   pieces.push({model:serial%3===0?3:4,x:x+Math.sin(serial*1.7)*.4,y:-14-height*.5,z:row*.16,base,targetX:x,targetY:y,start:begin,fall,seed:serial+11,cell:true,front:-1});
   if(serial%5===2){
    const model=[0,2,1][Math.floor(serial/5)%3],item=models[model],itemBase=base*(model===1?.77:1);
    pieces.push({model,x,y:-15-item.height*itemBase*.5,z:4+row*.16,base:itemBase,targetX:x+Math.sin(serial)*.35,targetY:y+.10,start:begin+.07,fall:fall+.035,seed:serial+101,cell:false,front:-1});
   }
  }
  host.dataset.tileCount=String(cellCount);host.dataset.pieceCount=String(pieces.length);
 }
 function rectangle(world:T.Matrix4):Rect{
  const coordinates=[[-2.63,.08],[2.63,.08],[-2.63,4.12],[2.63,4.12]];
  for(let i=0;i<4;i++)corners[i].set(coordinates[i][0],coordinates[i][1],1.8).applyMatrix4(world).project(camera);
  return {left:Math.max(corners[0].x,corners[2].x),right:Math.min(corners[1].x,corners[3].x),bottom:Math.max(corners[0].y,corners[1].y),top:Math.min(corners[2].y,corners[3].y)};
 }
 function draw(time:number){
  if(disposed)return;
  const revealing=phase==='revealing'&&!reduced,counts=models.map(()=>0),rectangles:Rect[]=[],lifts=[0,0,0,0,0],frontY=[0,0,0,0,0];
  let allCellsSettled=true,falling=0,visible=0,maxRatio=1,maxWidth=0;
  for(const piece of pieces){
   const model:CargoItem=models[piece.model],lift=revealing?smooth((time-piece.start)/1.05):0;
   const fallAge=revealing?Math.max(0,time-piece.fall):0;
   const scale=piece.base*lerp(1,growth,lift),centreY=lerp(piece.y,piece.targetY,lift)-28*fallAge*fallAge;
   const isVisible=(phase==='idle'?piece.front>=0:revealing&&(piece.front>=0||time>=piece.start))
     &&centreY+Math.hypot(model.width,model.height,model.depth)*scale*.5>-11;
   if(piece.cell){allCellsSettled &&= lift>.9999&&fallAge===0;}
   if(piece.front>=0){lifts[piece.front]=lift;frontY[piece.front]=centreY;}
   if(!isVisible)continue;
   visible++;if(fallAge>0)falling++;
   const direction=piece.seed%2?1:-1,rotation=direction*Math.min(fallAge,1.1)*.48;
   dummy.position.set(lerp(piece.x,piece.targetX,lift)+direction*fallAge*fallAge*.7,centreY-(piece.cell?4.2:model.height)*scale*.5,piece.z);
   dummy.scale.setScalar(scale);
   dummy.rotation.set(piece.cell?.045:.13,piece.cell?direction*.05:direction*.16,(piece.cell?0:direction*.025)+rotation);
   dummy.updateMatrix();
   const index=counts[piece.model]++;
   for(const batch of batches[piece.model]){matrix.multiplyMatrices(dummy.matrix,batch.local);batch.mesh.setMatrixAt(index,matrix);}
   if(piece.cell)rectangles.push(rectangle(dummy.matrix));
   maxRatio=Math.max(maxRatio,scale/piece.base);
   maxWidth=Math.max(maxWidth,(model.width*Math.abs(Math.cos(rotation))+model.height*Math.abs(Math.sin(rotation)))*scale/(extent*2));
  }
  for(let type=0;type<batches.length;type++)for(const batch of batches[type]){batch.mesh.count=counts[type];batch.mesh.instanceMatrix.needsUpdate=true;}
  const covered=revealing&&allCellsSettled&&rectangles.length===cellCount&&coversViewport(rectangles);
  host.dataset.covered=String(covered);host.dataset.lifts=JSON.stringify(lifts.map(value=>Number(value.toFixed(4))));
  host.dataset.frontY=JSON.stringify(frontY.map(value=>Number(value.toFixed(3))));
  host.dataset.maxScaleRatio=maxRatio.toFixed(4);host.dataset.maxPieceWidth=maxWidth.toFixed(4);
  host.dataset.visiblePieces=String(visible);host.dataset.fallingPieces=String(falling);
  host.dataset.time=time.toFixed(3);host.dataset.stage=!revealing?phase:visible===0?'clear':falling>0?'falling':covered?'covered':'stacking';
  renderer.render(scene,camera);lastTime=time;
  if(covered&&!notified){notified=true;onCover();}
 }
 function animate(now:number){
  if(disposed||phase!=='revealing'||reduced)return;
  const time=(now-start)/1000;draw(time);
  if(time<prologueDuration/1000)frame=requestAnimationFrame(animate);
 }
 function resize(){
  if(disposed||!host.clientWidth||!host.clientHeight)return;
  extent=10*host.clientWidth/host.clientHeight;camera.left=-extent;camera.right=extent;camera.updateProjectionMatrix();camera.updateMatrixWorld(true);
  renderer.setSize(host.clientWidth,host.clientHeight,false);layout();draw(lastTime);
 }
 host.appendChild(canvas);const observer=new ResizeObserver(resize);observer.observe(host);resize();
 return {
  setPhase(value){
   if(phase===value)return;phase=value;cancelAnimationFrame(frame);
   if(value==='revealing'){notified=false;start=performance.now();draw(0);if(!reduced)frame=requestAnimationFrame(animate);}else draw(0);
  },
  setReduced(value){reduced=value;cancelAnimationFrame(frame);if(phase==='revealing'&&!reduced)frame=requestAnimationFrame(animate);else draw(lastTime);},
  dispose(){
   disposed=true;cancelAnimationFrame(frame);observer.disconnect();
   const geometries=new Set<T.BufferGeometry>(),materials=new Set<T.Material>(),textures=new Set<T.Texture>();
   scene.traverse(object=>{
    if(object instanceof T.Mesh){geometries.add(object.geometry);for(const material of Array.isArray(object.material)?object.material:[object.material]){materials.add(material);for(const value of Object.values(material))if(value instanceof T.Texture)textures.add(value);}}
    if(object instanceof T.InstancedMesh)object.dispose();
   });
   geometries.forEach(value=>value.dispose());materials.forEach(value=>value.dispose());textures.forEach(value=>value.dispose());renderer.dispose();renderer.forceContextLoss();canvas.remove();
  }
 };
}
