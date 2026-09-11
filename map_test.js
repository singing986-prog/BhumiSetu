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
  
  const h2Text = await page.evaluate(() => {
    const h2 = document.querySelector('h2');
    return h2 ? h2.textContent : 'No H2';
  });
  console.log('H2:', h2Text);

  const errorBoundaries = await page.evaluate(() => {
     return document.body.innerText.includes('Error') || document.body.innerText.includes('failed to load');
  });
  console.log('Error in DOM:', errorBoundaries);

  await browser.close();
})();
