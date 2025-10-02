import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const userId = request.cookies.get('userId')?.value

  if (!userId) {
    const response = NextResponse.next()
    const newUserId = `user_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`

    response.cookies.set('userId', newUserId, {
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
      sameSite: 'lax',
    })

    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/calendar/:path*'],
}
