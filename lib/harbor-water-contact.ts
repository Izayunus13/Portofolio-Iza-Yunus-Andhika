import * as T from 'three';
import {hullOutline,hullLevels} from './ship-hull';
import {harborWaterHeight} from './harbor-ocean';

export const harborDraft=.88;

/** Draw the wet contact edge at the actual submerged hull cross-section. */
export function createHullWaterContact(scene:T.Scene,scale:number,heading:number){
 const lower=hullLevels[2],upper=hullLevels[3];
 const crossSection=T.MathUtils.lerp(lower[1],upper[1],(harborDraft-lower[0])/(upper[0]-lower[0]));
 const count=108,positions=new Float32Array(count*6*3),colors=new Float32Array(count*6*4);
 const geometry=new T.BufferGeometry();
 geometry.setAttribute('position',new T.BufferAttribute(positions,3).setUsage(T.DynamicDrawUsage));
 geometry.setAttribute('color',new T.BufferAttribute(colors,4).setUsage(T.DynamicDrawUsage));
 const material=new T.MeshBasicMaterial({color:'#daeef2',vertexColors:true,transparent:true,depthWrite:false,side:T.DoubleSide});
 const edge=new T.Mesh(geometry,material);edge.name='hull-water-contact-foam';edge.frustumCulled=false;edge.renderOrder=3;scene.add(edge);
 // A faint, soft occlusion under the wet hull gives the water depth without a hard black oval.
 const canvas=document.createElement('canvas');canvas.width=128;canvas.height=64;
 const context=canvas.getContext('2d')!;context.scale(1,.5);
 const gradient=context.createRadialGradient(64,64,12,64,64,64);
 gradient.addColorStop(0,'rgba(8,31,51,.45)');gradient.addColorStop(.65,'rgba(8,31,51,.17)');gradient.addColorStop(1,'rgba(8,31,51,0)');
 context.fillStyle=gradient;context.fillRect(0,0,128,128);
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
 const shadowGeometry=new T.PlaneGeometry(10*scale,4*scale,22,10).rotateX(-Math.PI/2);
 const base=Float32Array.from(shadowGeometry.attributes.position.array);
 const shadow=new T.Mesh(shadowGeometry,new T.MeshBasicMaterial({map:texture,transparent:true,opacity:.4,depthWrite:false,side:T.DoubleSide}));
 shadow.name='soft-hull-water-occlusion';shadow.renderOrder=1;shadow.frustumCulled=false;scene.add(shadow);
 const c=Math.cos(heading),s=Math.sin(heading);
 function point(t:number){
  const p=(t%1)*hullOutline.length,i=Math.floor(p),a=hullOutline[i],b=hullOutline[(i+1)%hullOutline.length];
  return {x:T.MathUtils.lerp(a[0],b[0],p-i)*crossSection*scale,z:T.MathUtils.lerp(a[1],b[1],p-i)*crossSection*scale};
 }
 return {update(x:number,z:number,time:number){
  let vertex=0;
  const write=(t:number,outer:boolean)=>{
   const local=point(t),factor=outer?1.06:1.003;
   const wx=x+(local.x*c+local.z*s)*factor,wz=z+(-local.x*s+local.z*c)*factor;
   positions[vertex*3]=wx;positions[vertex*3+1]=harborWaterHeight(wx,wz,time)+.024;positions[vertex*3+2]=wz;
   colors[vertex*4]=1;colors[vertex*4+1]=1;colors[vertex*4+2]=1;
   colors[vertex*4+3]=(outer?.015:.52)*(.72+.28*Math.sin(t*37-time*1.3));
   vertex++;
  };
  for(let i=0;i<count;i++){
   const a=i/count,b=(i+1)/count;
   write(a,false);write(b,false);write(a,true);write(a,true);write(b,false);write(b,true);
  }
  geometry.attributes.position.needsUpdate=true;geometry.attributes.color.needsUpdate=true;
  const p=shadowGeometry.attributes.position;
  for(let i=0;i<p.count;i++){
   const lx=base[i*3],lz=base[i*3+2],wx=x+lx*c+lz*s,wz=z-lx*s+lz*c;
   p.setXYZ(i,wx,harborWaterHeight(wx,wz,time)+.009,wz);
  }
  p.needsUpdate=true;
 }};
}
