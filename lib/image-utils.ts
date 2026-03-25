/**
 * Supabase Storage 画像の最適化ユーティリティ
 * Transform API を使用してリサイズ・品質調整を行う
 */

export function getThumbnailUrl(
  url: string | null | undefined,
  width = 400,
  quality = 75,
  height?: number,
  resize?: 'cover' | 'contain' | 'fill'
): string {
  if (!url) return ''

  if (!url.includes('supabase.co/storage/v1/object/public/')) {
    return url
  }

  const transformUrl = url.replace(
    '/storage/v1/object/public/',
    '/storage/v1/render/image/public/'
  )

  let params = `width=${width}&quality=${quality}`
  if (height) params += `&height=${height}`
  if (resize) params += `&resize=${resize}`

  return `${transformUrl}?${params}`
}

export function getRawPublicUrl(url: string | null | undefined): string {
  if (!url) return ''

  if (url.includes('/storage/v1/render/image/public/')) {
    const rawUrl = url.replace(
      '/storage/v1/render/image/public/',
      '/storage/v1/object/public/'
    )
    return rawUrl.split('?')[0]
  }

  return url.split('?')[0]
}

export const IMAGE_PRESETS = {
  /** サイドバー用サムネイル */
  sidebar: { width: 160, height: 84, resize: 'cover' as const, quality: 70 },
  /** 一覧用サムネイル */
  list: { width: 400, quality: 75 },
  /** グリッド一覧用（/meals等） */
  grid: { width: 280, quality: 70 },
  /** 一覧正方形カード用（/meals） */
  listSquare: { width: 300, height: 300, resize: 'cover' as const, quality: 70 },
  /** 詳細ページ用 */
  detail: { width: 800, quality: 80 },
  /** モーダル（拡大表示）用 */
  modal: { width: 1200, quality: 82 },
  /** アバター用 */
  avatar: { width: 100, quality: 70 },
} as const

export function getPresetThumbnailUrl(
  url: string | null | undefined,
  preset: keyof typeof IMAGE_PRESETS
): string {
  const p = IMAGE_PRESETS[preset] as { width: number; quality: number; height?: number; resize?: 'cover' | 'contain' | 'fill' }
  return getThumbnailUrl(url, p.width, p.quality, p.height, p.resize)
}
