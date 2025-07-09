// components/tabs/InformesTab.tsx
import { useState, useEffect } from 'react'
import { useAppContext } from '../AppContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faFilePdf, faCalendarDay, faCity, faUser, 
  faChartBar, faSpinner, faDownload, faCalendarAlt,
  faCalendarWeek, faCalendarCheck
} from '@fortawesome/free-solid-svg-icons'
import { 
  exportDespachosReportero, 
  exportResumenCiudad, 
  exportEstadisticasGenerales, 
  exportDespachosPorFecha 
} from '../../utils/pdfExporter'
import { formatCityName } from '../../utils/cityUtils'

interface DateRange {
  start: string
  end: string
}

const InformesTab = () => {
  const { 
    currentDate, 
    setNotification 
  } = useAppContext()
  
  // Estados para los diferentes tipos de informes
  const [selectedReportero, setSelectedReportero] = useState<string>('')
  const [selectedCiudad, setSelectedCiudad] = useState<string>('')
  const [selectedFecha, setSelectedFecha] = useState<string>(currentDate.toISOString().split('T')[0])
  const [selectedPeriodo, setSelectedPeriodo] = useState<string>('semanal')
  
  // Estados para rangos de fechas
  const [reporteroDateRange, setReporteroDateRange] = useState<DateRange>({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })
  const [ciudadDateRange, setCiudadDateRange] = useState<DateRange>({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })
  const [estadisticasDateRange, setEstadisticasDateRange] = useState<DateRange>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })
  
  const [isGenerating, setIsGenerating] = useState<string | null>(null)
  const [ciudades, setCiudades] = useState<any[]>([])
  const [reporteros, setReporteros] = useState<any[]>([])
  const [showCustomRange, setShowCustomRange] = useState({
    reportero: false,
    ciudad: false,
    estadisticas: false
  })
  
  // Cargar datos al montar
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ciudadesRes, reporterosRes] = await Promise.all([
          fetch('/api/ciudades'),
          fetch('/api/reporteros')
        ])
        
        const [ciudadesData, reporterosData] = await Promise.all([
          ciudadesRes.json(),
          reporterosRes.json()
        ])
        
        setCiudades(ciudadesData)
        setReporteros(reporterosData)
      } catch (error) {
        console.error('Error al cargar datos:', error)
      }
    }
    
    fetchData()
  }, [])

  // Actualizar rangos de fechas según el período seleccionado
  const updateDateRangeByPeriod = (period: string, type: 'reportero' | 'ciudad' | 'estadisticas') => {
    const end = new Date()
    let start = new Date()
    
    switch (period) {
      case 'hoy':
        start = new Date()
        break
      case 'semana':
        start.setDate(end.getDate() - 7)
        break
      case 'mes':
        start.setMonth(end.getMonth() - 1)
        break
      case 'trimestre':
        start.setMonth(end.getMonth() - 3)
        break
      case 'personalizado':
        // No hacer nada, mantener el rango actual
        return
    }
    
    const range = {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    }
    
    if (type === 'reportero') {
      setReporteroDateRange(range)
    } else if (type === 'ciudad') {
      setCiudadDateRange(range)
    } else if (type === 'estadisticas') {
      setEstadisticasDateRange(range)
    }
  }

  // Generar informe de reportero
  const handleGenerateReportero = async () => {
    if (!selectedReportero) {
      setNotification({
        show: true,
        type: 'error',
        title: 'Error',
        message: 'Seleccione un reportero'
      })
      return
    }

    setIsGenerating('reportero')
    
    try {
      const reportero = reporteros.find(r => r.id === parseInt(selectedReportero))
      
      const response = await fetch(
        `/api/despachos?reportero_id=${reportero.id}&desde=${reporteroDateRange.start}&hasta=${reporteroDateRange.end}`
      )
      const despachos = await response.json()
      
      exportDespachosReportero(
        reportero, 
        despachos, 
        new Date(reporteroDateRange.start), 
        new Date(reporteroDateRange.end)
      )
      
      setNotification({
        show: true,
        type: 'success',
        title: '¡Listo!',
        message: `Informe de ${reportero.nombre} descargado`
      })
    } catch (error) {
      console.error('Error:', error)
      setNotification({
        show: true,
        type: 'error',
        title: 'Error',
        message: 'No se pudo generar el informe'
      })
    } finally {
      setIsGenerating(null)
    }
  }

  // Generar informe de ciudad
  const handleGenerateCiudad = async () => {
    if (!selectedCiudad) {
      setNotification({
        show: true,
        type: 'error',
        title: 'Error',
        message: 'Seleccione una ciudad'
      })
      return
    }

    setIsGenerating('ciudad')
    
    try {
      const reporterosCiudad = reporteros.filter(r => r.ciudad.codigo === selectedCiudad)
      
      const response = await fetch(
        `/api/despachos?ciudad_codigo=${selectedCiudad}&desde=${ciudadDateRange.start}&hasta=${ciudadDateRange.end}`
      )
      const despachos = await response.json()
      
      const startDate = new Date(ciudadDateRange.start)
      const endDate = new Date(ciudadDateRange.end)
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
      
      exportResumenCiudad(
        selectedCiudad, 
        reporterosCiudad, 
        despachos, 
        `${startDate.toLocaleDateString('es-ES')} - ${endDate.toLocaleDateString('es-ES')} (${days} días)`
      )
      
      setNotification({
        show: true,
        type: 'success',
        title: '¡Listo!',
        message: `Resumen de ${formatCityName(selectedCiudad)} descargado`
      })
    } catch (error) {
      console.error('Error:', error)
      setNotification({
        show: true,
        type: 'error',
        title: 'Error',
        message: 'No se pudo generar el informe'
      })
    } finally {
      setIsGenerating(null)
    }
  }

  // Generar informe por fecha
  const handleGenerateFecha = async () => {
    setIsGenerating('fecha')
    
    try {
      const response = await fetch(`/api/despachos?fecha=${selectedFecha}`)
      const despachos = await response.json()
      
      exportDespachosPorFecha(new Date(selectedFecha), despachos)
      
      setNotification({
        show: true,
        type: 'success',
        title: '¡Listo!',
        message: 'Informe del día descargado'
      })
    } catch (error) {
      console.error('Error:', error)
      setNotification({
        show: true,
        type: 'error',
        title: 'Error',
        message: 'No se pudo generar el informe'
      })
    } finally {
      setIsGenerating(null)
    }
  }

  // Generar estadísticas
  const handleGenerateEstadisticas = async () => {
    setIsGenerating('estadisticas')
    
    try {
      const response = await fetch(
        `/api/estadisticas?periodo=personalizado&fechaInicio=${estadisticasDateRange.start}&fechaFin=${estadisticasDateRange.end}`
      )
      const estadisticas = await response.json()
      
      exportEstadisticasGenerales(estadisticas)
      
      setNotification({
        show: true,
        type: 'success',
        title: '¡Listo!',
        message: 'Informe estadístico descargado'
      })
    } catch (error) {
      console.error('Error:', error)
      setNotification({
        show: true,
        type: 'error',
        title: 'Error',
        message: 'No se pudo generar el informe'
      })
    } finally {
      setIsGenerating(null)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-[#1a365d] mb-2">
          Generación de Informes PDF
        </h2>
        <p className="text-[#64748b]">
          Selecciona el tipo de informe que deseas generar
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informe por Reportero */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faUser} className="text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold">Informe por Reportero</h3>
          </div>
          
          <div className="space-y-4">
            <select 
              className="w-full px-4 py-2 border border-[#e2e8f0] rounded-lg"
              value={selectedReportero}
              onChange={(e) => setSelectedReportero(e.target.value)}
            >
              <option value="">Seleccione un reportero</option>
              {reporteros.map(r => (
                <option key={r.id} value={r.id}>
                  {r.nombre} - {r.ciudad.nombre}
                </option>
              ))}
            </select>
            
            <div>
              <label className="block text-sm font-medium text-[#64748b] mb-2">
                Período del informe
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                    !showCustomRange.reportero && reporteroDateRange.start === new Date().toISOString().split('T')[0]
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-[#e2e8f0] hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    setShowCustomRange({ ...showCustomRange, reportero: false })
                    updateDateRangeByPeriod('hoy', 'reportero')
                  }}
                >
                  Hoy
                </button>
                <button
                  className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                    !showCustomRange.reportero && 
                    new Date(reporteroDateRange.start).getTime() === new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).setHours(0,0,0,0)
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-[#e2e8f0] hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    setShowCustomRange({ ...showCustomRange, reportero: false })
                    updateDateRangeByPeriod('semana', 'reportero')
                  }}
                >
                  Última Semana
                </button>
                <button
                  className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                    !showCustomRange.reportero && 
                    Math.abs(new Date(reporteroDateRange.end).getTime() - new Date(reporteroDateRange.start).getTime()) / (1000 * 60 * 60 * 24) > 25
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-[#e2e8f0] hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    setShowCustomRange({ ...showCustomRange, reportero: false })
                    updateDateRangeByPeriod('mes', 'reportero')
                  }}
                >
                  Último Mes
                </button>
                <button
                  className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                    showCustomRange.reportero
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-[#e2e8f0] hover:bg-gray-50'
                  }`}
                  onClick={() => setShowCustomRange({ ...showCustomRange, reportero: true })}
                >
                  Personalizado
                </button>
              </div>
            </div>
            
            {showCustomRange.reportero && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-[#64748b] mb-1">Desde</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg"
                    value={reporteroDateRange.start}
                    onChange={(e) => setReporteroDateRange({ ...reporteroDateRange, start: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#64748b] mb-1">Hasta</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg"
                    value={reporteroDateRange.end}
                    onChange={(e) => setReporteroDateRange({ ...reporteroDateRange, end: e.target.value })}
                  />
                </div>
              </div>
            )}
            
            <button
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2"
              onClick={handleGenerateReportero}
              disabled={isGenerating === 'reportero'}
            >
              {isGenerating === 'reportero' ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  Generando...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faDownload} />
                  Generar PDF
                </>
              )}
            </button>
          </div>
        </div>

        {/* Informe por Ciudad */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faCity} className="text-green-600" />
            </div>
            <h3 className="text-lg font-semibold">Informe por Ciudad</h3>
          </div>
          
          <div className="space-y-4">
            <select 
              className="w-full px-4 py-2 border border-[#e2e8f0] rounded-lg"
              value={selectedCiudad}
              onChange={(e) => setSelectedCiudad(e.target.value)}
            >
              <option value="">Seleccione una ciudad</option>
              {ciudades.map(c => (
                <option key={c.id} value={c.codigo}>{c.nombre}</option>
              ))}
            </select>
            
            <div>
              <label className="block text-sm font-medium text-[#64748b] mb-2">
                Período del informe
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                    !showCustomRange.ciudad && ciudadDateRange.start === new Date().toISOString().split('T')[0]
                      ? 'bg-green-50 border-green-500 text-green-700'
                      : 'border-[#e2e8f0] hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    setShowCustomRange({ ...showCustomRange, ciudad: false })
                    updateDateRangeByPeriod('hoy', 'ciudad')
                  }}
                >
                  Hoy
                </button>
                <button
                  className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                    !showCustomRange.ciudad && 
                    new Date(ciudadDateRange.start).getTime() === new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).setHours(0,0,0,0)
                      ? 'bg-green-50 border-green-500 text-green-700'
                      : 'border-[#e2e8f0] hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    setShowCustomRange({ ...showCustomRange, ciudad: false })
                    updateDateRangeByPeriod('semana', 'ciudad')
                  }}
                >
                  Última Semana
                </button>
                <button
                  className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                    !showCustomRange.ciudad && 
                    Math.abs(new Date(ciudadDateRange.end).getTime() - new Date(ciudadDateRange.start).getTime()) / (1000 * 60 * 60 * 24) > 25
                      ? 'bg-green-50 border-green-500 text-green-700'
                      : 'border-[#e2e8f0] hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    setShowCustomRange({ ...showCustomRange, ciudad: false })
                    updateDateRangeByPeriod('mes', 'ciudad')
                  }}
                >
                  Último Mes
                </button>
                <button
                  className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                    showCustomRange.ciudad
                      ? 'bg-green-50 border-green-500 text-green-700'
                      : 'border-[#e2e8f0] hover:bg-gray-50'
                  }`}
                  onClick={() => setShowCustomRange({ ...showCustomRange, ciudad: true })}
                >
                  Personalizado
                </button>
              </div>
            </div>
            
            {showCustomRange.ciudad && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-[#64748b] mb-1">Desde</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg"
                    value={ciudadDateRange.start}
                    onChange={(e) => setCiudadDateRange({ ...ciudadDateRange, start: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#64748b] mb-1">Hasta</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg"
                    value={ciudadDateRange.end}
                    onChange={(e) => setCiudadDateRange({ ...ciudadDateRange, end: e.target.value })}
                  />
                </div>
              </div>
            )}
            
            <button
              className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center justify-center gap-2"
              onClick={handleGenerateCiudad}
              disabled={isGenerating === 'ciudad'}
            >
              {isGenerating === 'ciudad' ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  Generando...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faDownload} />
                  Generar PDF
                </>
              )}
            </button>
          </div>
        </div>

        {/* Informe por Fecha */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faCalendarDay} className="text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold">Informe por Fecha</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#64748b] mb-2">
                Seleccione el día
              </label>
              <input 
                type="date"
                className="w-full px-4 py-2 border border-[#e2e8f0] rounded-lg"
                value={selectedFecha}
                onChange={(e) => setSelectedFecha(e.target.value)}
              />
            </div>
            
            <div className="bg-purple-50 rounded-lg p-3 text-sm text-purple-700">
              <FontAwesomeIcon icon={faCalendarCheck} className="mr-2" />
              Este informe mostrará todos los despachos del día seleccionado organizados por ciudad
            </div>
            
            <button
              className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center justify-center gap-2"
              onClick={handleGenerateFecha}
              disabled={isGenerating === 'fecha'}
            >
              {isGenerating === 'fecha' ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  Generando...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faDownload} />
                  Generar PDF
                </>
              )}
            </button>
          </div>
        </div>

        {/* Informe Estadístico */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faChartBar} className="text-red-600" />
            </div>
            <h3 className="text-lg font-semibold">Informe Estadístico</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#64748b] mb-2">
                Período del análisis
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                    !showCustomRange.estadisticas && 
                    new Date(estadisticasDateRange.start).getTime() === new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).setHours(0,0,0,0)
                      ? 'bg-red-50 border-red-500 text-red-700'
                      : 'border-[#e2e8f0] hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    setShowCustomRange({ ...showCustomRange, estadisticas: false })
                    updateDateRangeByPeriod('semana', 'estadisticas')
                  }}
                >
                  Última Semana
                </button>
                <button
                  className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                    !showCustomRange.estadisticas && 
                    Math.abs(new Date(estadisticasDateRange.end).getTime() - new Date(estadisticasDateRange.start).getTime()) / (1000 * 60 * 60 * 24) > 25 &&
                    Math.abs(new Date(estadisticasDateRange.end).getTime() - new Date(estadisticasDateRange.start).getTime()) / (1000 * 60 * 60 * 24) < 35
                      ? 'bg-red-50 border-red-500 text-red-700'
                      : 'border-[#e2e8f0] hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    setShowCustomRange({ ...showCustomRange, estadisticas: false })
                    updateDateRangeByPeriod('mes', 'estadisticas')
                  }}
                >
                  Último Mes
                </button>
                <button
                  className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                    !showCustomRange.estadisticas && 
                    Math.abs(new Date(estadisticasDateRange.end).getTime() - new Date(estadisticasDateRange.start).getTime()) / (1000 * 60 * 60 * 24) > 85
                      ? 'bg-red-50 border-red-500 text-red-700'
                      : 'border-[#e2e8f0] hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    setShowCustomRange({ ...showCustomRange, estadisticas: false })
                    updateDateRangeByPeriod('trimestre', 'estadisticas')
                  }}
                >
                  Último Trimestre
                </button>
                <button
                  className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                    showCustomRange.estadisticas
                      ? 'bg-red-50 border-red-500 text-red-700'
                      : 'border-[#e2e8f0] hover:bg-gray-50'
                  }`}
                  onClick={() => setShowCustomRange({ ...showCustomRange, estadisticas: true })}
                >
                  Personalizado
                </button>
              </div>
            </div>
            
            {showCustomRange.estadisticas && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-[#64748b] mb-1">Desde</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg"
                    value={estadisticasDateRange.start}
                    onChange={(e) => setEstadisticasDateRange({ ...estadisticasDateRange, start: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#64748b] mb-1">Hasta</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg"
                    value={estadisticasDateRange.end}
                    onChange={(e) => setEstadisticasDateRange({ ...estadisticasDateRange, end: e.target.value })}
                  />
                </div>
              </div>
            )}
            
            <button
              className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center justify-center gap-2"
              onClick={handleGenerateEstadisticas}
              disabled={isGenerating === 'estadisticas'}
            >
              {isGenerating === 'estadisticas' ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  Generando...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faDownload} />
                  Generar PDF
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Accesos Rápidos */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-[#1a365d] mb-4">Accesos Rápidos</h3>
        <div className="flex gap-4 flex-wrap">
          <button
            className="px-4 py-2 bg-white border border-[#e2e8f0] rounded-lg hover:bg-[#f8fafc] flex items-center gap-2"
            onClick={() => {
              setSelectedFecha(currentDate.toISOString().split('T')[0])
              handleGenerateFecha()
            }}
          >
            <FontAwesomeIcon icon={faFilePdf} className="text-red-500" />
            PDF de Hoy
          </button>
          
          <button
            className="px-4 py-2 bg-white border border-[#e2e8f0] rounded-lg hover:bg-[#f8fafc] flex items-center gap-2"
            onClick={() => {
              updateDateRangeByPeriod('semana', 'estadisticas')
              setShowCustomRange({ ...showCustomRange, estadisticas: false })
              setTimeout(() => handleGenerateEstadisticas(), 100)
            }}
          >
            <FontAwesomeIcon icon={faFilePdf} className="text-red-500" />
            Resumen Semanal
          </button>
          
          <button
            className="px-4 py-2 bg-white border border-[#e2e8f0] rounded-lg hover:bg-[#f8fafc] flex items-center gap-2"
            onClick={() => {
              updateDateRangeByPeriod('mes', 'estadisticas')
              setShowCustomRange({ ...showCustomRange, estadisticas: false })
              setTimeout(() => handleGenerateEstadisticas(), 100)
            }}
          >
            <FontAwesomeIcon icon={faFilePdf} className="text-red-500" />
            Resumen Mensual
          </button>
        </div>
      </div>
    </div>
  )
}

export default InformesTab