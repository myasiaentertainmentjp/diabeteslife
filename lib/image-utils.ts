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
  quality = 75
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

  return `${transformUrl}?width=${width}&quality=${quality}`
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
 * Supabase Transform API でリサイズ（cover/contain指定可）
 * app/page.tsx 等で使用
 */
export function getResizedUrl(
  url: string | null | undefined,
  width: number,
  height?: number,
  resize: 'cover' | 'contain' = 'cover'
): string {
  if (!url) return ''
  if (!url.includes('supabase.co/storage/v1/object/public/')) {
    return url
  }
  const transformUrl = url.replace(
    '/storage/v1/object/public/',
    '/storage/v1/render/image/public/'
  )
  let params = `width=${width}&resize=${resize}&quality=75`
  if (height) params += `&height=${height}`
  return `${transformUrl}?${params}`
}

/**
 * 用途別のプリセット
 * /meals の体感速度改善のため、listSquare と modal を軽量化
 */
export const IMAGE_PRESETS = {
  /** サイドバー用サムネイル */
  sidebar: { width: 200, quality: 70 },
  /** 一覧用サムネイル */
  list: { width: 400, quality: 75 },
  /** グリッド一覧用（/meals等） */
  grid: { width: 280, quality: 70 },
  /** 一覧正方形カード用（/meals）- 3列グリッド向けに軽量化 */
  listSquare: { width: 320, quality: 60 },
  /** 詳細ページ用 */
  detail: { width: 800, quality: 80 },
  /** モーダル（拡大表示）用 - スマホ閲覧向けに軽量化 */
  modal: { width: 1000, quality: 72 },
  /** アバター用 */
  avatar: { width: 100, quality: 70 },
} as const

/**
 * プリセットを使用してサムネイルURLを取得
 */
export function getPresetThumbnailUrl(
  url: string | null | undefined,
  preset: keyof typeof IMAGE_PRESETS
): string {
  const { width, quality } = IMAGE_PRESETS[preset]
  return getThumbnailUrl(url, width, quality)
}
