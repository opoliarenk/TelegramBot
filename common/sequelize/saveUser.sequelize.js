const db = require('../../db.connection');
const UserModel = require('../../models/user.model');

exports.saveUser = async (chatId) => {
    await db.sync();

    const user = await UserModel.findOne({ where: { chatId: String(chatId) } });

    console.log(user?.dataValues);
    if (user) {
        return 'User exist';
    } else {
        await UserModel.create({ chatId });
        return 'User created';
    }
}

exports.updateUser = async (chatId, updateData) => {
    await db.sync();

    await UserModel.update({...updateData}, { where: { chatId: String(chatId) } });
    console.log((await UserModel.findOne({where: {chatId: String(chatId)}})).dataValues);
}

exports.userData = async (chatId) => {
    await db.sync();

    return (await UserModel.findOne({where: {chatId: String(chatId)}})).dataValues;
}

exports.allUsersData = async () => {
    await db.sync();

    // console.log('-------------------------');
    // console.log('user ' + await UserModel.count());
    return await UserModel.findAll();
}

exports.isUserBlocked = async (chatId) => {
    await db.sync();
    // console.log(`chat id = ${chatId}`);

    const user = (await UserModel.findOne({where: {chatId: String(chatId)}})).dataValues;

    // console.log(user);
    return user.block;
}

exports.isUserExit = async (chatId) => {
    await db.sync();
    // console.log(`chat id = ${chatId}`);

    const user = await UserModel.findOne({where: {chatId: String(chatId)}});

    if (user) {
        return true;
    }
    // console.log(user);
    return false;
}

exports.allChatIds = async () => {
    const chatIds = await UserModel.findAll({
        where: { block: false },
        attributes: ['chatId', 'message'],
    });

    return chatIds;
}

exports.allByCategory = async () => {
    const chatIds = await UserModel.findAll({
        where: { photoAccess: true},
        attributes: ['chatId'],
    });

    return chatIds;
}

exports.userCount = async () => {
    await db.sync();
    // console.log(typeof await UserModel.count());

    return await UserModel.count();
}