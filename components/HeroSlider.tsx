'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const slides = [
  {
    id: 1,
    eyebrow: 'D-LIFEとは',
    title: '糖尿病と向き合う\nすべての人へ',
    body: '患者さん・ご家族・支える人たちが\n安心して話せる場所がここにあります。',
    cta: { label: 'ディーライフとは', href: '/about' },
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1400&q=80&fit=crop',
  },
  {
    id: 2,
    eyebrow: 'コミュニティ',
    title: 'ひとりじゃないと\n気づける場所',
    body: '食事・薬・日常の悩みを\n同じ経験を持つ仲間と共有できます。',
    cta: { label: 'トピックを見る', href: '/threads' },
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1400&q=80&fit=crop',
  },
  {
    id: 3,
    eyebrow: '健康記録',
    title: '毎月の記録が\n未来の自分を守る',
    body: 'HbA1cや体重を継続して記録するだけ。\nデータの積み重ねが改善への近道です。',
    cta: { label: '記録してみる', href: '/mypage' },
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1400&q=80&fit=crop',
  },
  {
    id: 4,
    eyebrow: 'まずは登録',
    title: 'あなたの経験が\n誰かの力になる',
    body: '登録無料・匿名OK。\nあなたの一言が同じ悩みを持つ誰かを救います。',
    cta: { label: '無料で始める', href: '/register' },
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=1400&q=80&fit=crop',
  },
]

export function HeroSlider() {
  const [current, setCurrent] = useState(0)
  const [animating, setAnimating] = useState(false)

  const goTo = useCallback((idx: number) => {
    if (animating) return
    setAnimating(true)
    setTimeout(() => {
      setCurrent(idx)
      setAnimating(false)
    }, 300)
  }, [animating])

  const prev = () => goTo((current - 1 + slides.length) % slides.length)
  const next = () => goTo((current + 1) % slides.length)

  useEffect(() => {
    const t = setInterval(() => {
      goTo((current + 1) % slides.length)
    }, 5500)
    return () => clearInterval(t)
  }, [current, goTo])

  const s = slides[current]

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: 'clamp(380px, 52vh, 600px)',
        overflow: 'hidden',
        background: '#1a1a2e',
      }}
    >
      {/* 背景画像 */}
      <Image
        key={s.id}
        src={s.image}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
        style={{
          opacity: animating ? 0 : 1,
          transition: 'opacity 0.5s ease',
        }}
        unoptimized
      />

      {/* グラデーションオーバーレイ */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to right, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.1) 100%)',
          zIndex: 1,
        }}
      />

      {/* コンテンツ */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          padding: '0 clamp(1.5rem, 6vw, 5rem)',
        }}
      >
        <div
          style={{
            maxWidth: '540px',
            opacity: animating ? 0 : 1,
            transform: animating ? 'translateY(12px)' : 'translateY(0)',
            transition: 'opacity 0.4s ease, transform 0.4s ease',
          }}
        >
          {/* eyebrow */}
          <p style={{
            fontSize: '0.7rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.75)',
            marginBottom: '0.6rem',
            fontWeight: 600,
          }}>
            {s.eyebrow}
          </p>

          {/* タイトル */}
          <h2 style={{
            fontSize: 'clamp(1.75rem, 4.5vw, 3rem)',
            fontWeight: 800,
            lineHeight: 1.2,
            color: '#fff',
            marginBottom: '1rem',
            whiteSpace: 'pre-line',
            textShadow: '0 2px 16px rgba(0,0,0,0.3)',
          }}>
            {s.title}
          </h2>

          {/* ボディ */}
          <p style={{
            fontSize: 'clamp(0.85rem, 2vw, 1rem)',
            color: 'rgba(255,255,255,0.88)',
            lineHeight: 1.8,
            marginBottom: '1.75rem',
            whiteSpace: 'pre-line',
            textShadow: '0 1px 8px rgba(0,0,0,0.2)',
          }}>
            {s.body}
          </p>

          {/* CTAボタン */}
          <Link
            href={s.cta.href}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#f43f5e',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.95rem',
              padding: '0.75rem 1.75rem',
              borderRadius: '9999px',
              boxShadow: '0 4px 20px rgba(244,63,94,0.45)',
              textDecoration: 'none',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
              ;(e.currentTarget as HTMLElement).style.boxShadow = '0 6px 24px rgba(244,63,94,0.55)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
              ;(e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(244,63,94,0.45)'
            }}
          >
            {s.cta.label}
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>

      {/* 左矢印 */}
      <button
        onClick={prev}
        aria-label="前のスライド"
        style={{
          position: 'absolute',
          left: '1rem',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 20,
          background: 'rgba(255,255,255,0.15)',
          border: 'none',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: '#fff',
          backdropFilter: 'blur(4px)',
          transition: 'background 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.3)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
      >
        <ChevronLeft size={20} />
      </button>

      {/* 右矢印 */}
      <button
        onClick={next}
        aria-label="次のスライド"
        style={{
          position: 'absolute',
          right: '1rem',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 20,
          background: 'rgba(255,255,255,0.15)',
          border: 'none',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: '#fff',
          backdropFilter: 'blur(4px)',
          transition: 'background 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.3)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
      >
        <ChevronRight size={20} />
      </button>

      {/* ドットナビ */}
      <div
        style={{
          position: 'absolute',
          bottom: '1.25rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '8px',
          zIndex: 20,
        }}
      >
        {slides.map((_, i) => (
          <button
            key={i}
            aria-label={`スライド${i + 1}`}
            onClick={() => goTo(i)}
            style={{
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              borderRadius: '9999px',
              background: 'white',
              transition: 'all 0.3s',
              width: i === current ? '24px' : '8px',
              height: '8px',
              opacity: i === current ? 1 : 0.4,
            }}
          />
        ))}
      </div>
    </div>
  )
}
