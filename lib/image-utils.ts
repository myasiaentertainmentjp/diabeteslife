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
 * 用途別のプリセット
 */
export const IMAGE_PRESETS = {
  /** サイドバー用サムネイル */
  sidebar: { width: 200, quality: 70 },
  /** 一覧用サムネイル */
  list: { width: 400, quality: 75 },
  /** グリッド一覧用（/meals等） */
  grid: { width: 280, quality: 70 },
  /** 詳細ページ用 */
  detail: { width: 800, quality: 80 },
  /** モーダル（拡大表示）用 */
  modal: { width: 1200, quality: 85 },
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
