/**
 * 画像URL ユーティリティ
 * Next.js Image による最適化・WebP変換を使用
 * Supabase Transform API は使用しない
 */

export function getRawPublicUrl(url: string | null | undefined): string {
  if (!url) return ''
  // render/image URLが混入していた場合はobject/publicに戻す
  if (url.includes('/storage/v1/render/image/public/')) {
    return url
      .replace('/storage/v1/render/image/public/', '/storage/v1/object/public/')
      .split('?')[0]
  }
  return url.split('?')[0]
}

// 後方互換のため残す（中身はRawURLを返すだけ）
export function getThumbnailUrl(
  url: string | null | undefined,
): string {
  return getRawPublicUrl(url)
}

export function getPresetThumbnailUrl(
  url: string | null | undefined,
  _preset?: string
): string {
  return getRawPublicUrl(url)
}
