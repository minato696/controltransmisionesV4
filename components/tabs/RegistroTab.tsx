// components/tabs/RegistroTab.tsx - Corregido para el filtrado de fechas específicas
import { useState, useEffect } from 'react'
import { useAppContext, Despacho } from '../AppContext'
import CitySelector from '../CitySelector'
import ReporterCard from '../ReporterCard'
import AddReporterModal from '../modals/AddReporterModal'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faSave, faSpinner, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'

const RegistroTab = () => {
  const { 
    selectedCity, 
    reporteros, 
    saveDespachos, 
    despachos, 
    currentDate,
    loading,
    setNotification
  } = useAppContext()
  
  const [showModal, setShowModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [cityDespachos, setCityDespachos] = useState<Despacho[]>([])
  // Nuevo estado para indicar cuando hay problemas con los datos
  const [dataIssue, setDataIssue] = useState<string | null>(null)

  // Filtrar despachos para la ciudad seleccionada y SOLO para la fecha actual seleccionada
  useEffect(() => {
    if (despachos.length > 0 && selectedCity) {
      // Convertimos la fecha actual a formato YYYY-MM-DD para comparación
      const currentDateStr = currentDate.toISOString().split('T')[0];
      
      console.log(`Filtrando despachos para fecha ${currentDateStr} y ciudad ${selectedCity}`);
      
      // Filtrar despachos que coincidan EXACTAMENTE con la fecha seleccionada
      const filteredDespachos = despachos.filter(d => {
        // Extraer solo la parte de fecha (YYYY-MM-DD) para comparación
        const despachoFechaStr = d.fecha_despacho 
          ? new Date(d.fecha_despacho).toISOString().split('T')[0]
          : d.fecha; // Usar el campo fecha como fallback
          
        const fechaCoincide = despachoFechaStr === currentDateStr;
        const ciudadCoincide = d.ciudad === selectedCity;
        
        return fechaCoincide && ciudadCoincide;
      });
      
      console.log(`Encontrados ${filteredDespachos.length} despachos para ${currentDateStr} y ${selectedCity}`);
      
      // Si no hay despachos para esta fecha exacta, mostrar una nota informativa
      if (filteredDespachos.length === 0) {
        setDataIssue(`No hay despachos registrados para el ${new Date(currentDateStr).toLocaleDateString('es-ES')} en ${selectedCity}. Puedes registrar nuevos despachos.`);
      } else {
        setDataIssue(null);
      }
      
      setCityDespachos(filteredDespachos);
    } else {
      setCityDespachos([]);
      
      if (despachos.length === 0 && selectedCity) {
        setDataIssue("No hay despachos registrados para esta fecha. Puedes registrar nuevos despachos.");
      } else {
        setDataIssue(null);
      }
    }
  }, [despachos, selectedCity, currentDate]);

  // Reporteros de la ciudad seleccionada
  const cityReporters = selectedCity ? reporteros[selectedCity] || [] : []

  // Función para guardar un despacho individual
  const handleSaveDespacho = async (despachoData: any) => {
    try {
      // Crear un array con un solo despacho para usar la función existente
      const nuevoDespacho = {
        ...despachoData,
        fecha: currentDate.toISOString().split('T')[0]
      }
      
      await saveDespachos([nuevoDespacho])
      
      setNotification({
        show: true,
        type: 'success',
        title: 'Despacho guardado',
        message: 'El despacho ha sido guardado correctamente'
      })
      
      return true
    } catch (error) {
      console.error('Error al guardar despacho:', error)
      
      setNotification({
        show: true,
        type: 'error',
        title: 'Error',
        message: 'No se pudo guardar el despacho'
      })
      
      return false
    }
  }

  // Función para actualizar un despacho existente
  const handleUpdateDespacho = async (id: number, despachoData: any) => {
    try {
      // Aquí iría la lógica para actualizar un despacho existente
      // Por ahora usamos la misma función de guardar
      const despachoActualizado = {
        ...despachoData,
        id,
        fecha: currentDate.toISOString().split('T')[0]
      }
      
      await saveDespachos([despachoActualizado])
      
      setNotification({
        show: true,
        type: 'success',
        title: 'Despacho actualizado',
        message: 'El despacho ha sido actualizado correctamente'
      })
      
      return true
    } catch (error) {
      console.error('Error al actualizar despacho:', error)
      
      setNotification({
        show: true,
        type: 'error',
        title: 'Error',
        message: 'No se pudo actualizar el despacho'
      })
      
      return false
    }
  }

  // Función para recopilar y guardar todos los despachos
  const handleSaveAllDespachos = async () => {
    if (!selectedCity) {
      setNotification({
        show: true,
        type: 'error',
        title: 'Error',
        message: 'Debe seleccionar una ciudad'
      })
      return
    }

    setIsSaving(true)
    
    try {
      // Recopilar datos de todos los despachos con información
      const nuevosDespachos: Despacho[] = []
      
      cityReporters.forEach(reporter => {
        for (let i = 1; i <= 3; i++) {
          const titulo = (document.getElementById(`titulo-${reporter.id}-${i}`) as HTMLInputElement)?.value || '';
          const hora = (document.getElementById(`hora-${reporter.id}-${i}`) as HTMLInputElement)?.value || '';
          const vivo = (document.getElementById(`vivo-${reporter.id}-${i}`) as HTMLInputElement)?.value || '';
          
          if (titulo || hora || vivo) {
            // Buscar si existe un despacho con mismo reportero y número para esta fecha exacta
            const existingIndex = cityDespachos.findIndex(d => 
              d.reportero_id === reporter.id && 
              d.numero_despacho === i &&
              new Date(d.fecha_despacho).toISOString().split('T')[0] === currentDate.toISOString().split('T')[0]
            );
            
            const despachoExistente = existingIndex !== -1 ? cityDespachos[existingIndex] : null;
            
            nuevosDespachos.push({
              ...(despachoExistente ? { id: despachoExistente.id } : {}),
              reportero_id: reporter.id,
              reportero_nombre: reporter.nombre,
              numero_despacho: i,
              titulo,
              hora_despacho: hora,
              hora_en_vivo: vivo,
              fecha: currentDate.toISOString().split('T')[0],
              fecha_despacho: currentDate.toISOString().split('T')[0],
              ciudad: selectedCity
            });
          }
        }
      });
      
      // Guardar los despachos
      if (nuevosDespachos.length > 0) {
        await saveDespachos(nuevosDespachos)
      } else {
        setNotification({
          show: true,
          type: 'warning',
          title: 'Sin cambios',
          message: 'No hay despachos para guardar'
        })
      }
    } catch (error) {
      console.error('Error al guardar despachos:', error)
      setNotification({
        show: true,
        type: 'error',
        title: 'Error',
        message: 'No se pudieron guardar los despachos'
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <FontAwesomeIcon icon={faSpinner} spin className="text-3xl text-primary mr-3" />
        <span className="text-lg">Cargando...</span>
      </div>
    )
  }

  return (
    <div>
      <CitySelector />
      
      {/* Mostrar mensaje informativo sobre fecha si es necesario */}
      {dataIssue && (
        <div className="bg-[#fffbeb] border-l-4 border-[#f59e0b] p-4 mb-4 rounded-md">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-[#f59e0b]" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-[#92400e]">{dataIssue}</p>
            </div>
          </div>
        </div>
      )}
      
      <div>
        {cityReporters.map(reportero => (
          <ReporterCard 
            key={reportero.id} 
            reportero={reportero} 
            despachos={cityDespachos}
            onSaveDespacho={handleSaveDespacho}
            onUpdateDespacho={handleUpdateDespacho}
          />
        ))}

        {cityReporters.length === 0 && selectedCity && (
          <div className="text-center p-8 bg-[#f8fafc] rounded-lg border border-[#e2e8f0] text-[#64748b]">
            <p>No hay reporteros disponibles para esta ciudad.</p>
            <button 
              className="mt-4 px-4 py-2 bg-[#1a56db] text-white rounded-lg hover:bg-[#1e429f] transition-colors"
              onClick={() => setShowModal(true)}
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Agregar Reportero
            </button>
          </div>
        )}
      </div>
      
      <div className="flex flex-col md:flex-row justify-between gap-4 mt-6">
        <button 
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#10b981] text-white rounded-lg hover:bg-[#0d9668] transition-colors"
          onClick={() => setShowModal(true)}
        >
          <FontAwesomeIcon icon={faPlus} />
          Agregar Reportero
        </button>
        
        <button 
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1a56db] text-white rounded-lg hover:bg-[#1e429f] transition-colors"
          onClick={handleSaveAllDespachos}
          disabled={isSaving || !selectedCity || cityReporters.length === 0}
        >
          {isSaving ? (
            <>
              <FontAwesomeIcon icon={faSpinner} spin />
              GUARDANDO...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faSave} />
              GUARDAR TODOS LOS REGISTROS
            </>
          )}
        </button>
      </div>
      
      <AddReporterModal 
        show={showModal} 
        onClose={() => setShowModal(false)} 
      />
    </div>
  )
}

export default RegistroTab