import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  
  // Inject a script into the page that will listen for unhandled rejections or maplibre errors
  await page.evaluateOnNewDocument(() => {
    window.addEventListener('unhandledrejection', event => {
      console.log('UNHANDLED PROMISE REJECTION:', event.reason);
    });
  });

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
  
  // Expose a function so we can get events from the map.
  // Actually, wait, react-map-gl doesn't expose the global `map` object. 
  // Let's use puppeteer's request interception to see if tiles are actually fetched.
  
  // Let's just monitor network requests for .mvt or .pbf or style.json
  
  await new Promise(r => setTimeout(r, 5000));
  await browser.close();
})();
