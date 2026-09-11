import puppeteer from 'puppeteer';
import { readFileSync } from 'fs';

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err));
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  
  // Login
  await page.evaluate(() => {
    Array.from(document.querySelectorAll('button'))
      .find(b => b.textContent.includes('demoAccess'))?.click();
  });
  
  await new Promise(r => setTimeout(r, 2000));
  
  // Change state by setting window location hash or directly clicking a specific SVG
  await page.evaluate(() => {
    const sidebars = document.querySelectorAll('nav button');
    sidebars[2].click(); // Typically Map is the 3rd or 4th depending on the structure
  });
  
  await new Promise(r => setTimeout(r, 2000));
  
  const h2Text = await page.evaluate(() => document.querySelector('h2')?.innerText);
  console.log("H2:", h2Text);
  
  await browser.close();
})();
