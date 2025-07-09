// app/api/auth/login/route.ts
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyPassword, generateToken } from '@/utils/auth'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()
    
    console.log('Login attempt for:', username)

    // Validar entrada
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Usuario y contraseña son requeridos' },
        { status: 400 }
      )
    }

    // Buscar usuario
    const usuario = await (prisma as any).usuarios.findUnique({
      where: { username: username.toLowerCase() }
    })
    
    console.log('Usuario encontrado:', usuario ? 'Sí' : 'No')

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario o contraseña incorrectos' },
        { status: 401 }
      )
    }

    // Verificar si el usuario está activo
    if (!usuario.activo) {
      return NextResponse.json(
        { error: 'Usuario desactivado. Contacte al administrador.' },
        { status: 401 }
      )
    }

    // Verificar contraseña
    const isValidPassword = await verifyPassword(password, usuario.password)
    
    console.log('Password válido:', isValidPassword)
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Usuario o contraseña incorrectos' },
        { status: 401 }
      )
    }

    // Actualizar último acceso
    await (prisma as any).usuarios.update({
      where: { id: usuario.id },
      data: { ultimo_acceso: new Date() }
    })

    // Generar token
    const token = generateToken({
      id: usuario.id,
      username: usuario.username,
      rol: usuario.rol,
      nombre: usuario.nombre
    })

    // Crear respuesta con cookie
    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id: usuario.id,
        username: usuario.username,
        nombre: usuario.nombre,
        rol: usuario.rol,
        email: usuario.email
      }
    })
    
// Establecer cookie con el token
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: false, // Cambiar a false para permitir HTTP
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 horas
      path: '/', // Asegurar que la cookie esté disponible en toda la aplicación
      domain: undefined // Dejar que Next.js maneje el dominio
    })
    
    return response
  } catch (error) {
    console.error('Error en login:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}