import {enterPortfolio} from './helpers/enter-portfolio';
﻿import { test, expect, type Page } from '@playwright/test';

import { ports } from '../lib/voyage-routes';

async function openWorld(page:Page){
  await page.goto('/',{waitUntil:'networkidle'});await enterPortfolio(page);
  const world=page.getByTestId('voyage-world');
  await expect(world).toHaveAttribute('data-ready','true',{timeout:30000});
  await expect(world).toHaveAttribute('data-route','0.0000');
  await expect(page.locator('main')).toHaveAttribute('data-intro-complete','true');
  return world;
}

test('renders the actual 3D world and preserves the personal introduction',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  const world=await openWorld(page);
  await expect(world).toHaveAttribute('data-renderer','webgl');
  await expect(world.getByRole('img',{name:'Isometric 3D pirate ship and creative islands'})).toBeVisible();
  await expect(page.getByRole('heading',{level:1})).toHaveText('IZA YUNUSANDHIKA.');
  await expect(page.getByRole('button',{name:'Visit Home waters'})).toHaveAttribute('aria-current','step');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test('clicking the 3D ship sails continuously along the route before opening the island',async({page})=>{
  await page.emulateMedia({reducedMotion:'no-preference'});
  const world=await openWorld(page);
  await world.locator('canvas').evaluate(el=>Promise.all(el.getAnimations().map(a=>a.finished.then(()=>null))));
  const screen=await world.evaluate(el=>({x:Number(el.dataset.shipScreenX),y:Number(el.dataset.shipScreenY)}));
  await page.mouse.click(screen.x,screen.y);
  await expect(page.locator('main')).toHaveAttribute('data-traveling','true');
  await expect(page.getByRole('status')).toContainText('going to Bytehaven');
  await expect(page.locator('.portfolio-dialog')).not.toBeVisible();
  await expect.poll(async()=>Number(await world.getAttribute('data-route'))).toBeGreaterThan(.12);
  const first=await world.evaluate(el=>({route:Number(el.dataset.route),x:Number(el.dataset.shipX),z:Number(el.dataset.shipZ)}));
  await expect.poll(async()=>Number(await world.getAttribute('data-route'))).toBeGreaterThan(first.route+.13);
  const second=await world.evaluate(el=>({route:Number(el.dataset.route),x:Number(el.dataset.shipX),z:Number(el.dataset.shipZ)}));
  expect(second.x).toBeGreaterThan(first.x);
  expect(Math.abs(second.z-first.z)).toBeGreaterThan(.01);
  await expect(page.locator('main')).toHaveAttribute('data-current-port','1',{timeout:15000});
  await expect(world).toHaveAttribute('data-ship-x',ports[1].position[0].toFixed(3));
  await expect(page.locator('.portfolio-dialog')).toBeVisible();
  await expect(page.locator('.collection-port')).toContainText('Bytehaven');
});

test('the journey visits each island in order and returns home',async({page})=>{
  await openWorld(page);
  await page.getByRole('button',{name:'Sail to Bytehaven',exact:true}).click();
  const modal=page.locator('.portfolio-dialog');
  await expect(modal).toBeVisible();
  await expect(modal.locator('.collection-port')).toContainText('Bytehaven');
  await modal.getByRole('button',{name:'Sail to the next island'}).click();
  await expect(modal.locator('.collection-port')).toContainText('Pigment Atoll');
  await expect(page.locator('main')).toHaveAttribute('data-current-port','2');
  await modal.getByRole('button',{name:'Sail to the next island'}).click();
  await expect(modal.locator('.collection-port')).toContainText('Framewake Bay');
  await expect(page.locator('main')).toHaveAttribute('data-current-port','3');
  await modal.getByRole('button',{name:'Sail to the next island'}).click();
  await expect(page.locator('main')).toHaveAttribute('data-current-port','0');
  await expect(modal).not.toBeVisible();
  await expect(page.getByRole('heading',{level:1})).toHaveText('IZA YUNUSANDHIKA.');
});

test('media slides stay inside one portfolio and tabs switch portfolios independently',async({page})=>{
  await openWorld(page);
  await page.getByRole('button',{name:'Visit Bytehaven',exact:true}).click();
  const modal=page.locator('.portfolio-dialog');
  const tabA=modal.getByRole('tab',{name:/Portfolio A/}),tabB=modal.getByRole('tab',{name:/Portfolio B/}),tabC=modal.getByRole('tab',{name:/Portfolio C/});
  await expect(modal.getByRole('heading')).toHaveText('ANJEMIN, made for campus life.');
  await expect(tabA).toHaveAttribute('aria-selected','true');
  await expect(modal.locator('.project-highlights dt')).toHaveText(['Customer','Penganjem (Driver)','Pengelola (Manager)']);
  await expect(modal.getByLabel('Media 1 of 75 in Portfolio A',{exact:true})).toBeVisible();
  await expect(modal.locator('.project-image-link')).toHaveAttribute('href','/portfolio/anjemin/live/01-home-overview.webp');
  await expect.poll(()=>modal.locator('.project-image-link img').evaluate((image:HTMLImageElement)=>image.naturalWidth)).toBeGreaterThan(0);
  await expect(modal.getByRole('link',{name:'View project'})).toHaveAttribute('href','https://anjemin.vercel.app/');
  const firstMedia=await modal.locator('.project-media').boundingBox(),firstText=await modal.locator('.project-details').boundingBox();
  expect(firstMedia!.x).toBeLessThan(firstText!.x);
  await modal.getByRole('button',{name:'Next media',exact:true}).click();
  await expect(modal.getByRole('heading')).toHaveText('Four needs. One place to start.');
  await expect(tabA).toHaveAttribute('aria-selected','true');
  await expect(modal.getByLabel('Media 2 of 75 in Portfolio A',{exact:true})).toBeVisible();
  const secondMedia=await modal.locator('.project-media').boundingBox(),secondText=await modal.locator('.project-details').boundingBox();
  expect(secondMedia!.x).toBeGreaterThan(secondText!.x);
  await page.keyboard.press('ArrowRight');
  await expect(modal.getByRole('heading')).toHaveText('Invite a friend, understand the reward.');
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowLeft');
  await expect(modal.getByRole('heading')).toHaveText('ANJEMIN, made for campus life.');
  const panel=modal.getByRole('tabpanel');await panel.focus();
  await page.keyboard.press('ArrowLeft');
  await expect(modal.getByRole('heading')).toHaveText('Let the form follow the screen.');
  await expect(modal.getByLabel('Media 75 of 75 in Portfolio A',{exact:true})).toBeVisible();
  await expect(panel).toBeFocused();
  await tabA.focus();await page.keyboard.press('ArrowRight');
  await expect(tabB).toBeFocused();await expect(tabB).toHaveAttribute('aria-selected','true');
  await expect(modal.getByRole('heading')).toHaveText('LOWBAT Assist, ready for the team.');
  await expect(modal.getByLabel('Media 1 of 13 in Portfolio B',{exact:true})).toBeVisible();
  await modal.getByRole('button',{name:'Previous media',exact:true}).click();
  await expect(modal.getByLabel('Media 13 of 13 in Portfolio B',{exact:true})).toBeVisible();
  await expect(tabB).toHaveAttribute('aria-selected','true');
  await tabC.click();
  await expect(modal.getByRole('heading')).toHaveText('Priorify AI, a clearer path to focus.');
  await expect(modal.getByLabel('Media 1 of 12 in Portfolio C',{exact:true})).toBeVisible();
  await page.keyboard.press('Home');
  await expect(tabA).toHaveAttribute('aria-selected','true');
  await expect(modal.getByRole('heading')).toHaveText('ANJEMIN, made for campus life.');
  await page.keyboard.press('End');
  await expect(tabC).toHaveAttribute('aria-selected','true');
  await expect(modal.getByLabel('Media 1 of 12 in Portfolio C',{exact:true})).toBeVisible();
  await expect(page.locator('main')).toHaveAttribute('data-current-port','1');
  await page.keyboard.press('Escape');
  await expect(modal).not.toBeVisible();
  await expect(page.getByRole('heading',{level:1})).toContainText('Good ideas.');
});

test('each island owns its portfolios and selecting a tab resets only its media',async({page})=>{
  await openWorld(page);
  const modal=page.locator('.portfolio-dialog');
  for(const [index,name]of [[1,'Bytehaven'],[2,'Pigment Atoll'],[3,'Framewake Bay']]as const){
    await page.getByRole('button',{name:'Visit '+name,exact:true}).click();
    await expect(modal.locator('.collection-port')).toHaveText(name);
    await expect(modal.getByRole('tab')).toHaveCount(index===3?6:3);
    await expect(modal.getByRole('tab',{selected:true})).toContainText('Portfolio A');
    for(const letter of ['A','B','C']){
      const count=index===1?(letter==='A'?75:letter==='B'?13:12):index===3?(letter==='A'?5:letter==='B'?7:5):letter==='A'?16:letter==='B'?5:2;
      const tab=modal.getByRole('tab',{name:new RegExp('Portfolio '+letter)});await tab.click();
      await expect(modal.getByLabel('Media 1 of '+count+' in Portfolio '+letter,{exact:true})).toBeVisible();
      const still=modal.locator('.project-image-link img');
      if(await still.count()){
        await still.evaluate((image:HTMLImageElement)=>image.decode());
        const fit=await still.evaluate((image:HTMLImageElement)=>{
          const box=image.getBoundingClientRect(),frame=image.parentElement!.getBoundingClientRect(),style=getComputedStyle(image.parentElement!);
          return {ratio:box.width/box.height,natural:image.naturalWidth/image.naturalHeight,gap:frame.width-box.width-parseFloat(style.borderLeftWidth)-parseFloat(style.borderRightWidth)};
        });
        expect(fit.ratio).toBeCloseTo(fit.natural,2);expect(fit.gap).toBeLessThan(1);
      }
      const overview=await modal.getByRole('heading').innerText(),description=await modal.locator('.project-details>p:not(.eyebrow)').innerText();
      await modal.getByRole('button',{name:'Next media',exact:true}).click();
      await expect(tab).toHaveAttribute('aria-selected','true');
      await expect(modal.getByLabel('Media 2 of '+count+' in Portfolio '+letter,{exact:true})).toBeVisible();
      await expect(modal.getByRole('heading')).not.toHaveText(overview);
      await expect(modal.locator('.project-details>p:not(.eyebrow)')).not.toHaveText(description);
      await expect(page.locator('main')).toHaveAttribute('data-current-port',String(index));
    }
    await modal.getByRole('button',{name:'Close portfolio',exact:true}).click();
  }
});

test.describe('mobile',()=>{
  test.use({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  test('3D view, islands, and touch gallery fit a phone',async({page})=>{
    const world=await openWorld(page);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    const title=await page.getByRole('heading',{level:1}).boundingBox();
    const deckY=Number(await world.getAttribute('data-ship-screen-y'));
    expect(deckY).toBeGreaterThan(title!.y+title!.height);
    await page.getByRole('button',{name:'Visit Pigment Atoll',exact:true}).click();
    const modal=page.locator('.portfolio-dialog');await expect(modal).toBeVisible();
    await expect(modal.getByRole('heading')).toHaveText('Luminous Prom Night.');
    const slide=modal.locator('.project-slide');
    await slide.evaluate(el=>{const touch=new Touch({identifier:0,target:el,clientX:300,clientY:150});el.dispatchEvent(new TouchEvent('touchstart',{bubbles:true,changedTouches:[touch]}));});
    await slide.evaluate(el=>{const touch=new Touch({identifier:0,target:el,clientX:100,clientY:150});el.dispatchEvent(new TouchEvent('touchend',{bubbles:true,changedTouches:[touch]}));});
    await expect(modal.getByRole('heading')).toHaveText('HIVI! at SMAN 1 Madiun.');
    await expect(modal.getByRole('tab',{name:/Portfolio A/})).toHaveAttribute('aria-selected','true');
    await modal.getByRole('tab',{name:/Portfolio B/}).click();
    await expect(modal.getByRole('heading')).toHaveText('FORMAS Goes to School.');
    await expect(modal.getByLabel('Media 1 of 5 in Portfolio B',{exact:true})).toBeVisible();
    expect(await modal.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
    await modal.getByRole('button',{name:'Close portfolio'}).click();
    await expect(page.locator('main')).toHaveAttribute('data-current-port','2');
  });
});

test('captain and contact dialogs keep accurate personal content',async({page})=>{
  await openWorld(page);
  await page.getByRole('button',{name:'Meet the captain',exact:true}).click();
  const info=page.locator('.info-dialog');await expect(info).toContainText('I’m Iza Yunus Andhika');
  await page.keyboard.press('Escape');await expect(info).not.toBeVisible();
  await page.getByRole('button',{name:'Say ahoy',exact:true}).click();
  await expect(info).toContainText('My contact channels are coming aboard soon.');
  await expect(info.locator('a[href^="mailto:"]')).toHaveCount(0);
  await info.getByRole('button',{name:'Close dialog'}).click();await expect(info).not.toBeVisible();
});

test('the portfolio remains usable when WebGL is unavailable',async({page})=>{
  await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;Object.defineProperty(HTMLCanvasElement.prototype,'getContext',{value:function(this:HTMLCanvasElement,type:string,...args:unknown[]){if(type==='webgl'||type==='webgl2'||type==='experimental-webgl')return null;return Reflect.apply(original,this,[type,...args]);}});});
  await page.goto('/',{waitUntil:'networkidle'});await enterPortfolio(page);
  await expect(page.locator('.world-fallback')).toBeVisible();
  await page.getByRole('button',{name:'Visit Framewake Bay',exact:true}).click();
  await expect(page.locator('main')).toHaveAttribute('data-current-port','3');
  await expect(page.locator('.portfolio-dialog')).toBeVisible();
  await expect(page.locator('.collection-port')).toContainText('Framewake Bay');
});

test('3D miniature islands navigate to the matching renamed destination',async({page})=>{
  const world=await openWorld(page);
  const miniatures=page.getByTestId('miniature-islands');
  await expect(miniatures).toHaveAttribute('data-ready','true',{timeout:30000});
  await expect(miniatures).toHaveAttribute('data-renderer','webgl');
  await expect(miniatures).toHaveAttribute('data-islands','4');
  await expect(world).toHaveAttribute('data-beveled-titles','3');
  for(const [index,name] of [[2,'Pigment Atoll'],[3,'Framewake Bay'],[1,'Bytehaven']] as const){
    const island=page.getByRole('button',{name:`Visit ${name}`,exact:true});
    await island.locator('.mini-island-slot').click();
    await expect(page.locator('main')).toHaveAttribute('data-current-port',String(index));
    await expect(island).toHaveAttribute('aria-current','step');
    await expect(page.locator('.portfolio-dialog')).toBeVisible();
    await expect(page.locator('.collection-port')).toHaveText(new RegExp(name));
    await page.getByRole('button',{name:'Close portfolio'}).click();
  }
});
