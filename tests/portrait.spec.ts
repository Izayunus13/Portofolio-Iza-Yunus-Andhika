import {test,expect} from '@playwright/test';

test('the gold chains enter from offscreen, stay attached to the moving frame, and settle back',async({page})=>{
 await page.goto('/',{waitUntil:'networkidle'});
 const begin=page.getByRole('button',{name:'Begin the voyage',exact:true});
 await expect(begin).toBeEnabled({timeout:30000});await begin.click();
 await expect(page.getByTestId('voyage-prologue')).toHaveAttribute('data-phase','about');
 const rig=page.getByTestId('hanging-portrait'),frame=page.getByTestId('about-portrait-frame');
 const chainEnds=()=>rig.locator('.portrait-gold-chain').evaluate(svg=>Array.from(svg.querySelectorAll<SVGPathElement>('[data-chain-path]')).map(path=>{
  const matrix=path.getScreenCTM()!,a=path.getPointAtLength(0).matrixTransform(matrix),b=path.getPointAtLength(path.getTotalLength()).matrixTransform(matrix);
  return {start:{x:a.x,y:a.y},end:{x:b.x,y:b.y}};
 }));
 await expect(rig.locator('.portrait-gold-chain')).toBeVisible();
 await expect(rig.locator('.portrait-lanyard,.lanyard-ribbon')).toHaveCount(0);
 await page.mouse.move(0,0);await page.emulateMedia({reducedMotion:'no-preference'});
 await expect(rig).toHaveAttribute('data-motion','swinging');
 const original=(await frame.boundingBox())!,starts=await chainEnds();
 expect(starts.every(point=>point.start.y<0)).toBe(true);
 await expect(rig.locator('.portrait-ceiling-pin')).toHaveCount(0);
 const center=()=>frame.evaluate(el=>{const box=el.getBoundingClientRect();return box.x+box.width/2;});
 await page.screenshot({path:'test-results/portrait-hanging-desktop.png'});
 // A pointer approaching from the left pushes the suspended frame to the right.
 await page.mouse.move(original.x+original.width*.15,original.y+original.height*.50);
 await expect.poll(center).toBeGreaterThan(original.x+original.width/2+8);
 const shifted=(await frame.boundingBox())!,ends=await chainEnds(),ring=(await rig.locator('.chain-split-ring').boundingBox())!;
 for(let i=0;i<ends.length;i++){
  expect(Math.abs(ends[i].start.x-starts[i].start.x)+Math.abs(ends[i].start.y-starts[i].start.y)).toBeLessThan(.2);
  expect(ends[i].end.x).toBeGreaterThan(ring.x);expect(ends[i].end.x).toBeLessThan(ring.x+ring.width);
  expect(ends[i].end.y).toBeGreaterThan(ring.y);expect(ends[i].end.y).toBeLessThan(ring.y+ring.height);
 }
 expect(shifted.x).toBeGreaterThan(0);expect(shifted.x+shifted.width).toBeLessThan(1440);
 await page.screenshot({path:'test-results/portrait-avoids-cursor.png'});
 await page.mouse.move(original.x+original.width*.85,original.y+original.height*.5);
 await expect.poll(center).toBeLessThan(original.x+original.width/2-8);
 await page.mouse.move(0,0);
 await expect.poll(()=>rig.locator('.portrait-pendulum').evaluate(el=>Math.abs(parseFloat((el as HTMLElement).style.getPropertyValue('--portrait-roll')))),{timeout:5000}).toBeLessThan(.6);
 // Changing the OS preference stops both cursor avoidance and the idle sway.
 await page.emulateMedia({reducedMotion:'reduce'});await expect(rig).toHaveAttribute('data-motion','reduced');
 const still=await frame.boundingBox();
 await page.mouse.move(original.x+40,original.y+150);await page.waitForTimeout(250);
 expect(await frame.boundingBox()).toEqual(still);
 expect(await rig.locator('.portrait-pendulum').evaluate(el=>getComputedStyle(el).transform)).toBe('none');
 expect(await frame.locator('.prologue-portrait-window').evaluate(el=>getComputedStyle(el).overflow)).toBe('hidden');
});

test.describe('touch portrait',()=>{
 test.use({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 test('the gold chain fits a narrow screen and the About Me action stays reachable',async({page})=>{
  await page.goto('/',{waitUntil:'networkidle'});
  const begin=page.getByRole('button',{name:'Begin the voyage',exact:true});
  await expect(begin).toBeEnabled({timeout:30000});await begin.tap();
  await expect(page.getByTestId('voyage-prologue')).toHaveAttribute('data-phase','about');
  await expect(page.getByTestId('hanging-portrait')).toHaveAttribute('data-motion','reduced');
  const frame=(await page.getByTestId('about-portrait-frame').boundingBox())!;
  expect(frame.x).toBeGreaterThan(0);expect(frame.x+frame.width).toBeLessThan(390);
  await expect(page.locator('.portrait-chain-hardware')).toBeInViewport();
  const start=await page.locator('[data-chain-path="front"]').evaluate((el:SVGPathElement)=>el.getPointAtLength(0).matrixTransform(el.getScreenCTM()!).y);
  expect(start).toBeLessThan(0);
  await page.screenshot({path:'test-results/portrait-hanging-phone.png'});
  const enter=page.getByRole('button',{name:'Explore my portfolio',exact:true});
  await enter.scrollIntoViewIfNeeded();await expect(enter).toBeInViewport();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.getByTestId('pirate-treasure').scrollIntoViewIfNeeded();
  await page.screenshot({path:'test-results/treasure-floor-phone.png'});
  await enter.tap();await expect(page.getByTestId('voyage-prologue')).not.toBeAttached();
 });
});

test('one gold coin jumps and flips at a time, repeats with another coin, and respects reduced motion',async({page})=>{
 await page.goto('/',{waitUntil:'networkidle'});
 const begin=page.getByRole('button',{name:'Begin the voyage',exact:true});
 await expect(begin).toBeEnabled({timeout:30000});await begin.click();
 await expect(page.getByTestId('voyage-prologue')).toHaveAttribute('data-phase','about');
 const pile=page.getByTestId('pirate-treasure');
 expect(await pile.locator('.pirate-floor-coin').count()).toBeGreaterThan(20);
 await expect(pile).toHaveAttribute('data-motion','reduced');
 await expect(pile.locator('[data-state="flipping"]')).toHaveCount(0);
 await page.clock.install();await page.emulateMedia({reducedMotion:'no-preference'});
 await expect(pile).toHaveAttribute('data-motion','playing');
 await page.clock.fastForward(2300);
 const flipping=pile.locator('[data-state="flipping"]');
 await expect(flipping).toHaveCount(1);
 const first=await pile.getAttribute('data-active-coin');
 await flipping.evaluate(el=>{
  el.querySelectorAll('.pirate-coin-hop,.pirate-coin-body,.pirate-coin-shadow').forEach(part=>part.getAnimations().forEach(animation=>{animation.pause();animation.currentTime=590;}));
 });
 const ground=(await flipping.boundingBox())!,air=(await flipping.locator('.pirate-coin-hop').boundingBox())!;
 expect(ground.y-air.y).toBeGreaterThan(50);
 const rotation=await flipping.locator('.pirate-coin-body').evaluate(el=>new DOMMatrix(getComputedStyle(el).transform).m22);
 expect(Math.abs(rotation-Math.cos(62*Math.PI/180))).toBeGreaterThan(.05);
 await page.screenshot({path:'test-results/treasure-coin-flipping.png'});
 await flipping.evaluate(el=>el.querySelectorAll('.pirate-coin-hop,.pirate-coin-body,.pirate-coin-shadow').forEach(part=>part.getAnimations().forEach(animation=>animation.finish())));
 await expect(pile).toHaveAttribute('data-flip-count','1');
 await expect(flipping).toHaveCount(0);
 await page.clock.fastForward(6000);
 await expect(flipping).toHaveCount(1);
 expect(await pile.getAttribute('data-active-coin')).not.toBe(first);
 await page.emulateMedia({reducedMotion:'reduce'});
 await expect(pile).toHaveAttribute('data-motion','reduced');
 await expect(flipping).toHaveCount(0);
 await page.clock.fastForward(10000);await expect(flipping).toHaveCount(0);
});
