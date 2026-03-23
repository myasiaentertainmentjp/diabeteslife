import Link from 'next/link'
import Image from 'next/image'
import {
  THREAD_CATEGORY_LABELS,
  THREAD_CATEGORY_COLORS,
} from '@/types/database'

interface Thread {
  id: string
  thread_number: number
  user_id: string
  title: string
  content: string
  body?: string
  category: string
  image_url?: string
  created_at: string
  comments_count: number
  profiles?: { display_name: string | null }
}

interface ThreadContentProps {
  thread: Thread
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function ThreadContent({ thread }: ThreadContentProps) {
  const threadContent = thread.body || thread.content || ''

  return (
    <>
      {/* Title Section */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded ${
                THREAD_CATEGORY_COLORS[thread.category as keyof typeof THREAD_CATEGORY_COLORS]
              }`}
            >
              {THREAD_CATEGORY_LABELS[thread.category as keyof typeof THREAD_CATEGORY_LABELS]}
            </span>
          </div>
          {/* Bookmark button slot - rendered by client component */}
          <div id="thread-bookmark-slot" />
        </div>
        <h1 className="text-xl font-bold text-gray-800">{thread.title}</h1>
      </div>

      {/* Original Post as 1: */}
      <div className="px-6 py-5" id="comment-1">
        <div className="flex flex-wrap items-baseline gap-1 mb-2">
          <span className="font-bold text-rose-500">1:</span>
          <Link
            href={`/users/${thread.user_id}`}
            className="font-medium text-blue-800 hover:underline"
          >
            {thread.profiles?.display_name || '匿名'}
          </Link>
          <span className="text-gray-400 text-sm ml-2">
            {formatDate(thread.created_at)}
          </span>
        </div>
        <div className="pl-4 text-gray-900 whitespace-pre-wrap leading-relaxed">
          {threadContent}
        </div>

        {thread.image_url && (
          <div className="mt-4 pl-4">
            <div className="relative inline-block">
              <Image
                src={thread.image_url}
                alt="投稿画像"
                width={600}
                height={384}
                className="max-w-full max-h-96 object-contain rounded-lg border border-gray-200 cursor-pointer hover:opacity-90"
                data-image-modal={thread.image_url}
                unoptimized
              />
            </div>
          </div>
        )}
      </div>
    </>
  )
}
