import { supabase } from '../../config/supabase.js';

export const adminJobsView = {
  /**
   * የአድሚን ስራ መለጠፊያ ፎርም HTML መዋቅር
   */
  render: async () => {
    return `
      <div class="admin-jobs-container p-4 pb-24 bg-gray-100 min-h-screen">
        <div class="flex items-center gap-3 mb-5">
          <button onclick="window.location.hash = '#home'" class="text-gray-600 p-1">
            👈 ወደ ዋናው ገጽ
          </button>
          <span class="text-sm font-bold text-gray-700">የአድሚን አስተዳደር ክፍል</span>
        </div>

        <h1 class="text-xl font-bold text-gray-800 mb-1">💼 አዲስ ስራ መለጠፊያ</h1>
        <p class="text-xs text-gray-500 mb-5">እዚህ የሚሞሉት ስራ በቀጥታ ለሚመለከታቸው ተጠቃሚዎች በቴሌግራም ቦት ማሳወቂያ ይልካል::</p>

        <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          
          <div>
            <label class="text-xs font-bold text-gray-500 block mb-1">የስራ መደብ (Job Title) *</label>
            <input type="text" id="adm-job-title" placeholder="उदा. Senior Accountant" 
              class="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500">
          </div>

          <div>
            <label class="text-xs font-bold text-gray-500 block mb-1">የድርጅት ስም (Company Name) *</label>
            <input type="text" id="adm-company-name" placeholder="उदा. Commercial Bank of Ethiopia" 
              class="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500">
          </div>

          <div>
            <label class="text-xs font-bold text-gray-500 block mb-1">የስራ ዘርፍ (Department) *</label>
            <select id="adm-department" class="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none">
              <option value="">ዘርፍ ይምረጡ...</option>
              <option value="IT">IT / ቴክኖሎጂ</option>
              <option value="Accounting">አካውንቲንግ / ፋይናንስ</option>
              <option value="Management">ማኔጅመንት</option>
              <option value="Law">ህግ</option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs font-bold text-gray-500 block mb-1">የስራ ቦታ (Location) *</label>
              <select id="adm-location" class="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none">
                <option value="Addis Ababa">አዲስ አበባ</option>
                <option value="Hawassa">ሀዋሳ</option>
                <option value="Bahir Dar">ባህር ዳር</option>
                <option value="Adama">አዳማ</option>
              </select>
            </div>
            <div>
              <label class="text-xs font-bold text-gray-500 block mb-1">የቅጥር ሁኔታ *</label>
              <select id="adm-employment-type" class="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none">
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Remote">Remote</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs font-bold text-gray-500 block mb-1">የትምህርት ደረጃ *</label>
              <select id="adm-education" class="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none">
                <option value="Degree">Degree</option>
                <option value="Masters">Masters</option>
                <option value="Diploma">Diploma</option>
              </select>
            </div>
            <div>
              <label class="text-xs font-bold text-gray-500 block mb-1">ማለቂያ ቀን (Deadline) *</label>
              <input type="date" id="adm-deadline" 
                class="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none">
            </div>
          </div>

          <div>
            <label class="text-xs font-bold text-gray-500 block mb-1">የስራው ዝርዝር መግለጫ (Description) *</label>
            <textarea id="adm-description" rows="4" placeholder="የስራውን ዝርዝር ኃላፊነቶች እዚህ ይፃፉ..." 
              class="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"></textarea>
          </div>

          <div>
            <label class="text-xs font-bold text-gray-500 block mb-1">መስፈርቶች (Requirements)</label>
            <textarea id="adm-requirements" rows="3" placeholder="የሚያስፈልጉ ክህሎቶችን እና ልምዶችን እዚህ ይፃፉ..." 
              class="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"></textarea>
          </div>

        </div>

        <div class="mt-6">
          <button id="publish-job-btn" class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 rounded-xl text-sm shadow-md transition-all">
            📢 ስራውን በይፋ ልጥፍ (Publish)
          </button>
        </div>
      </div>
    `;
  },

  /**
   * ፎርሙ ሰብሚት ሲደረግ ወደ Supabase የሚልከውን ክስተት መቆጣጠሪያ
   */
  afterRender: async () => {
    const publishBtn = document.getElementById('publish-job-btn');

    publishBtn.addEventListener('click', async () => {
      // መረጃዎችን ከፎርም መሰብሰብ
      const title = document.getElementById('adm-job-title').value.trim();
      const companyName = document.getElementById('adm-company-name').value.trim();
      const department = document.getElementById('adm-department').value;
      const location = document.getElementById('adm-location').value;
      const employmentType = document.getElementById('adm-employment-type').value;
      const educationLevel = document.getElementById('adm-education').value;
      const deadline = document.getElementById('adm-deadline').value;
      const description = document.getElementById('adm-description').value.trim();
      const requirements = document.getElementById('adm-requirements').value.trim();

      // አስገዳጅ መረጃዎችን መፈተሽ
      if (!title || !companyName || !department || !deadline || !description) {
        alert("⚠️ እባክዎ ኮከብ (*) የተደረገባቸውን አስገዳጅ ቦታዎች በሙሉ ይሙሉ!");
        return;
      }

      publishBtn.disabled = true;
      publishBtn.innerText = 'ስራው እየተለጠፈና ማሳወቂያዎች እየተዘጋጁ ነው...';

      try {
        // 🚀 ወደ Supabase `jobs` ሰንጠረዥ ዳታ ማስገባት
        const { error } = await supabase
          .from('jobs')
          .insert([
            {
              title,
              company_name: companyName,
              department,
              location,
              employment_type: employmentType,
              education_level: educationLevel,
              deadline: new Date(deadline).toISOString(),
              description,
              requirements,
              status: 'active',
              salary_visible: false
            }
          ]);

        if (error) throw error;

        // 🚨 አስደሳች ክስተት፡ እዚህ ጋር ዳታቤዙ ውስጥ Row ሲገባ፣ ቅድም ያስተካከልከው የ SQL Trigger በራስ-ሰር ተነስቶ 
        // የ SiraLink ዋና ኢንጂን (Edge Function) በመቀስቀስ ለሁሉም የዘርፉ ተጠቃሚዎች ቦት ላይ አውቶማቲክ መልዕክት ያደርሳል!

        alert("🎉 ስራው በስኬት ተለጥፏል! ለሚመለከታቸው ተጠቃሚዎች ማሳወቂያ በቦቱ በኩል በራስ-ሰር መላክ ጀምሯል።");
        
        // ፎርሙን ማጽዳት እና ወደ መነሻ ገጽ መመለስ
        window.location.hash = '#home';

      } catch (err) {
        console.error("ስራ ለመለጠፍ አልተቻለም:", err.message);
        alert("⚠️ ስራውን መለጠፍ አልተቻለም። እባክዎ እንደገና ይሞክሩ።");
        publishBtn.disabled = false;
        publishBtn.innerText = '📢 ስራውን በይፋ ልጥፍ (Publish)';
      }
    });
  }
};
