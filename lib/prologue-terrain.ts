import * as T from 'three';

type SceneKind='summit'|'forest';
export type MountainEnvironment={dispose:()=>void;setReduced:(reduced:boolean)=>void};
const clamp=T.MathUtils.clamp;
const smooth=(t:number)=>t*t*(3-2*t);
function hash(x:number,z:number){const n=Math.sin(x*127.1+z*311.7+19.4)*43758.5453;return n-Math.floor(n);}
function noise(x:number,z:number){const ix=Math.floor(x),iz=Math.floor(z),u=smooth(x-ix),v=smooth(z-iz);return T.MathUtils.lerp(T.MathUtils.lerp(hash(ix,iz),hash(ix+1,iz),u),T.MathUtils.lerp(hash(ix,iz+1),hash(ix+1,iz+1),u),v);}
function fbm(x:number,z:number){return noise(x,z)*.54+noise(x*2.03+17,z*2.03-9)*.27+noise(x*4.1-11,z*4.1+23)*.13+noise(x*8.15,z*8.15)*.06;}
const peaks=[[-37,-64,43,28,26],[20,-63,61,25,24],[61,-91,45,33,29],[-80,-105,51,40,36],[1,-128,66,44,34]];
function heightAt(x:number,z:number){
 let mountain=0;
 for(const [px,pz,amp,rx,rz] of peaks){
  const warp=(noise(x*.027+4,z*.027)-.5)*5;
  const dx=(x-px+warp)/rx,dz=(z-pz)/rz,r=Math.hypot(dx,dz);
  const angle=Math.atan2(dx,dz),channels=.5+.5*Math.sin(angle*8.4+noise(x*.043,z*.043)*4.7+r*2.3);
  const erosion=smooth(clamp(r/.62,0,1))*.19*channels;
  const cone=amp*Math.exp(-Math.pow(r,1.42)*1.36)*(1-erosion);
  mountain=Math.max(mountain,cone);
 }
 const broad=fbm(x*.066,z*.066),ridge=1-Math.abs(noise(x*.17+noise(z*.03,8)*3,z*.17)*2-1);
 return 1.4+mountain*(.77+broad*.23+ridge*.16)+(fbm(x*.045+20,z*.045)-.5)*4;
}

/** Procedural 3D terrain and volumetric trees; no landscape photographs or render loop in React. */
export function createMountainEnvironment(host:HTMLDivElement,kind:SceneKind,reducedMotion:boolean):MountainEnvironment|null{
 const canvas=document.createElement('canvas');
 const context=canvas.getContext('webgl2',{alpha:true,antialias:true,powerPreference:'low-power'});
 if(!context)return null;
 let renderer:T.WebGLRenderer;
 try{renderer=new T.WebGLRenderer({canvas,context,alpha:true,antialias:true,powerPreference:'low-power'});}catch{return null;}
 const phone=host.clientWidth<700;
 renderer.setPixelRatio(Math.min(devicePixelRatio,phone?1.15:1.5));
 renderer.setClearColor(0x000000,0);renderer.outputColorSpace=T.SRGBColorSpace;
 renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
 renderer.shadowMap.enabled=!phone;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;
 canvas.setAttribute('aria-hidden','true');canvas.style.cssText='display:block;width:100%;height:100%;';host.appendChild(canvas);
 const scene=new T.Scene();scene.fog=new T.FogExp2('#afc0af',kind==='summit'?.0062:.0078);
 const camera=new T.PerspectiveCamera(phone?49:43,1,.5,420);
 const target=kind==='summit'?new T.Vector3(0,27,-50):new T.Vector3(1,22,-52);
 camera.position.set(phone?-6:5,kind==='summit'?30:20,kind==='summit'?61:53);camera.lookAt(target);
 const hemisphere=new T.HemisphereLight('#ecf0d8','#304d38',2.05);scene.add(hemisphere);
 const sun=new T.DirectionalLight('#fff0cd',2.7);sun.position.set(-56,94,30);sun.target.position.set(0,16,-35);scene.add(sun,sun.target);
 sun.castShadow=!phone;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-64;sun.shadow.camera.right=64;sun.shadow.camera.top=70;sun.shadow.camera.bottom=-65;sun.shadow.camera.far=240;sun.shadow.normalBias=.16;sun.shadow.bias=-.0004;
 const grid=phone?108:164;
 const terrain=new T.PlaneGeometry(250,230,grid,grid).rotateX(-Math.PI/2).translate(0,0,-66);
 const positions=terrain.attributes.position,colors=new Float32Array(positions.count*3);
 const grass=new T.Color('#425f40'),mid=new T.Color('#788263'),rock=new T.Color('#919486'),shade=new T.Color('#566652');
 for(let i=0;i<positions.count;i++){
  const x=positions.getX(i),z=positions.getZ(i),y=heightAt(x,z);positions.setY(i,y);
  const color=grass.clone().lerp(mid,clamp((y-7)/28,0,1)).lerp(rock,clamp((y-32)/30,0,1));
  color.lerp(shade,(1-noise(x*.33,z*.33))*.18);colors.set([color.r,color.g,color.b],i*3);
 }
 terrain.setAttribute('color',new T.BufferAttribute(colors,3));terrain.computeVertexNormals();
 const ground=new T.Mesh(terrain,new T.MeshStandardMaterial({vertexColors:true,roughness:1,metalness:0}));ground.name='sculpted-mountain-relief';ground.receiveShadow=true;scene.add(ground);
 // Every tree has a tapered trunk, real branching wood, and shaded needle clusters.
 const trunks:T.Matrix4[]=[],limbs:T.Matrix4[]=[],foliage:T.Matrix4[]=[],leafColors:T.Color[]=[];
 const dummy=new T.Object3D(),up=new T.Vector3(0,1,0),leafColor=new T.Color();
 const matrix=(x:number,y:number,z:number,sx:number,sy:number,sz:number,rotation=0,tilt=0)=>{dummy.position.set(x,y,z);dummy.rotation.set(tilt*.6,rotation,tilt);dummy.scale.set(sx,sy,sz);dummy.updateMatrix();return dummy.matrix.clone();};
 const addLimb=(a:T.Vector3,b:T.Vector3,r:number)=>{const d=b.clone().sub(a);dummy.position.copy(a).addScaledVector(d,.5);dummy.quaternion.setFromUnitVectors(up,d.clone().normalize());dummy.scale.set(r,d.length(),r);dummy.updateMatrix();limbs.push(dummy.matrix.clone());};
 function tree(x:number,z:number,size:number,seed:number){
  const base=heightAt(x,z),height=size,spin=hash(seed,3)*Math.PI*2;
  trunks.push(matrix(x,base+height*.48,z,height*.018,height*.96,height*.018));
  for(let layer=0;layer<7;layer++){
   const t=layer/7,y=base+height*(.2+t*.7),radius=height*(.2*Math.pow(1-t,.85)+.025)*(.88+hash(seed,layer)*.22);
   const count=layer>4?3:5;
   for(let j=0;j<count;j++){
    const angle=spin+j*Math.PI*2/count+layer*1.71,reach=radius*(.8+hash(seed+layer,j)*.35);
    const ax=x+Math.cos(angle)*reach,az=z+Math.sin(angle)*reach,ay=y+height*((hash(j+layer,seed)-.5)*.085+.015);
    addLimb(new T.Vector3(x,y,z),new T.Vector3(ax,ay,az),height*.006*(1-t*.55));
    foliage.push(matrix(ax,ay+height*.025,az,reach*.62+height*.022,height*(.10-t*.035),reach*.59+height*.025,angle,(hash(seed+layer,j)-.5)*.45));
    leafColor.set('#315f3e').lerp(new T.Color('#6f8b52'),hash(seed*11+layer,j)*.55);leafColors.push(leafColor.clone());
   }
  }
  foliage.push(matrix(x,base+height*.94,z,height*.05,height*.115,height*.05,spin));leafColors.push(new T.Color('#52774b'));
 }
 // Widely spaced near trees frame the portrait; smaller forests occupy the lower slopes.
 const foreground=kind==='summit'?[[-29,9,22],[-35,0,18],[30,10,25],[39,-1,20],[24,-13,13]]:[[-25,13,22],[-34,1,26],[29,14,29],[38,1,23],[22,-8,19]];
 foreground.forEach(([x,z,h],i)=>tree(x,z,h,i+1));
 const count=phone?32:51;
 for(let i=0;i<count;i++){
  const x=-82+hash(i,8)*165,z=-80+hash(i,19)*73,h=4+hash(i,31)*8;
  if(heightAt(x,z)<29)tree(x,z,h,i+40);
 }
 const wood=new T.MeshStandardMaterial({color:'#5d5140',roughness:1});
 const needles=new T.MeshStandardMaterial({color:'#ced6bf',roughness:.95,metalness:0});
 const time={value:0};
 needles.onBeforeCompile=shader=>{
  shader.uniforms.mountainWind=time;
  shader.vertexShader=`uniform float mountainWind;
`+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
   #ifdef USE_INSTANCING
    vec4 branch=instanceMatrix*vec4(position,1.);
    float gust=sin(mountainWind*.68+branch.x*.12+branch.z*.075)+.35*sin(mountainWind*1.15+branch.y*.2);
    transformed.x+=gust*.027;transformed.z+=cos(mountainWind*.6+branch.x*.09)*.018;
   #endif`);
 };
 const woodGeometry=new T.CylinderGeometry(.62,1,1,7);
 const leafGeometry=new T.IcosahedronGeometry(1,phone?1:2);
 const trunkMesh=new T.InstancedMesh(woodGeometry,wood,trunks.length),branchMesh=new T.InstancedMesh(woodGeometry,wood,limbs.length),leafMesh=new T.InstancedMesh(leafGeometry,needles,foliage.length);
 trunks.forEach((m,i)=>trunkMesh.setMatrixAt(i,m));limbs.forEach((m,i)=>branchMesh.setMatrixAt(i,m));foliage.forEach((m,i)=>{leafMesh.setMatrixAt(i,m);leafMesh.setColorAt(i,leafColors[i]);});
 for(const mesh of [trunkMesh,branchMesh,leafMesh]){mesh.castShadow=!phone;mesh.receiveShadow=true;mesh.frustumCulled=false;scene.add(mesh);}
 leafMesh.name='volumetric-wind-foliage';host.dataset.treeCount=String(trunks.length);host.dataset.terrainVertices=String(positions.count);host.dataset.renderer='webgl';
 const reduced={value:reducedMotion};let frame=0,disposed=false,last=0;
 const render=(now:number)=>{
  if(disposed)return;
  if(now-last>=32||last===0){
   if(!reduced.value)time.value=now/1000;
   renderer.render(scene,camera);renderer.shadowMap.needsUpdate=false;last=now;
   host.dataset.windTime=time.value.toFixed(3);
  }
  if(!reduced.value)frame=requestAnimationFrame(render);
 };
 const resize=()=>{const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();renderer.shadowMap.needsUpdate=true;renderer.render(scene,camera);};
 const observer=new ResizeObserver(resize);observer.observe(host);resize();frame=requestAnimationFrame(render);
 return {setReduced(value){reduced.value=value;cancelAnimationFrame(frame);frame=requestAnimationFrame(render);},dispose(){disposed=true;cancelAnimationFrame(frame);observer.disconnect();terrain.dispose();(ground.material as T.Material).dispose();woodGeometry.dispose();leafGeometry.dispose();wood.dispose();needles.dispose();trunkMesh.dispose();branchMesh.dispose();leafMesh.dispose();sun.shadow.map?.dispose();renderer.dispose();canvas.remove();}};
}
