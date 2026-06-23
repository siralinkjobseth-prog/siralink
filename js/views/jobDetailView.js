import { supabase } from '../config/supabase.js';

export const jobDetailView = {
  /**
   * የገጹን መሠረታዊ HTML መዋቅር መፍጠሪያ
   */
  render: async (jobId) => {
    if (!jobId) {
      return `<div class="p-4 text-center text-red-500">⚠️ የስራ መታወቂያ አልተገኘም።</div>`;
    }

    // 1. የገባውን ተጠቃሚ መረጃ ከ LocalStorage ማውጣት
    const cachedUser = localStorage.getItem('siralink_user');
    const user = cachedUser ? JSON.parse(cachedUser) : null;

    try {
      // 2. የስራውን ሙሉ መረጃ ከ Supabase ማምጣት
      const { data: job, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (error || !job) throw new Error("ስራው አልተገኘም");

      // 3. ተጠቃሚው ለዚህ ስራ አስቀድሞ ማመልከቱን ማረጋገጥ
      let hasApplied = false;
      let applicationStatus = '';
      if (user) {
        const { data: app } = await supabase
          .from('applications')
          .select('status')
          .eq('job_id', jobId)
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (app) {
          hasApplied = true;
          applicationStatus = app.status;
        }
      }

      // የስራው ማለቂያ ቀን (Deadline) ፎርማት ማስተካከል
      const deadlineDate = new Date(job.deadline).toLocaleDateString('am-ET', {
        year: 'numeric', month: 'long', day: 'numeric'
      });

      // ገጹ ሲከፈት የዕይታ ቁጥር (Job Views) በ1 ማሳደግ (Analytics)
      await supabase.rpc('increment_job_views', { job_id: jobId }).catch(() => {});

      return `
        <div class="job-detail-container p-4 pb-24 bg-gray-50 min-h-screen">
          <div class="flex items-center gap-3 mb-5">
            <button onclick="window.location.hash = '#jobs'" class="text-gray-600 p-1">
              👈 ወደ ኋላ
            </button>
            <span class="text-sm font-bold text-gray-700">የስራ ዝርዝር መግለጫ</span>
          </div>

          <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 text-center mb-5">
            <div class="w-16 h-16 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center overflow-hidden mx-auto mb-3">
              <img src="${job.company_logo || 'assets/images/companies/default-company.png'}" alt="Logo" class="w-full h-full object-cover">
            </div>
            <h1 class="text-lg font-bold text-gray-800 mb-1">${job.title}</h1>
            <p class="text-sm text-blue-600 font-semibold mb-3">${job.company_name || 'የግል ድርጅት'}</p>
            
            <div class="flex justify-center gap-2 text-xs font-medium text-gray-500">
              <span class="bg-gray-100 px-2.5 py-1 rounded-full">📍 ${job.location}</span>
              <span class="bg-gray-100 px-2.5 py-1 rounded-full">💼 ${job.employment_type}</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3 mb-5">
            <div class="bg-white p-3 rounded-xl border border-gray-100">
              <span class="text-[10px] text-gray-400 font-bold uppercase block mb-0.5">የስራ ማለቂያ</span>
              <span class="text-xs font-bold text-red-600">${deadlineDate}</span>
            </div>
            <div class="bg-white p-3 rounded-xl border border-gray-100">
              <span class="text-[10px] text-gray-400 font-bold uppercase block mb-0.5">ደመወዝ</span>
              <span class="text-xs font-bold text-green-600">${job.salary_visible && job.salary_min ? `${job.salary_min} ETB` : 'በስምምነት'}</span>
            </div>
          </div>

          <div class="space-y-5 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div>
              <h3 class="text-sm font-bold text-gray-800 border-b pb-1.5 mb-2">📄 የስራው መግለጫ (Description)</h3>
              <p class="text-xs text-gray-600 leading-relaxed whitespace-pre-line">${job.description}</p>
            </div>

            ${job.requirements ? `
            <div>
              <h3 class="text-sm font-bold text-gray-800 border-b pb-1.5 mb-2">🎯 መስፈርቶች (Requirements)</h3>
              <p class="text-xs text-gray-600 leading-relaxed whitespace-pre-line">${job.requirements}</p>
            </div>
            ` : ''}

            ${job.benefits ? `
            <div>
              <h3 class="text-sm font-bold text-gray-800 border-b pb-1.5 mb-2">🎁 ጥቅማጥቅሞች (Benefits)</h3>
              <p class="text-xs text-gray-600 leading-relaxed whitespace-pre-line">${job.benefits}</p>
            </div>
            ` : ''}
          </div>

          <div class="fixed bottom-0 inset-x-0 bg-white p-4 border-t border-gray-100 shadow-xl flex gap-3 z-40">
            <button id="save-job-btn" class="border border-gray-200 p-3 rounded-xl flex items-center justify-center bg-gray-50">
              ❤️
            </button>
            
            ${hasApplied ? `
              <button class="flex-1 bg-green-100 text-green-700 font-bold py-3 rounded-xl text-sm shadow-sm cursor-default" disabled>
                ✓ አመልክተዋል (${applicationStatus})
              </button>
            ` : `
              <button id="apply-now-btn" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-sm shadow-md shadow-blue-100 transition-colors">
                🚀 አሁን አመልክት
              </button>
            `}
          </div>
        </div>
      `;

    } catch (err) {
      return `<div class="p-4 text-center text-red-500">⚠️ ስህተት፡ ${err.message}</div>`;
    }
  },

  /**
   * አፕሊኬሽን ሰብሚት የሚደረግበትን ክስተት (Click Event) መቆጣጠሪያ
   */
  afterRender: async (jobId) => {
    const applyBtn = document.getElementById('apply-now-btn');
    if (!applyBtn) return; // አስቀድሞ ካመለከተ ቁልፉ ስለማይኖር

    applyBtn.addEventListener('click', async () => {
      applyBtn.disabled = true;
      applyBtn.innerText = 'እየተላከ ነው...';

      try {
        const cachedUser = localStorage.getItem('siralink_user');
        if (!cachedUser) {
          alert("እባክዎ መጀመሪያ ቦቱን ተጠቅመው ይመዝገቡ!");
          window.location.hash = '#home';
          return;
        }
        const user = JSON.parse(cachedUser);

        // 1. ከተጠቃሚው ሰንጠረዥ ላይ ሲቪ መኖሩን ማረጋገጥ
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('id', user.id)
          .single();

        // 💡 ማሳሰቢያ፡ በምርት ደረጃ ከተጠቃሚ ሰነዶች (user_documents) የ CV ሊንክ ይወሰዳል
        // ለጊዜው የሙከራ ሊንክ እንሰጠዋለን
        const userCvUrl = "https://supabase.storage/siralink/cvs/sample.pdf";

        // 2. ወደ applications ሰንጠረዥ አዲስ ማመልከቻ ማስገባት
        const { error: appError } = await supabase
          .from('applications')
          .insert([
            {
              job_id: jobId,
              user_id: user.id,
              cv_url: userCvUrl,
              status: 'applied'
            }
          ]);

        if (appError) throw appError;

        // 3. በስኬት ከተላከ የ ስራውን Application Count በ 1 ማሳደግ
        await supabase.rpc('increment_application_count', { job_id: jobId }).catch(() => {});

        alert("🎉 ማመልከቻዎ በስኬት ለቀጣሪው ተልኳል!");
        window.location.reload(); // ገጹን አድሶ የ "አመልክተዋል" ሁኔታን ለማሳየት

      } catch (err) {
        console.error("ማመልከት አልተቻለም:", err.message);
        alert("⚠️ ማመልከቻውን መላክ አልተቻለም። እባክዎ እንደገና ይሞክሩ።");
        applyBtn.disabled = false;
        applyBtn.innerText = '🚀 አሁን አመልክት';
      }
    });
  }
};
