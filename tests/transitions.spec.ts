import {enterPortfolio} from './helpers/enter-portfolio';
import { test, expect, type Page } from '@playwright/test';

async function openWorld(page:Page){
  await page.goto('/',{waitUntil:'networkidle'});await enterPortfolio(page);
  await expect(page.locator('.voyage-app')).toHaveAttribute('data-intro-complete','true',{timeout:30000});
}
async function geometry(page:Page){
  return page.evaluate(()=>{
    const panel=document.querySelector<HTMLElement>('.captain-panel')!,world=document.querySelector<HTMLElement>('.world-container')!,main=document.querySelector<HTMLElement>('.voyage-app')!;
    return {height:main.offsetHeight,panelHeight:panel.offsetHeight,panelTop:panel.getBoundingClientRect().top+scrollY,worldHeight:world.clientHeight,worldTop:world.getBoundingClientRect().top+scrollY};
  });
}
for(const [name,width,height]of [['desktop',1440,1000],['phone',390,844]]as const){
  test(name+': chapter changes keep the copy and 3D stage in the same layout',async({page})=>{
    await page.setViewportSize({width,height});await openWorld(page);
    const initial=await geometry(page);
    for(const [port,label]of [[1,'Bytehaven'],[2,'Pigment Atoll'],[3,'Framewake Bay'],[0,'Home waters']]as const){
      await page.getByRole('button',{name:'Visit '+label,exact:true}).click();
      await expect(page.locator('.voyage-app')).toHaveAttribute('data-current-port',String(port));
      if(port){
        await expect(page.locator('.portfolio-dialog:not(.certificate-dialog)')).toBeVisible();
        await page.getByRole('button',{name:'Close portfolio',exact:true}).click();
      }
      const next=await geometry(page);
      for(const key of ['height','panelHeight','panelTop','worldHeight','worldTop']as const)expect(Math.abs(next[key]-initial[key]),key+' at '+label).toBeLessThan(1);
      await expect(page.getByRole('heading',{level:1})).toHaveCount(1);
      await expect(page.locator('.captain-panel-layer[data-active="true"]')).toHaveCount(1);
    }
  });
}
test('left-hand portfolio copy fades in while the paper adapts to the current page',async({page})=>{
  await openWorld(page);
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.getByRole('button',{name:'Visit Bytehaven',exact:true}).click();
  const dialog=page.locator('.portfolio-dialog:not(.certificate-dialog)');
  await expect(dialog).toHaveAttribute('data-scroll-phase','open',{timeout:10000});
  const sheet=dialog.locator('.dialog-shell');
  await sheet.evaluate(element=>element.scrollTop=element.scrollHeight);
  const before=await dialog.evaluate(element=>{const r=element.getBoundingClientRect();return {top:r.top,height:r.height,scroll:element.querySelector('.dialog-shell')!.scrollTop};});
  await dialog.getByRole('button',{name:'Next media',exact:true}).click();
  await expect(dialog.getByRole('heading')).toHaveText('Four needs. One place to start.');
  const detail=dialog.locator('.project-details');
  const midpoint=await detail.evaluate(element=>{
    const animation=element.getAnimations().find(animation=>animation instanceof CSSAnimation&&animation.animationName==='project-copy-enter-left');
    if(!animation)throw new Error('Missing copy transition');
    animation.pause();animation.currentTime=220;
    const style=getComputedStyle(element),matrix=new DOMMatrixReadOnly(style.transform);
    const result={opacity:Number(style.opacity),x:matrix.m41};
    animation.finish();return result;
  });
  expect(midpoint.opacity).toBeGreaterThan(0);expect(midpoint.opacity).toBeLessThan(1);expect(midpoint.x).toBeLessThan(0);
  const after=await dialog.evaluate(element=>{const r=element.getBoundingClientRect();return {top:r.top,height:r.height,scroll:element.querySelector('.dialog-shell')!.scrollTop};});
  expect(before.scroll).toBeGreaterThan(0);
  expect(after.scroll).toBe(0);
  expect(after.height).toBeLessThan(before.height);
  await dialog.getByRole('button',{name:'Previous media',exact:true}).click();
  await expect(dialog.getByRole('heading')).toHaveText('ANJEMIN, made for campus life.');
});


for(const [name,width,height]of [['desktop',1440,1000],['phone',390,844]]as const){
  test(name+': portfolio pages use their own content height without retaining overview space',async({page})=>{
    await page.setViewportSize({width,height});await openWorld(page);
    await page.getByRole('button',{name:'Visit Bytehaven',exact:true}).click();
    const dialog=page.locator('.portfolio-dialog:not(.certificate-dialog)');
    await expect(dialog).toHaveAttribute('data-scroll-phase','open');
    const measure=()=>dialog.evaluate(element=>{
      const panel=element.querySelector<HTMLElement>('.portfolio-panel')!;
      const slide=element.querySelector<HTMLElement>('.project-slide')!;
      const tabs=element.querySelector<HTMLElement>('.dialog-category-nav')!;
      const footer=element.querySelector<HTMLElement>('.dialog-bottom')!;
      const sheet=element.querySelector<HTMLElement>('.dialog-shell')!;
      return {panel:panel.offsetHeight,slide:slide.offsetHeight,scroll:sheet.scrollTop,
        paper:element.getBoundingClientRect().height,sheet:sheet.getBoundingClientRect().height,
        gapAbove:slide.getBoundingClientRect().top-tabs.getBoundingClientRect().bottom,
        gapBelow:footer.getBoundingClientRect().top-slide.getBoundingClientRect().bottom};
    });
    await expect.poll(()=>dialog.locator('img').evaluate((img:HTMLImageElement)=>img.naturalWidth)).toBeGreaterThan(0);
    const overview=await measure();
    await dialog.locator('.dialog-shell').evaluate(el=>el.scrollTop=el.scrollHeight);
    for(let index=0;index<3;index++){
      await dialog.getByRole('button',{name:'Next media',exact:true}).click();
      await expect.poll(()=>dialog.locator('img').evaluate((img:HTMLImageElement)=>img.complete&&img.naturalWidth>0)).toBe(true);
      const current=await measure();
      expect(current.panel).toBeLessThan(overview.panel);
      expect(Math.abs(current.panel-current.slide)).toBeLessThan(2);
      expect(Math.abs(current.gapAbove)).toBeLessThan(2);
      expect(current.gapBelow).toBeGreaterThanOrEqual(0);
      expect(current.gapBelow).toBeLessThan(30);
      expect(current.scroll).toBe(0);
      expect(current.paper).toBeCloseTo(current.sheet,0);
      if(index===0)await page.screenshot({path:`test-results/compact-portfolio-${name}.png`});
      expect(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
    }
    await dialog.getByRole('tab',{name:'Portfolio B'}).click();
    expect((await measure()).scroll).toBe(0);
    await dialog.getByRole('tab',{name:'Portfolio A'}).click();
    expect((await measure()).panel).toBeCloseTo(overview.panel,0);
    await expect(dialog.getByRole('heading')).toHaveText('ANJEMIN, made for campus life.');
  });
}
