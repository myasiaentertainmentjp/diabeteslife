// Supabase Edge Function: HbA1c Reminder Email
// This function should be called by a cron job (e.g., daily at 9:00 AM JST)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing Supabase credentials')
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Get the date 30 days ago
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Find users who:
    // 1. Have hba1c_reminder enabled
    // 2. Have at least one HbA1c record
    // 3. Their last record is older than 30 days
    // 4. Haven't received a reminder in the last 30 days

    const { data: usersToRemind, error: queryError } = await supabase
      .rpc('get_users_for_hba1c_reminder', { days_threshold: 30 })

    if (queryError) {
      console.error('Error querying users:', queryError)
      // Fallback to manual query
      const { data: records, error: recordsError } = await supabase
        .from('hba1c_records')
        .select('user_id, created_at')
        .order('created_at', { ascending: false })

      if (recordsError) throw recordsError

      // Group by user and get the latest record
      const userLatestRecord = new Map<string, Date>()
      for (const record of records || []) {
        if (!userLatestRecord.has(record.user_id)) {
          userLatestRecord.set(record.user_id, new Date(record.created_at))
        }
      }

      // Filter users whose last record is older than 30 days
      const usersNeedingReminder: string[] = []
      for (const [userId, lastRecord] of userLatestRecord) {
        if (lastRecord < thirtyDaysAgo) {
          usersNeedingReminder.push(userId)
        }
      }

      // Get user details and check notification settings
      if (usersNeedingReminder.length > 0) {
        const { data: userDetails } = await supabase
          .from('users')
          .select('id, email, display_name')
          .in('id', usersNeedingReminder)

        const { data: notifSettings } = await supabase
          .from('notification_settings')
          .select('user_id, hba1c_reminder')
          .in('user_id', usersNeedingReminder)

        const notifMap = new Map(notifSettings?.map(n => [n.user_id, n.hba1c_reminder]) || [])

        for (const user of userDetails || []) {
          // Check if hba1c_reminder is enabled (default true if not set)
          const reminderEnabled = notifMap.get(user.id) ?? true
          if (reminderEnabled && user.email) {
            await sendReminderEmail(user.email, user.display_name || 'ユーザー')
          }
        }
      }
    } else if (usersToRemind && usersToRemind.length > 0) {
      for (const user of usersToRemind) {
        if (user.email) {
          await sendReminderEmail(user.email, user.display_name || 'ユーザー')
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Reminder emails sent' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function sendReminderEmail(email: string, displayName: string) {
  if (!RESEND_API_KEY) {
    console.log(`Would send reminder email to ${email} for ${displayName}`)
    return
  }

  const subject = '【Dライフ】HbA1cの記録、お忘れではないですか？'
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .button { display: inline-block; padding: 12px 24px; background-color: #f43f5e; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <p>${displayName}さん</p>
    <p>こんにちは、Dライフです。</p>
    <p>前回のHbA1c記録から1ヶ月が経ちました。<br>最近、検査は受けられましたか？</p>
    <p>定期的な記録は、ご自身の変化を知る大切な手がかりになります。<br>数値が良くても、そうでなくても、記録することに意味があります。</p>
    <p style="margin: 30px 0;">
      <a href="https://diabeteslife.jp/mypage/hba1c" class="button">HbA1cを記録する</a>
    </p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    <p style="color: #666;">
      「最近バタバタしてて...」<br>
      「正直、数値を見るのが怖い...」
    </p>
    <p style="color: #666;">
      そんな時もありますよね。<br>
      無理せず、ご自身のペースで続けていただければ大丈夫です。
    </p>
    <p>またサイトでお待ちしています。</p>
    <p>Dライフ運営チーム</p>
    <div class="footer">
      <p>※このメールは、HbA1c記録のリマインド設定がオンになっている方にお送りしています。</p>
      <p>配信停止は<a href="https://diabeteslife.jp/mypage/settings">こちら</a></p>
    </div>
  </div>
</body>
</html>
`

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Dライフ <noreply@diabeteslife.jp>',
      to: email,
      subject,
      html: htmlContent,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`Failed to send email to ${email}:`, errorText)
  } else {
    console.log(`Reminder email sent to ${email}`)
  }
}
