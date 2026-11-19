import {enterPortfolio} from './helpers/enter-portfolio';
import { test, expect } from '@playwright/test';
import { angleDifference } from '../lib/voyage-motion';
import { createVoyageRoutes, navigationObstacles, ports, shipClearance } from '../lib/voyage-routes';

test('every route clears all shores, jetties and titles with room for the entire turning ship', () => {
  for (const [index, curve] of createVoyageRoutes().entries()) {
    for (const obstacle of navigationObstacles) {
      let clearance = Infinity;
      for (const point of curve.getSpacedPoints(2000)) {
        clearance = Math.min(clearance, Math.hypot(point.x - obstacle.x, point.z - obstacle.z) - obstacle.radius - shipClearance);
      }
      expect.soft(clearance, `Leg ${index + 1}: ${obstacle.name}`).toBeGreaterThan(.4);
    }
    expect(curve.getPoint(0).toArray()).toEqual(ports[index].position);
    curve.getPoint(1).toArray().forEach((value, axis) => expect(value).toBeCloseTo(ports[index + 1].position[axis], 8));
  }
});

test('moving water leaves a fading wake on forward, skipped and return journeys', async ({ page }) => {
  test.setTimeout(90000);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/', { waitUntil: 'networkidle' });await enterPortfolio(page);
  const world = page.getByTestId('voyage-world');
  await expect(world).toHaveAttribute('data-ready', 'true');
  await expect(world).toHaveAttribute('data-wake-particles', '0');
  const homeHeading=Number(await world.getAttribute('data-ship-heading'));
  for (const [index, name] of [[3, 'Framewake Bay'], [1, 'Bytehaven'], [0, 'Home waters']] as const) {
    await page.getByRole('button', { name: `Visit ${name}`, exact: true }).click();
    await expect(page.locator('main')).toHaveAttribute('data-traveling', 'true');
    await expect.poll(async () => Number(await world.getAttribute('data-wake-strength'))).toBeGreaterThan(.25);
    await expect.poll(async () => Number(await world.getAttribute('data-wake-particles'))).toBeGreaterThan(4);
    await expect.poll(async () => Number(await world.getAttribute('data-wake-samples'))).toBeGreaterThan(4);
    await expect(page.locator('main')).toHaveAttribute('data-current-port', String(index), { timeout: 25000 });
    await expect(page.locator('main')).toHaveAttribute('data-traveling', 'false');
    await expect.poll(async () => Number(await world.getAttribute('data-ship-x'))).toBeCloseTo(ports[index].position[0], 2);
    await expect.poll(async () => Number(await world.getAttribute('data-ship-z'))).toBeCloseTo(ports[index].position[2], 2);
    if (index) {
      await expect(page.locator('.portfolio-dialog')).toBeVisible();
      await page.getByRole('button', { name: 'Close portfolio' }).click();
    }
  }
  const arrivalHeading = Number(await world.getAttribute('data-ship-heading'));
  expect(Math.abs(angleDifference(homeHeading,arrivalHeading))).toBeGreaterThan(2);
  await expect.poll(async () => Number(await world.getAttribute('data-wake-particles')), { timeout: 7000 }).toBe(0);
  await expect.poll(async () => Number(await world.getAttribute('data-wake-samples')), { timeout: 7000 }).toBe(0);
  await expect.poll(async () => Number(await world.getAttribute('data-wake-strength'))).toBeLessThan(.01);
  await expect.poll(async()=>Math.abs(angleDifference(homeHeading,Number(await world.getAttribute('data-ship-heading')))),{timeout:6000}).toBeLessThan(.005);
  await expect(world).toHaveAttribute('data-route','0.0000');
  await expect(world).toHaveAttribute('data-ship-x',ports[0].position[0].toFixed(3));
  await expect(world).toHaveAttribute('data-ship-z',ports[0].position[2].toFixed(3));
  await page.screenshot({path:'outputs/certificates/returned-home.png'});
  expect(errors).toEqual([]);
});
