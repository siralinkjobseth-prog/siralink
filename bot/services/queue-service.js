const TelegramBot = require('node-telegram-bot-api');
// .env ፋይል ውስጥ ያስቀመጥከውን የቦት ቶክን ያነባል
const token = process.env.TELEGRAM_BOT_TOKEN; 
const bot = new TelegramBot(token);

class NotificationQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
    this.rateLimitInterval = 1000 / 30; // በሰከንድ 30 መልዕክት ለማድረስ (ከ33 ሚሊሰከንድ ልዩነት ጋር)
  }

  /**
   * አዲስ የመልዕክት ስራዎችን ወደ ሰልፍ መጫኛ (Push)
   * @param {Array} users - የቴሌግራም ID የያዙ ተጠቃሚዎች ዝርዝር [{telegram_id: 123}, ...]
   * @param {String} messageText - የሚላከው የስራ መግለጫ ፅሁፍ
   */
  addToQueue(users, messageText) {
    users.forEach(user => {
      this.queue.push({
        chatId: user.telegram_id,
        text: messageText
      });
    });

    console.log(`[Queue] ${users.length} አዳዲስ መልዕክቶች ወደ ሰልፍ ገብተዋል። አጠቃላይ በሰልፍ ላይ ያሉ፦ ${this.queue.length}`);
    
    // ሰልፉ ከቆመ መልሰን እናስነሳዋለን
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  /**
   * ሰልፉን አንድ በአንድ እያነበበ በየተራ የሚልክ ኢንጂን
   */
  async processQueue() {
    if (this.queue.length === 0) {
      this.isProcessing = false;
      console.log("[Queue] ሁሉም የማሳወቂያ መልዕክቶች በስኬት ተልከው አልቀዋል!");
      return;
    }

    this.isProcessing = true;
    const currentJob = this.queue.shift(); // ከመጀመሪያው ሰልፍ ላይ አንዱን ያወጣል

    try {
      // ለተጠቃሚው መልዕክቱን ከነ ማመልከቻ ቁልፉ (Inline Button) መላክ
      await bot.sendMessage(currentJob.chatId, currentJob.text, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🚀 አፕሊኬሽኑን ክፈት', url: 'https://t.me/SiraLink_bot/app' }]
          ]
        }
      });
      console.log(`[Queue] መልዕክት ለ ${currentJob.chatId} ተልኳል።`);
    } catch (error) {
      // ተጠቃሚው ቦቱን Block ካደረገው ቴሌግራም እንዳይበላሽ Errorሩን እዚህ እንይዛለን
      if (error.response && error.response.statusCode === 403) {
        console.log(`[Queue Warning] ተጠቃሚው ${currentJob.chatId} ቦቱን Block አድርጓል።`);
      } else {
        console.error(`[Queue Error] መላክ አልተቻለም ለ ${currentJob.chatId}:`, error.message);
      }
    }

    // 🚨 ዋናው ሚስጥር፦ ቴሌግራም ፍጥነታችንን እንዳይገድበው የጊዜ ልዩነት (Delay) ሰጥተን ቀጣዩን እንጠራለን
    setTimeout(() => {
      this.processQueue();
    }, this.rateLimitInterval);
  }
}

// ለሌሎች ፋይሎች እንዲያገለግል Singleton Instance አድርገን ኤክስፖርት እናደርገዋለን
module.exports = new NotificationQueue();
