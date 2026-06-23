const { createClient } = require('@supabase/supabase-js');

// ከ .env ላይ የ Supabase መረጃዎችን እናነባለን
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // 🚨 ተጠቃሚ ለመመዝገብ Service Role Key ይመረጣል
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * /start ትዕዛዝ ሲመጣ ተጠቃሚውን መዝግቦ የ Mini App ሊንክ የሚሰጥ ተግባር
 * @param {Object} bot - የቴሌግራም ቦት Instance
 * @param {Object} msg - ከቴሌግራም የመጣው የመልዕክት መረጃ
 */
async function handleStartCommand(bot, msg) {
  const chatId = msg.chat.id;
  const fromUser = msg.from; // የቴሌግራም ተጠቃሚ መረጃ (id, first_name, username)

  // በቴሌግራም የሚመጡ ስሞች ባዶ እንዳይሆኑ ማረጋገጥ
  const firstName = fromUser.first_name || '';
  const lastName = fromUser.last_name || '';
  const fullName = `${firstName} ${lastName}`.trim() || 'የ SiraLink ተጠቃሚ';

  try {
    // 1. 📢 ተጠቃሚው በዳታቤዝ ውስጥ አስቀድሞ መኖሩን ወይም አለመኖሩን ማረጋገጥ (Upsert)
    // ተጠቃሚው ከዚህ በፊት ካለ ዳታው ይዘመናል፣ ከሌለ አዲስ Row ይፈጠራል።
    const { error } = await supabase
      .from('users')
      .upsert({
        telegram_id: fromUser.id,
        username: fromUser.username || null,
        first_name: firstName || null,
        last_name: lastName || null,
        full_name: fullName,
        is_active: true,
        last_seen: new Date().toISOString()
      }, { onConflict: 'telegram_id' }); // በ telegram_id ላይ ግጭት እንዳይፈጠር

    if (error) {
      console.error('[Database Error] ተጠቃሚውን መመዝገብ አልተቻለም:', error.message);
    } else {
      console.log(`[Database Success] ተጠቃሚው ${fullName} (ID: ${fromUser.id}) በስኬት ተመዝግቧል/ዘምኗል።`);
    }

    // 2. 📱 ለተጠቃሚው የሚላክ የእንኳን ደህና መጣህ መልዕክት
    const welcomeMessage = `👋 ጤና ይስጥልኝ ${firstName}!\n\n` +
                           ` እንኳን ወደ **SiraLink** የቅጥር ስነ-ምህዳር በሰላም መጡ።\n\n` +
                           `SiraLink በቴሌግራምዎ ላይ ብቻ በመሆን አዳዲስ የስራ ማስታወቂያዎችን በፍጥነት የሚፈልጉበት፣ ` +
                           `ፕሮፋይልዎን በመሙላት በሲቪዎ የሚመጥኑ ስራዎችን የሚያገኙበት እና ቀጥታ የሚያመለክቱበት መድረክ ነው።\n\n` +
                           `👇 አሁኑኑ መተግበሪያውን ለመክፈት ከታች ያለውን **🚀 አፕሊኬሽኑን ክፈት** የሚለውን ቁልፍ ይጫኑ!`;

    // 3. የ Mini App ቁልፍ (Inline Keyboard with WebApp URL) ማዘጋጀት
    await bot.sendMessage(chatId, welcomeMessage, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { 
              text: '🚀 SiraLink አፕሊኬሽኑን ክፈት', 
              // 🚨 ማሳሰቢያ፦ የራስህን Bot WebApp URL እዚህ ጋር ቀይረው
              web_app: { url: 'https://YOUR_MINI_APP_DOMAIN.com/index.html' } 
            }
          ]
        ]
      }
    });

  } catch (globalError) {
    console.error('[Bot Error] በ /start ወቅት ስህተት ተፈጥሯል:', globalError.message);
    bot.sendMessage(chatId, "⚠️ ይቅርታ፣ ሲስተሙን ለማስነሳት ትንሽ ችግር አጋጥሟል። እባክዎ እንደገና ይሞክሩ።");
  }
}

module.exports = { handleStartCommand };
