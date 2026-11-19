import * as T from 'three';
import { createKit } from './three-kit';
import { certificateCollections } from './certificates';
import { batchStaticDetails } from './voyage-render';

export const certificateIslandOffset=[7.2,0,1.0] as const;
export const certificateIslandRadius=2.25;
export async function loadCertificateTextures(){
  const loader=new T.TextureLoader(),textures=new Map<string,T.Texture>();
  const sources=[...new Set(certificateCollections.flatMap(collection=>{
    const earned=collection.certificates.filter(certificate=>!certificate.comingSoon);
    return (earned.length?earned:collection.certificates.slice(0,1)).map(certificate=>certificate.image);
  }))];
  await Promise.all(sources.map(async source=>{try{const texture=await loader.loadAsync(source);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=2;textures.set(source,texture);}catch{/* The frame retains its paper backing if a supplied image is unavailable. */}}));
  return textures;
}

/** A small, batched satellite island. Slides share the world's renderer and decoded textures. */
export function createCertificateIsland(port:number,textures:Map<string,T.Texture>){
  const collection=certificateCollections[port-1],root=new T.Group(),k=createKit();
  root.name='certificate-island-'+port;root.userData.certificatePort=port;
  const outline=new T.Shape();for(let i=0;i<12;i++){const a=i/12*Math.PI*2,r=1+Math.sin(i*2.9)*.07;const x=Math.cos(a)*1.9*r,z=Math.sin(a)*1.55*r;i?outline.lineTo(x,z):outline.moveTo(x,z);}outline.closePath();
  k.mesh(root,new T.ExtrudeGeometry(outline,{depth:.35,bevelEnabled:true,bevelSize:.13,bevelThickness:.1,bevelSegments:1,steps:1}),'#e7d4a3',[0,.02,0],[-Math.PI/2,0,0]);
  const grass=k.cylinder(root,1.2,.08,[-.1,.48,-.3],'#9ab58b');grass.scale.z=.68;
  const shelf=k.mesh(root,new T.CircleGeometry(2.45,24),new T.MeshBasicMaterial({color:'#b6e1cb',transparent:true,opacity:.2,depthWrite:false}),[0,-.035,0],[-Math.PI/2,0,0]);shelf.scale.y=.8;shelf.castShadow=false;shelf.receiveShadow=false;
  for(let i=0;i<7;i++){const a=i/7*Math.PI*2;k.sphere(root,.22,[Math.cos(a)*1.83,.07,Math.sin(a)*1.48],'#9ca99d',[1,.7,1]);}
  // A low shrub leaves the certificate silhouette uncluttered.
  for(let i=0;i<3;i++)k.sphere(root,.25,[-1.2+i*.22,.56,-.65+i*.08],'#6d9a77',[1,1.2,1]);
  const stand=new T.Group();stand.position.set(0,0,-.12);stand.rotation.y=.5;root.add(stand);
  for(const x of [-.98,.98]){k.box(stand,[.1,1.45,.14],[x,1.16,0],'#806344');k.box(stand,[.44,.09,.6],[x,.51,0],'#b89766');}
  const board=new T.Group();board.position.set(0,2.55,0);board.rotation.x=-.07;stand.add(board);
  k.box(board,[3.2,2.25,.14],[0,0,0],'#74573e');
  for(const sign of [-1,1]){k.box(board,[3.28,.13,.23],[0,sign*1.13,.035],'#bb955b');k.box(board,[.13,2.25,.23],[sign*1.59,0,.035],'#bb955b');}
  k.box(board,[3.01,2.04,.025],[0,0,.095],'#f7edcf');
  for(const x of [-1.59,1.59])for(const y of [-1.13,1.13])k.sphere(board,.047,[x,y,.17],'#e9ca86');
  const earned=collection.certificates.map((certificate,index)=>({certificate,index})).filter(item=>!item.certificate.comingSoon);
  const available=earned.length?earned:[{certificate:collection.certificates[0],index:0}];
  const images=available.map(item=>textures.get(item.certificate.image));
  const material=(index:number)=>new T.MeshBasicMaterial({map:images[index]??null,color:images[index]?'#ffffff':'#f7edcf',transparent:true,depthWrite:false,toneMapped:false});
  const face=new T.PlaneGeometry(2.99,2.025),primary=new T.Mesh(face,material(0)),secondary=new T.Mesh(face,material(1%images.length));
  const fitImage=(mesh:T.Mesh,texture:T.Texture|undefined)=>{
    const image=texture?.image as {width:number;height:number}|undefined;
    const ratio=image?.width&&image.height?image.width/image.height:2.99/2.025;
    const frameRatio=2.99/2.025;
    mesh.scale.set(Math.min(1,ratio/frameRatio),Math.min(1,frameRatio/ratio),1);
  };
  fitImage(primary,images[0]);fitImage(secondary,images[1%images.length]);
  primary.position.z=.114;secondary.position.z=.117;primary.castShadow=false;secondary.castShadow=false;secondary.material.opacity=0;board.add(primary,secondary);
  root.traverse(object=>{object.userData.certificatePort=port;});
  batchStaticDetails(root,new Set([primary,secondary]));
  let shown=0,selected=0;
  return {root,labelAnchor:new T.Vector3(0,.55,1.45),pickAnchor:new T.Vector3(0,2.55,-.12),get selected(){return selected;},
    update(time:number){
      if(images.length===1){selected=available[0].index;return;}
      const cycle=(time+(port-1)*.8)/4.8,current=Math.floor(cycle)%images.length,next=(current+1)%images.length;
      const blend=T.MathUtils.smoothstep(cycle%1,.86,1);
      if(shown!==current){shown=current;primary.material.map=images[current]??null;secondary.material.map=images[next]??null;fitImage(primary,images[current]);fitImage(secondary,images[next]);primary.material.needsUpdate=true;secondary.material.needsUpdate=true;}
      primary.material.opacity=1-blend;secondary.material.opacity=blend;selected=available[blend>.5?next:current].index;
    }
  };
}
