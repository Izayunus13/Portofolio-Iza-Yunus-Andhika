import {test,expect} from '@playwright/test';
import {enterPortfolio} from './helpers/enter-portfolio';

for(const [device,width,height]of [['desktop',1440,1000],['phone',390,844]]as const){
 for(const project of ['tenseiga','igate']as const){
  test(`${device}: ${project} presents the supplied videos and confirmed project credits`,async({page})=>{
   test.setTimeout(60000);await page.setViewportSize({width,height});
   const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
   await page.goto('/',{waitUntil:'networkidle'});await enterPortfolio(page);await expect(page.locator('main')).toHaveAttribute('data-intro-complete','true',{timeout:30000});
   await page.getByRole('button',{name:'Visit '+(project==='tenseiga'?'Pigment Atoll':'Framewake Bay'),exact:true}).click();
   const dialog=page.locator('.portfolio-dialog:not(.certificate-dialog)');
   if(project==='igate'){await dialog.getByRole('tab',{name:/Portfolio E/}).click();}else await dialog.getByRole('tab',{name:/Portfolio C/}).click();
   await expect(dialog.getByRole('tab',{selected:true})).toContainText(project==='tenseiga'?'Portfolio C':'Portfolio E');
   await expect(dialog.getByRole('tab')).toHaveCount(project==='tenseiga'?3:6);
   const works=project==='tenseiga'?
    [{title:'Serum Gold Anti Aging.',media:'/portfolio/tenseiga-clinic/01-serum-gold.mp4',duration:12,width:720,height:1280},{title:'Tenseiga Clinic: logo visual.',media:'/portfolio/tenseiga-clinic/02-clinic-visual.mp4',duration:10,width:720,height:1280}]:
    [{title:'I-GATE 2025: Sore meets the Enchanted Garden.',media:'/portfolio/igate-2025/igate-2025-reel.mp4',duration:53.25,width:1280,height:792}];
   const descriptions:string[]=[];
   for(const [index,work]of works.entries()){
    await expect(dialog.getByRole('heading')).toHaveText(work.title);
    await expect(dialog.getByLabel(`Media ${index+1} of ${works.length} in Portfolio ${project==='tenseiga'?'C':'E'}`,{exact:true})).toBeVisible();
    const details=dialog.locator('.project-details');descriptions.push(await details.locator('>p:not(.eyebrow)').innerText());
    for(const credit of project==='tenseiga'?['internship','Tenseiga_Clinic']:['Director','Cameraman','Editor'])await expect(details).toContainText(credit);
    const video=dialog.locator('video');await expect(video).toHaveAttribute('src',work.media);await expect(video).toHaveAttribute('controls','');await expect(video).toHaveAttribute('preload','metadata');
    await expect.poll(()=>video.evaluate((el:HTMLVideoElement)=>el.readyState)).toBeGreaterThanOrEqual(1);
    const state=await video.evaluate((el:HTMLVideoElement)=>({duration:el.duration,width:el.videoWidth,height:el.videoHeight,paused:el.paused,error:el.error?.code??null}));
    expect(state.duration).toBeCloseTo(work.duration,1);expect([state.width,state.height]).toEqual([work.width,work.height]);expect(state.paused).toBe(true);expect(state.error).toBeNull();
    const ratio=await video.evaluate(el=>{const box=el.getBoundingClientRect();return box.width/box.height;});expect(ratio).toBeCloseTo(work.width/work.height,2);
    expect(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
    for(const tab of await dialog.getByRole('tab').all()){const box=await tab.boundingBox(),nav=await dialog.locator('.dialog-category-nav').boundingBox();expect(box!.x).toBeGreaterThanOrEqual(nav!.x-.5);expect(box!.x+box!.width).toBeLessThanOrEqual(nav!.x+nav!.width+.5);}
    if(project==='igate'){await expect(dialog.getByRole('link',{name:'Watch on Instagram',exact:true})).toHaveAttribute('href','https://www.instagram.com/reel/DRChiwBjLnm/');await expect(dialog.getByRole('button',{name:'Next media',exact:true})).toBeDisabled();}
    await page.screenshot({path:`outputs/creative-additions/${project}-${device}-${index+1}.png`});
    await video.scrollIntoViewIfNeeded();await video.evaluate((el:HTMLVideoElement)=>el.play());await expect.poll(()=>video.evaluate((el:HTMLVideoElement)=>el.currentTime)).toBeGreaterThan(.1);
    await expect.poll(()=>page.getByTestId('voyage-music').evaluate((el:HTMLAudioElement)=>el.paused)).toBe(true);
    const old=await video.elementHandle();
    if(project==='tenseiga')await dialog.getByRole('button',{name:'Next media',exact:true}).click();else await dialog.getByRole('tab',{name:/Portfolio A/}).click();
    expect(await old!.evaluate((el:HTMLVideoElement)=>el.paused)).toBe(true);
   }
   expect(new Set(descriptions).size).toBe(works.length);expect(errors).toEqual([]);
  });
 }
}
