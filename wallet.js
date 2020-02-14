const puppeteer = require('puppeteer');
const express = require('express');
const app = express();

app.get('/', async (req, res) => {
  const returnData = [];
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  await page.goto('https://easypay.ua/ua', { waitUntil: 'networkidle0' });
  await page.click('button[class="header__sign-in shrink medium-5 column"]');
  await page.type('input[id="sign-in-phone"]', '380992077402');
  await page.type('input[id="password"]', 'Lolik232');
  await page.click('button[class="button relative"]');
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
  await new Promise(r => setTimeout(r, 10000));
  await browser.close();
  res.send({ pageId: returnData[0].pageid, appId: returnData[0].appid, bearerToken: returnData[0].authorization.split(' ')[1] });
});

app.listen(4515, () => {
  console.log('Example app listening on port 4515!');
});