// components/modals/AddCiudadModal.tsx
import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCity, faUser, faPlus, faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { useAppContext } from '../AppContext'

interface AddCiudadModalProps {
  show: boolean
  onClose: () => void
  onSuccess?: () => void
}

const AddCiudadModal: React.FC<AddCiudadModalProps> = ({ 
  show, 
  onClose,
  onSuccess
}) => {
  const { setNotification } = useAppContext()
  
  const [nombre, setNombre] = useState('')
  const [reporteros, setReporteros] = useState([{ nombre: '' }])
  const [loading, setLoading] = useState(false)

  // Función para generar el código a partir del nombre
  const generarCodigo = (nombreCiudad: string): string => {
    return nombreCiudad
      .toLowerCase()
      .normalize("NFD") // Normaliza caracteres acentuados
      .replace(/[\u0300-\u036f]/g, "") // Elimina diacríticos
      .replace(/\s+/g, '_') // Reemplaza espacios con guiones bajos
      .replace(/[^a-z0-9_]/g, ''); // Elimina caracteres que no sean alfanuméricos o guiones bajos
  }

  // Agregar campo para nuevo reportero
  const addReporteroField = () => {
    setReporteros([...reporteros, { nombre: '' }])
  }

  // Actualizar nombre de reportero
  const updateReporteroNombre = (index: number, value: string) => {
    const updatedReporteros = [...reporteros]
    updatedReporteros[index].nombre = value
    setReporteros(updatedReporteros)
  }

  // Eliminar campo de reportero
  const removeReporteroField = (index: number) => {
    if (reporteros.length === 1) return // Mantener al menos un campo
    const updatedReporteros = [...reporteros]
    updatedReporteros.splice(index, 1)
    setReporteros(updatedReporteros)
  }

  // Validar y guardar datos
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
    
    // Generar código a partir del nombre
    const codigo = generarCodigo(nombre)
    
    // Validar que al menos un reportero tenga nombre
    const validReporteros = reporteros.filter(r => r.nombre.trim() !== '')
    if (validReporteros.length === 0) {
      setNotification({
        show: true,
        type: 'error',
        title: 'Error',
        message: 'Debe agregar al menos un reportero'
      })
      return
    }
    
    setLoading(true)
    
    try {
      // 1. Crear la ciudad
      const ciudadResponse = await fetch('/api/ciudades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          codigo: codigo,
          nombre,
          activo: true
        })
      })
      
      if (!ciudadResponse.ok) {
        throw new Error('Error al crear ciudad')
      }
      
      const ciudad = await ciudadResponse.json()
      
      // 2. Crear los reporteros para esta ciudad
      const reporterosPromises = validReporteros.map(reportero => 
        fetch('/api/reporteros', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            nombre: reportero.nombre,
            ciudad_id: ciudad.id,
            estado: 'activo'
          })
        })
      )
      
      await Promise.all(reporterosPromises)
      
      // Mostrar notificación de éxito
      setNotification({
        show: true,
        type: 'success',
        title: 'Ciudad creada',
        message: `La ciudad ${nombre} ha sido creada con ${validReporteros.length} reporteros`
      })
      
      // Limpiar formulario
      setNombre('')
      setReporteros([{ nombre: '' }])
      
      // Cerrar modal
      onClose()
      
      // Callback de éxito
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error('Error al crear ciudad y reporteros:', error)
      setNotification({
        show: true,
        type: 'error',
        title: 'Error',
        message: 'No se pudo crear la ciudad y reporteros'
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
            <FontAwesomeIcon icon={faCity} />
            Agregar Ciudad y Reporteros
          </h3>
          <button 
            className="text-[#64748b] hover:text-[#1e293b] transition-colors text-xl"
            onClick={onClose}
            disabled={loading}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <div className="p-6">
          {/* Eliminado el campo de código de ciudad */}
          <div className="mb-5">
            <label htmlFor="ciudad-nombre" className="block mb-2 text-sm font-medium text-[#475569]">
              Nombre de la Ciudad:
            </label>
            <input
              type="text"
              id="ciudad-nombre"
              className="w-full px-3.5 py-2.5 text-sm border border-[#e2e8f0] rounded-lg shadow-sm"
              placeholder="Ejemplo: Arequipa, Cusco, etc."
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              disabled={loading}
            />
          </div>
          
          <div className="mb-3">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-[#475569]">
                Reporteros:
              </label>
              <button 
                className="text-xs px-2 py-1 bg-[#e0f2fe] text-[#1a56db] rounded hover:bg-[#bfdbfe] transition-colors flex items-center gap-1"
                onClick={addReporteroField}
                disabled={loading}
              >
                <FontAwesomeIcon icon={faPlus} size="xs" />
                Agregar otro
              </button>
            </div>
            
            {reporteros.map((reportero, index) => (
              <div key={index} className="flex items-center gap-2 mb-3">
                <div className="flex-1">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <FontAwesomeIcon icon={faUser} className="text-[#64748b]" />
                    </div>
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-2.5 text-sm border border-[#e2e8f0] rounded-lg shadow-sm"
                      placeholder={`Nombre del reportero ${index + 1}`}
                      value={reportero.nombre}
                      onChange={(e) => updateReporteroNombre(index, e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
                {reporteros.length > 1 && (
                  <button
                    className="w-8 h-8 flex items-center justify-center rounded-full text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#ef4444] transition-colors"
                    onClick={() => removeReporteroField(index)}
                    disabled={loading}
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                )}
              </div>
            ))}
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
                Guardando...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faPlus} />
                Agregar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddCiudadModal