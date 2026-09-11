import puppeteer from 'puppeteer';
import fs from 'fs';
import { PNG } from 'pngjs';

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1366, height: 768 });
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  
  // Intercept the HTML response and inject our own simple Map component to see if it renders
  
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
  await new Promise(r => setTimeout(r, 5000));
  
  // take screenshot of map container
  const mapEl = await page.$('.maplibregl-map');
  if (mapEl) {
    await mapEl.screenshot({ path: 'map_isolation.png' });
    
    // Check pixels
    fs.createReadStream('map_isolation.png')
      .pipe(new PNG({ filterType: 4 }))
      .on('parsed', function() {
        let emptyPixels = 0;
        let totalPixels = this.width * this.height;
        for (let y = 0; y < this.height; y++) {
          for (let x = 0; x < this.width; x++) {
            let idx = (this.width * y + x) << 2;
            let r = this.data[idx];
            let g = this.data[idx+1];
            let b = this.data[idx+2];
            let a = this.data[idx+3];
            if ((r > 240 && g > 240 && b > 240) || a < 10) emptyPixels++;
          }
        }
        console.log(`Percentage empty: ${((emptyPixels/totalPixels)*100).toFixed(2)}%`);
      });
  }
  
  await browser.close();
})();
