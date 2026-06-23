import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  try {
    const { record } = await req.json(); // አዲስ የተለጠፈው የስራ መረጃ

    // 1. ከስራው ዘርፍ (Department) ጋር የሚዛመዱ እና ማሳወቂያ የሚፈልጉ ተጠቃሚዎችን መፈለግ
    const { data: users, error } = await supabase
      .from('users')
      .select('telegram_id')
      .eq('department', record.department)
      .eq('is_active', true);

    if (error) throw error;

    if (!users || users.length === 0) {
      return new Response(JSON.stringify({ message: "ምንም የሚዛመድ ተጠቃሚ አልተገኘም" }), { status: 200 });
    }

    // 2. የተዘጋጀው የቴሌግራም መልዕክት ፎርማት
    const messageText = `📢 *አዲስ የስራ ማስታወቂያ የወጣ!*\n\n` +
                        `💼 *የስራ መደብ:* ${record.title}\n` +
                        `🏢 *ድርጅት:* ${record.company_name || 'የግል'}\n` +
                        `📍 *ቦታ:* ${record.location}\n` +
                        `🎓 *የትምህርት ደረጃ:* ${record.education_level}\n\n` +
                        `🔗 አሁኑኑ ለማመልከት አፑን ይክፈቱ!`;

    // 3. መልዕክቱን ወደ ቴሌግራም API መላክ (ለሙከራ ያህል ቀጥታ፣ ለ Production በ Queue ይላካል)
    for (const user of users) {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: user.telegram_id,
          text: messageText,
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [[
              { text: "🚀 አፕሊኬሽኑን ክፈት", url: `https://t.me/SiraLink_bot/app` }
            ]]
          }
        }),
      });
    }

    return new Response(JSON.stringify({ success: true, notified_users: users.length }), { status: 200 });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
