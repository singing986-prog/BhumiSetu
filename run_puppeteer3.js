import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  
  // Try forcing the route via App.tsx state if possible. We can't directly do it. 
  // Let's just dump ALL button texts on the dashboard to see what we CAN click.
  await page.evaluate(() => {
    Array.from(document.querySelectorAll('button'))
      .find(b => b.textContent.includes('demoAccess'))?.click();
  });
  
  await new Promise(r => setTimeout(r, 2000));
  
  const buttons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('nav button')).map(b => b.textContent);
  });
  console.log("Nav Buttons:", buttons);
  
  const svgs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('nav button svg')).length;
  });
  console.log("Nav SVGs:", svgs);

  await browser.close();
})();
