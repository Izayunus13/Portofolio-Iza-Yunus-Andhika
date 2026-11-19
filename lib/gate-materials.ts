import * as T from 'three';

/** Small, neutral maps keep the painted boards teal while light catches their grain. */
export function createGateTimberMaps(){
 const width=256,height=512;
 const canvases=Array.from({length:3},()=>{const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;return canvas;});
 const contexts=canvases.map(canvas=>canvas.getContext('2d')!);
 const images=contexts.map(context=>context.createImageData(width,height));
 const clamp=(value:number)=>Math.max(0,Math.min(255,Math.round(value)));
 let seed=28763;
 const noise=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296-.5;};
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const u=x/width,v=y/height,dx=u-.34,dy=(v-.38)*1.8;
  const knot=Math.exp(-(dx*dx+dy*dy)*48);
  const bend=.42*Math.sin(v*9)+.12*Math.sin(v*37)+knot*Math.sin(Math.atan2(dy,dx))*1.15;
  const grain=Math.sin((u*11+bend)*Math.PI*2),fibres=Math.sin((u*53+bend*3)*Math.PI*2);
  const random=noise(),tone=clamp(192+grain*7+fibres+random*3-knot*12);
  const relief=clamp(130+grain*14+fibres*1.2+random*2-knot*16);
  const roughness=clamp(204+grain*8+random*3),index=(y*width+x)*4;
  images[0].data.set([tone,clamp(tone+1),clamp(tone-3),255],index);
  images[1].data.set([relief,relief,relief,255],index);
  images[2].data.set([roughness,roughness,roughness,255],index);
 }
 const textures=canvases.map((canvas,index)=>{
  contexts[index].putImageData(images[index],0,0);
  const texture=new T.CanvasTexture(canvas);texture.anisotropy=4;
  texture.wrapS=texture.wrapT=T.RepeatWrapping;
  return texture;
 });
 textures[0].colorSpace=T.SRGBColorSpace;
 return {map:textures[0],bumpMap:textures[1],roughnessMap:textures[2]};
}
