// 1. አስፈላጊ የሆኑ ጥቅሎችን (Packages) እና ፋይሎችን መጥራት
require('dotenv').config(); // .env ፋይልን ለማንበብ
const TelegramBot = require('node-telegram-bot-api');
const { handleStartCommand } = require('./commands/start');
const notificationQueue = require('./services/queue-service');

// 2. ከ .env የመጣውን Bot Token ማረጋገጥ
const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error("🚨 Error: TELEGRAM_BOT_TOKEN በ .env ፋይል ውስጥ አልተገኘም!");
  process.exit(1);
}

// 3. የቦት አካልን መፍጠር (ለሊቨሎፕመንት ጊዜ Polling እንጠቀማለን፣ ለProduction ወደ Webhook ይቀየራል)
const bot = new TelegramBot(token, { polling: true });

console.log("🚀 SiraLink የቴሌግራም ቦት በስኬት ተነስቷል፣ መልዕክቶችን ለመቀበል ዝግጁ ነው...");

// 4. የትዕዛዞች ማስተናገጃ (Commands Handler)

// ሀ. /start ትዕዛዝ ሲመጣ
bot.onText(/\/start/, async (msg) => {
  await handleStartCommand(bot, msg);
});

// ለ. /help ትዕዛዝ ሲመጣ
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  const helpMessage = `🔍 **የ SiraLink ቦት እርዳታ መታወቂያ**\n\n` +
                      `• /start - አፕሊኬሽኑን ለመክፈት እና ለመመዝገብ\n` +
                      `• /help - ይህንን የረድኤት መልዕክት ለማየት\n\n` +
                      `💡 ማንኛውም ጥያቄ ወይም አስተያየት ካለዎት @SiraLink_Support ላይ ያግኙን።`;
  
  bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
});

// 5. መደበኛ የፅሁፍ መልዕክቶች ሲመጡ (Text Messages Handler)
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // ተጠቃሚው የላከው መልዕክት ትዕዛዝ (Command) ካልሆነ መሪ ፅሁፍ መስጠት
  if (text && !text.startsWith('/')) {
    const defaultResponse = `👋 የ SiraLink አፕሊኬሽኑን ተጠቅመው ስራዎችን መፈለግ እና ማመልከት ይችላሉ።\n\n` +
                            `አፑን ለመክፈት ከታች ያለውን ቁልፍ ይጫኑ ወይም /start ብለው ይፃፉ።`;
    
    bot.sendMessage(chatId, defaultResponse, {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🚀 SiraLink አፕሊኬሽኑን ክፈት', web_app: { url: process.env.MINI_APP_URL || 'https://t.me/SiraLink_bot/app' } }]
        ]
      }
    });
  }
});

// 6. በሲስተሙ ውስጥ ሊፈጠሩ የሚችሉ የቦት ስህተቶችን መያዣ (Error Handling)
bot.on('polling_error', (error) => {
  console.error(`[Polling Error] ከቴሌግራም ጋር መገናኘት አልተቻለም: ${error.message}`);
});

bot.on('error', (error) => {
  console.error(`[Global Bot Error] ያልተጠበቀ ስህተት: ${error.message}`);
});

module.exports = bot;
