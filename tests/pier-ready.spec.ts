import {test,expect} from '@playwright/test';

for(const [name,width,height]of [['desktop',1440,1000],['wide',1600,900],['laptop',1280,720],['phone',390,844],['tall-phone',430,932],['breakpoint',700,900]]as const){
 test(`${name}: pier framing matches the first poster and stays fixed during the welcome`,async({page})=>{
  await page.setViewportSize({width,height});await page.emulateMedia({reducedMotion:'no-preference'});
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  let release=()=>{};const loading=new Promise<void>(resolve=>{release=resolve;});
  await page.route('**/lib/prologue-pirate.ts*',async route=>{await loading;await route.continue();});
  try{
   await page.goto('/',{waitUntil:'domcontentloaded'});
   const harbor=page.getByTestId('pirate-harbor');
   await expect(harbor).toHaveAttribute('data-renderer','pending');
   await expect.poll(()=>harbor.locator('.pirate-harbor-poster img').evaluate((img:HTMLImageElement)=>img.complete&&img.naturalWidth>0)).toBe(true);
   // Isolate the scene's physical foreground from copy, portraits, and flying birds.
   await page.addStyleTag({content:'.summit-welcome,.summit-portrait,.summit-brand,.summit-signature,.summit-start,.pirate-sea-mist,.harbor-birds,.voyage-sound-dock,.pirate-gate{visibility:hidden!important}'});
   const clip={x:16,y:Math.floor(height*.88),width:Math.floor(Math.min(360,width*.35)),height:Math.floor(height*.04)};
   const poster=await page.screenshot({clip});
   release();await expect(harbor).toHaveAttribute('data-renderer','webgl',{timeout:30000});
   const begin=page.getByRole('button',{name:'Begin the voyage',exact:true,includeHidden:true});
   await expect(begin).toBeEnabled({timeout:30000});
   const live=await page.screenshot({clip});
   const difference=await page.evaluate(async([a,b])=>{
    const images=await Promise.all([a,b].map(async data=>createImageBitmap(await(await fetch('data:image/png;base64,'+data)).blob())));
    const canvas=document.createElement('canvas');canvas.width=images[0].width;canvas.height=images[0].height;
    const context=canvas.getContext('2d')!,pixels=images.map(image=>{context.clearRect(0,0,canvas.width,canvas.height);context.drawImage(image,0,0);return context.getImageData(0,0,canvas.width,canvas.height).data;});
    let sum=0,large=0;
    for(let i=0;i<pixels[0].length;i+=4){let difference=0;for(let channel=0;channel<3;channel++)difference+=Math.abs(pixels[0][i+channel]-pixels[1][i+channel]);sum+=difference;if(difference/3>35)large++;}
    const count=canvas.width*canvas.height;images.forEach(image=>image.close());return {mean:sum/count/3,large:large/count};
   },[poster.toString('base64'),live.toString('base64')]);
   expect(difference.mean,'The poster and live dock must share their perspective').toBeLessThan(12);
   expect(difference.large).toBeLessThan(.12);
   await page.screenshot({path:`test-results/pier-ready-${name}.png`});
   await begin.evaluate(button=>(button as HTMLButtonElement).click());
   await expect(page.getByTestId('voyage-prologue')).toHaveAttribute('data-phase','welcoming');
   await page.waitForTimeout(1600);
   const welcome=await page.screenshot({clip});
   expect(live.equals(welcome),'The dock must not zoom, stretch, or expose water through the seams').toBe(true);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   expect(errors).toEqual([]);
  }finally{release();}
 });
}
