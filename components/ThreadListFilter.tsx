'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import {
  THREAD_CATEGORY_LABELS,
  ThreadCategory,
} from '@/types/database'
import { PenSquare, ChevronLeft, ChevronRight, Filter } from 'lucide-react'

interface ThreadListFilterProps {
  category?: string
}

const categories: ThreadCategory[] = [
  'todays_meal',
  'food_recipe',
  'treatment',
  'exercise_lifestyle',
  'mental_concerns',
  'complications_prevention',
  'chat_other',
]

export function ThreadListFilter({
  category,
}: ThreadListFilterProps) {
  const { user } = useAuth()
  const router = useRouter()

  function handleCategoryChange(cat: string | undefined) {
    if (cat) {
      router.push(`/threads?category=${cat}`)
    } else {
      router.push('/threads')
    }
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          {category
            ? THREAD_CATEGORY_LABELS[category as ThreadCategory]
            : 'トピック一覧'}
        </h1>
        {user && (
          <Link
            href="/threads/new"
            className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors font-medium"
          >
            <PenSquare size={18} />
            <span>新規投稿</span>
          </Link>
        )}
      </div>

      {/* Category Filter */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={16} className="text-gray-500" />
          <span className="text-sm font-medium text-gray-700">カテゴリー</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleCategoryChange(undefined)}
            className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
              !category
                ? 'bg-rose-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            すべて
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                category === cat
                  ? 'bg-rose-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {THREAD_CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

interface PaginationProps {
  totalPages: number
  currentPage: number
  category?: string
}

export function Pagination({ totalPages, currentPage, category }: PaginationProps) {
  const router = useRouter()

  function handlePageChange(page: number) {
    const params = new URLSearchParams()
    if (category) params.set('category', category)
    params.set('page', page.toString())
    router.push(`/threads?${params.toString()}`)
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-2 px-4 py-4 border-t border-gray-100">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft size={20} />
      </button>
      <span className="text-sm text-gray-600">
        {currentPage} / {totalPages}
      </span>
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  )
}
