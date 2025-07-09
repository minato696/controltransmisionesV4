// components/tabs/CiudadesTab.tsx
import { useState, useEffect } from 'react'
import { useAppContext } from '../AppContext'
import { useAuth } from '../AuthContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faCity, faPlus, faSearch, faUser, faClipboardList, 
  faSpinner, faMapMarkerAlt, faTrash, faEdit, faEllipsisV 
} from '@fortawesome/free-solid-svg-icons'
import { formatCityName } from '../../utils/cityUtils'
import AddCiudadModal from '../modals/AddCiudadModal'
import EditCiudadModal from '../modals/EditCiudadModal'
import ConfirmDeleteCiudadModal from '../modals/ConfirmDeleteCiudadModal'

interface Ciudad {
  id: number
  codigo: string
  nombre: string
  activo: boolean
  reporteros: Array<{
    id: number
    nombre: string
    estado: string
  }>
  _count?: {
    reporteros: number
  }
}

const CiudadesTab = () => {
  const { setActiveTab, setSelectedCity, setNotification } = useAppContext()
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [ciudades, setCiudades] = useState<Ciudad[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [ciudadToEdit, setCiudadToEdit] = useState<Ciudad | null>(null)
  const [ciudadToDelete, setCiudadToDelete] = useState<Ciudad | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showOptionsFor, setShowOptionsFor] = useState<number | null>(null)

  // Cargar ciudades desde la API
  const loadCiudades = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/ciudades?include=reporteros')
      if (!response.ok) {
        throw new Error('Error al obtener ciudades')
      }
      const data = await response.json()
      setCiudades(data)
    } catch (error) {
      console.error('Error al cargar ciudades:', error)
      setNotification({
        show: true,
        type: 'error',
        title: 'Error',
        message: 'No se pudieron cargar las ciudades'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCiudades()
  }, [setNotification])

  // Cerrar menú de opciones al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showOptionsFor !== null) {
        setShowOptionsFor(null)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [showOptionsFor])

  // Filtrar ciudades según búsqueda
  const filteredCities = ciudades.filter(ciudad => 
    ciudad.codigo.includes(searchTerm.toLowerCase()) || 
    ciudad.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Función para seleccionar ciudad y cambiar a pestaña de registro
  const selectCityAndTab = (cityCode: string) => {
    setSelectedCity(cityCode)
    setActiveTab('registro')
  }

  // Función para mostrar el modal de edición
  const handleShowEditModal = (ciudad: Ciudad) => {
    setCiudadToEdit(ciudad)
    setShowEditModal(true)
    setShowOptionsFor(null)
  }

  // Función para mostrar el modal de confirmación de eliminación
  const handleShowDeleteConfirmation = (ciudad: Ciudad) => {
    setCiudadToDelete(ciudad)
    setShowDeleteModal(true)
    setShowOptionsFor(null)
  }

  // Función para eliminar ciudad
  const handleConfirmDelete = async () => {
    if (!ciudadToDelete) return
    
    try {
      setIsDeleting(true)
      
      const response = await fetch(`/api/ciudades/${ciudadToDelete.id}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al eliminar ciudad')
      }
      
      // Actualizar la lista de ciudades
      setCiudades(prevCiudades => prevCiudades.filter(c => c.id !== ciudadToDelete.id))
      
      setNotification({
        show: true,
        type: 'success',
        title: 'Ciudad eliminada',
        message: data.message || `La ciudad ${ciudadToDelete.nombre} ha sido eliminada correctamente`
      })
      
      // Cerrar el modal
      setShowDeleteModal(false)
      setCiudadToDelete(null)
    } catch (error) {
      console.error('Error al eliminar ciudad:', error)
      
      let errorMessage = 'No se pudo eliminar la ciudad'
      if (error instanceof Error) {
        // Si el error incluye información sobre reporteros asociados
        if (error.message.includes('reporteros asociados')) {
          errorMessage = error.message
        }
      }
      
      setNotification({
        show: true,
        type: 'error',
        title: 'Error',
        message: errorMessage
      })
    } finally {
      setIsDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <FontAwesomeIcon icon={faSpinner} spin className="text-3xl text-primary mr-3" />
        <span className="text-lg">Cargando ciudades...</span>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-[#1a365d] flex items-center gap-3">
          <FontAwesomeIcon icon={faCity} />
          Todas las Ciudades <span className="ml-2 text-sm bg-[#e0f2fe] text-[#1a56db] px-2 py-1 rounded-full">
            {ciudades.length} ciudades
          </span>
        </h2>
        {user && user.rol === 'admin' && (
          <button 
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[#1a56db] text-white rounded-lg shadow-sm hover:bg-[#1e429f] transition-colors"
            onClick={() => setShowModal(true)}
          >
            <FontAwesomeIcon icon={faPlus} />
            Agregar Ciudad
          </button>
        )}
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <FontAwesomeIcon icon={faSearch} className="text-[#64748b]" />
        </div>
        <input 
          type="text" 
          className="w-full pl-12 pr-4 py-3 text-sm border border-[#e2e8f0] rounded-lg shadow-sm transition-all focus:outline-none focus:border-[#1a56db] focus:ring focus:ring-[#1a56db] focus:ring-opacity-25"
          placeholder="Buscar ciudad..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCities.map((ciudad) => (
          <div 
            key={ciudad.id}
            className="border border-[#e2e8f0] rounded-lg shadow p-6 hover:shadow-md hover:-translate-y-[3px] transition-all h-full flex flex-col relative"
          >
            {/* Botón de opciones - solo para administradores */}
            {user && user.rol === 'admin' && (
              <div className="absolute top-4 right-4">
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-full text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#1e293b] transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowOptionsFor(showOptionsFor === ciudad.id ? null : ciudad.id)
                  }}
                >
                  <FontAwesomeIcon icon={faEllipsisV} />
                </button>
                
                {/* Menú desplegable */}
                {showOptionsFor === ciudad.id && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-[#e2e8f0] z-10">
                    <button
                      className="w-full px-4 py-2 text-left text-sm hover:bg-[#f1f5f9] transition-colors flex items-center gap-2"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleShowEditModal(ciudad)
                      }}
                    >
                      <FontAwesomeIcon icon={faEdit} className="text-[#1a56db]" />
                      Editar Ciudad
                    </button>
                    <button
                      className="w-full px-4 py-2 text-left text-sm hover:bg-[#f1f5f9] transition-colors flex items-center gap-2 text-[#ef4444]"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleShowDeleteConfirmation(ciudad)
                      }}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                      Eliminar Ciudad
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between items-center pb-4 border-b border-[#e2e8f0] mb-4">
              <h3 className="text-lg font-semibold text-[#1a365d] flex items-center pr-8">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-[#1a56db]" />
                {ciudad.nombre}
              </h3>
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-[#e0f2fe] text-[#1a56db]">
                {ciudad.reporteros.length} {ciudad.reporteros.length === 1 ? 'reportero' : 'reporteros'}
              </span>
            </div>
            
            {/* Estado de la ciudad */}
            <div className="mb-3">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                ciudad.activo 
                  ? 'bg-[#ecfdf5] text-[#10b981]' 
                  : 'bg-[#fee2e2] text-[#ef4444]'
              }`}>
                {ciudad.activo ? 'Activa' : 'Inactiva'}
              </span>
            </div>
            
            {/* Lista de reporteros */}
            <div className="flex-1 mb-4">
              {ciudad.reporteros.length > 0 ? (
                <ul className="text-sm">
                  {ciudad.reporteros.map(reportero => (
                    <li key={reportero.id} className="py-2 border-b border-[#f1f5f9] last:border-b-0 flex items-center">
                      <FontAwesomeIcon icon={faUser} className="text-[#64748b] mr-2" />
                      {reportero.nombre}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[#64748b] italic">No hay reporteros asignados</p>
              )}
            </div>
            
            <div className="mt-auto">
              <button 
                onClick={() => selectCityAndTab(ciudad.codigo)}
                className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-sm bg-white text-[#1a56db] border border-[#bfdbfe] rounded-lg shadow-sm hover:bg-[#e0f2fe] transition-colors"
                disabled={!ciudad.activo}
              >
                <FontAwesomeIcon icon={faClipboardList} />
                {ciudad.activo ? 'Registrar Despachos' : 'Ciudad Inactiva'}
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {filteredCities.length === 0 && (
        <div className="text-center p-8 bg-[#f8fafc] rounded-lg border border-[#e2e8f0] text-[#64748b]">
          <p>No se encontraron ciudades con ese término de búsqueda.</p>
        </div>
      )}
      
      {/* Modal para agregar ciudad y reporteros */}
      <AddCiudadModal 
        show={showModal} 
        onClose={() => setShowModal(false)} 
        onSuccess={() => {
          loadCiudades()
        }}
      />
      
      {/* Modal para editar ciudad */}
      <EditCiudadModal
        show={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setCiudadToEdit(null)
        }}
        ciudad={ciudadToEdit}
        onSuccess={() => {
          loadCiudades()
        }}
      />
      
      {/* Modal de confirmación para eliminar ciudad */}
      <ConfirmDeleteCiudadModal
        show={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setCiudadToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        ciudad={ciudadToDelete ? {
          nombre: ciudadToDelete.nombre,
          reporterosCount: ciudadToDelete.reporteros.length
        } : null}
        isDeleting={isDeleting}
      />
    </div>
  )
}

export default CiudadesTab