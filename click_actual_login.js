import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  
  // Click demo access
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('demoAccess'));
    if (btn) btn.click();
  });
  
  await new Promise(r => setTimeout(r, 1000));
  
  // Click Super Admin
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const login = btns.find(b => b.textContent.includes('Super Admin'));
    if(login) login.click();
  });

  await new Promise(r => setTimeout(r, 1000));
  
  // Actually click the "Sign In" / auth.signIn button
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const login = btns.find(b => b.textContent.includes('auth.signIn'));
    if(login) login.click();
  });
  
  await new Promise(r => setTimeout(r, 2000));
  
  const layout = await page.evaluate(() => {
     const nav = document.querySelector('nav');
     return nav ? nav.innerText.substring(0, 100) : "NO NAV";
  });
  console.log("NAV:", layout);

  await browser.close();
})();
