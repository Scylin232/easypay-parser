const puppeteer = require('puppeteer');
const express = require('express');
const app = express();

app.get('/', async (req, res) => {
  const returnData = [];
  const browser = await puppeteer.launch({headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox']});
  const page = await browser.newPage();
  console.log('Created page')
  await page.setUserAgent('5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36');
  console.log('Seted user agent')
  await page.goto('https://easypay.ua/ua', { waitUntil: 'networkidle0' });
  console.log('Going to Easypay page')
  await page.click('button[class="header__sign-in shrink medium-5 column"]');
  console.log('Clicked on Login Button')
  await page.type('input[id="sign-in-phone"]', '380992077402');
  console.log('Inputed number')
  await page.type('input[id="password"]', 'Lolik232');
  console.log('Inputed password')
  await page.click('button[class="button relative"]');
  console.log('Clicked Login twice and screenshot time out')
  await new Promise(r => setTimeout(r, 5000));
  await page.screenshot({ path: 'timeout.png' })
  await page.waitForNavigation({ waitUntil: 'networkidle0' });
  await page.setRequestInterception(true);
  page.on('request', req => {
    if (req._headers.authorization) {
      returnData.push(req._headers);
      req.abort();
    } else {
      req.continue();
    };
  });
  console.log('Started TimeOut')
  await new Promise(r => setTimeout(r, 10000));
  console.log('Browser closed!')
  await browser.close();
  res.send({ pageId: returnData[0].pageid, appId: returnData[0].appid, bearerToken: returnData[0].authorization.split(' ')[1] });
});

app.listen(4515, () => {
  console.log('Example app listening on port 4515!');
});