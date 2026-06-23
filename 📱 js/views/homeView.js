import { supabase } from '../config/supabase.js';

export const homeView = {
  /**
   * የገጹን HTML መዋቅር መፍጠሪያ
   */
  render: async () => {
    // 1. የገባውን ተጠቃሚ መረጃ ከ LocalStorage ማውጣት
    const cachedUser = JSON.stringify(localStorage.getItem('siralink_user'));
    const user = cachedUser ? JSON.parse(cachedUser) : { full_name: 'እንግዳ', profile_completion: 0, id: null };

    // 2. ለስታቲስቲክስ የሚሆኑ መረጃዎችን ከዳታቤዝ በሪል-ታይም ማምጣት
    let activeJobsCount = 0;
    let appliedCount = 0;
    let savedCount = 0;

    if (user.id) {
      try {
        // ሀ. አጠቃላይ ክፍት ስራዎች ብዛት
        const { count: jobsCount } = await supabase
          .from('jobs')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');
        activeJobsCount = jobsCount || 0;

        // ለ. ተጠቃሚው ያመለከተባቸው ስራዎች ብዛት
        const { count: appCount } = await supabase
          .from('applications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        appliedCount = appCount || 0;

        // ሐ. ተጠቃሚው ያስቀመጣቸው (Saved) ስราዎች ብዛት
        const { count: svCount } = await supabase
          .from('saved_jobs')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        savedCount = svCount || 0;
      } catch (err) {
        console.error("ስታቲስቲክስ ማምጣት አልተቻለም:", err.message);
      }
    }

    // 3. የገጹ HTML መዋቅር (ከአንተ ዲዛይን ጋር የተቀናጀ)
    return `
      <div class="dashboard-container p-4">
        <div class="welcome-card bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-5 rounded-2xl shadow-lg mb-6">
          <h1 class="text-2xl font-bold mb-1">ሰላም፣ ${user.full_name}! 👋</h1>
          <p class="text-sm text-blue-100 mb-4">ለእርስዎ የሚመጥኑ አዳዲስ ስራዎችን ፈልገው አሁኑኑ ያመልክቱ።</p>
          
          <div class="profile-progress-container bg-opacity-20 bg-white p-3 rounded-xl">
            <div class="flex justify-between text-xs font-semibold mb-1">
              <span>የፕሮፋይልዎ ሁኔታ</span>
              <span>${user.profile_completion || 0}%</span>
            </div>
            <div class="w-full bg-white bg-opacity-30 rounded-full h-2">
              <div class="bg-orange-500 h-2 rounded-full" style="width: ${user.profile_completion || 0}%"></div>
            </div>
          </div>
        </div>

        <h2 class="text-lg font-bold text-gray-800 mb-4">የእርስዎ ማጠቃለያ</h2>
        <div class="grid grid-cols-2 gap-4 mb-6">
          
          <div class="stat-card bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between" onclick="window.location.hash = '#jobs'">
            <div class="icon-wrapper bg-blue-50 text-blue-600 p-2 rounded-lg w-10 h-10 flex items-center justify-center mb-3">
              <img src="assets/icons/jobs.svg" alt="Jobs" class="w-6 h-6">
            </div>
            <div>
              <span class="text-xs text-gray-500 font-medium block">ክፍት ስራዎች</span>
              <span class="text-xl font-bold text-gray-800">${activeJobsCount}</span>
            </div>
          </div>

          <div class="stat-card bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div class="icon-wrapper bg-green-50 text-green-600 p-2 rounded-lg w-10 h-10 flex items-center justify-center mb-3">
              <img src="assets/icons/analytics.svg" alt="Applied" class="w-6 h-6">
            </div>
            <div>
              <span class="text-xs text-gray-500 font-medium block">ያመለከቱባቸው</span>
              <span class="text-xl font-bold text-gray-800">${appliedCount}</span>
            </div>
          </div>

          <div class="stat-card bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between" onclick="window.location.hash = '#saved-jobs'">
            <div class="icon-wrapper bg-orange-50 text-orange-600 p-2 rounded-lg w-10 h-10 flex items-center justify-center mb-3">
              <img src="assets/icons/profile.svg" alt="Saved" class="w-6 h-6">
            </div>
            <div>
              <span class="text-xs text-gray-500 font-medium block">የተቀመጡ</span>
              <span class="text-xl font-bold text-gray-800">${savedCount}</span>
            </div>
          </div>

          <div class="stat-card bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between" onclick="window.location.hash = '#notifications'">
            <div class="icon-wrapper bg-purple-50 text-purple-600 p-2 rounded-lg w-10 h-10 flex items-center justify-center mb-3">
              <img src="assets/icons/notifications.svg" alt="Notifications" class="w-6 h-6">
            </div>
            <div>
              <span class="text-xs text-gray-500 font-medium block">ማሳወቂያዎች</span>
              <span class="text-xl font-bold text-gray-800">አዲስ</span>
            </div>
          </div>

        </div>

        <div class="action-banner bg-orange-50 border border-orange-100 p-4 rounded-xl flex justify-between items-center">
          <div>
            <h3 class="text-sm font-bold text-orange-800">ሲቪዎን አላያያዙም?</h3>
            <p class="text-xs text-orange-600">በ AI ስራዎችን ፈጥኖ ለማግኘት ፕሮፋይልዎን ያጠናቅቁ።</p>
          </div>
          <button onclick="window.location.hash = '#profile'" class="bg-orange-500 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-sm">አሁን ሙላ</button>
        </div>
      </div>
    `;
  },

  /**
   * ገጹ ተስሎ ካለቀ በኋላ ክሊክ ወዘተ ክስተቶችን (Events) ለማስያዝ
   */
  afterRender: async () => {
    console.log("የዳሽቦርድ ገጽ ክስተቶች ዝግጁ ናቸው።");
  }
};
