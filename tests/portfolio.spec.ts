import { test, expect, type Page } from '@playwright/test';

async function openWorld(page:Page){
  await page.goto('/',{waitUntil:'networkidle'});
  const world=page.getByTestId('voyage-world');
  await expect(world).toHaveAttribute('data-ready','true',{timeout:30000});
  await expect(world).toHaveAttribute('data-route','0.0000');
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
  await expect(page.getByRole('status')).toContainText('Sailing to Bytehaven');
  await expect(page.locator('.portfolio-dialog')).not.toBeVisible();
  await expect.poll(async()=>Number(await world.getAttribute('data-route'))).toBeGreaterThan(.12);
  const first=await world.evaluate(el=>({route:Number(el.dataset.route),x:Number(el.dataset.shipX),z:Number(el.dataset.shipZ)}));
  await expect.poll(async()=>Number(await world.getAttribute('data-route'))).toBeGreaterThan(first.route+.13);
  const second=await world.evaluate(el=>({route:Number(el.dataset.route),x:Number(el.dataset.shipX),z:Number(el.dataset.shipZ)}));
  expect(second.x).toBeGreaterThan(first.x);
  expect(Math.abs(second.z-first.z)).toBeGreaterThan(.01);
  await expect(page.locator('main')).toHaveAttribute('data-current-port','1',{timeout:15000});
  await expect(world).toHaveAttribute('data-ship-x','11.000');
  await expect(page.locator('.portfolio-dialog')).toBeVisible();
  await expect(page.locator('.dialog-category-nav .selected')).toContainText('Bytehaven');
});

test('the journey visits each island in order and returns home',async({page})=>{
  await openWorld(page);
  await page.getByRole('button',{name:'Sail to Bytehaven',exact:true}).click();
  const modal=page.locator('.portfolio-dialog');
  await expect(modal).toBeVisible();
  await expect(modal.locator('.selected')).toContainText('Bytehaven');
  await modal.getByRole('button',{name:'Sail to the next island'}).click();
  await expect(modal.locator('.selected')).toContainText('Pigment Atoll');
  await expect(page.locator('main')).toHaveAttribute('data-current-port','2');
  await modal.getByRole('button',{name:'Sail to the next island'}).click();
  await expect(modal.locator('.selected')).toContainText('Framewake Bay');
  await expect(page.locator('main')).toHaveAttribute('data-current-port','3');
  await modal.getByRole('button',{name:'Sail to the next island'}).click();
  await expect(page.locator('main')).toHaveAttribute('data-current-port','0');
  await expect(modal).not.toBeVisible();
  await expect(page.getByRole('heading',{level:1})).toHaveText('IZA YUNUSANDHIKA.');
});

test('project slides alternate sides, wrap, and support keyboard controls',async({page})=>{
  await openWorld(page);
  await page.getByRole('button',{name:'Visit Bytehaven',exact:true}).click();
  const modal=page.locator('.portfolio-dialog');
  await expect(modal).toBeVisible();
  await expect(modal.getByRole('heading')).toHaveText('Ideas, brought to life.');
  const firstMedia=await modal.locator('.project-media').boundingBox(),firstText=await modal.locator('.project-details').boundingBox();
  expect(firstMedia!.x).toBeLessThan(firstText!.x);
  await modal.getByRole('button',{name:'Next project',exact:true}).click();
  await expect(modal.getByRole('heading')).toHaveText('A smoother everyday.');
  const secondMedia=await modal.locator('.project-media').boundingBox(),secondText=await modal.locator('.project-details').boundingBox();
  expect(secondMedia!.x).toBeGreaterThan(secondText!.x);
  await page.keyboard.press('ArrowRight');
  await expect(modal.getByRole('heading')).toHaveText('The next discovery.');
  await page.keyboard.press('ArrowRight');
  await expect(modal.getByRole('heading')).toHaveText('Ideas, brought to life.');
  await page.keyboard.press('Escape');
  await expect(modal).not.toBeVisible();
  await expect(page.getByRole('heading',{level:1})).toContainText('Good ideas.');
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
    await expect(modal.getByRole('heading')).toHaveText('A world of its own.');
    const slide=modal.locator('.project-slide');
    await slide.evaluate(el=>{const touch=new Touch({identifier:0,target:el,clientX:300,clientY:150});el.dispatchEvent(new TouchEvent('touchstart',{bubbles:true,changedTouches:[touch]}));});
    await slide.evaluate(el=>{const touch=new Touch({identifier:0,target:el,clientX:100,clientY:150});el.dispatchEvent(new TouchEvent('touchend',{bubbles:true,changedTouches:[touch]}));});
    await expect(modal.getByRole('heading')).toHaveText('An identity with character.');
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
  await page.goto('/',{waitUntil:'networkidle'});
  await expect(page.locator('.world-fallback')).toBeVisible();
  await page.getByRole('button',{name:'Visit Framewake Bay',exact:true}).click();
  await expect(page.locator('main')).toHaveAttribute('data-current-port','3');
  await expect(page.locator('.portfolio-dialog')).toBeVisible();
  await expect(page.locator('.dialog-category-nav .selected')).toContainText('Framewake Bay');
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
    await expect(page.locator('.dialog-category-nav .selected')).toHaveText(new RegExp(name));
    await page.getByRole('button',{name:'Close portfolio'}).click();
  }
});
