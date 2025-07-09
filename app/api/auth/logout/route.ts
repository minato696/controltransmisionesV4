// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true })
  
  // Eliminar la cookie del token
  response.cookies.delete('token')
  
  return response
}