import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1366, height: 768 });
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
  
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
  
  // Wait a bit for map to load tiles
  await new Promise(r => setTimeout(r, 5000));
  
  // Take screenshot of the map container
  const mapEl = await page.$('.maplibregl-map');
  if (mapEl) {
    await mapEl.screenshot({ path: 'map_screenshot.png' });
    console.log("Screenshot saved to map_screenshot.png");
  } else {
    console.log("Map element not found for screenshot");
  }
  
  await browser.close();
})();
