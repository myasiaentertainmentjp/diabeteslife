import Link from 'next/link'
import { MessageSquare, ChevronRight } from 'lucide-react'
import { ThreadCategory } from '@/types/database'

interface Thread {
  id: string
  thread_number: number
  title: string
  category: ThreadCategory
  created_at: string
  user_id: string
  comments_count: number
}

interface HomeThreadListProps {
  threads: Thread[]
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const diffHours = Math.floor(diff / (1000 * 60 * 60))
  const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (diffHours < 1) return 'たった今'
  if (diffHours < 24) return `${diffHours}時間前`
  if (diffDays < 7) return `${diffDays}日前`

  return date.toLocaleDateString('ja-JP', {
    month: 'numeric',
    day: 'numeric',
  })
}

export function HomeThreadList({ threads }: HomeThreadListProps) {
  if (threads.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <MessageSquare size={40} className="mx-auto mb-3 text-gray-300" />
        <p>トピックがありません</p>
      </div>
    )
  }

  return (
    <>
      <ul className="divide-y divide-gray-100">
        {threads.map((thread) => (
          <li key={thread.id}>
            <Link
              href={`/threads/${thread.thread_number || thread.id}`}
              className="block px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-gray-800 font-medium truncate">
                    {thread.title}
                  </h3>
                </div>
                <div className="flex items-center gap-4 shrink-0 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <MessageSquare size={14} />
                    {thread.comments_count || 0}
                  </span>
                  <span className="hidden sm:inline">
                    {formatDate(thread.created_at)}
                  </span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {/* View More */}
      <div className="px-4 py-3 border-t border-gray-100">
        <Link
          href="/threads"
          className="flex items-center justify-center gap-1 text-rose-500 hover:text-rose-600 text-sm font-medium"
        >
          <span>もっと見る</span>
          <ChevronRight size={16} />
        </Link>
      </div>
    </>
  )
}
