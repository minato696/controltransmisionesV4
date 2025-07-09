"use client"

import { useAppContext } from './AppContext'
import RegistroTab from './tabs/RegistroTab'
import CiudadesTab from './tabs/CiudadesTab'
import ReporterosTab from './tabs/ReporterosTab'
import ResumenTab from './tabs/ResumenTab'
import ConfigTab from './tabs/ConfigTab'
import InformesTab from './tabs/InformesTab'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCity, faUsers, faChartBar, faCog } from '@fortawesome/free-solid-svg-icons'

// Mantenemos el PlaceholderTab como respaldo por si alguna pestaña no está lista
const PlaceholderTab = ({ name, icon }: { name: string, icon: any }) => (
  <div className="flex flex-col items-center justify-center py-12 text-gray">
    <FontAwesomeIcon icon={icon} className="text-5xl mb-4 text-gray-medium" />
    <h2 className="text-2xl font-semibold mb-2 text-primary-darker">Contenido de {name}</h2>
    <p className="text-center max-w-md mb-6">
      Esta sección está en desarrollo. Pronto podrás gestionar {name.toLowerCase()} en tu sistema.
    </p>
    <div className="px-6 py-3 bg-gray-light rounded-lg text-gray-dark inline-block">
      Próximamente
    </div>
  </div>
)

const MainContent = () => {
  const { activeTab } = useAppContext()

  return (
    <div className="p-6">
      {activeTab === 'registro' && <RegistroTab />}
      {activeTab === 'ciudades' && <CiudadesTab />}
      {activeTab === 'reporteros' && <ReporterosTab />}
      {activeTab === 'resumen' && <ResumenTab />}
      {activeTab === 'informes' && <InformesTab />}
      {activeTab === 'config' && <ConfigTab />}
    </div>
  )
}

export default MainContent