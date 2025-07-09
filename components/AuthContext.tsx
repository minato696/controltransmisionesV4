// components/AuthContext.tsx
"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: number
  username: string
  nombre: string
  rol: string
  email?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  isAdmin: () => boolean
  isOperador: () => boolean
  canEditCities: () => boolean
  canEditReporters: () => boolean
  canEditDespachos: () => boolean
  canViewReports: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Cargar usuario al iniciar
  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (storedToken && storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        setToken(storedToken)
        setUser(userData)
        // Usuario cargado correctamente
      } catch (error) {
        console.error('Error al cargar usuario:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (username: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al iniciar sesión')
    }

    // Guardar en localStorage y estado
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setToken(data.token)
    setUser(data.user)

    // Redirigir al dashboard
    router.push('/')
  }

  const logout = async () => {
    // Llamar al endpoint de logout para eliminar la cookie
    await fetch('/api/auth/logout', { method: 'POST' })
    
    // Limpiar localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
    
    // Usar window.location para asegurar la redirección
    window.location.href = '/login'
  }

  // Funciones de verificación de permisos
  const isAdmin = () => user?.rol === 'admin'
  const isOperador = () => user?.rol === 'operador'

  const canEditCities = () => isAdmin()
  const canEditReporters = () => isAdmin()
  const canEditDespachos = () => true // Ambos roles pueden editar despachos
  const canViewReports = () => true // Ambos roles pueden ver reportes

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      logout,
      isAdmin,
      isOperador,
      canEditCities,
      canEditReporters,
      canEditDespachos,
      canViewReports
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider')
  }
  return context
}