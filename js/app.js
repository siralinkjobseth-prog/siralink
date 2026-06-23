// 1. ሁሉንም ገጾች (Views) እና የኦቴንቲኬሽን ሰርቪስ ማስገባት (Import)
import { authService } from './auth/telegram-auth.js';
import { homeView } from './views/homeView.js';
import { jobsView } from './views/jobsView.js';
import { jobDetailView } from './views/jobDetailView.js';
import { profileView } from './views/profileView.js';
import { adminJobsView } from './views/admin/adminJobsView.js'; // 👈 አዲሱ የአድሚን ገጽ

class AppRouter {
  constructor() {
    this.root = document.getElementById('app-root');
    this.bottomNav = document.getElementById('bottom-nav');
    
    // 🗺️ የገጾች ሙሉ መዝገብ (Comprehensive Routes Map)
    this.routes = {
      '#home': homeView,
      '#jobs': jobsView,
      '#profile': profileView,
      '#admin-jobs': adminJobsView, // 👈 አድሚኑ አዲስ ስራ የሚለጥፍበት ገጽ
    };
  }

  /**
   * አፑን የሚያስነሳና የቴሌግራም ደህንነትን የሚያረጋግጥ ዋና ተግባር
   */
  async start() {
    // 1. መጀመሪያ የቴሌግራም ደህንነትን ማረጋገጥ እና መመዝገብ
    const user = await authService.initAuth();
    
    if (!user) {
      // ተጠቃሚው ከቴሌግራም ውጭ ከሆነ ወይም ካልተረጋገጠ አፑ እዚህ ይቆማል
      return;
    }

    // 2. የታችኛውን ማውጫ አሞሌ (Navigation Bar) ለተጠቃሚው ማሳየት
    this.bottomNav.classList.remove('hidden');

    // 3. የሊንክ ለውጦችን በሪል-ታይም ማዳመጥ (Listen to URL Hash changes)
    window.addEventListener('hashchange', () => this.route());
    
    // 4. አፑ መጀመሪያ ሲከፈት ወደ #home ገጽ መምራት (Default Route)
    if (!window.location.hash || window.location.hash === '#') {
      window.location.hash = '#home';
    } else {
      this.route();
    }
  }

  /**
   * ሊንኩን (Hash) አይቶ ገጾችን በዲናሚክ ፍጥነት የሚቀያይር ኢንጂን
   */
  async route() {
    const hash = window.location.hash || '#home';
    let view = this.routes[hash];
    let dynamicParam = null;

    // 🧩 ለ Dynamic Routes ልዩ ቁጥጥር (ለምሳሌ፦ #job-detail/123)
    if (hash.startsWith('#job-detail/')) {
      view = jobDetailView;
      dynamicParam = hash.split('/')[1]; // ከሊንኩ ላይ የ Job IDን ለይቶ ያወጣል
    }

    // ገጹ በሲስተሙ ውስጥ ካልተመዘገበ በራስ-ሰር ወደ ሆም መመለስ
    if (!view) {
      console.warn(`[Router Warning] ያልተመዘገበ ገጽ ተጠይቋል: ${hash}. ወደ መነሻ ገጽ እየተመለሰ ነው...`);
      window.location.hash = '#home';
      return;
    }

    // 🔄 የድሮውን ገጽ አጥፍቶ አዲሱን ገጽ ወደ ስክሪን ላይ መጫን
    this.root.innerHTML = await view.render(dynamicParam);
    
    // ገጹ በስክሪን ላይ ተስሎ ካለቀ በኋላ የራሱን ክስተቶች (Events) እንዲቀሰቅስ ማድረግ
    if (view.afterRender) {
      await view.afterRender(dynamicParam);
    }

    // 🎨 የታችኛውን ማውጫ ቁልፎች ከለር አሁን ካለንበት ገጽ ጋር ማመሳሰል
    this.updateActiveNavTab(hash);
  }

  /**
   * የተመረጠውን ገጽ የታችኛው ማውጫ ቁልፍ ሰማያዊ (Active) የማድረጊያ ዘዴ
   */
  updateActiveNavTab(hash) {
    // 1. መጀመሪያ ሁሉንም ወደ መደበኛ ግራጫ ከለር መመለስ
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('text-blue-600');
      item.classList.add('text-gray-400');
    });

    // 2. አድሚን ገጽ ላይ ከሆንን የታችኛውን ማውጫ መደበቅ (ከተፈለገ)
    if (hash === '#admin-jobs') {
      this.bottomNav.classList.add('hidden');
      return;
    } else {
      this.bottomNav.classList.remove('hidden');
    }

    // 3. አሁን ያለንበትን ገጽ መለየት እና ከለሩን ማስተካከል
    let activeId = 'nav-home';
    if (hash.startsWith('#jobs') || hash.startsWith('#job-detail')) activeId = 'nav-jobs';
    if (hash === '#profile') activeId = 'nav-profile';

    const activeTab = document.getElementById(activeId);
    if (activeTab) {
      activeTab.classList.remove('text-gray-400');
      activeTab.classList.add('text-blue-600');
    }
  }
}

// አፑን በይፋ ማስነሳት
const app = new AppRouter();
document.addEventListener('DOMContentLoaded', () => app.start());
