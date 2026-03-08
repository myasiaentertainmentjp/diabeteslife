import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ログイン',
  description: 'Dライフにログインして、糖尿病コミュニティに参加しましょう。メールアドレスまたはGoogleアカウントでログインできます。',
  openGraph: {
    title: 'ログイン | Dライフ',
    description: 'Dライフにログインして、糖尿病コミュニティに参加しましょう。',
    type: 'website',
  },
  robots: {
    index: false,
    follow: true,
  },
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
