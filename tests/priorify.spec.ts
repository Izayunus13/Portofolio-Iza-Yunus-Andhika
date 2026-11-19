import {enterPortfolio} from './helpers/enter-portfolio';
import {test,expect} from '@playwright/test';

for(const [device,width,height]of [['desktop',1440,1000],['phone',390,844]]as const){
 test(device+': Bytehaven Portfolio C shows the complete Priorify AI walkthrough',async({page})=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.setViewportSize({width,height});
  await page.goto('/',{waitUntil:'networkidle'});await enterPortfolio(page);
  await expect(page.locator('main')).toHaveAttribute('data-intro-complete','true',{timeout:30000});
  const world=page.getByTestId('voyage-world');
  await expect(world).toHaveAttribute('data-renderer','webgl');
  await expect(world).toHaveAttribute('data-beveled-titles','3');
  await page.getByRole('button',{name:'Visit Bytehaven',exact:true}).click();
  const dialog=page.locator('.portfolio-dialog:not(.certificate-dialog)');
  await dialog.getByRole('tab',{name:/Portfolio C/}).click();
  const heading=dialog.getByRole('heading');
  await expect(heading).toHaveText('Priorify AI, a clearer path to focus.');
  const files=['01-home-overview','02-demo-dashboard','03-create-academic-task','04-task-priorities','05-available-study-time','06-generated-study-schedule','07-assistant-priority-advice','08-assistant-task-breakdown','09-progress-and-next-priority','10-workspace-settings','11-midnight-dashboard','12-mobile-dashboard'];
  for(const [index,file]of files.entries()){
   await expect(dialog.getByLabel(`Media ${index+1} of 12 in Portfolio C`,{exact:true})).toBeVisible();
   await expect(dialog.locator('.project-image-link')).toHaveAttribute('href',`/portfolio/priorify-ai/${file}.webp`);
   await expect.poll(()=>dialog.locator('img').evaluate((image:HTMLImageElement)=>image.complete&&image.naturalWidth>0)).toBe(true);
   await expect(dialog.getByRole('link',{name:'View project',exact:true})).toHaveAttribute('href','https://priorify-ai-nu.vercel.app/');
   expect(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
   expect(await dialog.locator('.portfolio-panel').evaluate(el=>Math.abs(el.getBoundingClientRect().height-el.firstElementChild!.getBoundingClientRect().height))).toBeLessThan(2);
   if(index===0)await page.screenshot({path:`test-results/priorify-${device}.png`});
   if(index===6)await expect(dialog.locator('.project-details')).toContainText('simulates guidance');
   await dialog.getByRole('button',{name:'Next media',exact:true}).click();
  }
  await expect(heading).toHaveText('Priorify AI, a clearer path to focus.');
  await dialog.getByRole('button',{name:'Close portfolio',exact:true}).click();
  await page.screenshot({path:`test-results/anthrope-bytehaven-${device}.png`});
  expect(errors).toEqual([]);
 });
}
