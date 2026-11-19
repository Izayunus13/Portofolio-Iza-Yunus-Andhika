import {test,expect,type Page} from '@playwright/test';

test.use({launchOptions:{...(process.platform==='win32'?{channel:'msedge'}:{}),args:['--autoplay-policy=no-user-gesture-required']}});

async function ready(page:Page){
 await expect(page.locator('.voyage-sound-dock')).toHaveAttribute('data-audio-ready','true');
 await expect(page.getByRole('button',{name:'Begin the voyage',exact:true})).toBeEnabled({timeout:30000});
}
async function playing(page:Page){
 await expect.poll(()=>page.getByTestId('voyage-music').evaluate((audio:HTMLAudioElement)=>!audio.paused&&audio.readyState>=2),{timeout:15000}).toBe(true);
}

test('one soundtrack and on-off switch persist from the silhouette through About Me to the portfolio',async({page})=>{
 await page.goto('/',{waitUntil:'networkidle'});await ready(page);
 const dock=page.locator('.voyage-sound-dock'),toggle=dock.locator('[data-sound-toggle]'),music=page.getByTestId('voyage-music');
 await expect(toggle).toHaveAttribute('aria-pressed','true');await expect(toggle).toBeVisible();
 await toggle.click();await expect(toggle).toHaveAttribute('aria-pressed','false');
 await expect(page.getByTestId('voyage-prologue')).toHaveAttribute('data-phase','idle');
 await expect.poll(()=>music.evaluate((audio:HTMLAudioElement)=>audio.paused)).toBe(true);
 await toggle.click();await playing(page);
 const original=await music.elementHandle();
 await page.getByRole('button',{name:'Begin the voyage',exact:true}).click();
 await expect(page.getByTestId('voyage-prologue')).toHaveAttribute('data-phase','about');
 await expect(toggle).toBeVisible();expect(await original!.evaluate(audio=>audio.isConnected)).toBe(true);
 await toggle.click();await expect.poll(()=>music.evaluate((audio:HTMLAudioElement)=>audio.paused)).toBe(true);
 await expect(page.getByTestId('voyage-prologue')).toHaveAttribute('data-phase','about');
 await toggle.click();await playing(page);
 const before=await music.evaluate((audio:HTMLAudioElement)=>audio.currentTime);
 await page.getByRole('button',{name:'Explore my portfolio',exact:true}).click();
 await expect(page.locator('.voyage-app')).toHaveAttribute('data-intro-complete','true',{timeout:30000});
 await expect(music).toHaveCount(1);expect(await original!.evaluate(audio=>audio.isConnected)).toBe(true);
 expect(await music.evaluate((audio:HTMLAudioElement)=>audio.currentTime)).toBeGreaterThanOrEqual(before);
 await expect(toggle).toHaveAttribute('aria-pressed','true');
 await page.getByRole('button',{name:'Meet the captain',exact:true}).click();
 await expect(page.locator('.about-dialog [data-sound-toggle]')).toHaveAttribute('aria-pressed','true');
});

test('a saved mute remains off in the silhouette, About Me and the main portfolio',async({page})=>{
 await page.goto('/',{waitUntil:'networkidle'});await ready(page);
 const toggle=page.locator('.voyage-sound-dock [data-sound-toggle]'),music=page.getByTestId('voyage-music');
 await toggle.click();expect(await page.evaluate(()=>localStorage.getItem('iza-voyage-sound'))).toBe('off');
 await page.reload({waitUntil:'networkidle'});await ready(page);
 await expect(toggle).toHaveAttribute('aria-pressed','false');
 expect(await music.evaluate((audio:HTMLAudioElement)=>audio.paused)).toBe(true);
 await page.getByRole('button',{name:'Begin the voyage',exact:true}).click();
 await expect(page.getByTestId('voyage-prologue')).toHaveAttribute('data-phase','about');
 await expect(toggle).toHaveAttribute('aria-pressed','false');
 await page.getByRole('button',{name:'Explore my portfolio',exact:true}).click();
 await expect(page.locator('.voyage-app')).toHaveAttribute('data-intro-complete','true',{timeout:30000});
 expect(await music.evaluate((audio:HTMLAudioElement)=>audio.paused)).toBe(true);
 await expect(toggle).toHaveAttribute('aria-pressed','false');
});

test('blocked autoplay retries on the first journey click while the welcome plays before the gate',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.addInitScript(()=>{
  const original=HTMLMediaElement.prototype.play;
  (window as unknown as {autoplayAttempts:number}).autoplayAttempts=0;
  HTMLMediaElement.prototype.play=function(){
   if(this.matches('[data-testid="voyage-music"]')&&!navigator.userActivation.hasBeenActive){
    (window as unknown as {autoplayAttempts:number}).autoplayAttempts++;
    return Promise.reject(new DOMException('A trusted interaction is required','NotAllowedError'));
   }
   return Reflect.apply(original,this,[]);
  };
 });
 await page.goto('/',{waitUntil:'networkidle'});await ready(page);
 expect(await page.evaluate(()=>(window as unknown as {autoplayAttempts:number}).autoplayAttempts)).toBeGreaterThan(0);
 expect(await page.getByTestId('voyage-music').evaluate((audio:HTMLAudioElement)=>audio.paused)).toBe(true);
 await expect(page.locator('.voyage-sound-dock [data-sound-toggle]')).toHaveAttribute('aria-pressed','true');
 await page.getByRole('button',{name:'Begin the voyage',exact:true}).click();
 await expect(page.getByTestId('voyage-prologue')).toHaveAttribute('data-phase','welcoming');
 await expect(page.getByTestId('gate-environment')).toHaveAttribute('data-close-progress','0.0000');
 await playing(page);
});

test('the soundtrack starts on the silhouette without any click',async({page})=>{
  await page.addInitScript(()=>{
   const state=window as unknown as {musicInputEvents:number;musicAutoplayed:boolean};state.musicInputEvents=0;state.musicAutoplayed=false;
   const input=(event:Event)=>{if(event.isTrusted)state.musicInputEvents++;};
   document.addEventListener('pointerdown',input,true);document.addEventListener('keydown',input,true);
   document.addEventListener('playing',event=>{if(event.target instanceof HTMLMediaElement&&event.target.matches('[data-testid="voyage-music"]'))state.musicAutoplayed=state.musicInputEvents===0;},true);
  });
  await page.goto('/',{waitUntil:'networkidle'});await ready(page);
  await playing(page);
  expect(await page.evaluate(()=>(window as unknown as {musicAutoplayed:boolean}).musicAutoplayed)).toBe(true);
  await expect(page.getByTestId('voyage-prologue')).toHaveAttribute('data-phase','idle');
  await expect.poll(()=>page.getByTestId('voyage-music').evaluate((audio:HTMLAudioElement)=>audio.currentTime)).toBeGreaterThan(.1);
 });
