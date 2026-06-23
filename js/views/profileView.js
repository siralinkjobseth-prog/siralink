import { usersService } from '../services/users-service.js';
import { storageService } from '../services/storage-service.js';

export const profileView = {
  /**
   * የገጹን HTML መዋቅር መፍጠሪያ
   */
  render: async () => {
    // 1. የገባውን ተጠቃሚ መረጃ ከ LocalStorage ማውጣት
    const cachedUser = localStorage.getItem('siralink_user');
    const user = cachedUser ? JSON.parse(cachedUser) : null;

    if (!user) {
      return `
        <div class="p-6 text-center text-red-500 bg-red-50 rounded-2xl m-4 border border-red-100">
          <p class="font-bold">⚠️ ፈቃድ አልተሰጠውም</p>
          <p class="text-xs mt-1">እባክዎ መተግበሪያውን ለመጠቀም መጀመሪያ የቴሌግራም ቦቱን ይክፈቱ።</p>
        </div>
      `;
    }

    return `
      <div class="profile-container p-4 pb-24 bg-gray-50 min-h-screen">
        <h1 class="text-xl font-bold text-gray-800 mb-1">የእርስዎ ፕሮፋይል</h1>
        <p class="text-xs text-gray-500 mb-5">በ AI የሚመጥኑ ስራዎችን በፍጥነት ለማግኘት መረጃዎን ሙሉ ያድርጉ።</p>

        <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          
          <div>
            <label class="text-xs font-bold text-gray-500 block mb-1"> can ሙሉ ስም *</label>
            <input type="text" id="prof-full-name" value="${user.full_name || ''}" 
              class="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 font-medium">
          </div>

          <div>
            <label class="text-xs font-bold text-gray-500 block mb-1">ስልክ ቁጥር</label>
            <input type="tel" id="prof-phone" value="${user.phone || ''}" placeholder="+2519..."
              class="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500">
          </div>

          <div>
            <label class="text-xs font-bold text-gray-500 block mb-1">የስራ / የትምህርት ዘርፍ</label>
            <select id="prof-department" class="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none font-medium">
              <option value="" ${!user.department ? 'selected' : ''}>ይምረጡ...</option>
              <option value="IT" ${user.department === 'IT' ? 'selected' : ''}>IT / ቴክኖሎጂ</option>
              <option value="Accounting" ${user.department === 'Accounting' ? 'selected' : ''}>አካውንቲንግ / ፋይናንስ</option>
              <option value="Management" ${user.department === 'Management' ? 'selected' : ''}>ማኔጅመንት</option>
              <option value="Law" ${user.department === 'Law' ? 'selected' : ''}>ህግ</option>
            </select>
          </div>

          <div>
            <label class="text-xs font-bold text-gray-500 block mb-1">የትምህርት ደረጃ</label>
            <select id="prof-education" class="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none font-medium">
              <option value="" ${!user.education_level ? 'selected' : ''}>ይምረጡ...</option>
              <option value="Degree" ${user.education_level === 'Degree' ? 'selected' : ''}>በመጀመሪያ ዲግሪ (BSc/BA)</option>
              <option value="Masters" ${user.education_level === 'Masters' ? 'selected' : ''}>ማስተርስ (MSc/MA)</option>
              <option value="Diploma" ${user.education_level === 'Diploma' ? 'selected' : ''}>ዲፕሎማ</option>
            </select>
          </div>

          <div>
            <label class="text-xs font-bold text-gray-500 block mb-1">የስራ ልምድ (በዓመት)</label>
            <input type="number" id="prof-experience" value="${user.experience_years || 0}" min="0"
              class="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 font-medium">
          </div>

          <div class="border-2 border-dashed border-gray-200 p-4 rounded-xl text-center bg-gray-50 transition-all" id="cv-upload-zone">
            <label class="cursor-pointer block">
              <span class="text-2xl block mb-1">📄</span>
              <span class="text-xs font-bold text-blue-600 block mb-0.5" id="cv-upload-label">የሲቪ ፋይልዎን ይጫኑ</span>
              <span class="text-[10px] text-gray-400 block">PDF ብቻ (ከ 5MB ያልበለጠ)</span>
              <input type="file" id="cv-file-input" accept=".pdf" class="hidden">
            </label>
            ${user.cv_url ? `
              <div class="mt-2 text-[11px] bg-blue-50 text-blue-700 py-1.5 px-3 rounded-lg inline-flex items-center gap-1 font-semibold">
                📎 <a href="${user.cv_url}" target="_blank" class="underline">የአሁኑ ሲቪዎ (ያዩት)</a>
              </div>
            ` : ''}
            <div id="cv-file-status" class="text-xs font-bold text-green-600 mt-2 hidden"></div>
          </div>

        </div>

        <div class="mt-6">
          <button id="save-profile-btn" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-sm shadow-md transition-all active:scale-[0.99]">
            💾 መረጃዬን አስቀምጥ
          </button>
        </div>
      </div>
    `;
  },

  /**
   * ሰርቪሶቹን በመጥራት ዳታቤዝ የማዘመን ሂደት
   */
  afterRender: async () => {
    const saveBtn = document.getElementById('save-profile-btn');
    const fileInput = document.getElementById('cv-file-input');
    const fileStatus = document.getElementById('cv-file-status');
    const uploadZone = document.getElementById('cv-upload-zone');
    
    let selectedFile = null;

    // 1. ተጠቃሚው ፋይል ሲመርጥ በስክሪን ላይ ማሳያ ውበት መስጠት
    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        selectedFile = e.target.files[0];
        fileStatus.innerText = `✓ የተመረጠ ፋይል፦ ${selectedFile.name.length > 25 ? selectedFile.name.substring(0, 22) + '...' : selectedFile.name}`;
        fileStatus.classList.remove('hidden');
        uploadZone.classList.add('border-blue-300', 'bg-blue-50/30');
      }
    });

    // 2. ሴቭ ቁልፍ ሲጫን የሚሰራው ዋና ሂደት
    saveBtn.addEventListener('click', async () => {
      const cachedUser = JSON.parse(localStorage.getItem('siralink_user'));
      const fullName = document.getElementById('prof-full-name').value.trim();
      const phone = document.getElementById('prof-phone').value.trim();
      const department = document.getElementById('prof-department').value;
      const education = document.getElementById('prof-education').value;
      const experience = document.getElementById('prof-experience').value;

      if (!fullName) {
        alert("⚠️ እባክዎ ሙሉ ስምዎን ያስገቡ!");
        return;
      }

      saveBtn.disabled = true;
      saveBtn.innerText = 'መረጃዎ እየተቀመጠ ነው...';

      try {
        let cvUrl = cachedUser.cv_url || null;

        // ሀ. 📂 ፋይል ተመርጦ ከሆነ በአዲሱ Storage ሰርቪስ በኩል መጫን
        if (selectedFile) {
          saveBtn.innerText = 'ሲቪ ፋይልዎ እየተጫነ ነው...';
          const uploadResult = await storageService.uploadCV(cachedUser.id, selectedFile);
          
          if (!uploadResult.success) {
            throw new Error(uploadResult.error);
          }
          cvUrl = uploadResult.cvUrl;
        }

        // ለ. 📝 የተጠቃሚውን መረጃ በአዲሱ Users ሰrቪስ በኩል ዳታቤዝ ላይ ማዘመን
        saveBtn.innerText = 'ዳታቤዝ እየዘመነ ነው...';
        const updateResult = await usersService.updateProfile(cachedUser.id, {
          full_name: fullName,
          phone: phone,
          department: department,
          education_level: education,
          experience_years: experience,
          cv_url: cvUrl
        });

        if (!updateResult.success) {
          throw new Error(updateResult.error);
        }

        // ሐ. አዲሱን ዳታ በ LocalStorage መሸጎጫ (Cache) ላይ መተካት
        localStorage.setItem('siralink_user', JSON.stringify(updateResult.data));

        alert("🎉 ፕሮፋይልዎ በስኬት ዘምኗል!");
        window.location.hash = '#home'; // ወደ ዳሽቦርድ መመለስ

      } catch (err) {
        console.error('[Profile View Error]:', err.message);
        alert(`⚠️ ስህተት፡ ${err.message}`);
      } finally {
        saveBtn.disabled = false;
        saveBtn.innerText = '💾 መረጃዬን አስቀምጥ';
      }
    });
  }
};
