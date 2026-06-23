import { supabase } from '../../js/config/supabase.js';
import dotenv from 'dotenv';
dotenv.config();

export const startCommand = {
  name: 'start',
  description: 'SiraLink መተግበሪያን መጀመሪያ ለማስነሳት',
  
  /**
   * የ /start ትዕዛዝ ሲመጣ የሚሰራው ዋና ተግባር
   * @param {Object} bot - Telegraf ወይም Telegram Bot Client Instance
   * @param {Object} ctx - የቴሌግራም ኮንቴክስት (Context)
   */
  execute: async (ctx) => {
    const telegramUser = ctx.from;
    const telegramId = telegramUser.id;
    const username = telegramUser.username || null;
    const fullName = `${telegramUser.first_name || ''} ${telegramUser.last_name || ''}`.trim();

    try {
      // 1. ተጠቃሚው ቀደም ብሎ በዳታቤዝ ውስጥ መኖሩን መፈተሽ
      let { data: user, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      // 2. ከዚህ ቀደም ያልተመዘገበ አዲስ ተጠቃሚ ከሆነ መመዝገብ
      if (!user) {
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert([
            {
              telegram_id: telegramId,
              username: username,
              full_name: fullName,
              profile_completion: 20 // መነሻ 20% ይሰጠዋል (ቴሌግራም አካውንት ስላለው)
            }
          ])
          .select()
          .single();

        if (insertError) throw insertError;
        user = newUser;
        console.log(`[Bot Engine] 🎉 አዲስ ተጠቃሚ በስኬት ተመዝግቧል: ${fullName} (ID: ${telegramId})`);
      }

      // 3. የ Mini App መክፈቻ ቁልፍ ማዘጋጀት (Inline Keyboard Button)
      const webAppUrl = process.env.WEBAPP_URL || 'https://your-mini-app-domain.com';

      await ctx.reply(`👋 ሰላም ${fullName}! ወደ SiraLink እንኳን በደህና መጡ።\n\n💼 ይህ በ AI የሚሰራ የስራ ማዛመጃ እና የቴሌግራም Mini App ፕላትፎርም ነው።\n\n👇 ከታች ያለውን "አፑን ክፈት" የሚለውን ቁልፍ በመንካት የቅርብ ጊዜ ስራዎችን ማየት እና ፕሮፋይልዎን ማጠናቀቅ ይችላሉ።`, {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '📱 SiraLink አፑን ክፈት', web_app: { url: webAppUrl } }
            ]
          ]
        }
      });

    } catch (err) {
      console.error('[Bot Start Command Error]:', err.message);
      await ctx.reply('⚠️ ይቅርታ፣ ቦቱን ማነሳሳት አልተቻለም። እባክዎ ጥቂት ቆይተው እንደገና ይሞክሩ።');
    }
  }
};
