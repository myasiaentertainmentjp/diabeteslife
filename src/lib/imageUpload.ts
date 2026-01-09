import imageCompression from 'browser-image-compression'

// Image compression options
const COMPRESSION_OPTIONS = {
  maxSizeMB: 1, // Maximum file size in MB
  maxWidthOrHeight: 1200, // Maximum dimension
  useWebWorker: true,
  fileType: 'image/webp' as const,
}

const THUMBNAIL_OPTIONS = {
  maxSizeMB: 0.3, // Smaller for thumbnails
  maxWidthOrHeight: 800,
  useWebWorker: true,
  fileType: 'image/webp' as const,
}

/**
 * Compress and convert image to WebP format
 */
export async function compressImage(
  file: File,
  type: 'content' | 'thumbnail' = 'content'
): Promise<File> {
  const options = type === 'thumbnail' ? THUMBNAIL_OPTIONS : COMPRESSION_OPTIONS

  try {
    const compressedFile = await imageCompression(file, options)

    // Rename file with .webp extension
    const newFileName = file.name.replace(/\.[^/.]+$/, '.webp')
    return new File([compressedFile], newFileName, { type: 'image/webp' })
  } catch (error) {
    console.error('Image compression failed:', error)
    throw new Error('画像の圧縮に失敗しました')
  }
}

/**
 * Generate a unique filename for upload
 */
function generateFileName(originalName: string, prefix: string = 'img'): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const extension = originalName.includes('.webp') ? '.webp' : originalName.replace(/.*\./, '.')
  return `${prefix}_${timestamp}_${random}${extension}`
}

/**
 * Upload image to R2 via Supabase Edge Function
 * This function calls a Supabase Edge Function that handles the R2 upload
 */
export async function uploadToR2(
  file: File,
  folder: 'articles' | 'thumbnails' = 'articles'
): Promise<string> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase環境変数が設定されていません')
  }

  const fileName = generateFileName(file.name, folder === 'thumbnails' ? 'thumb' : 'img')

  // Create FormData for upload
  const formData = new FormData()
  formData.append('file', file)
  formData.append('folder', folder)
  formData.append('fileName', fileName)

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/upload-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }))
      throw new Error(error.message || '画像のアップロードに失敗しました')
    }

    const result = await response.json()
    return result.url
  } catch (error) {
    console.error('R2 upload failed:', error)
    throw error instanceof Error ? error : new Error('画像のアップロードに失敗しました')
  }
}

/**
 * Complete image upload flow: compress and upload
 */
export async function uploadImage(
  file: File,
  type: 'content' | 'thumbnail' = 'content'
): Promise<string> {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('画像ファイルを選択してください')
  }

  // Validate file size (max 10MB before compression)
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    throw new Error('ファイルサイズは10MB以下にしてください')
  }

  // Compress image
  const compressedFile = await compressImage(file, type)

  // Upload to R2
  const folder = type === 'thumbnail' ? 'thumbnails' : 'articles'
  const url = await uploadToR2(compressedFile, folder)

  return url
}

/**
 * Use Supabase Storage for image uploads
 * This is used as the default storage option
 */
export async function uploadToSupabaseStorage(
  file: File,
  bucket: string = 'images'
): Promise<string> {
  // Late import to avoid circular dependencies while keeping single chunk
  const supabaseModule = await import('./supabase')
  const supabase = supabaseModule.supabase

  const fileName = generateFileName(file.name)
  const filePath = `${fileName}`

  console.log('Uploading to Supabase Storage:', { bucket, filePath, fileType: file.type, fileSize: file.size })

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '31536000', // 1 year cache
      contentType: file.type,
    })

  if (error) {
    console.error('Supabase storage upload failed:', error)
    // Provide more specific error messages
    if (error.message?.includes('Bucket not found')) {
      throw new Error(`ストレージバケット "${bucket}" が存在しません。Supabaseダッシュボードで作成してください。`)
    }
    if (error.message?.includes('row-level security') || error.message?.includes('policy')) {
      throw new Error('ストレージのアクセス権限がありません。RLSポリシーを確認してください。')
    }
    throw new Error(`画像のアップロードに失敗しました: ${error.message}`)
  }

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath)
  return urlData.publicUrl
}
