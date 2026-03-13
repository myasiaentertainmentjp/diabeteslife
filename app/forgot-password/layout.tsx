import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'パスワードをお忘れの方',
  description: 'Dライフのパスワード再設定ページ。登録済みのメールアドレスに再設定リンクをお送りします。',
  robots: { index: false, follow: false },
}

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
