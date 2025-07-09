// components/Header.tsx
"use client"

import { useState, useRef, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSignOutAlt, faUser, faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { useAuth } from './AuthContext'

const Header = () => {
  const { user, logout } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const getInitials = (username: string) => {
    // Para "exitosa" devolver "E", para "admin_control" devolver "A"
    if (username === 'exitosa') return 'E'
    if (username === 'admin_control') return 'A'
    return username.charAt(0).toUpperCase()
  }

  const getDisplayName = (username: string) => {
    // Mostrar solo el username capitalizado
    if (username === 'exitosa') return 'Exitosa'
    if (username === 'admin_control') return 'Admin'
    return username
  }

  const getRoleLabel = (rol: string) => {
    return rol === 'admin' ? 'Administrador' : 'Usuario'
  }

  const getRoleColor = (rol: string) => {
    return rol === 'admin' ? 'bg-[#dc2626]' : 'bg-[#10b981]'
  }

  return (
    <header className="bg-primary text-white py-3 shadow sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="https://statics.exitosanoticias.pe/exitosa/img/global/exitosa.svg" 
              alt="Exitosa Logo" 
              className="h-10 w-auto"
            />
            <div className="hidden md:block">
              <h1 className="font-semibold text-xl m-0">Sistema de Control de Despachos</h1>
            </div>
          </div>
          
          <div className="relative" ref={dropdownRef}>
            <div 
              className="flex items-center gap-3 px-4 py-2 bg-white bg-opacity-90 rounded-full cursor-pointer transition-all hover:bg-opacity-100"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <div className="w-9 h-9 rounded-full bg-[#1a56db] text-white flex items-center justify-center font-bold text-lg">
                {user ? getInitials(user.username) : 'U'}
              </div>
              <div className="text-left">
                <div className="font-medium text-[#1e293b]">{user ? getDisplayName(user.username) : 'Usuario'}</div>
              </div>
              <FontAwesomeIcon icon={faChevronDown} className="text-sm text-[#64748b]" />
            </div>

            {/* Dropdown menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="px-4 py-3 bg-[#f8fafc] border-b border-[#e2e8f0]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white text-[#1a56db] flex items-center justify-center font-bold text-lg">
                      {user ? getInitials(user.username) : 'U'}
                    </div>
                    <div>
                      <div className="font-medium text-[#1e293b]">Usuario: {user ? getDisplayName(user.username) : 'Usuario'}</div>
                      <div className="text-sm text-[#64748b]">@{user?.username}</div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold text-white ${getRoleColor(user?.rol || '')}`}>
                      {user ? getRoleLabel(user.rol) : ''}
                    </span>
                  </div>
                </div>
                
                <div className="py-2">
                  <button
                    className="w-full px-4 py-2 text-left text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#1e293b] transition-colors flex items-center gap-3"
                    onClick={() => {
                      setShowDropdown(false)
                      // Aquí podrías abrir un modal de perfil
                    }}
                  >
                    <FontAwesomeIcon icon={faUser} />
                    Mi Perfil
                  </button>
                  
                  <hr className="my-2 border-[#e2e8f0]" />
                  
                  <button
                    className="w-full px-4 py-2 text-left text-[#ef4444] hover:bg-[#fee2e2] transition-colors flex items-center gap-3"
                    onClick={() => {
                      setShowDropdown(false)
                      logout()
                    }}
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} />
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header