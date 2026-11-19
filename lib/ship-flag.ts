import * as T from 'three';
import {angleDifference} from './voyage-motion';

export const flagLength=1.65;
export const flagHeight=1;
export type FlagMotion={velocityX:number;velocityZ:number;heading:number;reduced:boolean};

/** The hoist is x=0; the free edge extends along +x before wind orientation. */
export function createFlagGeometry(){
 const geometry=new T.PlaneGeometry(flagLength,flagHeight,24,12);
 geometry.translate(flagLength/2,0,0);
 const position=geometry.attributes.position;
 for(let i=0;i<position.count;i++)if(Math.abs(position.getX(i))<1e-6)position.setX(i,0);
 return geometry;
}

/** Apparent airflow points opposite actual travel, even while hull heading catches up. */
export function createFlagAnimation(flag:T.Mesh){
 const position=flag.geometry.attributes.position;
 const base=Float32Array.from(position.array);flag.userData.base=base;
 flag.rotation.y=Math.PI;flag.frustumCulled=false;
 let openness=0,phase=0;
 return {
  update(dt:number,_time:number,motion:FlagMotion){
   const c=Math.cos(motion.heading),s=Math.sin(motion.heading);
   const localX=c*motion.velocityX-s*motion.velocityZ;
   const localZ=s*motion.velocityX+c*motion.velocityZ;
   const speed=Math.hypot(localX,localZ);
   const step=Math.max(0,dt);
   // With no apparent airflow, retain the last orientation as the cloth settles.
   if(speed>.08){
    const target=Math.atan2(localZ,-localX);
    flag.rotation.y=motion.reduced?target:flag.rotation.y+angleDifference(target,flag.rotation.y)*(-Math.expm1(-step*10));
   }
   const targetOpen=T.MathUtils.smoothstep(speed,.12,3);
   openness=motion.reduced?targetOpen:T.MathUtils.damp(openness,targetOpen,targetOpen>openness?4.5:3.2,step);
   if(Math.abs(openness-targetOpen)<.0005)openness=targetOpen;
   const airflow=T.MathUtils.smoothstep(speed,.12,6);
   // Integrating phase avoids a sudden flutter jump when the boat changes speed.
   if(!motion.reduced)phase+=step*(3+airflow*4)*openness;
   const amplitude=motion.reduced?0:.133*Math.pow(openness,1.2);
   let tipWave=0,tipDrop=0,reach=0,tipCount=0,hoistError=0;
   for(let i=0;i<position.count;i++){
    const x=base[i*3],y=base[i*3+1],u=T.MathUtils.clamp(x/flagLength,0,1);
    const free=Math.pow(T.MathUtils.smoothstep(u,.12,1),1.15);
    // Gravity gathers the loose cloth into narrow, static pleats beneath the hoist.
    const attachment=flagLength*.12,loose=Math.max(0,x-attachment);
    const foldedX=Math.min(x,attachment)+loose*.045;
    const clothX=T.MathUtils.lerp(foldedX,x,openness);
    const drop=(1-openness)*flagLength*.85*free;
    const pleat=Math.sin(Math.max(0,(u-.12)/.88)*Math.PI*4)*.055*(1-openness)*free;
    const wave=(Math.sin(u*8.5-phase+y*.8)*amplitude+Math.sin(u*15-phase*1.45-y*1.2)*amplitude*.25)*free;
    const vertical=motion.reduced?0:Math.sin(u*7-phase*.85)*.016*openness*free;
    position.setXYZ(i,clothX,y-drop+vertical,pleat+wave);
    if(u===0)hoistError=Math.max(hoistError,Math.abs(position.getY(i)-y),Math.abs(position.getZ(i)));
    if(u>.999){tipWave+=wave;tipDrop+=drop-vertical;reach+=clothX;tipCount++;}
   }
   position.needsUpdate=true;flag.geometry.computeVertexNormals();
   return {speed,openness,reach:reach/Math.max(1,tipCount),tipDrop:tipDrop/Math.max(1,tipCount),tipWave:tipWave/Math.max(1,tipCount),hoistError,aftAlignment:-Math.cos(flag.rotation.y)};
  },
 };
}
