import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {Texture,Mesh,MeshBasicMaterial} from 'three';
import {createCertificateIsland} from '../lib/certificate-islands';
import {enterPortfolio} from './helpers/enter-portfolio';

const manifest=JSON.parse(readFileSync('public/certificates/videography/manifest.json','utf8')) as {image:string;originalImage:string;sha256:string};

test('the third island board keeps its one earned award visible across slideshow cycles',()=>{
 const texture=new Texture();texture.image={width:1800,height:1296};
 const board=createCertificateIsland(3,new Map([[manifest.image,texture]]));
 const faces:MeshBasicMaterial[]=[];
 board.root.traverse(object=>{if(object instanceof Mesh){const materials=Array.isArray(object.material)?object.material:[object.material];for(const material of materials)if(material instanceof MeshBasicMaterial&&material.map===texture)faces.push(material);}});
 expect(faces).toHaveLength(2);
 for(const time of [0,4.6,9.4,14.2,48]){board.update(time);expect(board.selected).toBe(0);expect(faces.map(face=>face.opacity).sort()).toEqual([0,1]);}
});

for(const [device,width,height]of [['desktop',1440,1000],['phone',390,844]]as const){
 test(`${device}: Framewake has the POINTS award followed by two honest coming-soon slots`,async({page,request})=>{
  test.setTimeout(60000);await page.setViewportSize({width,height});
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/',{waitUntil:'networkidle'});await enterPortfolio(page);
  await expect(page.locator('.voyage-app')).toHaveAttribute('data-intro-complete','true',{timeout:30000});
  await page.getByRole('button',{name:'Visit Framewake Bay',exact:true}).click();
  await page.getByRole('button',{name:'Close portfolio',exact:true}).click();
  await expect(page.locator('.portfolio-dialog:not(.certificate-dialog)')).not.toBeVisible();
  const link=page.getByRole('link',{name:'Explore the certificate island',exact:false});await expect(link).toContainText('01 certificate / 02 coming soon');await link.click();
  const popup=page.getByRole('dialog',{name:'Certificates from Framewake Bay',exact:true});
  await expect(popup.getByRole('heading')).toHaveText('Juara I Video - POINTS 2024');
  await expect(popup.locator('.certificate-description')).toContainText('21 September to 26 October 2024');
  await expect(popup.locator('.certificate-metadata')).toContainText('Fakultas Sains dan Matematika, Universitas Diponegoro');
  await expect(popup.locator('.certificate-metadata dt')).toHaveCount(1);
  await expect(popup.locator('.certificate-thumbnails>button')).toHaveCount(3);
  await expect(popup.locator('.certificate-sample-note')).toHaveCount(0);
  const image=popup.locator('.certificate-enlarge>img');await expect(image).toHaveAttribute('src',manifest.image);await image.evaluate((el:HTMLImageElement)=>el.decode());
  const fit=await image.evaluate((el:HTMLImageElement)=>{const box=el.getBoundingClientRect();return {ratio:box.width/box.height,native:el.naturalWidth/el.naturalHeight};});expect(fit.ratio).toBeCloseTo(fit.native,2);expect(fit.native).toBeCloseTo(2950/2124,3);
  await popup.getByRole('button',{name:/Enlarge certificate:/}).click();
  const zoom=page.getByRole('dialog',{name:'Full certificate',exact:true});await expect(zoom).toBeVisible();await expect(zoom.getByRole('link',{name:'Open original image',exact:false})).toHaveAttribute('href',manifest.originalImage);
  const response=await request.get(manifest.originalImage);expect(response.ok()).toBe(true);expect(createHash('sha256').update(await response.body()).digest('hex')).toBe(manifest.sha256);
  await page.getByRole('button',{name:'Close full certificate',exact:true}).click();
  await popup.locator('.dialog-shell').evaluate(el=>el.scrollTop=0);await page.screenshot({path:`outputs/certificates/video-award-${device}.png`});
  for(const index of [2,3]){
   await popup.getByRole('button',{name:'Next certificate',exact:true}).click();
   await expect(popup.getByLabel(`Certificate ${index} of 3`,{exact:true})).toBeVisible();
   await expect(popup.getByRole('heading')).toHaveText('Coming soon');
   await expect(popup.getByRole('button',{name:`Show certificate ${index}: Coming soon`,exact:true})).toHaveAttribute('aria-pressed','true');
   await expect(popup.locator('.certificate-thumbnails>button').nth(index-1).locator('small')).toContainText('COMING SOON');
   await expect(popup.getByRole('button',{name:'Certificate coming soon',exact:true})).toBeDisabled();
   await expect(popup.locator('.certificate-pending-note')).toBeVisible();
   await expect(popup.locator('.certificate-metadata,.certificate-sample-note')).toHaveCount(0);
   await expect(popup.getByRole('link',{name:/Verify credential|Open certificate PDF/})).toHaveCount(0);
   expect(await popup.locator('.dialog-shell').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
   if(index===2){await popup.locator('.dialog-shell').evaluate(el=>el.scrollTop=0);await page.screenshot({path:`outputs/certificates/video-coming-soon-${device}.png`});}
  }
  await popup.getByRole('button',{name:'Next certificate',exact:true}).click();await expect(popup.getByRole('heading')).toHaveText('Juara I Video - POINTS 2024');
  await popup.getByRole('button',{name:'Close certificates',exact:true}).click();await expect(popup).not.toBeAttached();await expect(page.locator('.voyage-app')).toHaveAttribute('data-current-port','3');expect(errors).toEqual([]);
 });
}

test('an entirely coming-soon island has one stable board preview and no empty slideshow',()=>{
 const texture=new Texture();texture.image={width:960,height:660};
 const board=createCertificateIsland(2,new Map([['/certificates/coming-soon.svg',texture]]));
 for(const time of [0,4.6,9.4,48]){expect(()=>board.update(time)).not.toThrow();expect(board.selected).toBe(0);}
});
