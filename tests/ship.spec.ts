import {enterPortfolio} from './helpers/enter-portfolio';
import { test, expect } from '@playwright/test';
import * as T from 'three';
import { createHullBand, createHullGeometry, createSailGeometry, hullLevels } from '../lib/ship-hull';
import { stepAnchor } from '../lib/ship-animation';
import { batchStaticDetails } from '../lib/voyage-render';

function checkClosed(geometry:T.BufferGeometry) {
  const index=geometry.index!,edges=new Map<string,{count:number;orientation:number}>();
  for(let i=0;i<index.count;i+=3) for(let edge=0;edge<3;edge++) {
    const a=index.getX(i+edge),b=index.getX(i+(edge+1)%3),key=`${Math.min(a,b)}:${Math.max(a,b)}`;
    const entry=edges.get(key)??{count:0,orientation:0};entry.count++;entry.orientation+=a<b?1:-1;edges.set(key,entry);
  }
  for(const [edge,entry]of edges) {
    expect(entry.count,`Open/non-manifold edge ${edge}`).toBe(2);
    expect(entry.orientation,`Reversed face at edge ${edge}`).toBe(0);
  }
  const p=geometry.attributes.position,a=new T.Vector3(),b=new T.Vector3(),c=new T.Vector3();let volume=0;
  for(let i=0;i<index.count;i+=3){a.fromBufferAttribute(p,index.getX(i));b.fromBufferAttribute(p,index.getX(i+1));c.fromBufferAttribute(p,index.getX(i+2));volume+=a.dot(b.cross(c))/6;}
  expect(volume,'Surface normals face outward').toBeGreaterThan(0);geometry.dispose();
}

test('hull and both sails are closed solids with consistently outward faces',()=>{
  checkClosed(createHullGeometry());
  hullLevels.slice(1).forEach(([y])=>checkClosed(createHullBand(y-.014,.024)));
  checkClosed(createSailGeometry(.2,5.45,3.7,2.35));
  checkClosed(createSailGeometry(-2.25,5.6,2.55,1.2));
});

test('render batching preserves all descendants of an animated joint',()=>{
  const ship=new T.Group(),joint=new T.Group(),material=new T.MeshStandardMaterial();ship.add(joint);
  const hand=new T.Mesh(new T.BoxGeometry(.1,.3,.1),material);hand.position.y=-.5;joint.add(hand);
  for(let i=0;i<2;i++)ship.add(new T.Mesh(new T.BoxGeometry(1,1,1),material));
  batchStaticDetails(ship,new Set([joint]));
  expect(hand.parent).toBe(joint);ship.updateMatrixWorld(true);
  const before=hand.getWorldPosition(new T.Vector3());joint.rotation.z=.8;ship.updateMatrixWorld(true);
  expect(hand.getWorldPosition(new T.Vector3()).distanceTo(before)).toBeGreaterThan(.3);
});

test('anchor swings under changing load, settles, and remains stable across frame rates',()=>{
  const results=[30,60,144].map(fps=>{
    const state={x:-.12,z:0,vx:0,vz:0};let minimumZ=0;
    for(let frame=0;frame<fps*2;frame++){stepAnchor(state,-.08,-.12,1/fps);minimumZ=Math.min(minimumZ,state.z);}
    expect(minimumZ).toBeLessThan(-.12);
    for(let frame=0;frame<fps*5;frame++)stepAnchor(state,-.12,0,1/fps);
    expect(state.x).toBeCloseTo(-.12,3);expect(state.z).toBeCloseTo(0,3);
    return state;
  });
  results.forEach(state=>expect(state.z).toBeCloseTo(results[0].z,4));
});

test('captain loops a wave on each departure and the anchor responds during sailing',async({page})=>{
  test.setTimeout(45000);await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto('/',{waitUntil:'networkidle'});await enterPortfolio(page);const world=page.getByTestId('voyage-world');
  await expect(world).toHaveAttribute('data-ready','true');
  await expect(world).toHaveAttribute('data-captain-waving','false');
  for(const [index,name]of [[1,'Bytehaven'],[2,'Pigment Atoll']] as const){
    await page.getByRole('button',{name:`Visit ${name}`,exact:true}).click();
    await expect(world).toHaveAttribute('data-captain-wave-starts',String(index));
    await expect(world).toHaveAttribute('data-captain-waving','true');
    const hand=Number(await world.getAttribute('data-captain-hand'));
    await expect.poll(async()=>Math.abs(Number(await world.getAttribute('data-captain-hand'))-hand)).toBeGreaterThan(.08);
    const anchor=Number(await world.getAttribute('data-anchor-z'));
    await expect.poll(async()=>Math.abs(Number(await world.getAttribute('data-anchor-z'))-anchor)).toBeGreaterThan(.005);
    await expect(page.locator('main')).toHaveAttribute('data-current-port',String(index),{timeout:15000});
    await expect(page.locator('.portfolio-dialog')).toBeVisible();
    await page.getByRole('button',{name:'Close portfolio'}).click();
    await expect(world).toHaveAttribute('data-captain-waving','false');
  }
});
