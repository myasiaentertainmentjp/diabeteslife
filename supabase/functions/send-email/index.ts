import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SITE_URL = Deno.env.get('SITE_URL') || 'https://d-life.example.com'
const FROM_EMAIL = 'onboarding@resend.dev'

interface EmailRequest {
  type: 'welcome' | 'comment-notification'
  to: string
  data: Record<string, string>
}

// Email templates
function getEmailTemplate(type: string, data: Record<string, string>): { subject: string; html: string } {
  const baseStyles = `
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #2563eb; margin-bottom: 20px; }
      .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
      .logo-sub { font-size: 12px; color: #6b7280; }
      .content { padding: 20px 0; }
      .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white !important; text-decoration: none; border-radius: 8px; font-weight: 500; }
      .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #6b7280; }
      .quote { background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0; }
    </style>
  `

  const header = `
    <div class="header">
      <div class="logo">Dライフ</div>
      <div class="logo-sub">ディーライフ - 糖尿病コミュニティ</div>
    </div>
  `

  const footer = `
    <div class="footer">
      <p>このメールは <a href="${SITE_URL}">Dライフ</a> から送信されました。</p>
      <p>配信停止をご希望の場合は、マイページの通知設定から変更できます。</p>
      <p>&copy; ${new Date().getFullYear()} Dライフ</p>
    </div>
  `

  switch (type) {
    case 'welcome':
      return {
        subject: 'Dライフへようこそ！',
        html: `
          <!DOCTYPE html>
          <html>
          <head>${baseStyles}</head>
          <body>
            <div class="container">
              ${header}
              <div class="content">
                <h2>ご登録ありがとうございます！</h2>
                <p>${data.displayName || 'ユーザー'}さん、Dライフへようこそ！</p>
                <p>Dライフは糖尿病患者とそのご家族のためのコミュニティサイトです。</p>

                <h3>Dライフでできること</h3>
                <ul>
                  <li><strong>トピック投稿</strong> - 悩みや質問を投稿して、他のメンバーと情報交換</li>
                  <li><strong>記事閲覧</strong> - 糖尿病に関する役立つ記事を読む</li>
                  <li><strong>HbA1c記録</strong> - 自分のHbA1cを記録して管理</li>
                </ul>

                <p style="text-align: center; margin: 30px 0;">
                  <a href="${SITE_URL}/login" class="button">ログインする</a>
                </p>

                <p>何かご不明な点がございましたら、お気軽にお問い合わせください。</p>
                <p>これからDライフをよろしくお願いいたします。</p>
              </div>
              ${footer}
            </div>
          </body>
          </html>
        `,
      }

    case 'comment-notification':
      return {
        subject: 'あなたのトピックに新しいコメントがあります',
        html: `
          <!DOCTYPE html>
          <html>
          <head>${baseStyles}</head>
          <body>
            <div class="container">
              ${header}
              <div class="content">
                <p>${data.threadAuthorName || 'ユーザー'}さん</p>
                <p>あなたのトピックに新しいコメントがつきました。</p>

                <h3>トピック</h3>
                <p><strong>${data.threadTitle}</strong></p>

                <h3>コメント内容</h3>
                <div class="quote">
                  <p><strong>${data.commenterName}</strong>さんからのコメント:</p>
                  <p>${data.commentContent}</p>
                </div>

                <p style="text-align: center; margin: 30px 0;">
                  <a href="${SITE_URL}/threads/${data.threadId}" class="button">コメントを見る</a>
                </p>
              </div>
              ${footer}
            </div>
          </body>
          </html>
        `,
      }

    default:
      throw new Error(`Unknown email type: ${type}`)
  }
}

async function sendEmail(to: string, subject: string, html: string): Promise<{ success: boolean; error?: string }> {
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Dライフ <${FROM_EMAIL}>`,
        to: [to],
        subject,
        html,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Resend API error:', error)
      return { success: false, error: `Failed to send email: ${response.status}` }
    }

    const result = await response.json()
    console.log('Email sent successfully:', result.id)
    return { success: true }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error: error.message }
  }
}

serve(async (req) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Content-Type': 'application/json',
  }

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers })
  }

  try {
    const { type, to, data }: EmailRequest = await req.json()

    if (!type || !to) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: type, to' }),
        { status: 400, headers }
      )
    }

    const { subject, html } = getEmailTemplate(type, data || {})
    const result = await sendEmail(to, subject, html)

    if (!result.success) {
      return new Response(
        JSON.stringify({ error: result.error }),
        { status: 500, headers }
      )
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully' }),
      { status: 200, headers }
    )
  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers }
    )
  }
})
