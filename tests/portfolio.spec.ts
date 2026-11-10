import { test, expect } from '@playwright/test';

test('ship visits programming, design, and videography in order', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/', { waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('IZA YUNUSANDHIKA.');
  await page.getByRole('button', { name: 'Sail to Code Cove', exact: true }).click();
  const modal = page.locator('.portfolio-dialog');
  await expect(modal).toBeVisible();
  await expect(modal.locator('.dialog-category-nav .selected')).toContainText('Code Cove');
  await modal.getByRole('button', { name: 'Sail to the next port' }).click();
  await expect(modal.locator('.dialog-category-nav .selected')).toContainText('Design Island');
  await modal.getByRole('button', { name: 'Sail to the next port' }).click();
  await expect(modal.locator('.dialog-category-nav .selected')).toContainText('Motion Bay');
  await page.keyboard.press('Escape');
  await expect(modal).not.toBeVisible();
  await expect(page.locator('body')).not.toHaveClass(/dialog-open/);
  expect(errors).toEqual([]);
});

test('project carousel alternates media and supports keyboard and wraparound', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Explore programming', exact: true }).click();
  const modal = page.locator('.portfolio-dialog');
  await expect(modal.getByRole('heading')).toHaveText('Ideas, brought to life.');
  const firstMedia = await modal.locator('.project-media').boundingBox();
  const firstText = await modal.locator('.project-details').boundingBox();
  expect(firstMedia!.x).toBeLessThan(firstText!.x);
  await modal.getByRole('button', { name: 'Next project', exact: true }).click();
  await expect(modal.getByRole('heading')).toHaveText('A smoother everyday.');
  const secondMedia = await modal.locator('.project-media').boundingBox();
  const secondText = await modal.locator('.project-details').boundingBox();
  expect(secondMedia!.x).toBeGreaterThan(secondText!.x);
  await page.keyboard.press('ArrowRight');
  await expect(modal.getByRole('heading')).toHaveText('The next discovery.');
  await page.keyboard.press('ArrowRight');
  await expect(modal.getByRole('heading')).toHaveText('Ideas, brought to life.');
  await page.keyboard.press('ArrowLeft');
  await expect(modal.getByRole('heading')).toHaveText('The next discovery.');
  await modal.getByRole('button', { name: 'Close portfolio' }).click();
  await expect(modal).not.toBeVisible();
});

test('contact shows an honest placeholder until channels are added', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Say ahoy', exact: true }).click();
  const modal = page.locator('.contact-dialog');
  await expect(modal).toBeVisible();
  await expect(modal).toContainText('My contact channels are coming aboard soon.');
  await expect(modal.locator('a[href^="mailto:"]')).toHaveCount(0);
  await modal.getByRole('button', { name: 'Close contact' }).click();
  await expect(modal).not.toBeVisible();
});

test.describe('mobile voyage', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  test('menu, swipe navigation, and layout fit a phone', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.getByRole('button', { name: 'Open menu', exact: true }).click();
    await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
    await page.getByRole('link', { name: 'The voyage', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Open menu', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Explore design', exact: true }).click();
    const modal = page.locator('.portfolio-dialog');
    await expect(modal).toBeVisible();
    await expect(modal.getByRole('heading')).toHaveText('A world of its own.');
    const slide = modal.locator('.project-slide');
    await slide.evaluate(el => { const touch = new Touch({ identifier: 0, target: el, clientX: 300, clientY: 150 }); el.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, changedTouches: [touch] })); });
    await slide.evaluate(el => { const touch = new Touch({ identifier: 0, target: el, clientX: 100, clientY: 150 }); el.dispatchEvent(new TouchEvent('touchend', { bubbles: true, changedTouches: [touch] })); });
    await expect(modal.getByRole('heading')).toHaveText('An identity with character.');
    expect(await modal.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    await modal.getByRole('button', { name: 'Close portfolio' }).click();
    await page.screenshot({ path: 'outputs/mobile-portfolio.png', fullPage: true });
  });
});

test('intro can be skipped and is remembered for the session', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/', { waitUntil: 'networkidle' });
  await expect(page.locator('.intro')).toBeVisible();
  await page.getByRole('button', { name: 'Skip intro' }).click();
  await expect(page.locator('.intro')).toHaveCount(0);
  await page.reload();
  await expect(page.locator('.intro')).toHaveCount(0);
});


