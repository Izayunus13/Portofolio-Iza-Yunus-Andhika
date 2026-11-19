import {enterPortfolio} from './helpers/enter-portfolio';
import { test, expect, type Page } from '@playwright/test';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import { certificateCollections } from '../lib/certificates';

async function openWorld(page:Page,path='/'){
  await page.goto(path,{waitUntil:'networkidle'});await enterPortfolio(page);
  await expect(page.locator('.voyage-app')).toHaveAttribute('data-intro-complete','true',{timeout:30000});
  return page.getByTestId('voyage-world');
}
async function visit(page:Page,name:string,port:number){
  await page.getByRole('button',{name:'Visit '+name,exact:true}).click();
  await expect(page.locator('.voyage-app')).toHaveAttribute('data-current-port',String(port),{timeout:30000});
  await expect(page.locator('.portfolio-dialog:not(.certificate-dialog)')).toBeVisible();
  await page.getByRole('button',{name:'Close portfolio',exact:true}).click();
  await expect(page.locator('.portfolio-dialog:not(.certificate-dialog)')).not.toBeVisible();
}

test('loading always leaves the ship at Home waters, including legacy island URLs',async({page})=>{
  for(const path of ['/','/?island=1']){
    const world=await openWorld(page,path);
    const position=await world.getAttribute('data-ship-x');
    await page.waitForTimeout(1500);
    await expect(page.locator('.voyage-app')).toHaveAttribute('data-current-port','0');
    await expect(page.locator('.voyage-app')).toHaveAttribute('data-traveling','false');
    await expect(world).toHaveAttribute('data-route','0.0000');
    await expect(world).toHaveAttribute('data-ship-x',position!);
    await expect(page.locator('.portfolio-dialog')).not.toBeVisible();
  }
  await page.getByRole('button',{name:'Visit Bytehaven',exact:true}).click();
  await expect(page.locator('.voyage-app')).toHaveAttribute('data-current-port','1');
});

test('each 3D satellite opens a parchment popup and closes on the same island',async({page})=>{
  test.setTimeout(90000);
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  const world=await openWorld(page);
  await expect(world).toHaveAttribute('data-certificate-islands','3');
  for(const collection of certificateCollections){
    await visit(page,collection.island,collection.port);
    const shipX=await world.getAttribute('data-ship-x');
    // Closing a popup resumes the renderer; read a newly projected point after that frame.
    const point=await world.evaluate((host,port)=>new Promise<{x:number;y:number}>(resolve=>{
      const observer=new MutationObserver(()=>{
        observer.disconnect();const bounds=host.getBoundingClientRect();
        resolve({x:bounds.x+Number(host.getAttribute('data-certificate-'+port+'-x')),y:bounds.y+Number(host.getAttribute('data-certificate-'+port+'-y'))});
      });
      observer.observe(host,{attributes:true,attributeFilter:['data-certificate-'+port+'-x']});
    }),collection.port);
    await page.mouse.click(point.x,point.y);
    const popup=page.getByRole('dialog',{name:'Certificates from '+collection.island,exact:true});
    await expect(popup).toBeVisible();
    await expect(popup.getByRole('heading',{level:2})).toHaveText(collection.certificates[0].title);
    await expect(popup.locator('.certificate-thumbnails>button')).toHaveCount(collection.certificates.length);
    await expect(page).toHaveURL('http://127.0.0.1:5173/');
    await expect(popup).toHaveAttribute('data-scroll-phase','open');
    expect(await popup.locator('.dialog-shell').evaluate(el=>getComputedStyle(el).backgroundImage)).toContain('pirate-parchment.webp');
    const image=await popup.locator('.certificate-artwork').boundingBox(),story=await popup.locator('.certificate-story').boundingBox();
    expect(image!.x+image!.width).toBeLessThan(story!.x);
    if(collection.port===1)await page.screenshot({path:'outputs/certificates/popup-desktop.png'});
    await popup.getByRole('button',{name:'Close certificates',exact:true}).click();
    await expect(popup).not.toBeAttached();
    await expect(page.locator('.voyage-app')).toHaveAttribute('data-current-port',String(collection.port));
    await expect(world).toHaveAttribute('data-ship-x',shipX!);
  }
  expect(errors).toEqual([]);
});

test('legacy certificate deep links open the map, selection and enlargement stay inside it',async({page})=>{
  await openWorld(page,'/certifications/programming?certificate=programming-2');
  const popup=page.getByRole('dialog',{name:'Certificates from Bytehaven',exact:true});
  await expect(popup.getByRole('heading')).toHaveText('CS107: C++ Programming');
  await popup.getByRole('button',{name:'Next certificate',exact:true}).click();
  await expect(popup.getByRole('heading')).toHaveText('Python Essentials 2');
  await page.keyboard.press('ArrowRight');
  await expect(popup.getByRole('heading')).toHaveText('CS107: C++ Programming');
  await popup.getByRole('button',{name:/Show certificate 2:/}).click();
  await page.reload();await enterPortfolio(page);
  await expect(popup.getByRole('heading')).toHaveText('CS107: C++ Programming');
  await popup.getByRole('button',{name:/Enlarge certificate:/}).click();
  const zoom=page.getByRole('dialog',{name:'Full certificate',exact:true});
  await expect(zoom).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(zoom).not.toBeVisible();
  await expect(popup).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(popup).not.toBeAttached();
  await expect(page.locator('.voyage-app')).toHaveAttribute('data-current-port','0');
  await expect(page).toHaveURL('http://127.0.0.1:5173/');
});

test('mobile design certificate map shows all three coming-soon slots without overflowing',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await openWorld(page);
  await visit(page,'Pigment Atoll',2);
  await page.getByRole('link',{name:'Explore the certificate island',exact:false}).click();
  const popup=page.getByRole('dialog',{name:'Certificates from Pigment Atoll',exact:true});
  await expect(popup).toBeVisible();
  await popup.getByRole('button',{name:/Show certificate 3:/}).click();
  await expect(popup.getByRole('heading')).toHaveText('Coming soon');
  const dimensions=await popup.locator('.dialog-shell').evaluate(el=>({width:el.clientWidth,scroll:el.scrollWidth}));
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.width);
  await expect(popup.getByRole('button',{name:'Certificate coming soon',exact:true})).toBeDisabled();
  await expect(popup.locator('.certificate-metadata,.certificate-sample-note')).toHaveCount(0);
  await expect(popup.locator('.certificate-thumbnails>button')).toHaveCount(3);
  for(const index of [1,2,3]){
    await popup.getByRole('button',{name:`Show certificate ${index}: Coming soon`,exact:true}).click();
    await expect(popup.getByRole('heading')).toHaveText('Coming soon');
    await expect(popup.getByLabel(`Certificate ${index} of 3`,{exact:true})).toBeVisible();
    await expect(popup.getByRole('button',{name:'Certificate coming soon',exact:true})).toBeDisabled();
  }
  await popup.locator('.dialog-shell').evaluate(el=>el.scrollTop=0);
  await page.screenshot({path:'outputs/certificates/popup-mobile.png'});
  await popup.getByRole('button',{name:'Back to the voyage',exact:true}).click();
  await expect(popup).not.toBeAttached();
  await expect(page.locator('.voyage-app')).toHaveAttribute('data-current-port','2');
});

test('normal motion unrolls and rolls the map, with a dimensional certificate frame',async({page})=>{
  test.setTimeout(60000);
  await page.emulateMedia({reducedMotion:'no-preference'});
  const world=await openWorld(page,'/?island=1');
  await page.waitForTimeout(1200);
  await expect(world).toHaveAttribute('data-route','0.0000');
  await visit(page,'Bytehaven',1);
  const label=page.getByRole('link',{name:'Explore the certificate island',exact:false});
  await label.click();
  const popup=page.getByRole('dialog',{name:'Certificates from Bytehaven',exact:true});
  await expect(popup).toHaveAttribute('data-scroll-phase','opening');
  await expect(popup).toHaveAttribute('data-scroll-phase','open',{timeout:7000});
  expect(await popup.locator('.certificate-enlarge').evaluate(el=>getComputedStyle(el).transform)).toContain('matrix3d');
  await page.screenshot({path:'outputs/certificates/popup-3d-desktop.png'});
  await popup.getByRole('button',{name:/Show certificate 1:/}).click();
  await popup.getByRole('button',{name:'Next certificate',exact:true}).click();
  await expect(popup.getByRole('heading')).toHaveText('CS107: C++ Programming');
  await popup.getByRole('button',{name:'Close certificates',exact:true}).click();
  await expect(popup).toHaveAttribute('data-scroll-phase','closing');
  await expect(popup).not.toBeAttached();
  await expect(page.locator('.voyage-app')).toHaveAttribute('data-current-port','1');
  await label.click();
  await expect(popup).toHaveAttribute('data-scroll-phase','open',{timeout:7000});
  await page.mouse.click(5,5);
  await expect(popup).not.toBeAttached();
});

for(const [device,width,height]of [['desktop',1440,1000],['phone',390,844]]as const){
 test(`${device}: Bytehaven shows two earned credentials and preserves their complete PDFs`,async({page,request})=>{
  test.setTimeout(60000);await page.setViewportSize({width,height});
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await openWorld(page);await visit(page,'Bytehaven',1);
  const link=page.getByRole('link',{name:'Explore the certificate island',exact:false});await expect(link).toContainText('02 certificates');await link.click();
  const popup=page.getByRole('dialog',{name:'Certificates from Bytehaven',exact:true});
  await expect(popup.locator('.certificate-thumbnails>button')).toHaveCount(2);
  await expect(popup.locator('.certificate-sample-note')).toHaveCount(0);
  const hashes=JSON.parse(readFileSync('public/certificates/programming/manifest.json','utf8')) as {document:string;sha256:string}[];
  for(const [index,stem,title,issuer,date,id]of [
   [0,'python-essentials-2','Python Essentials 2','Cisco Networking Academy','2 July 2026','7aa4eb5c-b8e6-402c-b85b-d87853207cb4'],
   [1,'cs107-cpp-programming','CS107: C++ Programming','Saylor University','21 July 2026','0074043491IY'],
  ]as const){
   await expect(popup.getByRole('heading')).toHaveText(title);
   for(const value of [issuer,date,id])await expect(popup.locator('.certificate-metadata')).toContainText(value);
   const image=popup.locator('.certificate-enlarge>img');await image.evaluate((el:HTMLImageElement)=>el.decode());
   const ratio=await image.evaluate((el:HTMLImageElement)=>{const rect=el.getBoundingClientRect();return {display:rect.width/rect.height,native:el.naturalWidth/el.naturalHeight};});
   expect(ratio.display,'The certificate image must keep its native proportions').toBeCloseTo(ratio.native,2);
   const pdf='/certificates/programming/'+stem+'.pdf';
   await expect(popup.getByRole('link',{name:'Open certificate PDF',exact:true})).toHaveAttribute('href',pdf);
   const response=await request.get(pdf);expect(response.ok()).toBe(true);expect(response.headers()['content-type']).toContain('application/pdf');
   const bytes=await response.body();expect(bytes.subarray(0,4).toString()).toBe('%PDF');expect(createHash('sha256').update(bytes).digest('hex')).toBe(hashes[index].sha256);
   if(index===0)await expect(popup.getByRole('link',{name:'Verify credential',exact:false})).toHaveCount(0);
   else{
    await expect(popup.locator('.certificate-description')).toContainText('40 hours');await expect(popup.locator('.certificate-description')).toContainText('4 Continuing Education Units');await expect(popup.locator('.certificate-description')).toContainText('87.50%');
    await expect(popup.getByRole('link',{name:'Verify credential',exact:false})).toHaveAttribute('href','https://learn.saylor.org/admin/tool/certificate/index.php?code=0074043491IY');
   }
   expect(await popup.locator('.dialog-shell').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
   await popup.getByRole('button',{name:/Enlarge certificate:/}).click();
   const zoom=page.getByRole('dialog',{name:'Full certificate',exact:true});await expect(zoom).toBeVisible();await expect(zoom.getByRole('link',{name:'Open original PDF',exact:false})).toHaveAttribute('href',pdf);
   await page.getByRole('button',{name:'Close full certificate',exact:true}).click();
   await popup.locator('.dialog-shell').evaluate(el=>el.scrollTop=0);await page.screenshot({path:`outputs/certificates/earned-${device}-${index+1}.png`});
   await expect(popup.getByLabel(`Certificate ${index+1} of 2`,{exact:true})).toBeVisible();
   await popup.getByRole('button',{name:'Next certificate',exact:true}).click();
  }
  await expect(popup.getByRole('heading')).toHaveText('Python Essentials 2');
  await popup.getByRole('button',{name:'Previous certificate',exact:true}).click();await expect(popup.getByRole('heading')).toHaveText('CS107: C++ Programming');
  await popup.getByRole('button',{name:'Close certificates',exact:true}).click();await expect(popup).not.toBeAttached();
  await expect(page.locator('.voyage-app')).toHaveAttribute('data-current-port','1');expect(errors).toEqual([]);
 });
}
