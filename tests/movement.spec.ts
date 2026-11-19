import {enterPortfolio} from './helpers/enter-portfolio';
import { test, expect } from '@playwright/test';
import * as T from 'three';
import { createVoyageRoutes } from '../lib/voyage-routes';
import { angleDifference, createVoyagePath, sailingCruiseSpeed, sailingDuration, sailingEase, sailingRamp, stepSpring } from '../lib/voyage-motion';

test('cruising across unequal route legs preserves speed and direction', () => {
  const path = createVoyagePath(createVoyageRoutes());
  for (const port of [1, 2]) {
    const distance = path.distanceAtRoute(port), points = [-.02, -.01, 0, .01, .02].map(offset => {
      const point = new T.Vector3();path.sample(distance + offset, point);return point;
    });
    const before = points[2].clone().sub(points[1]), after = points[3].clone().sub(points[2]);
    expect(Math.abs(before.length() - after.length())).toBeLessThan(.00002);
    expect(before.angleTo(after)).toBeLessThan(.002);
  }
});

test('departure and arrival ease into rest without a change in acceleration', () => {
  const h = .0001;
  const velocity = (t: number) => (sailingEase(t + h) - sailingEase(t - h)) / (2 * h);
  const acceleration = (t: number) => (sailingEase(t + h) - 2 * sailingEase(t) + sailingEase(t - h)) / h ** 2;
  for (const t of [0, 1]) {
    expect(Math.abs(velocity(t))).toBeLessThan(.00001);
    expect(Math.abs(acceleration(t))).toBeLessThan(.001);
  }
  for (const t of [sailingRamp, 1-sailingRamp]) {
    expect(Math.abs(velocity(t - h) - velocity(t + h))).toBeLessThan(.00001);
    expect(Math.abs(acceleration(t))).toBeLessThan(.001);
  }
  let previous = 0;
  for (let i = 0; i <= 1000; i++) {
    const value = sailingEase(i / 1000);expect(value).toBeGreaterThanOrEqual(previous);previous = value;
  }
  expect(sailingEase(0)).toBe(0);expect(sailingEase(1)).toBe(1);
});

test('camera and heading smoothing agree at 30, 60 and 144 frames per second', () => {
  const results = [30, 60, 144].map(fps => {
    const state = { value: 0, velocity: 0 };
    for (let frame = 0; frame < fps; frame++) stepSpring(state, 10, .34, 1 / fps);
    return state;
  });
  for (const result of results) {
    expect(result.value).toBeCloseTo(results[0].value, 10);
    expect(result.velocity).toBeCloseTo(results[0].velocity, 10);
    expect(result.value).toBeLessThan(10);
  }
});


test('short, skipped and return voyages share cruise speed and stop at the exact remaining distance',()=>{
  const path=createVoyagePath(createVoyageRoutes()),h=.00001;
  for(const [from,to]of [[0,1],[0,3],[3,1],[1,0]]){
    const length=Math.abs(path.distanceAtRoute(to)-path.distanceAtRoute(from)),seconds=sailingDuration(length)/1000;
    const velocity=(sailingEase(.5+h)-sailingEase(.5-h))/(2*h)*length/seconds;
    expect(velocity).toBeCloseTo(sailingCruiseSpeed,5);
    let previous=length;
    for(let frame=0;frame<=600;frame++){
      const remaining=length*(1-sailingEase(frame/600));
      expect(remaining).toBeGreaterThanOrEqual(0);expect(remaining).toBeLessThanOrEqual(previous);previous=remaining;
    }
    expect(previous).toBe(0);
  }
});


test('returning home from every island restores the initial heading with reduced motion',async({page})=>{
  await page.goto('/',{waitUntil:'networkidle'});await enterPortfolio(page);
  await expect(page.locator('main')).toHaveAttribute('data-intro-complete','true');
  const world=page.getByTestId('voyage-world');
  const initialHeading=Number(await world.getAttribute('data-ship-heading'));
  for(const [port,name]of [[1,'Bytehaven'],[2,'Pigment Atoll'],[3,'Framewake Bay']]as const){
    await page.getByRole('button',{name:'Visit '+name,exact:true}).click();
    await expect(page.locator('main')).toHaveAttribute('data-current-port',String(port));
    await expect(page.locator('.portfolio-dialog')).toBeVisible();
    await page.getByRole('button',{name:'Close portfolio',exact:true}).click();
    await page.getByRole('button',{name:'Visit Home waters',exact:true}).click();
    await expect(page.locator('main')).toHaveAttribute('data-current-port','0');
    await expect.poll(async()=>Math.abs(angleDifference(initialHeading,Number(await world.getAttribute('data-ship-heading'))))).toBeLessThan(.001);
    await expect(world).toHaveAttribute('data-route','0.0000');
    await expect(page.locator('main')).toHaveAttribute('data-traveling','false');
  }
});
