import { supabase } from '../config/supabase.js';

export const jobsService = {
  /**
   * ንቁ የሆኑ ስራዎችን በተለያዩ ማጣሪያዎች (Search, Department, Location) አምጥቶ መመለስ
   * @param {Object} filters - የፍለጋ እና የማጣሪያ መረጃዎች
   */
  async getActiveJobs(filters = {}) {
    try {
      let query = supabase
        .from('jobs')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      // 1. በስራ ዘርፍ ማጣራት (Department Filter)
      if (filters.department) {
        query = query.eq('department', filters.department);
      }

      // 2. በስራ ቦታ ማጣራት (Location Filter)
      if (filters.location) {
        query = query.eq('location', filters.location);
      }

      // 3. በቁልፍ ቃል ፍለጋ (Search Filter - Title or Company Name)
      if (filters.search) {
        query = query.ilike('title', `%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('[Jobs Service] ስራዎችን ማምጣት አልተቻለም:', err.message);
      return [];
    }
  },

  /**
   * የአንድን የተወሰነ ስራ ሙሉ ዝርዝር መረጃ ማምጣት
   * @param {string} jobId - የስራው መለያ ID
   */
  async getJobById(jobId) {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error(`[Jobs Service] የስራ መረጃውን (ID: ${jobId}) ማምጣት አልተቻለም:`, err.message);
      return null;
    }
  },

  /**
   * የስራውን የእይታ ብዛት በ1 ማሳደግ (Analytics)
   * @param {string} jobId - የስራው መለያ ID
   */
  async incrementJobViews(jobId) {
    try {
      await supabase.rpc('increment_job_views', { job_id: jobId });
    } catch (err) {
      console.error('[Jobs Service] የእይታ ቁጥር ማሳደግ አልተቻለም:', err.message);
    }
  }
};
