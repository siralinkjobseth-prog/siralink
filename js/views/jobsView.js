import { supabase } from '../config/supabase.js';

export const jobsView = {
  /**
   * የገጹን መሠረታዊ HTML መዋቅር (የፍለጋ አሞሌ እና የሊስት ቦታ) መፍጠሪያ
   */
  render: async () => {
    return `
      <div class="jobs-container p-4 pb-20">
        <div class="search-section mb-6">
          <h1 class="text-xl font-bold text-gray-800 mb-3">ስራዎችን ይፈልጉ</h1>
          <div class="flex gap-2">
            <div class="relative flex-1">
              <input type="text" id="job-search-input" placeholder="የስራ መደብ ወይም ድርጅት..." 
                class="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 shadow-sm">
              <div class="absolute left-3 top-3.5 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <button id="filter-modal-btn" class="bg-blue-50 text-blue-600 p-2.5 rounded-xl border border-blue-100 shadow-sm flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707v5.586a1 1 0 01-.553.894l-2 1A1 1 0 0110 21v-6.586a1 1 0 00-.293-.707L3.293 6.707A1 1 0 013 6V4z" />
              </svg>
            </button>
          </div>
        </div>

        <div id="active-filters-tags" class="flex flex-wrap gap-2 mb-4 hidden"></div>

        <div id="jobs-list-wrapper" class="space-y-4">
          <div class="text-center py-10 text-gray-500 text-sm">ስራዎች እየተፈለጉ ነው...</div>
        </div>
      </div>

      <div id="filter-drawer" class="fixed inset-0 bg-black bg-opacity-40 z-50 hidden flex items-end">
        <div class="bg-white w-full rounded-t-3xl p-5 space-y-5 shadow-2xl transition-transform transform translate-y-full" id="drawer-content">
          <div class="flex justify-between items-center border-b pb-3">
            <h3 class="text-lg font-bold text-gray-800">ማጣሪያዎች</h3>
            <button id="close-drawer-btn" class="text-gray-400 text-sm font-semibold">ዝጋ</button>
          </div>
          
          <div>
            <label class="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">የስራ ዘርፍ</label>
            <select id="filter-department" class="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none">
              <option value="">ሁሉንም ዘርፎች አሳይ</option>
              <option value="IT">IT / ቴክኖሎጂ</option>
              <option value="Accounting">አካውንቲንግ / ፋይናንስ</option>
              <option value="Management">ማኔጅመንት</option>
              <option value="Law">ህግ</option>
            </select>
          </div>

          <div>
            <label class="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">የስራ ቦታ</label>
            <select id="filter-location" class="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none">
              <option value="">ሁሉንም ቦታዎች አሳይ</option>
              <option value="Addis Ababa">አዲስ አበባ</option>
              <option value="Hawassa">ሀዋሳ</option>
              <option value="Bahir Dar">ባህር ዳር</option>
              <option value="Adama">አዳማ</option>
            </select>
          </div>

          <div class="flex gap-3 pt-2">
            <button id="reset-filters-btn" class="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600">አጽዳ</button>
            <button id="apply-filters-btn" class="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-100">አፕላይ አድርግ</button>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * ገጹ በብሮውዘር ላይ ከተሳለ በኋላ የSupabase ዳታን መጫን እና ክስተቶችን (Events) መቆጣጠር
   */
  afterRender: async () => {
    const searchInput = document.getElementById('job-search-input');
    const filterBtn = document.getElementById('filter-modal-btn');
    const filterDrawer = document.getElementById('filter-drawer');
    const drawerContent = document.getElementById('drawer-content');
    const closeDrawerBtn = document.getElementById('close-drawer-btn');
    const applyFiltersBtn = document.getElementById('apply-filters-btn');
    const resetFiltersBtn = document.getElementById('reset-filters-btn');

    // የፊልተር መረጃዎችን መያዣ
    let currentFilters = { search: '', department: '', location: '' };

    // 1. 🔄 መረጃዎችን ከ Supabase አምጥቶ በሊስቱ ላይ የሚጭን ዋና ፈንክሽን
    const fetchAndRenderJobs = async () => {
      const listWrapper = document.getElementById('jobs-list-wrapper');
      listWrapper.innerHTML = `<div class="text-center py-10 text-gray-400 text-sm">እየተጫነ ነው...</div>`;

      try {
        // የመሠረት Query (ንቁ የሆኑ ስራዎችን ብቻ በጊዜ ቅደም ተከተል መውሰድ)
        let query = supabase
          .from('jobs')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        // ማጣሪያዎችን በዲናሚክ መጨመር
        if (currentFilters.department) {
          query = query.eq('department', currentFilters.department);
        }
        if (currentFilters.location) {
          query = query.eq('location', currentFilters.location);
        }
        if (currentFilters.search) {
          // በስራ መደብ ስም (Title) ላይ ፍለጋ ማድረግ (Case-insensitive ilike)
          query = query.ilike('title', `%${currentFilters.search}%`);
        }

        const { data: jobs, error } = await query;

        if (error) throw error;

        if (!jobs || jobs.length === 0) {
          listWrapper.innerHTML = `
            <div class="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <p class="text-gray-500 text-sm">ምንም የሚዛመድ የስራ ማስታወቂያ አልተገኘም።</p>
            </div>
          `;
          return;
        }

        // ካርዶቹን በHTML መልክ መሳል (ከአንተ Premium UI ዲዛይን ጋር የተቀናጀ)
        listWrapper.innerHTML = jobs.map(job => `
          <div class="job-card bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 items-start active:bg-gray-50 cursor-pointer" 
               onclick="window.location.hash = '#job-detail/${job.id}'">
            <div class="w-12 h-12 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
              <img src="${job.company_logo || 'assets/images/companies/default-company.png'}" alt="Logo" class="w-full h-full object-cover">
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-sm font-bold text-gray-800 truncate mb-0.5">${job.title}</h3>
              <p class="text-xs text-gray-500 font-medium mb-2">${job.company_name || 'የግል ድርጅት'}</p>
              
              <div class="flex flex-wrap gap-2 text-[11px] font-semibold text-gray-600">
                <span class="bg-gray-100 px-2 py-0.5 rounded-md flex items-center gap-1">📍 ${job.location}</span>
                <span class="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md">💼 ${job.employment_type}</span>
                ${job.salary_visible && job.salary_min ? `<span class="bg-green-50 text-green-600 px-2 py-0.5 rounded-md">💰 ${job.salary_min} - ${job.salary_max} ETB</span>` : ''}
              </div>
            </div>
          </div>
        `).join('');

      } catch (err) {
        console.error("ስራዎችን መጫን አልተቻለም:", err.message);
        listWrapper.innerHTML = `<div class="text-center py-10 text-red-500 text-sm">⚠️ መረጃዎችን መጫን አልተቻለም። እባክዎ እንደገና ይሞክሩ።</div>`;
      }
    };

    // 2. 🎛️ የክስተቶች (Event Listeners) መቆጣጠሪያዎች

    // የፍለጋ ፅሁፍ ሲፃፍ (Debounce ሳይደረግ ፈጣን ፍለጋ)
    searchInput.addEventListener('input', (e) => {
      currentFilters.search = e.target.value.trim();
      fetchAndRenderJobs();
    });

    // ሞዳሉን መክፈቻ
    filterBtn.addEventListener('click', () => {
      filterDrawer.classList.remove('hidden');
      setTimeout(() => drawerContent.classList.remove('translate-y-full'), 10);
    });

    // ሞዳሉን መዝጊያ ፈንክሽን
    const closeDrawer = () => {
      drawerContent.classList.add('translate-y-full');
      setTimeout(() => filterDrawer.classList.add('hidden'), 300);
    };
    closeDrawerBtn.addEventListener('click', closeDrawer);

    // ፊልተር አፕላይ ማድረጊያ
    applyFiltersBtn.addEventListener('click', () => {
      currentFilters.department = document.getElementById('filter-department').value;
      currentFilters.location = document.getElementById('filter-location').value;
      
      // ማጣሪያዎች መኖራቸውን የሚያሳይ Tag ማሳያ ህግ
      const tagsWrapper = document.getElementById('active-filters-tags');
      if (currentFilters.department || currentFilters.location) {
        tagsWrapper.classList.remove('hidden');
        tagsWrapper.innerHTML = `
          ${currentFilters.department ? `<span class="bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-full font-medium">ዘርፍ: ${currentFilters.department}</span>` : ''}
          ${currentFilters.location ? `<span class="bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-full font-medium">ቦታ: ${currentFilters.location}</span>` : ''}
        `;
      } else {
        tagsWrapper.classList.add('hidden');
      }

      fetchAndRenderJobs();
      closeDrawer();
    });

    // ፊልተር ማጽጃ
    resetFiltersBtn.addEventListener('click', () => {
      document.getElementById('filter-department').value = '';
      document.getElementById('filter-location').value = '';
      currentFilters.department = '';
      currentFilters.location = '';
      document.getElementById('active-filters-tags').classList.add('hidden');
      fetchAndRenderJobs();
      closeDrawer();
    });

    // ገጹ መጀመሪያ ሲከፈት መረጃዎችን በራስ-ሰር መጫን
    await fetchAndRenderJobs();
  }
};
