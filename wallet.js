const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha');
const axios = require('axios');
const sha1 = require('sha1');
const schedule = require('node-schedule');
const fs = require('fs');

// puppeteer.use(StealthPlugin());
// puppeteer.use(
//   RecaptchaPlugin({
//     provider: {
//       id: '2captcha',
//       token: '2d3dbd7547a34d541f5b958c1f99ff03'
//     },
//     visualFeedback: true
//   })
// );

// const easyPayGetToken = async () => {
//   try {
//     const [login, password] = ['380992077402', 'Lolik232']
//     const browser = await puppeteer.launch({slowMo: 250, headless: true, args: ['--no-sandbox']});
//     const page = await browser.newPage();
//     await page.goto('https://easypay.ua/ua', { waitUntil: 'networkidle0' });
//     await page.click('button[class="header__sign-in shrink medium-5 column"]');
//     await page.type('input[id="sign-in-phone"]', login);
//     await page.type('input[id="password"]', password);
//     await page.click('button[class="button relative"]');
//     await new Promise(r => setTimeout(r, 5000));
//     await page.solveRecaptchas();
//     await page.screenshot({ path: './file3333.jpg' });
//     await browser.close();
//     console.log('EasyPay, at:', new Date().toLocaleString('ru-RU', {timeZone: 'Europe/Kiev'}));
//   } catch(err) {
//     console.log(err.message);
//   };
// };

const globalMoneyGetToken = async () => {
  try {
    const [login, password] = await fs.readFileSync('../globalmoneyCredentials.dat', 'utf-8').split(/\r?\n/);
    const response = await axios({
      url: 'https://art.global24.com.ua/login',
      method: 'POST',
      headers: {
        'accept': `application/json`,
        'content-type': `application/json`,
        'user-agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36`,
      },
      data: {
        'loginType': 'phone',
        'login': login,
        'password': sha1(password),
      },
    });
    await fs.writeFileSync('../globalmoneyData.dat', `${response.data.keytoken}\n${response.data.wallet.id}`);
    console.log('GlobalMoney, at:', new Date().toLocaleString('ru-RU', {timeZone: 'Europe/Kiev'}));
  } catch (err) {
    console.log(err.message);
  };
};

// schedule.scheduleJob('*/20 * * * *', async () => {
//   await easyPayGetToken();
// });

schedule.scheduleJob('0 * * * *', async () => {
  await globalMoneyGetToken();
});

(async () => {
  await globalMoneyGetToken();
  // await easyPayGetToken();
})();