// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const host = request.headers.get('host') || 'localhost:5451'
  
  // Solo mostrar logs en desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.log('Middleware - Path:', pathname, 'Host:', host)
  }
  
  // Rutas públicas que no requieren autenticación
  const publicPaths = ['/login', '/api/auth/login', '/api/auth/logout', '/api/auth/verify']
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))
  
  // Si es una ruta pública, permitir acceso
  if (isPublicPath) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Middleware - Public path, allowing access')
    }
    return NextResponse.next()
  }
  
  // Obtener token de las cookies
  const token = request.cookies.get('token')?.value
  
  // Debug solo en desarrollo
  if (process.env.NODE_ENV === 'development') {
    const allCookies = request.cookies.getAll()
    console.log('Middleware - All cookies:', allCookies.map(c => c.name))
    console.log('Middleware - Token exists:', !!token)
  }
  
  // Si hay token, permitir acceso (sin validar por ahora)
  if (token) {
    return NextResponse.next()
  }
  
  // Si no hay token y no es ruta pública, redirigir a login
  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  
  // Construir URL absoluta para la redirección usando el host correcto
  const protocol = request.headers.get('x-forwarded-proto') || 'http'
  const loginUrl = new URL('/login', `${protocol}://${host}`)
  
  if (process.env.NODE_ENV === 'development') {
    console.log('Middleware - Redirecting to:', loginUrl.toString())
  }
  
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}