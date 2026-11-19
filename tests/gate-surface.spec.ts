import {test,expect} from '@playwright/test';
import {welcomeDuration,prologueDuration} from '../lib/prologue-timing';

for(const [device,width,height]of [['desktop',1440,1000],['phone',390,844]]as const){
 for(const fallback of [false,true]){
  test(`${device}: ${fallback?'fallback':'3D'} gate covers the wooden threshold and shared controls`,async({page})=>{
   await page.setViewportSize({width,height});await page.emulateMedia({reducedMotion:'no-preference'});
   const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
   if(fallback)await page.route('**/lib/pirate-gate.ts*',route=>route.abort());
   await page.goto('/',{waitUntil:'networkidle'});
   const begin=page.getByRole('button',{name:'Begin the voyage',exact:true});
   await expect(begin).toBeEnabled({timeout:30000});
   const simulated=new Date('2026-11-16T08:00:00Z');
   await page.clock.install({time:simulated});await page.clock.pauseAt(simulated);
   await begin.evaluate(button=>(button as HTMLButtonElement).click());
   await expect(page.getByTestId('voyage-prologue')).toHaveAttribute('data-phase','welcoming');
   await page.clock.fastForward(welcomeDuration);
   await expect(page.getByTestId('voyage-prologue')).toHaveAttribute('data-phase','revealing');
   await page.clock.runFor(1800);
   const gate=page.getByTestId('pirate-gate');
   await expect(gate).toHaveAttribute('data-renderer',fallback?'fallback':'webgl');
   if(fallback){
    await gate.locator('.gate-fallback').evaluate((element,duration)=>{
     for(const animation of element.getAnimations({subtree:true})){animation.pause();animation.currentTime=duration*.35;}
    },prologueDuration);
   }else{
    const environment=page.getByTestId('gate-environment');
    await expect(environment).toHaveAttribute('data-covered','true');
    // Real surface shadows and details must stay within a small batch budget.
    expect(Number(await environment.getAttribute('data-draw-calls'))).toBeLessThan(80);
   }
   await expect(page.locator('.voyage-sound-dock')).toBeHidden();
   const rail=page.getByTestId('entry-threshold');
   // A vivid rail deliberately forced visible behind the doors must not change a pixel.
   await rail.evaluate(element=>{element.style.setProperty('visibility','visible','important');element.style.setProperty('background','#ff00ff','important');});
   const clip={x:0,y:height-100,width,height:100};
   const withRail=await page.screenshot({clip});
   await rail.evaluate(element=>element.style.setProperty('visibility','hidden','important'));
   const withoutRail=await page.screenshot({clip});
   expect(withRail.equals(withoutRail),'Closed doors must fully occlude the threshold').toBe(true);
   await rail.evaluate(element=>{element.style.removeProperty('visibility');element.style.removeProperty('background');});
   await page.screenshot({path:`test-results/gate-surface-${device}-${fallback?'fallback':'webgl'}.png`});
   if(!fallback){
    await expect(gate.locator('canvas')).toHaveCount(1);
    await expect(gate.locator('.gate-fallback')).toHaveCount(0);
    for(const [index,step]of [600,200,250,250].entries()){
     await page.clock.runFor(step);
     await expect(gate.locator('canvas')).toHaveCount(1);
     await page.screenshot({path:`test-results/gate-motion-${device}-${index}.png`});
    }
   }
   expect(errors).toEqual([]);
  });
 }
}
