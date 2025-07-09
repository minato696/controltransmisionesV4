// components/modals/AddReporteroModal.tsx
import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faUser, 
  faPlus, 
  faTimes, 
  faSpinner, 
  faCity, 
  faPencilAlt
} from '@fortawesome/free-solid-svg-icons'
import { useAppContext } from '../AppContext'

interface AddReporteroModalProps {
  show: boolean
  onClose: () => void
  reportero?: any // Reportero a editar (opcional)
  ciudadPredefinida?: number // ID de ciudad predefinida (opcional)
  onSuccess?: () => void
}

const AddReporteroModal: React.FC<AddReporteroModalProps> = ({ 
  show, 
  onClose,
  reportero,
  ciudadPredefinida,
  onSuccess
}) => {
  const { setNotification } = useAppContext()
  
  const [nombre, setNombre] = useState('')
  const [ciudadId, setCiudadId] = useState('')
  const [estado, setEstado] = useState('activo')
  const [ciudades, setCiudades] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [formLoading, setFormLoading] = useState(true)

  // Cargar datos al abrir el modal
  useEffect(() => {
    if (show) {
      // Cargar ciudades
      const fetchCiudades = async () => {
        setFormLoading(true)
        try {
          const response = await fetch('/api/ciudades')
          const data = await response.json()
          setCiudades(data)
          
          // Si hay un reportero para editar, cargar sus datos
          if (reportero) {
            setNombre(reportero.nombre)
            setCiudadId(reportero.ciudad.id.toString())
            setEstado(reportero.estado)
          } else {
            // Valores por defecto para nuevo reportero
            setNombre('')
            // Si hay una ciudad predefinida, usarla
            if (ciudadPredefinida) {
              setCiudadId(ciudadPredefinida.toString())
            } else {
              setCiudadId(data.length > 0 ? data[0].id.toString() : '')
            }
            setEstado('activo')
          }
        } catch (error) {
          console.error('Error al cargar ciudades:', error)
          setNotification({
            show: true,
            type: 'error',
            title: 'Error',
            message: 'No se pudieron cargar las ciudades'
          })
        } finally {
          setFormLoading(false)
        }
      }
      
      fetchCiudades()
    }
  }, [show, reportero, setNotification])

  // Validar y guardar datos
  const handleSubmit = async () => {
    // Validaciones básicas
    if (!nombre.trim()) {
      setNotification({
        show: true,
        type: 'error',
        title: 'Error',
        message: 'El nombre del reportero es obligatorio'
      })
      return
    }
    
    if (!ciudadId) {
      setNotification({
        show: true,
        type: 'error',
        title: 'Error',
        message: 'Debe seleccionar una ciudad'
      })
      return
    }
    
    setLoading(true)
    
    try {
      if (reportero) {
        // Actualizar reportero existente
        const response = await fetch(`/api/reporteros/${reportero.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            nombre,
            ciudad_id: parseInt(ciudadId),
            estado
          })
        })
        
        if (!response.ok) {
          throw new Error('Error al actualizar reportero')
        }
        
        setNotification({
          show: true,
          type: 'success',
          title: 'Reportero actualizado',
          message: `${nombre} ha sido actualizado correctamente`
        })
      } else {
        // Crear nuevo reportero
        const response = await fetch('/api/reporteros', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            nombre,
            ciudad_id: parseInt(ciudadId),
            estado
          })
        })
        
        if (!response.ok) {
          throw new Error('Error al crear reportero')
        }
        
        setNotification({
          show: true,
          type: 'success',
          title: 'Reportero agregado',
          message: `${nombre} ha sido agregado correctamente`
        })
      }
      
      // Limpiar formulario y cerrar modal
      if (onSuccess) {
        onSuccess()
      } else {
        onClose()
      }
    } catch (error) {
      console.error('Error al guardar reportero:', error)
      setNotification({
        show: true,
        type: 'error',
        title: 'Error',
        message: 'No se pudo guardar el reportero'
      })
    } finally {
      setLoading(false)
    }
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backdropFilter: "blur(8px)", backgroundColor: "rgba(0, 0, 0, 0.4)" }}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-transform duration-300">
        <div className="flex justify-between items-center px-5 py-4 border-b border-[#e2e8f0]">
          <h3 className="text-lg font-semibold text-[#1a365d] flex items-center gap-2">
            <FontAwesomeIcon icon={faUser} />
            {reportero ? 'Editar Reportero' : 'Agregar Reportero'}
          </h3>
          <button 
            className="text-[#64748b] hover:text-[#1e293b] transition-colors text-xl"
            onClick={onClose}
            disabled={loading || formLoading}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        
        {formLoading ? (
          <div className="p-6 flex justify-center items-center">
            <FontAwesomeIcon icon={faSpinner} spin className="text-[#1a56db] mr-2" />
            <span>Cargando...</span>
          </div>
        ) : (
          <>
            <div className="p-6">
              <div className="mb-5">
                <label htmlFor="reportero-nombre" className="block mb-2 text-sm font-medium text-[#475569]">
                  Nombre del Reportero:
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FontAwesomeIcon icon={faUser} className="text-[#64748b]" />
                  </div>
                  <input
                    type="text"
                    id="reportero-nombre"
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-[#e2e8f0] rounded-lg shadow-sm"
                    placeholder="Nombre completo"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="mb-5">
                <label htmlFor="reportero-ciudad" className="block mb-2 text-sm font-medium text-[#475569]">
                  Ciudad:
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FontAwesomeIcon icon={faCity} className="text-[#64748b]" />
                  </div>
                  <select
                    id="reportero-ciudad"
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-[#e2e8f0] rounded-lg shadow-sm"
                    value={ciudadId}
                    onChange={(e) => setCiudadId(e.target.value)}
                    disabled={loading || !!ciudadPredefinida}
                  >
                    <option value="">-- Seleccione Ciudad --</option>
                    {ciudades.map(ciudad => (
                      <option key={ciudad.id} value={ciudad.id}>{ciudad.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mb-5">
                <label htmlFor="reportero-estado" className="block mb-2 text-sm font-medium text-[#475569]">
                  Estado:
                </label>
                <select
                  id="reportero-estado"
                  className="w-full px-3.5 py-2.5 text-sm border border-[#e2e8f0] rounded-lg shadow-sm"
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  disabled={loading}
                >
                  <option value="activo">Activo</option>
                  <option value="ausente">Ausente</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end p-5 gap-3 border-t border-[#e2e8f0]">
              <button
                className="px-4 py-2.5 bg-white text-[#1e293b] border border-[#e2e8f0] rounded-lg hover:bg-[#f1f5f9] transition-colors"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2.5 bg-[#1a56db] text-white rounded-lg hover:bg-[#1e429f] transition-colors flex items-center gap-2"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin />
                    {reportero ? 'Actualizando...' : 'Guardando...'}
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={reportero ? faPencilAlt : faPlus} />
                    {reportero ? 'Actualizar' : 'Agregar'}
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default AddReporteroModal