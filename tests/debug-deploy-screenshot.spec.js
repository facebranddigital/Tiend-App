const { test } = require('@playwright/test');

test('deployed app screenshot', async ({ page }) => {
  await page.goto('https://tiend-app-wogt.vercel.app', { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(5000);
  const rootHtml = await page.evaluate(() => document.querySelector('app-root')?.innerHTML || 'NO ROOT');
  console.log('ROOT_HTML_LENGTH:' + rootHtml.length);
  if (rootHtml.length > 0) {
    console.log('ROOT_HTML_SNIPPET:' + rootHtml.slice(0, 400).replace(/\n/g, ' '));
  }
  await page.screenshot({ path: 'tests/deploy-debug.png', fullPage: true });
});
