import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { PopularKeyword } from '../types/database'
import { TrendingUp, Loader2 } from 'lucide-react'

export function PopularKeywords() {
  const [keywords, setKeywords] = useState<PopularKeyword[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPopularKeywords()
  }, [])

  async function fetchPopularKeywords() {
    // 3秒タイムアウト
    const timeoutId = setTimeout(() => {
      setLoading(false)
      setKeywords([])
    }, 3000)

    try {
      const { data, error } = await supabase
        .from('popular_keywords')
        .select('id, keyword, display_order, is_active')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .limit(15)

      clearTimeout(timeoutId)

      if (error) {
        console.error('Error fetching popular keywords:', error)
        setKeywords([])
      } else {
        setKeywords(data || [])
      }
    } catch (error) {
      clearTimeout(timeoutId)
      console.error('Error fetching popular keywords:', error)
      setKeywords([])
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
            キーワードがありません
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {keywords.map((item, index) => (
              <Link
                key={item.id}
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
