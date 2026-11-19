import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {enterPortfolio} from './helpers/enter-portfolio';

const manifest=JSON.parse(readFileSync('public/portfolio/school-posters/manifest.json','utf8')) as {works:{media:string;poster?:string;mediaType:string;width:number;height:number;duration?:number}[]};
const titles=["Luminous Prom Night.", "HIVI! at SMAN 1 Madiun.", "Vierratale at SMAN 1 Madiun.", "Happy New Year 2022.", "Candidate 01: Devin Erlangga.", "Introducing the elected MPK chairperson.", "Celebrating Indonesia's 77th Independence Day.", "Rethera Classmeeting.", "Lunar New Year 2022.", "Magnificent: the event rundown.", "Waisak 2022.", "Rethera 2.0 Classmeeting.", "Honoring Indonesia's heroes.", "Maulid Nabi Muhammad SAW.", "International Earth Day.", "SMALA MPLS: Dwipantara."];
for(const [device,width,height]of [['desktop',1440,1000],['phone',390,844]]as const){
 test(`${device}: school poster collection preserves all 16 works, native framing and playback`,async({page})=>{
  test.setTimeout(90000);
  await page.setViewportSize({width,height});
  const errors:string[]=[],requests:string[]=[],descriptions:string[]=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('request',request=>{if(request.url().includes('/school-posters/')&&request.url().endsWith('.mp4'))requests.push(request.url());});
  await page.goto('/',{waitUntil:'networkidle'});await enterPortfolio(page);
  await expect(page.locator('main')).toHaveAttribute('data-intro-complete','true',{timeout:30000});
  await page.getByRole('button',{name:'Visit Pigment Atoll',exact:true}).click();
  const dialog=page.locator('.portfolio-dialog:not(.certificate-dialog)');await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('tab',{name:/Portfolio A/})).toHaveAttribute('aria-selected','true');
  for(const [index,work]of manifest.works.entries()){
   await expect(dialog.getByLabel(`Media ${index+1} of 16 in Portfolio A`,{exact:true})).toBeVisible();
   await expect(dialog.getByRole('heading')).toHaveText(titles[index]);
   const details=dialog.locator('.project-details');
   await expect(details).toContainText('Graphic Designer');await expect(details).toContainText('Adobe Photoshop');
   descriptions.push(await details.locator('>p:not(.eyebrow)').innerText());
   if(work.mediaType==='video'){
    const video=dialog.locator('video');await expect(video).toHaveCount(1);
    await expect(video).toHaveAttribute('src',work.media);await expect(video).toHaveAttribute('poster',work.poster!);
    await expect(video).toHaveAttribute('controls','');await expect(video).toHaveAttribute('playsinline','');
    await expect(video).toHaveAttribute('preload','metadata');
    await expect(details).toContainText('Adobe After Effects');await expect(details).toContainText('Adobe Premiere Pro');
    await expect.poll(()=>video.evaluate((el:HTMLVideoElement)=>el.readyState)).toBeGreaterThanOrEqual(1);
    const state=await video.evaluate((el:HTMLVideoElement)=>({duration:el.duration,width:el.videoWidth,height:el.videoHeight,paused:el.paused,error:el.error?.code??null}));
    expect(state.duration).toBeCloseTo(work.duration!,1);expect([state.width,state.height]).toEqual([work.width,work.height]);expect(state.paused).toBe(true);expect(state.error).toBeNull();
    const fit=await video.evaluate((el:HTMLVideoElement)=>{
     const box=el.getBoundingClientRect(),frame=el.parentElement!.getBoundingClientRect();
     return {ratio:box.width/box.height,gap:frame.width-box.width-2,height:box.height};
    });
    expect(fit.ratio,'Native portrait or square aspect ratio must be preserved').toBeCloseTo(work.width/work.height,2);
    expect(Math.abs(fit.gap),'No empty space beside a portrait or square video').toBeLessThan(1);
    if(width>640&&work.width<work.height)expect(fit.height).toBeLessThanOrEqual(520);
    if(index===0)expect(requests.every(url=>url.endsWith('/01-lumi.mp4')),'Only the active video is loaded').toBe(true);
    if(index===1||index===2)await expect(details).toContainText('peak celebrations of HUT SMAN 1 Madiun');
    if(index===15)await expect(details).toContainText('intentional replacement area');
    await video.scrollIntoViewIfNeeded();await video.evaluate((el:HTMLVideoElement)=>el.play());
    await expect.poll(()=>video.evaluate((el:HTMLVideoElement)=>el.currentTime)).toBeGreaterThan(.1);
    await expect.poll(()=>page.getByTestId('voyage-music').evaluate((el:HTMLAudioElement)=>el.paused)).toBe(true);
    if(index===0||index===1||index===2||index===15)await page.screenshot({path:`test-results/school-posters-${device}-${index+1}.png`});
    const handle=await video.elementHandle();
    await dialog.getByRole('button',{name:'Next media',exact:true}).click();
    expect(await handle!.evaluate((el:HTMLVideoElement)=>el.paused),'Changing slides stops the previous video').toBe(true);
   }else{
    const image=dialog.locator('.project-image-link img');await image.evaluate((el:HTMLImageElement)=>el.decode());
    expect(await image.evaluate((el:HTMLImageElement)=>[el.naturalWidth,el.naturalHeight])).toEqual([1080,1920]);
    await expect(dialog.locator('video')).toHaveCount(0);
    const fit=await image.evaluate((el:HTMLImageElement)=>{const box=el.getBoundingClientRect(),frame=el.parentElement!.getBoundingClientRect();return {ratio:box.width/box.height,gap:frame.width-box.width-2};});
    expect(fit.ratio).toBeCloseTo(1080/1920,2);expect(Math.abs(fit.gap)).toBeLessThan(1);
    await image.scrollIntoViewIfNeeded();await page.screenshot({path:`test-results/school-posters-${device}-earth-day.png`});
    await dialog.getByRole('button',{name:'Next media',exact:true}).click();
   }
   expect(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth),'The gallery fits the viewport').toBe(true);
  }
  expect(new Set(descriptions).size).toBe(16);
  await expect(dialog.getByRole('heading')).toHaveText(titles[0]);
  await dialog.getByRole('button',{name:'Previous media',exact:true}).click();await expect(dialog.getByRole('heading')).toHaveText(titles[15]);
  await dialog.getByRole('tab',{name:/Portfolio B/}).click();await expect(dialog.getByRole('heading')).toHaveText('FORMAS Goes to School.');
  await dialog.getByRole('tab',{name:/Portfolio A/}).click();await expect(dialog.getByRole('heading')).toHaveText(titles[0]);
  expect(errors).toEqual([]);
 });
}
