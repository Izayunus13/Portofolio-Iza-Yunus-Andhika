import {enterPortfolio} from './helpers/enter-portfolio';
import { test, expect, type Page } from '@playwright/test';

declare global{
  interface Window{
    __soundProbe:{voices:{loop:boolean;ended:boolean;duration:number;started:number}[];analysers:AnalyserNode[]};
  }
}
async function observeAudio(page:Page){
  await page.addInitScript(()=>{
    window.__soundProbe={voices:[],analysers:[]};
    const makeSource=AudioContext.prototype.createBufferSource,connect=AudioNode.prototype.connect;
    AudioContext.prototype.createBufferSource=function(){
      const source=Reflect.apply(makeSource,this,[]) as AudioBufferSourceNode;
      const start=source.start,stop=source.stop;
      const record={loop:false,ended:false,duration:0,started:0};
      source.start=function(...args:[number?,number?,number?]){
        record.loop=source.loop;record.started=args[0]??source.context.currentTime;
        window.__soundProbe.voices.push(record);
        return Reflect.apply(start,source,args);
      };
      source.stop=function(when?:number){
        record.duration=(when??source.context.currentTime)-record.started;
        return Reflect.apply(stop,source,when===undefined?[]:[when]);
      };
      source.addEventListener('ended',()=>{record.ended=true;});
      return source;
    };
    Object.defineProperty(AudioNode.prototype,'connect',{configurable:true,writable:true,value:function(this:AudioNode,destination:AudioNode|AudioParam,...args:number[]){
      if(destination instanceof AudioDestinationNode){
        const analyser=this.context.createAnalyser();analyser.fftSize=2048;
        window.__soundProbe.analysers.push(analyser);
        Reflect.apply(connect,this,[analyser]);Reflect.apply(connect,analyser,[destination]);return destination;
      }
      return Reflect.apply(connect,this,[destination,...args]);
    }});
  });
}
async function openWorld(page:Page){
  await page.goto('/',{waitUntil:'networkidle'});await enterPortfolio(page);
  await expect(page.locator('.voyage-app')).toHaveAttribute('data-intro-complete','true');
}
async function enable(page:Page){
  const toggle=page.locator('.voyage-sound-dock [data-sound-toggle]');
  if(await toggle.getAttribute('aria-pressed')!=='true')await toggle.click();
  await expect.poll(()=>page.getByTestId('voyage-music').evaluate((element:HTMLAudioElement)=>!element.paused&&element.readyState>=2),{timeout:20000}).toBe(true);
}
async function rms(page:Page){
  return page.evaluate(()=>{
    const analyser=window.__soundProbe.analysers[0];if(!analyser)return 0;
    const samples=new Float32Array(analyser.fftSize);analyser.getFloatTimeDomainData(samples);
    return Math.sqrt(samples.reduce((sum,value)=>sum+value*value,0)/samples.length);
  });
}

test('soundtrack starts from the opening, loops, and follows the saved sound switch',async({page})=>{
  await observeAudio(page);
  const requests:string[]=[];page.on('request',request=>{if(request.url().includes('/audio/'))requests.push(request.url());});
  await openWorld(page);
  expect(requests.length).toBeGreaterThan(0);
  await expect(page.getByTestId('voyage-music')).toHaveAttribute('loop','');
  await enable(page);
  await expect.poll(()=>page.getByTestId('voyage-music').evaluate((element:HTMLAudioElement)=>element.currentTime)).toBeGreaterThan(.15);
  expect(await page.getByTestId('voyage-music').evaluate((element:HTMLAudioElement)=>element.duration)).toBeGreaterThan(1);
  await page.getByTestId('voyage-music').evaluate((element:HTMLAudioElement)=>{element.currentTime=element.duration-.15;});
  await expect.poll(()=>page.getByTestId('voyage-music').evaluate((element:HTMLAudioElement)=>element.currentTime),{timeout:5000}).toBeLessThan(5);
  await page.locator('.voyage-sound-dock').getByRole('button',{name:'Turn sound off',exact:true}).click();
  expect(await page.evaluate(()=>localStorage.getItem('iza-voyage-sound'))).toBe('off');
  await expect.poll(()=>page.getByTestId('voyage-music').evaluate((element:HTMLAudioElement)=>element.paused)).toBe(true);
  await expect.poll(()=>rms(page)).toBeLessThan(.00001);
  await page.reload();await enterPortfolio(page);
  await expect(page.locator('.voyage-app')).toHaveAttribute('data-intro-complete','true');
  await page.getByRole('button',{name:'Meet the captain',exact:true}).click();
  await expect(page.locator('.about-dialog')).toBeVisible();
  expect(await page.getByTestId('voyage-music').evaluate((element:HTMLAudioElement)=>element.paused)).toBe(true);
  await page.locator('.about-dialog').getByRole('button',{name:'Turn sound on',exact:true}).click();
  await expect.poll(()=>page.getByTestId('voyage-music').evaluate((element:HTMLAudioElement)=>!element.paused),{timeout:10000}).toBe(true);
});

test('cloud whoosh produces audio at the opening animation after enabling sound',async({page})=>{
  await observeAudio(page);await page.emulateMedia({reducedMotion:'no-preference'});
  let release=()=>{};const gate=new Promise<void>(resolve=>{release=resolve;});
  await page.route('**/lib/voyage-engine.ts*',async route=>{await gate;await route.continue();});
  try{
    await page.goto('/',{waitUntil:'domcontentloaded'});await enterPortfolio(page);
    await enable(page);
    release();
    await expect(page.getByTestId('cloud-loading')).toHaveAttribute('data-phase','opening',{timeout:30000});
    await expect.poll(()=>page.evaluate(()=>window.__soundProbe.voices.some(voice=>!voice.loop&&voice.duration>2.3))).toBe(true);
    await expect.poll(()=>rms(page),{timeout:2000}).toBeGreaterThan(.0001);
    await expect(page.locator('.voyage-app')).toHaveAttribute('data-intro-complete','true');
    await expect(page.locator('.voyage-app')).toHaveAttribute('data-current-port','0');
  }finally{release();}
});

test('clicks and both kinds of parchment create audible effects; modal sound controls stay synchronized',async({page})=>{
  await observeAudio(page);await openWorld(page);await enable(page);
  const before=await page.evaluate(()=>window.__soundProbe.voices.length);
  await page.getByRole('button',{name:'Meet the captain',exact:true}).click();
  await expect.poll(()=>page.evaluate(()=>window.__soundProbe.voices.length)).toBeGreaterThan(before);
  await expect.poll(()=>rms(page)).toBeGreaterThan(.0001);
  await page.getByRole('button',{name:'Close dialog',exact:true}).click();
  await page.getByRole('button',{name:'Visit Bytehaven',exact:true}).click();
  const portfolio=page.locator('.portfolio-dialog:not(.certificate-dialog)');
  await expect(portfolio).toBeVisible();
  expect(await page.evaluate(()=>window.__soundProbe.voices.some(voice=>!voice.loop&&voice.duration>1.9&&voice.duration<2.2))).toBe(true);
  await portfolio.getByRole('button',{name:'Close portfolio',exact:true}).click();
  await page.getByRole('link',{name:'Explore the certificate island',exact:false}).click();
  const certificate=page.getByRole('dialog',{name:'Certificates from Bytehaven',exact:true});
  await expect(certificate).toBeVisible();
  expect(await page.evaluate(()=>window.__soundProbe.voices.some(voice=>!voice.loop&&voice.duration>1&&voice.duration<1.3))).toBe(true);
  await certificate.getByRole('button',{name:'Turn sound off',exact:true}).click();
  await expect(page.locator('.voyage-sound-dock [data-sound-toggle]')).toHaveAttribute('aria-pressed','false');
  await expect.poll(()=>rms(page)).toBeLessThan(.00001);
});

test('water ambience follows sailing, fades at arrival, and respects muting mid-voyage',async({page})=>{
  test.setTimeout(60000);
  await observeAudio(page);await page.emulateMedia({reducedMotion:'no-preference'});
  await openWorld(page);await enable(page);
  const dock=page.locator('.voyage-sound-dock');
  await page.getByRole('button',{name:'Visit Bytehaven',exact:true}).click();
  await expect(dock).toHaveAttribute('data-water-playing','true');
  await expect.poll(()=>page.evaluate(()=>window.__soundProbe.voices.filter(voice=>voice.loop&&!voice.ended).length)).toBeGreaterThan(0);
  await expect.poll(()=>rms(page)).toBeGreaterThan(.001);
  await dock.getByRole('button',{name:'Turn sound off',exact:true}).click();
  await expect(dock).toHaveAttribute('data-water-playing','false');
  await expect.poll(()=>page.evaluate(()=>window.__soundProbe.voices.filter(voice=>voice.loop&&!voice.ended).length)).toBe(0);
  await dock.getByRole('button',{name:'Turn sound on',exact:true}).click();
  await expect(dock).toHaveAttribute('data-water-playing','true');
  await expect(page.locator('.voyage-app')).toHaveAttribute('data-current-port','1',{timeout:20000});
  await expect(dock).toHaveAttribute('data-water-playing','false');
  await expect.poll(()=>page.evaluate(()=>window.__soundProbe.voices.filter(voice=>voice.loop&&!voice.ended).length)).toBe(0);
  expect(await page.getByTestId('voyage-music').evaluate((element:HTMLAudioElement)=>element.paused)).toBe(false);
});

test('sound controls fit a phone and remain accessible inside the certificate map',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await openWorld(page);await enable(page);
  await page.getByRole('button',{name:'Visit Pigment Atoll',exact:true}).click();
  await expect(page.locator('.portfolio-dialog:not(.certificate-dialog)')).toBeVisible();
  await page.getByRole('button',{name:'Close portfolio',exact:true}).click();
  await page.getByRole('link',{name:'Explore the certificate island',exact:false}).click();
  const popup=page.getByRole('dialog',{name:'Certificates from Pigment Atoll',exact:true});
  const toggle=popup.getByRole('button',{name:'Turn sound off',exact:true});
  await expect(toggle).toBeVisible();
  const bounds=await toggle.boundingBox(),close=await popup.getByRole('button',{name:'Close certificates',exact:true}).boundingBox();
  expect(bounds!.x+bounds!.width).toBeLessThan(close!.x);
  expect(await popup.locator('.dialog-shell').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
  await page.screenshot({path:'outputs/audio/sound-mobile-map.png'});
});
