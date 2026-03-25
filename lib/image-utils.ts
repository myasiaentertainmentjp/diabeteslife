/**
 * Supabase Storage 画像の最適化ユーティリティ
 * next/image が WebP変換・リサイズ・キャッシュを担うため、
 * ここでは生の public URL を返すだけ。
 */

export function getRawPublicUrl(url: string | null | undefined): string {
  if (!url) return ''
  if (url.includes('/storage/v1/render/image/public/')) {
    return url
      .replace('/storage/v1/render/image/public/', '/storage/v1/object/public/')
      .split('?')[0]
  }
  return url.split('?')[0]
}

// 後方互換のため残す（内部で getRawPublicUrl を呼ぶだけ）
export function getThumbnailUrl(url: string | null | undefined): string {
  return getRawPublicUrl(url)
}

export function getPresetThumbnailUrl(url: string | null | undefined): string {
  return getRawPublicUrl(url)
}
