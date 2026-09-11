import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  await page.evaluate(() => {
    const mapTab = Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('Map'));
    if (mapTab) mapTab.click();
  });
  
  await new Promise(r => setTimeout(r, 2000));
  
  const h2Text = await page.evaluate(() => {
    const h2 = document.querySelector('h2');
    return h2 ? h2.textContent : 'No H2';
  });
  console.log('H2:', h2Text);
  
  const rootHtml = await page.evaluate(() => {
    return document.querySelector('main')?.innerHTML.substring(0, 500);
  });
  console.log('MAIN HTML:\n', rootHtml);
  
  await browser.close();
})();
