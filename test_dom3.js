import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  // Try to find any login button
  await page.evaluate(() => {
    const btn = document.querySelector('button');
    if (btn) btn.click();
  });
  
  await new Promise(r => setTimeout(r, 2000));
  
  await page.evaluate(() => {
    const mapTab = Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('Map'));
    if (mapTab) mapTab.click();
  });
  
  await new Promise(r => setTimeout(r, 2000));
  
  const rootHtml = await page.evaluate(() => {
    const mapDiv = document.querySelector('.maplibregl-map');
    if(mapDiv) return mapDiv.innerHTML;
    return document.body.innerHTML.substring(0, 500);
  });
  console.log('HTML:\n', rootHtml);
  
  await browser.close();
})();
