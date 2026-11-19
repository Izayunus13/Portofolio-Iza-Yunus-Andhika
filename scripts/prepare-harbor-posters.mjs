import {chromium} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

// Store the exact first live frame, before any CSS transforms or viewport cropping.
const browser=await chromium.launch({headless:true,...(process.platform==='win32'?{channel:'msedge'}:{})});
try{
 for(const [name,width,height]of [['desktop',1440,1000],['phone',390,844]]){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
  // The capture owns its only renderer; leave the regular application on its poster.
  await page.route('**/lib/prologue-pirate.ts*',route=>route.abort());
  await page.route('**/lib/pirate-gate.ts*',route=>route.abort());
  await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
  await page.unroute('**/lib/prologue-pirate.ts*');
  await page.evaluate(async()=>{
   document.body.replaceChildren();
   const host=document.createElement('div');host.className='pirate-backdrop pirate-backdrop-harbor';host.style.cssText='position:fixed;inset:0';document.body.append(host);
   const {createPirateEnvironment}=await import('/lib/prologue-pirate.ts');
   const instance=createPirateEnvironment(host,'harbor',true);
   if(!instance)throw new Error('WebGL is required to prepare a matching harbor poster');
   // Keep the still renderer alive until the browser composites its transparent sky over the CSS background.
  });
  const output=fileURLToPath(new URL('../public/images/prologue/harbor-opening-'+name+'.jpg',import.meta.url));
  const image=await page.screenshot({type:'jpeg',quality:95});await writeFile(output,image);
  console.log(name+': '+image.byteLength+' bytes');await page.close();
 }
}finally{await browser.close();}
