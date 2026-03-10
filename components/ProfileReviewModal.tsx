'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Activity } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase'

interface ProfileSnapshot {
  diabetes_type: string | null
  treatment_methods: string[] | null
  last_profile_reviewed_at: string | null
}

interface LatestRecord {
  value: number
  recorded_at: string
}

function shouldShow(lastReviewedAt: string | null): boolean {
  if (!lastReviewedAt) return true
  const diff = (Date.now() - new Date(lastReviewedAt).getTime()) / (1000 * 60 * 60 * 24)
  return diff >= 30
}

const DIABETES_TYPE_LABEL: Record<string, string> = {
  type1: '1型糖尿病',
  type2: '2型糖尿病',
  gestational: '妊娠糖尿病',
  other: 'その他',
  unknown: '不明',
}

export function ProfileReviewModal() {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [open, setOpen] = useState(false)
  const [profile, setProfile] = useState<ProfileSnapshot | null>(null)
  const [hba1c, setHba1c] = useState<LatestRecord | null>(null)
  const [weight, setWeight] = useState<LatestRecord | null>(null)

  useEffect(() => {
    if (!user) return

    ;(async () => {
      const [profRes, hba1cRes, weightRes] = await Promise.all([
        supabase
          .from('extended_user_profiles')
          .select('diabetes_type, treatment_methods, last_profile_reviewed_at')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('hba1c_records')
          .select('value, recorded_at')
          .eq('user_id', user.id)
          .order('recorded_at', { ascending: false })
          .limit(1),
        supabase
          .from('weight_records')
          .select('value, recorded_at')
          .eq('user_id', user.id)
          .order('recorded_at', { ascending: false })
          .limit(1),
      ])

      const p = profRes.data
      if (shouldShow(p?.last_profile_reviewed_at ?? null)) {
        setProfile(p ?? { diabetes_type: null, treatment_methods: null, last_profile_reviewed_at: null })
        setHba1c(hba1cRes.data?.[0] ?? null)
        setWeight(weightRes.data?.[0] ?? null)
        // 少し遅延させてページ読み込み後に表示
        setTimeout(() => setOpen(true), 1500)
      }
    })()
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleNoChange() {
    if (!user) return
    await supabase
      .from('extended_user_profiles')
      .upsert({ user_id: user.id, last_profile_reviewed_at: new Date().toISOString() })
    setOpen(false)
  }

  function handleUpdate() {
    setOpen(false)
    router.push('/mypage')
  }

  if (!open || !user) return null

  const formatMonth = (dateStr: string) => {
    const d = new Date(dateStr)
    return `${d.getMonth() + 1}月`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        {/* アイコン＋タイトル */}
        <div className="flex flex-col items-center mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
            <Activity className="w-6 h-6 text-blue-500" />
          </div>
          <h2 className="text-lg font-bold text-gray-800">プロフィール確認のお願い</h2>
          <p className="text-xs text-gray-500 mt-1 text-center">
            最新の情報に更新することで、同じ状況のユーザーとつながりやすくなります。
          </p>
        </div>

        {/* 現在の登録情報 */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-2 mb-5 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">糖尿病タイプ</span>
            <span className="font-medium text-gray-700">
              {profile?.diabetes_type ? DIABETES_TYPE_LABEL[profile.diabetes_type] ?? profile.diabetes_type : '未登録'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">治療方法</span>
            <span className="font-medium text-gray-700">
              {profile?.treatment_methods?.length ? profile.treatment_methods.join('・') : '未登録'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">最新HbA1c</span>
            <span className="font-medium text-gray-700">
              {hba1c ? `${hba1c.value}%（${formatMonth(hba1c.recorded_at)}）` : '未登録'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">最新体重</span>
            <span className="font-medium text-gray-700">
              {weight ? `${weight.value}kg（${formatMonth(weight.recorded_at)}）` : '未登録'}
            </span>
          </div>
        </div>

        {/* ボタン */}
        <div className="flex gap-3">
          <button
            onClick={handleNoChange}
            className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition"
          >
            変更なし
          </button>
          <button
            onClick={handleUpdate}
            className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white text-sm font-medium hover:bg-rose-600 transition"
          >
            更新する
          </button>
        </div>
      </div>
    </div>
  )
}
