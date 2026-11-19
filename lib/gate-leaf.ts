import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {createKit,type V3} from './three-kit';

export const gateBodyDepth=1.02;
export const gateSealOverhang=.12;
export type GateLeafMaterials={timber:T.Material;darkWood:T.Material;teal:T.Material;tealDark:T.Material;brass:T.Material;iron:T.Material;glass:T.Material;lettering:T.Material};

/** One watertight core, butt-jointed rails, and hardware seated at distinct depths. */
export function buildGateLeaf(root:T.Group,width:number,side:-1|1,m:GateLeafMaterials){
 const k=createKit(),centre=-side*width*.5,frameWidth=.52;
 function mesh(name:string,geometry:T.BufferGeometry,material:T.Material,position:V3,rotation:V3=[0,0,0],parent:T.Object3D=root){
  const object=k.mesh(parent,geometry,material,position,rotation);object.name=name;return object;
 }
 function box(name:string,size:V3,position:V3,material:T.Material=m.timber,rotation:V3=[0,0,0],parent:T.Object3D=root){
  return mesh(name,new RoundedBoxGeometry(...size,2,Math.min(.045,...size.map(value=>value*.22))),material,position,rotation,parent);
 }
 function rivet(name:string,x:number,y:number,z:number){mesh(name,new T.SphereGeometry(.075,10,8),m.brass,[x,y,z]).scale.z=.55;}
 box('gate-core',[width,24.8,gateBodyDepth],[centre,0,0],m.darkWood);
 const panelWidth=width-2*frameWidth,columns=Math.max(3,Math.round(panelWidth/1.15)),board=panelWidth/columns;
 for(let i=0;i<columns;i++){
  const plank=box('plank-'+i,[board-.035,22.9,.22],[centre-panelWidth*.5+board*(i+.5),0,.55],i%2?m.teal:m.tealDark);
  const uv=plank.geometry.getAttribute('uv');
  for(let vertex=0;vertex<uv.count;vertex++)uv.setXY(vertex,uv.getX(vertex)+i*.173,uv.getY(vertex)+i*.127);
 }
 for(const [index,x]of [centre-width*.5+frameWidth*.5,centre+width*.5-frameWidth*.5].entries()){
  box('frame-stile-'+index,[frameWidth,24.6,.36],[x,0,.66]);
 }
 // Horizontal rails stop before the stiles: no coplanar faces at the joints.
 for(const [index,y]of [-12.10,-5.3,9.7,12.10].entries())box('frame-rail-'+index,[panelWidth-.02,.44,.36],[centre,y,.66]);
 // Only the left leaf carries an overlapping seal, forward of the other leaf's frame.
 if(side===-1)box('centre-rebate',[.20,24.7,.20],[width+gateSealOverhang-.10,0,.96],m.timber);
 for(const [index,y]of [-8.7,.8,8.8].entries()){
  box('iron-strap-'+index,[panelWidth-.03,.25,.12],[centre,y,.735],m.iron);
  for(const [r,x]of [centre-panelWidth*.4,centre,centre+panelWidth*.4].entries())rivet('strap-rivet-'+index+'-'+r,x,y,.83);
 }
 const radius=Math.min(width*.235,2.22);
 mesh('porthole-seat',new T.CylinderGeometry(radius+.23,radius+.23,.22,48),m.iron,[centre,5.3,.70],[Math.PI/2,0,0]);
 mesh('porthole-glass',new T.CircleGeometry(radius,48),m.glass,[centre,5.3,.835]);
 mesh('porthole-rim',new T.TorusGeometry(radius+.07,.15,10,56),m.brass,[centre,5.3,.91]);
 for(let i=0;i<10;i++){const a=i/10*Math.PI*2;rivet('porthole-rivet-'+i,centre+Math.cos(a)*(radius+.11),5.3+Math.sin(a)*(radius+.11),1.095);}
 const reach=radius*.91,gap=.037;
 box('porthole-mullion-vertical',[.055,reach*2,.06],[centre,5.3,.90],m.brass);
 for(const sign of [-1,1])box('porthole-mullion-'+sign,[reach-gap,.055,.06],[centre+sign*(reach+gap)*.5,5.3,.90],m.brass);
 const handle=-side*(width-.85);
 box('handle-plate',[.59,1.55,.16],[handle,-.9,.745],m.iron);
 mesh('handle-pin',new T.CylinderGeometry(.10,.10,.22,14),m.brass,[handle,-.71,.90],[Math.PI/2,0,0]);
 mesh('handle-ring',new T.TorusGeometry(.39,.085,10,40),m.brass,[handle,-1.10,1.01]);
 rivet('handle-rivet-top',handle,-.37,.86);rivet('handle-rivet-bottom',handle,-1.48,.86);
 for(const [index,y]of [-9,0,9].entries()){
  mesh('hinge-barrel-'+index,new T.CylinderGeometry(.16,.16,1.18,16),m.brass,[-side*.16,y,.98]);
  box('hinge-plate-'+index,[.70,.20,.10],[-side*.31,y,.94],m.iron);
 }
 if(side===-1){
  const badge=new T.Group(),scale=Math.min(1,width/7);badge.name='anchor-badge';badge.position.set(centre,-3.65,1.02);badge.scale.setScalar(scale);root.add(badge);
  mesh('anchor-shaft',new T.CylinderGeometry(.105,.14,3.25,12),m.brass,[0,1.7,0],[0,0,0],badge);
  mesh('anchor-eye',new T.TorusGeometry(.36,.095,8,30),m.brass,[0,3.55,0],[0,0,0],badge);
  box('anchor-stock',[2.35,.19,.19],[0,2.4,0],m.brass,[0,0,0],badge);
  const curve=new T.CatmullRomCurve3([new T.Vector3(-1.45,1,0),new T.Vector3(-1,.35,0),new T.Vector3(0,.15,0),new T.Vector3(1,.35,0),new T.Vector3(1.45,1,0)]);
  mesh('anchor-crown',new T.TubeGeometry(curve,30,.13,8,false),m.brass,[0,0,0],[0,0,0],badge);
  for(const sign of [-1,1])mesh('anchor-fluke-'+sign,new T.ConeGeometry(.3,.75,3),m.brass,[sign*1.42,1,0],[0,0,-sign*.6],badge);
 }else{
  const radius=Math.min(width*.24,1.65);
  mesh('wheel-rim',new T.TorusGeometry(radius,.13,10,48),m.timber,[centre,-2,.99]);
  mesh('wheel-inlay',new T.TorusGeometry(radius*.81,.045,8,40),m.brass,[centre,-2,1.055]);
  // Eight radial spokes, rather than duplicated bars spanning the full diameter.
  const inner=.22,outer=radius+.30,middle=(inner+outer)*.5;
  for(let i=0;i<8;i++){
   const a=i/8*Math.PI*2;
   box('wheel-spoke-'+i,[.10,outer-inner,.12],[centre+Math.sin(a)*middle,-2+Math.cos(a)*middle,1.02],m.brass,[0,0,-a]);
  }
  mesh('wheel-hub',new T.SphereGeometry(.25,16,12),m.brass,[centre,-2,1.08]).scale.z=.48;
 }
 const lettering=mesh('gate-lettering',new T.PlaneGeometry(Math.max(2,width*.75),.78),m.lettering,[centre,10.72,.686]);
 lettering.castShadow=false;lettering.receiveShadow=false;
}
