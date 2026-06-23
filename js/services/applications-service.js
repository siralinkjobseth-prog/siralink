import { supabase } from '../config/supabase.js';

export const applicationsService = {
  /**
   * ተጠቃሚው ለዚህ ስራ አስቀድሞ ማመልከቱን ማረጋገጥ
   * @param {string} jobId - የስራው ID
   * @param {string} userId - የተጠቃሚው ID
   */
  async checkHasApplied(jobId, userId) {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('status')
        .eq('job_id', jobId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data ? { hasApplied: true, status: data.status } : { hasApplied: false, status: null };
    } catch (err) {
      console.error('[Applications Service] የማመልከቻ ሁኔታን ማረጋገጥ አልተቻለም:', err.message);
      return { hasApplied: false, status: null };
    }
  },

  /**
   * አዲስ የስራ ማመልከቻ ማስገባት (Apply for a job)
   * @param {string} jobId - የስራው ID
   * @param {string} userId - የተጠቃሚው ID
   * @param {string} cvUrl - የተጠቃሚው የሲቪ ፋይል ሊንክ
   */
  async submitApplication(jobId, userId, cvUrl) {
    try {
      // 1. ወደ applications ሰንጠረዥ አዲስ ሮው ማስገባት
      const { data, error } = await supabase
        .from('applications')
        .insert([
          {
            job_id: jobId,
            user_id: userId,
            cv_url: cvUrl,
            status: 'applied'
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // 2. በስኬት ከተላከ የስራውን Application Count በ 1 ማሳደግ (RPC)
      await supabase.rpc('increment_application_count', { job_id: jobId }).catch((rpcErr) => {
        console.warn('[Applications Service] የስራ ማመልከቻ ቆጣሪውን ማሳደግ አልተቻለም:', rpcErr.message);
      });

      return { success: true, data };
    } catch (err) {
      console.error('[Applications Service] ማመልከቻ ማስገባት አልተቻለም:', err.message);
      return { success: false, error: err.message };
    }
  },

  /**
   * አንድ ተጠቃሚ ያመለከተባቸውን ሁሉንም ስራዎች ዝርዝር ማምጣት
   * @param {string} userId - የተጠቃሚው ID
   */
  async getUserApplications(userId) {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          id,
          status,
          created_at,
          jobs (
            id,
            title,
            company_name,
            location,
            employment_type
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('[Applications Service] የተጠቃሚውን ማመልከቻዎች ማምጣት አልተቻለም:', err.message);
      return [];
    }
  }
};
