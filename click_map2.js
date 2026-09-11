import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  // Login first
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.includes('demoAccess'));
    if(btn) btn.click();
  });
  
  await new Promise(r => setTimeout(r, 2000));
  
  // Click on proposals
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.toLowerCase().includes('proposals'));
    if(btn) btn.click();
  });

  await new Promise(r => setTimeout(r, 2000));

  const proposalsMapSize = await page.evaluate(() => {
    const mapEl = document.querySelector('.maplibregl-map');
    if (!mapEl) return 'Map element not found';
    const rect = mapEl.getBoundingClientRect();
    return `Map size in Proposals: ${rect.width}x${rect.height}`;
  });
  console.log(proposalsMapSize);

  await browser.close();
})();
