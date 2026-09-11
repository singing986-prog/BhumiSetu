import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  await page.evaluate(() => {
    const mapTab = Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('Map'));
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
  
  const mapContainer = await page.evaluate(() => {
    const mapEl = document.querySelector('.maplibregl-map')?.parentElement;
    if (!mapEl) return 'Parent element not found';
    const rect = mapEl.getBoundingClientRect();
    return `Parent size: ${rect.width}x${rect.height}`;
  });
  console.log(mapContainer);
  
  const hasCanvas = await page.evaluate(() => {
     return !!document.querySelector('canvas.maplibregl-canvas');
  });
  console.log('Has WebGL canvas:', hasCanvas);
  
  await browser.close();
})();
