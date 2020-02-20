const puppeteer = require('puppeteer');
const schedule = require('node-schedule');
const mongo = require('./mongo');

const getToken = async () => {
  const tempArray = [];
  const credentials = await mongo.credentialsModel.findById('5e4e36c5d5b4492364eeda8d').lean()
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
  await mongo.tokenModel.findByIdAndUpdate('5e4e37a0d5b4492364eeda92', { pageId: tempArray[0].pageid, appId: tempArray[0].appid, bearerToken: tempArray[0].authorization.split(' ')[1] });
  await browser.close();
  console.log('All completed succesfuly, at:', new Date().toLocaleString('ru-RU', {timeZone: 'Europe/Kiev'}));
};

schedule.scheduleJob('*/15 * * * *', async () => {
  await getToken();
});

(async () => {
  await getToken();
})();