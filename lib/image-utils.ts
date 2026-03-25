/**
 * Supabase Storage 画像の最適化ユーティリティ
 * - getResizedUrl: Supabase Transform で事前リサイズ（巨大画像の軽量化）
 * - next/image が WebP/AVIF変換・キャッシュを担当
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

// 後方互換
export function getThumbnailUrl(url: string | null | undefined): string {
  return getRawPublicUrl(url)
}
export function getPresetThumbnailUrl(url: string | null | undefined): string {
  return getRawPublicUrl(url)
}
