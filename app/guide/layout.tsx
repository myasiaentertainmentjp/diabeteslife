import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dライフの使い方・ガイド',
  description: 'Dライフの使い方をわかりやすく解説。掲示板への投稿、日記の書き方、HbA1cや食事の記録方法など、各機能の利用ガイドをまとめています。',
}

export default function GuideLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
