const TelegramApi = require('node-telegram-bot-api')
const {gameOptions, againOptions} = require('./options')
const sequelize = require('./database');
const UserModel = require('./models')

const token = '5468711645:AAEu6vbzfYDaxcLf7UDjftNU5k0z3SBviuA'
const bot = new TelegramApi(token, {polling:true})

const chats = {}

const startGame = async (chatId) => {
    await bot.sendMessage(chatId, 'Сейчас я загадаю число от 1 до 10, попробуй угадай')
    const randomNumber = Math.floor(Math.random() * 10)
    chats[chatId] = randomNumber;
    return bot.sendMessage(chatId, "Отгадывай бро:)", gameOptions)
}


const start = async () => {
    try {
        await sequelize.authenticate()
        await sequelize.sync()
    } catch(e) {
        console.log('Всё сломалось', e)
    }
    bot.setMyCommands([
        {command :'/start', description:'Начальное привестсвие'},
        {command :'/info', description:'информация'},
        {command :'/game', description:'игра'},
    ])
    bot.on('message', async msg=> {
        const text = msg.text;
        const chatId = msg.chat.id;
        if(text==='/start') {
            await UserModel.create({chatId})
            await bot.sendSticker(chatId,'https://tlgrm.ru/_/stickers/f4b/de4/f4bde45a-cd7f-46ca-8a5d-996e9916a4c9/8.webp')
            return bot.sendMessage(chatId, `Привет ${msg.from.first_name}`)
        }
        console.log(msg)
        if (text==='/info') {
            const user = await UserModel.findOne({chatId})
            return bot.sendMessage(chatId,`тебя зовут ${msg.from.first_name}, в игре у тебя правильных ${user.right} из ${user.right+user.wrong}`)
        }
        if (text ==='/game') {
            return startGame(chatId);
        }
        return bot.sendMessage(chatId,'Я тебя не понимаю');
    })
    bot.on('callback_query', async msg => {
        try {
            const data = msg.data;
            const chatId = msg.message.chat.id;
            if (data=='/again') {
                return startGame(chatId);
            }
            const user = await UserModel.findOne({chatId})

            if (data == chats[chatId]) {
                user.right +=1
                await bot.sendMessage(chatId, `Урааа ты что-то смог в этой жизни, загаданное число - ${chats[chatId]}`, againOptions)
            } else {
                user.wrong +=1
                await bot.sendMessage(chatId, `Ахахахаха, неееет) Я загадал ${chats[chatId]}`, againOptions)
            }
            console.log(msg)
            await user.save();
        } catch (e) {
            return bot.sendMessage(chatId, 'Произошла error');
        }})
}

start()