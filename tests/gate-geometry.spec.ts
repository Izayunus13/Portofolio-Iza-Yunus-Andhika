import {test,expect} from '@playwright/test';
import * as T from 'three';
import {buildGateLeaf,gateBodyDepth} from '../lib/gate-leaf';

type Face={name:string;z:number;corners:T.Vector3[]};
function overlaps(a:Face,b:Face){
 for(const polygon of [a.corners,b.corners])for(let i=0;i<4;i++){
  const edge=polygon[(i+1)%4].clone().sub(polygon[i]),axis=new T.Vector2(-edge.y,edge.x).normalize();
  const project=(points:T.Vector3[])=>points.map(point=>point.x*axis.x+point.y*axis.y);
  const left=project(a.corners),right=project(b.corners);
  if(Math.min(Math.max(...left),Math.max(...right))-Math.max(Math.min(...left),Math.min(...right))<=.00001)return false;
 }
 return true;
}
for(const width of [4.5,6,17]){
 test(`gate ${width}: assembled faces never compete for the same depth`,()=>{
  const material=new T.MeshStandardMaterial(),roots:T.Group[]=[],faces:Face[]=[];
  for(const side of [-1,1]as const){
   const root=new T.Group();root.name=side===-1?'left':'right';root.position.x=side*width;
   buildGateLeaf(root,width,side,{timber:material,darkWood:material,teal:material,tealDark:material,brass:material,iron:material,glass:material,lettering:material});
   root.updateMatrixWorld(true);roots.push(root);
   root.traverse(object=>{
    if(!(object instanceof T.Mesh)||object.geometry.type!=='RoundedBoxGeometry')return;
    object.geometry.computeBoundingBox();const bounds=object.geometry.boundingBox!;
    const corners=[[bounds.min.x,bounds.min.y],[bounds.max.x,bounds.min.y],[bounds.max.x,bounds.max.y],[bounds.min.x,bounds.max.y]].map(([x,y])=>new T.Vector3(x,y,bounds.max.z).applyMatrix4(object.matrixWorld));
    if(Math.max(...corners.map(point=>point.z))-Math.min(...corners.map(point=>point.z))>.00001)return;
    faces.push({name:root.name+'/'+object.name,z:corners[0].z,corners});
   });
  }
  try{
   const collisions:string[]=[];
   for(let i=0;i<faces.length;i++)for(let j=i+1;j<faces.length;j++)if(Math.abs(faces[i].z-faces[j].z)<.00001&&overlaps(faces[i],faces[j]))collisions.push(faces[i].name+' overlaps '+faces[j].name);
   expect(collisions,'Overlapping faces at equal depth cause flicker while the doors rotate').toEqual([]);
   const cores=roots.map(root=>root.getObjectByName('gate-core')as T.Mesh);
   for(const core of cores){core.geometry.computeBoundingBox();const bounds=core.geometry.boundingBox!;expect(bounds.max.z-bounds.min.z).toBeCloseTo(gateBodyDepth,5);}
   const a=new T.Box3().setFromObject(cores[0]),b=new T.Box3().setFromObject(cores[1]);
   expect(a.max.x-b.min.x,'Closed door cores must meet without intersecting').toBeLessThan(.00001);
  }finally{roots.forEach(root=>root.traverse(object=>{if(object instanceof T.Mesh)object.geometry.dispose();}));material.dispose();}
 });
}
