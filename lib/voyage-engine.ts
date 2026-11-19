import * as T from 'three';
import { createPirateShip } from './pirate-ship';
import { createIsland, createHomeReef, ports } from './voyage-islands';
import { createKit, type V3 } from './three-kit';
import { createVoyageRoutes } from './voyage-routes';
import { createShipWake, createVoyageWater, waterHeight } from './voyage-water';
import { angleDifference, createVoyagePath, sailingDuration, sailingEase, stepSpring, type Spring } from './voyage-motion';
import { batchStaticDetails } from './voyage-render';
import { createCertificateIsland, loadCertificateTextures, certificateIslandOffset } from './certificate-islands';
import { certificateCollections } from './certificates';

export type VoyageCallbacks = { onReady: () => void; onArrive: (index:number) => void; onDistance: (remainingKm:number) => void; onShipPosition?: (x:number,y:number) => void; onShip: () => void; onPort: (index:number) => void; onCertificate?: (port:number,index:number) => void; onError: () => void };
export type VoyageEngine = { moveTo: (index:number) => void; setSuspended: (suspended:boolean) => void; dispose: () => void };
const yieldDuringLoading=()=>new Promise<void>(resolve=>setTimeout(resolve,0));
export async function createVoyageEngine(host:HTMLDivElement,callbacks:VoyageCallbacks):Promise<VoyageEngine> {
  // Give the compositor time to present the intro between geometry preparation tasks.
  await yieldDuringLoading();
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
  await yieldDuringLoading();
  const k=createKit();
  const water=createVoyageWater(scene);host.dataset.waterColor='#'+water.color;
  const {ship,flag,animation:shipAnimation,flagAnimation}=createPirateShip();scene.add(ship);
  await yieldDuringLoading();
  const islands:T.Group[]=[];
  for(let i=1;i<ports.length;i++){
    const island=createIsland(i);island.position.set(...ports[i].island);scene.add(island);islands.push(island);
    batchStaticDetails(island);await yieldDuringLoading();
  }
  const certificateTextures=await loadCertificateTextures();
  const certificateIslands=certificateCollections.map(collection=>{
    const island=createCertificateIsland(collection.port,certificateTextures);
    const center=ports[collection.port].island;
    island.root.position.set(center[0]+certificateIslandOffset[0],center[1],center[2]+certificateIslandOffset[2]);
    scene.add(island.root);
    return Object.assign(island,{port:collection.port});
  });
  host.dataset.certificateIslands=String(certificateIslands.length);
  let beveledTitleCount=0;scene.traverse(object=>{if(object instanceof T.Mesh&&object.name==='beveled-water-title'&&(object.geometry as T.ExtrudeGeometry).parameters.options.bevelEnabled&&object.castShadow)beveledTitleCount++;});host.dataset.beveledTitles=String(beveledTitleCount);
  const reef=createHomeReef();reef.position.set(-1.8,0,-10.2);reef.scale.setScalar(.75);scene.add(reef);
  batchStaticDetails(ship,new Set([flag,...shipAnimation.dynamicRoots]));await yieldDuringLoading();batchStaticDetails(reef);
  const curves=createVoyageRoutes();
  const path=createVoyagePath(curves);
  // Every visible dot and the ship use the same curve, so they cannot drift apart.
  const dotMat=new T.MeshStandardMaterial({color:'#f6ebc9',roughness:.8,transparent:true,opacity:.65});
  const dotGeo=new T.SphereGeometry(.055,7,5);
  const dotPositions=curves.flatMap(curve=>curve.getSpacedPoints(Math.ceil(curve.getLength()/.48)).slice(1));
  const routeDots=new T.InstancedMesh(dotGeo,dotMat,dotPositions.length);scene.add(routeDots);
  routeDots.instanceMatrix.setUsage(T.DynamicDrawUsage);routeDots.frustumCulled=false;
  const instance=new T.Object3D();instance.scale.set(1,.5,1);
  // Little wave highlights are 3D curves on the water, not a flat background image.
  const waveMat=new T.MeshBasicMaterial({color:'#d6ebe0',transparent:true,opacity:.34,depthWrite:false});
  const waveGeometry=new T.TubeGeometry(new T.CatmullRomCurve3([new T.Vector3(-.35,0,0),new T.Vector3(0,0,.1),new T.Vector3(.4,0,0)]),8,.016,4,false);
  const waves=new T.InstancedMesh(waveGeometry,waveMat,105);scene.add(waves);
  for(let i=0;i<105;i++){
    const x=-15+(i*7.31)%88,z=-45+(i*11.73)%68;
    instance.position.set(x,.015,z);instance.scale.set(1,1,1);instance.updateMatrix();waves.setMatrixAt(i,instance.matrix);
  }
  const wake=createShipWake(scene);
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
  let route=0,distance=0,active=0,frame=0,raf=0,disposed=false,suspended=false,reportedReady=false,sailingDirection=1;
  let travel:{from:number;to:number;fromDistance:number;toDistance:number;elapsed:number;duration:number;turnFrom:number;turnDelta:number;turnDuration:number}|null=null;
  const pointer=new T.Vector2(),raycaster=new T.Raycaster();let pointerDown:V3|null=null;
  function hit(event:PointerEvent){const r=renderer.domElement.getBoundingClientRect();pointer.set((event.clientX-r.left)/r.width*2-1,-(event.clientY-r.top)/r.height*2+1);raycaster.setFromCamera(pointer,camera);const s=raycaster.intersectObject(ship,true);if(s.length)return {ship:true,port:0};const certificates=raycaster.intersectObjects(certificateIslands.map(island=>island.root),true);
    const hits=raycaster.intersectObjects(islands,true);
    if(certificates.length&&(!hits.length||certificates[0].distance<hits[0].distance))return {ship:false,port:Number(certificates[0].object.userData.certificatePort),certificate:true};if(hits.length)return {ship:false,port:Number(hits[0].object.userData.port)};return null;}
  function down(e:PointerEvent){pointerDown=[e.clientX,e.clientY,0];}
  function click(e:PointerEvent){if(!pointerDown||Math.hypot(e.clientX-pointerDown[0],e.clientY-pointerDown[1])>8)return;const h=hit(e);if(!travel&&!suspended){if(h?.ship)callbacks.onShip();else if(h&&'certificate' in h){const island=certificateIslands.find(island=>island.port===h.port)!;callbacks.onCertificate?.(h.port,island.selected);}else if(h)callbacks.onPort(h.port);}pointerDown=null;}
  let pendingPointer:PointerEvent|null=null;
  function move(e:PointerEvent){pendingPointer=e;}
  renderer.domElement.addEventListener('pointerdown',down);renderer.domElement.addEventListener('pointerup',click);renderer.domElement.addEventListener('pointermove',move);
  function resize(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h);const size=mobile()?20.5:17.8;camera.left=-size*w/h/2;camera.right=size*w/h/2;camera.top=size/2;camera.bottom=-size/2;camera.updateProjectionMatrix();}
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);resize();
  const labelAnchor=new T.Vector3();
  const position=new T.Vector3(),tangent=new T.Vector3(),lookAhead=new T.Vector3(),desiredFocus=new T.Vector3(),offset=new T.Vector3(21,23,27);
  path.sample(0,position,tangent);
  const previousFlagPosition=position.clone();
  const homeHeading=-Math.atan2(tangent.z,tangent.x);
  const heading:Spring={value:homeHeading,velocity:0};ship.rotation.y=heading.value;
  const focusSprings=[cameraFocus.x,cameraFocus.y,cameraFocus.z].map(value=>({value,velocity:0}));
  const zoom:Spring={value:mobile()?20.5:17.8,velocity:0};
  const heave:Spring={value:waterHeight(0,0,0)-.2,velocity:0};
  const roll:Spring={value:0,velocity:0},pitch:Spring={value:0,velocity:0};
  let previousTime=0,time=0,previousDistance=0,previousHeading=heading.value;
  function animate(now:number){
    raf=0;if(disposed||suspended)return;let arrived=false;const dt=previousTime?Math.min(.05,Math.max(.001,(now-previousTime)*.001)):1/60;previousTime=now;time+=dt;
    const seaTime=reduced?0:time;water.update(seaTime);certificateIslands.forEach(island=>island.update(seaTime));
    if(travel){travel.elapsed+=dt*1000;const t=T.MathUtils.clamp((travel.elapsed-travel.turnDuration)/travel.duration,0,1);distance=T.MathUtils.lerp(travel.fromDistance,travel.toDistance,sailingEase(t));route=path.routeAtDistance(distance);callbacks.onDistance(Math.abs(travel.toDistance-distance));if(t>=1){active=travel.to;route=active;distance=travel.toDistance;travel=null;arrived=true;renderer.domElement.style.cursor='var(--voyage-cursor, default)';callbacks.onDistance(0);callbacks.onArrive(active);}}
    path.sample(distance,position,tangent);
    ship.position.copy(position);
    const surface=waterHeight(position.x,position.z,seaTime)-.20+(reduced?0:Math.sin(time*1.3)*.018);
    ship.position.y=reduced?surface:stepSpring(heave,surface,.48,dt);
    if(travel&&travel.elapsed<travel.turnDuration){const target=travel.turnFrom+travel.turnDelta*T.MathUtils.smootherstep(travel.elapsed,0,travel.turnDuration);stepSpring(heading,target,.24,dt);}
    else if(travel){path.sample(distance+sailingDirection*.8,lookAhead,tangent);const desiredAngle=-Math.atan2(tangent.z*sailingDirection,tangent.x*sailingDirection);const target=heading.value+angleDifference(desiredAngle,heading.value);if(reduced){heading.value=target;heading.velocity=0;}else stepSpring(heading,target,.34,dt);}
    else if(active===0){
      // After docking at home, face the original welcoming direction without moving the hull.
      const target=heading.value+angleDifference(homeHeading,heading.value);
      if(reduced){heading.value=target;heading.velocity=0;}
      else stepSpring(heading,target,.7,dt);
    }
    ship.rotation.y=heading.value;
    const turnBank=T.MathUtils.clamp((heading.value-previousHeading)/dt*.018,-.016,.016);
    ship.rotation.z=reduced?0:stepSpring(pitch,Math.sin(time*1.15)*.009,.55,dt);
    ship.rotation.x=reduced?0:stepSpring(roll,Math.cos(time*.95)*.013-turnBank,.48,dt);
    const detailState=shipAnimation.update(dt,seaTime,{speed:Math.abs(distance-previousDistance)/dt,turnRate:(heading.value-previousHeading)/dt,roll:ship.rotation.x,pitch:ship.rotation.z,sailing:!!travel,reduced});
    const flagState=flagAnimation.update(dt,seaTime,{velocityX:(position.x-previousFlagPosition.x)/dt,velocityZ:(position.z-previousFlagPosition.z)/dt,heading:heading.value,reduced});
    previousFlagPosition.copy(position);
    previousDistance=distance;previousHeading=heading.value;
    if(frame%6===0||arrived){host.dataset.flagSpeed=flagState.speed.toFixed(3);host.dataset.flagOpen=flagState.openness.toFixed(4);host.dataset.flagReach=flagState.reach.toFixed(4);host.dataset.flagDrop=flagState.tipDrop.toFixed(4);host.dataset.flagAft=flagState.aftAlignment.toFixed(5);host.dataset.flagTipWave=flagState.tipWave.toFixed(5);host.dataset.flagHoistError=flagState.hoistError.toFixed(6);}
    if(frame%6===0||arrived){host.dataset.captainWaving=String(detailState.waveBlend>.05);host.dataset.captainWaveStarts=String(detailState.waveStarts);host.dataset.captainHand=detailState.handAngle.toFixed(5);host.dataset.anchorX=detailState.anchorX.toFixed(5);host.dataset.anchorZ=detailState.anchorZ.toFixed(5);}
    const wakeState=wake.update(position,ship.rotation.y,seaTime,dt,reduced);
    instance.scale.set(1,.5,1);dotPositions.forEach((dot,i)=>{instance.position.set(dot.x,waterHeight(dot.x,dot.z,seaTime)+.04,dot.z);instance.updateMatrix();routeDots.setMatrixAt(i,instance.matrix);});routeDots.instanceMatrix.needsUpdate=true;
    if(!reduced)gulls.forEach((g,i)=>{g.position.y=5.8+i%3+Math.sin(time+i)*.2;});
    // Camera translation preserves the isometric angle throughout the voyage.
    desiredFocus.copy(position);
    let harbourBlend=active>0?.52:0;
    if(travel){const departing=travel.from>0?1-T.MathUtils.smootherstep(Math.abs(distance-travel.fromDistance),0,8):0;const arriving=travel.to>0?1-T.MathUtils.smootherstep(Math.abs(travel.toDistance-distance),0,8):0;harbourBlend=Math.max(departing,arriving)*.52;}
    desiredFocus.x-=8.5*harbourBlend;desiredFocus.z-=15*harbourBlend;
    if(mobile())desiredFocus.add(new T.Vector3(-.4+1.6*harbourBlend/.52,3.3-1.9*harbourBlend/.52,.4));else desiredFocus.add(new T.Vector3(-3.4,.8,2.9));
    // Pull back near a destination so the safe water gap and island name fit on screen.
    const islandView=T.MathUtils.smoothstep(route,0,.8);
    const targetSize=T.MathUtils.lerp(mobile()?20.5:17.8,mobile()?32:25,islandView);
    const viewSize=reduced?targetSize:stepSpring(zoom,targetSize,.62,dt);if(reduced){zoom.value=targetSize;zoom.velocity=0;}
    const aspect=host.clientWidth/Math.max(1,host.clientHeight);
    camera.left=-viewSize*aspect/2;camera.right=viewSize*aspect/2;camera.top=viewSize/2;camera.bottom=-viewSize/2;camera.updateProjectionMatrix();
    for(let axis=0;axis<3;axis++){const state=focusSprings[axis],target=desiredFocus.getComponent(axis);if(reduced){state.value=target;state.velocity=0;}else stepSpring(state,target,.44,dt);cameraFocus.setComponent(axis,state.value);}camera.position.copy(cameraFocus).add(offset);camera.lookAt(cameraFocus);
    sun.position.copy(position).add(new T.Vector3(-13,25,18));sun.target.position.copy(position);sun.target.updateMatrixWorld();
    if(frame%6===0||arrived){host.dataset.shipX=position.x.toFixed(3);host.dataset.shipZ=position.z.toFixed(3);host.dataset.route=route.toFixed(4);host.dataset.destination=String(travel?.to??active);host.dataset.wakeStrength=wakeState.strength.toFixed(3);host.dataset.wakeParticles=String(wakeState.particles);host.dataset.wakeSamples=String(wakeState.samples);}
    if(pendingPointer){renderer.domElement.style.cursor=travel?'var(--voyage-cursor-busy, default)':hit(pendingPointer)?'var(--voyage-cursor-active, pointer)':'var(--voyage-cursor, default)';pendingPointer=null;}
    renderer.render(scene,camera);
    for(const island of certificateIslands){
      if(frame%6===0||arrived){
        const pick=island.pickAnchor.clone().applyMatrix4(island.root.matrixWorld).project(camera);
        host.setAttribute('data-certificate-'+island.port+'-x',((pick.x*.5+.5)*host.clientWidth).toFixed(1));
        host.setAttribute('data-certificate-'+island.port+'-y',((-pick.y*.5+.5)*host.clientHeight).toFixed(1));
        host.setAttribute('data-certificate-'+island.port+'-slide',String(island.selected));
      }
    }
    if(!reportedReady){reportedReady=true;host.dataset.ready='true';callbacks.onReady();}
    // Project the point above the masts through the same camera as the ship.
    labelAnchor.set(-1,7.6,0).applyMatrix4(ship.matrixWorld).project(camera);
    callbacks.onShipPosition?.((labelAnchor.x*.5+.5)*host.clientWidth+host.offsetLeft,(-labelAnchor.y*.5+.5)*host.clientHeight+host.offsetTop);
    if(frame%6===0||arrived){host.dataset.shipHeading=heading.value.toFixed(5);host.dataset.drawCalls=String(renderer.info.render.calls);const pick=new T.Vector3(0,2,0).applyMatrix4(ship.matrixWorld).project(camera);host.dataset.shipScreenX=((pick.x*.5+.5)*host.clientWidth).toFixed(1);host.dataset.shipScreenY=((-pick.y*.5+.5)*host.clientHeight+host.getBoundingClientRect().top).toFixed(1);}frame++;raf=requestAnimationFrame(animate);
  }
  await yieldDuringLoading();
  // Compile shader programs before revealing the page; supported browsers compile them in parallel.
  await renderer.compileAsync(scene,camera);
  raf=requestAnimationFrame(animate);
  const handleLost=(e:Event)=>{e.preventDefault();callbacks.onError();};renderer.domElement.addEventListener('webglcontextlost',handleLost);
  return {
    moveTo(index:number){if(index<0||index>3||index===active&&!travel)return;renderer.domElement.style.cursor='var(--voyage-cursor-busy, default)';const toDistance=path.distanceAtRoute(index);sailingDirection=toDistance>=distance?1:-1;path.sample(distance,lookAhead,tangent);const target=-Math.atan2(tangent.z*sailingDirection,tangent.x*sailingDirection);const turnDelta=angleDifference(target,heading.value);const turnDuration=reduced||Math.abs(turnDelta)<.55?0:Math.max(850,Math.abs(turnDelta)*580);travel={from:route,to:index,fromDistance:distance,toDistance,elapsed:0,duration:reduced?60:sailingDuration(toDistance-distance),turnFrom:heading.value,turnDelta,turnDuration};shipAnimation.startVoyage();callbacks.onDistance(Math.abs(toDistance-distance));},
    setSuspended(value:boolean){
      if(suspended===value)return;suspended=value;
      if(suspended){cancelAnimationFrame(raf);raf=0;previousTime=0;}
      else if(!disposed&&!raf){previousTime=0;raf=requestAnimationFrame(animate);}
    },
    dispose(){disposed=true;cancelAnimationFrame(raf);resizeObserver.disconnect();renderer.domElement.removeEventListener('pointerdown',down);renderer.domElement.removeEventListener('pointerup',click);renderer.domElement.removeEventListener('pointermove',move);renderer.domElement.removeEventListener('webglcontextlost',handleLost);const geometries=new Set<T.BufferGeometry>(),materials=new Set<T.Material>(),textures=new Set<T.Texture>();scene.traverse(o=>{if(o instanceof T.Mesh){geometries.add(o.geometry);const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>{materials.add(m);Object.values(m).forEach(v=>{if(v instanceof T.Texture)textures.add(v);});});}});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());certificateTextures.forEach(t=>textures.add(t));textures.forEach(t=>t.dispose());sun.shadow.map?.dispose();renderer.dispose();renderer.domElement.remove();},
  };
}
