import {enterPortfolio} from './helpers/enter-portfolio';
import {test,expect} from '@playwright/test';

function deferred(){let release=()=>{};const promise=new Promise<void>(resolve=>{release=resolve;});return {promise,release:()=>release()};}

test('cloud loading waits for the real first frame, animates birds, then opens both sides',async({page})=>{
  await page.emulateMedia({reducedMotion:'no-preference'});
  const gate=deferred();
  await page.route('**/lib/voyage-engine.ts*',async route=>{await gate.promise;await route.continue();});
  try{
    await page.goto('/',{waitUntil:'domcontentloaded'});await enterPortfolio(page);
    const loader=page.getByTestId('cloud-loading'),birds=page.getByTestId('intro-birds');
    await expect(loader).toHaveAttribute('data-clouds-ready','true',{timeout:30000});
    await expect(loader).toHaveAttribute('data-phase','loading');
    await expect(page.locator('main')).toHaveAttribute('aria-busy','true');
    await expect(page.locator('.voyage-header')).toHaveAttribute('inert','');
    await expect(birds).toHaveAttribute('data-renderer','atlas');
    await expect(birds.locator('canvas')).toHaveCount(0);
    const wing=await birds.locator('img').first().evaluate(el=>getComputedStyle(el).transform);
    const position=await birds.locator('.cloud-bird-flight').first().evaluate(el=>getComputedStyle(el).transform);
    await expect.poll(()=>birds.locator('img').first().evaluate(el=>getComputedStyle(el).transform)).not.toBe(wing);
    await expect.poll(()=>birds.locator('.cloud-bird-flight').first().evaluate(el=>getComputedStyle(el).transform)).not.toBe(position);
    expect(await page.evaluate(()=>performance.getEntriesByType('resource').some(entry=>entry.name.includes('/lib/cloud-birds.ts')))).toBe(false);
    gate.release();
    await expect(loader).toHaveAttribute('data-phase','opening',{timeout:30000});
    await loader.evaluate(element=>{for(const animation of element.getAnimations({subtree:true})){if(!(animation instanceof CSSAnimation)){animation.pause();animation.currentTime=900;}}});
    await expect(page.getByTestId('voyage-world')).toHaveAttribute('data-ready','true');
    const directions=await loader.evaluate(element=>['left','right'].map(side=>new DOMMatrixReadOnly(getComputedStyle(element.querySelector('.cloud-gate-'+side)!).transform).m41));
    expect(directions[0]).toBeLessThan(0);expect(directions[1]).toBeGreaterThan(0);
    const atmosphere=await loader.evaluate(element=>['.cloud-mist-left','.cloud-mist-right','.cloud-white-wash','.cloud-loading-veil'].map(selector=>Number(getComputedStyle(element.querySelector(selector)!).opacity)));
    expect(atmosphere.every(opacity=>opacity>0&&opacity<1)).toBe(true);
    const cloudImages=await loader.locator('.cloud-layer').evaluateAll(images=>images.map(image=>({mask:getComputedStyle(image).maskImage,width:(image as HTMLImageElement).naturalWidth})));
    expect(cloudImages.every(image=>image.mask==='none'&&image.width<=1024)).toBe(true);
    await expect(page.getByTestId('miniature-islands')).toHaveAttribute('data-ready','true');
    await loader.evaluate(element=>{for(const animation of element.getAnimations({subtree:true})){if(!(animation instanceof CSSAnimation))animation.play();}});
    await expect(loader).not.toBeAttached();
    await expect(page.locator('main')).toHaveAttribute('data-intro-complete','true',{timeout:30000});
    await expect(page.locator('main')).toHaveAttribute('aria-busy','false');
    await page.getByRole('button',{name:'Visit Bytehaven',exact:true}).click();
    await expect(page.locator('main')).toHaveAttribute('data-traveling','true');
  }finally{gate.release();}
});

test('reduced motion uses a brief fade and leaves navigation usable',async({page})=>{
  await page.goto('/');await enterPortfolio(page);
  await expect(page.locator('main')).toHaveAttribute('data-intro-complete','true');
  await expect(page.getByTestId('cloud-loading')).not.toBeAttached();
  await page.getByRole('button',{name:'Meet the captain',exact:true}).click();
  await expect(page.locator('.about-dialog')).toBeVisible();
});

test('clouds still release the page when WebGL is unavailable',async({page})=>{
  await page.addInitScript(()=>{const getContext=HTMLCanvasElement.prototype.getContext;Object.defineProperty(HTMLCanvasElement.prototype,'getContext',{value:function(this:HTMLCanvasElement,type:string,...args:unknown[]){if(['webgl','webgl2','experimental-webgl'].includes(type))return null;return Reflect.apply(getContext,this,[type,...args]);}});});
  await page.goto('/');await expect(page.getByTestId('pirate-harbor')).toHaveAttribute('data-renderer','fallback');await enterPortfolio(page);
  await expect(page.locator('main')).toHaveAttribute('data-intro-complete','true');
  await expect(page.locator('.world-fallback')).toBeVisible();
  await page.getByRole('button',{name:'Visit Framewake Bay',exact:true}).click();
  await expect(page.locator('main')).toHaveAttribute('data-current-port','3');
  await expect(page.locator('.collection-port')).toHaveText('Framewake Bay');
});
