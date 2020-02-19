const axios = require('axios');
const puppeteer = require('puppeteer');
const express = require('express');
const cors = require('cors');
const schedule = require('node-schedule');

const appPort = process.env.PORT || 4515
const app = express();
let easyPayParams = {};

app.use(cors());

let credentials = { login: '380992077402', password: 'Lolik232' };

const getToken = async () => {
  const tempArray = [];
  const browser = await puppeteer.launch({headless: false, args: ['--no-sandbox', '--disable-setuid-sandbox']});
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
      tempArray.push(req._headers);
      req.abort();
    } else {
      req.continue();
    };
  });
  await new Promise(r => setTimeout(r, 10000));
  easyPayParams = { pageId: tempArray[0].pageid, appId: tempArray[0].appid, bearerToken: tempArray[0].authorization.split(' ')[1] };
  await browser.close();
  console.log('All completed succesfuly.');
};

schedule.scheduleJob('*/15 * * * *', async () => {
  await getToken();
});

app.get('/wallets', async (req, res) => {
  if (easyPayParams.pageId === undefined) {
    return await res.status(200).send('Token is unvailable.');
  }
  const easypay = await axios({
    url: 'https://api.easypay.ua/api/wallets/get',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${easyPayParams.bearerToken}`,
      'AppId': easyPayParams.appId,
      'PageId': easyPayParams.pageId
    }
  })
  return await res.status(200).send(easypay.data.wallets);
})

app.get('/getWalletById', async (req, res) => {
  if (easyPayParams.pageId === undefined || req.query.walletId === undefined) {
    return await res.status(200).send('Token is unvailable.');
  }
  const walletId = req.query.walletId;
  const easypay = await axios({
    url: `https://api.easypay.ua/api/wallets/get/${walletId}`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${easyPayParams.bearerToken}`,
      'AppId': easyPayParams.appId,
      'PageId': easyPayParams.pageId
    }
  });
  return await res.status(200).send(easypay.data.wallets);
})

app.post('/setCredentials', async (req, res) => {
  const { login, password } = req.query;
  console.log(login, password);
  credentials.login = login;
  credentials.password = password;
  return await res.status(200).send('Credentials updates succesfuly!');
});

app.listen(appPort, () => {
  console.log('App listening on port: ', appPort);
});

(async () => {
  await getToken();
})();