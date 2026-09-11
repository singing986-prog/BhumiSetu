import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error.message, error.stack));
  page.on('requestfailed', req => console.log('FAILED REQUEST:', req.url(), req.failure()?.errorText));
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  // Click on the GIS Map tab
  await page.evaluate(() => {
    const mapTab = Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('Map'));
    if (mapTab) mapTab.click();
  });
  
  await new Promise(r => setTimeout(r, 3000));
  
  // Take screenshot for debugging if needed, though we can't see it
  // await page.screenshot({ path: 'map_tab.png' });
  
  await browser.close();
})();
