import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Minus,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

interface RichTextEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
  onImageUpload?: (file: File) => Promise<string>
}

// Helper function to check if URL is external (not from Supabase)
function isExternalImageUrl(url: string): boolean {
  if (!url) return false
  // Supabase storage URLs contain supabase.co
  if (url.includes('supabase.co')) return false
  // Check if it's an http/https URL
  return url.startsWith('http://') || url.startsWith('https://')
}

// Helper function to extract image URLs from HTML
function extractImageUrls(html: string): string[] {
  const urls: string[] = []
  const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi
  let match
  while ((match = imgRegex.exec(html)) !== null) {
    if (isExternalImageUrl(match[1])) {
      urls.push(match[1])
    }
  }
  return urls
}

// Helper function to fetch image and convert to File
async function fetchImageAsFile(url: string): Promise<File> {
  // Use proxy for CORS issues - convert http to https first
  const secureUrl = url.replace(/^http:\/\//, 'https://')

  const response = await fetch(secureUrl)
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status}`)
  }

  const blob = await response.blob()
  const extension = url.split('.').pop()?.split('?')[0] || 'jpg'
  const fileName = `pasted_${Date.now()}.${extension}`

  return new File([blob], fileName, { type: blob.type || 'image/jpeg' })
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = '記事の内容を入力...',
  onImageUpload,
}: RichTextEditorProps) {
  const [processingImages, setProcessingImages] = useState(false)
  const [processingCount, setProcessingCount] = useState({ current: 0, total: 0 })

  // Process external images in HTML - upload to Supabase and replace URLs
  const processExternalImages = useCallback(async (html: string): Promise<string> => {
    if (!onImageUpload) return html

    const imageUrls = extractImageUrls(html)
    if (imageUrls.length === 0) return html

    setProcessingImages(true)
    setProcessingCount({ current: 0, total: imageUrls.length })

    let processedHtml = html

    for (let i = 0; i < imageUrls.length; i++) {
      const originalUrl = imageUrls[i]
      setProcessingCount({ current: i + 1, total: imageUrls.length })

      try {
        // Fetch the image
        const file = await fetchImageAsFile(originalUrl)

        // Upload to Supabase (this also compresses to WebP)
        const newUrl = await onImageUpload(file)

        // Replace old URL with new URL in HTML
        processedHtml = processedHtml.split(originalUrl).join(newUrl)
      } catch (error) {
        console.error(`Failed to process image ${originalUrl}:`, error)
        // Convert http to https as fallback
        const secureUrl = originalUrl.replace(/^http:\/\//, 'https://')
        processedHtml = processedHtml.split(originalUrl).join(secureUrl)
      }
    }

    setProcessingImages(false)
    return processedHtml
  }, [onImageUpload])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-rose-500 underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg mx-auto',
        },
      }),
      Underline.configure({
        HTMLAttributes: {
          class: 'underline',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder,
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse border border-gray-300 w-full',
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 bg-gray-100 px-4 py-2 text-left font-semibold',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 px-4 py-2',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose max-w-none focus:outline-none min-h-[400px] px-4 py-3',
      },
    },
  })

  // Update content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  // Handle paste events to process external images
  useEffect(() => {
    if (!editor || !onImageUpload) return

    const handlePaste = async (event: ClipboardEvent) => {
      const html = event.clipboardData?.getData('text/html')
      if (!html) return

      // Check if there are external images in the pasted content
      const imageUrls = extractImageUrls(html)
      if (imageUrls.length === 0) return

      // Process images after a short delay (after TipTap has handled the paste)
      setTimeout(async () => {
        const currentHtml = editor.getHTML()
        const processedHtml = await processExternalImages(currentHtml)
        if (processedHtml !== currentHtml) {
          editor.commands.setContent(processedHtml)
        }
      }, 100)
    }

    const editorElement = editor.view.dom
    editorElement.addEventListener('paste', handlePaste)

    return () => {
      editorElement.removeEventListener('paste', handlePaste)
    }
  }, [editor, onImageUpload, processExternalImages])

  const setLink = useCallback(() => {
    if (!editor) return

    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URLを入力してください', previousUrl)

    if (url === null) return

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  const addImage = useCallback(async () => {
    if (!editor) return

    if (onImageUpload) {
      // Open file picker
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (file) {
          try {
            const url = await onImageUpload(file)
            editor.chain().focus().setImage({ src: url }).run()
          } catch (error) {
            console.error('Image upload failed:', error)
            alert('画像のアップロードに失敗しました')
          }
        }
      }
      input.click()
    } else {
      const url = window.prompt('画像のURLを入力してください')
      if (url) {
        editor.chain().focus().setImage({ src: url }).run()
      }
    }
  }, [editor, onImageUpload])

  if (!editor) {
    return null
  }

  const ToolbarButton = ({
    onClick,
    isActive,
    disabled,
    children,
    title,
  }: {
    onClick: () => void
    isActive?: boolean
    disabled?: boolean
    children: React.ReactNode
    title: string
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
        isActive ? 'bg-rose-100 text-rose-600' : 'text-gray-600'
      }`}
    >
      {children}
    </button>
  )

  const ToolbarDivider = () => (
    <div className="w-px h-6 bg-gray-300 mx-1" />
  )

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-2 border-b border-gray-200 bg-gray-50">
        {/* Undo/Redo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="元に戻す"
        >
          <Undo size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="やり直す"
        >
          <Redo size={18} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Headings */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="見出し1"
        >
          <Heading1 size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="見出し2"
        >
          <Heading2 size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title="見出し3"
        >
          <Heading3 size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
          isActive={editor.isActive('heading', { level: 4 })}
          title="見出し4"
        >
          <Heading4 size={18} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Text formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="太字"
        >
          <Bold size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="斜体"
        >
          <Italic size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title="下線"
        >
          <UnderlineIcon size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title="取り消し線"
        >
          <Strikethrough size={18} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="箇条書き"
        >
          <List size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="番号付きリスト"
        >
          <ListOrdered size={18} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Block elements */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="引用"
        >
          <Quote size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive('codeBlock')}
          title="コードブロック"
        >
          <Code size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="水平線"
        >
          <Minus size={18} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Alignment */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          title="左揃え"
        >
          <AlignLeft size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          title="中央揃え"
        >
          <AlignCenter size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          title="右揃え"
        >
          <AlignRight size={18} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Link and Image */}
        <ToolbarButton
          onClick={setLink}
          isActive={editor.isActive('link')}
          title="リンク"
        >
          <LinkIcon size={18} />
        </ToolbarButton>
        <ToolbarButton onClick={addImage} title="画像を挿入">
          <ImageIcon size={18} />
        </ToolbarButton>
      </div>

      {/* Processing indicator */}
      {processingImages && (
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border-b border-blue-200 text-blue-700 text-sm">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span>
            外部画像をアップロード中... ({processingCount.current}/{processingCount.total})
          </span>
        </div>
      )}

      {/* Editor content */}
      <EditorContent editor={editor} />
    </div>
  )
}
