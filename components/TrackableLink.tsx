'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode, useCallback } from 'react'

/**
 * GA4 内部リンク計測用コンポーネント
 *
 * SEO改善施策の効果測定用:
 * - related_threads: 記事詳細 → スレッドへの遷移
 * - same_category_threads: スレッド詳細 → 同カテゴリスレッドへの遷移
 * - breadcrumb: パンくずリンクの遷移
 * - register_banner: 登録促進バナーからの遷移
 */

type LinkType = 'related_threads' | 'same_category_threads' | 'breadcrumb' | 'register_banner'

interface TrackableLinkProps {
  href: string
  linkType: LinkType
  className?: string
  children: ReactNode
}

// GA4 イベント送信関数
function sendGA4Event(linkType: LinkType, fromPath: string, toPath: string) {
  // GA4 が設定されていない場合は何もしない
  if (typeof window === 'undefined' || !window.gtag) {
    return
  }

  window.gtag('event', 'click_internal', {
    link_type: linkType,
    from_path: fromPath,
    to_path: toPath,
  })
}

// window.gtag の型定義
declare global {
  interface Window {
    gtag?: (
      command: 'event' | 'config' | 'js',
      action: string,
      params?: Record<string, unknown>
    ) => void
  }
}

export function TrackableLink({
  href,
  linkType,
  className,
  children,
}: TrackableLinkProps) {
  const pathname = usePathname()

  const handleClick = useCallback(() => {
    sendGA4Event(linkType, pathname, href)
  }, [linkType, pathname, href])

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  )
}
