import * as T from 'three';
import { createKit, makeFlagTexture } from './three-kit';
import { createHullBand, createHullGeometry, createSailGeometry, deckSpan, hullLevels, shipColors as C } from './ship-hull';
import { createShipAnimation } from './ship-animation';
import { createFlagAnimation, createFlagGeometry } from './ship-flag';

export function createPirateShip() {
  const ship=new T.Group();ship.name='pirate-ship';
  const k=createKit();
  const hullMaterials=[C.darkWood,'#70513c','#805d42','#916d4c',C.plank,C.lightWood].map(color=>new T.MeshStandardMaterial({color,roughness:.86,flatShading:true}));
  const hull=new T.Mesh(createHullGeometry(),hullMaterials);hull.name='sealed-hull';hull.castShadow=true;hull.receiveShadow=true;ship.add(hull);
  for(let level=1;level<hullLevels.length;level++){
    const [y]=hullLevels[level];
    k.mesh(ship,createHullBand(y-.014,level===4?.045:.024),level===4?C.gold:C.darkWood);
  }
  for(let z=-1.2;z<=1.2;z+=.24){const [a,b]=deckSpan(z);k.box(ship,[b-a,.009,.012],[(a+b)/2,1.747,z],C.seam);}
  for(let x=-2.8;x<3.3;x+=.85)for(let z=-1.08;z<=1.08;z+=.24){const [a,b]=deckSpan(z);const px=x+(Math.round(z/.24)%2?.32:0);if(px>a+.08&&px<b-.08)k.box(ship,[.012,.009,.21],[px,1.747,z],C.seam);}
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
  for(const sign of [-1,1])for(const x of [-1.1,.25,1.55]){k.cylinder(ship,.102,.035,[x,1.565,sign*1.518],C.ink,[Math.PI/2,0,0]);k.ring(ship,.105,.023,[x,1.565,sign*1.54],C.gold);}
  // Broadside cannons, with wheels and dark muzzles.
  for(const z of [-1.32,1.32])for(const x of [-.75,.7,2.05]){
    const side=Math.sign(z);k.box(ship,[.58,.22,.57],[x,1.88,z*.82],C.wood);
    k.cylinder(ship,.16,.78,[x,2.06,z+.13*side],C.iron,[Math.PI/2,0,0],.12);
    k.cylinder(ship,.10,.014,[x,2.06,z+.53*side],C.ink,[Math.PI/2,0,0]);
    k.ring(ship,.145,.035,[x,2.06,z+.52*side],C.ironEdge);
    for(const dx of [-.25,.25])k.cylinder(ship,.16,.10,[x+dx,1.9,z-.22*side],C.darkWood,[Math.PI/2,0,0]);
  }
  // Stern ladder.
  for(const x of [-2.98,-2.42])k.cylinder(ship,.045,2.12,[x,1.97,1.63],C.wood);
  for(let y=1.08;y<=2.95;y+=.3)k.box(ship,[.64,.065,.075],[-2.7,y,1.65],C.lightWood);
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
    const geo=createSailGeometry(x,top,width,height);
    const cloth=new T.MeshStandardMaterial({color:C.ivory,roughness:.95});const m=k.mesh(ship,geo,cloth);m.name='sealed-sail';sails.push(m);
    for(const z of [-width/2,width/2])k.rope(ship,[[x,top,z],[x,top-height/2,z],[x,top-height,z]],C.rope,.015);
    k.rope(ship,[[x,top-height,-width/2],[x,top-height+.18,0],[x,top-height,width/2]],C.ivory,.022);
  }
  sail(.2,5.45,3.7,2.35);sail(-2.25,5.6,2.55,1.2);
  // Bowsprit, ropes and rigging.
  k.cylinder(ship,.065,2.5,[4.35,2.35,0],C.lightWood,[0,0,-Math.PI/2+.16]);
  k.rope(ship,[[5.6,2.55,0],[3.3,1.9,0],[.2,5.7,0]],C.rope,.025);
  for(const z of [-1.4,1.4]){k.rope(ship,[[.2,6.25,0],[-.8,4.3,z*.6],[-1.2,2.1,z]],C.rope,.023);k.rope(ship,[[-2.25,6.4,0],[-3.4,4.4,z*.6],[-3.4,3.35,z]],C.rope,.024);}
  // The cloth pivots at its fixed hoist on the stern mast and trails actual travel.
  const flag=k.mesh(ship,createFlagGeometry(),new T.MeshStandardMaterial({map:makeFlagTexture(),side:T.DoubleSide,roughness:1}),[-2.25,6,.085]);
  flag.name='jolly-roger';const flagAnimation=createFlagAnimation(flag);
  // Barrels and a treasure chest.
  function barrel(x:number,y:number,z:number){k.cylinder(ship,.24,.57,[x,y+.285,z],C.plank);for(const dy of [.08,.46])k.ring(ship,.245,.033,[x,y+dy,z],C.darkWood,[Math.PI/2,0,0]);k.cylinder(ship,.20,.025,[x,y+.58,z],C.lightWood);}
  barrel(-.9,1.79,-.25);barrel(1.8,1.79,.3);
  // A closed half-round lid meets the body at a clean seam: no coplanar caps.
  const chest=new T.Group();chest.name='treasure-chest';chest.position.set(-2.8,3.065,-.7);ship.add(chest);
  k.box(chest,[.7,.43,.5],[0,.215,0],C.wood).name='treasure-chest-body';
  const lidProfile=new T.Shape();lidProfile.moveTo(-.25,0);lidProfile.lineTo(.25,0);lidProfile.absarc(0,0,.25,0,Math.PI,false);lidProfile.closePath();
  const lidGeometry=new T.ExtrudeGeometry(lidProfile,{depth:.7,bevelEnabled:false,curveSegments:12,steps:1});
  lidGeometry.translate(0,0,-.35);lidGeometry.rotateY(Math.PI/2);
  k.mesh(chest,lidGeometry,C.plank,[0,.442,0]).name='treasure-chest-lid';
  for(const x of [-.24,.24]){
    for(const z of [-.263,.263])k.box(chest,[.045,.43,.024],[x,.215,z],C.gold);
    const arch:T.Vector3[]=[];for(let i=0;i<=16;i++){const a=i/16*Math.PI;arch.push(new T.Vector3(x,.442+Math.sin(a)*.263,Math.cos(a)*.263));}
    k.mesh(chest,new T.TubeGeometry(new T.CatmullRomCurve3(arch),24,.018,6,false),C.gold);
  }
  k.box(chest,[.12,.15,.035],[0,.36,.279],C.gold);
  k.box(chest,[.025,.045,.008],[0,.36,.301],C.darkWood);
  // Helm and spokes.
  k.box(ship,[.18,.65,.18],[-2.7,3.38,.68],C.wood);k.ring(ship,.32,.055,[-2.7,3.72,.68],C.lightWood,[0,Math.PI/2,0]);
  for(let a=0;a<Math.PI;a+=Math.PI/4)k.box(ship,[.045,.83,.055],[-2.7,3.72,.68],C.gold,[a,0,0]);
  // The outboard davit connects the moving chain to a solid support on the deck.
  k.box(ship,[.095,.44,.095],[3.05,1.96,.96],C.iron);
  k.box(ship,[.095,.075,.55],[3.05,2.18,1.17],C.iron);
  const animation=createShipAnimation(ship);
  // A framed lantern; its amber glass sits inside the metal supports.
  k.rope(ship,[[-3.4,3.4,1.1],[-3.7,3.4,1.1],[-3.7,2.9,1.1]],C.darkWood,.05);
  k.mesh(ship,new T.BoxGeometry(.23,.28,.23),new T.MeshStandardMaterial({color:'#dfc183',emissive:'#ad8040',emissiveIntensity:.18,roughness:.5}),[-3.7,2.77,1.1]);
  for(const dx of [-.13,.13])for(const dz of [-.13,.13])k.box(ship,[.025,.34,.025],[-3.7+dx,2.77,1.1+dz],C.ink);
  for(const y of [2.6,2.94])k.box(ship,[.29,.035,.29],[-3.7,y,1.1],C.ink);
  ship.traverse(o=>{o.userData.isShip=true;});
  return { ship, flag, sails, animation, flagAnimation };
}
