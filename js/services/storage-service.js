import { supabase } from '../config/supabase.js';

export const storageService = {
  // በ Supabase የተፈጠረው የፋይል ማስቀመጫ ባልዲ ስም
  BUCKET_NAME: 'siralink_bucket',

  /**
   * የተጠቃሚን የሲቪ ፒዲኤፍ ፋይል ወደ Supabase Storage መጫን
   * @param {string} userId - የተጠቃሚው ልዩ መለያ ID
   * @param {File} file - ከ input[type="file"] የተገኘ የፋይል አካል
   */
  async uploadCV(userId, file) {
    try {
      // 1. የፋይል አይነት ቼክ ማድረግ (PDF ብቻ መሆኑን ማረጋገጥ)
      if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
        throw new Error('እባክዎ PDF ፋይል ብቻ ይጫኑ።');
      }

      // 2. የፋይል መጠን ቼክ ማድረግ (ከ 5MB በላይ ከሆነ ማስቆም)
      const maxBytes = 5 * 1024 * 1024; // 5 Megabytes
      if (file.size > maxBytes) {
        throw new Error('የፋይሉ መጠን ከ 5MB መብለጥ የለበትም።');
      }

      // 3. የፋይል ስም አወቃቀር (ለምሳሌ፦ cvs/user_123_cv.pdf)
      const fileExt = 'pdf';
      const fileName = `${userId}_cv.${fileExt}`;
      const filePath = `cvs/${fileName}`;

      // 4. ወደ Supabase Storage መጫን (upsert: true ማለት ፋይሉ ካለ በላዩ ላይ ይተካዋል)
      const { data, error: uploadError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // 5. የተጫነውን ፋይል በይፋ የሚያሳይ የህዝብ ሊንክ (Public URL) ማውጣት
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);

      if (!urlData || !urlData.publicUrl) {
        throw new Error('የፋይሉን ሊንክ ማመንጨት አልተቻለም።');
      }

      return { success: true, cvUrl: urlData.publicUrl };

    } catch (err) {
      console.error('[Storage Service] ፋይል መጫን አልተቻለም:', err.message);
      return { success: false, error: err.message };
    }
  },

  /**
   * አንድ ተጠቃሚ ከዚህ ቀደም የጫነውን ሲቪ ከ Storage ላይ ማጥፋት (ከተፈለገ)
   * @param {string} userId - የተጠቃሚው ልዩ መለያ ID
   */
  async deleteCV(userId) {
    try {
      const filePath = `cvs/${userId}_cv.pdf`;
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath]);

      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error('[Storage Service] ፋይል ማጥፋት አልተቻለም:', err.message);
      return { success: false, error: err.message };
    }
  }
};
