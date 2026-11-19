import {enterPortfolio} from './helpers/enter-portfolio';
import {test,expect,type Page} from '@playwright/test';

async function openFilm(page:Page){
  await page.goto('/',{waitUntil:'networkidle'});await enterPortfolio(page);
  await expect(page.locator('main')).toHaveAttribute('data-intro-complete','true',{timeout:30000});
  await page.getByRole('button',{name:'Visit Framewake Bay',exact:true}).click();
  const dialog=page.locator('.portfolio-dialog');
  await expect(dialog).toBeVisible();
  return dialog;
}

test('film starts with its official thumbnail, then four playable one-minute excerpts',async({page})=>{
  const dialog=await openFilm(page);
  await expect(dialog.getByRole('heading')).toHaveText('BANGKIT, through my lens.');
  await expect(dialog.getByLabel('Media 1 of 5 in Portfolio A',{exact:true})).toBeVisible();
  await expect(dialog.locator('video')).toHaveCount(0);
  await expect(dialog.locator('.project-image-link')).toHaveAttribute('href','/portfolio/bangkit/cover.webp');
  await dialog.locator('.project-image-link img').evaluate((image:HTMLImageElement)=>image.decode());
  const sources=['00:15 - 01:15','03:00 - 04:00','04:10 - 05:10','06:35 - 07:35'];
  for(let i=0;i<4;i++){
    await dialog.getByRole('button',{name:'Next media',exact:true}).click();
    await expect(dialog.getByLabel('Media '+(i+2)+' of 5 in Portfolio A',{exact:true})).toBeVisible();
    const video=dialog.locator('video');
    await expect.poll(()=>video.evaluate((v:HTMLVideoElement)=>v.readyState)).toBeGreaterThanOrEqual(1);
    const state=await video.evaluate((v:HTMLVideoElement)=>({duration:v.duration,width:v.videoWidth,height:v.videoHeight,paused:v.paused,error:v.error?.code??null}));
    expect(state.duration).toBeCloseTo(60,1);
    expect([state.width,state.height]).toEqual([1280,720]);
    expect(state.paused).toBe(true);expect(state.error).toBeNull();
    await expect(video).toHaveAttribute('poster',/\.webp$/);
    await expect(video).toHaveAttribute('controls','');
    await expect(dialog.locator('.project-video-context')).toContainText('01:00 excerpt');
    await expect(dialog.locator('.project-video-context')).toContainText(sources[i]);
    await expect(dialog.getByRole('link',{name:'Watch full film',exact:true})).toHaveAttribute('href','https://www.youtube.com/watch?v=KTGtOQgDrOo');
  }
  await dialog.getByRole('button',{name:'Next media',exact:true}).click();
  await expect(dialog.getByRole('heading')).toHaveText('BANGKIT, through my lens.');
});

test('film playback pauses ambience, restores it on pause or slide change, and preserves a saved mute',async({page})=>{
  const dialog=await openFilm(page),music=page.getByTestId('voyage-music');
  const toggle=dialog.locator('[data-sound-toggle]');
  if(await toggle.getAttribute('aria-pressed')!=='true')await toggle.click();
  await expect.poll(()=>music.evaluate((a:HTMLAudioElement)=>!a.paused&&a.readyState>=2),{timeout:20000}).toBe(true);
  const saved=await page.evaluate(()=>localStorage.getItem('iza-voyage-sound'));
  await dialog.getByRole('button',{name:'Next media',exact:true}).click();
  const video=dialog.locator('video'),old=await video.elementHandle();
  await video.evaluate((v:HTMLVideoElement)=>v.play());
  await expect.poll(()=>video.evaluate((v:HTMLVideoElement)=>v.currentTime)).toBeGreaterThan(.1);
  await expect.poll(()=>music.evaluate((a:HTMLAudioElement)=>a.paused)).toBe(true);
  await video.evaluate((v:HTMLVideoElement)=>v.pause());
  await expect.poll(()=>music.evaluate((a:HTMLAudioElement)=>!a.paused)).toBe(true);
  expect(await page.evaluate(()=>localStorage.getItem('iza-voyage-sound'))).toBe(saved);
  await video.evaluate((v:HTMLVideoElement)=>v.play());
  await dialog.getByRole('button',{name:'Next media',exact:true}).click();
  await expect.poll(()=>old!.evaluate((v:HTMLVideoElement)=>v.paused)).toBe(true);
  await expect.poll(()=>music.evaluate((a:HTMLAudioElement)=>!a.paused)).toBe(true);
  await toggle.click();
  await dialog.locator('video').evaluate((v:HTMLVideoElement)=>v.play());
  await dialog.locator('video').evaluate((v:HTMLVideoElement)=>v.pause());
  await expect.poll(()=>music.evaluate((a:HTMLAudioElement)=>a.paused)).toBe(true);
  expect(await page.evaluate(()=>localStorage.getItem('iza-voyage-sound'))).toBe('off');
  await dialog.getByRole('button',{name:'Close portfolio',exact:true}).click();
  expect(await music.evaluate((a:HTMLAudioElement)=>a.paused)).toBe(true);
});

test('film player and time ranges fit a phone and retain inline controls',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  const dialog=await openFilm(page);
  await dialog.getByRole('button',{name:'Next media',exact:true}).click();
  const video=dialog.locator('video');
  await expect(video).toHaveAttribute('playsinline','');
  await expect.poll(()=>video.evaluate((v:HTMLVideoElement)=>v.readyState)).toBeGreaterThanOrEqual(1);
  expect(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
  const player=await dialog.getByTestId('portfolio-video').boundingBox(),bounds=await dialog.boundingBox();
  expect(player!.width).toBeLessThanOrEqual(bounds!.width);
  await expect(dialog.getByRole('link',{name:'Watch full film',exact:true})).toBeVisible();
});


for(const [device,width,height]of [['desktop',1440,1000],['phone',390,844]]as const){
 test(device+': Legionnaire Portfolio B credits the Co-Producer and plays five excerpts',async({page})=>{
  await page.setViewportSize({width,height});
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  const dialog=await openFilm(page);
  await dialog.getByRole('tab',{name:/Portfolio B/}).click();
  await expect(dialog.getByRole('heading')).toHaveText('LÉGIONNAIRE, made together.');
  await expect(dialog.locator('.project-details')).toContainText('Co-Producer');
  await expect(dialog.locator('.project-details')).toContainText('direction, equipment, and practical production needs');
  await expect(dialog.getByLabel('Media 1 of 7 in Portfolio B',{exact:true})).toBeVisible();
  await dialog.locator('img').evaluate((image:HTMLImageElement)=>image.decode());
  await page.screenshot({path:`test-results/legionnaire-${device}.png`});
  const clips=[['01-opening-story','02:00 - 03:00'],['02-classroom-life','08:00 - 09:00'],['03-teacher-and-student-memories','18:15 - 19:15'],['04-cohort-togetherness','38:00 - 39:00'],['05-closing-reflection','42:00 - 43:00']];
  for(const [index,[file,range]]of clips.entries()){
   await dialog.getByRole('button',{name:'Next media',exact:true}).click();
   await expect(dialog.getByLabel(`Media ${index+2} of 7 in Portfolio B`,{exact:true})).toBeVisible();
   const video=dialog.locator('video');
   await expect(video).toHaveAttribute('src',`/portfolio/legionnaire/${file}.mp4`);
   await expect(video).toHaveAttribute('poster',`/portfolio/legionnaire/${file}.webp`);
   await expect(video).toHaveAttribute('controls','');
   await expect(video).toHaveAttribute('playsinline','');
   await expect.poll(()=>video.evaluate((v:HTMLVideoElement)=>v.readyState)).toBeGreaterThanOrEqual(1);
   const state=await video.evaluate((v:HTMLVideoElement)=>({duration:v.duration,width:v.videoWidth,height:v.videoHeight,error:v.error?.code??null}));
   expect(state.duration).toBeCloseTo(60,1);expect([state.width,state.height]).toEqual([1280,720]);expect(state.error).toBeNull();
   await expect(dialog.locator('.project-video-context')).toContainText('01:00 excerpt');
   await expect(dialog.locator('.project-video-context')).toContainText(range);
   await expect(dialog.getByRole('link',{name:'Watch full film',exact:true})).toHaveAttribute('href','https://www.youtube.com/watch?v=EoJ8pQyXcTA');
   expect(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
   if(index===0){
    const music=page.getByTestId('voyage-music');
    await video.evaluate((v:HTMLVideoElement)=>v.play());
    await expect.poll(()=>video.evaluate((v:HTMLVideoElement)=>v.currentTime)).toBeGreaterThan(.1);
    await expect.poll(()=>music.evaluate((v:HTMLAudioElement)=>v.paused)).toBe(true);
    await video.evaluate((v:HTMLVideoElement)=>v.pause());
   }
  }
  await dialog.getByRole('button',{name:'Next media',exact:true}).click();
  await expect(dialog.getByRole('heading')).toHaveText('The credit behind the collaboration.');
  await expect(dialog.locator('video')).toHaveCount(0);
  await expect(dialog.locator('.project-image-link')).toHaveAttribute('href','/portfolio/legionnaire/06-co-producer-credit.webp');
  await dialog.locator('img').evaluate((image:HTMLImageElement)=>image.decode());
  await expect(dialog.locator('.project-details')).toContainText('Iza Yunus Andhika');
  await dialog.getByRole('button',{name:'Next media',exact:true}).click();
  await expect(dialog.getByRole('heading')).toHaveText('LÉGIONNAIRE, made together.');
  await dialog.getByRole('tab',{name:/Portfolio A/}).click();
  await expect(dialog.getByRole('heading')).toHaveText('BANGKIT, through my lens.');
  expect(errors).toEqual([]);
 });
}


for(const [device,width,height]of [['desktop',1440,1000],['phone',390,844]]as const){
 test(device+': Nightride Portfolio C plays four correctly framed camera excerpts',async({page})=>{
  await page.setViewportSize({width,height});
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  const dialog=await openFilm(page);
  await dialog.getByRole('tab',{name:/Portfolio C/}).click();
  await expect(dialog.getByRole('heading')).toHaveText('Nightride, through my lens.');
  await expect(dialog.getByLabel('Media 1 of 5 in Portfolio C',{exact:true})).toBeVisible();
  await expect(dialog.locator('.project-details')).toContainText('I worked as cameraman');
  await expect(dialog.locator('.project-details')).toContainText('studio is credited for the video and colour grading');
  await expect(dialog.locator('.project-image-link')).toHaveAttribute('href','/portfolio/madeno-nightride/cover.webp');
  await dialog.locator('img').evaluate((image:HTMLImageElement)=>image.decode());
  await page.screenshot({path:`test-results/nightride-overview-${device}.png`});
  const clips=[['01-motorcycle-details','00:06 - 00:26'],['02-rider-preparation','00:30 - 00:50'],['03-night-rolling-shots','01:02 - 01:22'],['04-city-lights','01:34 - 01:54']];
  for(const [index,[file,range]]of clips.entries()){
   await dialog.getByRole('button',{name:'Next media',exact:true}).click();
   await expect(dialog.getByLabel(`Media ${index+2} of 5 in Portfolio C`,{exact:true})).toBeVisible();
   const video=dialog.locator('video');
   await expect(video).toHaveAttribute('src',`/portfolio/madeno-nightride/${file}.mp4`);
   await expect(video).toHaveAttribute('poster',`/portfolio/madeno-nightride/${file}.webp`);
   await expect(video).toHaveAttribute('controls','');
   await expect(video).toHaveAttribute('playsinline','');
   await expect.poll(()=>video.evaluate((v:HTMLVideoElement)=>v.readyState)).toBeGreaterThanOrEqual(1);
   const state=await video.evaluate((v:HTMLVideoElement)=>({duration:v.duration,width:v.videoWidth,height:v.videoHeight,error:v.error?.code??null,frame:v.getBoundingClientRect().width/v.getBoundingClientRect().height}));
   expect(state.duration).toBeCloseTo(20,1);expect([state.width,state.height]).toEqual([720,320]);expect(state.error).toBeNull();expect(state.frame).toBeCloseTo(2.25,2);
   await expect(dialog.locator('.project-video-context')).toContainText('00:20 excerpt');
   await expect(dialog.locator('.project-video-context')).toContainText(range);
   await expect(dialog.getByRole('link',{name:'Watch full reel',exact:true})).toHaveAttribute('href','https://www.instagram.com/reel/CpfJr5cjiRC/');
   expect(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
   if(index===0){
    await video.evaluate((v:HTMLVideoElement)=>v.play());
    await expect.poll(()=>video.evaluate((v:HTMLVideoElement)=>v.currentTime)).toBeGreaterThan(.1);
    await expect.poll(()=>page.getByTestId('voyage-music').evaluate((v:HTMLAudioElement)=>v.paused)).toBe(true);
    await video.evaluate((v:HTMLVideoElement)=>v.pause());
    await page.screenshot({path:`test-results/nightride-player-${device}.png`});
   }
  }
  await dialog.getByRole('button',{name:'Next media',exact:true}).click();
  await expect(dialog.getByRole('heading')).toHaveText('Nightride, through my lens.');
  await dialog.getByRole('tab',{name:/Portfolio B/}).click();
  await expect(dialog.getByRole('heading')).toHaveText('LÉGIONNAIRE, made together.');
  await dialog.getByRole('button',{name:'Next media',exact:true}).click();
  const film=dialog.locator('video');
  expect(await film.evaluate(v=>{const b=v.getBoundingClientRect();return b.width/b.height;})).toBeCloseTo(16/9,2);
  expect(errors).toEqual([]);
 });
}
