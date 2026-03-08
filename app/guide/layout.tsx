import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '使い方ガイド',
  description: 'Dライフの使い方をご紹介します。アカウント登録、プロフィール設定、トピックへの参加方法など、はじめての方向けのガイドです。',
  openGraph: {
    title: '使い方ガイド | Dライフ',
    description: 'Dライフの使い方をご紹介します。アカウント登録、プロフィール設定、トピックへの参加方法など。',
    type: 'website',
  },
}

export default function GuideLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
