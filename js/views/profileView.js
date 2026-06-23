import { supabase } from '../config/supabase.js';

export const profileView = {
  /**
   * የገጹን HTML መዋቅር መፍጠሪያ
   */
  render: async () => {
    // 1. የገባውን ተጠቃሚ መረጃ ከ LocalStorage ማውጣት
    const cachedUser = localStorage.getItem('siralink_user');
    const user = cachedUser ? JSON.parse(cachedUser) : null;

    if (!user) {
      return `<div class="p-4 text-center text-red-500">⚠️ እባክዎ መጀመሪያ ቦቱን በመጠቀም ይመዝገቡ!</div>`;
    }

    return `
      <div class="profile-container p-4 pb-24 bg-gray-50 min-h-screen">
        <h1 class="text-xl font-bold text-gray-800 mb-1">የእርስዎ ፕሮፋይል</h1>
        <p class="text-xs text-gray-500 mb-5">በ AI የሚመጥኑ ስራዎችን በፍጥነት ለማግኘት መረጃዎን ሙሉ ያድርጉ።</p>

        <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          
          <div>
            <label class="text-xs font-bold text-gray-500 block mb-1">ሙሉ ስም</label>
            <input type="text" id="prof-full-name" value="${user.full_name || ''}" 
              class="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500">
          </div>

          <div>
            <label class="text-xs font-bold text-gray-500 block mb-1">ስልክ ቁጥር</label>
            <input type="tel" id="prof-phone" value="${user.phone || ''}" placeholder="+2519..."
              class="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500">
          </div>

          <div>
            <label class="text-xs font-bold text-gray-500 block mb-1">የስራ / የትምህርት ዘርፍ</label>
            <select id="prof-department" class="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none">
              <option value="" ${!user.department ? 'selected' : ''}>ይምረጡ...</option>
              <option value="IT" ${user.department === 'IT' ? 'selected' : ''}>IT / ቴክኖሎጂ</option>
              <option value="Accounting" ${user.department === 'Accounting' ? 'selected' : ''}>አካውንቲንግ / ፋይናንስ</option>
              <option value="Management" ${user.department === 'Management' ? 'selected' : ''}>ማኔጅመንት</option>
              <option value="Law" ${user.department === 'Law' ? 'selected' : ''}>ህግ</option>
            </select>
          </div>

          <div>
            <label class="text-xs font-bold text-gray-500 block mb-1">የትምህርት ደረጃ</label>
            <select id="prof-education" class="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none">
              <option value="" ${!user.education_level ? 'selected' : ''}>ይምረጡ...</option>
              <option value="Degree" ${user.education_level === 'Degree' ? 'selected' : ''}>በመጀመሪያ ዲግሪ (BSc/BA)</option>
              <option value="Masters" ${user.education_level === 'Masters' ? 'selected' : ''}>ማስተርስ (MSc/MA)</option>
              <option value="Diploma" ${user.education_level === 'Diploma' ? 'selected' : ''}>ዲፕሎማ</option>
            </select>
          </div>

          <div>
            <label class="text-xs font-bold text-gray-500 block mb-1">የስራ ልምድ (በዓመት)</label>
            <input type="number" id="prof-experience" value="${user.experience_years || 0}" min="0"
              class="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500">
          </div>

          <div class="border-2 border-dashed border-gray-200 p-4 rounded-xl text-center bg-gray-50" id="cv-upload-zone">
            <label class="cursor-pointer block">
              <span class="text-2xl block mb-1">📄</span>
              <span class="text-xs font-bold text-blue-600 block mb-0.5">የሲቪ ፋይልዎን ይጫኑ</span>
              <span class="text-[10px] text-gray-400 block">PDF ብቻ (ከ 5MB ያልበለጠ)</span>
              <input type="file" id="cv-file-input" accept=".pdf" class="hidden">
            </label>
            <div id="cv-file-status" class="text-xs font-semibold text-green-600 mt-2 hidden">✓ ፋይል ተመርጧል</div>
          </div>

        </div>

        <div class="mt-6">
          <button id="save-profile-btn" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-sm shadow-md transition-colors">
            💾 መረጃዬን አስቀምጥ
          </button>
        </div>
      </div>
    `;
  },

  /**
   * የፋይል አፕሎድ እና የዳታ ሴቭ ክስተቶችን (Events) መቆጣጠሪያ
   */
  afterRender: async () => {
    const saveBtn = document.getElementById('save-profile-btn');
    const fileInput = document.getElementById('cv-file-input');
    const fileStatus = document.getElementById('cv-file-status');
    
    let selectedFile = null;

    // 1. ፋይል ሲመረጥ በስክሪን ላይ ማሳያ
    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        selectedFile = e.target.files[0];
        fileStatus.innerText = `✓ የተመረጠ ፋይል፡ ${selectedFile.name}`;
        fileStatus.classList.remove('hidden');
      }
    });

    // 2. ሴቭ ቁልፍ ሲጫን ዳታቤዝ የማዘመን ሂደት
    saveBtn.addEventListener('click', async () => {
      saveBtn.disabled = true;
      saveBtn.innerText = 'እየተቀመጠ ነው...';

      try {
        const cachedUser = JSON.parse(localStorage.getItem('siralink_user'));
        
        const fullName = document.getElementById('prof-full-name').value.trim();
        const phone = document.getElementById('prof-phone').value.trim();
        const department = document.getElementById('prof-department').value;
        const education = document.getElementById('prof-education').value;
        const experience = parseInt(document.getElementById('prof-experience').value) || 0;

        if (!fullName) {
          alert("እባክዎ ሙሉ ስምዎን ያስገቡ!");
          saveBtn.disabled = false;
          saveBtn.innerText = '💾 መረጃዬን አስቀምጥ';
          return;
        }

        let cvUrl = cachedUser.cv_url || null;

        // ሀ. 📂 ፋይል ተመርጦ ከሆነ መጀመሪያ ወደ Supabase Storage መጫን (Upload)
        if (selectedFile) {
          const fileExt = selectedFile.name.split('.').pop();
          const fileName = `${cachedUser.id}_cv.${fileExt}`;
          const filePath = `cvs/${fileName}`;

          // በ Supabase Storage 'siralink_bucket' ውስጥ ፋይሉን ማስቀመጥ
          const { error: uploadError } = await supabase.storage
            .from('siralink_bucket')
            .upload(filePath, selectedFile, { upsert: true });

          if (uploadError) throw uploadError;

          // የፋይሉን Public ሊንክ ማውጣት
          const { data: publicUrlData } = supabase.storage
            .from('siralink_bucket')
            .getPublicUrl(filePath);
          
          cvUrl = publicUrlData.publicUrl;
        }

        // ለ. 🧮 የፕሮፋይል ማጠናቀቂያ ፐርሰንት ስሌት (Profile Completion Logic)
        let score = 20; // ስምና ቴሌግራም ID ስላለው መነሻ 20%
        if (phone) score += 20;
        if (department) score += 20;
        if (education) score += 20;
        if (cvUrl) score += 20; // ሁሉም ከተሟላ 100% ይሆናል

        // ሐ. መረጃዎቹን ወደ `users` ሰንጠረዥ ማዘመን (Update)
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({
            full_name: fullName,
            phone: phone,
            department: department,
            education_level: education,
            experience_years: experience,
            profile_completion: score,
            updated_at: new Date().toISOString()
          })
          .eq('id', cachedUser.id)
          .select()
          .single();

        if (updateError) throw updateError;

        // መሸጎጫውን (LocalStorage Cache) በአዲሱ ዳታ መቀየር
        localStorage.setItem('siralink_user', JSON.stringify(updatedUser));

        alert("🎉 ፕሮፋይልዎ በስኬት ዘምኗል!");
        window.location.hash = '#home'; // ወደ ዳሽቦርድ መመለስ

      } catch (err) {
        console.error("ፕሮፋይል ማዘመን አልተቻለም:", err.message);
        alert("⚠️ መረጃውን ማስቀመጥ አልተቻለም። እባክዎ እንደገና ይሞክሩ።");
      } finally {
        saveBtn.disabled = false;
        saveBtn.innerText = '💾 መረጃዬን አስቀምጥ';
      }
    });
  }
};
