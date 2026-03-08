import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://diabeteslife.jp'
const FROM_EMAIL = 'noreply@diabeteslife.jp'
const ADMIN_EMAIL = 'info@diabeteslife.jp'

interface EmailRequest {
  type: 'welcome' | 'comment-notification' | 'contact'
  to?: string
  data: Record<string, string>
}

function getEmailTemplate(
  type: string,
  data: Record<string, string>
): { subject: string; html: string } {
  const baseStyles = `
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #f43f5e; margin-bottom: 20px; }
      .logo { font-size: 24px; font-weight: bold; color: #f43f5e; }
      .logo-sub { font-size: 12px; color: #6b7280; }
      .content { padding: 20px 0; }
      .button { display: inline-block; padding: 12px 24px; background-color: #f43f5e; color: white !important; text-decoration: none; border-radius: 8px; font-weight: 500; }
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

    case 'contact':
      return {
        subject: `【お問い合わせ】${data.inquiryType || 'その他'}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>${baseStyles}</head>
          <body>
            <div class="container">
              ${header}
              <div class="content">
                <h2>お問い合わせがありました</h2>
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                  <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold; width: 120px;">お名前</td>
                    <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${data.name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">メールアドレス</td>
                    <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><a href="mailto:${data.email}">${data.email}</a></td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">種別</td>
                    <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${data.inquiryType}</td>
                  </tr>
                </table>
                <h3>お問い合わせ内容</h3>
                <div class="quote">
                  <p style="white-space: pre-wrap;">${data.message}</p>
                </div>
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

export async function POST(request: NextRequest) {
  try {
    const body: EmailRequest = await request.json()
    const { type, to, data } = body

    if (!type) {
      return NextResponse.json({ error: 'Missing required field: type' }, { status: 400 })
    }

    const recipient = type === 'contact' ? ADMIN_EMAIL : to

    if (!recipient) {
      return NextResponse.json({ error: 'Missing required field: to' }, { status: 400 })
    }

    const { subject, html } = getEmailTemplate(type, data || {})

    const { error } = await resend.emails.send({
      from: `Dライフ <${FROM_EMAIL}>`,
      to: [recipient],
      subject,
      html,
    })

    if (error) {
      console.error('Resend API error:', error)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Email sent successfully' })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
