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
  
  // Find Map tab
  await page.evaluate(() => {
    // Look for the Mapicon SVG in the sidebar
    const btns = Array.from(document.querySelectorAll('button'));
    const mapBtn = btns.find(b => b.textContent.toLowerCase().includes('map') && !b.textContent.toLowerCase().includes('sitemap'));
    if (mapBtn) mapBtn.click();
  });
  
  await new Promise(r => setTimeout(r, 2000));
  
  const mapSize = await page.evaluate(() => {
    const mapEl = document.querySelector('.maplibregl-map');
    if (!mapEl) return 'Map element not found';
    const rect = mapEl.getBoundingClientRect();
    return `Map size: ${rect.width}x${rect.height}`;
  });
  console.log(mapSize);

  await browser.close();
})();
