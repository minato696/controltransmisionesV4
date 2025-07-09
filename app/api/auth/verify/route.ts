// app/api/auth/verify/route.ts
import { NextResponse } from 'next/server'
import { verifyToken } from '@/utils/auth'

export async function GET(request: Request) {
  try {
    // Obtener token de las cookies
    const cookieHeader = request.headers.get('cookie')
    const token = cookieHeader
      ?.split(';')
      .find(c => c.trim().startsWith('token='))
      ?.split('=')[1]

    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = verifyToken(token)
    
    if (!user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    return NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        username: user.username,
        nombre: user.nombre,
        rol: user.rol
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Error de verificación' }, { status: 500 })
  }
}