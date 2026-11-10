import * as T from 'three';
import { FontLoader, type FontData } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import helvetiker from './fonts/helvetiker_bold.typeface.json';
import { voyageDestinations } from './destinations';

const font = new FontLoader().parse(helvetiker as FontData);

/** Real extruded, beveled letters. The baseline touches the water. */
export function createWaterTitle(index:number) {
  const name=voyageDestinations[index].name;
  const geometry=new TextGeometry(name.toUpperCase(),{
    font,size:.68,depth:.19,curveSegments:5,steps:1,
    bevelEnabled:true,bevelThickness:.038,bevelSize:.025,bevelSegments:3,
  });
  geometry.computeBoundingBox();
  const bounds=geometry.boundingBox!;
  const width=bounds.max.x-bounds.min.x;
  geometry.translate(-(bounds.min.x+bounds.max.x)/2,-bounds.min.y+.025,-.095);
  const face=new T.MeshStandardMaterial({color:'#f6e6b8',metalness:.25,roughness:.4});
  const edge=new T.MeshStandardMaterial({color:'#a67c43',metalness:.35,roughness:.48});
  const letters=new T.Mesh(geometry,[face,edge]);
  letters.name='beveled-water-title';letters.castShadow=true;letters.receiveShadow=true;
  letters.userData.title=name;letters.userData.beveled=true;letters.scale.setScalar(Math.min(1,7.7/width));
  const title=new T.Group();title.name=`water-title-${index}`;title.add(letters);
  // This angle faces the fixed isometric camera while the base remains in the sea.
  title.rotation.y=Math.atan2(21,27);title.position.set(.65,.035,5.7);
  title.userData.port=index;
  return title;
}
