import { createClient } from '@/lib/supabase'
import imageCompression from 'browser-image-compression'

const COMPRESSION_OPTIONS = {
  maxSizeMB: 0.5,
  maxWidthOrHeight: 1200,
  useWebWorker: true,
  initialQuality: 0.82,
}

const THUMBNAIL_OPTIONS = {
  maxSizeMB: 0.3,
  maxWidthOrHeight: 1280,
  useWebWorker: true,
  initialQuality: 0.82,
}

export async function compressImage(
  file: File,
  type: 'content' | 'thumbnail' = 'content'
): Promise<File> {
  const options = type === 'thumbnail' ? THUMBNAIL_OPTIONS : COMPRESSION_OPTIONS
  try {
    const compressedFile = await imageCompression(file, options)
    // 元のファイル形式を維持（WebPへの強制変換なし）
    return new File([compressedFile], file.name, { type: file.type })
  } catch (error) {
    console.error('Image compression failed:', error)
    throw new Error('画像の圧縮に失敗しました')
  }
}

function generateFileName(originalName: string, prefix: string = 'img'): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const ext = originalName.match(/\.[^.]+$/)?.[0] || '.jpg'
  return `${prefix}_${timestamp}_${random}${ext}`
}

export async function uploadImage(
  file: File,
  type: 'content' | 'thumbnail' = 'content'
): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('画像ファイルを選択してください')
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('ファイルサイズは10MB以下にしてください')
  }

  const compressedFile = await compressImage(file, type)

  const supabase = createClient()
  const bucket = type === 'thumbnail' ? 'thumbnails' : 'images'
  const prefix = type === 'thumbnail' ? 'thumb' : 'img'
  const fileName = generateFileName(compressedFile.name, prefix)

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, compressedFile, {
      contentType: file.type,
      upsert: false,
    })

  if (error) {
    console.error('Storage upload error:', error)
    throw new Error('画像のアップロードに失敗しました: ' + error.message)
  }

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path)

  return urlData.publicUrl
}
