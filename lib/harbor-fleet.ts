import * as T from 'three';
import {createKit,type Kit,type V3} from './three-kit';
import {batchStaticDetails} from './voyage-render';
import {harborWaterHeight} from './harbor-ocean';

type BoatKind='sloop'|'schooner'|'fishing-boat';
const routes=[
 {kind:'sloop' as BoatKind,depth:-78,scale:1.05,period:63,offset:.73,heading:.28},
 {kind:'schooner' as BoatKind,depth:-112,scale:1.18,period:82,offset:.29,heading:.20},
 {kind:'fishing-boat' as BoatKind,depth:-65,scale:.74,period:56,offset:.81,heading:.38},
];

/** Small, curved cloth panels, with a different rig for each supporting vessel. */
function sail(k:Kit,boat:T.Group,bottom:[number,number],top:[number,number],low:number,high:number,color:string){
 const positions:number[]=[],indices:number[]=[],segments=9;
 for(let row=0;row<=segments;row++){
  const v=row/segments,left=T.MathUtils.lerp(bottom[0],top[0],v),right=T.MathUtils.lerp(bottom[1],top[1],v);
  for(let col=0;col<=segments;col++){
   const u=col/segments;
   positions.push(T.MathUtils.lerp(left,right,u),T.MathUtils.lerp(low,high,v),.08+Math.sin(u*Math.PI)*Math.sin(v*Math.PI)*.40);
  }
 }
 for(let row=0;row<segments;row++)for(let col=0;col<segments;col++){
  const a=row*(segments+1)+col,b=a+segments+1;indices.push(a,b,a+1,b,b+1,a+1);
 }
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();
 k.mesh(boat,geometry,new T.MeshStandardMaterial({color,side:T.DoubleSide,roughness:1}));
}

function supportingBoat(kind:BoatKind,k:Kit){
 const boat=new T.Group();boat.name='harbor-'+kind;
 const outline:[number,number][]=[[-3.2,0],[-2.6,.76],[-1.5,1],[1.3,1],[2.75,.58],[3.8,0],[2.75,-.58],[1.3,-1],[-1.5,-1],[-2.6,-.76]];
 const vertices:number[]=[],indices:number[]=[];
 for(const [height,factor]of [[-.63,.30],[-.23,.76],[.74,1]]){
  for(const [x,z]of outline)vertices.push(x*factor,height,z*factor);
 }
 for(let ring=0;ring<2;ring++)for(let i=0;i<outline.length;i++){
  const a=ring*outline.length+i,b=ring*outline.length+(i+1)%outline.length,c=a+outline.length,d=b+outline.length;
  indices.push(a,c,b,b,c,d);
 }
 // The water is opaque; the lower hull remains physically below its surface.
 const hull=new T.BufferGeometry();hull.setAttribute('position',new T.Float32BufferAttribute(vertices,3));hull.setIndex(indices);hull.computeVertexNormals();
 k.mesh(boat,hull,kind==='sloop'?'#375a62':kind==='schooner'?'#624638':'#496d86');
 const deck=new T.Shape();outline.forEach(([x,z],i)=>{if(i)deck.lineTo(x,-z);else deck.moveTo(x,-z);});deck.closePath();
 k.mesh(boat,new T.ShapeGeometry(deck).rotateX(-Math.PI/2),'#b89465',[0,.72,0]);
 const rail=outline.map(([x,z])=>[x,.85,z] as V3);rail.push(rail[0]);k.rope(boat,rail,'#c6a372',.065);
 for(const y of [.18,.47])k.rope(boat,outline.map(([x,z])=>[x*.97,y,z*.97] as V3).concat([[-3.2*.97,y,0]]),'#c2a16d',.026);
 for(const x of [-2,-.8,.4,1.6])for(const z of [-.92,.92])k.box(boat,[.20,.16,.035],[x,.38,z],'#172e38');
 const mast=(x:number,height:number)=>{
  k.cylinder(boat,.065,height,[x,.75+height/2,0],'#654c37');
  for(const z of [-.78,.78])k.rope(boat,[[x,height+.75,0],[x-1,.86,z]],'#928875',.018);
 };
 if(kind==='sloop'){
  mast(-.55,6.7);
  sail(k,boat,[-.48,2.65],[-.48,-.38],1.12,7.14,'#e5d7b4');
  sail(k,boat,[-.85,3.45],[-.85,-.82],1.14,6.3,'#eae3cf');
  k.cylinder(boat,.05,3.2,[1.05,1.12,0],'#795b3c',[0,0,Math.PI/2]);
  k.box(boat,[1.6,.58,1.3],[-1.5,1.02,0],'#8b6f4c');
 }else if(kind==='schooner'){
  mast(-1.6,6.2);mast(.8,7.0);
  sail(k,boat,[-2.7,-1.55],[-2.2,-1.55],1.2,5.9,'#ac7460');
  sail(k,boat,[-.6,.85],[-.25,.85],1.2,6.75,'#d8c9a4');
  sail(k,boat,[1,3.6],[1,1.02],1.15,6.6,'#d8c9a4');
  k.box(boat,[1.6,.65,1.4],[-2,1.05,0],'#6e5740');
  k.box(boat,[1.9,.13,1.6],[-2,1.42,0],'#a28b65');
 }else{
  mast(.65,4.2);
  sail(k,boat,[.72,2.85],[.72,.76],1.1,4.72,'#c9ab70');
  k.box(boat,[2,1.15,1.35],[-1.5,1.28,0],'#b0bbb3');
  k.box(boat,[2.2,.16,1.6],[-1.5,1.93,0],'#4c666a');
  k.box(boat,[.05,.44,.70],[-.48,1.43,0],'#304c5a');
  for(const z of [-.70,.70])k.box(boat,[.85,.44,.025],[-1.4,1.43,z],'#304c5a');
  for(const x of [.1,1])k.cylinder(boat,.30,.54,[x,1.02,-.4],'#857455');
 }
 k.rope(boat,[[-3.05,.84,0],[0,.90,0],[3.7,.84,0]],'#92775a',.022);
 batchStaticDetails(boat);return boat;
}

/** Low tropical silhouettes, softened by the same sea fog as the horizon. */
function distantIsland(k:Kit,index:number){
 const island=new T.Group();island.name='distant-island-'+index;
 const n=36,positions:number[]=[0,3.1+index*.18,0],indices:number[]=[];
 for(let ring=0;ring<3;ring++)for(let i=0;i<n;i++){
  const angle=i/n*Math.PI*2,shape=1+.11*Math.sin(angle*3+index)+.06*Math.cos(angle*7-index);
  const radius=[.34,.69,1][ring],height=[2.8,1.55,-.30][ring];
  positions.push(Math.cos(angle)*18*radius*shape,height+(ring===2?0:.36*Math.sin(angle*3+index)),Math.sin(angle)*5.8*radius*shape);
 }
 for(let i=0;i<n;i++){
  const next=(i+1)%n;indices.push(0,1+i,1+next);
  for(let ring=0;ring<2;ring++){
   const a=1+ring*n+i,b=1+ring*n+next;indices.push(a,a+n,b,b,a+n,b+n);
  }
 }
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();
 const silhouette=new T.MeshBasicMaterial({color:index%2?'#627f87':'#6d8a91',side:T.DoubleSide});
 k.mesh(island,geometry,silhouette);
 for(let palm=0;palm<3;palm++){
  const x=-6+palm*5+index%2,y=2.55,z=-.5+palm*.45,top=y+2.5+(palm%2)*.7;
  k.mesh(island,new T.CylinderGeometry(.09,.15,top-y,5),silhouette,[x+.25,(top+y)/2,z],[0,0,-.13]);
  for(let leaf=0;leaf<5;leaf++){
   const angle=leaf/5*Math.PI*2;
   const shape=new T.BufferGeometry().setFromPoints([new T.Vector3(x+.45,top,z),new T.Vector3(x+.45+Math.cos(angle)*1.45,top-.32,z+Math.sin(angle)*1.45),new T.Vector3(x+.45+Math.cos(angle+.2)*.66,top+.10,z+Math.sin(angle+.2)*.66)]);
   shape.setIndex([0,1,2]);k.mesh(island,shape,silhouette);
  }
 }
 batchStaticDetails(island);return island;
}

export function createHarborFleet(scene:T.Scene,camera:T.PerspectiveCamera,host:HTMLDivElement){
 const k=createKit(),phone=host.clientWidth<=700;
 const fleet=routes.map(route=>{
  const ship=supportingBoat(route.kind,k);ship.rotation.order='YXZ';ship.rotation.y=route.heading;ship.scale.setScalar(route.scale);scene.add(ship);
  return {...route,ship,extent:50};
 });
 const islands=[-.88,-.47,.12,.56,.96].map((fraction,index)=>{
  const island=distantIsland(k,index),depth=-178-index%3*31;
  island.scale.setScalar((phone?.64:1)*(1+index%2*.23));island.position.z=depth;scene.add(island);return {island,fraction,depth};
 });
 host.dataset.fleetTypes=routes.map(route=>route.kind).join(',');
 host.dataset.islandCount=String(islands.length);
 const span=(depth:number)=>(camera.position.z-depth)*Math.tan(T.MathUtils.degToRad(camera.fov/2))*camera.aspect;
 return {
  resize(){
   fleet.forEach(boat=>{boat.extent=span(boat.depth)+6*boat.scale;});
   islands.forEach(({island,fraction,depth})=>{island.position.x=span(depth)*fraction;});
  },
  update(time:number){
   const positions:number[]=[];
   fleet.forEach(boat=>{
    const progress=((time/boat.period+boat.offset)%1+1)%1,x=T.MathUtils.lerp(-boat.extent,boat.extent,progress);
    const c=Math.cos(boat.heading),s=Math.sin(boat.heading),half=2.7*boat.scale,width=.8*boat.scale;
    const bow=harborWaterHeight(x+c*half,boat.depth-s*half,time),stern=harborWaterHeight(x-c*half,boat.depth+s*half,time);
    const port=harborWaterHeight(x+s*width,boat.depth+c*width,time),starboard=harborWaterHeight(x-s*width,boat.depth-c*width,time);
    const surface=(bow+stern+port+starboard)*.25;
    boat.ship.position.set(x,surface-.18*boat.scale,boat.depth);
    boat.ship.rotation.z=Math.atan2(bow-stern,half*2);boat.ship.rotation.x=-Math.atan2(port-starboard,width*2);
    positions.push(Number(x.toFixed(3)));
   });
   host.dataset.fleetX=JSON.stringify(positions);
  },
 };
}
