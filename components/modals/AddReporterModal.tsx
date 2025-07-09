import { useState } from 'react'
import { useAppContext } from '../AppContext'
import { getCityOptions } from '../../utils/cityUtils'

interface AddReporterModalProps {
  show: boolean
  onClose: () => void
}

const AddReporterModal: React.FC<AddReporterModalProps> = ({ show, onClose }) => {
  const { addReportero, reporteros } = useAppContext()
  const [nombre, setNombre] = useState('')
  const [ciudad, setCiudad] = useState('')

  // Generar opciones de ciudades usando la utilidad
  const cities = getCityOptions(Object.keys(reporteros))

  const handleSubmit = () => {
    if (nombre.trim() === '') {
      // Mostrar error (en un sistema real)
      return
    }
    
    if (ciudad === '') {
      // Mostrar error (en un sistema real)
      return
    }
    
    addReportero(nombre, ciudad)
    setNombre('')
    setCiudad('')
    onClose()
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backdropFilter: "blur(8px)", backgroundColor: "rgba(0, 0, 0, 0.4)" }}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-transform duration-300">
        <div className="flex justify-between items-center px-5 py-4 border-b border-[#e2e8f0]">
          <h3 className="text-lg font-semibold text-[#1a365d]">Agregar Reportero</h3>
          <button 
            className="text-[#64748b] hover:text-[#1e293b] transition-colors text-xl"
            onClick={onClose}
          >
            &times;
          </button>
        </div>
        <div className="p-6">
          <div className="mb-5">
            <label htmlFor="reporter-name" className="block mb-2 text-sm font-medium text-[#475569]">
              Nombre del Reportero:
            </label>
            <input
              type="text"
              id="reporter-name"
              className="w-full px-3.5 py-2.5 text-sm border border-[#e2e8f0] rounded-lg shadow-sm"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>
          <div className="mb-5">
            <label htmlFor="reporter-city" className="block mb-2 text-sm font-medium text-[#475569]">
              Ciudad:
            </label>
            <select
              id="reporter-city"
              className="w-full px-3.5 py-2.5 text-sm border border-[#e2e8f0] rounded-lg shadow-sm"
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value)}
            >
              {cities.map((city) => (
                <option key={city.value} value={city.value}>
                  {city.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end p-5 gap-3 border-t border-[#e2e8f0]">
          <button
            className="px-4 py-2.5 bg-white text-[#1e293b] border border-[#e2e8f0] rounded-lg hover:bg-[#f1f5f9] transition-colors"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="px-4 py-2.5 bg-[#1a56db] text-white rounded-lg hover:bg-[#1e429f] transition-colors"
            onClick={handleSubmit}
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddReporterModal