import {test,expect} from '@playwright/test';
import {enterPortfolio} from './helpers/enter-portfolio';

for(const [device,width,height]of [['desktop',1440,1000],['phone',390,844]]as const){
 test(`${device}: Jingle Portfolio D presents five local editing chapters with their source intervals`,async({page})=>{
  test.setTimeout(90000);await page.setViewportSize({width,height});
  const errors:string[]=[],external:string[]=[],descriptions:string[]=[];page.on('pageerror',error=>errors.push(error.message));page.on('request',r=>{if(/youtube(?:-nocookie)?\.com|ytimg\.com/.test(new URL(r.url()).hostname))external.push(r.url());});
  await page.goto('/',{waitUntil:'networkidle'});await enterPortfolio(page);await expect(page.locator('main')).toHaveAttribute('data-intro-complete','true',{timeout:30000});
  await page.getByRole('button',{name:'Visit Framewake Bay',exact:true}).click();const dialog=page.locator('.portfolio-dialog:not(.certificate-dialog)');await dialog.getByRole('tab',{name:/Portfolio D/}).click();
  await expect(dialog.getByRole('tab')).toHaveCount(6);await expect(dialog.getByRole('heading')).toHaveText('Jingle PKKMB FH UNS');await expect(dialog.getByLabel('Media 1 of 6 in Portfolio D',{exact:true})).toBeVisible();
  for(const credit of ['Full Editor','raw footage','color grading','editing the sound'])await expect(dialog.locator('.project-details')).toContainText(credit);
  await dialog.locator('.project-image-link img').evaluate((el:HTMLImageElement)=>el.decode());await expect(dialog.locator('iframe,video')).toHaveCount(0);
  await expect(dialog.getByRole('link',{name:'Watch full video',exact:true})).toHaveCount(0);
  await dialog.getByRole('button',{name:'Next media',exact:true}).click();
  const clips=[['01-opening-campus',50,'00:00 - 00:50'],['02-small-group-performance',55,'00:50 - 01:45'],['03-cohort-transition',55,'01:45 - 02:40'],['04-ensemble-performance',55,'02:40 - 03:35'],['05-finale-credits',49,'03:35 - 04:24']]as const;
  for(const [index,[stem,duration,interval]]of clips.entries()){
   await expect(dialog.getByLabel(`Media ${index+2} of 6 in Portfolio D`,{exact:true})).toBeVisible();await expect(dialog.locator('.project-details')).toContainText('Full Editor');descriptions.push(await dialog.locator('.project-details>p:not(.eyebrow)').innerText());
   const video=dialog.locator('video');await expect(video).toHaveAttribute('src','/portfolio/jingle-pkkmb-fh-uns/'+stem+'.mp4');await expect(video).toHaveAttribute('poster','/portfolio/jingle-pkkmb-fh-uns/'+stem+'.webp');await expect(video).toHaveAttribute('controls','');
   await expect.poll(()=>video.evaluate((el:HTMLVideoElement)=>el.readyState)).toBeGreaterThanOrEqual(1);
   const state=await video.evaluate((el:HTMLVideoElement)=>({duration:el.duration,width:el.videoWidth,height:el.videoHeight,paused:el.paused,error:el.error?.code??null}));expect(state.duration).toBeCloseTo(duration,1);expect([state.width,state.height]).toEqual([1280,720]);expect(state.paused).toBe(true);expect(state.error).toBeNull();
   await expect(dialog.locator('.project-video-context')).toContainText(interval);expect(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
   if(index===0||index===4)await page.screenshot({path:`outputs/creative-additions/jingle-${device}-${index+1}.png`});
   await video.scrollIntoViewIfNeeded();await video.evaluate((el:HTMLVideoElement)=>el.play());await expect.poll(()=>video.evaluate((el:HTMLVideoElement)=>el.currentTime)).toBeGreaterThan(.1);await expect.poll(()=>page.getByTestId('voyage-music').evaluate((el:HTMLAudioElement)=>el.paused)).toBe(true);
   const old=await video.elementHandle();await dialog.getByRole('button',{name:'Next media',exact:true}).click();expect(await old!.evaluate((el:HTMLVideoElement)=>el.paused)).toBe(true);
  }
  await expect(dialog.getByRole('heading')).toHaveText('Jingle PKKMB FH UNS');expect(new Set(descriptions).size).toBe(5);expect(external).toEqual([]);expect(errors).toEqual([]);
 });
}
