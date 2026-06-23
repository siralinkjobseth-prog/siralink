// በ አሳሽ (Browser) ውስጥ የ Supabase CDN ጥቅል አስቀድሞ መጫኑን ያረጋግጣል
const supabaseUrl = window.process?.env?.SUPABASE_URL || 'https://YOUR_SUPABASE_PROJECT_URL.supabase.co';
const supabaseAnonKey = window.process?.env?.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

if (!supabaseUrl || supabaseUrl.includes('YOUR_SUPABASE')) {
  console.warn("⚠️ ማሳሰቢያ: የ Supabase ኮንፊገሬሽን አልተሞላም። እባክዎ ትክክለኛውን URL እና Anon Key ይተኩ።");
}

// የ Supabase Client መፍጠር
export const supabase = window.supabase 
  ? window.supabase.createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (!supabase) {
  console.error("🚨 የ Supabase SDK በ index.html ውስጥ አልተጫነም ወይም አልተገኘም!");
}
