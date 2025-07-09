// Componente ReporterCard mejorado con manejo de guardado individual
import { useState } from 'react'
import { Reportero, Despacho } from './AppContext'
import DespachoCard from './DespachoCard'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faSave } from '@fortawesome/free-solid-svg-icons'

interface ReporterCardProps {
  reportero: Reportero
  despachos?: Despacho[]
  onSaveDespacho?: (despacho: any) => void
  onUpdateDespacho?: (id: number, despacho: any) => void
}

const ReporterCard: React.FC<ReporterCardProps> = ({ 
  reportero, 
  despachos = [],
  onSaveDespacho,
  onUpdateDespacho
}) => {
  const [isSaving, setIsSaving] = useState(false)
  
  // Encontrar despachos existentes para este reportero
  const findDespacho = (numero: number) => {
    return despachos.find(d => 
      d.reportero_id === reportero.id && 
      d.numero_despacho === numero
    )
  }
  
  // Preparar valores iniciales para cada tarjeta de despacho
  const getInitialValues = (numero: number) => {
    const despacho = findDespacho(numero)
    return {
      id: despacho?.id,
      titulo: despacho?.titulo || '',
      hora: despacho?.hora_despacho || '',
      vivo: despacho?.hora_en_vivo || ''
    }
  }
  
  // Guardar todos los despachos de este reportero
  const saveAllDespachos = async () => {
    setIsSaving(true)
    
    try {
      // Recopilar datos de todos los inputs
      const nuevosDespachos = []
      
      for (let i = 1; i <= 3; i++) {
        const titulo = (document.getElementById(`titulo-${reportero.id}-${i}`) as HTMLInputElement)?.value || ''
        const hora = (document.getElementById(`hora-${reportero.id}-${i}`) as HTMLInputElement)?.value || ''
        const vivo = (document.getElementById(`vivo-${reportero.id}-${i}`) as HTMLInputElement)?.value || ''
        
        // Solo agregar despachos que tengan al menos un campo con datos
        if (titulo || hora || vivo) {
          const existingDespacho = findDespacho(i)
          
          nuevosDespachos.push({
            id: existingDespacho?.id, // Incluimos el ID si existe
            reportero_id: reportero.id,
            numero_despacho: i,
            titulo,
            hora_despacho: hora,
            hora_en_vivo: vivo
          })
        }
      }
      
      // Guardar cada despacho
      for (const despacho of nuevosDespachos) {
        if (despacho.id && onUpdateDespacho) {
          // Actualizar despacho existente
          await onUpdateDespacho(despacho.id, despacho)
        } else if (onSaveDespacho) {
          // Crear nuevo despacho
          await onSaveDespacho(despacho)
        }
      }
    } catch (error) {
      console.error('Error al guardar despachos:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="border border-[#e2e8f0] rounded-lg mb-6 overflow-hidden bg-white shadow hover:shadow-md transition-all">
      <div className="p-4 bg-[#e0f2fe] border-b border-[#bfdbfe] font-semibold flex items-center justify-between">
        <div className="flex items-center gap-3 text-[#1a365d]">
          <FontAwesomeIcon icon={faUser} />
          {reportero.nombre}
        </div>
        
        {/* Botón para guardar todos los despachos del reportero */}
        <button
          className="px-3 py-1.5 bg-[#10b981] text-white text-sm rounded-lg flex items-center gap-2 hover:bg-[#0d9669] transition-colors"
          onClick={saveAllDespachos}
          disabled={isSaving}
        >
          <FontAwesomeIcon icon={faSave} />
          {isSaving ? 'Guardando...' : 'Guardar despachos'}
        </button>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DespachoCard 
            reporterId={reportero.id} 
            despachoNum={1} 
            initialValues={getInitialValues(1)}
            onSave={onSaveDespacho}
            onUpdate={onUpdateDespacho}
          />
          <DespachoCard 
            reporterId={reportero.id} 
            despachoNum={2}
            initialValues={getInitialValues(2)} 
            onSave={onSaveDespacho}
            onUpdate={onUpdateDespacho}
          />
          <DespachoCard 
            reporterId={reportero.id} 
            despachoNum={3} 
            initialValues={getInitialValues(3)}
            onSave={onSaveDespacho}
            onUpdate={onUpdateDespacho}
          />
        </div>
      </div>
    </div>
  )
}

export default ReporterCard