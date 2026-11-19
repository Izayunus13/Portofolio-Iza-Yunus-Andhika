import {expect,type Page} from '@playwright/test';

/** Follow the public summit -> About Me -> clouds flow before testing the voyage. */
export async function enterPortfolio(page:Page){
 const prologue=page.getByTestId('voyage-prologue');
 if(!await prologue.count())return;
 const begin=page.getByRole('button',{name:'Begin the voyage',exact:true});
 await expect(begin).toBeEnabled({timeout:30000});
 await begin.click();
 await expect(page.getByTestId('prologue-about')).toHaveAttribute('data-active','true',{timeout:15000});
 await page.getByRole('button',{name:'Explore my portfolio',exact:true}).click();
 await expect(prologue).not.toBeAttached({timeout:10000});
}
