import { useState, useCallback, useRef } from 'react'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'
import { uploadImage, uploadToSupabaseStorage, compressImage } from '../lib/imageUpload'

interface ImageUploaderProps {
  value: string
  onChange: (url: string) => void
  type?: 'thumbnail' | 'content'
  label?: string
  useSupabaseStorage?: boolean // Use Supabase Storage instead of R2
}

export function ImageUploader({
  value,
  onChange,
  type = 'thumbnail',
  label = 'サムネイル画像',
  useSupabaseStorage = true, // Default to Supabase Storage for now
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = useCallback(
    async (file: File) => {
      setError(null)
      setUploading(true)

      try {
        let url: string

        if (useSupabaseStorage) {
          // Use Supabase Storage (simpler setup)
          const compressedFile = await compressImage(file, type)
          url = await uploadToSupabaseStorage(
            compressedFile,
            type === 'thumbnail' ? 'thumbnails' : 'images'
          )
        } else {
          // Use R2 via Edge Function
          url = await uploadImage(file, type)
        }

        onChange(url)
      } catch (err) {
        setError(err instanceof Error ? err.message : '画像のアップロードに失敗しました')
      } finally {
        setUploading(false)
      }
    },
    [onChange, type, useSupabaseStorage]
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleUpload(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      handleUpload(file)
    } else {
      setError('画像ファイルをドロップしてください')
    }
  }

  const handleRemove = () => {
    onChange('')
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {value ? (
        // Image preview
        <div className="relative group">
          <img
            src={value}
            alt={label}
            className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-200"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
          >
            <X size={16} />
          </button>
          <button
            type="button"
            onClick={handleClick}
            className="absolute bottom-2 right-2 px-3 py-1.5 bg-white text-gray-700 text-sm rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50"
          >
            変更
          </button>
        </div>
      ) : (
        // Upload area
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-green-500 bg-green-50'
              : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 size={32} className="animate-spin text-green-600" />
              <p className="text-sm text-gray-600">アップロード中...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              {isDragging ? (
                <>
                  <Upload size={32} className="text-green-600" />
                  <p className="text-sm text-green-600 font-medium">ドロップしてアップロード</p>
                </>
              ) : (
                <>
                  <ImageIcon size={32} className="text-gray-400" />
                  <p className="text-sm text-gray-600">
                    クリックまたはドラッグ＆ドロップで画像をアップロード
                  </p>
                  <p className="text-xs text-gray-400">PNG, JPG, WebP（10MB以下）</p>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}

      {/* URL input fallback */}
      <div className="mt-3">
        <details className="text-sm">
          <summary className="text-gray-500 cursor-pointer hover:text-gray-700">
            URLで指定する
          </summary>
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
          />
        </details>
      </div>
    </div>
  )
}
