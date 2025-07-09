import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock, faVideo, faSave, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'

interface DespachoCardProps {
  reporterId: number
  despachoNum: number
  initialValues?: {
    id?: number
    titulo: string
    hora: string
    vivo: string
  }
  onSave?: (data: {
    reportero_id: number
    numero_despacho: number
    titulo: string
    hora_despacho: string
    hora_en_vivo: string
  }) => void
  onUpdate?: (id: number, data: any) => void
}

const DespachoCard: React.FC<DespachoCardProps> = ({ 
  reporterId, 
  despachoNum, 
  initialValues = { titulo: '', hora: '', vivo: '' },
  onSave,
  onUpdate
}) => {
  const [id, setId] = useState<number | undefined>(initialValues.id)
  const [titulo, setTitulo] = useState(initialValues.titulo)
  const [hora, setHora] = useState(initialValues.hora)
  const [vivo, setVivo] = useState(initialValues.vivo)
  const [isSaving, setIsSaving] = useState(false)
  const [modified, setModified] = useState(false)

  // Actualizar estado local cuando cambian los valores iniciales
  useEffect(() => {
    setId(initialValues.id)
    setTitulo(initialValues.titulo)
    setHora(initialValues.hora)
    setVivo(initialValues.vivo)
    setModified(false)
  }, [initialValues])

  // Marcar como modificado cuando hay cambios
  const handleChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setter(value)
    setModified(true)
  }

  // Guardar o actualizar el despacho
  const handleSave = () => {
    if (!titulo && !hora && !vivo) return // No guardar si está vacío
    
    setIsSaving(true)
    
    const despachoData = {
      reportero_id: reporterId,
      numero_despacho: despachoNum,
      titulo: titulo,
      hora_despacho: hora,
      hora_en_vivo: vivo
    }
    
    if (id && onUpdate) {
      // Actualizar despacho existente
      onUpdate(id, despachoData)
    } else if (onSave) {
      // Crear nuevo despacho
      onSave(despachoData)
    }
    
    setIsSaving(false)
    setModified(false)
  }

  return (
    <div className="border border-[#e2e8f0] rounded-lg overflow-hidden shadow-sm hover:shadow transition-all">
      <div className="py-3 px-5 bg-[#f8fafc] border-b border-[#e2e8f0] font-semibold text-[#1a365d] flex justify-between items-center">
        <span>Despacho {despachoNum}</span>
        {modified && (
          <span className="text-xs text-[#f59e0b] flex items-center gap-1">
            <FontAwesomeIcon icon={faExclamationTriangle} />
            Sin guardar
          </span>
        )}
      </div>
      <div className="p-5">
        <div className="mb-5">
          <label className="block mb-2 text-sm font-medium text-[#475569]">
            Título del despacho:
          </label>
          <input
            type="text"
            className="w-full px-3.5 py-2.5 text-sm border border-[#e2e8f0] rounded-lg shadow-sm"
            id={`titulo-${reporterId}-${despachoNum}`}
            placeholder="Ingrese el título del despacho"
            value={titulo}
            onChange={(e) => handleChange(setTitulo, e.target.value)}
          />
        </div>
        <div className="flex gap-5 mb-4">
          <div className="flex-1">
            <label className="block mb-2 text-sm font-medium text-[#475569]">
              HORA:
            </label>
            <div className="relative">
              <input
                type="time"
                className="w-full px-3.5 py-2.5 pr-10 text-sm border border-[#e2e8f0] rounded-lg shadow-sm"
                id={`hora-${reporterId}-${despachoNum}`}
                value={hora}
                onChange={(e) => handleChange(setHora, e.target.value)}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] pointer-events-none">
                <FontAwesomeIcon icon={faClock} />
              </div>
            </div>
          </div>
          <div className="flex-1">
            <label className="block mb-2 text-sm font-medium text-[#475569]">
              En vivo:
            </label>
            <div className="relative">
              <input
                type="time"
                className="w-full px-3.5 py-2.5 pr-10 text-sm border border-[#e2e8f0] rounded-lg shadow-sm"
                id={`vivo-${reporterId}-${despachoNum}`}
                value={vivo}
                onChange={(e) => handleChange(setVivo, e.target.value)}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] pointer-events-none">
                <FontAwesomeIcon icon={faVideo} />
              </div>
            </div>
          </div>
        </div>
        
        {/* Botón para guardar individualmente este despacho (opcional) */}
        {modified && (
          <button
            className="w-full py-2 px-4 bg-[#10b981] text-white rounded-lg flex items-center justify-center gap-2 hover:bg-[#0d9669] transition-colors"
            onClick={handleSave}
            disabled={isSaving}
          >
            <FontAwesomeIcon icon={faSave} />
            {isSaving ? 'Guardando...' : 'Guardar este despacho'}
          </button>
        )}
      </div>
    </div>
  )
}

export default DespachoCard