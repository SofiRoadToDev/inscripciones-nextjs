import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { createClient } from '@/utils/supabase/server'

export async function middleware(request: NextRequest) {
    const { nextUrl } = request
    const response = await updateSession(request)

    // Check if it's an admin or preceptor route
    const isAdminRoute = nextUrl.pathname.startsWith('/admin')
    const isPreceptorRoute = nextUrl.pathname.startsWith('/preceptor')

    if (isAdminRoute || isPreceptorRoute) {
        const supabase = createClient(request.cookies as any)
        const { data: { user } } = await supabase.auth.getUser()

        console.log('Middleware:', { path: nextUrl.pathname, userId: user?.id })

        // 1. If trying to access protected routes without being authenticated
        if (!user && nextUrl.pathname !== '/admin/login') {
            return NextResponse.redirect(new URL('/admin/login', request.url))
        }

        // 2. If authenticated, check role and redirect accordingly
        if (user && nextUrl.pathname !== '/admin/login') {
            const { data: profile, error } = await supabase
                .from('perfiles')
                .select('role')
                .eq('user_id', user.id)
                .single()

            console.log('Profile result:', { profile, error })

            if (profile) {
                // Admin trying to access preceptor routes -> redirect to admin
                if (profile.role === 'admin' && isPreceptorRoute) {
                    return NextResponse.redirect(new URL('/admin', request.url))
                }

                // Preceptor trying to access admin routes -> redirect to preceptor
                if (profile.role === 'preceptor' && isAdminRoute) {
                    return NextResponse.redirect(new URL('/preceptor', request.url))
                }
            }
        }

        // 3. If trying to access login while already authenticated
        if (user && nextUrl.pathname === '/admin/login') {
            // Redirect based on role
            const { data: profile } = await supabase
                .from('perfiles')
                .select('role')
                .eq('user_id', user.id)
                .single()

            if (profile?.role === 'preceptor') {
                return NextResponse.redirect(new URL('/preceptor', request.url))
            }
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
