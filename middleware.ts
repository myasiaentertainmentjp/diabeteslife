import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // /admin ルートの保護
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    const { data: { session } } = await supabase.auth.getSession()

    // 未ログインはログインページへ
    if (!session) {
      return NextResponse.redirect(new URL('/login?redirect=/admin', request.url))
    }

    // ロールチェック
    const { data: userData } = await supabase
      .from('users')
      .select('role, email')
      .eq('id', session.user.id)
      .single()

    const isAdmin = userData?.role === 'admin' || userData?.email === 'info@diabeteslife.jp'

    if (!isAdmin) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*'],
}
