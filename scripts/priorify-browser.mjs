import {chromium} from '@playwright/test';
import sharp from 'sharp';
import {mkdir,writeFile} from 'node:fs/promises';
import {createInterface} from 'node:readline';
const output='public/portfolio/priorify-ai';
await mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1.5,reducedMotion:'reduce',timezoneId:'Asia/Jakarta'});
const page=await context.newPage();page.setDefaultTimeout(12000);
const captures=[],requests=[];
page.on('request',r=>{if(!['GET','HEAD','OPTIONS'].includes(r.method()))requests.push({method:r.method(),path:new URL(r.url()).pathname});});
await page.goto('https://priorify-ai-nu.vercel.app/',{waitUntil:'networkidle',timeout:60000});
async function inspect(){return {url:page.url(),text:(await page.locator('body').innerText()).slice(0,23000),controls:await page.locator('button,a,input,textarea,select,[role="tab"],[role="dialog"]').evaluateAll(ns=>ns.filter(n=>n.getBoundingClientRect().width&&n.getBoundingClientRect().height).map(n=>({tag:n.tagName,text:n.innerText?.slice(0,240),type:n.type,id:n.id,name:n.name,placeholder:n.getAttribute('placeholder'),label:n.getAttribute('aria-label'),role:n.getAttribute('role'),options:n.tagName==='SELECT'?[...n.options].map(o=>({value:o.value,text:o.text})):undefined}))),requests};}
async function execute(c){
 const target=()=>c.selector?page.locator(c.selector).first():page.getByRole(c.role??'button',{name:c.name,exact:c.exact??true}).first();
 switch(c.action){
 case 'inspect':return await inspect();
 case 'click':await target().click();await page.waitForTimeout(750);return await inspect();
 case 'fill':await target().fill(c.value);return await inspect();
 case 'select':await target().selectOption(c.value);return await inspect();
 case 'press':await page.keyboard.press(c.key);return await inspect();
 case 'viewport':await page.setViewportSize(c.viewport);return {ok:true};
 case 'scroll':if(c.selector)await target().scrollIntoViewIfNeeded();else await page.evaluate(y=>window.scrollTo(0,y),c.y??0);return {ok:true};
 case 'dom':return {html:await target().evaluate(n=>n.outerHTML.slice(0,20000))};
 case 'shot':{
  await page.evaluate(()=>document.fonts.ready);await page.evaluate(()=>document.activeElement instanceof HTMLElement&&document.activeElement.blur());await page.mouse.move(1430,990);await page.waitForTimeout(300);
  const bytes=await (c.selector?target():page).screenshot({animations:'disabled',fullPage:c.fullPage??false});
  await sharp(bytes).webp({quality:92}).toFile(output+'/'+c.file+'.webp');
  captures.push({file:c.file+'.webp',viewport:page.viewportSize(),text:(await (c.selector?target():page.locator('body')).innerText()).slice(0,20000)});return {ok:true,file:c.file,captures:captures.length};
 }
 case 'finish':await writeFile(output+'/capture-notes.json',JSON.stringify({source:'https://priorify-ai-nu.vercel.app/',capturedAt:new Date().toISOString(),notes:'Original browser screenshots of the public website and its built-in demo. Any sample entries are illustrative demo data.',captures},null,2));return {ok:true,captures:captures.length};
 default:throw Error('Unknown command');
 }
}
if(process.stdin.isTTY)process.stdin.setRawMode(true);
console.log('Ready for Priorify browser JSON.');
const input=createInterface({input:process.stdin,terminal:false});
try{for await(const line of input){if(!line.trim())continue;try{const data=JSON.parse(line);if(data.action==='exit')break;for(const c of Array.isArray(data)?data:[data])console.log(JSON.stringify(await execute(c)));}catch(e){console.log(JSON.stringify({ok:false,message:e.message}));}}}finally{await browser.close()}
