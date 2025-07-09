// app/login/page.tsx
"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faLock, faSpinner, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      })

      const data = await response.json()

      if (response.ok) {
        // Guardar token en localStorage
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        
        // Usar window.location para asegurar la redirección en producción
        window.location.href = '/'
      } else {
        setError(data.error || 'Error al iniciar sesión')
      }
    } catch (error) {
      setError('Error de conexión. Por favor intente nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="inline-flex justify-center mb-4">
            <img 
              src="https://statics.exitosanoticias.pe/exitosa/img/global/exitosa.svg" 
              alt="Radio Exitosa" 
              className="h-16 w-auto"
            />
          </div>
          <h1 className="text-2xl font-bold text-[#1a365d]">Sistema de Control de Despachos</h1>
          <p className="text-[#64748b] mt-2">Ingrese sus credenciales para continuar</p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Campo de usuario */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-[#475569] mb-3">
                Usuario
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FontAwesomeIcon icon={faUser} className="text-[#94a3b8]" />
                </div>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#1a56db] focus:ring-2 focus:ring-[#1a56db] focus:ring-opacity-20 transition-all"
                  placeholder="Ingrese su usuario"
                  required
                  disabled={loading}
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Campo de contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#475569] mb-3">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FontAwesomeIcon icon={faLock} className="text-[#94a3b8]" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#1a56db] focus:ring-2 focus:ring-[#1a56db] focus:ring-opacity-20 transition-all"
                  placeholder="Ingrese su contraseña"
                  required
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#94a3b8] hover:text-[#64748b] transition-colors"
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>

            {/* Mensaje de error */}
            {error && (
              <div className="bg-[#fee2e2] border border-[#fecaca] text-[#dc2626] px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Botón de submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1a56db] text-white py-3 rounded-lg font-medium hover:bg-[#1e429f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin />
                    Iniciando sesión...
                  </>
                ) : (
                  'Iniciar Sesión'
                )}
              </button>
            </div>
          </form>

          {/* Información adicional */}
          <div className="mt-8 pt-6 border-t border-[#e2e8f0]">
            <p className="text-xs text-[#94a3b8] text-center">
              Versión 1.0.0 © 2025 Desarrollado para Radio Exitosa
            </p>
          </div>
        </div>

        {/* Pie de página */}
        <p className="text-center text-sm text-[#64748b] mt-8">
          Sistema protegido. El acceso está restringido solo a usuarios autorizados.
        </p>
      </div>
    </div>
  )
}