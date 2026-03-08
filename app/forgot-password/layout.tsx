import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'パスワードリセット',
  description: 'パスワードをお忘れの方はこちらからリセットできます。登録したメールアドレスを入力してください。',
  openGraph: {
    title: 'パスワードリセット | Dライフ',
    description: 'パスワードをお忘れの方はこちらからリセットできます。',
    type: 'website',
  },
  robots: {
    index: false,
    follow: true,
  },
}

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
