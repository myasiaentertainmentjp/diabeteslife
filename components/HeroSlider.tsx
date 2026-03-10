'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

const slides = [
  {
    id: 1,
    eyebrow: 'D-LIFEとは',
    title: '糖尿病と向き合う\nすべての人へ',
    body: '患者さん・ご家族・支える人たちが\n安心して話せる場所がここにあります。',
    cta: { label: 'トピックを見る', href: '/threads' },
    accent: '#be185d',
    bgClass: 'hero-s1',
  },
  {
    id: 2,
    eyebrow: 'コミュニティ',
    title: 'ひとりじゃないと\n気づける場所',
    body: '食事・薬・日常の悩みを\n同じ経験を持つ仲間と共有できます。',
    cta: { label: 'トピックを見る', href: '/threads' },
    accent: '#c2410c',
    bgClass: 'hero-s2',
  },
  {
    id: 3,
    eyebrow: '健康記録',
    title: '毎月の記録が\n未来の自分を守る',
    body: 'HbA1cや体重を継続して記録するだけ。\nデータの積み重ねが改善への近道です。',
    cta: { label: '記録してみる', href: '/mypage' },
    accent: '#0f4c81',
    bgClass: 'hero-s3',
  },
  {
    id: 4,
    eyebrow: 'まずは登録',
    title: 'あなたの経験が\n誰かの力になる',
    body: '登録無料・匿名OK。\nあなたの一言が同じ悩みを持つ誰かを救います。',
    cta: { label: '無料で始める', href: '/register' },
    accent: '#4c1d95',
    bgClass: 'hero-s4',
  },
]

export function HeroSlider() {
  const [current, setCurrent] = useState(0)
  const [fading, setFading] = useState(false)

  const goTo = useCallback((idx: number) => {
    setFading(true)
    setTimeout(() => {
      setCurrent(idx)
      setFading(false)
    }, 250)
  }, [])

  useEffect(() => {
    const t = setInterval(() => {
      goTo((current + 1) % slides.length)
    }, 5000)
    return () => clearInterval(t)
  }, [current, goTo])

  const s = slides[current]

  return (
    <>
      <style>{`
        .hero-s1{background-color:#be185d;background-image:radial-gradient(circle at 20% 50%,rgba(251,113,133,.35) 0%,transparent 55%),radial-gradient(circle at 80% 10%,rgba(159,18,57,.5) 0%,transparent 45%),url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='30' cy='30' r='1.5' fill='%23fff' fill-opacity='.06'/%3E%3C/svg%3E")}
        .hero-s2{background-color:#9a3412;background-image:radial-gradient(ellipse at 70% 80%,rgba(251,146,60,.45) 0%,transparent 50%),radial-gradient(ellipse at 10% 20%,rgba(154,52,18,.6) 0%,transparent 40%),url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v1H0zM0 20h40v1H0zM0 0v40h1V0zM20 0v40h1V0z' fill='%23fff' fill-opacity='.05'/%3E%3C/svg%3E")}
        .hero-s3{background-color:#0f4c81;background-image:radial-gradient(circle at 50% 0%,rgba(56,189,248,.3) 0%,transparent 60%),radial-gradient(circle at 90% 90%,rgba(14,165,233,.2) 0%,transparent 40%),url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='40' cy='40' r='38' stroke='%23fff' stroke-opacity='.05' stroke-width='1' fill='none'/%3E%3Ccircle cx='40' cy='40' r='20' stroke='%23fff' stroke-opacity='.05' stroke-width='1' fill='none'/%3E%3C/svg%3E")}
        .hero-s4{background-color:#4c1d95;background-image:linear-gradient(135deg,rgba(124,58,237,.8) 0%,rgba(76,29,149,1) 50%,rgba(139,92,246,.4) 100%),url("data:image/svg+xml,%3Csvg width='52' height='26' viewBox='0 0 52 26' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 10c0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6h2c0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6' fill='%23fff' fill-opacity='.05'/%3E%3C/svg%3E")}
        .hero-fade{transition:opacity .25s ease,transform .25s ease}
        .hero-fade.out{opacity:0;transform:translateY(8px)}
        .hero-fade.in{opacity:1;transform:translateY(0)}
      `}</style>

      <div className={`relative w-full overflow-hidden ${s.bgClass}`} style={{minHeight:280}}>
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-10 blur-3xl pointer-events-none" style={{background:'white',transform:'translate(35%,-35%)'}}/>
        <div className="absolute bottom-0 left-0 w-52 h-52 rounded-full opacity-10 blur-2xl pointer-events-none" style={{background:'white',transform:'translate(-35%,35%)'}}/>

        <div className={`relative z-10 px-6 pt-8 pb-10 max-w-lg mx-auto hero-fade ${fading ? 'out' : 'in'}`}>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-4 h-px bg-white opacity-60"/>
            <span className="text-white text-xs tracking-widest uppercase opacity-75 font-medium">{s.eyebrow}</span>
          </div>

          <h2 className="text-white font-bold leading-snug mb-3" style={{fontSize:'clamp(1.45rem,5vw,2rem)',whiteSpace:'pre-line'}}>
            {s.title}
          </h2>

          <p className="text-white opacity-75 text-sm leading-relaxed mb-6" style={{whiteSpace:'pre-line'}}>
            {s.body}
          </p>

          <Link href={s.cta.href}
            className="inline-flex items-center gap-2 bg-white rounded-full px-5 py-2.5 text-sm font-bold transition-all hover:scale-105 active:scale-95"
            style={{color:s.accent}}>
            {s.cta.label}
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
        </div>

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          {slides.map((_,i) => (
            <button key={i} onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-300 ${i===current?'bg-white w-5 h-2':'bg-white opacity-40 w-2 h-2'}`}
              aria-label={`スライド${i+1}`}/>
          ))}
        </div>

        <div className="absolute top-3 right-4 z-20">
          <span className="text-white opacity-40 text-xs font-mono">{String(current+1).padStart(2,'0')}/{String(slides.length).padStart(2,'0')}</span>
        </div>
      </div>
    </>
  )
}
