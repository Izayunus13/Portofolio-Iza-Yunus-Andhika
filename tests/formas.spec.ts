import {test,expect,type Page} from '@playwright/test';
import {enterPortfolio} from './helpers/enter-portfolio';

async function openFormas(page:Page){
 await page.goto('/',{waitUntil:'networkidle'});await enterPortfolio(page);
 await expect(page.locator('main')).toHaveAttribute('data-intro-complete','true',{timeout:30000});
 await page.getByRole('button',{name:'Visit Pigment Atoll',exact:true}).click();
 const dialog=page.locator('.portfolio-dialog:not(.certificate-dialog)');
 await expect(dialog).toBeVisible();await dialog.getByRole('tab',{name:/Portfolio B/}).click();
 return dialog;
}
for(const [device,width,height]of [['desktop',1440,1000],['phone',390,844]]as const){
 test(`${device}: FORMAS Portfolio B presents all five Photoshop works with individual descriptions`,async({page})=>{
  await page.setViewportSize({width,height});
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  const dialog=await openFormas(page),descriptions:string[]=[];
  const images=[['01-goes-to-school-poster.webp',1080,1920,'poster'],['02-sticker-bundle.webp',2500,4000,'sticker sheet'],['03-snbp-welcome-poster.webp',1080,1350,'welcome poster']]as const;
  for(const [index,[file,imageWidth,imageHeight,label]]of images.entries()){
   await expect(dialog.getByLabel(`Media ${index+1} of 5 in Portfolio B`,{exact:true})).toBeVisible();
   await expect(dialog.locator('.project-details')).toContainText('Adobe Photoshop');
   descriptions.push(await dialog.locator('.project-details>p:not(.eyebrow)').innerText());
   const image=dialog.locator('.project-image-link img');await image.evaluate((element:HTMLImageElement)=>element.decode());
   const dimensions=await image.evaluate((element:HTMLImageElement)=>[element.naturalWidth,element.naturalHeight]);expect(dimensions).toEqual([imageWidth,imageHeight]);
   const fit=await image.evaluate((element:HTMLImageElement)=>{
    const box=element.getBoundingClientRect(),frame=element.parentElement!.getBoundingClientRect(),style=getComputedStyle(element.parentElement!);
    return {ratio:box.width/box.height,gap:frame.width-box.width-parseFloat(style.borderLeftWidth)-parseFloat(style.borderRightWidth)};
   });
   expect(fit.ratio,'The image box must match the artwork aspect ratio').toBeCloseTo(imageWidth/imageHeight,2);
   expect(fit.gap,'The frame must hug the image without side gutters').toBeLessThan(1);
   await expect(dialog.getByRole('link',{name:new RegExp('Open full-size '+label)})).toHaveAttribute('href','/portfolio/formas/'+file);
   const media=await dialog.locator('.project-media').boundingBox(),navigation=await dialog.locator('.dialog-category-nav').boundingBox();
   expect(media!.x+media!.width).toBeLessThanOrEqual(navigation!.x+navigation!.width+.5);
   if(index===0)await page.screenshot({path:`test-results/formas-poster-${device}.png`});
   await dialog.getByRole('button',{name:'Next media',exact:true}).click();
  }
  for(const [index,file,duration]of [[3,'04-logo-visual',8.5],[4,'05-welcoming-party-visual',23.12]]as const){
   await expect(dialog.getByLabel(`Media ${index+1} of 5 in Portfolio B`,{exact:true})).toBeVisible();
   await expect(dialog.locator('.project-details')).toContainText('Adobe Photoshop');
   descriptions.push(await dialog.locator('.project-details>p:not(.eyebrow)').innerText());
   const video=dialog.locator('video');
   await expect(video).toHaveAttribute('src','/portfolio/formas/'+file+'.mp4');
   await expect(video).toHaveAttribute('poster','/portfolio/formas/'+file+'.webp');
   await expect(video).toHaveAttribute('controls','');await expect(video).toHaveAttribute('playsinline','');
   await expect.poll(()=>video.evaluate((element:HTMLVideoElement)=>element.readyState)).toBeGreaterThanOrEqual(1);
   const state=await video.evaluate((element:HTMLVideoElement)=>({duration:element.duration,width:element.videoWidth,height:element.videoHeight,paused:element.paused,error:element.error?.code??null}));
   expect(state.duration).toBeCloseTo(duration,1);expect([state.width,state.height]).toEqual([1280,720]);expect(state.paused).toBe(true);expect(state.error).toBeNull();
   const player=await dialog.getByTestId('portfolio-video').boundingBox(),navigation=await dialog.locator('.dialog-category-nav').boundingBox();
   expect(player!.x+player!.width).toBeLessThanOrEqual(navigation!.x+navigation!.width+.5);
   await video.scrollIntoViewIfNeeded();await video.evaluate((element:HTMLVideoElement)=>element.play());
   await expect.poll(()=>video.evaluate((element:HTMLVideoElement)=>element.currentTime)).toBeGreaterThan(.1);
   await expect.poll(()=>page.getByTestId('voyage-music').evaluate((element:HTMLAudioElement)=>element.paused)).toBe(true);
   await video.evaluate((element:HTMLVideoElement)=>element.pause());
   if(index===4)await page.screenshot({path:`test-results/formas-welcoming-${device}.png`});
   await dialog.getByRole('button',{name:'Next media',exact:true}).click();
  }
  expect(new Set(descriptions).size).toBe(5);
  await expect(dialog.getByRole('heading')).toHaveText('FORMAS Goes to School.');
  await dialog.getByRole('tab',{name:/Portfolio A/}).click();await expect(dialog.getByRole('heading')).toHaveText('Luminous Prom Night.');
  await dialog.getByRole('tab',{name:/Portfolio B/}).click();await expect(dialog.getByLabel('Media 1 of 5 in Portfolio B',{exact:true})).toBeVisible();
  expect(errors).toEqual([]);
 });
}
