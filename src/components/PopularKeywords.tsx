import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { TrendingUp, Loader2 } from 'lucide-react'

interface PopularKeyword {
  keyword: string
  count: number
}

export function PopularKeywords() {
  const [keywords, setKeywords] = useState<PopularKeyword[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPopularKeywords()
  }, [])

  async function fetchPopularKeywords() {
    try {
      // Get searches from the past 7 days
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const { data, error } = await supabase
        .from('search_logs')
        .select('keyword')
        .gte('created_at', sevenDaysAgo.toISOString())

      if (error) {
        console.error('Error fetching popular keywords:', error)
        return
      }

      if (data) {
        // Count keyword occurrences
        const keywordCounts: Record<string, number> = {}
        data.forEach((log) => {
          const keyword = log.keyword.toLowerCase().trim()
          if (keyword) {
            keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1
          }
        })

        // Sort by count and take top 10
        const sortedKeywords = Object.entries(keywordCounts)
          .map(([keyword, count]) => ({ keyword, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10)

        setKeywords(sortedKeywords)
      }
    } catch (error) {
      console.error('Error fetching popular keywords:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp size={16} className="text-orange-500" />
            人気のキーワード
          </h2>
        </div>
        <div className="p-4 flex justify-center">
          <Loader2 size={20} className="animate-spin text-gray-400" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="px-4 py-3 border-b border-gray-100">
        <h2 className="font-bold text-gray-900 flex items-center gap-2">
          <TrendingUp size={16} className="text-orange-500" />
          人気のキーワード
        </h2>
      </div>
      <div className="p-4">
        {keywords.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-2">
            まだ検索データがありません
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {keywords.map((item, index) => (
              <Link
                key={item.keyword}
                to={`/search?q=${encodeURIComponent(item.keyword)}`}
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm transition-colors ${
                  index < 3
                    ? 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {item.keyword}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
