import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { createClient } from '@/utils/supabase/server'

export async function middleware(request: NextRequest) {
    const { nextUrl } = request
    const response = await updateSession(request)

    // Check if it's an admin route
    if (nextUrl.pathname.startsWith('/admin')) {
        const supabase = createClient(request.cookies as any) // Simplified for middleware check
        const { data: { user } } = await supabase.auth.getUser()

        // 1. If trying to access admin (non-login) without being authenticated
        if (!user && nextUrl.pathname !== '/admin/login') {
            return NextResponse.redirect(new URL('/admin/login', request.url))
        }

        // 2. If trying to access login while already authenticated
        if (user && nextUrl.pathname === '/admin/login') {
            return NextResponse.redirect(new URL('/admin', request.url))
        }
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
