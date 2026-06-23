export const splashView = {
  /**
   * የሙከራ/መጫኛ ገጽ (Splash Screen) HTML መዋቅር
   */
  render: async () => {
    return `
      <div class="splash-container flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-600 to-indigo-800 text-white p-6 text-center">
        
        <div class="logo-wrapper mb-6 animate-bounce">
          <div class="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/20 shadow-lg">
            <span class="text-4xl">S💼</span>
          </div>
        </div>

        <h1 class="text-2xl font-black tracking-wide mb-1 drop-shadow-sm">SiraLink</h1>
        <p class="text-xs text-blue-200/80 font-medium mb-12">በ AI የሚሰራ የስራ ማዛመጃ መድረክ</p>

        <div class="loader-wrapper flex flex-col items-center gap-3">
          <div class="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
          <p class="text-[11px] text-blue-100/70 font-semibold tracking-wider uppercase animate-pulse" id="splash-status-text">
            የቴሌግራም ደህንነት እየተረጋገጠ ነው...
          </p>
        </div>

        <div class="absolute bottom-6 text-[10px] text-blue-300/60 font-medium">
          Powered by Supabase & Telegram SDK
        </div>

      </div>
    `;
  },

  /**
   * ገጹ ከለቀቀ በኋላ የደህንነት ማረጋገጫውን ጠብቆ ወደ ሆም የሚመራበት ጊዜያዊ መቆጣጠሪያ
   */
  afterRender: async () => {
    const statusText = document.getElementById('splash-status-text');

    // በቴሌግራም አረጋገጫው እና በዳታቤዝ ፍለጋው መካከል ለተጠቃሚው ምቾት የሚሰጥ አጭር መዘግየት (1.5 ሰከንድ)
    setTimeout(() => {
      if (statusText) statusText.innerText = "እንኳን በደህና መጡ! ወደ ዳሽቦርድ እየገባ ነው...";
      
      setTimeout(() => {
        // የደህንነት ማረጋገጫው ቀድሞውኑ በ app.js ስለሚሰራ፣ ይህ ገጽ በቀጥታ ወደ #home ይመራል
        window.location.hash = '#home';
      }, 1000);
    }, 1500);
  }
};
