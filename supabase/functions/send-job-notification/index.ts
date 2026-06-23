// 1. የ Deno የውጭ ጥቅሎችን (Dependencies) ማስገባት
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// የ CORS አርዕስት (Headers) ለአስተማማኝ የዌብ ጥያቄዎች
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // የ CORS ቅድመ-ሙከራ (Preflight Request) መቆጣጠሪያ
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 2. ከ .env ላይ ሚስጥራዊ ቁልፎችን ማንበብ (Environment Variables)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')!
    const webAppUrl = Deno.env.get('WEBAPP_URL') || 'https://your-mini-app-domain.com'

    // ሰርቪስ ሮል ክላይንት መፍጠር (የአርኤልኤስ ጥበቃን አልፎ ሁሉንም ተጠቃሚ ለማንበብ)
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 3. ከ SQL Trigger የሚላከውን አዲስ የገባ የስራ ዳታ (Webhook Payload) መቀበል
    const payload = await req.json()
    const job = payload.record // አዲስ የተለጠፈው የስራ መስመር (Row)

    if (!job) {
      return new Response(JSON.stringify({ error: 'ምንም የስራ መረጃ አልተገኘም' }), { status: 400 })
    }

    // 4. ከተለጠፈው ስራ ጋር ተመሳሳይ የስራ ዘርፍ (Department) ያላቸውን ንቁ ተጠቃሚዎች መለየት
    const { data: matchingUsers, error: userError } = await supabase
      .from('users')
      .select('telegram_id, full_name')
      .eq('department', job.department)
      .not('telegram_id', 'is', null)

    if (userError) throw userError

    if (!matchingUsers || matchingUsers.length === 0) {
      return new Response(JSON.stringify({ message: 'ማሳወቂያ የሚላክለት ተጠቃሚ አልተገኘም' }), { status: 200 })
    }

    console.log(`[Edge Function] ${matchingUsers.length} ተጠቃሚዎች ከተዛማጅ ዘርፍ ተገኝተዋል። መልዕክት በመላክ ላይ...`);

    // 5. 🚀 ለእያንዳንዱ ተጠቃሚ የቴሌግራም መልዕክት በራስ-ሰር መላክ
    let successCount = 0
    for (const user of matchingUsers) {
      const messageText = `📢 *አዲስ ክፍት ስራ ተለጥፏል!* 📢\n\n` +
                          `💼 *የስራ መደብ:* ${job.title}\n` +
                          `🏢 *ድርጅት:* ${job.company_name}\n` +
                          `📍 *ቦታ:* ${job.location}\n` +
                          `⏳ *ማለቂያ ቀን:* ${new Date(job.deadline).toLocaleDateString('am-ET')}\n\n` +
                          `💡 ይህ ስራ የእርስዎን ዘርፍ (*${job.department}*) ስለሚመስል ተመርጦልዎታል። ዝርዝሩን አይተው ለማመልከት ከታች ያለውን ቁልፍ ይጫኑ።`

      const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`

      // ወደ ቴሌግራም ኤፒአይ ጥያቄ መላክ
      const response = await fetch(telegramUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: user.telegram_id,
          text: messageText,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                { text: '📱 ስራውን በ Mini App እይ', web_app: { url: `${webAppUrl}/#job-detail/${job.id}` } }
              ]
            ]
          }
        })
      })

      if (response.ok) successCount++
    }

    return new Response(JSON.stringify({ 
      success: true, 
      matched_users: matchingUsers.length, 
      sent_successfully: successCount 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error: any) {
    console.error('[Edge Function Error]:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})
