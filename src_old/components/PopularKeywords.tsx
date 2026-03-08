import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { supabasePublic } from '../lib/supabase'
import { PopularKeyword } from '../types/database'
import { TrendingUp, Loader2 } from 'lucide-react'

// 糖尿病関連のキーワードプール（ローテーション用）
const KEYWORD_POOL = [
  'HbA1c', '血糖値', 'インスリン', '糖質制限', '低糖質レシピ',
  'リブレ', 'フリースタイルリブレ', 'インスリンポンプ', 'SGLT2阻害薬',
  '1型糖尿病', '2型糖尿病', '妊娠糖尿病', '境界型',
  '食後血糖', '空腹時血糖', 'スパイク', '低血糖', '高血糖',
  '合併症', '網膜症', '腎症', '神経障害', 'フットケア',
  '運動療法', 'ウォーキング', '筋トレ', '有酸素運動',
  '食事療法', 'カーボカウント', 'GI値', '糖質量',
  'メトホルミン', 'DPP-4阻害薬', 'GLP-1',
  'CGM', '血糖測定器', 'ケトン体', 'ケトアシドーシス',
  'シックデイ', '旅行', '外食', 'コンビニ食',
  '間食', 'おやつ', 'スイーツ', '糖質オフ',
  'ストレス', 'メンタル', '不安', '相談',
]

// 3日ごとにキーワードをシャッフルして8個選択
function getRotatedKeywords(): string[] {
  const now = new Date()
  // 3日ごとにシード値を変える
  const seed = Math.floor(now.getTime() / (1000 * 60 * 60 * 24 * 3))

  // シード値を使って擬似ランダムにシャッフル
  const shuffled = [...KEYWORD_POOL]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.abs((seed * (i + 1) * 9973) % (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  return shuffled.slice(0, 6)
}

export function PopularKeywords() {
  const [keywords, setKeywords] = useState<PopularKeyword[]>([])
  const [loading, setLoading] = useState(true)

  // フォールバック用のローテーションキーワード
  const fallbackKeywords = useMemo(() => getRotatedKeywords(), [])

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
      const { data, error } = await supabasePublic
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

  // DBにキーワードがなければフォールバックを使用
  const displayKeywords = keywords.length > 0
    ? keywords.map(k => k.keyword)
    : fallbackKeywords

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
        <div className="flex flex-wrap gap-2">
          {displayKeywords.map((keyword, index) => (
            <Link
              key={keyword}
              to={`/search?q=${encodeURIComponent(keyword)}`}
              className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm transition-colors ${
                index < 3
                  ? 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {keyword}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
