'use client'

import { useAuth } from '@/contexts/AuthContext'
import { TrackableLink } from './TrackableLink'
import { MessageCircle, Bookmark, Users, Sparkles } from 'lucide-react'

/**
 * 登録促進バナー
 * スレッド詳細ページ下部に表示
 * 未ログインユーザーのみ表示
 * GA4計測: click_internal (link_type: register_banner)
 */
export function RegisterBanner() {
  const { user, loading } = useAuth()

  // ログイン済みユーザーには表示しない
  if (loading || user) {
    return null
  }

  return (
    <div className="mt-8 bg-gradient-to-r from-rose-50 to-orange-50 rounded-xl border border-rose-200 p-6 md:p-8">
      {/* ヘッダー */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-rose-100 rounded-full mb-3">
          <Sparkles size={24} className="text-rose-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Dライフに参加しませんか？
        </h2>
        <p className="text-gray-600 text-sm">
          無料会員登録で、コミュニティの全機能が使えます
        </p>
      </div>

      {/* 便益リスト */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm">
          <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center shrink-0">
            <MessageCircle size={18} className="text-rose-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">コメントで相談</p>
            <p className="text-xs text-gray-500">悩みを共有できます</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
            <Bookmark size={18} className="text-orange-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">トピックを保存</p>
            <p className="text-xs text-gray-500">後で読み返せます</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
            <Users size={18} className="text-blue-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">仲間とつながる</p>
            <p className="text-xs text-gray-500">同じ悩みの人と交流</p>
          </div>
        </div>
      </div>

      {/* CTAボタン */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <TrackableLink
          href="/register"
          linkType="register_banner"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-rose-500 text-white font-medium rounded-lg hover:bg-rose-600 transition-colors shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>Googleで無料登録</span>
        </TrackableLink>

        <TrackableLink
          href="/register"
          linkType="register_banner"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-rose-500 font-medium rounded-lg border border-rose-300 hover:bg-rose-50 transition-colors"
        >
          <span>メールで登録</span>
        </TrackableLink>
      </div>

      {/* 補足テキスト */}
      <p className="text-center text-xs text-gray-500 mt-4">
        登録は30秒で完了・完全無料
      </p>
    </div>
  )
}
