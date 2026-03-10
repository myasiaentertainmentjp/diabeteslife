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
    overlay: 'rgba(190,24,93,0.72)',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&q=80&fit=crop',
  },
  {
    id: 2,
    eyebrow: 'コミュニティ',
    title: 'ひとりじゃないと\n気づける場所',
    body: '食事・薬・日常の悩みを\n同じ経験を持つ仲間と共有できます。',
    cta: { label: 'トピックを見る', href: '/threads' },
    accent: '#c2410c',
    overlay: 'rgba(154,52,18,0.70)',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=80&fit=crop',
  },
  {
    id: 3,
    eyebrow: '健康記録',
    title: '毎月の記録が\n未来の自分を守る',
    body: 'HbA1cや体重を継続して記録するだけ。\nデータの積み重ねが改善への近道です。',
    cta: { label: '記録してみる', href: '/mypage' },
    accent: '#0f4c81',
    overlay: 'rgba(15,76,129,0.72)',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&q=80&fit=crop',
  },
  {
    id: 4,
    eyebrow: 'まずは登録',
    title: 'あなたの経験が\n誰かの力になる',
    body: '登録無料・匿名OK。\nあなたの一言が同じ悩みを持つ誰かを救います。',
    cta: { label: '無料で始める', href: '/register' },
    accent: '#4c1d95',
    overlay: 'rgba(76,29,149,0.72)',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=1200&q=80&fit=crop',
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
    }, 5500)
    return () => clearInterval(t)
  }, [current, goTo])

  const s = slides[current]

  return (
    <>
      <style>{`
        .hero-wrap{position:relative;width:100%;overflow:hidden;min-height:300px}
        .hero-bg-img{position:absolute;inset:0;background-size:cover;background-position:center;transition:opacity .4s ease}
        .hero-overlay{position:absolute;inset:0}
        .hero-content{position:relative;z-index:10;padding:2rem 1.5rem 3.5rem;max-width:32rem;margin:0 auto}
        .hero-fade{transition:opacity .25s ease,transform .25s ease}
        .hero-fade.out{opacity:0;transform:translateY(8px)}
        .hero-fade.in{opacity:1;transform:translateY(0)}
        .hero-dots{position:absolute;bottom:1rem;left:50%;transform:translateX(-50%);display:flex;gap:6px;z-index:20}
        .hero-dot{border-radius:9999px;background:white;cursor:pointer;transition:all .3s}
        .hero-dot.active{width:20px;height:7px;opacity:1}
        .hero-dot.inactive{width:7px;height:7px;opacity:.4}
        .hero-deco1{position:absolute;top:0;right:0;width:220px;height:220px;border-radius:50%;background:white;opacity:.08;filter:blur(50px);transform:translate(40%,-40%);pointer-events:none}
        .hero-deco2{position:absolute;bottom:0;left:0;width:160px;height:160px;border-radius:50%;background:white;opacity:.08;filter:blur(40px);transform:translate(-40%,40%);pointer-events:none}
      `}</style>

      <div className="hero-wrap">
        {/* 背景画像 */}
        <div className="hero-bg-img" style={{backgroundImage:`url(${s.image})`}}/>
        {/* カラーオーバーレイ */}
        <div className="hero-overlay" style={{background:s.overlay}}/>
        {/* デコ */}
        <div className="hero-deco1"/><div className="hero-deco2"/>

        {/* コンテンツ */}
        <div className={`hero-content hero-fade ${fading?'out':'in'}`}>
          <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'12px'}}>
            <span style={{width:'16px',height:'1px',background:'white',opacity:.6,display:'block'}}/>
            <span style={{color:'white',fontSize:'11px',letterSpacing:'0.15em',textTransform:'uppercase',opacity:.8,fontWeight:500}}>
              {s.eyebrow}
            </span>
          </div>

          <h2 style={{color:'white',fontWeight:'bold',lineHeight:1.25,marginBottom:'12px',fontSize:'clamp(1.5rem,5vw,2.1rem)',whiteSpace:'pre-line'}}>
            {s.title}
          </h2>

          <p style={{color:'white',opacity:.82,fontSize:'14px',lineHeight:1.7,marginBottom:'24px',whiteSpace:'pre-line'}}>
            {s.body}
          </p>

          <Link href={s.cta.href} style={{
            display:'inline-flex',alignItems:'center',gap:'8px',
            background:'white',borderRadius:'9999px',
            padding:'10px 20px',fontSize:'14px',fontWeight:'bold',
            color:s.accent,textDecoration:'none',
            transition:'transform .15s',
          }}>
            {s.cta.label}
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>

        {/* ドットインジケーター */}
        <div className="hero-dots">
          {slides.map((_,i) => (
            <button key={i} onClick={() => goTo(i)}
              className={`hero-dot ${i===current?'active':'inactive'}`}
              aria-label={`スライド${i+1}`}/>
          ))}
        </div>
      </div>
    </>
  )
}
