import * as T from 'three';
import { FontLoader, type FontData } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import anthrope from './fonts/anthrope.typeface.json' with {type:'json'};
import { voyageDestinations } from './destinations';
import { shoreTitleOffset } from './voyage-routes';

const font = new FontLoader().parse(anthrope as FontData);

/** Raised Anthrope lettering follows the front beach's elliptical sweep, resting on sand. */
export function createWaterTitle(index:number) {
  const name=voyageDestinations[index].name;
  const geometry=new TextGeometry(name,{
    font,size:1,depth:.21,curveSegments:2,steps:1,
    bevelEnabled:true,bevelThickness:.014,bevelSize:.006,bevelSegments:2,
  });
  geometry.computeBoundingBox();
  const bounds=geometry.boundingBox!;
  const width=bounds.max.x-bounds.min.x,height=bounds.max.y-bounds.min.y;
  const scale=Math.min(7.3/width,1.12/height);
  geometry.translate(-(bounds.min.x+bounds.max.x)/2,-(bounds.min.y+bounds.max.y)/2,-bounds.min.z);
  geometry.scale(scale,scale,1);
  // Bend both the baseline and letter faces. The inward normal keeps the glyphs
  // perpendicular to the same coast curve, with no separate floating characters.
  const radiusX=4.2,radiusZ=3,positions=geometry.attributes.position;
  for(let i=0;i<positions.count;i++){
    const x=positions.getX(i),y=positions.getY(i),angle=x/radiusX;
    const sin=Math.sin(angle),cos=Math.cos(angle),length=Math.hypot(radiusX*cos,radiusZ*sin);
    const inwardX=-radiusZ*sin/length,inwardZ=-radiusX*cos/length;
    const curvedX=radiusX*sin+y*inwardX;
    const curvedZ=radiusZ*(cos-1)+y*inwardZ;
    positions.setXY(i,curvedX,-curvedZ);
  }
  positions.needsUpdate=true;geometry.computeVertexNormals();geometry.computeBoundingBox();geometry.computeBoundingSphere();
  const face=new T.MeshStandardMaterial({color:'#b3935f',metalness:.25,roughness:.4});
  const edge=new T.MeshStandardMaterial({color:'#a67c43',metalness:.35,roughness:.48});
  const letters=new T.Mesh(geometry,[face,edge]);
  letters.name='beveled-water-title';letters.castShadow=true;letters.receiveShadow=true;
  letters.userData.font='Anthrope';letters.userData.title=name;letters.userData.beveled=true;letters.userData.curved=true;
  letters.rotation.x=-Math.PI/2;
  const title=new T.Group();title.name=`water-title-${index}`;title.add(letters);
  title.position.set(...shoreTitleOffset);
  title.userData.port=index;title.userData.surface='sand';title.userData.layout='elliptical-shore';
  return title;
}
