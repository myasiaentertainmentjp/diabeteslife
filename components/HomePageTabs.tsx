'use client'

import { useState, ReactNode } from 'react'

interface HomePageTabsProps {
  popularContent: ReactNode
  newContent: ReactNode
}

export function HomePageTabs({ popularContent, newContent }: HomePageTabsProps) {
  const [activeTab, setActiveTab] = useState<'popular' | 'new'>('popular')

  return (
    <>
      {/* Tabs */}
      <div className="flex mb-0">
        <button
          onClick={() => setActiveTab('popular')}
          className={`flex-1 py-4 text-base font-medium transition-colors relative ${
            activeTab === 'popular'
              ? 'bg-rose-400 text-white'
              : 'bg-blue-50 text-cyan-600 hover:bg-blue-100'
          }`}
        >
          人気トピック
          {activeTab === 'popular' && (
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-rose-400" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('new')}
          className={`flex-1 py-4 text-base font-medium transition-colors relative ${
            activeTab === 'new'
              ? 'bg-rose-400 text-white'
              : 'bg-blue-50 text-cyan-600 hover:bg-blue-100'
          }`}
        >
          新着トピック
          {activeTab === 'new' && (
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-rose-400" />
          )}
        </button>
      </div>

      {/* Content - Both rendered, visibility controlled by CSS */}
      <div className="bg-white rounded-b-lg shadow-sm pt-2">
        <div className={activeTab === 'popular' ? '' : 'hidden'}>
          {popularContent}
        </div>
        <div className={activeTab === 'new' ? '' : 'hidden'}>
          {newContent}
        </div>
      </div>
    </>
  )
}
