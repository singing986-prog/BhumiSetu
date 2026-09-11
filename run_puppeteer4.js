import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  
  // Dump all text on screen before click
  const before = await page.evaluate(() => document.body.innerText.substring(0, 500));
  console.log("BEFORE:", before);
  
  // Use exact match for demo access button
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    // Super Admin
    const btn = btns.find(b => b.textContent.includes('Super Admin'));
    if(btn) btn.click();
  });
  
  await new Promise(r => setTimeout(r, 2000));
  
  const after = await page.evaluate(() => document.body.innerText.substring(0, 500));
  console.log("AFTER LOGIN:", after);

  // Try clicking nav map button explicitly finding the exact text
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.includes('nav.map'));
    if(btn) btn.click();
  });
  
  await new Promise(r => setTimeout(r, 2000));
  
  const afterMapClick = await page.evaluate(() => document.body.innerText.substring(0, 500));
  console.log("AFTER MAP CLICK:", afterMapClick);
  
  await browser.close();
})();
