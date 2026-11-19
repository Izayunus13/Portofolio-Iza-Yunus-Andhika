import {enterPortfolio} from './helpers/enter-portfolio';
import {test,expect} from '@playwright/test';
import * as T from 'three';
import {createFlagAnimation,createFlagGeometry,flagLength} from '../lib/ship-flag';
import {createWaterTitle} from '../lib/water-title';
import {createIslandSandGeometry,islandSandTop} from '../lib/island-shore';

function flagRig(){
 const mesh=new T.Mesh(createFlagGeometry(),new T.MeshStandardMaterial({side:T.DoubleSide}));
 return {mesh,animation:createFlagAnimation(mesh)};
}

test('flag hoist stays fixed while the free edge ripples',()=>{
 const {mesh,animation}=flagRig(),positions=mesh.geometry.attributes.position;
 const base=Float32Array.from(positions.array),tips:number[]=[];
 for(let frame=0;frame<120;frame++){
  const state=animation.update(1/60,frame/60,{velocityX:6,velocityZ:0,heading:0,reduced:false});
  expect(state.hoistError).toBe(0);tips.push(state.tipWave);
  for(let i=0;i<positions.count;i++)if(base[i*3]/flagLength<=.12){
   expect(positions.getX(i)).toBe(base[i*3]);expect(positions.getY(i)).toBe(base[i*3+1]);expect(Math.abs(positions.getZ(i))).toBe(0);
  }
 }
 expect(Math.max(...tips)-Math.min(...tips)).toBeGreaterThan(.1);
 mesh.geometry.dispose();(mesh.material as T.Material).dispose();
});

test('flag follows opposite actual velocity across headings, reversals and frame rates',()=>{
 for(const fps of [30,60,144])for(const [heading,vx,vz]of [[0,6,0],[Math.PI/2,0,-6],[Math.PI,-6,0],[-Math.PI/2,0,6],[Math.PI/2,6,0],[0,-6,0]]){
  const {mesh,animation}=flagRig();
  for(let frame=0;frame<fps*2;frame++)animation.update(1/fps,frame/fps,{velocityX:vx,velocityZ:vz,heading,reduced:false});
  const angle=heading+mesh.rotation.y;
  const alignment=(Math.cos(angle)*vx-Math.sin(angle)*vz)/Math.hypot(vx,vz);
  expect(alignment).toBeLessThan(-.999);
  mesh.geometry.dispose();(mesh.material as T.Material).dispose();
 }
});

test('flag remains still under reduced motion',()=>{
 const {mesh,animation}=flagRig();
 animation.update(1/60,0,{velocityX:0,velocityZ:0,heading:0,reduced:true});
 const before=Float32Array.from(mesh.geometry.attributes.position.array);
 animation.update(1/30,12,{velocityX:0,velocityZ:0,heading:0,reduced:true});
 expect(Float32Array.from(mesh.geometry.attributes.position.array)).toEqual(before);
 mesh.geometry.dispose();(mesh.material as T.Material).dispose();
});


test('flag hangs closed at rest, opens with speed and settles closed again at every frame rate',()=>{
 const reaches:number[]=[];
 for(const fps of [30,60,144]){
  const {mesh,animation}=flagRig(),dt=1/fps;
  const idle={velocityX:0,velocityZ:0,heading:0,reduced:false};
  let state=animation.update(dt,0,idle);
  expect(state.openness).toBe(0);expect(state.reach).toBeLessThan(.3);expect(state.tipDrop).toBeGreaterThan(1.3);
  const folded=Float32Array.from(mesh.geometry.attributes.position.array);
  for(let frame=0;frame<fps;frame++)animation.update(dt,frame/fps,idle);
  expect(Float32Array.from(mesh.geometry.attributes.position.array)).toEqual(folded);
  state=animation.update(dt,1,{...idle,velocityX:6});
  expect(state.openness).toBeGreaterThan(0);expect(state.openness).toBeLessThan(.2);
  expect(state.reach).toBeGreaterThan(.3);expect(state.tipDrop).toBeLessThan(1.4);
  for(let frame=1;frame<fps*2;frame++)state=animation.update(dt,1+frame/fps,{...idle,velocityX:6});
  expect(state.openness).toBe(1);expect(state.reach).toBeCloseTo(flagLength,5);reaches.push(state.reach);
  state=animation.update(dt,3,idle);
  expect(state.openness).toBeGreaterThan(.8);expect(state.openness).toBeLessThan(1);
  for(let frame=0;frame<fps*4;frame++)state=animation.update(dt,3+frame/fps,idle);
  expect(state.openness).toBe(0);expect(state.reach).toBeLessThan(.3);expect(state.tipDrop).toBeGreaterThan(1.3);expect(state.tipWave).toBe(0);
  const settled=Float32Array.from(mesh.geometry.attributes.position.array);
  animation.update(dt,30,idle);
  expect(Float32Array.from(mesh.geometry.attributes.position.array)).toEqual(settled);
  mesh.geometry.dispose();(mesh.material as T.Material).dispose();
 }
 reaches.forEach(reach=>expect(reach).toBeCloseTo(reaches[0],6));
});

test('larger curved Anthrope titles follow the shore and keep their complete footprint on flat sand',()=>{
 for(let index=1;index<=3;index++){
  const title=createWaterTitle(index);title.updateMatrixWorld(true);
  const letters=title.children[0] as T.Mesh;
  const bounds=new T.Box3().setFromObject(title);
  expect(letters.castShadow).toBe(true);expect(letters.receiveShadow).toBe(true);
  expect(bounds.min.y).toBeCloseTo(islandSandTop,5);
  expect(bounds.max.y-bounds.min.y).toBeGreaterThan(.1);
  expect(bounds.max.y-bounds.min.y).toBeLessThan(.25);
  const faceNormal=new T.Vector3(0,0,1).transformDirection(letters.matrixWorld);
  expect(faceNormal.y).toBeCloseTo(1,6);
  const sand=new T.Mesh(createIslandSandGeometry(index),new T.MeshBasicMaterial({side:T.DoubleSide}));
  sand.position.y=.05;sand.rotation.x=-Math.PI/2;sand.updateMatrixWorld(true);
  expect(bounds.max.x-bounds.min.x).toBeGreaterThan(5.7);
  expect(letters.userData.curved).toBe(true);
  const vertices=letters.geometry.attributes.position,samples=new Map<string,T.Vector3>();
  const center:number[]=[],ends:number[]=[];
  for(let i=0;i<vertices.count;i++){
   const point=new T.Vector3().fromBufferAttribute(vertices,i).applyMatrix4(letters.matrixWorld);
   if(Math.abs(point.y-islandSandTop)>1e-5)continue;
   samples.set(`${point.x.toFixed(1)},${point.z.toFixed(1)}`,point);
   if(Math.abs(point.x-.2)<.25)center.push(point.z);
   if(Math.abs(point.x-.2)>2.6)ends.push(point.z);
  }
  expect(center.length).toBeGreaterThan(0);expect(ends.length).toBeGreaterThan(0);
  expect(center.reduce((a,b)=>a+b,0)/center.length-ends.reduce((a,b)=>a+b,0)/ends.length).toBeGreaterThan(.4);
  const ray=new T.Raycaster();
  // Check the actual curved glyph outline, including descenders and outer bevels.
  for(const {x,z} of samples.values()){
   ray.set(new T.Vector3(x,2,z),new T.Vector3(0,-1,0));
   const hits=ray.intersectObject(sand);
   expect(hits.length,`Island ${index} at ${x},${z}`).toBeGreaterThan(0);
   expect(hits[0].point.y,`Island ${index} lettering sits on flat sand`).toBeCloseTo(bounds.min.y,3);
  }
  title.traverse(object=>{if(object instanceof T.Mesh){object.geometry.dispose();(Array.isArray(object.material)?object.material:[object.material]).forEach(material=>material.dispose());}});
  sand.geometry.dispose();(sand.material as T.Material).dispose();
 }
});

test('sailing flag trails both outward and homeward while the mast edge stays pinned',async({page})=>{
 test.setTimeout(90000);await page.emulateMedia({reducedMotion:'no-preference'});
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('/',{waitUntil:'networkidle'});await enterPortfolio(page);
 await expect(page.locator('main')).toHaveAttribute('data-intro-complete','true',{timeout:30000});
 const world=page.getByTestId('voyage-world');
 await expect(world).toHaveAttribute('data-flag-open','0.0000');
 expect(Number(await world.getAttribute('data-flag-reach'))).toBeLessThan(.3);
 expect(Number(await world.getAttribute('data-flag-drop'))).toBeGreaterThan(1.3);
 await page.screenshot({path:'test-results/flag-resting-home.png'});
 for(const [index,name]of [[1,'Bytehaven'],[0,'Home waters']]as const){
  await page.getByRole('button',{name:'Visit '+name,exact:true}).click();
  await expect.poll(async()=>Number(await world.getAttribute('data-flag-speed'))).toBeGreaterThan(2);
  await expect.poll(async()=>Number(await world.getAttribute('data-flag-aft'))).toBeGreaterThan(.85);
  await expect.poll(async()=>Number(await world.getAttribute('data-flag-open'))).toBeGreaterThan(.6);
  await expect(world).toHaveAttribute('data-flag-hoist-error','0.000000');
  const tip=Number(await world.getAttribute('data-flag-tip-wave'));
  await expect.poll(async()=>Math.abs(Number(await world.getAttribute('data-flag-tip-wave'))-tip)).toBeGreaterThan(.015);
  await page.screenshot({path:`test-results/flag-sailing-${index}.png`});
  await expect(page.locator('main')).toHaveAttribute('data-current-port',String(index),{timeout:20000});
  if(index)await page.getByRole('button',{name:'Close portfolio',exact:true}).click();
  await expect(world).toHaveAttribute('data-flag-open','0.0000',{timeout:6000});
  expect(Number(await world.getAttribute('data-flag-drop'))).toBeGreaterThan(1.3);
  await page.screenshot({path:`test-results/flag-docked-${index}.png`});
 }
 expect(errors).toEqual([]);
});

test('three beach titles remain visible in their island views',async({page})=>{
 await page.goto('/',{waitUntil:'networkidle'});await enterPortfolio(page);
 await expect(page.locator('main')).toHaveAttribute('data-intro-complete','true',{timeout:30000});
 for(const [index,name]of [[1,'Bytehaven'],[2,'Pigment Atoll'],[3,'Framewake Bay']]as const){
  await page.getByRole('button',{name:'Visit '+name,exact:true}).click();
  await expect(page.locator('main')).toHaveAttribute('data-current-port',String(index));
  await page.getByRole('button',{name:'Close portfolio',exact:true}).click();
  await expect(page.getByTestId('voyage-world')).toHaveAttribute('data-beveled-titles','3');
  await page.screenshot({path:`test-results/shore-title-${index}.png`});
 }
});
