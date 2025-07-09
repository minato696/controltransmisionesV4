// components/modals/EditCiudadModal.tsx
import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faCity, faTimes, faSpinner, faSave, faExclamationCircle, 
  faUser, faUsers, faCheckCircle, faExclamationTriangle, faBan,
  faEdit, faTrash, faPlus
} from '@fortawesome/free-solid-svg-icons'
import { useAppContext } from '../AppContext'
import AddReporteroModal from './AddReporteroModal'
import ConfirmDeleteModal from './ConfirmDeleteModal'

interface Reportero {
  id: number
  nombre: string
  estado: string
}

interface EditCiudadModalProps {
  show: boolean
  onClose: () => void
  ciudad: {
    id: number
    codigo: string
    nombre: string
    activo: boolean
    reporteros?: Reportero[]
  } | null
  onSuccess?: () => void
}

const EditCiudadModal: React.FC<EditCiudadModalProps> = ({ 
  show, 
  onClose,
  ciudad,
  onSuccess
}) => {
  const { setNotification } = useAppContext()
  
  const [nombre, setNombre] = useState('')
  const [activo, setActivo] = useState(true)
  const [loading, setLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [reporteros, setReporteros] = useState<Reportero[]>([])
  
  // Estados para modales de reporteros
  const [showAddReporteroModal, setShowAddReporteroModal] = useState(false)
  const [showEditReporteroModal, setShowEditReporteroModal] = useState(false)
  const [showDeleteReporteroModal, setShowDeleteReporteroModal] = useState(false)
  const [reporteroToEdit, setReporteroToEdit] = useState<Reportero | null>(null)
  const [reporteroToDelete, setReporteroToDelete] = useState<Reportero | null>(null)
  const [isDeletingReportero, setIsDeletingReportero] = useState(false)

  // Cargar datos de la ciudad cuando se abre el modal
  useEffect(() => {
    if (ciudad && show) {
      setNombre(ciudad.nombre)
      setActivo(ciudad.activo)
      loadReporteros()
      setHasChanges(false)
    }
  }, [ciudad, show])

  // Cargar reporteros de la ciudad
  const loadReporteros = async () => {
    if (!ciudad) return
    
    try {
      const response = await fetch(`/api/reporteros/ciudad/${ciudad.codigo}`)
      if (response.ok) {
        const data = await response.json()
        setReporteros(data)
      }
    } catch (error) {
      console.error('Error al cargar reporteros:', error)
    }
  }

  // Detectar cambios
  useEffect(() => {
    if (ciudad) {
      const cambios = nombre !== ciudad.nombre || activo !== ciudad.activo
      setHasChanges(cambios)
    }
  }, [nombre, activo, ciudad])

  // Función para generar el código a partir del nombre (solo visual, no se puede cambiar)
  const generarCodigo = (nombreCiudad: string): string => {
    return nombreCiudad
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');
  }

  // Función para obtener el icono del estado del reportero
  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'activo':
        return faCheckCircle
      case 'ausente':
        return faExclamationTriangle
      case 'inactivo':
        return faBan
      default:
        return faUser
    }
  }

  // Función para obtener el color del estado
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activo':
        return 'text-[#10b981]'
      case 'ausente':
        return 'text-[#f59e0b]'
      case 'inactivo':
        return 'text-[#ef4444]'
      default:
        return 'text-[#64748b]'
    }
  }

  // Manejar edición de reportero
  const handleEditReportero = (reportero: Reportero) => {
    setReporteroToEdit({
      ...reportero,
      ciudad: ciudad
    } as any)
    setShowEditReporteroModal(true)
  }

  // Manejar eliminación de reportero
  const handleDeleteReportero = (reportero: Reportero) => {
    setReporteroToDelete(reportero)
    setShowDeleteReporteroModal(true)
  }

  // Confirmar eliminación de reportero
  const confirmDeleteReportero = async () => {
    if (!reporteroToDelete) return
    
    setIsDeletingReportero(true)
    
    try {
      const response = await fetch(`/api/reporteros/${reporteroToDelete.id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Error al eliminar reportero')
      }
      
      // Actualizar lista local
      setReporteros(reporteros.filter(r => r.id !== reporteroToDelete.id))
      
      setNotification({
        show: true,
        type: 'success',
        title: 'Reportero eliminado',
        message: `${reporteroToDelete.nombre} ha sido eliminado correctamente`
      })
      
      setShowDeleteReporteroModal(false)
      setReporteroToDelete(null)
    } catch (error) {
      console.error('Error al eliminar reportero:', error)
      setNotification({
        show: true,
        type: 'error',
        title: 'Error',
        message: 'No se pudo eliminar el reportero'
      })
    } finally {
      setIsDeletingReportero(false)
    }
  }

  // Validar y guardar cambios de la ciudad
  const handleSubmit = async () => {
    // Validaciones básicas
    if (!nombre.trim()) {
      setNotification({
        show: true,
        type: 'error',
        title: 'Error',
        message: 'El nombre de la ciudad es obligatorio'
      })
      return
    }

    // Verificar si hubo cambios
    if (!hasChanges) {
      setNotification({
        show: true,
        type: 'info',
        title: 'Sin cambios',
        message: 'No se han realizado cambios'
      })
      return
    }
    
    setLoading(true)
    
    try {
      // Actualizar la ciudad
      const response = await fetch(`/api/ciudades/${ciudad?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          codigo: ciudad?.codigo, // El código no se puede cambiar
          nombre,
          activo
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al actualizar ciudad')
      }
      
      // Mostrar notificación de éxito
      setNotification({
        show: true,
        type: 'success',
        title: 'Ciudad actualizada',
        message: `La ciudad ${nombre} ha sido actualizada correctamente`
      })
      
      // Cerrar modal
      onClose()
      
      // Callback de éxito
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error('Error al actualizar ciudad:', error)
      setNotification({
        show: true,
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'No se pudo actualizar la ciudad'
      })
    } finally {
      setLoading(false)
    }
  }

  if (!show || !ciudad) return null

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backdropFilter: "blur(8px)", backgroundColor: "rgba(0, 0, 0, 0.4)" }}>
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden transform transition-transform duration-300">
          <div className="flex justify-between items-center px-5 py-4 border-b border-[#e2e8f0] bg-[#f8fafc]">
            <h3 className="text-lg font-semibold text-[#1a365d] flex items-center gap-2">
              <FontAwesomeIcon icon={faCity} />
              Editar Ciudad
            </h3>
            <button 
              className="text-[#64748b] hover:text-[#1e293b] transition-colors text-xl"
              onClick={onClose}
              disabled={loading}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
          
          <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="p-6">
              {/* Información básica de la ciudad */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-[#1a365d] mb-4 flex items-center gap-2">
                  <FontAwesomeIcon icon={faCity} />
                  Información de la Ciudad
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="ciudad-codigo" className="block mb-2 text-sm font-medium text-[#475569]">
                      Código de la Ciudad:
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="ciudad-codigo"
                        className="w-full px-3.5 py-2.5 text-sm border border-[#e2e8f0] rounded-lg shadow-sm bg-[#f1f5f9] cursor-not-allowed"
                        value={ciudad.codigo}
                        disabled
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b]">
                        <FontAwesomeIcon icon={faExclamationCircle} className="text-xs" />
                      </div>
                    </div>
                    <p className="text-xs text-[#64748b] mt-1">El código no se puede modificar</p>
                  </div>
                  
                  <div>
                    <label htmlFor="ciudad-nombre" className="block mb-2 text-sm font-medium text-[#475569]">
                      Nombre de la Ciudad:
                    </label>
                    <input
                      type="text"
                      id="ciudad-nombre"
                      className="w-full px-3.5 py-2.5 text-sm border border-[#e2e8f0] rounded-lg shadow-sm focus:outline-none focus:border-[#1a56db] focus:ring-2 focus:ring-[#1a56db] focus:ring-opacity-20"
                      placeholder="Ejemplo: Arequipa, Cusco, etc."
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      disabled={loading}
                    />
                    {nombre && nombre !== ciudad.nombre && (
                      <p className="text-xs text-[#64748b] mt-1">
                        Nuevo código sugerido: <span className="font-mono bg-[#f1f5f9] px-1 rounded">{generarCodigo(nombre)}</span>
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-[#1a56db] bg-gray-100 border-gray-300 rounded focus:ring-[#1a56db]"
                      checked={activo}
                      onChange={(e) => setActivo(e.target.checked)}
                      disabled={loading}
                    />
                    <span className="text-sm font-medium text-[#475569]">
                      Ciudad activa
                    </span>
                  </label>
                  <p className="text-xs text-[#64748b] mt-1 ml-7">
                    Las ciudades inactivas no aparecerán en los selectores y no se podrán registrar despachos
                  </p>
                  {!activo && ciudad.activo && (
                    <div className="mt-2 ml-7 bg-[#fffbeb] border border-[#f59e0b] rounded-lg p-2">
                      <p className="text-xs text-[#b45309]">
                        <FontAwesomeIcon icon={faExclamationCircle} className="mr-1" />
                        Al desactivar esta ciudad, no se podrán registrar nuevos despachos
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Separador */}
              <div className="border-t border-[#e2e8f0] my-6"></div>

              {/* Lista de reporteros */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm font-semibold text-[#1a365d] flex items-center gap-2">
                    <FontAwesomeIcon icon={faUsers} />
                    Reporteros Asignados
                    <span className="ml-2 text-xs bg-[#e0f2fe] text-[#1a56db] px-2 py-1 rounded-full">
                      {reporteros.length} {reporteros.length === 1 ? 'reportero' : 'reporteros'}
                    </span>
                  </h4>
                  <button
                    className="px-3 py-1.5 text-xs bg-[#10b981] text-white rounded-lg hover:bg-[#0d9669] transition-colors flex items-center gap-1"
                    onClick={() => setShowAddReporteroModal(true)}
                  >
                    <FontAwesomeIcon icon={faPlus} />
                    Agregar Reportero
                  </button>
                </div>
                
                {reporteros.length > 0 ? (
                  <div className="bg-[#f8fafc] rounded-lg p-4 max-h-60 overflow-y-auto">
                    <div className="grid grid-cols-1 gap-3">
                      {reporteros.map((reportero) => (
                        <div 
                          key={reportero.id} 
                          className="bg-white border border-[#e2e8f0] rounded-lg p-3 flex items-center gap-3 hover:shadow-sm transition-shadow"
                        >
                          <div className={`w-8 h-8 rounded-full bg-[#e0f2fe] flex items-center justify-center ${getEstadoColor(reportero.estado)}`}>
                            <FontAwesomeIcon icon={getEstadoIcon(reportero.estado)} />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm text-[#1e293b]">{reportero.nombre}</p>
                            <p className="text-xs text-[#64748b] capitalize">{reportero.estado}</p>
                          </div>
                          <div className="flex gap-1">
                            <button
                              className="w-8 h-8 flex items-center justify-center rounded-full text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#1a56db] transition-colors"
                              onClick={() => handleEditReportero(reportero)}
                              title="Editar reportero"
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </button>
                            <button
                              className="w-8 h-8 flex items-center justify-center rounded-full text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#ef4444] transition-colors"
                              onClick={() => handleDeleteReportero(reportero)}
                              title="Eliminar reportero"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#f8fafc] rounded-lg p-6 text-center">
                    <FontAwesomeIcon icon={faUsers} className="text-3xl text-[#cbd5e1] mb-2" />
                    <p className="text-sm text-[#64748b]">No hay reporteros asignados a esta ciudad</p>
                    <button
                      className="mt-3 px-4 py-2 text-sm bg-[#1a56db] text-white rounded-lg hover:bg-[#1e429f] transition-colors"
                      onClick={() => setShowAddReporteroModal(true)}
                    >
                      <FontAwesomeIcon icon={faPlus} className="mr-2" />
                      Agregar el primer reportero
                    </button>
                  </div>
                )}

                {reporteros.length > 0 && !activo && (
                  <div className="mt-3 bg-[#fee2e2] border border-[#fecaca] rounded-lg p-3">
                    <p className="text-xs text-[#dc2626]">
                      <FontAwesomeIcon icon={faExclamationCircle} className="mr-1" />
                      Al desactivar la ciudad, los {reporteros.length} reporteros no podrán registrar nuevos despachos
                    </p>
                  </div>
                )}
              </div>

              {/* Indicador de cambios */}
              {hasChanges && (
                <div className="bg-[#eff6ff] border border-[#3b82f6] rounded-lg p-3 mt-6">
                  <p className="text-sm text-[#1e40af]">
                    <FontAwesomeIcon icon={faExclamationCircle} className="mr-1" />
                    Tienes cambios sin guardar en la información de la ciudad
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end p-5 gap-3 border-t border-[#e2e8f0] bg-[#f8fafc]">
            <button
              className="px-4 py-2.5 bg-white text-[#1e293b] border border-[#e2e8f0] rounded-lg hover:bg-[#f1f5f9] transition-colors"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              className="px-4 py-2.5 bg-[#1a56db] text-white rounded-lg hover:bg-[#1e429f] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSubmit}
              disabled={loading || !hasChanges}
            >
              {loading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  Guardando...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSave} />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Modal para agregar reportero */}
      <AddReporteroModal
        show={showAddReporteroModal}
        onClose={() => setShowAddReporteroModal(false)}
        reportero={null}
        ciudadPredefinida={ciudad?.id}
        onSuccess={() => {
          loadReporteros()
          setShowAddReporteroModal(false)
        }}
      />

      {/* Modal para editar reportero */}
      <AddReporteroModal
        show={showEditReporteroModal}
        onClose={() => {
          setShowEditReporteroModal(false)
          setReporteroToEdit(null)
        }}
        reportero={reporteroToEdit}
        onSuccess={() => {
          loadReporteros()
          setShowEditReporteroModal(false)
          setReporteroToEdit(null)
        }}
      />

      {/* Modal de confirmación para eliminar reportero */}
      <ConfirmDeleteModal
        show={showDeleteReporteroModal}
        onClose={() => {
          setShowDeleteReporteroModal(false)
          setReporteroToDelete(null)
        }}
        onConfirm={confirmDeleteReportero}
        nombreReportero={reporteroToDelete?.nombre || ''}
        isDeleting={isDeletingReportero}
      />
    </>
  )
}

export default EditCiudadModal