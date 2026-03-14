import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.error('PAGE ERROR Catch:', err.toString()));
    
    console.log("Navigating to http://localhost:5173...");
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
    
    console.log("Waiting for 2 seconds to let React render...");
    await new Promise(r => setTimeout(r, 2000));
    
    const pricingHTML = await page.evaluate(() => {
      const section = document.getElementById('pricing');
      return section ? section.outerHTML : 'NO PRICING SECTION';
    });
    
    console.log("Pricing Component HTML snippet (first 1000 chars):");
    console.log(pricingHTML.substring(0, 1000));
    console.log("\n...Saving full HTML to pricing_dom.txt");
    fs.writeFileSync('pricing_dom.txt', pricingHTML);
    
    await browser.close();
  } catch (err) {
    console.error('PUPPETEER ERROR:', err);
  }
})();
