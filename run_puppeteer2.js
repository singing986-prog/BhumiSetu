import puppeteer from 'puppeteer';
import { readFileSync } from 'fs';

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  
  // Login
  await page.evaluate(() => {
    Array.from(document.querySelectorAll('button'))
      .find(b => b.textContent.includes('demoAccess'))?.click();
  });
  
  await new Promise(r => setTimeout(r, 2000));
  
  // Actually find the SVG icon for the Map tab if text is weird
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('nav button'));
    // The Map tab has the MapIcon which uses the Lucide 'map' icon class or svg contents
    // Let's just click the 3rd tab which should be Map (index 2)
    // 0: dashboard, 1: proposals, 2: map
    if(tabs.length >= 3) tabs[2].click();
  });
  
  await new Promise(r => setTimeout(r, 2000));
  
  const h2Text = await page.evaluate(() => document.querySelector('h2')?.innerText);
  console.log("H2:", h2Text);
  
  const mapHtml = await page.evaluate(() => document.querySelector('.flex-1.relative.h-full')?.innerHTML?.substring(0, 500));
  console.log("Map HTML:", mapHtml);
  
  const mapSize = await page.evaluate(() => {
    const mapEl = document.querySelector('.maplibregl-map');
    if (!mapEl) return 'Map element not found';
    const rect = mapEl.getBoundingClientRect();
    return `Map size: ${rect.width}x${rect.height}`;
  });
  console.log(mapSize);

  await browser.close();
})();
