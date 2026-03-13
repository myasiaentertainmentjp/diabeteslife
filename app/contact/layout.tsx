import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'お問い合わせ',
  description: 'Dライフへのお問い合わせはこちら。サービスに関するご質問・ご意見・不具合のご報告などをお受けしています。',
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
