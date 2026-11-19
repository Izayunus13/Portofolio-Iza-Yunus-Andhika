import * as T from 'three';

export const islandSandTop=.8;
/** Shared actual sand surface for island rendering and grounded lettering checks. */
export function createIslandSandGeometry(index:number){
 const shape=new T.Shape(),count=15;
 for(let i=0;i<count;i++){
  const a=i/count*Math.PI*2,r=1+Math.sin(i*3.7+index)*.08;
  const x=Math.cos(a)*4.4*r,z=Math.sin(a)*3.4*r;
  if(i)shape.lineTo(x,z);else shape.moveTo(x,z);
 }
 shape.closePath();
 return new T.ExtrudeGeometry(shape,{depth:.6,bevelEnabled:true,bevelSegments:2,bevelSize:.22,bevelThickness:.15,steps:1});
}
