import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Suspense } from "react"
import "./globals.css"
import { Providers } from "@/components/Providers"
import { ProfileReviewModal } from "@/components/ProfileReviewModal"
import { ProfileSetupModal } from "@/components/ProfileSetupModal"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "D-LIFE | 糖尿病患者とその家族のためのコミュニティサイト",
    template: "%s | Dライフ",
  },
  description: "糖尿病患者とその家族のためのコミュニティサイト。食事、治療、運動、メンタルケアなど、糖尿病に関する情報を共有できます。",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://diabeteslife.jp"),
  openGraph: {
    title: "D-LIFE | 糖尿病患者とその家族のためのコミュニティサイト",
    description: "糖尿病患者とその家族のためのコミュニティサイト。食事、治療、運動、メンタルケアなど、糖尿病に関する情報を共有できます。",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://diabeteslife.jp",
    siteName: "Dライフ",
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: "/images/ogp.png",
        width: 1200,
        height: 630,
        alt: "Dライフ",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "D-LIFE | 糖尿病患者とその家族のためのコミュニティサイト",
    description: "糖尿病患者とその家族のためのコミュニティサイト。",
    images: ["/images/ogp.png"],
  },
}

function HeaderFallback() {
  return (
    <header className="shadow-sm">
      <div className="bg-rose-400">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-14">
            <div className="md:hidden w-10" />
            <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
              <span className="text-white text-[10px] tracking-wider">ディーライフ</span>
              <span className="text-white text-2xl font-bold tracking-wide -mt-1">D-LIFE</span>
            </div>
            <div className="hidden md:flex items-center gap-3 ml-auto">
              <div className="w-20 h-8 bg-white/30 animate-pulse rounded-lg" />
            </div>
          </div>
        </div>
      </div>
      <div className="bg-rose-400/90 backdrop-blur-sm shadow-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-10">
            <p className="text-white text-xs md:text-sm drop-shadow-sm">
              糖尿病患者とその家族のためのコミュニティサイト
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}

// JSON-LD構造化データ
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://diabeteslife.jp/#organization',
      name: 'Dライフ',
      url: 'https://diabeteslife.jp',
      logo: {
        '@type': 'ImageObject',
        url: 'https://diabeteslife.jp/images/ogp.png',
        width: 1200,
        height: 630,
      },
      sameAs: [],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://diabeteslife.jp/#website',
      url: 'https://diabeteslife.jp',
      name: 'Dライフ - 糖尿病患者とその家族のためのコミュニティサイト',
      description: '糖尿病患者とその家族のためのコミュニティサイト。食事、治療、運動、メンタルケアなど、糖尿病に関する情報を共有できます。',
      publisher: {
        '@id': 'https://diabeteslife.jp/#organization',
      },
      inLanguage: 'ja-JP',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://diabeteslife.jp/search?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Suspense fallback={<HeaderFallback />}>
              <Header />
            </Suspense>
            <main className="flex-1">{children}</main>
            <ProfileSetupModal />
        <ProfileReviewModal />
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}
