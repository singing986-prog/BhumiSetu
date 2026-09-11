import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  
  // Use page.evaluate to dispatch a fake response if it's failing
  
  await page.evaluate(() => {
    // Fill the inputs if they exist
    const inputs = document.querySelectorAll('input');
    if (inputs.length >= 2) {
      inputs[0].value = 'super@bhoomi.gov.in';
      inputs[1].value = 'SuperSecure123!';
      inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
      inputs[1].dispatchEvent(new Event('input', { bubbles: true }));
    }
  });

  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('demoAccess'));
    if (btn) btn.click();
  });
  
  await new Promise(r => setTimeout(r, 2000));
  
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const login = btns.find(b => b.textContent.includes('Super Admin'));
    if(login) login.click();
  });
  
  await new Promise(r => setTimeout(r, 2000));
  
  const h2Text = await page.evaluate(() => {
     return document.querySelector('h2')?.innerText;
  });
  console.log("H2:", h2Text);
  
  const layout = await page.evaluate(() => {
     const nav = document.querySelector('nav');
     return nav ? nav.innerText.substring(0, 100) : "NO NAV";
  });
  console.log("NAV:", layout);

  await browser.close();
})();
