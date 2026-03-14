const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR Catch:', err.toString()));
  
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
  
  // Also dump out the contents of .lp-pricing-grid to see what HTML it rendered
  const gridHtml = await page.evaluate(() => {
    const el = document.querySelector('.lp-pricing-grid');
    return el ? el.outerHTML : 'GRID NOT FOUND!!!';
  });
  console.log('--- GRID HTML ---');
  console.log(gridHtml);
  
  await browser.close();
})();
