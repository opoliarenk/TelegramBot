require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');
const { saveUser, updateUser, userData, isUserBlocked, userCount, isUserExit, allChatIds, allByCategory} = require("./common/sequelize/saveUser.sequelize");
const {log} = require("nodemon/lib/utils");
const {use} = require("express/lib/router");
const e = require("express");

const { TOKEN } = process.env;

const bot = new TelegramBot(TOKEN, { polling: true });

const app  = express();
app.use(bodyParser.json());
const answerCallbacks = {};

// bot.onText(/\/start/, async (msg) => {
//     const chatId = msg.chat.id;
//
//     try {
//         if (await userCount() > 150 && !await isUserExit(chatId)) {
//             await bot.sendMessage(
//                 msg.chat.id,
//                 'Реєстрація завершена.',
//             )
//         } else {
//             const user = await saveUser(msg.chat.id);
//             console.log(user);
//             if (user.block) {
//                 await blockMessage(msg.chat.id);
//             } else {
//                 await bot.sendMessage(
//                     chatId,
//                     'Реєстрація на отримання продуктових наборів для родин від 3 і більше осіб від Центру Незалежних Християнських Харизматичних Церков України.',
//                     {
//                         reply_markup: {
//                             inline_keyboard: [[
//                                 {
//                                     text: 'Отримати допомогу',
//                                     callback_data: 'receiveHelp',
//                                 }
//                             ]]
//                         }
//                     }
//                 )
//             }
//         }
//     } catch (e) {
//         throw e.message;
//     }
// })

// bot.on('callback_query', async (callbackQuery) => {
//     const message = callbackQuery.message;
//     const answer = callbackQuery.data;
//
//     switch (answer) {
//         case 'receiveHelp':
//             if (await isUserBlocked(message.chat.id)) {
//                 await blockMessage(message.chat.id);
//             } else {
//                 await bot.sendMessage(message.chat.id, 'Хто може реєструватися?' +
//                     '\nСім\'ї або родини, які проживають з вами в м.Ужгород на даний час де є 3 і більше осіб!' +
//                     '\nОбов’язкове підтвердження документами (Довідки ВПО оригінали)' +
//                     '\n\nЯкщо ви підходите під цю категорію, натисніть ПРОДОВЖИТИ і почніть реєстрацію',
//                     {
//                         reply_markup: {
//                             inline_keyboard: [[
//                                 {
//                                     text: 'Продовжити',
//                                     callback_data: 'continue',
//                                 }
//                             ]]
//                         }
//                     })
//             }
//             break;
//         case 'continue':
//             if (await isUserBlocked(message.chat.id)) {
//                 await blockMessage(message.chat.id);
//             } else {
//                 await bot.sendMessage(message.chat.id, 'Скільки членів сім’ї або родини з вами проживає в м.Ужгород',
//                     {
//                         reply_markup: {
//                             inline_keyboard: [[
//                                 {
//                                     text: '1',
//                                     callback_data: 'wrongAmountMembers',
//                                 },
//                                 {
//                                     text: '2',
//                                     callback_data: 'wrongAmountMembers',
//                                 },
//                                 {
//                                     text: '3',
//                                     callback_data: 'successAmountMembers'
//                                 },
//                                 {
//                                     text: 'більше 3',
//                                     callback_data: 'successAmountMembers'
//                                 }
//                             ]]
//                         }
//                     })
//             }
//             break;
//         case 'wrongAmountMembers':
//             await updateUser(message.chat.id, { block: true });
//             await bot.sendMessage(message.chat.id,
//                 'Вибачте, але ви не підходите під категорію на отримання продуктових наборів.',
//             )
//             break;
//         case 'successAmountMembers':
//             if (await isUserBlocked(message.chat.id)) {
//                 await blockMessage(message.chat.id);
//             } else {
//                 await bot.sendMessage(message.chat.id,
//                     'Просимо уважно читати і заповнювати, не поспішайте!\n\n' +
//                     'Напишіть прізвище, ім’я та по-батькові отримувача (українською, повністю)',
//                 ).then(function () {
//                     answerCallbacks[message.chat.id] = function (answer) {
//                         updateUser(answer.chat.id, { fullName: answer.text });
//                         bot.sendMessage(message.chat.id, `Звідки ви виїхали (область, місто, смт, село повністю)`).then(function () {
//                             answerCallbacks[message.chat.id] = function (answer) {
//                                 updateUser(answer.chat.id, { city: answer.text });
//                                 bot.sendMessage(message.chat.id, `Номер телефону (уточніть чи є на ньому телеграм або вайбер)`).then(function () {
//                                     answerCallbacks[message.chat.id] = function (answer) {
//                                         updateUser(answer.chat.id, { phoneNumber: answer.text });
//                                         bot.sendMessage(message.chat.id, `Скільки членів сім’ї або родини з вами проживає в м.Ужгород (вкажіть число. Наприклад: 1,2,3,4-10 і тд)`).then(function () {
//                                             answerCallbacks[message.chat.id] = function (answer) {
//                                                 updateUser(answer.chat.id, { membersInFamily: answer.text });
//                                                 bot.sendMessage(message.chat.id, `Напишіть ПІБ усіх членів сім’ї, родини проживаючих з вами в м.Ужгород, та ким вони вам являються (донька, син, чоловік і т.д.). Одним повідомленням!`).then(function () {
//                                                     answerCallbacks[message.chat.id] = function (answer) {
//                                                         updateUser(answer.chat.id, { membersNamesInFamily: answer.text });
//                                                         bot.sendMessage(message.chat.id, `Чи є серед них діти до 18 років?`, {
//                                                             reply_markup: {
//                                                                 inline_keyboard: [[
//                                                                     {
//                                                                         text: 'Так',
//                                                                         callback_data: 'withKids',
//                                                                     },
//                                                                     {
//                                                                         text: 'Ні',
//                                                                         callback_data: 'withoutKids',
//                                                                     },
//                                                                 ]]
//                                                             }
//                                                         });
//                                                     }
//                                                 });
//                                             }
//                                         });
//                                     }
//                                 });
//                             }
//                         });
//                     }
//                 });
//             }
//             break;
//         case 'withKids':
//             await bot.sendMessage(message.chat.id, `Скільки дітей до 18 років? (вкажіть число. Наприклад: 1,2,3,4-10 і тд)`).then(function () {
//                 answerCallbacks[message.chat.id] = function (answer) {
//                     updateUser(answer.chat.id, { childrenCount: answer.text });
//                     bot.sendMessage(message.chat.id, `Чи є якісь особливі потреби в вашій родині? (Якщо немає, напишіть слово НІ. Наприклад: ТАК памперси, дитяче харчування, ковдра або НІ)`).then(function () {
//                         answerCallbacks[message.chat.id] = function (answer) {
//                             updateUser(answer.chat.id, { specialNeeds: answer.text });
//                             bot.sendMessage(message.chat.id, `Чи даєте згоду надати фото або відео відгук-інтерв'ю після отримання допомоги?`, {
//                                 reply_markup: {
//                                     inline_keyboard: [[
//                                         {
//                                             text: 'Так',
//                                             callback_data: 'photoAccess',
//                                         },
//                                         {
//                                             text: 'Ні',
//                                             callback_data: 'photoDenied',
//                                         },
//                                     ]]
//                                 }
//                             })
//                         }
//                     })
//                 }
//             });
//             break;
//         case 'withoutKids':
//             await bot.sendMessage(message.chat.id, `Чи є якісь особливі потреби в вашій родині? (Якщо немає, напишіть слово НІ. Наприклад: ТАК памперси, дитяче харчування, ковдра або НІ)`).then(function () {
//                 answerCallbacks[message.chat.id] = function (answer) {
//                     updateUser(answer.chat.id, { specialNeeds: answer.text });
//                     bot.sendMessage(message.chat.id, `Чи даєте згоду надати фото або відео відгук-інтерв'ю після отримання допомоги?`, {
//                         reply_markup: {
//                             inline_keyboard: [[
//                                 {
//                                     text: 'Так',
//                                     callback_data: 'photoAccess',
//                                 },
//                                 {
//                                     text: 'Ні',
//                                     callback_data: 'photoDenied',
//                                 },
//                             ]]
//                         }
//                     })
//                 }
//             });
//             break;
//         case 'photoAccess':
//         case 'photoDenied':
//             answer === 'photoAccess' ?
//                 await updateUser(message.chat.id, { photoAccess: true }) :
//                 await updateUser(message.chat.id, { photoAccess: false })
//             const user = await userData(message.chat.id);
//             await bot.sendMessage(message.chat.id, `Ось ваші дані, якщо щось не правильно - натисніть команду <b>ʼ/startʼ</b> і заповніть знову.` +
//             `\n\n<b>ПІБ отримувача: ${user.fullName}</b>` +
//             `\n\n<b>Місто з якого виїхали: ${user.city}</b>` +
//             `\n\n<b>Номер телефону: ${user.phoneNumber}</b>` +
//             `\n\n<b>Кількість членів сімʼї: ${user.membersInFamily}</b>` +
//             `\n\n<b>ПІБ усіх членів сімʼї: ${user.membersNamesInFamily}</b>` +
//             `\n\n<b>Кількість дітей: ${user.childrenCount}</b>` +
//             `\n\n<b>Особливі потреби: ${user.specialNeeds}</b>`, {parse_mode: 'HTML'});
//             await bot.sendMessage(message.chat.id, `Дякуємо за реєстрацію, якщо ваша заявка буде розглянута і прийнята, бот надішле вам день та час отримання продуктового набору :)`);
//             break;
//     }
// })

bot.on('message', async function (message) {
    console.log(message.chat.id);
    console.log(message);
    console.log(message.message_id);

    if  (message.chat.id === 399980636) {
        const chatId = message.text.substring(0, message.text.indexOf('\n'));
        const text = message.text.substring(message.text.indexOf('\n') + 1);
        await bot.sendMessage(chatId, text);
    } else {
        await bot.forwardMessage('399980636', message.chat.id, message.message_id);
        await bot.sendMessage('399980636', `chatId: ${message.chat.id}`);
    }
    // const callback = answerCallbacks[message.chat.id];
    // if (callback) {
    //     delete answerCallbacks[message.chat.id];
    //     return callback(message);
    // }
})

app.post('/showAllPhotos', async (req, res) => {
    const users = await allByCategory();
    console.log(users.length);

    for (let i = 0; i < 6754; i++) {
        // console.log(users[i].dataValues);
        // await timeout(1000);
        // console.log(await bot.getChat(users[i].dataValues.chatId));
        // await bot.forwardMessage('440321277', , );
    }

    res.send(users);
})

async function blockMessage(chatId) {
    await bot.sendMessage(
        chatId,
        'Вибачте, але ви не підходите під категорію на отримання продуктових наборів.',
    )
}

// app.post('/sendMessageFromBot', async (req, res) => {
//     // const chatId = req.body.chatId;
//     // const message = req.body.message;
//
//     const users = await allChatIds();
// // await userCount();
//     console.log(users.length);
//
//     for (let i = 0; i < users.length; i++) {
//         console.log(users[i].dataValues);
//         await timeout(1000);
//         await bot.sendMessage(users[i].dataValues.chatId, users[i].dataValues.message);
//     }
//
//     res.send(users);
// })

app.post('/sendMessageFromBot', async (req, res) => {
    const chatId = req.body.chatId;
    const message = req.body.message;

    await bot.sendMessage(chatId, message);

    res.send('message sent to user');
})

app.post('/askForPhoto', async (req, res) => {
    const users = await allByCategory();
    console.log(users.length);

    for (let i = 0; i < 57; i++) {
        console.log(users[i].dataValues);
        await timeout(1000);
        await bot.sendMessage(users[i].dataValues.chatId, 'Доброго дня!\n' +
            'Просимо надати фото або відео, так як ви надали згоду\n' +
            '\n' +
            'Нам дуже важливі ці звіти для спонсорів, бо якщо спонсори не будуть бачити людей які отримують допомогу, фінансування припиниться! Ці фото і відео не публікуються ні в яких соц.мережах, а особисто звітуються перед спонсорами\n' +
            '\n' +
            'Нам як волонтерам не потрібні ці фото, ми просимо це для того щоб допомога і надалі могла надаватися людям які потребують в цьому! Дякуємо за розуміння і чекаємо на зворотній зв\'язок❤️\n' +
            'Якщо у вас є запитання або скарги з приводу нашої роботи, ви можете звернутися до нашого волонтера особисто\n' +
            '0963516116 - Влада');
    }


    // console.log(users[56].dataValues);

    // await bot.sendMessage('440321277', 'Вітаємо!\n' +
    //     'Дякуємо, що завітали до нас❤️\n' +
    //     'Просимо надіслати фото сім\'ї з продуктами❤️ це допоможе нам і в подальшому знаходити можливості і допомагати людям!\n' +
    //     '\n' +
    //     'Також, буде дуже важливе і приємне, коротке відео-подяка. Не більше 40 секунд, розкажіть про себе і сім\'ю, звідки ви приїхали, чи потрібна вам ще допомога продуктами.\n' +
    //     '\n' +
    //     'А ми в свою чергу будемо робити все можливе, щоб забезпечити людей продуктами і робити все для перемоги💙💛\n' +
    //     'Дякуємо за відгук!');
    // console.log(users[56].dataValues);

    res.send(users);
})


function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

app.listen(process.env.PORT || 8080, async () => {
    console.log('app running on port',  process.env.PORT || 8080);
})