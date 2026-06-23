import { jobsService } from '../services/jobs-service.js';

export const jobsView = {
  // የተጠቃሚውን ማጣሪያዎች በቪው ስቴት (State) ውስጥ መያዣ
  state: {
    department: '',
    location: '',
    search: ''
  },

  /**
   * የስራዎች መፈለጊያ እና ዝርዝር ማሳያ HTML መዋቅር
   */
  render: async () => {
    // 1. መጀመሪያ በስቴቱ መሠረት ስራዎችን ከሰርቪስ ማምጣት
    const jobs = await jobsService.getActiveJobs(jobsView.state);

    return `
      <div class="jobs-list-container p-4 pb-24 bg-gray-50 min-h-screen">
        <h1 class="text-xl font-bold text-gray-800 mb-1">ክፍት ስራዎች</h1>
        <p class="text-xs text-gray-500 mb-4">የሚፈልጉትን የስራ መደብ በቀላሉ ይፈልጉ ወይም ያጣሩ።</p>

        <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-3 mb-5">
          <div class="relative">
            <input type="text" id="job-search-input" value="${jobsView.state.search}" placeholder="የስራ መደብ ወይም ድርጅት ይፈልጉ..." 
              class="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 font-medium">
            <span class="absolute left-3 top-3.5 text-gray-400 text-xs">🔍</span>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <select id="filter-department" class="p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 focus:outline-none">
              <option value="" ${jobsView.state.department === '' ? 'selected' : ''}>ሁሉም ዘርፍ 💼</option>
              <option value="IT" ${jobsView.state.department === 'IT' ? 'selected' : ''}>IT / ቴክኖሎጂ</option>
              <option value="Accounting" ${jobsView.state.department === 'Accounting' ? 'selected' : ''}>አካውንቲንግ</option>
              <option value="Management" ${jobsView.state.department === 'Management' ? 'selected' : ''}>ማኔጅመንት</option>
              <option value="Law" ${jobsView.state.department === 'Law' ? 'selected' : ''}>ህግ</option>
            </select>

            <select id="filter-location" class="p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 focus:outline-none">
              <option value="" ${jobsView.state.location === '' ? 'selected' : ''}>ሁሉም ቦታ 📍</option>
              <option value="Addis Ababa" ${jobsView.state.location === 'Addis Ababa' ? 'selected' : ''}>አዲስ አበባ</option>
              <option value="Hawassa" ${jobsView.state.location === 'Hawassa' ? 'selected' : ''}>ሀዋሳ</option>
              <option value="Bahir Dar" ${jobsView.state.location === 'Bahir Dar' ? 'selected' : ''}>ባህር ዳር</option>
              <option value="Adama" ${jobsView.state.location === 'Adama' ? 'selected' : ''}>አዳማ</option>
            </select>
          </div>
        </div>

        <div class="space-y-3" id="jobs-results-wrapper">
          ${jobs.length === 0 ? `
            <div class="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200 p-6">
              <span class="text-3xl block mb-2">🔍</span>
              <p class="text-sm font-bold text-gray-700">ምንም ስራ አልተገኘም</p>
              <p class="text-xs text-gray-400 mt-1">እባክዎ የተለየ ቃል ወይም ማጣሪያ ተጠቅመው ይሞክሩ።</p>
            </div>
          ` : jobs.map(job => `
            <div class="job-item-card bg-white p-4 rounded-xl border border-gray-100 shadow-xs hover:border-blue-200 transition-all active:scale-[0.99] cursor-pointer" data-id="${job.id}">
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="text-xs font-bold text-gray-800 line-clamp-1">${job.title}</h3>
                  <p class="text-[11px] text-blue-600 font-semibold mt-0.5">${job.company_name}</p>
                </div>
                <span class="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-bold">${job.employment_type || 'Full-time'}</span>
              </div>
              
              <div class="flex items-center gap-4 mt-3.5 text-[10px] text-gray-400 font-medium border-t border-gray-50 pt-2">
                <span>📍 ${job.location}</span>
                <span>💼 ${job.department}</span>
                <span class="text-gray-500 ml-auto font-semibold">💰 ${job.salary_visible && job.salary_min ? `${job.salary_min} ETB` : 'በስምምነት'}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  /**
   * የማጣሪያ ለውጦችን እና ክሊኮችን በሪል-ታይም መቆጣጠሪያ
   */
  afterRender: async () => {
    const searchInput = document.getElementById('job-search-input');
    const deptSelect = document.getElementById('filter-department');
    const locSelect = document.getElementById('filter-location');

    // 🔄 ማጣሪያዎች ሲቀየሩ ስቴቱን አድሶ ገጹን በራስ-ሰር Reload የማድረጊያ ረዳት (Debounce)
    const triggerFilterUpdate = () => {
      jobsView.state.search = searchInput.value.trim();
      jobsView.state.department = deptSelect.value;
      jobsView.state.location = locSelect.value;
      
      // የ SPA ራውተራችንን በመጥራት ገጹን በዲናሚክ ማደስ
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    };

    // የፊልተር ለውጦችን ማዳመጥ (Event Listeners)
    deptSelect.addEventListener('change', triggerFilterUpdate);
    locSelect.addEventListener('change', triggerFilterUpdate);
    
    // በጽሑፍ ሲፈለግ ትንሽ ቆይቶ (Debounced Input) እንዲፈልግ ማድረግ
    let timeout = null;
    searchInput.addEventListener('input', () => {
      clearTimeout(timeout);
      timeout = setTimeout(triggerFilterUpdate, 400);
    });

    // 💳 ካርዶቹ ሲነኩ ወደ ስራው ዝርዝር ገጽ መምራት
    const jobCards = document.querySelectorAll('.job-item-card');
    jobCards.forEach(card => {
      card.addEventListener('click', () => {
        const jobId = card.getAttribute('data-id');
        window.location.hash = `#job-detail/${jobId}`;
      });
    });
  }
};
