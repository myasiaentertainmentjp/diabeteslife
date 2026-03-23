import Link from 'next/link'
import {
  THREAD_CATEGORY_LABELS,
  THREAD_CATEGORY_COLORS,
  ThreadCategory,
} from '@/types/database'
import { MessageSquare } from 'lucide-react'

interface Thread {
  id: string
  thread_number: number
  title: string
  category: string
  created_at: string
  user_id: string
  comments_count: number
}

interface ThreadCardProps {
  thread: Thread
}

function formatDate(dateString: string) {
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

export function ThreadCard({ thread }: ThreadCardProps) {
  return (
    <li>
      <Link
        href={`/threads/${thread.thread_number || thread.id}`}
        className="block px-4 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`px-2 py-0.5 text-xs font-medium rounded ${
                  THREAD_CATEGORY_COLORS[thread.category as ThreadCategory]
                }`}
              >
                {THREAD_CATEGORY_LABELS[thread.category as ThreadCategory]}
              </span>
            </div>
            <h3 className="text-gray-800 font-medium">{thread.title}</h3>
          </div>
          <div className="flex items-center gap-4 shrink-0 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <MessageSquare size={14} />
              {thread.comments_count || 0}
            </span>
            <span>{formatDate(thread.created_at)}</span>
          </div>
        </div>
      </Link>
    </li>
  )
}

interface ThreadListProps {
  threads: Thread[]
}

export function ThreadList({ threads }: ThreadListProps) {
  if (threads.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <MessageSquare size={40} className="mx-auto mb-3 text-gray-300" />
        <p>トピックがありません</p>
      </div>
    )
  }

  return (
    <ul className="divide-y divide-gray-100">
      {threads.map((thread) => (
        <ThreadCard key={thread.id} thread={thread} />
      ))}
    </ul>
  )
}
