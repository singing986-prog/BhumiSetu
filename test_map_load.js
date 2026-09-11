import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  
  await page.evaluate(() => {
    Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('demoAccess'))?.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  
  await page.evaluate(() => {
    Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Super Admin'))?.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  
  await page.evaluate(() => {
    Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('auth.signIn'))?.click();
  });
  await new Promise(r => setTimeout(r, 2000));
  
  await page.evaluate(() => {
    const mapTab = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('GIS Map') || b.textContent.includes('map'));
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

  const hasCanvas = await page.evaluate(() => {
     return !!document.querySelector('canvas.maplibregl-canvas');
  });
  console.log('Has WebGL canvas:', hasCanvas);
  
  await browser.close();
})();
