import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'よくある質問（FAQ）',
  description: 'Dライフに関するよくある質問と回答をまとめました。アカウント登録、投稿方法、プライバシーに関する疑問にお答えします。',
  openGraph: {
    title: 'よくある質問（FAQ） | Dライフ',
    description: 'Dライフに関するよくある質問と回答をまとめました。',
    type: 'website',
  },
}

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
