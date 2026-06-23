import { authService } from './auth/telegram-auth.js';
import { homeView } from './views/homeView.js';
import { jobsView } from './views/jobsView.js';
import { jobDetailView } from './views/jobDetailView.js';
import { profileView } from './views/profileView.js';

class AppRouter {
  constructor() {
    this.root = document.getElementById('app-root');
    this.bottomNav = document.getElementById('bottom-nav');
    
    // የገጾች መዝገብ (Routes Map)
    this.routes = {
      '#home': homeView,
      '#jobs': jobsView,
      '#profile': profileView,
    };
  }

  /**
   * አፑን የሚያስነሳ ዋና ተግባር
   */
  async start() {
    // 1. መጀመሪያ የቴሌግራም ደህንነትን ማረጋገጥ እና መመዝገብ
    const user = await authService.initAuth();
    
    if (!user) {
      // ተጠቃሚው ትክክለኛ ካልሆነ አፑ እዚህ ይቆማል
      return;
    }

    // 2. የታችኛውን ማውጫ አሞሌ ማሳየት
    this.bottomNav.classList.remove('hidden');

    // 3. የሊንክ ለውጦችን ማዳመጥ (Listen to URL Hash changes)
    window.addEventListener('hashchange', () => this.route());
    
    // 4. መጀመሪያ ሲከፈት ወደ #home ገጽ መምራት (Default Route)
    if (!window.location.hash || window.location.hash === '#') {
      window.location.hash = '#home';
    } else {
      this.route();
    }
  }

  /**
   * ሊንኩን አይቶ ገጾችን የሚቀያይር ኢንጂን
   */
  async route() {
    const hash = window.location.hash || '#home';
    let view = this.routes[hash];
    let dynamicParam = null;

    // 🧩 ለ Dynamic Routes ልዩ ቁጥጥር (ለምሳሌ፦ #job-detail/123)
    if (hash.startsWith('#job-detail/')) {
      view = jobDetailView;
      dynamicParam = hash.split('/')[1]; // የ Job IDን ይለያል
    }

    // ገጹ በሲስተሙ ከሌለ ወደ ሆም መመለስ
    if (!view) {
      window.location.hash = '#home';
      return;
    }

    // 🔄 ገጹን ወደ ስክሪን ላይ መጫን
    this.root.innerHTML = await view.render(dynamicParam);
    
    // ገጹ ተስሎ ካለቀ በኋላ የራሱን ክስተቶች (Events) እንዲቀሰቅስ ማድረግ
    if (view.afterRender) {
      await view.afterRender(dynamicParam);
    }

    // 🎨 የታችኛውን ማውጫ ከለር ማስተካከል (Active State Utility)
    this.updateActiveNavTab(hash);
  }

  /**
   * የተመረጠውን ገጽ የታችኛው ቁልፍ ከለር ሰማያዊ ማድረግ
   */
  updateActiveNavTab(hash) {
    // መጀመሪያ ሁሉንም ወደ መደበኛ ግራጫ ከለር መመለስ
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('text-blue-600');
      item.classList.add('text-gray-400');
    });

    // አሁን ያለንበትን ገጽ መለየት
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
