import { test, expect } from '@playwright/test';

test('applies a valid discount code', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Discount code').fill('SUMMER20');
  await page.getByRole('button', { name: 'Apply code' }).click();
  await expect(page.getByRole('status')).toContainText('Discount applied.');
  await expect(page.getByTestId('discount')).toHaveText('40.00 PLN');
});

test('rejects an invalid discount code', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Discount code').fill('NOTVALID');
  await page.getByRole('button', { name: 'Apply code' }).click();
  await expect(page.getByRole('status')).toContainText('Invalid discount code.');
});

test('displays the final price after applying a discount', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Discount code').fill('SUMMER20');
  await page.getByRole('button', { name: 'Apply code' }).click();
  await expect(page.getByTestId('final-price')).toHaveText('160.00 PLN');
});

test('submits an order', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Submit order' }).click();
  await expect(page.getByRole('status')).toContainText('Order submitted.');
});
