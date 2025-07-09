// app/page.tsx
"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '../components/Header'
import DateNavigation from '../components/DateNavigation'
import Tabs from '../components/Tabs'
import MainContent from '../components/MainContent'
import Notification from '../components/Notification'
import { AppProvider, useAppContext } from '../components/AppContext'
import { AuthProvider } from '../components/AuthContext'

// Componente interno que usa el contexto
const AppContent = () => {
  const { notification, setNotification } = useAppContext()
  const [isReady, setIsReady] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Verificar si hay usuario en localStorage
    const user = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    
    if (!user || !token) {
      // Si no hay usuario o token, redirigir al login
      window.location.href = '/login'
    } else {
      setIsReady(true)
    }
  }, [])

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#64748b]">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-light text-dark">
      <Header />
      
      <main className="py-6">
        <div className="container mx-auto px-4">
          <DateNavigation />
          
          <div className="card">
            <Tabs />
            <MainContent />
          </div>
        </div>
      </main>
      
      <Notification 
        show={notification.show}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onClose={() => setNotification({...notification, show: false})}
      />
    </div>
  )
}

// Componente principal que provee el contexto
export default function Home() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  )
}