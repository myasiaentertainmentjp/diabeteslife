'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase'
import { uploadImage } from '@/lib/imageUpload'
import { ArrowLeft, Camera, Loader2, X } from 'lucide-react'

const TAGS = ['低糖質', '外食', '手作り', 'コンビニ', '間食', '糖質オフ', 'ヘルシー']

export default function MealsNewPage() {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [caption, setCaption] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [bloodSugar, setBloodSugar] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!user) {
    router.push('/login?redirect=/meals/new')
    return null
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  function toggleTag(tag: string) {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!imageFile) { setError('写真を選択してください'); return }
    setSubmitting(true)
    setError('')

    try {
      const imageUrl = await uploadImage(imageFile, 'meal-photos')
      const { error: insertError } = await supabase.from('meal_posts').insert({
        user_id: user.id,
        image_url: imageUrl,
        caption: caption.trim() || null,
        tags: selectedTags,
        blood_sugar_after: bloodSugar ? parseInt(bloodSugar) : null,
        is_public: isPublic,
      })
      if (insertError) throw insertError
      router.push('/meals')
    } catch (err) {
      setError('投稿に失敗しました。もう一度お試しください。')
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <Link href="/meals" className="inline-flex items-center gap-2 text-gray-600 hover:text-rose-500 mb-6">
        <ArrowLeft size={20} />
        <span>食事の記録に戻る</span>
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">食事を投稿する</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 画像選択 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">写真 <span className="text-rose-500">*</span></label>
          {imagePreview ? (
            <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
              <Image src={imagePreview} alt="プレビュー" fill className="object-cover" />
              <button
                type="button"
                onClick={() => { setImagePreview(null); setImageFile(null) }}
                className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed border-gray-300 cursor-pointer hover:border-rose-400 hover:bg-rose-50 transition-colors">
              <Camera size={40} className="text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">タップして写真を選択</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
            </label>
          )}
        </div>

        {/* キャプション */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">一言コメント（任意）</label>
          <textarea
            value={caption}
            onChange={e => setCaption(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-rose-400 outline-none resize-none text-sm"
            placeholder="今日のランチ。低糖質を意識して野菜多めにしました！"
          />
        </div>

        {/* タグ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">タグ（任意・複数選択可）</label>
          <div className="flex flex-wrap gap-2">
            {TAGS.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-rose-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>

        {/* 食後血糖値 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">食後血糖値（任意・mg/dL）</label>
          <input
            type="number"
            value={bloodSugar}
            onChange={e => setBloodSugar(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-rose-400 outline-none text-sm"
            placeholder="例: 145"
            min="50"
            max="600"
          />
        </div>

        {/* 公開設定 */}
        <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
          <div>
            <p className="text-sm font-medium text-gray-700">みんなに公開する</p>
            <p className="text-xs text-gray-500">オフにすると自分だけが見られます</p>
          </div>
          <button
            type="button"
            onClick={() => setIsPublic(!isPublic)}
            className={`w-12 h-6 rounded-full transition-colors relative ${isPublic ? 'bg-rose-500' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${isPublic ? 'left-7' : 'left-1'}`} />
          </button>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={submitting || !imageFile}
          className="w-full flex items-center justify-center gap-2 py-3 bg-rose-500 text-white rounded-lg font-medium hover:bg-rose-600 disabled:bg-gray-300 transition-colors"
        >
          {submitting && <Loader2 size={18} className="animate-spin" />}
          {submitting ? '投稿中...' : '投稿する'}
        </button>
      </form>
    </div>
  )
}
