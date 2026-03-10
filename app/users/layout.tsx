import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ユーザープロフィール | ディーライフ',
  description: 'ディーライフのユーザープロフィールページです。',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
