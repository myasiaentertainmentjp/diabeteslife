'use client'

import { ChevronRight, Home } from 'lucide-react'
import { TrackableLink } from './TrackableLink'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

/**
 * パンくずリストコンポーネント
 * GA4計測付き（linkType: breadcrumb）
 *
 * SEO効果:
 * - BreadcrumbList構造化データで検索結果表示を改善
 * - 内部リンク経由でクロール導線を強化
 */
export function Breadcrumb({ items }: BreadcrumbProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://diabeteslife.jp'

  // Generate BreadcrumbList structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'トップ',
        item: siteUrl,
      },
      ...items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 2,
        name: item.label,
        ...(item.href ? { item: `${siteUrl}${item.href}` } : {}),
      })),
    ],
  }

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Visual Breadcrumb - GA4計測付き */}
      <nav aria-label="パンくずリスト" className="mb-4">
        <ol className="flex items-center flex-wrap gap-1 text-sm text-gray-600">
          <li className="flex items-center">
            <TrackableLink
              href="/"
              linkType="breadcrumb"
              className="flex items-center gap-1 hover:text-rose-500 transition-colors"
            >
              <Home size={14} />
              <span>トップ</span>
            </TrackableLink>
          </li>
          {items.map((item, index) => (
            <li key={index} className="flex items-center">
              <ChevronRight size={14} className="mx-1 text-gray-400" />
              {item.href ? (
                <TrackableLink
                  href={item.href}
                  linkType="breadcrumb"
                  className="hover:text-rose-500 transition-colors"
                >
                  {item.label}
                </TrackableLink>
              ) : (
                <span className="text-gray-900 font-medium">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
}
