'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase'
import { Heart, MessageCircle, Plus, X, Loader2, UtensilsCrossed } from 'lucide-react'

const TAGS = ['低糖質', '外食', '手作り', 'コンビニ', '間食', '糖質オフ', 'ヘルシー']

interface MealPost {
  id: string
  user_id: string
  image_url: string
  caption: string | null
  tags: string[]
  blood_sugar_after: number | null
  likes_count: number
  comments_count: number
  created_at: string
  display_name: string
}

interface MealsClientProps {
  initialPosts: MealPost[]
  selectedTag?: string
}

export function MealsClient({ initialPosts, selectedTag }: MealsClientProps) {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [posts, setPosts] = useState<MealPost[]>(initialPosts)
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())
  const [selectedPost, setSelectedPost] = useState<MealPost | null>(null)
  const [comments, setComments] = useState<{ id: string; body: string; display_name: string; created_at: string }[]>([])
  const [commentBody, setCommentBody] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [loadingComments, setLoadingComments] = useState(false)

  // 自分のいいね状態を取得
  useEffect(() => {
    if (!user || posts.length === 0) return
    const postIds = posts.map(p => p.id)
    supabase
      .from('meal_likes')
      .select('meal_post_id')
      .eq('user_id', user.id)
      .in('meal_post_id', postIds)
      .then(({ data }) => {
        setLikedIds(new Set((data || []).map(l => l.meal_post_id)))
      })
  }, [user, posts.length])

  async function handleLike(postId: string) {
    if (!user) { router.push('/login'); return }
    const isLiked = likedIds.has(postId)

    // オプティミスティック更新
    setLikedIds(prev => {
      const next = new Set(prev)
      isLiked ? next.delete(postId) : next.add(postId)
      return next
    })
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, likes_count: p.likes_count + (isLiked ? -1 : 1) }
        : p
    ))

    if (isLiked) {
      await supabase.from('meal_likes').delete()
        .eq('meal_post_id', postId).eq('user_id', user.id)
    } else {
      await supabase.from('meal_likes').insert({ meal_post_id: postId, user_id: user.id })
    }
  }

  async function openPost(post: MealPost) {
    setSelectedPost(post)
    setLoadingComments(true)
    const { data } = await supabase
      .from('meal_comments')
      .select('id, body, created_at, user_id')
      .eq('meal_post_id', post.id)
      .order('created_at', { ascending: true })

    if (data && data.length > 0) {
      const userIds = [...new Set(data.map(c => c.user_id))]
      const { data: users } = await supabase
        .from('users').select('id, display_name').in('id', userIds)
      const usersMap = Object.fromEntries((users || []).map(u => [u.id, u.display_name || 'ユーザー']))
      setComments(data.map(c => ({ ...c, display_name: usersMap[c.user_id] || 'ユーザー' })))
    } else {
      setComments([])
    }
    setLoadingComments(false)
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !selectedPost || !commentBody.trim()) return
    setSubmittingComment(true)
    const { data } = await supabase
      .from('meal_comments')
      .insert({ meal_post_id: selectedPost.id, user_id: user.id, body: commentBody.trim() })
      .select('id, body, created_at, user_id')
      .single()
    if (data) {
      setComments(prev => [...prev, { ...data, display_name: user.email?.split('@')[0] || 'あなた' }])
      setPosts(prev => prev.map(p =>
        p.id === selectedPost.id ? { ...p, comments_count: p.comments_count + 1 } : p
      ))
      setCommentBody('')
    }
    setSubmittingComment(false)
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
    if (diff < 60) return 'たった今'
    if (diff < 3600) return `${Math.floor(diff / 60)}分前`
    if (diff < 86400) return `${Math.floor(diff / 3600)}時間前`
    return `${Math.floor(diff / 86400)}日前`
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">食事の記録</h1>
          <p className="text-sm text-gray-500 mt-1">みんなの糖尿病食をのぞいてみよう</p>
        </div>
        {user && (
          <Link
            href="/meals/new"
            className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors font-medium"
          >
            <Plus size={18} />
            <span>投稿する</span>
          </Link>
        )}
      </div>

      {/* タグフィルター */}
      <div className="flex gap-2 flex-wrap mb-6">
        <button
          onClick={() => router.push('/meals')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            !selectedTag ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          すべて
        </button>
        {TAGS.map(tag => (
          <button
            key={tag}
            onClick={() => router.push(`/meals?tag=${encodeURIComponent(tag)}`)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedTag === tag ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            #{tag}
          </button>
        ))}
      </div>

      {/* グリッド */}
      {posts.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <UtensilsCrossed size={48} className="mx-auto mb-4 opacity-50" />
          <p className="font-medium">まだ投稿がありません</p>
          {user && (
            <Link href="/meals/new" className="inline-block mt-4 text-rose-500 text-sm hover:underline">
              最初の投稿をしてみましょう →
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1 md:gap-2">
          {posts.map(post => (
            <button
              key={post.id}
              onClick={() => openPost(post)}
              className="relative aspect-square bg-gray-100 rounded overflow-hidden group"
            >
              <Image
                src={post.image_url}
                alt={post.caption || '食事の記録'}
                fill
                sizes="(max-width: 768px) 33vw, 280px"
                className="object-cover"
                loading="lazy"
              />
              {/* ホバーオーバーレイ */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white">
                <span className="flex items-center gap-1 text-sm font-medium">
                  <Heart size={16} fill="white" /> {post.likes_count}
                </span>
                <span className="flex items-center gap-1 text-sm font-medium">
                  <MessageCircle size={16} fill="white" /> {post.comments_count}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* 投稿詳細モーダル（インスタ風） */}
      {selectedPost && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="bg-white rounded-xl overflow-hidden max-w-3xl w-full max-h-[90vh] flex flex-col md:flex-row"
            onClick={e => e.stopPropagation()}
          >
            {/* 画像 */}
            <div className="relative aspect-square md:w-1/2 flex-shrink-0 bg-black">
              <Image
                src={selectedPost.image_url}
                alt={selectedPost.caption || '食事の記録'}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            {/* 右パネル */}
            <div className="flex flex-col flex-1 min-h-0">
              {/* ヘッダー */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{selectedPost.display_name}</p>
                  <p className="text-xs text-gray-400">{formatDate(selectedPost.created_at)}</p>
                </div>
                <button onClick={() => setSelectedPost(null)} className="p-1 text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>

              {/* キャプション・タグ・血糖値 */}
              <div className="p-4 border-b border-gray-100">
                {selectedPost.caption && (
                  <p className="text-sm text-gray-700 mb-2">{selectedPost.caption}</p>
                )}
                {selectedPost.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {selectedPost.tags.map(tag => (
                      <span key={tag} className="text-xs text-rose-500">#{tag}</span>
                    ))}
                  </div>
                )}
                {selectedPost.blood_sugar_after && (
                  <p className="text-xs text-gray-500">食後血糖値: <span className="font-medium text-gray-700">{selectedPost.blood_sugar_after} mg/dL</span></p>
                )}
              </div>

              {/* コメント一覧 */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loadingComments ? (
                  <div className="flex justify-center py-4">
                    <Loader2 size={20} className="animate-spin text-gray-400" />
                  </div>
                ) : comments.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">コメントはまだありません</p>
                ) : (
                  comments.map(c => (
                    <div key={c.id} className="flex gap-2">
                      <div className="w-7 h-7 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-rose-500">{c.display_name[0]}</span>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-900">{c.display_name} </span>
                        <span className="text-xs text-gray-700">{c.body}</span>
                        <p className="text-xs text-gray-400 mt-0.5">{formatDate(c.created_at)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* いいね数 */}
              <div className="px-4 py-2 border-t border-gray-100">
                <button
                  onClick={() => handleLike(selectedPost.id)}
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                    likedIds.has(selectedPost.id) ? 'text-rose-500' : 'text-gray-500 hover:text-rose-500'
                  }`}
                >
                  <Heart
                    size={18}
                    fill={likedIds.has(selectedPost.id) ? 'currentColor' : 'none'}
                  />
                  <span>{posts.find(p => p.id === selectedPost.id)?.likes_count ?? selectedPost.likes_count} いいね</span>
                </button>
              </div>

              {/* コメント入力 */}
              {user ? (
                <form onSubmit={handleComment} className="flex gap-2 p-4 border-t border-gray-100">
                  <input
                    type="text"
                    value={commentBody}
                    onChange={e => setCommentBody(e.target.value)}
                    placeholder="コメントを追加..."
                    className="flex-1 text-sm border border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-300"
                  />
                  <button
                    type="submit"
                    disabled={!commentBody.trim() || submittingComment}
                    className="px-4 py-2 bg-rose-500 text-white text-sm rounded-full font-medium disabled:opacity-40 hover:bg-rose-600 transition-colors"
                  >
                    {submittingComment ? <Loader2 size={14} className="animate-spin" /> : '送信'}
                  </button>
                </form>
              ) : (
                <div className="p-4 border-t border-gray-100 text-center">
                  <Link href="/login" className="text-sm text-rose-500 hover:underline">
                    ログインしてコメントする
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
