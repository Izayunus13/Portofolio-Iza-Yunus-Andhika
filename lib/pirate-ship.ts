import * as T from 'three';
import { createKit, colors as C, makeFlagTexture, type V3 } from './three-kit';

export function createPirateShip() {
  const ship=new T.Group();ship.name='pirate-ship';
  const k=createKit();
  const outline: [number,number][]=[[-3.25,-1.1],[-2.8,-1.48],[1.65,-1.48],[3.1,-.94],[3.95,0],[3.1,.94],[1.65,1.48],[-2.8,1.48],[-3.25,1.1]];
  const levels=[[.18,.42],[.42,.65],[.72,.82],[1.02,.93],[1.32,1],[1.62,1.03]];
  for(let l=0;l<levels.length-1;l++){
    const vertices:number[]=[];
    for(let i=0;i<outline.length;i++){
      const j=(i+1)%outline.length;const [y0,s0]=levels[l], [y1,s1]=levels[l+1];
      const a=[outline[i][0]*s0,y0,outline[i][1]*s0],b=[outline[j][0]*s0,y0,outline[j][1]*s0],c=[outline[j][0]*s1,y1,outline[j][1]*s1],d=[outline[i][0]*s1,y1,outline[i][1]*s1];
      vertices.push(...a,...c,...b,...a,...d,...c);
    }
    const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geo.computeVertexNormals();
    const m=k.mesh(ship,geo,[C.darkWood,C.wood,'#9d7157','#775543',C.plank][l]);(m.material as T.MeshStandardMaterial).side=T.DoubleSide;
    k.rope(ship,[...outline,outline[0]].map(([x,z])=>[x*levels[l+1][1],levels[l+1][0]-.02,z*levels[l+1][1]] as V3),l===3?C.gold:'#473c36',l===3?.055:.018);
  }
  const deckShape=new T.Shape();outline.forEach(([x,z],i)=>i?deckShape.lineTo(x,-z):deckShape.moveTo(x,-z));deckShape.closePath();
  k.mesh(ship,new T.ExtrudeGeometry(deckShape,{depth:.13,bevelEnabled:true,bevelThickness:.035,bevelSize:.035,bevelSegments:1,steps:1}),C.lightWood,[0,1.62,0],[-Math.PI/2,0,0]);
  for(let z=-1.2;z<=1.2;z+=.24){const end=Math.abs(z)>1?2.4:3.1;k.box(ship,[end+3,.016,.018],[(end-3)/2,1.765,z],'#96704f');}
  for(let x=-2.8;x<2.6;x+=.85) for(let z=-1;z<1.2;z+=.48) k.box(ship,[.018,.015,.24],[x+(z>.1?.2:0),1.77,z],'#98704d');
  // Raised quarterdeck and captain's cabin.
  k.box(ship,[1.8,1.2,2.58],[-2.4,2.28,0],C.wood);
  for(let y=1.9;y<2.9;y+=.22)for(const z of [-1.3,1.3])k.box(ship,[1.85,.045,.035],[-2.4,y,z],C.darkWood);
  k.box(ship,[2.15,.16,2.95],[-2.45,2.98,0],C.lightWood);
  k.box(ship,[2.22,.12,3.03],[-2.45,2.88,0],C.gold);
  for(const z of [-1.5,1.5]){k.rope(ship,[[-3.5,3.35,z],[-2.5,3.4,z],[-1.4,3.35,z]],C.gold,.075);for(let x=-3.4;x<=-1.4;x+=.4)k.cylinder(ship,.045,.38,[x,3.18,z],C.gold);}
  for(const z of [-1.32,1.32])for(const x of [-2.85,-2.08]){k.cylinder(ship,.25,.05,[x,2.36,z],C.ink,[Math.PI/2,0,0]);k.ring(ship,.26,.055,[x,2.36,z*1.015],C.gold);k.box(ship,[.028,.39,.04],[x,2.36,z*1.025],C.gold);}
  k.box(ship,[.07,.85,.6],[-1.47,2.15,0],C.darkWood);k.sphere(ship,.045,[-1.4,2.13,.17],C.gold);
  // Main deck railings.
  for(const z of [-1.47,1.47]){k.rope(ship,[[-1.35,2.2,z],[1.7,2.2,z],[3.1,2.2,z*.64],[3.94,2.2,0]],C.gold,.065);for(let x=-1.2;x<=2.4;x+=.6)k.cylinder(ship,.045,.45,[x,1.98,z*(x>1.7?.83:1)],C.gold);}
  for(const z of [-1.28,1.28])for(let x=-1.1;x<2.8;x+=.78){k.cylinder(ship,.15,.045,[x,1.13,z],C.ink,[Math.PI/2,0,0]);k.ring(ship,.19,.045,[x,1.13,z*1.025],C.gold);}
  // Broadside cannons, with wheels and dark muzzles.
  for(const z of [-1.32,1.32])for(const x of [-.75,.7,2.05]){
    const side=Math.sign(z);k.box(ship,[.58,.22,.57],[x,1.88,z*.82],C.wood);
    k.cylinder(ship,.16,.78,[x,2.06,z+.13*side],'#56616a',[Math.PI/2,0,0],.12);
    k.cylinder(ship,.10,.014,[x,2.06,z+.53*side],'#202e35',[Math.PI/2,0,0]);
    k.ring(ship,.145,.035,[x,2.06,z+.52*side],'#8b969a');
    for(const dx of [-.25,.25])k.cylinder(ship,.16,.10,[x+dx,1.9,z-.22*side],C.darkWood,[Math.PI/2,0,0]);
  }
  // Stern ladder.
  for(const x of [-2.98,-2.42])k.cylinder(ship,.045,2.12,[x,1.97,1.63],'#719c92');
  for(let y=1.08;y<=2.95;y+=.3)k.box(ship,[.64,.065,.075],[-2.7,y,1.65],'#99b5a0');
  // Masts and gold fittings.
  for(const [x,bottom,height] of [[.2,1.75,4.7],[-2.25,3.05,3.5]]){
    k.cylinder(ship,.12,height,[x,bottom+height/2,0],C.wood,[0,0,0],.085);
    for(let y=bottom+.15;y<bottom+height;y+=1.22)k.cylinder(ship,.16,.12,[x,y,0],C.gold);
    k.cylinder(ship,.065,x>0?3.9:2.75,[x,bottom+height-.95,0],C.wood,[Math.PI/2,0,0]);
    k.sphere(ship,.15,[x,bottom+height+.05,0],C.gold);
  }
  // Curved cloth meshes have real volume and receive the rigging shadows.
  const sails:T.Mesh[]=[];
  function sail(x:number,top:number,width:number,height:number){
    const geo=new T.PlaneGeometry(width,height,18,14);const p=geo.attributes.position;
    for(let i=0;i<p.count;i++){const u=(p.getX(i)+width/2)/width,v=(height/2-p.getY(i))/height;p.setXYZ(i,x+.72*Math.sin(u*Math.PI)*Math.sin(v*Math.PI),top-v*height+.18*Math.sin(u*Math.PI)*v,(u-.5)*width);}
    geo.computeVertexNormals();const cloth=new T.MeshStandardMaterial({color:C.ivory,side:T.DoubleSide,roughness:.95});const m=k.mesh(ship,geo,cloth);sails.push(m);
    for(const z of [-width/2,width/2])k.rope(ship,[[x,top,z],[x+.02,top-height/2,z],[x,top-height,z]],'#cabb9a',.015);
    k.rope(ship,[[x,top-height,-width/2],[x+.12,top-height+.18,0],[x,top-height,width/2]],'#d8c6a4',.025);
  }
  sail(.2,5.45,3.7,2.35);sail(-2.25,5.6,2.55,1.2);
  // Bowsprit, ropes and rigging.
  k.cylinder(ship,.065,2.5,[4.35,2.35,0],C.lightWood,[0,0,-Math.PI/2+.16]);
  k.rope(ship,[[5.6,2.55,0],[3.3,1.9,0],[.2,5.7,0]],C.rope,.025);
  for(const z of [-1.4,1.4]){k.rope(ship,[[.2,6.25,0],[-.8,4.3,z*.6],[-1.2,2.1,z]],C.rope,.023);k.rope(ship,[[-2.25,6.4,0],[-3.4,4.4,z*.6],[-3.4,3.35,z]],C.rope,.024);}
  // Waving Jolly Roger.
  const flagGeo=new T.PlaneGeometry(1.65,1,16,8);const flag=k.mesh(ship,flagGeo,new T.MeshStandardMaterial({map:makeFlagTexture(),side:T.DoubleSide,roughness:1}),[-1.38,6.22,.04]);
  flag.userData.base=Float32Array.from(flagGeo.attributes.position.array);flag.name='jolly-roger';
  // Barrels and a treasure chest.
  function barrel(x:number,y:number,z:number){k.cylinder(ship,.24,.57,[x,y+.285,z],C.plank);for(const dy of [.08,.46])k.ring(ship,.245,.033,[x,y+dy,z],C.darkWood,[Math.PI/2,0,0]);k.cylinder(ship,.20,.025,[x,y+.58,z],C.lightWood);}
  barrel(-.9,1.79,-.25);barrel(1.8,1.79,.3);
  k.box(ship,[.7,.43,.5],[-2.7,3.28,-.7],C.wood);k.cylinder(ship,.25,.7,[-2.7,3.5,-.7],C.plank,[0,0,Math.PI/2]);
  for(const x of [-2.94,-2.46])k.box(ship,[.06,.5,.54],[x,3.29,-.7],C.gold);k.box(ship,[.13,.16,.04],[-2.7,3.34,-.42],C.gold);
  // Helm and spokes.
  k.box(ship,[.18,.65,.18],[-2.7,3.38,.68],C.wood);k.ring(ship,.32,.055,[-2.7,3.72,.68],C.lightWood,[0,Math.PI/2,0]);
  for(let a=0;a<Math.PI;a+=Math.PI/4)k.box(ship,[.045,.83,.055],[-2.7,3.72,.68],C.gold,[a,0,0]);
  // A tiny cartoon captain on deck.
  k.cylinder(ship,.15,.35,[-1.75,3.25,.63],'#b96451');k.sphere(ship,.19,[-1.75,3.58,.63],'#e2b18a');
  k.cylinder(ship,.28,.07,[-1.75,3.74,.63],C.ink);k.sphere(ship,.24,[-1.75,3.78,.63],C.ink,[1,.6,.7]);
  k.box(ship,[.03,.055,.17],[-1.57,3.61,.66],C.ink);k.sphere(ship,.025,[-1.57,3.55,.7],C.darkWood);
  // Anchor, chain, and lantern.
  k.rope(ship,[[3.05,2.2,1],[3.1,1.2,1.25],[3.17,.66,1.5]],'#56616a',.04);k.ring(ship,.13,.035,[3.17,.63,1.5],'#79878a');
  k.box(ship,[.06,.6,.06],[3.17,.25,1.5],'#667680');k.rope(ship,[[2.85,.28,1.5],[2.94,.02,1.5],[3.17,-.08,1.5],[3.39,.02,1.5],[3.48,.28,1.5]],'#667680',.055);
  k.rope(ship,[[-3.4,3.4,1.1],[-3.7,3.4,1.1],[-3.7,2.9,1.1]],C.darkWood,.05);
  k.box(ship,[.24,.35,.24],[-3.7,2.77,1.1],C.ink);k.box(ship,[.19,.22,.26],[-3.7,2.77,1.1],'#f2d893');
  ship.traverse(o=>{o.userData.isShip=true;});
  return { ship, flag, sails };
}
