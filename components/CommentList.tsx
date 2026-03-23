import Link from 'next/link'
import Image from 'next/image'
import { MessageSquare } from 'lucide-react'

interface Comment {
  id: string
  thread_id: string
  user_id: string
  body?: string
  content?: string
  image_url?: string
  parent_id?: string
  is_hidden: boolean
  created_at: string
  profiles?: { display_name: string | null }
}

interface CommentListProps {
  comments: Comment[]
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

// Render comment text with anchor references (>> links) as static text
// Client-side interactivity (hover popups) will be added via ThreadInteractions
function renderCommentText(text: string) {
  // Keep anchor patterns visible but non-interactive in server render
  // Client component will enhance these with hover functionality
  return text
}

export function CommentList({ comments }: CommentListProps) {
  return (
    <>
      {/* Comments Section header */}
      <div className="px-6 py-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <MessageSquare size={20} className="text-gray-600" />
          <h2 className="font-semibold text-gray-800">
            コメント ({comments.length})
          </h2>
        </div>
      </div>

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="px-6 py-8 text-center text-gray-500">
          まだコメントはありません
        </div>
      ) : (
        <div className="px-6 py-2">
          {comments.map((comment, index) => {
            const isFutureComment = new Date(comment.created_at) > new Date()
            const commentNumber = index + 2

            return (
              <div
                key={comment.id}
                id={`comment-${commentNumber}`}
                data-comment-number={commentNumber}
                data-comment-user-id={comment.user_id}
                data-comment-body={comment.body || comment.content || ''}
                className={`py-5 transition-colors duration-500 ${
                  isFutureComment ? 'opacity-50 bg-yellow-50 rounded-lg px-3' : ''
                }`}
              >
                <div className="flex flex-wrap items-baseline gap-1 mb-2">
                  <span className="font-bold text-rose-500">{commentNumber}:</span>
                  {isFutureComment && (
                    <span className="px-1.5 py-0.5 text-xs font-medium bg-yellow-400 text-yellow-900 rounded">
                      予約
                    </span>
                  )}
                  <Link
                    href={`/users/${comment.user_id}`}
                    className="font-medium text-blue-800 hover:underline"
                  >
                    {comment.profiles?.display_name || '匿名'}
                  </Link>
                  <span className="text-gray-400 text-sm ml-2">
                    {formatDate(comment.created_at)}
                  </span>
                  {/* Reply button slot - will be rendered by client component */}
                  <span
                    data-reply-slot={commentNumber}
                    className="inline-block"
                  />
                </div>
                <div
                  className="pl-4 text-gray-900 whitespace-pre-wrap leading-relaxed"
                  data-comment-text={commentNumber}
                >
                  {renderCommentText(comment.body || comment.content || '')}
                </div>

                {comment.image_url && (
                  <div className="mt-2 pl-4">
                    <div className="relative inline-block max-w-xs">
                      <Image
                        src={comment.image_url}
                        alt="添付画像"
                        width={320}
                        height={192}
                        className="rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 object-contain"
                        data-image-modal={comment.image_url}
                        unoptimized
                      />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <div className="h-16" />
    </>
  )
}
