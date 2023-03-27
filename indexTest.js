require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const {TOKEN, SERVER_URL} = process.env;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;
const URI = `/webhook/${TOKEN}`;
const WEBHOOK_URL = SERVER_URL+URI;

const app  = express();
app.use(bodyParser.json());

const init = async () => {
    const res = await axios.get(`${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`);
    console.log(res.data);
}

app.post(URI, async (req, res) => {
    console.log(req.body);

    const chatId = req.body.message?.chat?.id;
    const text = req.body.message?.text;

    if (text === '/start') {
        await axios.post(`${TELEGRAM_API}/sendMessage`, {
            chat_id: chatId,
            text: 'Реєстрація на отримання продуктових наборів для родин від 3 і більше осіб від Центру Незалежних Християнських Харизматичних Церков України.' +
                '\n\nНапишіть `Отримати допомогуʼ',
            reply_markup: {
                inline_keyboard: [[{
                    text: 'Continue',
                    // switch_inline_query: 'share',
                    // callback_data:
                }]]
            }
        });
    } else if (text === 'Отримати допомогу') {
        await axios.post(`${TELEGRAM_API}/sendMessage`, {
            chat_id: chatId,
            text: text,
        });
    }

    return res.send();
})

app.listen(process.env.PORT || 8080, async () => {
    console.log('app running on port',  process.env.PORT || 5000);
    await init();
})