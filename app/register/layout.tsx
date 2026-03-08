import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '新規会員登録',
  description: 'Dライフに無料会員登録して、糖尿病患者とその家族のコミュニティに参加しましょう。メールアドレスまたはGoogleアカウントで簡単に登録できます。',
  openGraph: {
    title: '新規会員登録 | Dライフ',
    description: 'Dライフに無料会員登録して、糖尿病コミュニティに参加しましょう。',
    type: 'website',
  },
  robots: {
    index: false,
    follow: true,
  },
}

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
