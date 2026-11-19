import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// Cache the existing 3D model and feathered cloud alpha once, rather than rendering them on every visit.
const browser=await chromium.launch({headless:true,...(process.platform==='win32'?{channel:'msedge'}:{})});
try{
  const page=await browser.newPage();await page.goto('http://127.0.0.1:5173/textures/loading-cloud-bank.webp',{waitUntil:'domcontentloaded'});
  const assets=await page.evaluate(async()=>{
    const {createCloudBirds}=await import('/lib/cloud-birds.ts');
    const host=document.createElement('div');host.style.cssText='position:fixed;width:128px;height:128px;left:-1000px';document.body.append(host);
    const birds=createCloudBirds(host);let atlas;
    try{atlas=birds.renderAtlas();}finally{birds.dispose();host.remove();}
    const image=new Image();image.src='/textures/loading-cloud-bank.webp';await image.decode();
    const clouds=[640,1024].map(width=>{
      const canvas=document.createElement('canvas');canvas.width=width;canvas.height=Math.round(width*image.height/image.width);
      const context=canvas.getContext('2d');context.drawImage(image,0,0,canvas.width,canvas.height);context.globalCompositeOperation='destination-in';
      const horizontal=context.createLinearGradient(0,0,canvas.width,0);horizontal.addColorStop(0,'transparent');horizontal.addColorStop(.12,'#000');horizontal.addColorStop(.84,'#000');horizontal.addColorStop(1,'transparent');context.fillStyle=horizontal;context.fillRect(0,0,canvas.width,canvas.height);
      const vertical=context.createLinearGradient(0,0,0,canvas.height);vertical.addColorStop(0,'transparent');vertical.addColorStop(.12,'#000');vertical.addColorStop(.88,'#000');vertical.addColorStop(1,'transparent');context.fillStyle=vertical;context.fillRect(0,0,canvas.width,canvas.height);
      return {width,data:canvas.toDataURL('image/webp',.84)};
    });return [{name:'intro-seagull-atlas.webp',data:atlas},...clouds.map(cloud=>({name:'loading-cloud-soft-'+cloud.width+'.webp',data:cloud.data}))];
  });
  for(const asset of assets){const data=Buffer.from(asset.data.split(',')[1],'base64');await writeFile(fileURLToPath(new URL('../public/textures/'+asset.name,import.meta.url)),data);console.log(asset.name+' '+data.byteLength+' bytes');}
}finally{await browser.close();}
