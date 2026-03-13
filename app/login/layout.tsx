import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ログイン',
  description: 'Dライフにログインして、糖尿病コミュニティの掲示板・日記・食事記録などの機能をご利用ください。',
  robots: { index: false, follow: false },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
