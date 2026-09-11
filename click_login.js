import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  
  // Directly set localStorage for authentication so we bypass the UI bugs with the button click.
  await page.evaluate(() => {
    localStorage.setItem("bhoomi_token", "fake_token");
    localStorage.setItem("bhoomi_refresh", "fake_token");
  });
  
  await page.reload({ waitUntil: 'networkidle0' });
  
  await new Promise(r => setTimeout(r, 2000));
  
  const text = await page.evaluate(() => document.body.innerText.substring(0, 500));
  console.log("TEXT AFTER FAKE LOGIN:", text);
  
  await browser.close();
})();
