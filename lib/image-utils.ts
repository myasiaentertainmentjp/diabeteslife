/**
 * Supabase Storage 画像の最適化ユーティリティ
 * Transform API を使用してリサイズ・品質調整を行う
 */

/**
 * Supabase Storage の画像URLをサムネイルURLに変換
 * @param url - 元の画像URL
 * @param width - 出力幅 (デフォルト: 400)
 * @param quality - 品質 1-100 (デフォルト: 75)
 * @returns Transform API を使用したURL、または元のURL
 */
export function getThumbnailUrl(
  url: string | null | undefined,
  width = 400,
  quality = 75,
  height?: number,
  resize?: 'cover' | 'contain' | 'fill',
  format?: 'webp' | 'jpeg' | 'png'
): string {
  if (!url) return ''

  // Supabase Storage URL かどうか確認
  if (!url.includes('supabase.co/storage/v1/object/public/')) {
    return url
  }

  // /object/public/ → /render/image/public/ に変換
  const transformUrl = url.replace(
    '/storage/v1/object/public/',
    '/storage/v1/render/image/public/'
  )

  let params = `width=${width}&quality=${quality}`
  if (height) params += `&height=${height}`
  if (resize) params += `&resize=${resize}`
  if (format) params += `&format=${format}`

  return `${transformUrl}?${params}`
}

/**
 * 元のpublic URL（Transform無し）を取得
 * Transform APIが失敗した場合のフォールバック用
 */
export function getRawPublicUrl(url: string | null | undefined): string {
  if (!url) return ''

  // すでにrender/imageの場合はobject/publicに戻す
  if (url.includes('/storage/v1/render/image/public/')) {
    const rawUrl = url.replace(
      '/storage/v1/render/image/public/',
      '/storage/v1/object/public/'
    )
    // クエリパラメータを除去
    return rawUrl.split('?')[0]
  }

  // すでにobject/publicの場合はそのまま（クエリパラメータ除去）
  return url.split('?')[0]
}

/**
 * 用途別のプリセット
 */
export const IMAGE_PRESETS = {
  /** サイドバー用サムネイル */
  sidebar: { width: 160, height: 84, resize: 'cover' as const, quality: 70, format: 'webp' as const },
  /** 一覧用サムネイル */
  list: { width: 400, quality: 75, format: 'webp' as const },
  /** グリッド一覧用（/meals等） */
  grid: { width: 280, quality: 70, format: 'webp' as const },
  /** 一覧正方形カード用（/meals） */
  listSquare: { width: 300, height: 300, resize: 'cover' as const, quality: 70, format: 'webp' as const },
  /** 詳細ページ用 */
  detail: { width: 800, quality: 80, format: 'webp' as const },
  /** モーダル（拡大表示）用 */
  modal: { width: 1200, quality: 82, format: 'webp' as const },
  /** アバター用 */
  avatar: { width: 100, quality: 70, format: 'webp' as const },
} as const

/**
 * プリセットを使用してサムネイルURLを取得
 */
export function getPresetThumbnailUrl(
  url: string | null | undefined,
  preset: keyof typeof IMAGE_PRESETS
): string {
  const p = IMAGE_PRESETS[preset] as { width: number; quality: number; height?: number; resize?: 'cover' | 'contain' | 'fill'; format?: 'webp' | 'jpeg' | 'png' }
  return getThumbnailUrl(url, p.width, p.quality, p.height, p.resize, p.format)
}
