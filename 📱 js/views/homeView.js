import { usersService } from '../services/users-service.js';
import { jobsService } from '../services/jobs-service.js';
import { applicationsService } from '../services/applications-service.js';

export const homeView = {
  /**
   * የዳሽቦርዱን HTML መዋቅር መፍጠሪያ
   */
  render: async () => {
    // 1. የገባውን ተጠቃሚ መረጃ ከ LocalStorage ማውጣት
    const cachedUser = localStorage.getItem('siralink_user');
    let user = cachedUser ? JSON.parse(cachedUser) : null;

    if (!user) {
      return `
        <div class="p-6 text-center text-red-500 bg-red-50 rounded-2xl m-4 border border-red-100">
          <p class="font-bold">⚠️ ፈቃድ አልተሰጠውም</p>
          <p class="text-xs mt-1">እባክዎ መተግበሪያውን ለመጠቀም መጀመሪያ የቴሌግራም ቦቱን ይክፈቱ።</p>
        </div>
      `;
    }

    // 2. ሰርቪሶቹን በመጥራት የቅርብ ጊዜ ስራዎችን እና የተጠቃሚውን አፕሊኬሽኖች ማምጣት
    const latestJobs = await jobsService.getActiveJobs();
    const userApps = await applicationsService.getUserApplications(user.id);
    
    // የቅርብ ጊዜ 3 ስራዎችን ብቻ ለመውሰድ
    const topJobs = latestJobs.slice(0, 3);
    const completionScore = user.profile_completion || 20;

    return `
      <div class="dashboard-container p-4 pb-24 bg-gray-50 min-h-screen">
        
        <!-- 👋 የእንኳን ደህና መጡ ክፍል -->
        <div class="welcome-section mb-6 bg-gradient-to-r from-blue-600 to-indigo-700 p-5 rounded-2xl text-white shadow-sm">
          <h2 class="text-lg font-bold">ሰላም፣ ${user.full_name || 'ተጠቃሚ'}! 👋</h2>
          <p class="text-xs text-blue-100 mt-1">ለእርስዎ የሚመጥኑ ምርጥ የስራ አማራጮችን እዚህ ያገኛሉ።</p>
          
          <!-- 📊 የፕሮፋይል ማጠናቀቂያ ደረጃ (Progress Bar) -->
          <div class="mt-4 bg-blue-800/40 p-3 rounded-xl border border-blue-500/20">
            <div class="flex justify-between text-[11px] font-semibold mb-1">
              <span>የፕሮፋይልዎ ሙላት</span>
              <span>${completionScore}%</span>
            </div>
            <div class="w-full bg-blue-900/50 rounded-full h-2 overflow-hidden">
              <div class="bg-emerald-400 h-2 rounded-full transition-all duration-500" style="w-full: ${completionScore}%"></div>
            </div>
            ${completionScore < 100 ? `
              <p class="text-[10px] text-emerald-200 mt-1.5 font-medium">💡 ፕሮፋይልዎን 100% በማጠናቀቅ በ AI የመመረጥ ዕድልዎን ያሳድጉ!</p>
            ` : '🎉 ፕሮፋይልዎ ሙሉ ነው!'}
          </div>
        </div>

        <!-- 📈 አጫጭር ስታቲስቲክስ (Stat Cards) -->
        <div class="grid grid-cols-2 gap-3 mb-6">
          <div class="bg-white p-3.5 rounded-xl border border-gray-100 shadow-xs">
            <span class="text-xs font-bold text-gray-400 block mb-0.5">ያመለከቱባቸው</span>
            <span class="text-xl font-black text-gray-800">${userApps.length}</span>
          </div>
          <div class="bg-white p-3.5 rounded-xl border border-gray-100 shadow-xs">
            <span class="text-xs font-bold text-gray-400 block mb-0.5">ክፍት ስራዎች</span>
            <span class="text-xl font-black text-blue-600">${latestJobs.length}</span>
          </div>
        </div>

        <!-- 🔥 የቅርብ ጊዜ ክፍት ስራዎች (Latest Jobs Section) -->
        <div class="mb-4 flex justify-between items-center">
          <h3 class="text-sm font-bold text-gray-800">የቅርብ ጊዜ ክፍት ስራዎች</h3>
          <a href="#jobs" class="text-xs font-bold text-blue-600 hover:underline">ሁሉንም እይ</a>
        </div>

        <div class="space-y-3" id="latest-jobs-list">
          ${topJobs.length === 0 ? `
            <div class="text-center py-8 bg-white rounded-xl border border-dashed border-gray-200 text-xs text-gray-400 font-medium">
              በአሁኑ ሰዓት ምንም ክፍት ስራ የለም።
            </div>
          ` : topJobs.map(job => `
            <div class="job-card bg-white p-4 rounded-xl border border-gray-100 shadow-xs hover:border-blue-200 transition-all cursor-pointer" data-id="${job.id}">
              <div class="flex justify-between items-start">
                <div>
                  <h4 class="text-xs font-bold text-gray-800 line-clamp-1">${job.title}</h4>
                  <p class="text-[11px] text-gray-500 font-medium mt-0.5">${job.company_name}</p>
                </div>
                <span class="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-bold">${job.employment_type || 'Full-time'}</span>
              </div>
              <div class="flex items-center gap-3 mt-3 text-[10px] text-gray-400 font-medium border-t border-gray-50 pt-2">
                <span class="flex items-center gap-1">📍 ${job.location || 'አዲስ አበባ'}</span>
                <span class="flex items-center gap-1">💰 ${job.salary_range || 'በስምምነት'}</span>
              </div>
            </div>
          `).join('')}
        </div>

      </div>
    `;
  },

  /**
   * በገጹ ላይ ያሉትን ክሊኮች እና ኢንተራክሽኖች መቆጣጠሪያ
   */
  afterRender: async () => {
    // 1. ካርዶቹ ሲነኩ ወደ ስራው ዝርዝር ገጽ (jobDetailView) እንዲወስድ ማድረግ
    const cards = document.querySelectorAll('.job-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const jobId = card.getAttribute('data-id');
        window.location.hash = `#job-detail?id=${jobId}`;
      });
    });

    // 2. በጀርባ (Background) የተጠቃሚውን አዲስ መረጃ ከዳታቤዝ አምጥቶ መሸጎጫውን ማዘመን
    const cachedUser = JSON.parse(localStorage.getItem('siralink_user'));
    if (cachedUser && cachedUser.telegram_id) {
      usersService.getUserByTelegramId(cachedUser.telegram_id).then(freshUser => {
        if (freshUser) {
          localStorage.setItem('siralink_user', JSON.stringify(freshUser));
        }
      }).catch(err => console.log('Silent user update failed:', err.message));
    }
  }
};
