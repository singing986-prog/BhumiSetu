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
    // Look for a button or link with Map icon/text in the sidebar
    const tabs = Array.from(document.querySelectorAll('button, a'));
    const mapTab = tabs.find(el => el.textContent.includes('Map') || el.textContent.includes('map') || el.innerHTML.includes('Map'));
    console.log('Found map tab?', !!mapTab);
    if (mapTab) mapTab.click();
  });
  
  await new Promise(r => setTimeout(r, 2000));
  
  const currentHtml = await page.evaluate(() => {
    return document.querySelector('main')?.innerHTML.substring(0, 500);
  });
  console.log('MAIN HTML after click:\n', currentHtml);
  
  await browser.close();
})();
