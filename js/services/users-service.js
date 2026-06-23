import { supabase } from '../config/supabase.js';

export const usersService = {
  /**
   * ተጠቃሚውን በቴሌግራም ID መሠረት ከዳታቤዝ መፈለግ
   * @param {number} telegramId 
   */
  async getUserByTelegramId(telegramId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('[Users Service] ተጠቃሚውን ማግኘት አልተቻለም:', err.message);
      return null;
    }
  },

  /**
   * የተጠቃሚውን ፕሮፋይል መረጃ ማዘመን
   * @param {string} userId - የሱፐቤዝ User ID
   * @param {Object} profileData - የሚዘምኑ መረጃዎች
   */
  async updateProfile(userId, profileData) {
    try {
      // የፕሮፋይል ማጠናቀቂያ ፐርሰንት ስሌት (Smart Completion Score)
      let score = 20; // መነሻ (ስም እና ቴሌግራም ID ስላለው)
      if (profileData.phone) score += 20;
      if (profileData.department) score += 20;
      if (profileData.education_level) score += 20;
      if (profileData.cv_url) score += 20;

      const { data, error } = await supabase
        .from('users')
        .update({
          full_name: profileData.full_name,
          phone: profileData.phone,
          department: profileData.department,
          education_level: profileData.education_level,
          experience_years: parseInt(profileData.experience_years) || 0,
          profile_completion: score,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      console.error('[Users Service] ፕሮፋይል ማዘመን አልተቻለም:', err.message);
      return { success: false, error: err.message };
    }
  }
};
