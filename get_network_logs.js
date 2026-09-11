import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
  page.on('response', response => {
    const url = response.url();
    if(url.includes('api') || url.includes('json') || url.includes('pbf')) {
      console.log(`${response.status()} ${url}`);
    }
  });
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  // Login first
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('demoAccess'));
    if (btn) btn.click();
  });
  
  await new Promise(r => setTimeout(r, 2000));
  
  // Find Map tab
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const mapBtn = tabs.find(b => b.textContent.toLowerCase().includes('map') && !b.textContent.toLowerCase().includes('sitemap'));
    if (mapBtn) mapBtn.click();
  });
  
  await new Promise(r => setTimeout(r, 5000));
  
  await browser.close();
})();
