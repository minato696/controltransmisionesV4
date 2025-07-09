// components/Tabs.tsx
"use client"

import { useAppContext } from './AppContext'
import { useAuth } from './AuthContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faClipboardList, 
  faCity, 
  faUsers, 
  faChartBar,
  faFileAlt,
  faLock
} from '@fortawesome/free-solid-svg-icons'

const Tabs = () => {
  const { activeTab, setActiveTab } = useAppContext()
  const { user, isAdmin } = useAuth()

  // Definir tabs con permisos
  const tabs = [
    { 
      id: 'registro', 
      label: 'Registro de Despachos', 
      icon: faClipboardList,
      requiresAdmin: false 
    },
    { 
      id: 'ciudades', 
      label: 'Todas las Ciudades', 
      icon: faCity,
      requiresAdmin: false  // Cambiado a false temporalmente
    },
    { 
      id: 'reporteros', 
      label: 'Todos los Reporteros', 
      icon: faUsers,
      requiresAdmin: false  // Cambiado a false temporalmente
    },
    { 
      id: 'resumen', 
      label: 'Resumen Semanal', 
      icon: faChartBar,
      requiresAdmin: false 
    },
    { 
      id: 'informes', 
      label: 'Informes', 
      icon: faFileAlt,
      requiresAdmin: false 
    },
  ]

  // Filtrar tabs según permisos
  const availableTabs = tabs.filter(tab => !tab.requiresAdmin || isAdmin())

  return (
    <div className="tabs">
      {tabs.map(tab => {
        const isDisabled = tab.requiresAdmin && !isAdmin()
        const isAvailable = availableTabs.some(t => t.id === tab.id)
        
        if (!isAvailable) {
          // Mostrar tab deshabilitado para operadores
          return (
            <div 
              key={tab.id}
              className="tab disabled opacity-50 cursor-not-allowed relative"
              title="Solo disponible para administradores"
            >
              <FontAwesomeIcon icon={tab.icon} />
              {tab.label}
              <FontAwesomeIcon 
                icon={faLock} 
                className="ml-2 text-xs" 
              />
            </div>
          )
        }
        
        return (
          <div 
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <FontAwesomeIcon icon={tab.icon} />
            {tab.label}
          </div>
        )
      })}
    </div>
  )
}

export default Tabs