import {chromium} from '@playwright/test';
import sharp from 'sharp';
import {mkdir,writeFile} from 'node:fs/promises';
import {createInterface} from 'node:readline';
const output='public/portfolio/anjemin/authenticated';
await mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
const sessions=new Map();const captures=[];let active=null;
const redact=text=>text.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,'[email hidden]').replace(/(?<!\w)\+?\d[\d -]{8,}\d(?!\w)/g,'[contact or identifier hidden]');
async function inspect(page){return {text:redact((await page.locator('body').innerText()).slice(0,18000)),controls:await page.locator('button,a,input,select,summary').evaluateAll(ns=>ns.filter(n=>n.getBoundingClientRect().width&&n.getBoundingClientRect().height&&!n.closest('[inert]')).map(n=>({tag:n.tagName,text:n.tagName==='INPUT'?'':n.innerText.slice(0,140),type:n.type,id:n.id,name:n.name,placeholder:n.getAttribute('placeholder'),attrs:Object.fromEntries([...n.attributes].filter(a=>a.name.startsWith('data-')).map(a=>[a.name,a.value])),options:n.tagName==='SELECT'?[...n.options].map(o=>({value:o.value,text:o.text})):undefined})).slice(0,140))};}
async function execute(command){
 if(command.action==='login'){
  const {username,password,expected}=command.account;
  const context=await browser.newContext({viewport:{width:1600,height:1100},deviceScaleFactor:1.5,reducedMotion:'reduce',timezoneId:'Asia/Jakarta'});
  await context.route('**/api/**',route=>{const r=route.request();const allow=['GET','HEAD','OPTIONS'].includes(r.method())||new URL(r.url()).pathname==='/api/auth/login';return allow?route.continue():route.abort();});
  const page=await context.newPage();page.setDefaultTimeout(10000);
  await page.goto('https://anjemin.vercel.app/',{waitUntil:'networkidle',timeout:60000});
  if(!await page.locator('#login-form').count())await page.locator('[data-action="login"]').first().click();
  await page.locator('#login-form [name="identifier"]').fill(username);
  await page.locator('#login-form [name="password"]').fill(password);
  const responsePromise=page.waitForResponse(r=>new URL(r.url()).pathname==='/api/auth/login'&&r.request().method()==='POST');
  await page.locator('#login-form button[type="submit"]').click();
  const response=await responsePromise;const data=await response.json();
  if(!response.ok()||!data.user){await context.close();return {ok:false,action:'login',account:expected,status:response.status(),message:data.error||data.message||'Login failed'};}
  await page.locator('#app-sidebar').waitFor({state:'attached'});await page.waitForTimeout(1000);
  sessions.set(expected,{page,context,role:data.user.role});active=expected;
  return {ok:true,action:'login',account:expected,role:data.user.role,...await inspect(page)};
 }
 if(command.action==='use'){if(!sessions.has(command.account))throw Error('Session not found');active=command.account;return {ok:true,account:active};}
 if(command.action==='finish'){await writeFile(output+'/capture-notes.json',JSON.stringify({source:'https://anjemin.vercel.app/',capturedAt:new Date().toISOString(),notes:'Authenticated browser captures using user-authorized demo accounts. Credentials and session state are not persisted. Contact details are masked where present. No OTP, booking, payment, message, document upload, approval, availability, or account mutation was submitted.',captures},null,2));return {ok:true,captures:captures.length,files:captures.map(c=>c.file)};}
 const page=sessions.get(active)?.page;if(!page)throw Error('Select an authenticated session first');
 switch(command.action){
  case 'inspect':return {ok:true,account:active,...await inspect(page)};
  case 'dom':return {ok:true,html:await page.locator(command.selector).first().evaluate(n=>n.outerHTML.slice(0,22000)),count:await page.locator(command.selector).count()};
  case 'nav':{const menu=page.locator('#app-sidebar');const item=menu.locator('[data-nav="'+command.page+'"]').first();if((command.page.startsWith('market')||command.page==='chat')&&await page.locator('[data-market-menu]').count()&&await page.locator('[data-market-menu]').getAttribute('aria-expanded')==='false')await page.locator('[data-market-menu]').click();await item.click();await page.waitForTimeout(900);return {ok:true,account:active,...await inspect(page)};}
  case 'click':await page.locator(command.selector).first().click();await page.waitForTimeout(700);return {ok:true,account:active,...await inspect(page)};
  case 'fill':await page.locator(command.selector).fill(command.value);await page.waitForTimeout(450);return {ok:true,account:active,...await inspect(page)};
  case 'select':await page.locator(command.selector).selectOption(command.value);await page.waitForTimeout(650);return {ok:true,account:active,...await inspect(page)};
  case 'viewport':await page.setViewportSize(command.viewport);await page.waitForTimeout(350);return {ok:true};
  case 'scroll':if(command.selector){await page.locator(command.selector).first().scrollIntoViewIfNeeded();}else{await page.evaluate(position=>window.scrollTo(0,position==='bottom'?document.body.scrollHeight:0),command.position)}return {ok:true};
  case 'closeModal':if(await page.locator('[data-action="close-modal"]').count()){await page.locator('[data-action="close-modal"]').first().click();if(await page.locator('[data-confirm-accept]').count())await page.locator('[data-confirm-accept]').click();}await page.waitForTimeout(300);return {ok:true};
  case 'shot':{
   const target=command.selector?page.locator(command.selector).first():page;
   if(command.top)await page.evaluate(()=>window.scrollTo(0,0));
   await page.evaluate(()=>document.activeElement instanceof HTMLElement&&document.activeElement.blur());await page.mouse.move(1590,100);await page.waitForTimeout(350);
   const masks=(command.mask||[]).map(s=>page.locator(s));
   const bytes=await target.screenshot({type:'png',animations:'disabled',mask:masks,maskColor:'#ded5ee',fullPage:command.fullPage||false});
   await sharp(bytes).webp({lossless:true}).toFile(output+'/'+command.file+'.webp');
   captures.push({file:command.file+'.webp',account:active,role:sessions.get(active).role,viewport:page.viewportSize(),maskedFields:command.mask||[],text:command.mask?.length?'Private field values omitted from capture notes.':redact((await (command.selector?page.locator(command.selector).first():page.locator('body')).innerText()).slice(0,18000))});
   return {ok:true,captured:command.file,captures:captures.length};
  }
  default:throw Error('Unsupported action');
 }
}
if(process.stdin.isTTY)process.stdin.setRawMode(true);
const input=createInterface({input:process.stdin,terminal:false});
console.log('Ready for browser JSON on stdin (credentials remain in memory).');
try{for await(const line of input){if(!line.trim())continue;try{const payload=JSON.parse(line);if(payload.action==='exit')break;const commands=Array.isArray(payload)?payload:[payload];for(const command of commands){try{console.log(JSON.stringify(await execute(command)));}catch(error){console.log(JSON.stringify({ok:false,action:command.action,message:redact(error.message)}));break;}}}catch(error){console.log(JSON.stringify({ok:false,message:'Invalid command JSON'}));}}}finally{await browser.close();}

