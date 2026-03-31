'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase'
import { getPresetThumbnailUrl, getRawPublicUrl } from '@/lib/image-utils'
import { Heart, MessageCircle, Plus, X, Loader2, UtensilsCrossed, ChevronDown } from 'lucide-react'

const MEAL_TAGS = ['低糖質', '外食', '手作り', 'コンビニ', '間食', '糖質オフ', 'ヘルシー']

/**
 * 一覧カード用画像コンポーネント（object-contain で全体表示）
 * - 正方形カード内に画像全体を表示（トリミングなし）
 * - Transform URL失敗時はraw URLにフォールバック
 */
function MealCardImage({ src, alt }: { src: string; alt: string }) {
  const [imageSrc, setImageSrc] = useState(getPresetThumbnailUrl(src, 'listSquare'))
  const [fallbackAttempted, setFallbackAttempted] = useState(false)
  const [hasError, setHasError] = useState(false)

  const handleError = useCallback(() => {
    if (!fallbackAttempted) {
      setImageSrc(getRawPublicUrl(src))
      setFallbackAttempted(true)
    } else {
      setHasError(true)
    }
  }, [src, fallbackAttempted])

  if (hasError) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-neutral-200">
        <UtensilsCrossed size={24} className="text-neutral-400" />
      </div>
    )
  }

  return (
    <Image
      src={imageSrc}
      alt={alt}
      fill
      sizes="33vw"
      className="object-contain"
      loading="lazy"
      onError={handleError}
    />
  )
}

/**
 * モーダル用画像コンポーネント（Transform URL + raw URLフォールバック）
 */
function MealModalImage({ src, alt }: { src: string; alt: string }) {
  const [imageSrc, setImageSrc] = useState(getPresetThumbnailUrl(src, 'modal'))
  const [fallbackAttempted, setFallbackAttempted] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const handleError = useCallback(() => {
    if (!fallbackAttempted) {
      setImageSrc(getRawPublicUrl(src))
      setFallbackAttempted(true)
    }
  }, [src, fallbackAttempted])

  return (
    <>
      {!loaded && (
        <div className="absolute inset-0 bg-black flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      )}
      <Image
        src={imageSrc}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 600px"
        className={`object-contain ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}
        priority
        onLoadingComplete={() => setLoaded(true)}
        onError={handleError}
      />
    </>
  )
}

const DIABETES_TYPE_OPTIONS = [
  { value: 'type1', label: '1型' },
  { value: 'type2', label: '2型' },
  { value: 'gestational', label: '妊娠糖尿病' },
  { value: 'prediabetes', label: '予備群' },
  { value: 'family', label: '家族・サポーター' },
]

const AGE_GROUP_OPTIONS = [
  { value: '10s', label: '10代' },
  { value: '20s', label: '20代' },
  { value: '30s', label: '30代' },
  { value: '40s', label: '40代' },
  { value: '50s', label: '50代' },
  { value: '60s', label: '60代' },
  { value: '70s_plus', label: '70代以上' },
]

interface MealPost {
  id: string
  user_id: string
  image_url: string
  caption: string | null
  tags: string[]
  diabetes_type: string | null
  age_group: string | null
  blood_sugar_after: number | null
  likes_count: number
  comments_count: number
  created_at: string
  display_name: string
}

interface MealsClientProps {
  initialPosts: MealPost[]
  selectedTag?: string
  selectedDiabetesType?: string
  selectedAgeGroup?: string
}

const ITEMS_PER_PAGE = 24

export function MealsClient({ initialPosts, selectedTag, selectedDiabetesType, selectedAgeGroup }: MealsClientProps) {
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
  const [showFilters, setShowFilters] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(initialPosts.length >= ITEMS_PER_PAGE)

  useEffect(() => {
    if (!user || posts.length === 0) return
    const postIds = posts.map(p => p.id)
    supabase
      .from('meal_likes')
      .select('meal_post_id')
      .eq('user_id', user.id)
      .in('meal_post_id', postIds)
      .then(({ data }) => {
        setLikedIds(new Set((data || []).map((l: { meal_post_id: string }) => l.meal_post_id)))
      })
  }, [user, posts.length])

  useEffect(() => {
    setPosts(initialPosts)
    setHasMore(initialPosts.length >= ITEMS_PER_PAGE)
  }, [initialPosts])

  async function loadMore() {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)

    let query = supabase
      .from('meal_posts')
      .select('id, user_id, image_url, caption, tags, diabetes_type, age_group, blood_sugar_after, likes_count, comments_count, created_at')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .range(posts.length, posts.length + ITEMS_PER_PAGE - 1)

    if (selectedTag) query = query.contains('tags', [selectedTag])
    if (selectedDiabetesType) query = query.eq('diabetes_type', selectedDiabetesType)
    if (selectedAgeGroup) query = query.eq('age_group', selectedAgeGroup)

    const { data: newPosts } = await query

    if (newPosts && newPosts.length > 0) {
      const userIds = [...new Set(newPosts.map(p => p.user_id))]
      const { data: users } = await supabase.from('users').select('id, display_name').in('id', userIds)
      const usersMap = Object.fromEntries((users || []).map(u => [u.id, u.display_name || 'ユーザー']))

      const postsWithUsers = newPosts.map(p => ({
        ...p,
        display_name: usersMap[p.user_id] || 'ユーザー',
      }))

      setPosts(prev => [...prev, ...postsWithUsers])
      setHasMore(newPosts.length >= ITEMS_PER_PAGE)
    } else {
      setHasMore(false)
    }

    setLoadingMore(false)
  }

  function buildUrl(params: { tag?: string; dtype?: string; age?: string }) {
    const search = new URLSearchParams()
    if (params.tag) search.set('tag', params.tag)
    if (params.dtype) search.set('dtype', params.dtype)
    if (params.age) search.set('age', params.age)
    const qs = search.toString()
    router.push(`/meals${qs ? `?${qs}` : ''}`)
  }

  async function handleLike(postId: string) {
    if (!user) { router.push('/login'); return }
    const isLiked = likedIds.has(postId)
    setLikedIds(prev => {
      const next = new Set(prev)
      if (isLiked) { next.delete(postId) } else { next.add(postId) }
      return next
    })
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, likes_count: p.likes_count + (isLiked ? -1 : 1) } : p
    ))
    if (isLiked) {
      await supabase.from('meal_likes').delete().eq('meal_post_id', postId).eq('user_id', user.id)
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
      const userIds = [...new Set(data.map((c: { user_id: string }) => c.user_id))]
      const { data: users } = await supabase.from('users').select('id, display_name').in('id', userIds)
      const usersMap = Object.fromEntries((users || []).map((u: { id: string; display_name: string | null }) => [u.id, u.display_name || 'ユーザー']))
      setComments(data.map((c: { id: string; body: string; created_at: string; user_id: string }) => ({ ...c, display_name: usersMap[c.user_id] || 'ユーザー' })))
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
      setComments(prev => [...prev, { id: (data as { id: string; body: string; created_at: string; user_id: string }).id, body: commentBody.trim(), created_at: new Date().toISOString(), user_id: user.id, display_name: 'あなた' }])
      setPosts(prev => prev.map(p =>
        p.id === selectedPost.id ? { ...p, comments_count: p.comments_count + 1 } : p
      ))
      setCommentBody('')
    }
    setSubmittingComment(false)
  }

  function formatDate(dateString: string) {
    const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000)
    if (diff < 60) return 'たった今'
    if (diff < 3600) return `${Math.floor(diff / 60)}分前`
    if (diff < 86400) return `${Math.floor(diff / 3600)}時間前`
    return `${Math.floor(diff / 86400)}日前`
  }

  const activeFiltersCount = [selectedTag, selectedDiabetesType, selectedAgeGroup].filter(Boolean).length

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">食事の記録</h1>
          <p className="text-sm text-gray-500 mt-0.5">みんなの糖尿病食をのぞいてみよう</p>
        </div>
      </div>

      {/* フィルターUI */}
      <div className="mb-5 space-y-3">
        {/* 料理タグ（常時表示） */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => buildUrl({ dtype: selectedDiabetesType, age: selectedAgeGroup })}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              !selectedTag ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            すべて
          </button>
          {MEAL_TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => buildUrl({ tag: selectedTag === tag ? undefined : tag, dtype: selectedDiabetesType, age: selectedAgeGroup })}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedTag === tag ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>

        {/* 属性フィルタートグル */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          <span>絞り込み</span>
          {activeFiltersCount > 0 && (
            <span className="bg-rose-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {/* 属性フィルター（展開時） */}
        {showFilters && (
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            {/* 糖尿病種別 */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">糖尿病の種別</p>
              <div className="flex flex-wrap gap-2">
                {DIABETES_TYPE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => buildUrl({ tag: selectedTag, dtype: selectedDiabetesType === opt.value ? undefined : opt.value, age: selectedAgeGroup })}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      selectedDiabetesType === opt.value ? 'bg-blue-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 年代 */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">年代</p>
              <div className="flex flex-wrap gap-2">
                {AGE_GROUP_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => buildUrl({ tag: selectedTag, dtype: selectedDiabetesType, age: selectedAgeGroup === opt.value ? undefined : opt.value })}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      selectedAgeGroup === opt.value ? 'bg-purple-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* リセット */}
            {activeFiltersCount > 0 && (
              <button
                onClick={() => router.push('/meals')}
                className="text-xs text-rose-500 hover:underline"
              >
                フィルターをリセット
              </button>
            )}
          </div>
        )}
      </div>

      {/* 正方形グリッド - 画像全体表示（フォールバック付き） */}
      {posts.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <UtensilsCrossed size={48} className="mx-auto mb-4 opacity-50" />
          <p className="font-medium">まだ投稿がありません</p>
          <button
            onClick={() => router.push(user ? '/meals/new' : '/login')}
            className="inline-block mt-4 text-rose-500 text-sm hover:underline"
          >
            最初の投稿をしてみましょう →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1">
          {posts.map(post => (
            <button
              key={post.id}
              onClick={() => openPost(post)}
              className="relative aspect-square overflow-hidden rounded-md group bg-neutral-100"
            >
              {/* 画像: 正方形内に全体表示（object-contain） */}
              <MealCardImage src={post.image_url} alt={post.caption || '食事の記録'} />
              {/* 種別・年代バッジ */}
              {(post.diabetes_type || post.age_group) && (
                <div className="absolute top-1 left-1 flex gap-0.5 z-10">
                  {post.diabetes_type && post.diabetes_type !== 'family' && (
                    <span className="bg-blue-500/90 text-white text-[9px] font-medium px-1 py-0.5 rounded">
                      {DIABETES_TYPE_OPTIONS.find(o => o.value === post.diabetes_type)?.label}
                    </span>
                  )}
                  {post.age_group && post.age_group !== 'private' && (
                    <span className="bg-purple-500/90 text-white text-[9px] font-medium px-1 py-0.5 rounded">
                      {AGE_GROUP_OPTIONS.find(o => o.value === post.age_group)?.label}
                    </span>
                  )}
                </div>
              )}
              {/* ホバーオーバーレイ */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 text-white z-10">
                <span className="flex items-center gap-1 text-sm font-bold">
                  <Heart size={14} fill="white" /> {post.likes_count}
                </span>
                <span className="flex items-center gap-1 text-sm font-bold">
                  <MessageCircle size={14} fill="white" /> {post.comments_count}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* もっと見るボタン */}
      {posts.length > 0 && hasMore && (
        <div className="mt-8 text-center">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-8 py-3 bg-white border border-gray-300 rounded-full text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 shadow-sm"
          >
            {loadingMore ? (
              <span className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                読み込み中...
              </span>
            ) : (
              <span>もっと見る</span>
            )}
          </button>
        </div>
      )}

      {/* 投稿FABボタン（右下固定） */}
      <button
        onClick={() => router.push(user ? '/meals/new' : '/login')}
        className="fixed bottom-6 right-6 w-14 h-14 bg-rose-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-rose-600 active:scale-95 transition-all z-40"
        aria-label="食事を投稿する"
      >
        <Plus size={26} />
      </button>

      {/* 投稿詳細モーダル */}
      {selectedPost && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="bg-white rounded-xl overflow-hidden max-w-3xl w-full max-h-[90vh] flex flex-col md:flex-row"
            onClick={e => e.stopPropagation()}
          >
            {/* 画像 - モバイルは高さ制限、PCは正方形 */}
            <div className="relative h-56 sm:h-72 md:h-auto md:aspect-square md:w-1/2 flex-shrink-0 bg-black">
              <MealModalImage
                src={selectedPost.image_url}
                alt={selectedPost.caption || '食事の記録'}
              />
            </div>

            {/* 右パネル */}
            <div className="flex flex-col flex-1 min-h-0">
              {/* ユーザー情報 */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-rose-500">{selectedPost.display_name[0]}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{selectedPost.display_name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {selectedPost.diabetes_type && selectedPost.diabetes_type !== 'family' && (
                        <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-medium">
                          {DIABETES_TYPE_OPTIONS.find(o => o.value === selectedPost.diabetes_type)?.label}
                        </span>
                      )}
                      {selectedPost.age_group && selectedPost.age_group !== 'private' && (
                        <span className="text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded font-medium">
                          {AGE_GROUP_OPTIONS.find(o => o.value === selectedPost.age_group)?.label}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedPost(null)} className="p-1 text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>

              {/* キャプション・タグ（食後血糖値は表示しない） */}
              <div className="p-4 border-b border-gray-100">
                {selectedPost.caption && (
                  <p className="text-sm text-gray-700 mb-2">{selectedPost.caption}</p>
                )}
                {selectedPost.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedPost.tags.map(tag => (
                      <span key={tag} className="text-xs text-rose-500 font-medium">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* コメント一覧 */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
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

              {/* いいね */}
              <div className="px-4 py-2 border-t border-gray-100">
                <button
                  onClick={() => handleLike(selectedPost.id)}
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                    likedIds.has(selectedPost.id) ? 'text-rose-500' : 'text-gray-500 hover:text-rose-500'
                  }`}
                >
                  <Heart size={18} fill={likedIds.has(selectedPost.id) ? 'currentColor' : 'none'} />
                  {posts.find(p => p.id === selectedPost.id)?.likes_count ?? selectedPost.likes_count} いいね
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
