import {chromium} from '@playwright/test';
import sharp from 'sharp';
import {mkdir,writeFile} from 'node:fs/promises';
const root='public/portfolio/anjemin/live';await mkdir(root,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
const captures=[];
try{
 const context=await browser.newContext({viewport:{width:1600,height:1100},deviceScaleFactor:1.5,reducedMotion:'reduce',timezoneId:'Asia/Jakarta'});
 // Public documentation only. No SMS requests, signup, bookings, or account changes.
 await context.route('**/api/**',route=>['GET','HEAD','OPTIONS'].includes(route.request().method())?route.continue():route.abort());
 const page=await context.newPage();page.setDefaultTimeout(12000);
 const shot=async(name,locator=page)=>{await page.evaluate(()=>document.activeElement instanceof HTMLElement&&document.activeElement.blur());await page.mouse.move(1590,100);await page.waitForTimeout(300);const bytes=await locator.screenshot({type:'png',animations:'disabled'});await sharp(bytes).webp({lossless:true}).toFile(`${root}/${name}.webp`);captures.push({file:`${name}.webp`,viewport:page.viewportSize(),text:await (locator===page?page.locator('body'):locator).innerText()});console.log('Captured',name)};
 const closeModal=async()=>{if(await page.locator('[data-action="close-modal"]').count()){await page.locator('[data-action="close-modal"]').click();if(await page.locator('[data-confirm-accept]').count())await page.locator('[data-confirm-accept]').click();}await page.waitForTimeout(250)};
 await page.goto('https://anjemin.vercel.app/',{waitUntil:'networkidle',timeout:60000});await page.evaluate(()=>document.fonts.ready);
 await closeModal();await page.evaluate(()=>window.scrollTo(0,0));await shot('01-home-overview');
 await shot('02-service-discovery',page.locator('#layanan'));
 await shot('03-referral-offer',page.locator('#promo'));
 await shot('04-about-development-status',page.locator('main>section').last());
 await shot('05-footer-navigation',page.locator('footer'));
 await page.locator('[data-action="login"]').first().click();await shot('06-login',page.locator('.modal'));
 await page.locator('button[data-auth-tab="signup"]').click();await page.setViewportSize({width:1600,height:1550});await shot('07-customer-registration',page.locator('.modal'));
 await shot('08-phone-verification',page.locator('#signup-otp-panel'));
 await page.locator('#signup-form button[type="submit"]').scrollIntoViewIfNeeded();await shot('09-password-and-consent',page.locator('.modal'));
 await page.locator('input[value="DRIVER"]').check();await page.setViewportSize({width:1600,height:2400});await page.locator('.modal').evaluate(n=>n.scrollTop=0);await shot('10-driver-registration',page.locator('.modal'));
 await shot('11-driver-commitment',page.locator('.driver-rules'));
 await shot('12-driver-document-verification',page.locator('.driver-documents'));
 await page.locator('[data-action="close-modal"]').click();if(await page.locator('[data-confirm-accept]').count()){await shot('13-discard-confirmation',page.locator('.discard-confirm'));await page.locator('[data-confirm-accept]').click();}
 await page.setViewportSize({width:1600,height:1100});await page.locator('[data-nav="privacy"]').first().click();await page.evaluate(()=>window.scrollTo(0,0));await shot('14-privacy-overview');
 const articles=page.locator('.legal article');console.log('Privacy articles',await articles.count());
 await shot('15-privacy-account-data',articles.nth(1));
 await shot('16-privacy-location-permissions',articles.nth(4));
 await shot('17-privacy-access-and-security',articles.nth(7));
 await shot('18-privacy-rights-and-retention',articles.nth(9));
 await page.locator('[data-nav="terms"]').first().click();await shot('19-service-terms',page.locator('.legal'));
 await page.locator('[data-nav="contact"]').first().click();await shot('20-help-center',page.locator('.legal'));
 await page.locator('[data-nav="home"]').first().click();await page.locator('[data-action="theme"]').click();await page.evaluate(()=>window.scrollTo(0,0));await shot('21-dark-theme');
 const mobile=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,reducedMotion:'reduce',timezoneId:'Asia/Jakarta'});
 await mobile.route('**/api/**',route=>['GET','HEAD','OPTIONS'].includes(route.request().method())?route.continue():route.abort());
 await mobile.goto('https://anjemin.vercel.app/',{waitUntil:'networkidle'});
 if(await mobile.locator('[data-action="close-modal"]').count()){await mobile.locator('[data-action="close-modal"]').click();if(await mobile.locator('[data-confirm-accept]').count())await mobile.locator('[data-confirm-accept]').click();}
 for(const [name,selector] of [['22-mobile-home',null],['23-mobile-services','#layanan']]){const target=selector?mobile.locator(selector):mobile;await sharp(await target.screenshot({type:'png',animations:'disabled'})).webp({lossless:true}).toFile(`${root}/${name}.webp`);captures.push({file:`${name}.webp`,viewport:mobile.viewportSize(),text:selector?await mobile.locator(selector).innerText():await mobile.locator('body').innerText()});console.log('Captured',name);}
 await mobile.locator('[data-action="login"]').first().click();await mobile.locator('button[data-auth-tab="signup"]').click();await sharp(await mobile.locator('#signup-form .form-row').screenshot({type:'png',animations:'disabled'})).webp({lossless:true}).toFile(`${root}/24-mobile-registration.webp`);captures.push({file:'24-mobile-registration.webp',viewport:mobile.viewportSize(),text:await mobile.locator('.modal').innerText()});console.log('Captured 24-mobile-registration');
 await writeFile(`${root}/capture-notes.json`,JSON.stringify({source:'https://anjemin.vercel.app/',capturedAt:new Date().toISOString(),format:'Lossless WebP encoding of original browser screenshots; no content reconstruction.',scope:'Public pages and unsubmitted registration forms. Authenticated dashboards require authorized demo access.',captures},null,2));
 console.log('Completed',captures.length);
}finally{await browser.close()}
