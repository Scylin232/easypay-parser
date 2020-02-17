const puppeteer = require('puppeteer');
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
const appPort = process.env.PORT || 4515

let credentials = {
  login: '380992077402',
  password: 'Lolik232',
};

app.get('/', async (req, res) => {
  console.log('Started!')
  const returnData = [];
  const browser = await puppeteer.launch({headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox']});
  const page = await browser.newPage();
  await page.setUserAgent('5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36');
  await page.goto('https://easypay.ua/ua', { waitUntil: 'networkidle0' });
  await page.click('button[class="header__sign-in shrink medium-5 column"]');
  await page.type('input[id="sign-in-phone"]', credentials.login);
  await page.type('input[id="password"]', credentials.password);
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

app.post('/setCredentials', async (req, res) => {
  const { login, password } = req.query;
  console.log(login, password);
  credentials.login = login;
  credentials.password = password;
  return await res.status(200).send('Credentials updates succesfuly!');
});

app.listen(appPort, () => {
  console.log('Example app listening on port: ', appPort);
});