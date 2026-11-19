import {test,expect} from '@playwright/test';

for(const [device,width,height]of [['desktop',1440,1000],['phone',390,844]]as const){
 test(device+': ship doors close from both sides, open on their hinges, and zoom into About Me',async({page})=>{
  test.setTimeout(90000);await page.setViewportSize({width,height});await page.emulateMedia({reducedMotion:'no-preference'});
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
  await page.goto('/',{waitUntil:'networkidle'});
  const prologue=page.getByTestId('voyage-prologue'),begin=page.getByRole('button',{name:'Begin the voyage',exact:true});
  await expect(begin).toBeEnabled({timeout:30000});await expect(prologue).toHaveAttribute('data-phase','idle');
  await expect(page.getByTestId('cloud-loading')).not.toBeAttached();await expect(page.getByTestId('voyage-world')).not.toBeAttached();
  await expect(page.locator('.pirate-cargo,.cargo-fallback,.cargo-canvas,.mountain-cloud-bank,.summit-cloud-gate,.summit-white-fade,.pirate-pier-mist')).toHaveCount(0);
  const harbor=page.getByTestId('pirate-environment-harbor'),gate=page.getByTestId('gate-environment');
  await expect(page.getByTestId('pirate-gate')).toHaveAttribute('data-renderer','webgl');
  await expect(gate).toHaveAttribute('data-style','captains-double-door');await expect(gate.locator('canvas')).toBeVisible();
  await expect(harbor).toHaveAttribute('data-ocean-model','gerstner-turquoise');
  const harborColor=await harbor.getAttribute('data-water-color');
  expect(harborColor).toBe('#73b1ae');
  expect(Number(await harbor.getAttribute('data-keel-clearance'))).toBeLessThan(-.5);
  expect(Number(await harbor.getAttribute('data-deck-clearance'))).toBeGreaterThan(.5);
  const leftStart=Number(await gate.getAttribute('data-left-x')),rightStart=Number(await gate.getAttribute('data-right-x'));
  expect(leftStart).toBeLessThan(-1);expect(rightStart).toBeGreaterThan(1);
  await expect.poll(()=>page.locator('.summit-portrait').evaluate(el=>Number(getComputedStyle(el).opacity))).toBe(1);
  expect(await page.locator('.summit-portrait>img').evaluate(el=>getComputedStyle(el).filter)).toBe('brightness(0)');
  const birds=page.getByTestId('summit-birds');await expect(birds.locator('img')).toHaveCount(3);
  await expect(birds.locator('img').first()).toHaveAttribute('src','/textures/intro-seagull-atlas.webp');
  await page.screenshot({path:`test-results/prologue-silhouette-${device}.png`});
  await page.evaluate(()=>{
   const sample={scroll:0,closed:false,cabinSwitchCovered:false,cabinSeen:false,hinges:false,maxZoom:1,clear:false,started:0,welcomeSeen:false,welcomeLost:false,welcomeClosingFrames:0,rigReady:false,rigStart:null as {x:number;y:number;frameX:number;frameY:number}|null,rigMaxShift:0};
   (window as unknown as {gateSample:typeof sample}).gateSample=sample;
   const frame=()=>{
    const root=document.querySelector('[data-testid="voyage-prologue"]'),gate=document.querySelector('[data-testid="gate-environment"]') as HTMLElement|null;
    if(!root)return;
    if(root.getAttribute('data-cabin-visible')==='true'){
     const rig=document.querySelector('.prologue-portrait-rig') as HTMLElement,svg=rig.querySelector('svg')!,portrait=rig.querySelector('.prologue-about-portrait')!;
     const link=rig.querySelectorAll('[data-chain-link="front"]')[8].getBoundingClientRect(),photo=portrait.getBoundingClientRect();
     if(!sample.rigStart){
      sample.rigStart={x:link.x,y:link.y,frameX:photo.x,frameY:photo.y};
      const style=getComputedStyle(portrait),room=getComputedStyle(document.querySelector('.prologue-about')!);
      sample.rigReady=Number(style.opacity)===1&&style.transform==='none'&&room.transform==='none'&&Math.abs(Number(svg.getAttribute('viewBox')!.split(' ')[2])-rig.getBoundingClientRect().width)<.1&&Number(gate?.dataset.openProgress||0)<.001;
     }else{
      sample.rigMaxShift=Math.max(sample.rigMaxShift,Math.hypot(link.x-sample.rigStart.x,link.y-sample.rigStart.y),Math.hypot(photo.x-sample.rigStart.frameX,photo.y-sample.rigStart.frameY));
     }
    }
    if(root.getAttribute('data-phase')==='about')return;
    const phase=root.getAttribute('data-phase'),welcome=document.querySelector('.summit-welcome')!;
    const welcomeStyle=getComputedStyle(welcome),welcomeVisible=Number(welcomeStyle.opacity)>.99&&welcomeStyle.visibility==='visible'&&welcome.getAttribute('aria-hidden')==='false';
    if(phase==='welcoming'&&welcomeVisible)sample.welcomeSeen=true;
    if(sample.welcomeSeen&&!sample.closed&&gate?.dataset.covered!=='true'&&(phase==='welcoming'||phase==='revealing')){
     if(!welcomeVisible)sample.welcomeLost=true;
     if(phase==='revealing')sample.welcomeClosingFrames++;
    }
    if(phase==='revealing'&&gate){
     if(!sample.started)sample.started=performance.now();
     sample.scroll=Math.max(sample.scroll,Math.abs(scrollY));
     const covered=gate.dataset.covered==='true';sample.closed ||= covered;
     sample.hinges ||= Number(gate.dataset.leftAngle)<-.2&&Number(gate.dataset.rightAngle)>.2;
     sample.maxZoom=Math.max(sample.maxZoom,Number(gate.dataset.zoom||1));sample.clear ||= gate.dataset.stage==='clear';
     const style=getComputedStyle(document.querySelector('.prologue-about')!);
     if(!sample.cabinSeen&&style.visibility==='visible'&&Number(style.opacity)>.9){sample.cabinSeen=true;sample.cabinSwitchCovered=covered;}
    }
    requestAnimationFrame(frame);
   };requestAnimationFrame(frame);
  });
  const shipBefore=await harbor.evaluate(el=>Number(el.getAttribute('data-ship-cycle'))+Number(el.getAttribute('data-ship-progress')));
  const fleetBefore=JSON.parse((await harbor.getAttribute('data-fleet-x'))!) as number[];
  await begin.click();await expect(prologue).toHaveAttribute('data-phase','welcoming');
  await expect(gate).toHaveAttribute('data-close-progress','0.0000');
  await expect.poll(()=>page.locator('.summit-portrait>img').evaluate(el=>getComputedStyle(el).filter),{timeout:4000}).toBe('brightness(1)');
  await expect.poll(()=>page.locator('.summit-welcome').evaluate(el=>Number(getComputedStyle(el).opacity))).toBeGreaterThan(.9);
  await page.waitForTimeout(700);
  await expect(prologue).toHaveAttribute('data-phase','welcoming');await expect(gate).toHaveAttribute('data-close-progress','0.0000');
  const shipDuring=await harbor.evaluate(el=>Number(el.getAttribute('data-ship-cycle'))+Number(el.getAttribute('data-ship-progress')));
  expect(shipDuring-shipBefore).toBeGreaterThan(.04);
  const fleetDuring=JSON.parse((await harbor.getAttribute('data-fleet-x'))!) as number[];
  expect(fleetDuring.every((x,i)=>Math.abs(x-fleetBefore[i])>.5)).toBe(true);
  await page.screenshot({path:`test-results/prologue-welcome-${device}.png`});
  await expect(prologue).toHaveAttribute('data-phase','revealing',{timeout:5000});
  await expect.poll(async()=>Number(await gate.getAttribute('data-close-progress'))).toBeGreaterThan(.25);
  await expect(page.locator('.summit-welcome')).toHaveAttribute('aria-hidden','false');
  expect(await page.locator('.summit-welcome').evaluate(el=>Number(getComputedStyle(el).opacity))).toBe(1);
  expect(Number(await gate.getAttribute('data-left-x'))).toBeGreaterThan(leftStart);
  expect(Number(await gate.getAttribute('data-right-x'))).toBeLessThan(rightStart);
  await page.screenshot({path:`test-results/prologue-gate-closing-${device}.png`});
  await expect.poll(()=>page.evaluate(()=>(window as unknown as {gateSample:{closed:boolean}}).gateSample.closed),{timeout:4000}).toBe(true);
  await expect(prologue).toHaveAttribute('data-cabin-visible','true');
  await expect(page.locator('.summit-welcome')).toHaveAttribute('aria-hidden','true');
  await expect.poll(()=>page.locator('.summit-welcome').evaluate(el=>Number(getComputedStyle(el).opacity))).toBe(0);
  await page.screenshot({path:`test-results/prologue-gate-closed-${device}.png`});
  await expect.poll(async()=>Number(await gate.getAttribute('data-open-progress'))).toBeGreaterThan(.35);
  expect(Number(await gate.getAttribute('data-left-angle'))).toBeLessThan(-.3);
  expect(Number(await gate.getAttribute('data-right-angle'))).toBeGreaterThan(.3);
  expect(Number(await gate.getAttribute('data-zoom'))).toBeGreaterThan(1.1);
  await page.screenshot({path:`test-results/prologue-gate-opening-${device}.png`});
  await expect.poll(()=>page.evaluate(()=>(window as unknown as {gateSample:{clear:boolean}}).gateSample.clear),{timeout:4000}).toBe(true);
  await expect(prologue).toHaveAttribute('data-phase','about',{timeout:8000});
  const sample=await page.evaluate(()=>(window as unknown as {gateSample:{scroll:number;closed:boolean;cabinSwitchCovered:boolean;cabinSeen:boolean;hinges:boolean;maxZoom:number;clear:boolean;started:number;welcomeSeen:boolean;welcomeLost:boolean;welcomeClosingFrames:number;rigReady:boolean;rigMaxShift:number}}).gateSample);
  expect(sample.scroll).toBe(0);expect(sample.closed).toBe(true);expect(sample.cabinSwitchCovered).toBe(true);
  expect(sample.welcomeSeen).toBe(true);expect(sample.welcomeLost).toBe(false);expect(sample.welcomeClosingFrames).toBeGreaterThan(5);
  expect(sample.rigReady).toBe(true);expect(sample.rigMaxShift).toBeLessThan(2);
  expect(sample.hinges).toBe(true);expect(sample.maxZoom).toBeGreaterThan(2.1);expect(sample.clear).toBe(true);
  expect(await page.evaluate(()=>performance.now())-sample.started).toBeGreaterThanOrEqual(5000);
  const shipAfter=await harbor.evaluate(el=>Number(el.getAttribute('data-ship-cycle'))+Number(el.getAttribute('data-ship-progress')));
  expect(shipAfter-shipBefore).toBeGreaterThan(.08);
  await expect(page.getByTestId('pirate-gate')).toBeHidden();
  const about=page.getByTestId('prologue-about');await expect(about).toBeInViewport({ratio:.95});
  await expect(about.getByRole('heading')).toHaveText(/Iza Yunus[\s\S]*Andhika/);await expect(page.locator('#prologue-about-name')).toBeFocused();
  const portrait=page.getByTestId('about-portrait-frame');await expect(portrait).toHaveAttribute('data-frame-style','captains-timber');
  expect(await portrait.locator('.prologue-portrait-window').evaluate(el=>getComputedStyle(el).overflow)).toBe('hidden');
  expect(await portrait.locator('img').evaluate(el=>getComputedStyle(el).filter)).toContain('drop-shadow');
  await expect(page.getByTestId('pirate-cabin')).toHaveAttribute('data-renderer','webgl');
  // A hidden harbor must stop GPU work while the visible cabin continues moving.
  await expect(harbor).toHaveAttribute('data-suspended','true');
  const frozen=await harbor.getAttribute('data-frame-time');
  const cabin=page.getByTestId('pirate-environment-cabin'),cabinFrame=await cabin.getAttribute('data-frame-time');
  await expect.poll(()=>cabin.getAttribute('data-frame-time')).not.toBe(cabinFrame);
  expect(await harbor.getAttribute('data-frame-time')).toBe(frozen);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:`test-results/prologue-about-${device}.png`});
  await page.getByRole('button',{name:'Explore my portfolio',exact:true}).click();
  await expect(prologue).not.toBeAttached();await expect(page.getByTestId('cloud-loading')).toBeVisible();
  await expect(page.locator('main')).toHaveAttribute('data-intro-complete','true',{timeout:30000});
  await expect(page.getByTestId('voyage-world')).toHaveAttribute('data-renderer','webgl');
  await expect(page.getByTestId('voyage-world')).toHaveAttribute('data-water-color',harborColor!);
  await page.getByRole('button',{name:'Visit Bytehaven',exact:true}).click();await expect(page.locator('.portfolio-dialog')).toBeVisible({timeout:20000});
  expect(errors).toEqual([]);
 });
}

test('reduced motion and keyboard navigation open About Me directly and reload restores the harbor',async({page})=>{
 await page.goto('/',{waitUntil:'networkidle'});
 const begin=page.getByRole('button',{name:'Begin the voyage',exact:true});await expect(begin).toBeEnabled({timeout:30000});
 for(const selector of ['.cloud-bird-sprite img','.cloud-bird-flight'])expect(await page.locator(selector).first().evaluate(el=>getComputedStyle(el).animationName)).toBe('none');
 await begin.focus();await page.keyboard.press('Enter');
 await expect(page.getByTestId('voyage-prologue')).toHaveAttribute('data-phase','about');
 await expect(page.locator('#prologue-about-name')).toBeFocused();expect(await page.evaluate(()=>scrollY)).toBe(0);
 const enter=page.getByRole('button',{name:'Explore my portfolio',exact:true});await enter.focus();await page.keyboard.press('Enter');
 await expect(page.locator('main')).toHaveAttribute('data-intro-complete','true',{timeout:30000});
 expect(await page.evaluate(()=>document.documentElement.style.overflow)).not.toBe('hidden');
 await page.reload();
 await expect(page.getByTestId('voyage-prologue')).toHaveAttribute('data-phase','idle');
 await expect(page.getByTestId('pirate-harbor')).toBeVisible();await expect(page.getByTestId('cloud-loading')).not.toBeAttached();
});

for(const [device,width,height]of [['desktop',1440,1000],['phone',390,844]] as const){
 test(device+': slow 3D loading starts on the silhouette and real harbor view without a second opening',async({page})=>{
  await page.setViewportSize({width,height});await page.emulateMedia({reducedMotion:'no-preference'});
  let release=()=>{};
  const modelReady=new Promise<void>(resolve=>{release=resolve;});
  await page.route('**/lib/prologue-pirate.ts*',async route=>{await modelReady;await route.continue();});
  try{
   await page.goto('/',{waitUntil:'domcontentloaded'});
   const harbor=page.getByTestId('pirate-harbor'),portrait=page.locator('.summit-portrait');
   const poster=harbor.locator('.pirate-harbor-poster'),image=poster.locator('img');
   await expect(harbor).toHaveAttribute('data-renderer','pending');
   await expect(poster).toBeVisible();
   await expect.poll(()=>image.evaluate((el:HTMLImageElement)=>el.complete&&el.naturalWidth>0)).toBe(true);
   expect(await image.evaluate((el:HTMLImageElement)=>el.currentSrc)).toContain('harbor-opening-'+device+'.jpg');
   await expect(harbor.locator('.pirate-scene-fallback,.pirate-horizon,.pirate-fallback-pier')).toHaveCount(0);
   await expect.poll(()=>portrait.locator('img').evaluate((el:HTMLImageElement)=>el.complete&&el.naturalWidth>0)).toBe(true);
   expect(await portrait.evaluate(el=>Number(getComputedStyle(el).opacity))).toBe(1);
   expect(await portrait.locator('img').evaluate(el=>getComputedStyle(el).filter)).toBe('brightness(0)');
   expect(await portrait.evaluate(el=>getComputedStyle(el,'::before').content)).toBe('none');
   await expect(page.getByText('Preparing the ship',{exact:true})).toHaveCount(0);
   await expect(page.getByRole('button',{name:'Begin the voyage',exact:true})).toBeDisabled();
   const before=await portrait.boundingBox();
   await page.screenshot({path:`test-results/prologue-first-paint-${device}.png`});
   release();
   await expect(harbor).toHaveAttribute('data-renderer','webgl',{timeout:30000});
   await expect(harbor.locator('canvas')).toBeVisible();await expect(poster).toBeHidden();
   await expect(page.getByRole('button',{name:'Begin the voyage',exact:true})).toBeEnabled({timeout:30000});
   expect(await portrait.boundingBox()).toEqual(before);
   expect(await portrait.evaluate(el=>Number(getComputedStyle(el).opacity))).toBe(1);
  }finally{release();}
 });
}

test('3D failure keeps the pirate scenery and About Me navigation usable',async({page})=>{
 await page.route('**/lib/prologue-pirate.ts*',route=>route.abort());
 await page.goto('/',{waitUntil:'networkidle'});
 const begin=page.getByRole('button',{name:'Begin the voyage',exact:true});
 await expect(begin).toBeEnabled({timeout:30000});
 await expect(page.getByTestId('pirate-harbor')).toHaveAttribute('data-renderer','fallback');
 await expect(page.getByTestId('pirate-harbor').locator('.pirate-harbor-poster')).toBeVisible();
 await begin.click();
 await expect(page.getByTestId('voyage-prologue')).toHaveAttribute('data-phase','about');
 await expect(page.getByTestId('pirate-cabin')).toHaveAttribute('data-renderer','fallback');
 await expect(page.getByTestId('pirate-cabin').locator('.pirate-scene-fallback')).toBeVisible();
 await expect(page.getByRole('heading',{name:'Iza Yunus Andhika.'})).toBeVisible();
 await expect(page.getByRole('button',{name:'Explore my portfolio',exact:true})).toBeEnabled();
});

test('harbor ship sails right, loops outside the frame, and water keeps moving',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.clock.install();
 await page.goto('/',{waitUntil:'networkidle'});
 await expect(page.getByRole('button',{name:'Begin the voyage',exact:true})).toBeEnabled({timeout:30000});
 const harbor=page.getByTestId('pirate-environment-harbor');
 await expect(harbor).toHaveAttribute('data-fleet-types','sloop,schooner,fishing-boat');
 await expect(harbor).toHaveAttribute('data-island-count','5');
 const before=Number(await harbor.getAttribute('data-ship-x'));
 const waveBefore=await harbor.getAttribute('data-wave-height');
 await page.clock.fastForward(1500);
 await expect.poll(async()=>Number(await harbor.getAttribute('data-ship-x'))).toBeGreaterThan(before);
 await expect.poll(()=>harbor.getAttribute('data-wave-height')).not.toBe(waveBefore);
 // Run to just before the right edge reset, without waiting an entire real voyage.
 const seconds=Number(await harbor.getAttribute('data-ship-loop-seconds'));
 const progress=Number(await harbor.getAttribute('data-ship-progress'));
 const cycle=Number(await harbor.getAttribute('data-ship-cycle'));
 await page.clock.fastForward(Math.max(100,(.994-progress)*seconds*1000));
 await expect.poll(async()=>Number(await harbor.getAttribute('data-ship-progress'))).toBeGreaterThan(.98);
 expect(Number(await harbor.getAttribute('data-ship-screen-x'))).toBeGreaterThan(1);
 await page.clock.fastForward(1000);
 await expect.poll(async()=>Number(await harbor.getAttribute('data-ship-cycle'))).toBe(cycle+1);
 expect(Number(await harbor.getAttribute('data-ship-screen-x'))).toBeLessThan(-1);
 await expect(page.getByTestId('voyage-prologue')).toHaveAttribute('data-phase','idle');
});

test('reduced motion keeps the passing ship and ocean still',async({page})=>{
 await page.goto('/',{waitUntil:'networkidle'});
 await expect(page.getByRole('button',{name:'Begin the voyage',exact:true})).toBeEnabled({timeout:30000});
 const harbor=page.getByTestId('pirate-environment-harbor');
 const initial=await harbor.evaluate(el=>[el.getAttribute('data-ship-x'),el.getAttribute('data-wave-height'),el.getAttribute('data-fleet-x')]);
 await page.waitForTimeout(300);
 expect(await harbor.evaluate(el=>[el.getAttribute('data-ship-x'),el.getAttribute('data-wave-height'),el.getAttribute('data-fleet-x')])).toEqual(initial);
});

test('the passing hull stays partly submerged while following the wave surface',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});await page.clock.install();
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
 await page.goto('/',{waitUntil:'networkidle'});
 await expect(page.getByRole('button',{name:'Begin the voyage',exact:true})).toBeEnabled({timeout:30000});
 const harbor=page.getByTestId('pirate-environment-harbor');
 for(const milliseconds of [500,2400,7600,13000]){
  await page.clock.fastForward(milliseconds);
  expect(Number(await harbor.getAttribute('data-keel-clearance'))).toBeLessThan(-.5);
  expect(Number(await harbor.getAttribute('data-deck-clearance'))).toBeGreaterThan(.5);
 }
 await expect(harbor).toHaveAttribute('data-ocean-model','gerstner-turquoise');
 expect(errors).toEqual([]);
});

test('the ship-door transition still opens About Me if its 3D renderer cannot load',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.route('**/lib/pirate-gate.ts*',route=>route.abort());
 await page.goto('/',{waitUntil:'networkidle'});
 const begin=page.getByRole('button',{name:'Begin the voyage',exact:true});
 await expect(begin).toBeEnabled({timeout:30000});
 await expect(page.getByTestId('pirate-gate')).toHaveAttribute('data-renderer','fallback');
 await expect(page.locator('.pirate-cargo')).toHaveCount(0);
 await begin.click();
 await expect(page.getByTestId('voyage-prologue')).toHaveAttribute('data-phase','revealing',{timeout:6000});
 await expect(page.locator('.summit-welcome')).toHaveAttribute('aria-hidden','false');
 await page.waitForTimeout(700);
 expect(await page.locator('.summit-welcome').evaluate(el=>Number(getComputedStyle(el).opacity))).toBe(1);
 await expect(page.getByTestId('voyage-prologue')).toHaveAttribute('data-cabin-visible','false');
 await expect(page.getByTestId('voyage-prologue')).toHaveAttribute('data-cabin-visible','true',{timeout:4000});
 await expect(page.locator('.summit-welcome')).toHaveAttribute('aria-hidden','true');
 expect(await page.locator('.summit-welcome').evaluate(el=>Number(getComputedStyle(el).opacity))).toBe(0);
 await expect(page.getByTestId('voyage-prologue')).toHaveAttribute('data-phase','about',{timeout:8000});
 await expect(page.getByRole('button',{name:'Explore my portfolio',exact:true})).toBeEnabled();
 await expect(page.getByTestId('pirate-gate')).toBeHidden();
});
