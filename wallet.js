const axios = require('axios');
const sha1 = require('sha1');
const schedule = require('node-schedule');
const fs = require('fs');

const easyPayGetToken = async () => {
  try {
    const [login, password] = await fs.readFileSync('../easypayCredentials.dat', 'utf-8').split(/\r?\n/);    
    const easypayData = await axios({
      url: 'https://api.easypay.ua/api/system/createApp',
      method: 'POST',
      headers: {
        'authority': 'api.easypay.ua',
        'content-length': '0',
        'appid': 'null',
        'locale': 'ru',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36',
        'content-type': 'application/json; charset=UTF-8',
        'accept': 'application/json, text/plain, */*',
        'sec-fetch-dest': 'empty',
        'pageid': 'null',
        'partnerkey': 'easypay-v2',
        'origin': 'https://easypay.ua',
        'sec-fetch-site': 'same-site',
        'sec-fetch-mode': 'cors',
        'referer': 'https://easypay.ua/',
        'accept-language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
      }
    });
    const easypayToken = await axios({
      url: 'https://api.easypay.ua/api/token',
      method: 'POST',
      headers: {
        'authority': 'api.easypay.ua',
        'content-length': '0',
        'appid': `${easypayData.data.appId}`,
        'locale': 'ru',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36',
        'content-type': 'application/json; charset=UTF-8',
        'accept': 'application/json, text/plain, */*',
        'sec-fetch-dest': 'empty',
        'pageid': `${easypayData.data.pageId}`,
        'partnerkey': 'easypay-v2',
        'origin': 'https://easypay.ua',
        'sec-fetch-site': 'same-site',
        'sec-fetch-mode': 'cors',
        'referer': 'https://easypay.ua/',
        'accept-language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      data:`grant_type=password&username=${login}&password=${password}&client_id=easypay-v2`,
    });
    fs.writeFileSync('../easypayData.dat', `${easypayData.data.pageId}\n${easypayData.data.appId}\n${easypayToken.data.access_token}`);
    console.log('EasyPay, at:', new Date().toLocaleString('ru-RU', {timeZone: 'Europe/Kiev'}));
  } catch(err) {
    console.log(err, err.response, err.response.data);
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

schedule.scheduleJob('*/20 * * * *', async () => {
  await easyPayGetToken();
});

schedule.scheduleJob('0 * * * *', async () => {
  await globalMoneyGetToken();
});

(async () => {
  await globalMoneyGetToken();
  await easyPayGetToken();
})();