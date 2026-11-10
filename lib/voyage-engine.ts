import * as T from 'three';
import { createPirateShip } from './pirate-ship';
import { createIsland, createHomeReef, ports } from './voyage-islands';
import { createKit, type V3 } from './three-kit';

export type VoyageCallbacks = { onReady: () => void; onArrive: (index:number) => void; onProgress: (progress:number) => void; onShip: () => void; onPort: (index:number) => void; onError: () => void };
export type VoyageEngine = { moveTo: (index:number) => void; dispose: () => void };
export function createVoyageEngine(host:HTMLDivElement,callbacks:VoyageCallbacks):VoyageEngine {
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile=()=>host.clientWidth<700;
  const scene=new T.Scene();scene.fog=new T.FogExp2('#a1ceca',.009);
  const renderer=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
  renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
  renderer.setClearColor('#99c9c4',0);renderer.domElement.setAttribute('aria-label','Isometric 3D pirate ship and creative islands');renderer.domElement.setAttribute('role','img');host.appendChild(renderer.domElement);
  host.dataset.renderer='webgl';
  const camera=new T.OrthographicCamera(-15,15,10,-10,.1,220);const cameraFocus=new T.Vector3(-2.4,.6,2);
  const ambient=new T.HemisphereLight('#fff9e7','#62908f',1.65);scene.add(ambient);
  const sun=new T.DirectionalLight('#fff2d4',2.8);sun.position.set(-13,25,18);sun.castShadow=true;
  sun.shadow.mapSize.set(mobile()?1024:2048,mobile()?1024:2048);sun.shadow.camera.left=-19;sun.shadow.camera.right=19;sun.shadow.camera.top=19;sun.shadow.camera.bottom=-19;sun.shadow.camera.near=.5;sun.shadow.camera.far=85;sun.shadow.bias=-.0004;sun.shadow.normalBias=.025;sun.shadow.radius=3;
  scene.add(sun,sun.target);
  const fill=new T.DirectionalLight('#c4e6e9',1);fill.position.set(10,9,-15);scene.add(fill);
  const k=createKit();
  const seaMaterial=new T.MeshStandardMaterial({color:'#75b3b1',roughness:.52,metalness:.13});
  const sea=k.mesh(scene,new T.PlaneGeometry(240,180,1,1),seaMaterial,[25,-.075,-15],[-Math.PI/2,0,0]);sea.castShadow=false;
  const {ship,flag}=createPirateShip();scene.add(ship);ship.rotation.y=.13;
  const islands=ports.slice(1).map((port,i)=>{const island=createIsland(i+1);island.position.set(...port.island);scene.add(island);return island;});
  const reef=createHomeReef();reef.position.set(-1.8,0,-10.2);reef.scale.setScalar(.75);scene.add(reef);
  const curves=ports.slice(0,-1).map((port,i)=>{
    const a=new T.Vector3(...port.position),b=new T.Vector3(...ports[i+1].position);
    return new T.CatmullRomCurve3([a,new T.Vector3(a.x+3.2,0,a.z-.6),new T.Vector3(b.x-3.4,0,b.z+3.1),b],false,'catmullrom',.5);
  });
  // Every visible dot and the ship use the same curve, so they cannot drift apart.
  const dotMat=new T.MeshStandardMaterial({color:'#f6ebc9',roughness:.8,transparent:true,opacity:.85});
  const dotGeo=new T.SphereGeometry(.055,7,5);
  curves.forEach(curve=>curve.getSpacedPoints(42).forEach(p=>{const dot=new T.Mesh(dotGeo,dotMat);dot.position.copy(p);dot.position.y=.035;dot.scale.y=.5;scene.add(dot);}));
  // Little wave highlights are 3D curves on the water, not a flat background image.
  const waves:T.Mesh[]=[];const waveMat=new T.MeshBasicMaterial({color:'#d6ebe0',transparent:true,opacity:.34,depthWrite:false});
  for(let i=0;i<105;i++){
    const x=-15+(i*7.31)%88,z=-45+(i*11.73)%68;
    const wave=k.mesh(scene,new T.TubeGeometry(new T.CatmullRomCurve3([new T.Vector3(-.35,0,0),new T.Vector3(0,0,.1),new T.Vector3(.4,0,0)]),8,.016,4,false),waveMat,[x,.015,z]);wave.castShadow=false;wave.receiveShadow=false;waves.push(wave);
  }
  // Foam wake and contact shadow travel with the ship.
  const wake=new T.Group();scene.add(wake);const foamMat=new T.MeshBasicMaterial({color:'#f2f8e9',transparent:true,opacity:.7,depthWrite:false});
  for(const sign of [-1,1]){
    const wakeCurve=new T.CatmullRomCurve3([new T.Vector3(3.1,.025,sign*.9),new T.Vector3(.9,.035,sign*1.7),new T.Vector3(-2,.025,sign*1.9),new T.Vector3(-4.6,.02,sign*1.45)]);
    const m=k.mesh(wake,new T.TubeGeometry(wakeCurve,30,.035,5,false),foamMat);m.castShadow=false;m.receiveShadow=false;
    for(let j=0;j<7;j++){const m=k.sphere(wake,.07,[-3.1-j*.3,.015,sign*(1.25+j*.06)],'#e8f3df',[1.8,.25,1]);m.castShadow=false;}
  }
  const rings:T.Mesh[]=[];
  for(const port of ports.slice(1)){
    const m=k.mesh(scene,new T.RingGeometry(5.1,5.13,64),new T.MeshBasicMaterial({color:'#d8efe0',transparent:true,opacity:.22,side:T.DoubleSide,depthWrite:false}),[port.island[0],.018,port.island[2]],[-Math.PI/2,0,0]);m.scale.y=.82;m.castShadow=false;rings.push(m);
  }
  // A few warm buoys and low-poly fish mark the creative sea.
  for(let i=0;i<8;i++){
    const x=3+i*6.2,z=-6-i*3.2;const fish=new T.Group();fish.position.set(x,-.02,z);fish.rotation.y=i*.6;scene.add(fish);
    k.sphere(fish,.24,[0,0,0],i%2?'#d9ae87':'#b4cba6',[1.6,.3,.7]);k.mesh(fish,new T.ConeGeometry(.16,.3,3),'#c7977d',[-.42,0,0],[0,0,Math.PI/2]);
  }
  // Distant gulls have sculpted wings.
  const gulls:T.Group[]=[];
  for(let i=0;i<6;i++){const g=new T.Group();g.position.set(3+i*8,5.6+(i%3),-9-i*5);g.rotation.y=i*.8;scene.add(g);for(const sign of [-1,1])k.rope(g,[[0,0,0],[sign*.22,.12,0],[sign*.43,.08,.05]],'#f6f2dc',.022);gulls.push(g);}
  let route=0,active=0,frame=0,lastUI=0,disposed=false;
  let travel:{from:number;to:number;start:number;duration:number}|null=null;
  const pointer=new T.Vector2(),raycaster=new T.Raycaster();let pointerDown:V3|null=null;
  function hit(event:PointerEvent){const r=renderer.domElement.getBoundingClientRect();pointer.set((event.clientX-r.left)/r.width*2-1,-(event.clientY-r.top)/r.height*2+1);raycaster.setFromCamera(pointer,camera);const s=raycaster.intersectObject(ship,true);if(s.length)return {ship:true,port:0};const hits=raycaster.intersectObjects(islands,true);if(hits.length)return {ship:false,port:Number(hits[0].object.userData.port)};return null;}
  function down(e:PointerEvent){pointerDown=[e.clientX,e.clientY,0];}
  function click(e:PointerEvent){if(!pointerDown||Math.hypot(e.clientX-pointerDown[0],e.clientY-pointerDown[1])>8)return;const h=hit(e);if(h?.ship)callbacks.onShip();else if(h)callbacks.onPort(h.port);pointerDown=null;}
  function move(e:PointerEvent){renderer.domElement.style.cursor=hit(e)?'pointer':'default';}
  renderer.domElement.addEventListener('pointerdown',down);renderer.domElement.addEventListener('pointerup',click);renderer.domElement.addEventListener('pointermove',move);
  function resize(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h);const size=mobile()?20.5:17.8;camera.left=-size*w/h/2;camera.right=size*w/h/2;camera.top=size/2;camera.bottom=-size/2;camera.updateProjectionMatrix();}
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);resize();
  const position=new T.Vector3(),tangent=new T.Vector3(),desiredFocus=new T.Vector3(),offset=new T.Vector3(21,23,27);
  function animate(now:number){
    if(disposed)return;const time=now*.001;
    if(travel){const t=Math.min(1,(now-travel.start)/travel.duration);const ease=t*t*(3-2*t);route=T.MathUtils.lerp(travel.from,travel.to,ease);if(now-lastUI>70){callbacks.onProgress(t);lastUI=now;}if(t>=1){active=travel.to;travel=null;callbacks.onProgress(1);callbacks.onArrive(active);}}
    const segment=Math.min(curves.length-1,Math.floor(route)),fraction=route>=3?1:route-segment;
    curves[segment].getPointAt(fraction,position);curves[segment].getTangentAt(fraction,tangent);
    ship.position.copy(position);ship.position.y=reduced ? .08 : .08+Math.sin(time*1.5)*.045;
    const desiredAngle=-Math.atan2(tangent.z,tangent.x)+(travel&&travel.to<travel.from?Math.PI:0);
    const delta=T.MathUtils.euclideanModulo(desiredAngle-ship.rotation.y+Math.PI,Math.PI*2)-Math.PI;ship.rotation.y+=delta*.055;
    ship.rotation.z=reduced?0:Math.sin(time*1.3)*.012;ship.rotation.x=reduced?0:Math.cos(time*1.1)*.018;
    wake.position.copy(position);wake.rotation.y=ship.rotation.y;foamMat.opacity=travel ? .85 : .48;
    if(!reduced){const p=flag.geometry.attributes.position;const base=flag.userData.base as Float32Array;for(let i=0;i<p.count;i++){const x=base[i*3];p.setZ(i,Math.sin(x*5-time*4)*.09+Math.sin(x*2-time*2)*.04);}p.needsUpdate=true;flag.geometry.computeVertexNormals();waves.forEach((w,i)=>{w.position.y=.012+Math.sin(time*.7+i)*.006;});gulls.forEach((g,i)=>{g.position.y=5.8+i%3+Math.sin(time+i)*.2;});}
    // Camera translation preserves the isometric angle throughout the voyage.
    desiredFocus.copy(position);
    if(!travel&&active>0)desiredFocus.lerp(new T.Vector3(...ports[active].island),.32);
    if(mobile())desiredFocus.add(new T.Vector3(-.4,3.3,.4));else desiredFocus.add(new T.Vector3(-3.4,.8,2.9));
    cameraFocus.lerp(desiredFocus,reduced?1:.045);camera.position.copy(cameraFocus).add(offset);camera.lookAt(cameraFocus);
    sun.position.copy(position).add(new T.Vector3(-13,25,18));sun.target.position.copy(position);sun.target.updateMatrixWorld();
    if(frame%6===0){host.dataset.shipX=position.x.toFixed(3);host.dataset.shipZ=position.z.toFixed(3);host.dataset.route=route.toFixed(4);host.dataset.destination=String(travel?.to??active);}
    renderer.render(scene,camera);if(frame%6===0){const pick=new T.Vector3(0,2,0).applyMatrix4(ship.matrixWorld).project(camera);host.dataset.shipScreenX=((pick.x*.5+.5)*host.clientWidth).toFixed(1);host.dataset.shipScreenY=((-pick.y*.5+.5)*host.clientHeight+host.getBoundingClientRect().top).toFixed(1);}frame++;requestAnimationFrame(animate);
  }
  const raf=requestAnimationFrame(animate);host.dataset.ready='true';callbacks.onReady();
  const handleLost=(e:Event)=>{e.preventDefault();callbacks.onError();};renderer.domElement.addEventListener('webglcontextlost',handleLost);
  return {
    moveTo(index:number){if(index<0||index>3||index===active&&!travel)return;travel={from:route,to:index,start:performance.now(),duration:reduced?60:Math.max(3600,Math.abs(index-route)*4400)};callbacks.onProgress(0);},
    dispose(){disposed=true;cancelAnimationFrame(raf);resizeObserver.disconnect();renderer.domElement.removeEventListener('pointerdown',down);renderer.domElement.removeEventListener('pointerup',click);renderer.domElement.removeEventListener('pointermove',move);renderer.domElement.removeEventListener('webglcontextlost',handleLost);const geometries=new Set<T.BufferGeometry>(),materials=new Set<T.Material>(),textures=new Set<T.Texture>();scene.traverse(o=>{if(o instanceof T.Mesh){geometries.add(o.geometry);const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>{materials.add(m);Object.values(m).forEach(v=>{if(v instanceof T.Texture)textures.add(v);});});}});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());sun.shadow.map?.dispose();renderer.dispose();renderer.domElement.remove();},
  };
}
