import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'マイページ',
  description: 'あなたのDライフ マイページ。プロフィール編集・日記・食事記録・HbA1c管理などをご利用いただけます。',
  robots: { index: false, follow: false },
}

export default function MypageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
