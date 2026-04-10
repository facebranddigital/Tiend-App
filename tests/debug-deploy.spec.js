const { test } = require('@playwright/test');

test('deployed app console check', async ({ page }) => {
  const logs = [];
  page.on('console', msg => logs.push(`${msg.type()}: ${msg.text()}`));
  page.on('pageerror', err => logs.push(`pageerror: ${err.message}`));
  await page.goto('https://tiend-app-wogt.vercel.app', { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(3000);
  const content = await page.content();
  console.log('PAGE_TITLE:' + await page.title());
  console.log('HTML_SNIPPET:' + content.slice(0, 1200).replace(/\n/g, ' '));
  console.log('CONSOLE_LOGS:');
  logs.forEach(l => console.log(l));
});
