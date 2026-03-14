import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { slug } = await request.json()

    if (slug) {
      // 特定記事のキャッシュをクリア
      revalidatePath(`/articles/${slug}`)
    }
    // 記事一覧のキャッシュもクリア
    revalidatePath('/articles')
    revalidatePath('/')

    return NextResponse.json({ revalidated: true })
  } catch {
    return NextResponse.json({ revalidated: false }, { status: 500 })
  }
}
