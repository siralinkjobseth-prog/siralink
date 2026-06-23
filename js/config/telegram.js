class TelegramConfig {
  constructor() {
    this.tg = window.Telegram ? window.Telegram.WebApp : null;
  }

  /**
   * የቴሌግራም Mini App መለያዎችን እና የ UI ሁኔታዎችን ማዋቀሪያ
   */
  init() {
    if (!this.tg) {
      console.warn("⚠️ መተግበሪያው ከቴሌግራም ውጭ እየሰራ ነው። የቴሌግራም SDK አልተገኘም።");
      return false;
    }

    // ቴሌግራም አፑ ሙሉ በሙሉ መጫኑን እንዲያውቅ ማድረግ
    this.tg.ready();

    // መተግበሪያውን ሙሉ ስክሪን (Expand) ማድረግ
    this.tg.expand();

    // የበላይ አሞሌ (Header) ከለርን ከቴሌግራም ገጽታ ጋር ማመሳሰል
    this.tg.setHeaderColor('secondary_bg_color');
    this.tg.setBackgroundColor('bg_color');

    console.log("ℹ️ የቴሌግራም Mini App SDK በስኬት ተነስተው ተዋቅረዋል።");
    return true;
  }

  /**
   * አሁን ያለውን የቴሌግራም Theme መረጃዎች መመለሻ
   */
  getThemeParams() {
    return this.tg ? this.tg.themeParams : {};
  }

  /**
   * የተጠቃሚውን ቋንቋ መለያ መውሰጃ (ለምሳሌ፦ 'am', 'en')
   */
  getUserLanguage() {
    return this.tg && this.tg.initDataUnsafe?.user 
      ? this.tg.initDataUnsafe.user.language_code 
      : 'am';
  }
}

export const telegramConfig = new TelegramConfig();
