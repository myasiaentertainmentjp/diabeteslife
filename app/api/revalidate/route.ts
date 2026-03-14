import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // 簡易認証（管理画面からのリクエストのみ許可）
  const authHeader = request.headers.get('x-revalidate-secret')
  const secret = process.env.REVALIDATE_SECRET || 'dlife-revalidate-2025'
  if (authHeader !== secret) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { slug } = await request.json()

  // 記事一覧をリフレッシュ
  revalidatePath('/articles')
  revalidatePath('/articles', 'layout')

  // 特定記事をリフレッシュ
  if (slug) {
    revalidatePath(`/articles/${slug}`)
  }

  // トップページもリフレッシュ（注目記事に反映）
  revalidatePath('/')

  return NextResponse.json({ revalidated: true, slug })
}
