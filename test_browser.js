const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('pageerror', err => {
    console.error('Browser Error:', err.message);
    console.error(err.stack);
  });
  page.on('console', msg => {
    if (msg.type() === 'error') console.error('Console Error:', msg.text());
  });
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);
  await browser.close();
})();
