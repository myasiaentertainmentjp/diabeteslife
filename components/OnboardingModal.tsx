'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase'
import {
  Heart, Users, BarChart2, ChevronRight, ChevronLeft,
  X, CheckCircle2
} from 'lucide-react'

// 糖尿病種別
const DIABETES_TYPES = [
  { value: 'type1', label: '1型糖尿病', desc: 'インスリン依存型' },
  { value: 'type2', label: '2型糖尿病', desc: '生活習慣型' },
  { value: 'prediabetes', label: '糖尿病予備群', desc: '境界型・予備群' },
  { value: 'gestational', label: '妊娠糖尿病', desc: '妊娠中の糖尿病' },
  { value: 'family', label: '家族・サポーター', desc: '患者を支える立場' },
]

// 年代
const AGE_GROUPS = [
  { value: '10s', label: '10代' },
  { value: '20s', label: '20代' },
  { value: '30s', label: '30代' },
  { value: '40s', label: '40代' },
  { value: '50s', label: '50代' },
  { value: '60s', label: '60代' },
  { value: '70s_plus', label: '70代以上' },
]

// 治療法
const TREATMENT_TYPES = [
  { value: 'insulin', label: 'インスリン注射' },
  { value: 'oral', label: '経口薬' },
  { value: 'glp1', label: 'GLP-1注射' },
  { value: 'diet_exercise', label: '食事・運動のみ' },
  { value: 'none', label: '未治療・経過観察' },
]

const STEPS = [
  {
    id: 1,
    title: 'ようこそ、ディーライフへ！',
    subtitle: 'あなたのことを教えてください',
    desc: '同じ状況の仲間を見つけやすくなります。あとでマイページからいつでも変更できます。',
    icon: Heart,
    color: 'rose',
  },
  {
    id: 2,
    title: '治療法と年代を教えてください',
    subtitle: 'より的確な情報をお届けします',
    desc: '入力は任意です。スキップもできます。',
    icon: Users,
    color: 'blue',
  },
  {
    id: 3,
    title: '準備完了です！',
    subtitle: 'ディーライフへようこそ',
    desc: 'まずはトピックを見てみましょう。あなたと同じ悩みを持つ仲間がいます。',
    icon: BarChart2,
    color: 'emerald',
  },
]

export function OnboardingModal() {
  const { user } = useAuth()
  const supabase = createClient()

  const [show, setShow] = useState(false)
  const [step, setStep] = useState(1)
  const [diabetesType, setDiabetesType] = useState<string>('')
  const [ageGroup, setAgeGroup] = useState<string>('')
  const [treatments, setTreatments] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    // オンボーディング完了フラグを確認
    const key = `onboarding_done_${user.id}`
    if (localStorage.getItem(key)) return

    // プロフィールが未入力かチェック
    supabase
      .from('user_profiles')
      .select('diabetes_type, age_group')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        // diabetes_typeが未設定の場合のみオンボーディングを表示
        if (!data?.diabetes_type) {
          // 登録から5秒後に表示（画面遷移後に自然に出る）
          setTimeout(() => setShow(true), 1500)
        } else {
          // 入力済みならフラグを立てておく
          localStorage.setItem(key, '1')
        }
      })
  }, [user])

  function toggleTreatment(value: string) {
    setTreatments(prev =>
      prev.includes(value) ? prev.filter(t => t !== value) : [...prev, value]
    )
  }

  async function handleSave() {
    if (!user) return
    setSaving(true)

    await supabase
      .from('user_profiles')
      .upsert({
        user_id: user.id,
        diabetes_type: diabetesType || null,
        age_group: ageGroup || null,
        treatment_methods: treatments.length > 0 ? treatments : null,
      }, { onConflict: 'user_id' })

    localStorage.setItem(`onboarding_done_${user.id}`, '1')
    setSaving(false)
    setShow(false)
  }

  function handleSkip() {
    if (!user) return
    localStorage.setItem(`onboarding_done_${user.id}`, '1')
    setShow(false)
  }

  function handleNext() {
    if (step < 3) {
      setStep(step + 1)
    } else {
      handleSave()
    }
  }

  if (!show || !user) return null

  const currentStep = STEPS[step - 1]
  const Icon = currentStep.icon
  const colorMap: Record<string, string> = {
    rose: 'bg-rose-500',
    blue: 'bg-blue-500',
    emerald: 'bg-emerald-500',
  }
  const bgColor = colorMap[currentStep.color]

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl">

        {/* ヘッダー */}
        <div className={`${bgColor} px-6 pt-8 pb-6 text-white relative`}>
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 p-1 text-white/70 hover:text-white"
          >
            <X size={20} />
          </button>

          {/* ステップインジケーター */}
          <div className="flex gap-1.5 mb-4">
            {STEPS.map(s => (
              <div
                key={s.id}
                className={`h-1 rounded-full flex-1 transition-all ${
                  s.id <= step ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <Icon size={24} className="text-white" />
            </div>
            <div>
              <p className="text-white/80 text-xs font-medium">STEP {step} / {STEPS.length}</p>
              <h2 className="text-lg font-bold leading-tight">{currentStep.title}</h2>
            </div>
          </div>
          <p className="text-white/80 text-sm mt-2">{currentStep.desc}</p>
        </div>

        {/* コンテンツ */}
        <div className="px-6 py-5">
          {step === 1 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">糖尿病の種別（任意）</p>
              <div className="space-y-2">
                {DIABETES_TYPES.map(dt => (
                  <button
                    key={dt.value}
                    onClick={() => setDiabetesType(dt.value === diabetesType ? '' : dt.value)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all text-left ${
                      diabetesType === dt.value
                        ? 'border-rose-500 bg-rose-50'
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div>
                      <p className={`font-medium text-sm ${diabetesType === dt.value ? 'text-rose-600' : 'text-gray-800'}`}>
                        {dt.label}
                      </p>
                      <p className="text-xs text-gray-400">{dt.desc}</p>
                    </div>
                    {diabetesType === dt.value && (
                      <CheckCircle2 size={18} className="text-rose-500 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              {/* 年代 */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">年代（任意）</p>
                <div className="flex flex-wrap gap-2">
                  {AGE_GROUPS.map(ag => (
                    <button
                      key={ag.value}
                      onClick={() => setAgeGroup(ag.value === ageGroup ? '' : ag.value)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all border-2 ${
                        ageGroup === ag.value
                          ? 'border-blue-500 bg-blue-50 text-blue-600'
                          : 'border-gray-100 text-gray-600 hover:border-gray-200'
                      }`}
                    >
                      {ag.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 治療法 */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">治療法（任意・複数選択可）</p>
                <div className="space-y-2">
                  {TREATMENT_TYPES.map(t => (
                    <button
                      key={t.value}
                      onClick={() => toggleTreatment(t.value)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border-2 transition-all text-left ${
                        treatments.includes(t.value)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <span className={`text-sm font-medium ${treatments.includes(t.value) ? 'text-blue-600' : 'text-gray-700'}`}>
                        {t.label}
                      </span>
                      {treatments.includes(t.value) && (
                        <CheckCircle2 size={16} className="text-blue-500 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-4">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={40} className="text-emerald-500" />
              </div>
              <p className="text-gray-700 text-sm leading-relaxed mb-4">
                プロフィールの設定が完了しました！<br />
                同じ状況の仲間と交流してみましょう。
              </p>
              {diabetesType && (
                <div className="bg-gray-50 rounded-xl px-4 py-3 text-left space-y-1.5">
                  {diabetesType && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 size={14} className="text-emerald-500" />
                      {DIABETES_TYPES.find(d => d.value === diabetesType)?.label}
                    </div>
                  )}
                  {ageGroup && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 size={14} className="text-emerald-500" />
                      {AGE_GROUPS.find(a => a.value === ageGroup)?.label}
                    </div>
                  )}
                  {treatments.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 size={14} className="text-emerald-500" />
                      {treatments.map(t => TREATMENT_TYPES.find(tt => tt.value === t)?.label).join('・')}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="px-6 pb-8 flex gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1 px-4 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft size={16} />
              <span className="text-sm">戻る</span>
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={saving}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-white rounded-xl font-medium transition-colors ${bgColor} hover:opacity-90`}
          >
            <span>{step === 3 ? 'はじめる' : '次へ'}</span>
            {step < 3 && <ChevronRight size={16} />}
          </button>
        </div>

        {/* スキップ */}
        {step < 3 && (
          <div className="text-center pb-4 -mt-2">
            <button onClick={handleSkip} className="text-xs text-gray-400 hover:text-gray-600">
              スキップする
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
