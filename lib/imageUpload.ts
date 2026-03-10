import imageCompression from 'browser-image-compression'

const COMPRESSION_OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1200,
  useWebWorker: true,
  fileType: 'image/webp' as const,
  initialQuality: 0.85,
}

const THUMBNAIL_OPTIONS = {
  maxSizeMB: 0.5,
  maxWidthOrHeight: 1280,
  useWebWorker: true,
  fileType: 'image/webp' as const,
  initialQuality: 0.85,
}

export async function compressImage(
  file: File,
  type: 'content' | 'thumbnail' = 'content'
): Promise<File> {
  const options = type === 'thumbnail' ? THUMBNAIL_OPTIONS : COMPRESSION_OPTIONS
  try {
    const compressedFile = await imageCompression(file, options)
    const newFileName = file.name.replace(/\.[^/.]+$/, '.webp')
    return new File([compressedFile], newFileName, { type: 'image/webp' })
  } catch (error) {
    console.error('Image compression failed:', error)
    throw new Error('画像の圧縮に失敗しました')
  }
}

function generateFileName(originalName: string, prefix: string = 'img'): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const extension = originalName.includes('.webp') ? '.webp' : originalName.replace(/.*\./, '.')
  return `${prefix}_${timestamp}_${random}${extension}`
}

export async function uploadToR2(
  file: File,
  folder: 'articles' | 'thumbnails' = 'articles'
): Promise<string> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase環境変数が設定されていません')
  }

  const fileName = generateFileName(file.name, folder === 'thumbnails' ? 'thumb' : 'img')
  const formData = new FormData()
  formData.append('file', file)
  formData.append('folder', folder)
  formData.append('fileName', fileName)

  const response = await fetch(`${supabaseUrl}/functions/v1/upload-image`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Upload failed' }))
    throw new Error(error.message || '画像のアップロードに失敗しました')
  }

  const result = await response.json()
  return result.url
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
  const folder = type === 'thumbnail' ? 'thumbnails' : 'articles'
  return uploadToR2(compressedFile, folder)
}
