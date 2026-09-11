import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  
  await page.evaluate(() => {
    // Override the global apiFetch so we don't get booted on 401s
    window.addEventListener('bhoomi_unauthorized', (e) => {
       e.stopImmediatePropagation();
    }, true);
  });
  
  await page.evaluate(() => {
    localStorage.setItem("bhoomi_token", "fake_token");
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.includes('demoAccess'));
    if(btn) btn.click();
  });
  
  await new Promise(r => setTimeout(r, 2000));
  
  const text = await page.evaluate(() => document.body.innerText.substring(0, 500));
  console.log("TEXT AFTER FAKE LOGIN:", text);
  
  // Click map
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button, nav button'));
    const mapBtn = tabs.find(b => b.textContent.toLowerCase().includes('map') && !b.textContent.toLowerCase().includes('sitemap'));
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

  const innerMap = await page.evaluate(() => {
    const mapEl = document.querySelector('.maplibregl-map');
    return mapEl ? mapEl.innerHTML.substring(0, 500) : 'No map element';
  });
  console.log('Map InnerHTML:\n', innerMap);
  
  await browser.close();
})();
