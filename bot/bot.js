import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import { startCommand } from './commands/start.js';

// የ .env መረጃዎችን መጫን
dotenv.config();

const botToken = process.env.TELEGRAM_BOT_TOKEN;

if (!botToken) {
  console.error("🚨 致命 ስህተት: TELEGRAM_BOT_TOKEN በ .env ፋይል ውስጥ አልተገኘም!");
  process.exit(1);
}

// የቦት ክላይንት መፍጠር
const bot = new Telegraf(botToken);

// 🗺️ የትዕዛዞች ምዝገባ (Registering Commands)
bot.command('start', async (ctx) => {
  await startCommand.execute(ctx);
});

// የቴክስት መልዕክት ሲመጣ (Fallback Message Handler)
bot.on('text', async (ctx) => {
  await ctx.reply('💡 እባክዎ መተግበሪያውን ለመጠቀም ከታች ያለውን "SiraLink አፑን ክፈት" የሚለውን ቁልፍ ይጫኑ።');
});

// ቦቱን በይፋ ማስነሳት (Polling Mode)
bot.launch().then(() => {
  console.log('🤖 SiraLink የቴሌግራም ቦት በስኬት መሥራት ጀምሯል... (Polling)');
}).catch((err) => {
  console.error('🚨 ቦቱን ማስነሳት አልተቻለም:', err.message);
});

// የኖድ ፕሮሰስ ሲቆም ቦቱን በጥንቃቄ ማጥፋት (Graceful Shutdown)
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
