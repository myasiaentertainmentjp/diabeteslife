'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import {
  THREAD_CATEGORY_LABELS,
  ARTICLE_CATEGORY_LABELS,
  ThreadCategory,
  ArticleCategory,
} from '@/types/database'
import { MessageSquare, BookOpen, Loader2, Search as SearchIcon } from 'lucide-react'

type TabType = 'threads' | 'articles'

const ITEMS_PER_PAGE = 20

interface Thread {
  id: string
  thread_number: number
  title: string
  category: ThreadCategory
  created_at: string
  comments_count: number
}

interface Article {
  id: string
  title: string
  slug: string
  excerpt: string | null
  thumbnail_url: string | null
  category: ArticleCategory
  published_at: string | null
  created_at: string
}

interface SearchResult {
  threads: Thread[]
  articles: Article[]
  threadCount: number
  articleCount: number
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-rose-500" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}

function SearchContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const { user } = useAuth()
  const supabase = createClient()

  const [activeTab, setActiveTab] = useState<TabType>('threads')
  const [results, setResults] = useState<SearchResult>({
    threads: [],
    articles: [],
    threadCount: 0,
    articleCount: 0,
  })
  const [loading, setLoading] = useState(false)
  const [threadPage, setThreadPage] = useState(1)
  const [articlePage, setArticlePage] = useState(1)

  useEffect(() => {
    if (query.trim()) {
      performSearch()
      logSearch(query.trim())
    }
  }, [query])

  async function performSearch() {
    if (!query.trim()) return

    setLoading(true)
    setThreadPage(1)
    setArticlePage(1)

    try {
      const futureBuffer = new Date()
      futureBuffer.setMinutes(futureBuffer.getMinutes() + 1)

      const threadPromise = supabase
        .from('threads')
        .select('*', { count: 'exact' })
        .or(`title.ilike.%${query}%,body.ilike.%${query}%`)
        .gt('comments_count', 0)
        .lte('created_at', futureBuffer.toISOString())
        .order('created_at', { ascending: false })
        .range(0, ITEMS_PER_PAGE - 1)

      const articlePromise = supabase
        .from('articles')
        .select('*', { count: 'exact' })
        .or(`title.ilike.%${query}%,content.ilike.%${query}%,excerpt.ilike.%${query}%`)
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .range(0, ITEMS_PER_PAGE - 1)

      const [threadResult, articleResult] = await Promise.all([threadPromise, articlePromise])

      setResults({
        threads: (threadResult.data as Thread[]) || [],
        articles: (articleResult.data as Article[]) || [],
        threadCount: threadResult.count || 0,
        articleCount: articleResult.count || 0,
      })

      if ((threadResult.count || 0) === 0 && (articleResult.count || 0) > 0) {
        setActiveTab('articles')
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  async function logSearch(keyword: string) {
    try {
      await supabase.from('search_logs').insert({
        keyword: keyword.toLowerCase(),
        user_id: user?.id || null,
      } as never)
    } catch {
      // Silently fail
    }
  }

  async function loadMoreThreads() {
    const nextPage = threadPage + 1
    const from = (nextPage - 1) * ITEMS_PER_PAGE
    const to = from + ITEMS_PER_PAGE - 1

    try {
      const futureBuffer = new Date()
      futureBuffer.setMinutes(futureBuffer.getMinutes() + 1)

      const { data } = await supabase
        .from('threads')
        .select('*')
        .or(`title.ilike.%${query}%,body.ilike.%${query}%`)
        .gt('comments_count', 0)
        .lte('created_at', futureBuffer.toISOString())
        .order('created_at', { ascending: false })
        .range(from, to)

      if (data) {
        setResults((prev) => ({
          ...prev,
          threads: [...prev.threads, ...(data as Thread[])],
        }))
        setThreadPage(nextPage)
      }
    } catch (error) {
      console.error('Error loading more threads:', error)
    }
  }

  async function loadMoreArticles() {
    const nextPage = articlePage + 1
    const from = (nextPage - 1) * ITEMS_PER_PAGE
    const to = from + ITEMS_PER_PAGE - 1

    try {
      const { data } = await supabase
        .from('articles')
        .select('*')
        .or(`title.ilike.%${query}%,content.ilike.%${query}%,excerpt.ilike.%${query}%`)
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .range(from, to)

      if (data) {
        setResults((prev) => ({
          ...prev,
          articles: [...prev.articles, ...(data as Article[])],
        }))
        setArticlePage(nextPage)
      }
    } catch (error) {
      console.error('Error loading more articles:', error)
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  function truncateText(text: string, maxLength: number) {
    if (!text) return ''
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text
  }

  const hasMoreThreads = results.threads.length < results.threadCount
  const hasMoreArticles = results.articles.length < results.articleCount
  const totalResults = results.threadCount + results.articleCount

  if (!query.trim()) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center">
          <SearchIcon size={48} className="mx-auto mb-4 text-gray-300" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">検索</h1>
          <p className="text-gray-500">キーワードを入力して検索してください</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Search Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">
          「{query}」の検索結果
        </h1>
        {!loading && (
          <p className="text-sm text-gray-500 mt-1">
            {totalResults}件の結果が見つかりました
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('threads')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'threads'
              ? 'border-rose-500 text-rose-500'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="flex items-center gap-2">
            <MessageSquare size={16} />
            トピック（{results.threadCount}）
          </span>
        </button>
        <button
          onClick={() => setActiveTab('articles')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'articles'
              ? 'border-rose-500 text-rose-500'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="flex items-center gap-2">
            <BookOpen size={16} />
            記事（{results.articleCount}）
          </span>
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 size={32} className="animate-spin text-rose-500" />
        </div>
      )}

      {/* Results */}
      {!loading && (
        <>
          {/* Threads Tab */}
          {activeTab === 'threads' && (
            <div className="space-y-4">
              {results.threads.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                  <MessageSquare size={40} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500">該当するトピックが見つかりませんでした</p>
                </div>
              ) : (
                <>
                  <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-100">
                    {results.threads.map((thread) => (
                      <Link
                        key={thread.id}
                        href={`/threads/${thread.thread_number || thread.id}`}
                        className="block px-4 py-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 mb-1">
                              {thread.title}
                            </h3>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                {THREAD_CATEGORY_LABELS[thread.category]}
                              </span>
                              <span className="flex items-center gap-1 text-gray-500">
                                <MessageSquare size={14} />
                                {thread.comments_count}
                              </span>
                              <span className="text-gray-400">
                                {formatDate(thread.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {hasMoreThreads && (
                    <div className="text-center">
                      <button
                        onClick={loadMoreThreads}
                        className="px-6 py-2 text-rose-500 hover:text-rose-600 text-sm font-medium"
                      >
                        もっと見る
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Articles Tab */}
          {activeTab === 'articles' && (
            <div className="space-y-4">
              {results.articles.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                  <BookOpen size={40} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500">該当する記事が見つかりませんでした</p>
                </div>
              ) : (
                <>
                  <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-100">
                    {results.articles.map((article) => (
                      <Link
                        key={article.id}
                        href={`/articles/${article.slug}`}
                        className="block px-4 py-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          {article.thumbnail_url && (
                            <div className="relative w-20 h-14 shrink-0">
                              <Image
                                src={article.thumbnail_url}
                                alt={article.title}
                                fill
                                sizes="80px"
                                className="object-cover rounded"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 mb-1">
                              {article.title}
                            </h3>
                            {article.excerpt && (
                              <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                                {truncateText(article.excerpt, 100)}
                              </p>
                            )}
                            <div className="flex items-center gap-2 text-sm">
                              <span className="px-2 py-0.5 bg-rose-50 text-rose-500 rounded text-xs">
                                {ARTICLE_CATEGORY_LABELS[article.category]}
                              </span>
                              <span className="text-gray-400">
                                {article.published_at
                                  ? formatDate(article.published_at)
                                  : formatDate(article.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {hasMoreArticles && (
                    <div className="text-center">
                      <button
                        onClick={loadMoreArticles}
                        className="px-6 py-2 text-rose-500 hover:text-rose-600 text-sm font-medium"
                      >
                        もっと見る
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
