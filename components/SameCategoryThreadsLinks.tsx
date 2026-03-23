'use client'

import { TrackableLink } from './TrackableLink'
import { MessageCircle } from 'lucide-react'

/**
 * スレッド詳細ページの「同カテゴリの他のトピック」セクション
 * GA4計測付きの内部リンクコンポーネント
 */

interface RelatedThread {
  id: string
  thread_number: number
  title: string
  created_at: string
  comment_count: number
}

interface SameCategoryThreadsLinksProps {
  threads: RelatedThread[]
}

export function SameCategoryThreadsLinks({ threads }: SameCategoryThreadsLinksProps) {
  if (threads.length === 0) {
    return null
  }

  return (
    <div className="mt-8">
      <h2 className="text-lg font-bold text-gray-900 mb-4">
        同カテゴリの他のトピック
      </h2>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {threads.map((thread) => (
          <TrackableLink
            key={thread.id}
            href={`/threads/${thread.thread_number}`}
            linkType="same_category_threads"
            className="bg-white rounded-lg border border-gray-200 p-4 hover:border-rose-300 hover:shadow-sm transition-all block"
          >
            <h3 className="font-medium text-gray-900 line-clamp-2 mb-2">
              {thread.title}
            </h3>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span>
                {new Date(thread.created_at).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
              {thread.comment_count > 0 && (
                <span className="flex items-center gap-1">
                  <MessageCircle size={12} />
                  {thread.comment_count}
                </span>
              )}
            </div>
          </TrackableLink>
        ))}
      </div>
    </div>
  )
}
