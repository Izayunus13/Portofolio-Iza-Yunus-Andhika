import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

await mkdir('outputs/voyage-water', { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'no-preference' });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
  await page.getByRole('button',{name:'Begin the voyage',exact:true}).click();
  await page.getByRole('button',{name:'Explore my portfolio',exact:true}).click();
  await page.locator('[data-testid="voyage-world"][data-ready="true"]').waitFor();
  await page.screenshot({ path: 'outputs/voyage-water/home.png' });
  for (const [i, name] of [[1, 'Bytehaven'], [2, 'Pigment Atoll'], [3, 'Framewake Bay']]) {
    await page.getByRole('button', { name: `Visit ${name}`, exact: true }).click();
    await page.waitForFunction(() => Number(document.querySelector('[data-testid="voyage-world"]').dataset.wakeParticles) > 20);
    await page.waitForTimeout(1400);
    await page.screenshot({ path: `outputs/voyage-water/sailing-${i}.png` });
    await page.locator(`main[data-current-port="${i}"][data-traveling="false"]`).waitFor();
    await page.locator('.portfolio-dialog').waitFor({ state: 'visible' });
    await page.getByRole('button', { name: 'Close portfolio' }).click();
    await page.waitForTimeout(700);
    await page.screenshot({ path: `outputs/voyage-water/island-${i}.png` });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(700);
  await page.screenshot({ path: 'outputs/voyage-water/mobile.png' });
  console.log(JSON.stringify({ errors, screenshots: 'outputs/voyage-water/' }));
} finally { await browser.close(); }
