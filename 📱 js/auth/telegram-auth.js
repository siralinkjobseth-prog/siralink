import { supabase } from '../config/supabase.js';

class TelegramAuth {
  constructor() {
    // በቴሌግራም የሚሰጠውን የ WebApp SDK መፈተሽ
    this.tg = window.Telegram ? window.Telegram.WebApp : null;
    this.currentUser = null;
  }

  /**
   * ሚኒ አፑ ሲከፈት መጀመሪያ የሚሮጥ የሎጊን/የማረጋገጫ ሲስተም
   */
  async initAuth() {
    if (!this.tg) {
      console.error("🚨 ይህ መተግበሪያ መስራት የሚችለው በቴሌግራም ውስጥ ብቻ ነው!");
      this.showBrowserWarning();
      return null;
    }

    // ቴሌግራም ሚኒ አፑን እንዲያዘጋጅ መንገር (Ready)
    this.tg.ready();
    this.tg.expand(); // አፑን ሙሉ ስክሪን ማድረግ

    const initDataStr = this.tg.initData;
    const userRaw = this.tg.initDataUnsafe?.user;

    if (!userRaw) {
      console.error("🚨 የተጠቃሚ መረጃ ከቴሌግራም ማግኘት አልተቻለም።");
      return null;
    }

    try {
      // 1. 🛡️ በምርት ደረጃ (Production) የ initData መረጃን በባክኤንድ (Edge Function) በኩል Validate መደረግ አለበት።
      // ለጊዜው ተጠቃሚው በቦቱ አስቀድሞ ስለተመዘገበ ከSupabase ዳታቤዝ ላይ እናረጋግጠዋለን።
      const telegramId = userRaw.id;

      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramId)
        .single();

      if (error || !user) {
        console.log("ℹ️ ተጠቃሚው በዳታቤዝ ውስጥ አልተገኘም፣ አዲስ ምዝገባ እየተካሄደ ነው...");
        this.currentUser = await this.registerNewUser(userRaw);
      } else {
        console.log(`👋 እንኳን ደህና መጡ ${user.full_name}!`);
        this.currentUser = user;
        
        // የተጠቃሚውን የመጨረሻ መታያ ሰዓት ማዘመን
        await supabase
          .from('users')
          .update({ last_seen: new Date().toISOString() })
          .eq('id', user.id);
      }

      // የተጠቃሚውን Session በ LocalStorage መያዝ
      localStorage.setItem('siralink_user', JSON.stringify(this.currentUser));
      return this.currentUser;

    } catch (err) {
      console.error("🚨 በኦቴንቲኬሽን ወቅት ስህተት ተፈጥሯል:", err.message);
      return null;
    }
  }

  /**
   * ተጠቃሚው በቦቱ ሳያልፍ ቀጥታ አፑን ከከፈተ የሚመዘገብበት ተግባር
   */
  async registerNewUser(tgUser) {
    const fullName = `${tgUser.first_name || ''} ${tgUser.last_name || ''}`.trim() || 'የ SiraLink ተጠቃሚ';
    
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          telegram_id: tgUser.id,
          username: tgUser.username || null,
          first_name: tgUser.first_name || null,
          last_name: tgUser.last_name || null,
          full_name: fullName,
          is_active: true
        }
      ])
      .select()
      .single();

    if (error) {
      throw new Error("አዲስ ተጠቃሚ መመዝገብ አልተቻለም: " + error.message);
    }
    return data;
  }

  /**
   * አፑ ከቴሌግራም ውጭ በተራ ብሮውዘር ከተከፈተ ማስጠንቀቂያ ማሳያ
   */
  showBrowserWarning() {
    document.body.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; text-align:center; font-family:sans-serif; padding:20px;">
        <h2>⚠️ SiraLink ማግኘት የሚቻለው በቴሌግራም ብቻ ነው</h2>
        <p>እባክዎ መተግበሪያውን ለመጠቀም የቴሌግራም ቦቱን ይክፈቱ።</p>
        <a href="https://t.me/SiraLink_bot" style="background:#2481cc; color:white; padding:10px 20px; text-decoration:none; border-radius:5px; margin-top:15px;">ወደ ቴሌግራም ቦት ሂድ</a>
      </div>
    `;
  }
}

export const authService = new TelegramAuth();
