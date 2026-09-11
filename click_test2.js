import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  // Actually find the login button by text
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.includes('demoAccess'));
    if(btn) btn.click();
  });
  
  await new Promise(r => setTimeout(r, 2000));
  
  // Find Map tab
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const mapTab = tabs.find(el => el.textContent.includes('GIS Map'));
    if (mapTab) mapTab.click();
  });
  
  await new Promise(r => setTimeout(r, 2000));
  
  const mapSize = await page.evaluate(() => {
    const mapEl = document.querySelector('.maplibregl-map');
    if (!mapEl) return 'Map element not found';
    const rect = mapEl.getBoundingClientRect();
    return `Map size: ${rect.width}x${rect.height}`;
  });
  console.log(mapSize);

  const innerMap = await page.evaluate(() => {
    const mapEl = document.querySelector('.maplibregl-map');
    return mapEl ? mapEl.innerHTML.substring(0, 500) : 'No map element';
  });
  console.log('Map InnerHTML:\n', innerMap);
  
  await browser.close();
})();
