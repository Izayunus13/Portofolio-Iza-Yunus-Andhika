import * as T from 'three';
import { createKit, type Kit, type V3 } from './three-kit';
import { shipColors as C } from './ship-hull';
import { batchStaticDetails } from './voyage-render';

export type ShipMotion = { speed: number; turnRate: number; roll: number; pitch: number; sailing: boolean; reduced: boolean };
export type Pendulum = { x: number; z: number; vx: number; vz: number };
export function stepAnchor(state: Pendulum, targetX: number, targetZ: number, dt: number) {
  const count=Math.max(1,Math.ceil(dt*120)),step=dt/count;
  for(let i=0;i<count;i++) {
    state.vx+=(-15*(state.x-targetX)-2.8*state.vx)*step;
    state.vz+=(-15*(state.z-targetZ)-2.8*state.vz)*step;
    state.x+=state.vx*step;state.z+=state.vz*step;
  }
}

function capsule(parent:T.Object3D,k:Kit,radius:number,length:number,position:V3,color:string) {
  return k.mesh(parent,new T.CapsuleGeometry(radius,Math.max(.01,length-2*radius),4,10),color,position);
}

function createCaptain(k:Kit) {
  const root=new T.Group();root.name='captain';root.position.set(-1.65,3.045,1.15);root.rotation.y=1;
  const skin='#d9a07a',skinLight='#e6b48f',hair='#594439',coat='#344d55',shirt='#e9ddbf',trousers='#5b6464';
  const smoothSkin=new T.MeshStandardMaterial({color:skinLight,roughness:.85});
  function rounded(parent:T.Object3D,radius:number,position:V3,scale:V3,material:string|T.Material) {
    const mesh=k.mesh(parent,new T.SphereGeometry(radius,18,12),material,position);mesh.scale.set(...scale);return mesh;
  }
  for(const x of [-.115,.115]) {
    rounded(root,.12,[x,.105,.07],[.85,.75,1.45],C.darkWood);
    capsule(root,k,.086,.36,[x,.31,0],trousers);
    k.box(root,[.13,.045,.15],[x,.14,.02],C.gold);
  }
  rounded(root,.22,[0,.51,0],[1,.65,.66],trousers);
  const torso=k.mesh(root,new T.CapsuleGeometry(.22,.21,5,14),coat,[0,.79,0]);torso.scale.z=.68;
  rounded(root,.18,[0,.81,.141],[.65,1.05,.20],shirt);
  for(const sign of [-1,1]) {
    const lapel=k.box(root,[.065,.30,.04],[sign*.105,.87,.16],C.gold);lapel.rotation.z=-sign*.22;
    for(const y of [.67,.80,.93])rounded(root,.018,[sign*.16,y,.16],[1,1,.5],C.gold);
  }
  k.box(root,[.42,.065,.29],[0,.58,0],C.darkWood);k.box(root,[.10,.075,.035],[0,.58,.165],C.gold);
  capsule(root,k,.075,.16,[0,1.105,0],skin);
  const scarf=k.mesh(root,new T.TorusGeometry(.085,.027,6,14),C.ivory,[0,1.078,0],[Math.PI/2,0,0]);scarf.scale.z=.8;
  k.box(root,[.055,.15,.04],[.055,1.015,.16],C.ivory,[0,0,-.2]);

  const head=new T.Group();head.name='captain-head';head.position.set(0,1.12,0);root.add(head);
  rounded(head,.23,[0,.25,0],[.94,1.14,.91],smoothSkin);
  for(const sign of [-1,1]) {
    rounded(head,.064,[sign*.215,.25,0],[.65,1,.65],skin);
    rounded(head,.035,[sign*.225,.25,.028],[.42,.7,.35],'#bd805f');
    rounded(head,.047,[sign*.083,.303,.184],[.85,1,.55],'#f7f0df');
    rounded(head,.024,[sign*.083,.302,.208],[.85,1,.6],C.ink);
    rounded(head,.008,[sign*.078,.312,.221],[1,1,.5],'#fff7e8');
    k.rope(head,[[sign*.04,.37,.19],[sign*.085,.386,.19],[sign*.127,.367,.172]],hair,.014);
    rounded(head,.045,[sign*.115,.205,.176],[1,.45,.25],'#d59173');
  }
  rounded(head,.052,[0,.255,.21],[.8,.9,1.1],smoothSkin);
  k.rope(head,[[-.064,.163,.184],[0,.145,.212],[.064,.163,.184]],'#815443',.012);
  rounded(head,.059,[0,.101,.157],[1,.28,.32],hair);
  for(const x of [-.14,0,.14])rounded(head,.10,[x,.432,-.018],[1,.8,1],hair);
  const brim=new T.Shape();brim.moveTo(-.34,-.10);brim.quadraticCurveTo(-.35,.16,-.17,.17);brim.quadraticCurveTo(0,.08,.17,.17);brim.quadraticCurveTo(.35,.16,.34,-.10);brim.quadraticCurveTo(.2,-.20,0,-.27);brim.quadraticCurveTo(-.2,-.20,-.34,-.10);brim.closePath();
  k.mesh(head,new T.ExtrudeGeometry(brim,{depth:.045,bevelEnabled:true,bevelSize:.018,bevelThickness:.012,bevelSegments:2,steps:1}),coat,[0,.462,0],[-Math.PI/2,0,0]);
  rounded(head,.24,[0,.51,-.015],[1,.48,.9],coat);
  k.rope(head,[[-.20,.51,.13],[0,.535,.213],[.20,.51,.13]],C.gold,.019);
  rounded(head,.038,[0,.546,.212],[.85,1,.3],C.ivory);
  for(const sign of [-1,1])rounded(head,.009,[sign*.013,.55,.225],[1,1,.5],coat);

  function arm(sign:number) {
    const shoulder=new T.Group();shoulder.name=sign>0?'captain-wave-shoulder':'captain-rest-shoulder';shoulder.position.set(sign*.235,1.0,0);root.add(shoulder);
    capsule(shoulder,k,.083,.29,[0,-.13,0],coat);
    rounded(shoulder,.09,[0,-.015,0],[1,1,.9],C.gold);
    const elbow=new T.Group();elbow.name='captain-elbow';elbow.position.y=-.265;shoulder.add(elbow);
    capsule(elbow,k,.069,.25,[0,-.105,0],coat);
    k.cylinder(elbow,.073,.06,[0,-.208,0],C.ivory);
    const wrist=new T.Group();wrist.name='captain-wave-hand';wrist.position.set(0,-.26,.012);elbow.add(wrist);
    rounded(wrist,.074,[0,-.035,0],[.83,1,.48],smoothSkin);
    for(let finger=0;finger<4;finger++) {
      const x=(finger-1.5)*.031,length=[.075,.1,.105,.085][finger];
      const digit=capsule(wrist,k,.015,length,[x,-.09-length/2,0],skinLight);digit.rotation.z=(finger-1.5)*.12;
    }
    capsule(wrist,k,.021,.09,[-sign*.066,-.045,.008],skinLight).rotation.z=sign*.75;
    return {shoulder,elbow,wrist};
  }
  const resting=arm(1),waving=arm(-1);
  waving.shoulder.name='captain-wave-shoulder';resting.shoulder.name='captain-rest-shoulder';
  resting.shoulder.rotation.z=.18;resting.elbow.rotation.x=-.45;
  batchStaticDetails(head);
  batchStaticDetails(root,new Set([head,resting.shoulder,waving.shoulder]));
  return {root,head,resting,waving};
}

function createAnchor(k:Kit) {
  const pivot=new T.Group();pivot.name='swinging-anchor';pivot.position.set(3.05,2.18,1.38);
  for(let i=0;i<13;i++) {
    const link=k.mesh(pivot,new T.TorusGeometry(.047,.012,5,10),C.iron,[0,-.045-i*.071,.045+i*.009],[0,i%2?Math.PI/2:0,0]);link.scale.y=1.2;
  }
  k.ring(pivot,.10,.025,[0,-.99,.153],C.ironEdge);
  k.cylinder(pivot,.034,.55,[0,-1.30,.153],C.iron);
  k.box(pivot,[.48,.055,.065],[0,-1.105,.153],C.ironEdge);
  k.rope(pivot,[[-.36,-1.34,.153],[-.25,-1.52,.153],[0,-1.61,.153],[.25,-1.52,.153],[.36,-1.34,.153]],C.iron,.045);
  for(const sign of [-1,1])k.mesh(pivot,new T.ConeGeometry(.09,.18,4),C.ironEdge,[sign*.345,-1.365,.153],[0,0,-sign*.4]);
  batchStaticDetails(pivot);
  return pivot;
}

export function createShipAnimation(ship:T.Group) {
  const k=createKit(),captain=createCaptain(k),anchor=createAnchor(k);
  ship.add(captain.root,anchor);
  const pendulum:Pendulum={x:-.12,z:0,vx:0,vz:0};anchor.rotation.x=pendulum.x;
  let waveBlend=0,phase=0,waveStarts=0,previousSpeed=0,acceleration=0;
  return {
    dynamicRoots:[captain.root,anchor],
    captain:captain.root,
    anchor,
    startVoyage(){waveStarts++;},
    update(dt:number,time:number,motion:ShipMotion) {
      phase+=motion.reduced?0:dt*Math.PI*2*.95;
      waveBlend=T.MathUtils.damp(waveBlend,motion.sailing&&!motion.reduced?1:0,5,dt);
      const wave=Math.sin(phase),wrist=Math.sin(phase+.65);
      captain.waving.shoulder.rotation.z=-T.MathUtils.lerp(.10,2.12+.09*wave,waveBlend);
      captain.waving.shoulder.rotation.x=-.16*waveBlend;
      captain.waving.elbow.rotation.z=-waveBlend*(.30+.26*wave);
      captain.waving.wrist.rotation.z=-waveBlend*(.24*wrist);
      captain.waving.wrist.rotation.x=-.12*waveBlend;
      captain.root.rotation.z=motion.reduced?0:Math.sin(time*1.6)*.012;
      captain.head.rotation.z=motion.reduced?0:Math.sin(time*1.7+.4)*.025+waveBlend*.035;
      captain.head.rotation.y=waveBlend*.08;
      acceleration=T.MathUtils.damp(acceleration,(motion.speed-previousSpeed)/Math.max(.001,dt),4,dt);previousSpeed=motion.speed;
      if(motion.reduced){pendulum.x=-.12;pendulum.z=0;pendulum.vx=0;pendulum.vz=0;}
      else {
        const targetX=-.12-motion.roll+T.MathUtils.clamp(motion.speed*motion.turnRate*.009,-.09,.09)+Math.sin(time*1.65)*.012;
        const targetZ=-motion.pitch+T.MathUtils.clamp(-acceleration*.025,-.16,.16)+Math.sin(time*1.4+.7)*.008;
        stepAnchor(pendulum,targetX,targetZ,dt);
      }
      anchor.rotation.x=pendulum.x;anchor.rotation.z=pendulum.z;
      return {waveBlend,waveStarts,handAngle:captain.waving.wrist.rotation.z,anchorX:pendulum.x,anchorZ:pendulum.z};
    },
  };
}
