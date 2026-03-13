import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'よくある質問（FAQ）',
  description: 'Dライフのよくある質問と回答をまとめています。会員登録・ログイン・掲示板の使い方・記録機能など、お困りの点はこちらをご確認ください。',
}

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
