import { Metadata } from 'next'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
  },
}

export default function MyPageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
