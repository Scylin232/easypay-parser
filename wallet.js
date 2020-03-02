const puppeteer = require('puppeteer');
const axios = require('axios');
const sha1 = require('sha1');
const schedule = require('node-schedule');
const fs = require('fs');

const easyPayGetToken = async () => {
  try {
    const tempArray = [];
    const [login, password] = await fs.readFileSync('../easypayCredentials.dat', 'utf-8').split(/\r?\n/);
    const browser = await puppeteer.launch({headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox']});
    const page = await browser.newPage();
    await page.setUserAgent('5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36');
    await page.goto('https://easypay.ua/ua', { waitUntil: 'networkidle0' });
    await page.click('button[class="header__sign-in shrink medium-5 column"]');
    await page.type('input[id="sign-in-phone"]', login);
    await page.type('input[id="password"]', password);
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
    await fs.writeFileSync('../easypayData.dat', `${tempArray[0].pageid}\n${tempArray[0].appid}\n${tempArray[0].authorization.split(' ')[1]}`);
    await browser.close();
    console.log('EasyPay, at:', new Date().toLocaleString('ru-RU', {timeZone: 'Europe/Kiev'}));
  } catch(err) {
    console.log(err.message);
  };
};


const globalMoneyGetToken = async () => {
  try {
    const [login, password] = await fs.readFileSync('../globalmoneyCredentials.dat', 'utf-8').split(/\r?\n/);
    const response = await axios.post(`https://globalmoney.ua/login?j_username=${login}&j_password=${sha1(password)}`);
    await fs.writeFileSync('../globalmoneyData.dat', `${response.data.content.token}\n${response.data.content.info.walletId}`);
    console.log('GlobalMoney, at:', new Date().toLocaleString('ru-RU', {timeZone: 'Europe/Kiev'}));
  } catch (err) {
    console.log(err.message);
  };
};

schedule.scheduleJob('*/15 * * * *', async () => {
  // await easyPayGetToken();
});

schedule.scheduleJob('0 * * * *', async () => {
  // await globalMoneyGetToken();
});

(async () => {
  await globalMoneyGetToken();
  // await easyPayGetToken();
})();