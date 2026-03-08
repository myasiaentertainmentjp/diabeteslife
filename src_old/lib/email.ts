import { supabase } from './supabase'

export type EmailType = 'welcome' | 'comment-notification'

interface SendEmailParams {
  type: EmailType
  to: string
  data?: Record<string, string>
}

/**
 * Send email via Supabase Edge Function
 * This function calls the send-email edge function to send emails through Resend
 */
export async function sendEmail({ type, to, data = {} }: SendEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: result, error } = await supabase.functions.invoke('send-email', {
      body: { type, to, data },
    })

    if (error) {
      console.error('Error calling send-email function:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error: (error as Error).message }
  }
}

/**
 * Send welcome email to newly registered user
 */
export async function sendWelcomeEmail(email: string, displayName?: string): Promise<void> {
  const result = await sendEmail({
    type: 'welcome',
    to: email,
    data: { displayName: displayName || '' },
  })

  if (!result.success) {
    console.error('Failed to send welcome email:', result.error)
  }
}

/**
 * Send comment notification email to thread author
 */
export async function sendCommentNotificationEmail(params: {
  threadAuthorEmail: string
  threadAuthorName: string
  threadTitle: string
  threadId: string
  commenterName: string
  commentContent: string
}): Promise<void> {
  // Truncate comment content to 100 characters
  const truncatedContent = params.commentContent.length > 100
    ? params.commentContent.slice(0, 100) + '...'
    : params.commentContent

  const result = await sendEmail({
    type: 'comment-notification',
    to: params.threadAuthorEmail,
    data: {
      threadAuthorName: params.threadAuthorName,
      threadTitle: params.threadTitle,
      threadId: params.threadId,
      commenterName: params.commenterName,
      commentContent: truncatedContent,
    },
  })

  if (!result.success) {
    console.error('Failed to send comment notification email:', result.error)
  }
}
