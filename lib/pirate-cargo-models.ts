import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {createKit,type V3} from './three-kit';
import {shipColors as C} from './ship-hull';
import {batchStaticDetails} from './voyage-render';

export type CargoItem={root:T.Group;name:string;width:number;height:number;depth:number};
export function createCargoModels(){
 const k=createKit(),woodCanvas=document.createElement('canvas');woodCanvas.width=512;woodCanvas.height=1024;
 const ctx=woodCanvas.getContext('2d')!;ctx.fillStyle='#b69569';ctx.fillRect(0,0,512,1024);
 for(let i=0;i<400;i++){
  const x=(i*67.39)%512;ctx.strokeStyle=i%3?'#39271828':'#f9dca04d';ctx.lineWidth=i%5===0?1.9:.65;
  ctx.beginPath();ctx.moveTo(x,0);ctx.bezierCurveTo(x+Math.sin(i)*16,300,x-Math.cos(i)*12,730,x+Math.sin(i*.2)*8,1024);ctx.stroke();
 }
 for(const [x,y] of [[110,245],[371,720]])for(let i=1;i<8;i++){ctx.strokeStyle='#563c2550';ctx.beginPath();ctx.ellipse(x,y,3+i*3,9+i*9,.08,0,Math.PI*2);ctx.stroke();}
 const map=new T.CanvasTexture(woodCanvas);map.colorSpace=T.SRGBColorSpace;map.anisotropy=4;
 const wood=new T.MeshStandardMaterial({color:'#bd9a6a',map,roughness:.85});
 const lightWood=new T.MeshStandardMaterial({color:'#d1af76',map,roughness:.8});
 const darkWood=new T.MeshStandardMaterial({color:'#705039',map,roughness:.9});
 const brass=new T.MeshStandardMaterial({color:'#c0a16a',metalness:.64,roughness:.38});
 const iron=new T.MeshStandardMaterial({color:'#435052',metalness:.5,roughness:.58});
 const rope=new T.MeshStandardMaterial({color:'#ad966b',roughness:1});
 function box(parent:T.Object3D,size:V3,position:V3,material:T.Material=wood,rotation:V3=[0,0,0]){
  return k.mesh(parent,new RoundedBoxGeometry(...size,2,.045),material,position,rotation);
 }
 function rivet(parent:T.Object3D,x:number,y:number,z:number){k.mesh(parent,new T.SphereGeometry(.075,8,6),brass,[x,y,z]).scale.z=.48;}
 function anchor(material:T.Material=iron){
  const root=new T.Group();root.name='forged-anchor';
  k.mesh(root,new T.CylinderGeometry(.12,.16,4,12),material,[0,2.25,0]);
  k.mesh(root,new T.TorusGeometry(.43,.11,8,24),material,[0,4.65,0]);
  box(root,[2.4,.22,.3],[0,3.15,0],material);
  const curve=new T.CatmullRomCurve3([new T.Vector3(-1.7,1.2,0),new T.Vector3(-1.2,.4,0),new T.Vector3(0,.22,0),new T.Vector3(1.2,.4,0),new T.Vector3(1.7,1.2,0)]);
  k.mesh(root,new T.TubeGeometry(curve,32,.15,8,false),material);
  for(const side of [-1,1]){
   const shape=new T.Shape();shape.moveTo(0,0);shape.lineTo(side*.7,.75);shape.lineTo(-side*.28,.58);shape.closePath();
   k.mesh(root,new T.ExtrudeGeometry(shape,{depth:.16,bevelEnabled:true,bevelSize:.04,bevelThickness:.035,bevelSegments:2}),material,[side*1.5,.65,-.08]);
  }
  return root;
 }
 function barrel(){
  const root=new T.Group();root.name='oak-barrel';
  const profile=[new T.Vector2(1.15,0),new T.Vector2(1.38,.45),new T.Vector2(1.57,2.3),new T.Vector2(1.38,4.15),new T.Vector2(1.15,4.6)];
  k.mesh(root,new T.LatheGeometry(profile,32),wood);
  for(const h of [.38,1.25,3.35,4.22]){
   const r=h<.5||h>4.1?1.39:1.52;
   k.mesh(root,new T.CylinderGeometry(r,r,.18,32,1,true),iron,[0,h,0]);
   for(const a of [0,Math.PI*.4,Math.PI*.8,Math.PI*1.2,Math.PI*1.6])rivet(root,Math.sin(a)*(r+.015),h,Math.cos(a)*(r+.015));
  }
  for(let i=0;i<18;i++){
   const a=i/18*Math.PI*2;
   k.mesh(root,new T.TubeGeometry(new T.CatmullRomCurve3(profile.map(p=>new T.Vector3(Math.sin(a)*(p.x+.006),p.y,Math.cos(a)*(p.x+.006)))),16,.013,4,false),darkWood);
  }
  k.mesh(root,new T.CylinderGeometry(1.14,1.14,.12,32),lightWood,[0,4.6,0]);
  for(const x of [-.7,-.3,.1,.5])box(root,[.018,.012,2*Math.sqrt(1.12*1.12-x*x)],[x,4.665,0],darkWood);
  return {root,name:'barrel',width:3.2,height:4.7,depth:3.2};
 }
 function chest(){
  const root=new T.Group();root.name='brass-bound-treasure-chest';
  box(root,[6.6,1.75,3.1],[0,.875,0],darkWood);
  for(let i=0;i<7;i++)box(root,[.91,1.58,.1],[-2.82+i*.94,.88,1.59],i%2?wood:lightWood);
  const shape=new T.Shape();shape.moveTo(-1.55,0);shape.lineTo(1.55,0);shape.absellipse(0,0,1.55,1.3,0,Math.PI,false,0);shape.closePath();
  const lidGeometry=new T.ExtrudeGeometry(shape,{depth:6.6,bevelEnabled:true,bevelSize:.035,bevelThickness:.035,bevelSegments:2,curveSegments:24});
  lidGeometry.translate(0,0,-3.3);lidGeometry.rotateY(Math.PI/2);
  k.mesh(root,lidGeometry,wood,[0,1.76,0]);
  for(const x of [-2.2,2.2]){
   box(root,[.18,1.75,3.17],[x,.875,0],brass);
   const points=Array.from({length:33},(_,i)=>{const a=i/32*Math.PI;return new T.Vector3(x,1.77+Math.sin(a)*1.34,Math.cos(a)*1.59);});
   k.mesh(root,new T.TubeGeometry(new T.CatmullRomCurve3(points),40,.085,8,false),brass);
   for(const y of [.25,.75,1.3])rivet(root,x,y,1.63);
  }
  box(root,[6.7,.10,3.2],[0,.1,0],brass);box(root,[6.7,.1,3.2],[0,1.71,0],brass);
  box(root,[.65,.78,.12],[0,1.52,1.68],brass);
  k.mesh(root,new T.CircleGeometry(.09,14),C.darkWood,[0,1.62,1.75]);box(root,[.075,.18,.02],[0,1.47,1.76],darkWood);
  return {root,name:'treasure-chest',width:6.75,height:3.15,depth:3.3};
 }
 function crate(name:string){
  const root=new T.Group();root.name=name;
  box(root,[5.4,4.2,3.6],[0,2.1,0],darkWood);
  for(let i=0;i<6;i++)box(root,[.86,3.85,.12],[-2.23+i*.89,2.1,1.86],i%2?lightWood:wood);
  for(const z of [-1.87,1.99]){
   for(const x of [-2.5,2.5])box(root,[.24,4.3,.15],[x,2.1,z],lightWood);
   for(const y of [.18,4.03])box(root,[5.45,.28,.17],[0,y,z],lightWood);
  }
  for(const a of [-.60,.60])box(root,[5.9,.26,.17],[0,2.12,2.08],wood,[0,0,a]);
  for(const x of [-2.5,2.5])for(const y of [.25,1.3,2.7,4])rivet(root,x,y,2.11);
  for(const x of [-2.6,2.6])for(const z of [-1.73,1.73])box(root,[.17,.45,.35],[x,4,z],iron);
  if(name==='provisions'){
   for(let i=0;i<4;i++)k.mesh(root,new T.TorusGeometry(1.1,.105,7,36),rope,[.4,4.33+i*.11,0],[Math.PI/2,.04*i,0]);
   k.mesh(root,new T.CylinderGeometry(.62,.62,.18,32),brass,[-1.4,4.45,.1]);
  }else{
   const badge=anchor(brass);badge.scale.setScalar(.36);badge.position.set(0,1.08,2.22);root.add(badge);
  }
  return {root,name,width:5.55,height:name==='provisions'?4.9:4.35,depth:4.2};
 }
 const gear=new T.Group();gear.name='anchor-and-rope';
 for(let i=0;i<5;i++)k.mesh(gear,new T.TorusGeometry(1.4-i*.1,.14,8,48),rope,[0,.2+i*.15,0],[Math.PI/2,0,i*.16]);
 const metalAnchor=anchor();metalAnchor.rotation.z=-.3;metalAnchor.position.set(.3,.3,.35);gear.add(metalAnchor);
 k.rope(gear,[[-1.3,.2,.5],[-2,.25,1.2],[-.7,.6,1.8],[.8,.3,1.3]],C.rope,.11);
 const items:CargoItem[]=[barrel(),{root:gear,name:'anchor-and-rope',width:4.5,height:5.4,depth:3.8},chest(),crate('provisions'),crate('captains-crate')];
 for(const item of items)batchStaticDetails(item.root);
 return items;
}
