import {test,expect} from '@playwright/test';

for(const [device,width,height]of [['desktop',1440,1000],['phone',390,844]] as const){
 test(device+': the first opening has the same footer and layout before and after 3D loading',async({page})=>{
  await page.setViewportSize({width,height});await page.emulateMedia({reducedMotion:'no-preference'});
  const errors:string[]=[],remoteFonts:string[]=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
  page.on('request',request=>{if(/fonts\.(googleapis|gstatic)\.com/.test(request.url()))remoteFonts.push(request.url());});
  // The first frame must stay composed even when all 3D code is deliberately delayed.
  let release=()=>{};const models=new Promise<void>(resolve=>{release=resolve;});
  for(const path of ['prologue-pirate','pirate-gate'])await page.route('**/lib/'+path+'.ts*',async route=>{await models;await route.continue();});
  await page.route('https://fonts.googleapis.com/**',route=>route.abort());
  await page.route('https://fonts.gstatic.com/**',route=>route.abort());
  try{
   await page.goto('/',{waitUntil:'domcontentloaded'});await page.evaluate(()=>document.fonts.ready);
   const gate=page.getByTestId('pirate-gate'),rail=page.getByTestId('entry-threshold');
   const button=page.getByRole('button',{name:'Begin the voyage',exact:true});
   await expect(gate).toHaveAttribute('data-renderer','pending');await expect(rail).toBeVisible();await expect(button).toBeDisabled();
   await expect(page.locator('.gate-fallback,.gate-fallback-threshold')).toBeHidden();
   expect(await page.evaluate(()=>document.fonts.check('400 21px "DM Serif Display"')&&document.fonts.check('400 16px "DM Sans"'))).toBe(true);
   const geometry=()=>page.evaluate(()=>Object.fromEntries(['.gate-entry-threshold','.summit-signature','.summit-start-label','.summit-portrait'].map(selector=>{
    const element=document.querySelector(selector)!,box=element.getBoundingClientRect();
    return [selector,{x:box.x,y:box.y,width:box.width,height:box.height}];
   })));
   const before=await geometry(),threshold=before['.gate-entry-threshold'],name=before['.summit-signature'],label=before['.summit-start-label'];
   expect(name.y+name.height).toBeLessThan(threshold.y-10);
   expect(label.y+label.height).toBeLessThan(threshold.y-10);
   expect(name.x+name.width).toBeLessThan(label.x);
   expect(label.x+label.width).toBeLessThan(width);
   await page.screenshot({path:`test-results/opening-ready-pending-${device}.png`});
   release();await expect(button).toBeEnabled({timeout:30000});
   await expect(gate).toHaveAttribute('data-renderer','webgl');await expect(rail).toBeVisible();
   expect(await geometry()).toEqual(before);
   await page.screenshot({path:`test-results/opening-ready-live-${device}.png`});
   expect(remoteFonts).toEqual([]);expect(errors).toEqual([]);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }finally{release();}
 });
}
