'use client'

import { useEffect, useState } from 'react'
import { X, ChevronRight } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase'

type Step = 'diabetes_type' | 'treatment' | 'hba1c' | 'weight'
const STEPS: Step[] = ['diabetes_type', 'treatment', 'hba1c', 'weight']

const STEP_TITLE: Record<Step, string> = {
  diabetes_type: '糖尿病タイプ',
  treatment: '治療方法',
  hba1c: '最新HbA1c',
  weight: '最新体重',
}

const STEP_DESC: Record<Step, string> = {
  diabetes_type: '今月も変わりはありませんか？',
  treatment: '治療方法に変更はありましたか？',
  hba1c: '今月のHbA1cを記録しましょう',
  weight: '今月の体重を記録しましょう',
}

const DIABETES_OPTIONS = [
  { value: 'type1', label: '1型' },
  { value: 'type2', label: '2型' },
  { value: 'gestational', label: '妊娠糖尿病' },
  { value: 'other', label: 'その他' },
]

const TREATMENT_OPTIONS = [
  { value: 'insulin', label: 'インスリン' },
  { value: 'oral', label: '経口薬' },
  { value: 'diet', label: '食事療法' },
  { value: 'exercise', label: '運動療法' },
  { value: 'cgm', label: 'CGM' },
  { value: 'none', label: '治療なし' },
]

function shouldShow(lastReviewedAt: string | null, snoozedUntil: string | null): boolean {
  const now = Date.now()
  if (snoozedUntil && new Date(snoozedUntil).getTime() > now) return false
  if (!lastReviewedAt) return true
  const diff = (now - new Date(lastReviewedAt).getTime()) / (1000 * 60 * 60 * 24)
  return diff >= 30
}

function getMonthLabel(): string {
  const d = new Date()
  return `${d.getMonth() + 1}月`
}

export function ProfileReviewModal() {
  const { user } = useAuth()
  const supabase = createClient()

  const [open, setOpen] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [changing, setChanging] = useState(false)

  const [diabetesType, setDiabetesType] = useState<string | null>(null)
  const [treatments, setTreatments] = useState<string[]>([])
  const [hba1cVal, setHba1cVal] = useState('')
  const [weightVal, setWeightVal] = useState('')
  const [changed, setChanged] = useState<Record<Step, boolean>>({
    diabetes_type: false, treatment: false, hba1c: false, weight: false,
  })

  useEffect(() => {
    if (!user) return
    ;(async () => {
      const { data: p } = await supabase
        .from('extended_user_profiles')
        .select('diabetes_type, treatment_methods, last_profile_reviewed_at, snooze_until')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!shouldShow(p?.last_profile_reviewed_at ?? null, p?.snooze_until ?? null)) return

      setDiabetesType(p?.diabetes_type ?? null)
      setTreatments(p?.treatment_methods ?? [])
      setTimeout(() => setOpen(true), 1500)
    })()
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  const currentStep = STEPS[stepIndex]
  const isLast = stepIndex === STEPS.length - 1

  async function handleSnooze() {
    if (!user) return
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    await supabase.from('extended_user_profiles').upsert({ user_id: user.id, snooze_until: tomorrow })
    setOpen(false)
  }

  function handleNoChange() {
    setChanging(false)
    goNext()
  }

  function goNext() {
    setChanging(false)
    if (isLast) {
      handleFinish()
    } else {
      setStepIndex(i => i + 1)
    }
  }

  async function handleFinish() {
    if (!user) return
    const updates: Record<string, unknown> = {
      user_id: user.id,
      last_profile_reviewed_at: new Date().toISOString(),
      snooze_until: null,
    }
    if (changed.diabetes_type) updates.diabetes_type = diabetesType
    if (changed.treatment) updates.treatment_methods = treatments
    await supabase.from('extended_user_profiles').upsert(updates)
    if (changed.hba1c && hba1cVal) {
      await supabase.from('hba1c_records').insert({
        user_id: user.id, value: parseFloat(hba1cVal),
        recorded_at: new Date().toISOString().split('T')[0],
      })
    }
    if (changed.weight && weightVal) {
      await supabase.from('weight_records').insert({
        user_id: user.id, value: parseFloat(weightVal),
        recorded_at: new Date().toISOString().split('T')[0],
      })
    }
    setOpen(false)
  }

  function toggleTreatment(val: string) {
    setTreatments(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val])
  }

  if (!open || !user) return null

  const progress = ((stepIndex + 1) / STEPS.length) * 100

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">

        {/* ヘッダー */}
        <div className="px-5 pt-5 pb-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-rose-400 font-medium">{getMonthLabel()}の健康記録</p>
              <h2 className="text-base font-bold text-gray-800">{STEP_TITLE[currentStep]}</h2>
            </div>
            <button onClick={handleSnooze} className="text-gray-300 hover:text-gray-500 transition p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
          {/* プログレスバー */}
          <div className="w-full bg-gray-100 rounded-full h-1 mb-1">
            <div
              className="bg-rose-400 h-1 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-right text-xs text-gray-400">{stepIndex + 1} / {STEPS.length}</p>
        </div>

        {/* コンテンツ */}
        <div className="px-5 pb-6">
          {!changing ? (
            <div>
              <p className="text-sm text-gray-500 mb-5">{STEP_DESC[currentStep]}</p>
              <div className="flex gap-3">
                <button
                  onClick={handleNoChange}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm font-medium hover:bg-gray-50 transition"
                >
                  変更なし
                </button>
                <button
                  onClick={() => setChanging(true)}
                  className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white text-sm font-medium hover:bg-rose-600 transition flex items-center justify-center gap-1"
                >
                  変更あり <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div>
              {currentStep === 'diabetes_type' && (
                <div className="grid grid-cols-2 gap-2 mb-5">
                  {DIABETES_OPTIONS.map(opt => (
                    <button key={opt.value}
                      onClick={() => { setDiabetesType(opt.value); setChanged(c => ({ ...c, diabetes_type: true })) }}
                      className={`py-3 rounded-xl text-sm font-medium border-2 transition ${diabetesType === opt.value ? 'border-rose-500 bg-rose-50 text-rose-600' : 'border-gray-200 text-gray-600 hover:border-rose-300'}`}
                    >{opt.label}</button>
                  ))}
                </div>
              )}

              {currentStep === 'treatment' && (
                <div className="grid grid-cols-2 gap-2 mb-5">
                  {TREATMENT_OPTIONS.map(opt => (
                    <button key={opt.value}
                      onClick={() => { toggleTreatment(opt.value); setChanged(c => ({ ...c, treatment: true })) }}
                      className={`py-3 rounded-xl text-sm font-medium border-2 transition ${treatments.includes(opt.value) ? 'border-rose-500 bg-rose-50 text-rose-600' : 'border-gray-200 text-gray-600 hover:border-rose-300'}`}
                    >{opt.label}</button>
                  ))}
                </div>
              )}

              {currentStep === 'hba1c' && (
                <div className="flex items-center gap-3 mb-5 justify-center">
                  <input type="number" step="0.1" min="3" max="20"
                    value={hba1cVal}
                    onChange={e => { setHba1cVal(e.target.value); setChanged(c => ({ ...c, hba1c: true })) }}
                    placeholder="6.8"
                    className="w-32 text-4xl font-bold text-center border-b-2 border-rose-300 focus:border-rose-500 outline-none py-2 text-gray-800"
                  />
                  <span className="text-xl text-gray-500 font-medium">%</span>
                </div>
              )}

              {currentStep === 'weight' && (
                <div className="flex items-center gap-3 mb-5 justify-center">
                  <input type="number" step="0.1" min="20" max="300"
                    value={weightVal}
                    onChange={e => { setWeightVal(e.target.value); setChanged(c => ({ ...c, weight: true })) }}
                    placeholder="68.5"
                    className="w-32 text-4xl font-bold text-center border-b-2 border-rose-300 focus:border-rose-500 outline-none py-2 text-gray-800"
                  />
                  <span className="text-xl text-gray-500 font-medium">kg</span>
                </div>
              )}

              <button onClick={goNext}
                className="w-full py-2.5 rounded-xl bg-rose-500 text-white text-sm font-medium hover:bg-rose-600 transition"
              >
                {isLast ? '完了' : '次へ'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
