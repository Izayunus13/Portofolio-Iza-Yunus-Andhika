import * as T from 'three';

export function createCloudBirds(host:HTMLDivElement){
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.25));renderer.setClearColor(0,0);
  renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.03;
  renderer.domElement.setAttribute('aria-hidden','true');host.appendChild(renderer.domElement);
  const scene=new T.Scene(),camera=new T.OrthographicCamera(-12,12,7,-7,.1,100);
  camera.position.set(0,10,18);camera.lookAt(0,0,0);
  scene.add(new T.HemisphereLight('#fff9e9','#72948e',1.35));
  const sun=new T.DirectionalLight('#fff3da',1.9);sun.position.set(-7,12,9);scene.add(sun);
  const feather=new T.MeshStandardMaterial({color:'#e5e9df',roughness:.9,side:T.DoubleSide});
  const tip=new T.MeshStandardMaterial({color:'#647771',roughness:.85,side:T.DoubleSide});
  const beak=new T.MeshStandardMaterial({color:'#d8b578',roughness:.7});
  const eye=new T.MeshStandardMaterial({color:'#263f42',roughness:.55});
  const bodyGeometry=new T.SphereGeometry(1,20,12),headGeometry=new T.SphereGeometry(.22,16,10),eyeGeometry=new T.SphereGeometry(.022,8,6);
  const beakGeometry=new T.ConeGeometry(.065,.3,8).rotateZ(-Math.PI/2);
  const wingShape=new T.Shape();wingShape.moveTo(.22,0);wingShape.bezierCurveTo(.42,.6,.22,1.28,-.22,1.82);wingShape.lineTo(-.42,2.12);wingShape.quadraticCurveTo(-.36,1.7,-.49,1.56);wingShape.lineTo(-.58,1.82);wingShape.lineTo(-.62,1.43);wingShape.lineTo(-.73,1.6);wingShape.lineTo(-.75,1.23);wingShape.bezierCurveTo(-.86,.79,-.55,.34,-.46,0);wingShape.closePath();
  const wingGeometry=new T.ExtrudeGeometry(wingShape,{depth:.055,bevelEnabled:true,bevelSize:.035,bevelThickness:.025,bevelSegments:2,curveSegments:12}).rotateX(Math.PI/2);
  const wingColors=new Float32Array(wingGeometry.attributes.position.count*3),wingBase=new T.Color('#f4f1df'),wingTip=new T.Color('#71867f');
  for(let i=0;i<wingGeometry.attributes.position.count;i++){
    const color=wingBase.clone().lerp(wingTip,T.MathUtils.smoothstep(wingGeometry.attributes.position.getZ(i),1.35,2.1)*.85);
    color.toArray(wingColors,i*3);
  }
  wingGeometry.setAttribute('color',new T.BufferAttribute(wingColors,3));
  const wingMaterial=new T.MeshStandardMaterial({vertexColors:true,roughness:.95,side:T.DoubleSide});
  const tailShape=new T.Shape();tailShape.moveTo(0,-.14);tailShape.lineTo(-.72,-.34);tailShape.lineTo(-.48,0);tailShape.lineTo(-.72,.34);tailShape.lineTo(0,.14);tailShape.closePath();
  const tailGeometry=new T.ExtrudeGeometry(tailShape,{depth:.045,bevelEnabled:false}).rotateX(Math.PI/2);
  function mesh(parent:T.Object3D,geometry:T.BufferGeometry,material:T.Material,position:[number,number,number]){const object=new T.Mesh(geometry,material);object.position.set(...position);parent.add(object);return object;}
  const birds=Array.from({length:3},(_,index)=>{
    const root=new T.Group();root.name='intro-seagull-'+index;scene.add(root);
    mesh(root,bodyGeometry,feather,[0,0,0]).scale.set(.65,.23,.25);
    mesh(root,headGeometry,feather,[.56,.12,0]);mesh(root,beakGeometry,beak,[.82,.105,0]);
    for(const side of [-1,1])mesh(root,eyeGeometry,eye,[.65,.185,side*.17]);
    mesh(root,tailGeometry,feather,[-.48,.03,0]);
    const wings=[-1,1].map(side=>{const joint=new T.Group();joint.position.set(0,.06,side*.12);root.add(joint);const wing=mesh(joint,wingGeometry,wingMaterial,[0,0,0]);wing.scale.z=side;const darkTip=mesh(joint,bodyGeometry,tip,[-.32,-.015,side*1.65]);darkTip.scale.set(.13,.035,.33);return {joint,side};});
    root.scale.setScalar([.58,.36,.46][index]);return {root,wings};
  });
  let frame=0,disposed=false,time=0,previous=0,serial=0;
  function resize(){if(!host.clientWidth||!host.clientHeight)return;renderer.setSize(host.clientWidth,host.clientHeight);const aspect=host.clientWidth/host.clientHeight;camera.left=-7*aspect;camera.right=7*aspect;camera.top=7;camera.bottom=-7;camera.updateProjectionMatrix();}
  const observer=new ResizeObserver(resize);observer.observe(host);resize();
  function draw(now:number){
    if(disposed)return;const dt=previous?Math.min(.06,(now-previous)/1000):1/60;previous=now;time+=dt;
    const extent=7*host.clientWidth/Math.max(1,host.clientHeight)+3;
    birds.forEach(({root,wings},index)=>{
      const forward=index!==1,phase=(time/[11.5,15,13.4][index]+[.22,.61,.83][index])%1;
      root.position.set(T.MathUtils.lerp(forward?-extent:extent,forward?extent:-extent,phase),[3.8,-3.1,1.25][index]+Math.sin(time*.65+index)*.35,[-.3,-3,-1.5][index]);
      root.rotation.set(Math.sin(time*.7+index)*.065,forward?-.16:Math.PI+.14,Math.sin(time*.5+index)*.11);
      wings.forEach(({joint,side})=>{joint.rotation.x=side*(.16+(reduced?0:Math.sin(time*4.4+index*1.9)*.58));});
    });
    renderer.render(scene,camera);
    if(serial++%4===0){host.dataset.wingAngle=birds[0].wings[0].joint.rotation.x.toFixed(4);host.dataset.birdX=birds[0].root.position.x.toFixed(3);}
    if(!reduced)frame=requestAnimationFrame(draw);
  }
  host.dataset.renderer='webgl';host.dataset.birds='3';frame=requestAnimationFrame(draw);
  return {renderAtlas(){
    // This renderer is used only by the asset preparation script, never by the loading UI.
    cancelAnimationFrame(frame);observer.disconnect();renderer.setPixelRatio(1);renderer.setSize(128,128);
    camera.left=-2.55;camera.right=2.55;camera.top=2.55;camera.bottom=-2.55;camera.updateProjectionMatrix();
    birds.forEach(({root},index)=>{root.visible=index===0;});
    const bird=birds[0];bird.root.position.set(0,0,0);bird.root.rotation.set(0,-.16,0);bird.root.scale.setScalar(1);
    const atlas=document.createElement('canvas');atlas.width=128*32;atlas.height=128;const context=atlas.getContext('2d')!;
    for(let index=0;index<32;index++){
      bird.wings.forEach(({joint,side})=>{joint.rotation.x=side*(.16+Math.sin(index/32*Math.PI*2)*.58);});
      renderer.render(scene,camera);context.drawImage(renderer.domElement,index*128,0);
    }
    return atlas.toDataURL('image/webp',.86);
  },dispose(){disposed=true;cancelAnimationFrame(frame);observer.disconnect();const geometries=new Set<T.BufferGeometry>(),materials=new Set<T.Material>();scene.traverse(object=>{if(object instanceof T.Mesh){geometries.add(object.geometry);(Array.isArray(object.material)?object.material:[object.material]).forEach(material=>materials.add(material));}});geometries.forEach(geometry=>geometry.dispose());materials.forEach(material=>material.dispose());renderer.dispose();renderer.domElement.remove();}};
}
