import * as T from 'three';
import { createWaterTitle } from './water-title';
import { createIslandSandGeometry } from './island-shore';
import { createKit, colors as C, type Kit, type V3 } from './three-kit';
export { ports } from './voyage-routes';
function palm(parent:T.Group,k:Kit,position:V3,scale=1,lean=.35){
  const g=new T.Group();g.position.set(...position);g.scale.setScalar(scale);parent.add(g);
  const trunk=new T.CatmullRomCurve3([new T.Vector3(0,0,0),new T.Vector3(lean,.9,.05),new T.Vector3(lean*.3,2,.12),new T.Vector3(lean*1.6,3.1,0)]);
  k.mesh(g,new T.TubeGeometry(trunk,9,.12,7,false),'#a58156');
  for(let y=.2;y<2.9;y+=.32){const p=trunk.getPoint(y/3.1);k.ring(g,.125,.016,[p.x,p.y,p.z],'#786647',[Math.PI/2,0,0]);}
  for(let a=0;a<Math.PI*2;a+=Math.PI/3.5){
    const vertices:number[]=[];const center=new T.Vector3(lean*1.6,3.1,0);
    const p=(t:number,edge:number)=>{const r=t*1.85,w=Math.sin(t*Math.PI)*.32*edge;return [center.x+Math.cos(a)*r+Math.sin(a)*w,center.y+Math.sin(t*Math.PI)*.55-t*t*.9,center.z+Math.sin(a)*r-Math.cos(a)*w];};
    for(let s=0;s<6;s++){const t=s/6,n=(s+1)/6;vertices.push(...p(t,-1),...p(n,-1),...p(t,1),...p(t,1),...p(n,-1),...p(n,1));}
    const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geo.computeVertexNormals();const mat=new T.MeshStandardMaterial({color:a<3?'#7eab7d':'#5d916e',side:T.DoubleSide,flatShading:true,roughness:.9});k.mesh(g,geo,mat);
  }
  for(const dx of [-.15,.15])k.sphere(g,.18,[lean*1.6+dx,3.05,.1],C.wood);
}
function laptop(parent:T.Group,k:Kit){
  k.box(parent,[2.1,.75,1.6],[0,1.1,.2],C.plank);k.box(parent,[2.15,.1,1.7],[0,1.52,.2],C.lightWood);
  const g=new T.Group();g.position.set(0,1.6,.1);g.rotation.y=.45;parent.add(g);
  k.box(g,[1.8,.10,1.15],[0,.05,0],'#566b70');k.box(g,[1.53,.02,.65],[0,.11,-.08],'#30464f');
  for(let x=-.6;x<=.6;x+=.17)for(let z=-.25;z<=.1;z+=.13)k.box(g,[.11,.025,.08],[x,.13,z],'#81958d');
  const lid=new T.Group();lid.position.set(0,.12,-.5);lid.rotation.x=-.14;g.add(lid);
  k.box(lid,[1.8,1.3,.09],[0,.64,0],'#344c55');
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=360;const c=canvas.getContext('2d')!;c.fillStyle='#243f47';c.fillRect(0,0,512,360);c.font='20px monospace';
  ['<hello, world />','', 'const curiosity = true;','const create = () => {','  imagine();','  build();','  repeat();','};'].forEach((line,i)=>{c.fillStyle=i%2?'#c9c3a1':'#99d3bd';c.fillText(line,25,42+i*36);});
  const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;k.mesh(lid,new T.PlaneGeometry(1.64,1.12),new T.MeshStandardMaterial({map:texture,roughness:1,emissive:'#243f47',emissiveIntensity:.15}),[0,.65,.052]);
}
function lighthouse(parent:T.Group,k:Kit){
  const g=new T.Group();g.position.set(1.5,.65,-1.6);g.scale.setScalar(.78);parent.add(g);
  k.cylinder(g,.8,.25,[0,.12,0],'#b5ad8c');
  for(let i=0;i<4;i++)k.cylinder(g,.6-i*.065,.8,[0,.65+i*.8,0],i%2?'#71978b':C.ivory,[0,0,0],.54-i*.065);
  k.cylinder(g,.6,.17,[0,3.45,0],C.gold);k.cylinder(g,.43,.7,[0,3.87,0],'#b5d9cc');
  for(let a=0;a<Math.PI*2;a+=Math.PI/3)k.cylinder(g,.035,.8,[Math.sin(a)*.4,3.88,Math.cos(a)*.4],C.ink);
  k.mesh(g,new T.ConeGeometry(.67,.55,8),C.ink,[0,4.46,0]);k.sphere(g,.12,[0,4.79,0],C.gold);
  k.sphere(g,.2,[0,3.9,0],'#ffe6a4');k.box(g,[.42,.75,.07],[0,.62,.6],C.wood);
}
function easel(parent:T.Group,k:Kit){
  const g=new T.Group();g.position.set(0,.8,.15);g.rotation.y=.35;parent.add(g);
  for(const x of [-.85,.85])k.box(g,[.12,2.7,.12],[x,1.3,0],C.wood,[0,0,-x*.14]);
  k.box(g,[.12,2.6,.12],[0,1.15,-.55],C.wood,[-.35,0,0]);k.box(g,[2.2,.12,.3],[0,.75,.05],C.lightWood);
  k.box(g,[1.9,1.65,.09],[0,1.65,.05],C.ivory);k.box(g,[1.72,1.48,.015],[0,1.65,.105],'#e0b59b');
  k.cylinder(g,.46,.03,[.32,1.94,.13],'#e8c97e',[Math.PI/2,0,0]);
  const hill=k.sphere(g,.9,[-.25,1.12,.13],'#6e9980',[1,.6,.04]);hill.castShadow=false;
  const hill2=k.sphere(g,.7,[.55,.98,.17],'#446c64',[1.1,.7,.04]);hill2.castShadow=false;
  // Large painter's palette on the sand, with raised paint dabs.
  const palette=k.sphere(parent,1.04,[-2.1,1.05,.45],C.lightWood,[1.1,.12,.72]);palette.rotation.y=-.4;
  ['#c87564','#e3bc63','#6f9b80','#7ea4b1','#c7a5b5'].forEach((color,i)=>{const a=i*.7-1.5;k.sphere(parent,.17,[-2.1+Math.cos(a)*.72,1.19,.45+Math.sin(a)*.44],color,[1,.4,1]);});
  k.rope(parent,[[-2.8,1.05,.15],[-2.4,1.5,-.15],[-2.1,2,-.35]],C.wood,.05);k.sphere(parent,.1,[-2.1,2,-.35],'#678e77',[.6,1.8,.6]);
}
function filmCamera(parent:T.Group,k:Kit){
  const g=new T.Group();g.position.set(.1,.7,0);g.rotation.y=.35;parent.add(g);
  for(let a=0;a<Math.PI*2;a+=Math.PI*2/3)k.rope(g,[[0,1.85,0],[Math.cos(a)*.65,.1,Math.sin(a)*.65]],C.wood,.055);
  k.box(g,[1.6,.95,.7],[0,2.1,0],C.ink);k.cylinder(g,.32,.65,[.95,2.1,0],'#526b70',[0,0,Math.PI/2]);
  k.cylinder(g,.23,.03,[1.3,2.1,0],'#132c36',[0,0,Math.PI/2]);k.ring(g,.31,.055,[1.32,2.1,0],C.gold,[0,Math.PI/2,0]);
  for(const x of [-.45,.4]){k.cylinder(g,.46,.14,[x,2.92,0],'#829a96',[Math.PI/2,0,0]);k.ring(g,.45,.04,[x,2.92,.09],C.gold);for(let a=0;a<Math.PI*2;a+=Math.PI/3)k.cylinder(g,.09,.03,[x+Math.cos(a)*.26,2.92+Math.sin(a)*.26,.1],C.ink,[Math.PI/2,0,0]);}
  const board=new T.Group();board.position.set(-1.8,.4,1.0);board.rotation.y=.3;parent.add(board);
  k.box(board,[1.5,.9,.1],[0,.9,0],C.ink);k.box(board,[1.6,.24,.14],[0,1.51,0],C.ivory,[0,0,.14]);
  for(let x=-.6;x<.8;x+=.4)k.box(board,[.18,.24,.15],[x,1.51+x*.14,.01],C.ink,[0,0,-.3]);
  for(let y=.7;y<1.15;y+=.14)k.box(board,[1.15,.025,.025],[0,y,.06],'#c2cbb5');
}
export function createIsland(index:number,{waterTitle=true}:{waterTitle?:boolean}={}){
  const island=new T.Group();island.name=`island-${index}`;island.userData.port=index;const k=createKit();
  k.mesh(island,createIslandSandGeometry(index),'#e7d4a3',[0,.05,0],[-Math.PI/2,0,0]);
  const grass=k.cylinder(island,2.7,.14,[.1,.78,-.4],'#9ab58b');grass.scale.z=.8;
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2;k.sphere(island,.45+Math.sin(i*2)*.14,[Math.cos(a)*4.05,.04,Math.sin(a)*3.12],'#a1aaa0',[1,.8,1]);}
  const shelf=k.mesh(island,new T.CircleGeometry(5.6,48),new T.MeshBasicMaterial({color:'#b6e1cb',transparent:true,opacity:.24,depthWrite:false}),[0,-.025,0],[-Math.PI/2,0,0]);shelf.scale.y=.82;shelf.castShadow=false;shelf.receiveShadow=false;
  const surf=k.mesh(island,new T.RingGeometry(4.5,4.57,48),new T.MeshBasicMaterial({color:'#edf8e9',transparent:true,opacity:.6,side:T.DoubleSide,depthWrite:false}),[0,.025,0],[-Math.PI/2,0,0]);surf.scale.y=.81;surf.castShadow=false;
  // The jetty extends into the arrival water.
  for(let z=2.5;z<5.6;z+=.27)k.box(island,[1.5,.12,.23],[-2.65,.54,z],z%1>.5?C.plank:C.lightWood);
  // Front piles sit just inside the end plank, so the far-side leg is visible
  // below the deck from the fixed camera. Bearers connect each pair to the boards.
  for(const z of [2.7,5.4]){
    k.box(island,[1.5,.16,.18],[-2.65,.4,z],C.darkWood);
    for(const x of [-3.35,-1.95]){k.cylinder(island,.085,1.2,[x,.4,z],C.wood);k.ring(island,.1,.02,[x,.93,z],C.rope,[Math.PI/2,0,0]);}
  }
  palm(island,k,[-2.4,.8,-1.5],1.05,.35);palm(island,k,[2.7,.65,.7],.8,-.6);
  for(let i=0;i<5;i++)k.sphere(island,.28+ i*.025,[-3.2+i*.34,.84,-.1+Math.sin(i)*.4],'#6d9a77',[1,.8,1]);
  for(const [x,z] of [[2,2.95],[-.3,2.8]]){const star=new T.Shape();for(let i=0;i<10;i++){const a=i*Math.PI/5,r=i%2?.11:.29;i?star.lineTo(Math.cos(a)*r,Math.sin(a)*r):star.moveTo(Math.cos(a)*r,Math.sin(a)*r);}star.closePath();k.mesh(island,new T.ExtrudeGeometry(star,{depth:.05,bevelEnabled:false}),'#d4937b',[x,.72,z],[-Math.PI/2,0,.3]);}
  if(index===1){laptop(island,k);lighthouse(island,k);}else if(index===2)easel(island,k);else filmCamera(island,k);
  if(waterTitle)island.add(createWaterTitle(index));island.traverse(o=>{o.userData.port=index;});
  return island;
}
export function createHomeReef(){
  const reef=new T.Group();const k=createKit();
  for(let i=0;i<5;i++)k.sphere(reef,.8+i*.1,[Math.sin(i*2)*1.2,-.05,Math.cos(i*2)*.8],'#9aa99f',[1,.8,1]);
  palm(reef,k,[.1,.25,0],.9,.5);
  const sand=k.cylinder(reef,2.2,.3,[0,-.08,0],'#e6d4a9');sand.scale.z=.7;
  return reef;
}
