import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.includes('Super Admin'));
    if(btn) btn.click();
  });
  
  await new Promise(r => setTimeout(r, 2000));
  
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const mapTab = btns.find(b => b.textContent.includes('nav.map'));
    if(mapTab) mapTab.click();
  });
  
  await new Promise(r => setTimeout(r, 2000));
  
  const h2Text = await page.evaluate(() => {
    const h2s = Array.from(document.querySelectorAll('h2'));
    return h2s.map(h => h.textContent);
  });
  console.log('H2s:', h2Text);
  
  const mainHTML = await page.evaluate(() => {
    return document.querySelector('main')?.innerHTML;
  });
  console.log('MAIN HTML:', mainHTML);

  await browser.close();
})();
