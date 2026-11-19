import * as T from 'three';
import { createHomeReef, createIsland } from './voyage-islands';
import { batchStaticDetails } from './voyage-render';

export type MiniatureHarbour = { highlight:(active:number,hover:number)=>void; dispose:()=>void };

/** Four scissored views share one WebGL context. Render only while changing. */
export async function createMiniatureHarbour(host:HTMLDivElement,onReady:()=>void):Promise<MiniatureHarbour> {
  const renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor(0x000000,0);
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
  renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
  renderer.domElement.setAttribute('aria-hidden','true');host.appendChild(renderer.domElement);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  async function createView(index:number){
    await new Promise<void>(resolve=>setTimeout(resolve,0));
    const scene=new T.Scene();
    scene.add(new T.HemisphereLight('#fff9e7','#668e83',1.7));
    const sun=new T.DirectionalLight('#fff1d0',2.6);sun.position.set(-8,15,10);sun.castShadow=true;
    sun.shadow.mapSize.set(512,512);Object.assign(sun.shadow.camera,{left:-8,right:8,top:8,bottom:-8,near:.5,far:40});sun.shadow.bias=-.0005;sun.shadow.normalBias=.025;scene.add(sun);
    const fill=new T.DirectionalLight('#d1e9e4',.7);fill.position.set(8,5,-6);scene.add(fill);
    const island=index===0?createHomeReef():createIsland(index,{waterTitle:false});if(index===0)island.scale.setScalar(1.65);scene.add(island);batchStaticDetails(island);
    const ground=new T.Mesh(new T.PlaneGeometry(18,18),new T.ShadowMaterial({opacity:.16}));ground.rotation.x=-Math.PI/2;ground.position.y=-.17;ground.receiveShadow=true;scene.add(ground);
    const halo=new T.Mesh(new T.RingGeometry(5.1,5.22,64),new T.MeshBasicMaterial({color:'#d8bb7b',transparent:true,opacity:.1,side:T.DoubleSide,depthWrite:false}));halo.rotation.x=-Math.PI/2;halo.position.y=-.09;halo.scale.y=.82;scene.add(halo);
    const camera=new T.OrthographicCamera(-8,8,6,-6,.1,80);camera.position.set(12,13,16);camera.lookAt(0,1.1,0);
    await renderer.compileAsync(scene,camera);
    return {scene,island,halo,camera,sun,baseScale:island.scale.x};
  }
  const views:Awaited<ReturnType<typeof createView>>[]=[];for(let index=0;index<4;index++)views.push(await createView(index));
  views[0].island.position.y=.13;
  let active=0,hover=-1,disposed=false,reportedReady=false,frame:number|null=null;
  function render(){
    frame=null;if(disposed)return;
    const width=host.clientWidth,height=host.clientHeight;if(!width||!height)return;
    renderer.setScissorTest(false);renderer.clear();renderer.setScissorTest(true);
    let unsettled=false;
    views.forEach((v,i)=>{
      const lift=i===hover ? .38 : i===active ? .13 : 0,rotation=i===hover?-.12:0,scale=v.baseScale*(i===hover?1.045:1);
      const delta=Math.abs(v.island.position.y-lift)+Math.abs(v.island.rotation.y-rotation)+Math.abs(v.island.scale.x-scale);
      if(delta>.002)unsettled=true;
      v.island.position.y=T.MathUtils.lerp(v.island.position.y,lift,reduced?1:.16);
      v.island.rotation.y=T.MathUtils.lerp(v.island.rotation.y,rotation,reduced?1:.16);
      v.island.scale.setScalar(T.MathUtils.lerp(v.island.scale.x,scale,reduced?1:.16));
      (v.halo.material as T.MeshBasicMaterial).opacity=i===active ? .7 : i===hover ? .35 : .08;
      const left=Math.round(i*width/4),right=Math.round((i+1)*width/4),aspect=(right-left)/height;
      const viewHeight=Math.max(9.8,11.2/aspect);v.camera.left=-viewHeight*aspect/2;v.camera.right=viewHeight*aspect/2;v.camera.top=viewHeight/2;v.camera.bottom=-viewHeight/2;v.camera.updateProjectionMatrix();
      renderer.setViewport(left,0,right-left,height);renderer.setScissor(left,0,right-left,height);renderer.render(v.scene,v.camera);
    });
    if(!reportedReady){reportedReady=true;host.dataset.ready='true';onReady();}
    if(unsettled&&!reduced)requestRender();
  }
  function requestRender(){if(!disposed&&frame===null)frame=requestAnimationFrame(render);}
  function resize(){if(!host.clientWidth||!host.clientHeight)return;renderer.setSize(host.clientWidth,host.clientHeight);requestRender();}
  const observer=new ResizeObserver(resize);observer.observe(host);resize();
  host.dataset.renderer='webgl';host.dataset.islands='4';
  return {
    highlight(nextActive,nextHover){if(active===nextActive&&hover===nextHover)return;active=nextActive;hover=nextHover;requestRender();},
    dispose(){disposed=true;if(frame!==null)cancelAnimationFrame(frame);observer.disconnect();const geometries=new Set<T.BufferGeometry>(),materials=new Set<T.Material>(),textures=new Set<T.Texture>();views.forEach(v=>{v.scene.traverse(o=>{if(o instanceof T.Mesh){geometries.add(o.geometry);(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{materials.add(m);Object.values(m).forEach(value=>{if(value instanceof T.Texture)textures.add(value);});});}});v.sun.shadow.map?.dispose();});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());renderer.dispose();renderer.domElement.remove();},
  };
}
