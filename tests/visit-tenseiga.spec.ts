import {test,expect} from '@playwright/test';
import {enterPortfolio} from './helpers/enter-portfolio';

for(const [device,width,height]of [['desktop',1440,1000],['tablet',768,1024],['phone',390,844]]as const){
 test(`${device}: Portfolio F presents the complete Tenseiga visit with three roles and a bold collaborator`,async({page})=>{
  test.setTimeout(60000);await page.setViewportSize({width,height});
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/',{waitUntil:'networkidle'});await enterPortfolio(page);await expect(page.locator('main')).toHaveAttribute('data-intro-complete','true',{timeout:30000});
  await page.getByRole('button',{name:'Visit Framewake Bay',exact:true}).click();
  const dialog=page.locator('.portfolio-dialog:not(.certificate-dialog)');await expect(dialog.getByRole('tab')).toHaveCount(6);
  await dialog.getByRole('tab',{name:/Portfolio A/}).focus();await page.keyboard.press('End');await expect(dialog.getByRole('tab',{name:/Portfolio F/})).toHaveAttribute('aria-selected','true');
  await expect(dialog.getByRole('heading')).toHaveText('A visit to Tenseiga Clinic.');await expect(dialog.getByLabel('Media 1 of 1 in Portfolio F',{exact:true})).toBeVisible();
  const details=dialog.locator('.project-details');
  for(const credit of ['Cameraman','Concept Developer','Video Editor','Tenseiga_Clinic'])await expect(details).toContainText(credit);
  const collaborator=details.locator('p>strong');await expect(collaborator).toHaveCount(1);await expect(collaborator).toHaveText('@faisafch');expect(await collaborator.evaluate(el=>Number(getComputedStyle(el).fontWeight))).toBeGreaterThanOrEqual(700);
  for(const step of ['arrival','reception','consultation','treatment'])await expect(details.locator('>p:not(.eyebrow)')).toContainText(step);
  await expect(dialog.getByRole('button',{name:'Next media',exact:true})).toBeDisabled();
  const video=dialog.locator('video');await expect(video).toHaveAttribute('src','/portfolio/visit-tenseiga/visit-tenseiga.mp4');await expect(video).toHaveAttribute('poster','/portfolio/visit-tenseiga/cover.webp');await expect(video).toHaveAttribute('controls','');await expect(video).toHaveAttribute('playsinline','');await expect(video).toHaveAttribute('preload','metadata');
  await expect.poll(()=>video.evaluate((el:HTMLVideoElement)=>el.readyState)).toBeGreaterThanOrEqual(1);
  const state=await video.evaluate((el:HTMLVideoElement)=>({duration:el.duration,width:el.videoWidth,height:el.videoHeight,error:el.error?.code??null,paused:el.paused}));expect(Math.abs(state.duration-165.53)).toBeLessThan(.15);expect([state.width,state.height]).toEqual([720,1280]);expect(state.error).toBeNull();expect(state.paused).toBe(true);
  const ratio=await video.evaluate(el=>{const box=el.getBoundingClientRect();return box.width/box.height;});expect(ratio).toBeCloseTo(9/16,2);
  const navigation=await dialog.locator('.dialog-category-nav').boundingBox();
  for(const tab of await dialog.getByRole('tab').all()){const box=await tab.boundingBox();expect(box!.x).toBeGreaterThanOrEqual(navigation!.x-.5);expect(box!.x+box!.width).toBeLessThanOrEqual(navigation!.x+navigation!.width+.5);}
  expect(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
  await page.screenshot({path:`outputs/creative-additions/visit-tenseiga-${device}.png`});
  const toggle=dialog.locator('[data-sound-toggle]'),music=page.getByTestId('voyage-music');if(await toggle.getAttribute('aria-pressed')!=='true')await toggle.click();await expect.poll(()=>music.evaluate((el:HTMLAudioElement)=>!el.paused),{timeout:15000}).toBe(true);
  await video.scrollIntoViewIfNeeded();await video.evaluate((el:HTMLVideoElement)=>el.play());await expect.poll(()=>video.evaluate((el:HTMLVideoElement)=>el.currentTime)).toBeGreaterThan(.1);await expect.poll(()=>music.evaluate((el:HTMLAudioElement)=>el.paused)).toBe(true);
  await video.evaluate((el:HTMLVideoElement)=>el.pause());await expect.poll(()=>music.evaluate((el:HTMLAudioElement)=>!el.paused)).toBe(true);
  await video.evaluate((el:HTMLVideoElement)=>{el.currentTime=160;});await expect.poll(()=>video.evaluate((el:HTMLVideoElement)=>!el.seeking&&el.readyState>=2)).toBe(true);expect(await video.evaluate((el:HTMLVideoElement)=>el.error?.code??null)).toBeNull();
  await video.evaluate((el:HTMLVideoElement)=>el.play());const old=await video.elementHandle();await dialog.getByRole('tab',{name:/Portfolio E/}).click();expect(await old!.evaluate((el:HTMLVideoElement)=>el.paused)).toBe(true);await expect(dialog.getByRole('heading')).toHaveText('I-GATE 2025: Sore meets the Enchanted Garden.');
  await dialog.getByRole('tab',{name:/Portfolio F/}).click();await expect(dialog.getByRole('heading')).toHaveText('A visit to Tenseiga Clinic.');await expect(dialog.locator('.project-details strong')).toHaveText('@faisafch');expect(errors).toEqual([]);
 });
}
