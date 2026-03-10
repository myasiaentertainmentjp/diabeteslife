'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase'
import { CheckCircle2, ChevronRight, X } from 'lucide-react'

// ─── 型・定数 ────────────────────────────────────────────────
type Step = 'diabetes_type' | 'illness_duration' | 'treatment' | 'basic_info' | 'done'
const STEPS: Step[] = ['diabetes_type', 'illness_duration', 'treatment', 'basic_info', 'done']

const DIABETES_OPTIONS = [
  { value: 'type1',       label: '1型糖尿病' },
  { value: 'type2',       label: '2型糖尿病' },
  { value: 'gestational', label: '妊娠糖尿病' },
  { value: 'prediabetes', label: '糖尿病予備群' },
  { value: 'family',      label: '家族・サポーター' },
  { value: 'other',       label: 'その他' },
]

const DURATION_OPTIONS = [
  { value: 'less_than_1', label: '1年未満' },
  { value: '1_to_3',      label: '1〜3年' },
  { value: '3_to_5',      label: '3〜5年' },
  { value: '5_to_10',     label: '5〜10年' },
  { value: '10_plus',     label: '10年以上' },
]

const TREATMENT_OPTIONS = [
  { value: 'insulin',          label: 'インスリン注射' },
  { value: 'insulin_pump',     label: 'インスリンポンプ' },
  { value: 'oral_medication',  label: '経口薬（飲み薬）' },
  { value: 'glp1',             label: 'GLP-1受容体作動薬' },
  { value: 'diet_therapy',     label: '食事療法' },
  { value: 'exercise_therapy', label: '運動療法' },
  { value: 'observation',      label: '経過観察中' },
  { value: 'none',             label: '該当なし' },
]

const AGE_OPTIONS = [
  { value: '10s', label: '10代' },
  { value: '20s', label: '20代' },
  { value: '30s', label: '30代' },
  { value: '40s', label: '40代' },
  { value: '50s', label: '50代' },
  { value: '60s', label: '60代' },
  { value: '70s_plus', label: '70代以上' },
]

const GENDER_OPTIONS = [
  { value: 'male',   label: '男性' },
  { value: 'female', label: '女性' },
  { value: 'other',  label: 'その他' },
]

const STEP_META: Record<Step, { title: string; subtitle: string; emoji: string }> = {
  diabetes_type:    { emoji: '🩺', title: '糖尿病のタイプ',  subtitle: 'あなたの状況を教えてください' },
  illness_duration: { emoji: '📅', title: '罹患期間',        subtitle: '糖尿病と付き合って何年ですか？' },
  treatment:        { emoji: '💊', title: '治療方法',        subtitle: '現在の治療方法を選んでください（複数可）' },
  basic_info:       { emoji: '👤', title: '基本情報',        subtitle: '任意です。仲間と繋がりやすくなります' },
  done:             { emoji: '🎉', title: '登録完了！',      subtitle: 'D-LIFEへようこそ' },
}

// ─── コンポーネント ───────────────────────────────────────────
export function ProfileSetupModal() {
  const { user } = useAuth()
  const supabase = createClient()

  const [open, setOpen] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [saving, setSaving] = useState(false)
  const [animDir, setAnimDir] = useState<'forward' | 'back'>('forward')
  const [animating, setAnimating] = useState(false)

  // フォーム値
  const [diabetesType, setDiabetesType] = useState<string>('')
  const [illnessDuration, setIllnessDuration] = useState<string>('')
  const [treatments, setTreatments] = useState<string[]>([])
  const [ageGroup, setAgeGroup] = useState<string>('')
  const [gender, setGender] = useState<string>('')
  const [prefecture, setPrefecture] = useState<string>('')

  const currentStep = STEPS[stepIndex]

  // 表示判定：diabetes_typeが未設定なら初回セットアップ
  useEffect(() => {
    if (!user) return
    ;(async () => {
      const { data } = await supabase
        .from('extended_user_profiles')
        .select('diabetes_type')
        .eq('user_id', user.id)
        .maybeSingle()
      if (!data?.diabetes_type) {
        setTimeout(() => setOpen(true), 1200)
      }
    })()
  }, [user])

  const toggleTreatment = (val: string) => {
    setTreatments(prev =>
      prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]
    )
  }

  const goNext = useCallback(async () => {
    if (animating) return

    // 最終ステップ前：保存
    if (currentStep === 'basic_info') {
      setSaving(true)
      await supabase.from('extended_user_profiles').upsert({
        user_id: user!.id,
        diabetes_type: diabetesType || null,
        illness_duration: illnessDuration || null,
        treatment_methods: treatments,
        age_group: ageGroup || null,
        gender: gender || null,
        prefecture: prefecture || null,
        last_profile_reviewed_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      setSaving(false)
    }

    if (stepIndex >= STEPS.length - 1) {
      setOpen(false)
      return
    }

    // 「家族・サポーター」の場合は illness_duration ステップをスキップ
    const nextIndex = stepIndex + 1
    const nextStep = STEPS[nextIndex]
    const skipIllness = nextStep === 'illness_duration' && diabetesType === 'family'

    setAnimDir('forward')
    setAnimating(true)
    setTimeout(() => {
      setStepIndex(skipIllness ? nextIndex + 1 : nextIndex)
      setAnimating(false)
    }, 220)
  }, [animating, currentStep, stepIndex, user, diabetesType, illnessDuration, treatments, ageGroup, gender, prefecture, supabase])

  const goBack = useCallback(() => {
    if (stepIndex === 0 || animating) return
    setAnimDir('back')
    setAnimating(true)
    setTimeout(() => {
      setStepIndex(i => i - 1)
      setAnimating(false)
    }, 220)
  }, [stepIndex, animating])

  const onClose = async () => {
    // 閉じても最低限保存（diabetesTypeのみあれば）
    if (diabetesType && user) {
      await supabase.from('extended_user_profiles').upsert({
        user_id: user.id,
        diabetes_type: diabetesType,
        last_profile_reviewed_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
    }
    setOpen(false)
  }

  if (!open) return null

  const progress = stepIndex / (STEPS.length - 1)
  const meta = STEP_META[currentStep]
  const isLastInput = currentStep === 'basic_info'
  const isDone = currentStep === 'done'

  // アニメーションスタイル
  const animStyle: React.CSSProperties = animating
    ? { opacity: 0, transform: animDir === 'forward' ? 'translateX(24px)' : 'translateX(-24px)' }
    : { opacity: 1, transform: 'translateX(0)', transition: 'opacity .22s ease, transform .22s ease' }

  return (
    <>
      <style>{`
        .psetup-overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:1000;display:flex;align-items:center;justify-content:center;padding:16px}
        .psetup-card{background:white;border-radius:20px;width:100%;max-width:420px;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,.2)}
        .psetup-header{background:linear-gradient(135deg,#f43f5e,#e11d48);padding:20px 20px 16px;position:relative}
        .psetup-progress{height:4px;background:rgba(255,255,255,.3);border-radius:9999px;margin-top:12px;overflow:hidden}
        .psetup-progress-bar{height:100%;background:white;border-radius:9999px;transition:width .4s ease}
        .psetup-body{padding:24px 20px 20px}
        .psetup-chip{display:inline-flex;align-items:center;justify-content:center;padding:10px 16px;border-radius:10px;border:2px solid #e5e7eb;background:white;cursor:pointer;font-size:14px;font-weight:500;transition:all .15s;width:100%;text-align:left;color:#374151}
        .psetup-chip:hover{border-color:#f43f5e;background:#fff1f2;color:#e11d48}
        .psetup-chip.selected{border-color:#e11d48;background:#fff1f2;color:#e11d48;font-weight:600}
        .psetup-chip-multi{display:inline-flex;align-items:center;padding:8px 14px;border-radius:8px;border:2px solid #e5e7eb;background:white;cursor:pointer;font-size:13px;font-weight:500;transition:all .15s}
        .psetup-chip-multi:hover{border-color:#f43f5e}
        .psetup-chip-multi.selected{border-color:#e11d48;background:#fff1f2;color:#e11d48;font-weight:600}
        .psetup-btn-primary{width:100%;padding:13px;background:#e11d48;color:white;border-radius:12px;font-weight:700;font-size:15px;border:none;cursor:pointer;transition:background .15s;margin-top:16px}
        .psetup-btn-primary:hover{background:#be123c}
        .psetup-btn-primary:disabled{opacity:.6;cursor:not-allowed}
        .psetup-select{width:100%;padding:10px 12px;border:2px solid #e5e7eb;border-radius:10px;font-size:14px;color:#374151;outline:none;transition:border .15s}
        .psetup-select:focus{border-color:#e11d48}
      `}</style>

      <div className="psetup-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="psetup-card">
          {/* ヘッダー */}
          <div className="psetup-header">
            <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between'}}>
              <div>
                <p style={{color:'rgba(255,255,255,.75)',fontSize:'12px',marginBottom:'2px',letterSpacing:'.05em'}}>
                  プロフィール設定 {stepIndex + 1}/{STEPS.length}
                </p>
                <h2 style={{color:'white',fontSize:'20px',fontWeight:'bold'}}>
                  {meta.emoji} {meta.title}
                </h2>
                <p style={{color:'rgba(255,255,255,.85)',fontSize:'13px',marginTop:'2px'}}>{meta.subtitle}</p>
              </div>
              {!isDone && (
                <button onClick={onClose} style={{background:'rgba(255,255,255,.2)',border:'none',borderRadius:'50%',width:'32px',height:'32px',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'white',flexShrink:0}}>
                  <X size={16}/>
                </button>
              )}
            </div>
            <div className="psetup-progress">
              <div className="psetup-progress-bar" style={{width:`${progress*100}%`}}/>
            </div>
          </div>

          {/* ボディ */}
          <div className="psetup-body" style={animStyle}>

            {/* STEP 1: 糖尿病タイプ */}
            {currentStep === 'diabetes_type' && (
              <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                {DIABETES_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => setDiabetesType(opt.value)}
                    className={`psetup-chip ${diabetesType === opt.value ? 'selected' : ''}`}>
                    <span style={{marginRight:'8px'}}>{diabetesType === opt.value ? '✓' : '○'}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            {/* STEP 2: 罹患期間 */}
            {currentStep === 'illness_duration' && (
              <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                {DURATION_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => setIllnessDuration(opt.value)}
                    className={`psetup-chip ${illnessDuration === opt.value ? 'selected' : ''}`}>
                    <span style={{marginRight:'8px'}}>{illnessDuration === opt.value ? '✓' : '○'}</span>
                    {opt.label}
                  </button>
                ))}
                <button onClick={() => { setIllnessDuration(''); goNext() }}
                  style={{marginTop:'4px',fontSize:'13px',color:'#9ca3af',background:'none',border:'none',cursor:'pointer',textAlign:'left'}}>
                  スキップ →
                </button>
              </div>
            )}

            {/* STEP 3: 治療方法 */}
            {currentStep === 'treatment' && (
              <div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
                  {TREATMENT_OPTIONS.map(opt => (
                    <button key={opt.value} onClick={() => toggleTreatment(opt.value)}
                      className={`psetup-chip-multi ${treatments.includes(opt.value) ? 'selected' : ''}`}>
                      <span style={{marginRight:'6px',fontSize:'12px'}}>{treatments.includes(opt.value) ? '✓' : '+'}</span>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 4: 基本情報 */}
            {currentStep === 'basic_info' && (
              <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
                <div>
                  <label style={{fontSize:'13px',fontWeight:'600',color:'#374151',display:'block',marginBottom:'6px'}}>年代</label>
                  <select className="psetup-select" value={ageGroup} onChange={e => setAgeGroup(e.target.value)}>
                    <option value="">選択してください</option>
                    {AGE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{fontSize:'13px',fontWeight:'600',color:'#374151',display:'block',marginBottom:'6px'}}>性別</label>
                  <div style={{display:'flex',gap:'8px'}}>
                    {GENDER_OPTIONS.map(o => (
                      <button key={o.value} onClick={() => setGender(o.value)}
                        className={`psetup-chip ${gender === o.value ? 'selected' : ''}`}
                        style={{flex:1,padding:'8px'}}>
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{fontSize:'13px',fontWeight:'600',color:'#374151',display:'block',marginBottom:'6px'}}>都道府県</label>
                  <select className="psetup-select" value={prefecture} onChange={e => setPrefecture(e.target.value)}>
                    <option value="">選択してください</option>
                    {['北海道','青森県','岩手県','宮城県','秋田県','山形県','福島県','茨城県','栃木県','群馬県','埼玉県','千葉県','東京都','神奈川県','新潟県','富山県','石川県','福井県','山梨県','長野県','岐阜県','静岡県','愛知県','三重県','滋賀県','京都府','大阪府','兵庫県','奈良県','和歌山県','鳥取県','島根県','岡山県','広島県','山口県','徳島県','香川県','愛媛県','高知県','福岡県','佐賀県','長崎県','熊本県','大分県','宮崎県','鹿児島県','沖縄県'].map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <p style={{fontSize:'12px',color:'#9ca3af',marginTop:'-4px'}}>すべて任意です。後からマイページで変更できます。</p>
              </div>
            )}

            {/* STEP 5: 完了 */}
            {currentStep === 'done' && (
              <div style={{textAlign:'center',padding:'16px 0'}}>
                <div style={{fontSize:'64px',marginBottom:'12px'}}>🎉</div>
                <h3 style={{fontSize:'20px',fontWeight:'bold',color:'#111827',marginBottom:'8px'}}>
                  プロフィール設定完了！
                </h3>
                <p style={{color:'#6b7280',fontSize:'14px',lineHeight:1.7}}>
                  同じ境遇の仲間と繋がれます。<br/>
                  トピックに参加したり、日記を書いてみましょう。
                </p>
                <div style={{display:'flex',flexDirection:'column',gap:'8px',marginTop:'20px'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'8px',background:'#f0fdf4',padding:'10px 14px',borderRadius:'10px'}}>
                    <CheckCircle2 size={18} color="#16a34a"/>
                    <span style={{fontSize:'13px',color:'#166534'}}>プロフィールを保存しました</span>
                  </div>
                </div>
              </div>
            )}

            {/* ボタン */}
            {!isDone ? (
              <div>
                <button className="psetup-btn-primary" onClick={goNext} disabled={saving || (currentStep === 'diabetes_type' && !diabetesType)}>
                  {saving ? '保存中...' : isLastInput ? '完了する' : '次へ'}
                  {!saving && !isLastInput && <ChevronRight size={18} style={{display:'inline',marginLeft:'4px',verticalAlign:'middle'}}/>}
                </button>
                {stepIndex > 0 && (
                  <button onClick={goBack} style={{width:'100%',marginTop:'8px',padding:'8px',background:'none',border:'none',cursor:'pointer',color:'#9ca3af',fontSize:'13px'}}>
                    ← 戻る
                  </button>
                )}
              </div>
            ) : (
              <button className="psetup-btn-primary" onClick={() => setOpen(false)}>
                D-LIFEをはじめる 🚀
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
