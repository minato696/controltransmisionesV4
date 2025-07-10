// components/tabs/ResumenTab.tsx
import { useState, useEffect } from 'react'
import { useAppContext } from '../AppContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faChartBar, faClipboardList, faUserCheck, faCity, faArrowUp, faArrowDown,
  faGlobe, faSpinner, faVideo, faCheckCircle, faExclamationTriangle, faCalendarWeek,
  faClock, faTrophy, faChartLine, faChartPie, faFireAlt, faFilePdf, faFileAlt,
  faUser, faExclamationCircle, faTable, faEye, faTimes, faCalendar, faSync,
  faChevronLeft, faChevronRight
} from '@fortawesome/free-solid-svg-icons'
import { exportResumenSemanalPDF } from '../../utils/dashboardPdfExporter'
import { formatCityName } from '../../utils/cityUtils'
// IMPORTAR funciones de dateUtils
import { 
  formatDateForAPI, 
  getCurrentDateLima, 
  getMonday as getMondayLima,
  getSunday as getSundayLima,
  parseDateLima,
  formatDateForDisplay,
  isWeekComplete as checkWeekComplete,
  isCurrentWeek as checkCurrentWeek,
  getFirstDayOfMonth,
  getLastDayOfMonth,
  addDays
} from '@/utils/dateUtils'

interface Despacho {
  id: number
  reportero_id: number
  numero_despacho: number
  titulo: string
  hora_despacho: string
  hora_en_vivo: string | null
  fecha_despacho: string
  estado: string
  reportero: {
    id: number
    nombre: string
    ciudad: {
      id: number
      codigo: string
      nombre: string
    }
  }
}

interface ReporteroDetalle {
  id: number
  nombre: string
  ciudad: string
  totalDespachos: number
  despachosConTitulo: number
  despachosEnVivo: number
  despachosConProblemas: number
  porcentajeTitulos: number
  porcentajeEnVivo: number
  despachos: Despacho[]
}

interface Estadisticas {
  totalDespachos: number
  promedioDespachosDiarios: number
  reporterosActivos: number
  coberturaNacional: number
  despachosEnVivo: number
  porcentajeEnVivo: number
  despachosConProblemas: number
  porcentajeConProblemas: number
  topCiudades: Array<{
    id: number
    nombre: string
    despachos: number
    porcentaje: number
  }>
  topReporteros: Array<{
    id: number
    nombre: string
    ciudad: string
    despachos: number
    porcentaje: number
  }>
  despachosPorDia: Array<{
    dia: string
    total: number
  }>
  reporterosSinActividad?: number
  despachosConTitulo?: number
  porcentajeTitulos?: number
  horasPicoReales?: Array<{
    hora: string
    cantidad: number
  }>
  reporterosDetalle?: ReporteroDetalle[]
  distribucionPorHora?: Array<{
    rango: string
    cantidad: number
    porcentaje: number
  }>
}

const ResumenTab = () => {
  const { currentDate, setNotification } = useAppContext()
  
  // Estados para los filtros de fecha
  const [periodoSelect, setPeriodoSelect] = useState('semanal')
  const [fechaReferencia, setFechaReferencia] = useState<Date>(new Date(currentDate))
  const [fechaInicio, setFechaInicio] = useState<Date>(getMondayLima(currentDate))
  const [fechaFin, setFechaFin] = useState<Date>(getSundayLima(currentDate))
  
  // Estados para manejo de datos y UI
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null)
  const [loading, setLoading] = useState(true)
  const [actualizando, setActualizando] = useState(false)
  const [despachos, setDespachos] = useState<Despacho[]>([])
  const [showDetalleReportero, setShowDetalleReportero] = useState<number | null>(null)
  const [reporteroSeleccionado, setReporteroSeleccionado] = useState<ReporteroDetalle | null>(null)
  
  // Sincronizar con cambios en currentDate
  useEffect(() => {
    setFechaReferencia(new Date(currentDate))
    actualizarRangoDeFechas(periodoSelect, new Date(currentDate))
  }, [currentDate])
  
  // Función para actualizar el rango de fechas según el período
  const actualizarRangoDeFechas = (periodo: string, fecha: Date) => {
    let inicio, fin;
    
    switch (periodo) {
      case 'diario':
        inicio = fin = new Date(fecha);
        break;
      case 'semanal':
        inicio = getMondayLima(fecha);
        fin = getSundayLima(fecha);
        break;
      case 'mensual':
        inicio = getFirstDayOfMonth(fecha);
        fin = getLastDayOfMonth(fecha);
        break;
      default:
        inicio = getMondayLima(fecha);
        fin = getSundayLima(fecha);
    }
    
    setFechaInicio(inicio);
    setFechaFin(fin);
    
    // Cargar datos con el nuevo rango
    cargarEstadisticas(formatDateForAPI(inicio), formatDateForAPI(fin), periodo);
  }
  
  // Función para cargar las estadísticas desde la API
  const cargarEstadisticas = async (desde: string, hasta: string, periodo: string) => {
    setLoading(true);
    try {
      console.log(`Cargando estadísticas para: ${desde} hasta ${hasta}, período: ${periodo}`);
      
      // Cargar estadísticas
      const urlEstadisticas = `/api/estadisticas?periodo=${periodo}&fechaInicio=${desde}&fechaFin=${hasta}`;
      const responseEstadisticas = await fetch(urlEstadisticas);
      if (!responseEstadisticas.ok) {
        throw new Error('Error al obtener estadísticas');
      }
      const dataEstadisticas = await responseEstadisticas.json();
      
      // Cargar despachos detallados
      const urlDespachos = `/api/despachos?desde=${desde}&hasta=${hasta}`;
      const responseDespachos = await fetch(urlDespachos);
      if (!responseDespachos.ok) {
        throw new Error('Error al obtener despachos');
      }
      const dataDespachos = await responseDespachos.json();
      
      // Si es período diario, filtrar para mostrar solo despachos del día exacto
      let despachosAjustados = dataDespachos;
      if (periodo === 'diario') {
        despachosAjustados = dataDespachos.filter((d: Despacho) => {
          const fechaDespacho = new Date(d.fecha_despacho).toISOString().split('T')[0];
          return fechaDespacho === desde;
        });
        console.log(`Filtrados ${despachosAjustados.length} despachos para la fecha exacta ${desde}`);
      }
      
      setDespachos(despachosAjustados);
      console.log(`Recibidos ${dataDespachos.length} despachos para el período`);
      
      // Procesar datos adicionales
      const despachosConTitulo = despachosAjustados.filter((d: Despacho) => d.titulo && d.titulo.trim() !== '').length;
      const porcentajeTitulos = despachosAjustados.length > 0 ? (despachosConTitulo / despachosAjustados.length * 100) : 0;
      
      // Calcular reporteros sin actividad
      const reporterosConDespachos = new Set(despachosAjustados.map((d: Despacho) => d.reportero_id));
      const totalReporteros = await fetch('/api/reporteros').then(r => r.json()).then(data => data.length);
      const reporterosSinActividad = totalReporteros - reporterosConDespachos.size;
      
      // Calcular horas pico reales
      const horasPicoMap: { [key: string]: number } = {};
      despachosAjustados.forEach((d: Despacho) => {
        if (d.hora_despacho) {
          const hora = d.hora_despacho.split(':')[0];
          horasPicoMap[hora] = (horasPicoMap[hora] || 0) + 1;
        }
      });
      
      const horasPicoReales = Object.entries(horasPicoMap)
        .map(([hora, cantidad]) => ({ hora: `${hora}:00`, cantidad }))
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 5);
      
      // Procesar detalle por reportero
      const reporterosMap: { [key: number]: ReporteroDetalle } = {};
      
      despachosAjustados.forEach((despacho: Despacho) => {
        if (!reporterosMap[despacho.reportero_id]) {
          reporterosMap[despacho.reportero_id] = {
            id: despacho.reportero_id,
            nombre: despacho.reportero.nombre,
            ciudad: despacho.reportero.ciudad.nombre,
            totalDespachos: 0,
            despachosConTitulo: 0,
            despachosEnVivo: 0,
            despachosConProblemas: 0,
            porcentajeTitulos: 0,
            porcentajeEnVivo: 0,
            despachos: []
          };
        }
        
        const reportero = reporterosMap[despacho.reportero_id];
        reportero.totalDespachos++;
        reportero.despachos.push(despacho);
        
        if (despacho.titulo && despacho.titulo.trim() !== '') {
          reportero.despachosConTitulo++;
        }
        if (despacho.hora_en_vivo && despacho.hora_en_vivo.trim() !== '') {
          reportero.despachosEnVivo++;
        }
        if (despacho.estado === 'problema') {
          reportero.despachosConProblemas++;
        }
      });
      
      // Calcular porcentajes
      Object.values(reporterosMap).forEach(reportero => {
        reportero.porcentajeTitulos = reportero.totalDespachos > 0 
          ? Math.round((reportero.despachosConTitulo / reportero.totalDespachos) * 100)
          : 0;
        reportero.porcentajeEnVivo = reportero.totalDespachos > 0
          ? Math.round((reportero.despachosEnVivo / reportero.totalDespachos) * 100)
          : 0;
      });
      
      const reporterosDetalle = Object.values(reporterosMap)
        .sort((a, b) => b.totalDespachos - a.totalDespachos);
      
      // Mejorar los datos de estadísticas
      const enhancedData = {
        ...dataEstadisticas,
        despachosConTitulo,
        porcentajeTitulos: porcentajeTitulos.toFixed(1),
        reporterosSinActividad,
        horasPicoReales,
        reporterosDetalle,
        distribucionPorHora: [
          { 
            rango: 'Mañana (6-12h)', 
            cantidad: despachosAjustados.filter((d: Despacho) => {
              const hora = parseInt(d.hora_despacho?.split(':')[0] || '0');
              return hora >= 6 && hora < 12;
            }).length,
            porcentaje: 0 
          },
          { 
            rango: 'Tarde (12-18h)', 
            cantidad: despachosAjustados.filter((d: Despacho) => {
              const hora = parseInt(d.hora_despacho?.split(':')[0] || '0');
              return hora >= 12 && hora < 18;
            }).length,
            porcentaje: 0 
          },
          { 
            rango: 'Noche (18-24h)', 
            cantidad: despachosAjustados.filter((d: Despacho) => {
              const hora = parseInt(d.hora_despacho?.split(':')[0] || '0');
              return hora >= 18 && hora < 24;
            }).length,
            porcentaje: 0 
          }
        ]
      };
      
      // Calcular porcentajes de distribución por hora
      const totalConHora = enhancedData.distribucionPorHora.reduce((sum: number, item: any) => sum + item.cantidad, 0);
      enhancedData.distribucionPorHora.forEach((item: any) => {
        item.porcentaje = totalConHora > 0 ? Math.round((item.cantidad / totalConHora) * 100) : 0;
      });
      
      setEstadisticas(enhancedData);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      setNotification({
        show: true,
        type: 'error',
        title: 'Error',
        message: 'No se pudieron cargar las estadísticas'
      });
    } finally {
      setLoading(false);
      setActualizando(false);
    }
  };

  // Efecto para cargar estadísticas al cambiar el período
  useEffect(() => {
    actualizarRangoDeFechas(periodoSelect, fechaReferencia);
  }, [periodoSelect]);
  
  // Función para navegar a período anterior o siguiente
  const navegarPeriodo = (direccion: 'anterior' | 'siguiente') => {
    let nuevaFecha = new Date(fechaReferencia);
    
    switch (periodoSelect) {
      case 'diario':
        nuevaFecha = addDays(nuevaFecha, direccion === 'anterior' ? -1 : 1);
        break;
      case 'semanal':
        nuevaFecha = addDays(nuevaFecha, direccion === 'anterior' ? -7 : 7);
        break;
      case 'mensual':
        nuevaFecha.setMonth(nuevaFecha.getMonth() + (direccion === 'anterior' ? -1 : 1));
        break;
    }
    
    setFechaReferencia(nuevaFecha);
    actualizarRangoDeFechas(periodoSelect, nuevaFecha);
  };

  // Función para refrescar datos manualmente
  const refrescarDatos = () => {
    setActualizando(true);
    actualizarRangoDeFechas(periodoSelect, fechaReferencia);
  };
  
  // Formato para mostrar el período actual
  const formatoPeriodoActual = () => {
    switch (periodoSelect) {
      case 'diario':
        return formatDateForDisplay(fechaReferencia, { includeWeekday: true });
      case 'semanal':
        return `${formatDateForDisplay(fechaInicio)} - ${formatDateForDisplay(fechaFin)}`;
      case 'mensual':
        return fechaReferencia.toLocaleDateString('es-ES', { 
          year: 'numeric', 
          month: 'long' 
        });
    }
  };

  // Función para ver detalle de reportero - MANTENER ESTA FUNCIÓN SIN CAMBIOS
  const verDetalleReportero = (reportero: ReporteroDetalle) => {
    // Asegurar que cada despacho tenga la fecha formateada correctamente
    const despachosConFechaCorrecta = reportero.despachos.map(despacho => {
      // Aseguramos que primero convertimos la fecha a objeto Date sin formato
      const fechaObj = new Date(despacho.fecha_despacho);
      
      // Corregimos la zona horaria agregando 5 horas (compensando UTC-5 de Lima)
      // Este paso es clave para evitar que se muestre un día anterior
      fechaObj.setHours(fechaObj.getHours() + 5);
      
      return {
        ...despacho,
        // Formateamos la fecha para mostrar
        fecha_despacho_formateada: formatDateForDisplay(fechaObj, {
          includeWeekday: false,
          shortFormat: false
        })
      };
    });
    
    setReporteroSeleccionado({
      ...reportero,
      despachos: despachosConFechaCorrecta
    });
    setShowDetalleReportero(reportero.id);
  };

  // Función para exportar a PDF
  const handleExportPDF = async () => {
    try {
      let fechas = formatoPeriodoActual();
      await exportResumenSemanalPDF(periodoSelect, fechas);
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      setNotification({
        show: true,
        type: 'error',
        title: 'Error',
        message: 'No se pudo exportar el PDF'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <FontAwesomeIcon icon={faSpinner} spin className="text-3xl text-primary mr-3" />
        <span className="text-lg">Cargando estadísticas...</span>
      </div>
    );
  }

  if (!estadisticas) {
    return (
      <div className="text-center p-8 bg-[#f8fafc] rounded-lg border border-[#e2e8f0] text-[#64748b]">
        <p>No hay datos estadísticos disponibles para este período.</p>
        <button 
          className="mt-4 px-4 py-2 bg-[#1a56db] text-white rounded-lg hover:bg-[#1e429f] transition-colors"
          onClick={refrescarDatos}
        >
          <FontAwesomeIcon icon={faSync} className="mr-2" />
          Intentar cargar nuevamente
        </button>
      </div>
    );
  }

  return (
    <div id="resumen-tab-container">
      <div id="dashboard-content">
        <div className="flex justify-between items-center mb-6" id="dashboard-controls">
          <h2 className="text-xl font-semibold text-[#1a365d] flex items-center gap-3">
            <FontAwesomeIcon icon={faChartBar} />
            Resumen {periodoSelect === 'semanal' ? 'Semanal' : periodoSelect === 'diario' ? 'Diario' : 'Mensual'}
          </h2>
          <div className="flex gap-4 items-center">
            <button
              onClick={refrescarDatos}
              className="px-3 py-2 bg-[#10b981] text-white rounded-lg hover:bg-[#0d9669] transition-colors flex items-center gap-2"
              disabled={actualizando}
            >
              <FontAwesomeIcon icon={actualizando ? faSpinner : faSync} spin={actualizando} />
              {actualizando ? 'Actualizando...' : 'Actualizar'}
            </button>
            
            <button
              onClick={handleExportPDF}
              className="px-3 py-2 bg-[#ef4444] text-white rounded-lg hover:bg-[#dc2626] transition-colors flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faFilePdf} />
              Exportar PDF
            </button>
            
            <select 
              className="px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg shadow-sm transition-all focus:outline-none focus:border-[#1a56db] focus:ring focus:ring-[#1a56db] focus:ring-opacity-25"
              value={periodoSelect}
              onChange={(e) => setPeriodoSelect(e.target.value)}
            >
              <option value="diario">Diario</option>
              <option value="semanal">Semanal</option>
              <option value="mensual">Mensual</option>
            </select>
          </div>
        </div>

        {/* Navegación de período */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex items-center justify-between">
          <button 
            onClick={() => navegarPeriodo('anterior')}
            className="px-3 py-2 bg-white border border-[#e2e8f0] rounded-lg hover:bg-[#f8fafc] transition-colors flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faChevronLeft} />
            {periodoSelect === 'diario' ? 'Día anterior' : 
             periodoSelect === 'semanal' ? 'Semana anterior' : 'Mes anterior'}
          </button>
          
          <div className="flex items-center gap-2 font-medium">
            <FontAwesomeIcon icon={faCalendar} className="text-[#1a56db]" />
            <span>{formatoPeriodoActual()}</span>
          </div>
          
          <button 
            onClick={() => navegarPeriodo('siguiente')}
            className="px-3 py-2 bg-white border border-[#e2e8f0] rounded-lg hover:bg-[#f8fafc] transition-colors flex items-center gap-2"
          >
            {periodoSelect === 'diario' ? 'Día siguiente' : 
             periodoSelect === 'semanal' ? 'Semana siguiente' : 'Mes siguiente'}
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>

        {/* KPIs principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-5 hover:shadow-md hover:-translate-y-[2px] transition-all">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm text-[#64748b] font-medium">Total Despachos</h4>
                <p className="text-2xl font-bold mt-1 mb-0 text-[#1e293b]">{estadisticas.totalDespachos}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#e0f2fe] text-[#1a56db] flex items-center justify-center text-xl">
                <FontAwesomeIcon icon={faClipboardList} />
              </div>
            </div>
            <div className="mt-2 text-sm text-[#64748b]">
              <span>
                {periodoSelect === 'diario' ? 'Del día' : 
                 periodoSelect === 'semanal' ? 'De la semana' : 'Del mes'}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-5 hover:shadow-md hover:-translate-y-[2px] transition-all">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm text-[#64748b] font-medium">Promedio Diario</h4>
                <p className="text-2xl font-bold mt-1 mb-0 text-[#1e293b]">{estadisticas.promedioDespachosDiarios.toFixed(1)}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#ecfdf5] text-[#10b981] flex items-center justify-center text-xl">
                <FontAwesomeIcon icon={faClipboardList} />
              </div>
            </div>
            <div className="mt-2 text-sm text-[#64748b]">
              <span>Despachos por día</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-5 hover:shadow-md hover:-translate-y-[2px] transition-all">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm text-[#64748b] font-medium">Reporteros Activos</h4>
                <p className="text-2xl font-bold mt-1 mb-0 text-[#1e293b]">{estadisticas.reporterosActivos}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#fffbeb] text-[#f59e0b] flex items-center justify-center text-xl">
                <FontAwesomeIcon icon={faUserCheck} />
              </div>
            </div>
            <div className="mt-2 text-sm text-[#64748b]">
              <span>Con al menos 1 despacho</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-5 hover:shadow-md hover:-translate-y-[2px] transition-all">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm text-[#64748b] font-medium">Cobertura Nacional</h4>
                <p className="text-2xl font-bold mt-1 mb-0 text-[#1e293b]">{estadisticas.coberturaNacional.toFixed(1)}%</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#eff6ff] text-[#3b82f6] flex items-center justify-center text-xl">
                <FontAwesomeIcon icon={faGlobe} />
              </div>
            </div>
            <div className="mt-2 text-sm text-[#64748b]">
              <span>Ciudades activas</span>
            </div>
          </div>
        </div>

        {/* KPIs secundarios con métricas mejoradas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 hover:shadow-md hover:-translate-y-[2px] transition-all flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#e0f2fe] text-[#1a56db] flex items-center justify-center text-xl">
                <FontAwesomeIcon icon={faVideo} />
              </div>
              <div>
                <h4 className="text-sm text-[#64748b] font-medium">Despachos En Vivo</h4>
                <p className="text-xl font-bold mt-0.5 mb-0 text-[#1e293b]">{estadisticas.despachosEnVivo}</p>
              </div>
            </div>
            <div className="text-xl font-semibold text-[#1a56db]">
              {estadisticas.totalDespachos > 0 ? estadisticas.porcentajeEnVivo.toFixed(0) : 0}%
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 hover:shadow-md hover:-translate-y-[2px] transition-all flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#ecfdf5] text-[#10b981] flex items-center justify-center text-xl">
                <FontAwesomeIcon icon={faFileAlt} />
              </div>
              <div>
                <h4 className="text-sm text-[#64748b] font-medium">Despachos con Título</h4>
                <p className="text-xl font-bold mt-0.5 mb-0 text-[#1e293b]">
                  {estadisticas.despachosConTitulo || 0}
                </p>
              </div>
            </div>
            <div className="text-xl font-semibold text-[#10b981]">
              {estadisticas.porcentajeTitulos || 0}%
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 hover:shadow-md hover:-translate-y-[2px] transition-all flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#fee2e2] text-[#ef4444] flex items-center justify-center text-xl">
                <FontAwesomeIcon icon={faExclamationCircle} />
              </div>
              <div>
                <h4 className="text-sm text-[#64748b] font-medium">Reporteros Sin Actividad</h4>
                <p className="text-xl font-bold mt-0.5 mb-0 text-[#1e293b]">{estadisticas.reporterosSinActividad || 0}</p>
              </div>
            </div>
            <div className="text-sm text-[#ef4444]">
              Requieren atención
            </div>
          </div>
        </div>

        {/* Detalle de Despachos por Reportero */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-4 border-b border-[#e2e8f0] flex justify-between items-center">
            <h3 className="font-semibold text-[#1a365d] flex items-center gap-2">
              <FontAwesomeIcon icon={faTable} className="text-[#1a56db]" />
              Detalle de Despachos por Reportero
            </h3>
            <span className="text-sm text-[#64748b]">
              Total: {estadisticas.reporterosDetalle?.length || 0} reporteros con actividad
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#f8fafc]">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-[#475569] text-sm">Reportero</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#475569] text-sm">Ciudad</th>
                  <th className="text-center py-3 px-4 font-semibold text-[#475569] text-sm">Total</th>
                  <th className="text-center py-3 px-4 font-semibold text-[#475569] text-sm">Con Título</th>
                  <th className="text-center py-3 px-4 font-semibold text-[#475569] text-sm">En Vivo</th>
                  <th className="text-center py-3 px-4 font-semibold text-[#475569] text-sm">Problemas</th>
                  <th className="text-center py-3 px-4 font-semibold text-[#475569] text-sm">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {estadisticas.reporterosDetalle?.map((reportero, index) => (
                  <tr key={reportero.id} className="border-b border-[#e2e8f0] hover:bg-[#f8fafc]">
                    <td className="py-3 px-4">
                      <div className="font-medium text-[#1e293b]">{reportero.nombre}</div>
                    </td>
                    <td className="py-3 px-4 text-[#64748b]">{reportero.ciudad}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-semibold text-[#1e293b]">{reportero.totalDespachos}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-[#10b981]">{reportero.despachosConTitulo}</span>
                        <span className="text-xs text-[#64748b]">({reportero.porcentajeTitulos}%)</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-[#3b82f6]">{reportero.despachosEnVivo}</span>
                        <span className="text-xs text-[#64748b]">({reportero.porcentajeEnVivo}%)</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`${reportero.despachosConProblemas > 0 ? 'text-[#ef4444]' : 'text-[#10b981]'}`}>
                        {reportero.despachosConProblemas}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => verDetalleReportero(reportero)}
                        className="text-[#1a56db] hover:text-[#1e429f] transition-colors"
                      >
                        <FontAwesomeIcon icon={faEye} /> Ver detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(estadisticas.reporterosDetalle?.length || 0) > 10 && (
              <div className="p-4 text-center text-sm text-[#64748b]">
                Mostrando primeros {Math.min(10, estadisticas.reporterosDetalle?.length || 0)} de {estadisticas.reporterosDetalle?.length} reporteros
              </div>
            )}
          </div>
        </div>

        {/* Top Ciudades y Reporteros */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Top 5 Ciudades */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-[#e2e8f0]">
              <h3 className="font-semibold text-[#1a365d] flex items-center gap-2">
                <FontAwesomeIcon icon={faCity} className="text-[#1a56db]" />
                Top 5 Ciudades
              </h3>
            </div>
            <div className="p-6">
              {estadisticas.topCiudades.length > 0 ? (
                <div className="space-y-4">
                  {estadisticas.topCiudades.map((ciudad, index) => (
                    <div key={ciudad.id} className="flex items-center">
                      <div className="w-6 text-xs text-[#64748b] font-medium">{index + 1}.</div>
                      <div className="w-24 md:w-32 font-medium text-[#1e293b]">{ciudad.nombre}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-[#1a56db] rounded-full" 
                              style={{ width: `${ciudad.porcentaje}%` }}
                            ></div>
                          </div>
                          <div className="w-12 text-xs font-semibold text-[#1a56db]">{ciudad.despachos}</div>
                          <div className="w-10 text-xs text-[#64748b]">{ciudad.porcentaje}%</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-[#64748b] py-4">No hay datos disponibles</p>
              )}
            </div>
          </div>

          {/* Top 5 Reporteros */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-[#e2e8f0]">
              <h3 className="font-semibold text-[#1a365d] flex items-center gap-2">
                <FontAwesomeIcon icon={faUserCheck} className="text-[#1a56db]" />
                Top 5 Reporteros
              </h3>
            </div>
            <div className="p-6">
              {estadisticas.topReporteros.length > 0 ? (
                <div className="space-y-4">
                  {estadisticas.topReporteros.map((reportero, index) => (
                    <div key={reportero.id} className="flex items-center">
                      <div className="w-6 text-xs text-[#64748b] font-medium">{index + 1}.</div>
                      <div className="w-28 md:w-40 font-medium text-[#1e293b]">{reportero.nombre}</div>
                      <div className="w-16 md:w-20 text-xs text-[#64748b]">{reportero.ciudad}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-[#10b981] rounded-full" 
                              style={{ width: `${reportero.porcentaje * 2}%` }}
                            ></div>
                          </div>
                          <div className="w-8 text-xs font-semibold text-[#10b981]">{reportero.despachos}</div>
                          <div className="w-8 text-xs text-[#64748b]">{reportero.porcentaje}%</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-[#64748b] py-4">No hay datos disponibles</p>
              )}
            </div>
          </div>
        </div>

        {/* Sección de análisis adicionales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Gráfico de despachos por día */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-[#e2e8f0]">
              <h3 className="font-semibold text-[#1a365d] flex items-center gap-2">
                <FontAwesomeIcon icon={faChartLine} className="text-[#1a56db]" />
                Despachos por Día
              </h3>
            </div>
            <div className="p-6">
              {estadisticas.despachosPorDia && estadisticas.despachosPorDia.length > 0 ? (
                <div className="h-[300px] relative">
                  {estadisticas.despachosPorDia.map((dia, index) => {
                    const maxDespachos = Math.max(...estadisticas.despachosPorDia.map(d => d.total), 1)
                    const left = 30 + (index * ((100 - 60) / (estadisticas.despachosPorDia.length - 1)))
                    const height = (dia.total / maxDespachos) * 200
                    const date = parseDateLima(dia.dia)
                    const dayName = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][date.getDay()]
                    
                    return (
                      <div key={dia.dia}>
                        <div 
                          className="absolute bottom-0 w-[30px] bg-[#1a56db] rounded-t-md cursor-pointer hover:bg-[#1e429f] group transition-all"
                          style={{ left: `${left}%`, height: `${height}px`, transform: 'translateX(-50%)' }}
                        >
                          <div className="absolute top-[-25px] w-[60px] left-[-15px] text-center font-semibold text-xs text-[#1a56db] opacity-0 group-hover:opacity-100 transition-opacity">
                            {dia.total}
                          </div>
                        </div>
                        <div 
                          className="absolute bottom-[-25px] w-[60px] text-center text-xs text-[#64748b]"
                          style={{ left: `${left}%`, transform: 'translateX(-50%)' }}
                        >
                          {dayName}
                        </div>
                        <div 
                          className="absolute bottom-[-40px] w-[60px] text-center text-xs text-[#94a3b8]"
                          style={{ left: `${left}%`, transform: 'translateX(-50%)' }}
                        >
                          {date.getDate()}
                        </div>
                      </div>
                    )
                  })}
                  <div className="absolute left-0 right-0 bottom-0 h-[1px] bg-[#f1f5f9]"></div>
                </div>
              ) : (
                <p className="text-center text-[#64748b] py-8">No hay datos de despachos para mostrar</p>
              )}
            </div>
          </div>

          {/* Análisis de Horas Pico Real */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-[#e2e8f0]">
              <h3 className="font-semibold text-[#1a365d] flex items-center gap-2">
                <FontAwesomeIcon icon={faClock} className="text-[#1a56db]" />
                Análisis de Horas Pico
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-[#64748b] mb-3">Distribución por Franja Horaria</h4>
                  {estadisticas.distribucionPorHora?.map((franja: any, index: number) => (
                    <div key={index} className="flex items-center mb-3">
                      <div className="w-32 text-sm font-medium text-[#1e293b]">{franja.rango}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-6 bg-[#f1f5f9] rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                index === 0 ? 'bg-[#f59e0b]' : 
                                index === 1 ? 'bg-[#3b82f6]' : 
                                'bg-[#8b5cf6]'
                              }`}
                              style={{ width: `${franja.porcentaje}%` }}
                            ></div>
                          </div>
                          <div className="w-16 text-sm text-right">
                            <span className="font-semibold">{franja.cantidad}</span>
                            <span className="text-[#64748b] ml-1">({franja.porcentaje}%)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {estadisticas.horasPicoReales && estadisticas.horasPicoReales.length > 0 && (
                  <div className="bg-[#eff6ff] rounded-lg p-4">
                    <h4 className="text-sm font-medium text-[#1e40af] mb-2">Top 5 Horas Más Activas</h4>
                    <div className="space-y-2">
                      {estadisticas.horasPicoReales.map((hora, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm text-[#3730a3]">{hora.hora}</span>
                          <span className="text-sm font-semibold text-[#1e40af]">{hora.cantidad} despachos</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Nueva fila de análisis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Tendencia de Productividad */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-[#e2e8f0]">
              <h3 className="font-semibold text-[#1a365d] flex items-center gap-2">
                <FontAwesomeIcon icon={faChartPie} className="text-[#1a56db]" />
                Estado General
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#64748b]">Despachos Completados</span>
                  <span className="font-semibold text-[#10b981]">
                    {estadisticas.totalDespachos - estadisticas.despachosConProblemas}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#64748b]">Promedio por Reportero</span>
                  <span className="font-semibold text-[#1e293b]">
                    {estadisticas.reporterosActivos > 0 
                      ? (estadisticas.totalDespachos / estadisticas.reporterosActivos).toFixed(1)
                      : '0'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#64748b]">Tasa de Éxito</span>
                  <span className="font-semibold text-[#10b981]">
                    {estadisticas.totalDespachos > 0
                      ? ((estadisticas.totalDespachos - estadisticas.despachosConProblemas) / estadisticas.totalDespachos * 100).toFixed(1)
                      : '0'}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Reporteros Destacados */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-[#e2e8f0]">
              <h3 className="font-semibold text-[#1a365d] flex items-center gap-2">
                <FontAwesomeIcon icon={faTrophy} className="text-[#f59e0b]" />
                Reporteros Destacados
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[#fffbeb] rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#f59e0b] rounded-full flex items-center justify-center text-white font-bold text-sm">
                      1
                    </div>
                    <div>
                      <p className="font-medium text-[#92400e]">Más Productivo</p>
                      <p className="text-sm text-[#b45309]">
                        {estadisticas.topReporteros[0]?.nombre || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#92400e]">
                      {estadisticas.topReporteros[0]?.despachos || 0}
                    </p>
                    <p className="text-xs text-[#b45309]">despachos</p>
                  </div>
                </div>

                {estadisticas.reporterosDetalle && estadisticas.reporterosDetalle.length > 0 && (
                  <div className="flex items-center justify-between p-3 bg-[#ecfdf5] rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#10b981] rounded-full flex items-center justify-center text-white">
                        <FontAwesomeIcon icon={faFireAlt} />
                      </div>
                      <div>
                        <p className="font-medium text-[#064e3b]">Mayor % En Vivo</p>
                        <p className="text-sm text-[#059669]">
                          {(() => {
                            const mejorEnVivo = estadisticas.reporterosDetalle
                              .filter(r => r.totalDespachos > 0)
                              .sort((a, b) => b.porcentajeEnVivo - a.porcentajeEnVivo)[0]
                            return mejorEnVivo?.nombre || 'N/A'
                          })()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#064e3b]">
                        {(() => {
                          const mejorEnVivo = estadisticas.reporterosDetalle
                            .filter(r => r.totalDespachos > 0)
                            .sort((a, b) => b.porcentajeEnVivo - a.porcentajeEnVivo)[0]
                          return mejorEnVivo?.porcentajeEnVivo || 0
                        })()}%
                      </p>
                      <p className="text-xs text-[#059669]">en vivo</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Métricas de Calidad */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-[#e2e8f0]">
              <h3 className="font-semibold text-[#1a365d] flex items-center gap-2">
                <FontAwesomeIcon icon={faCheckCircle} className="text-[#10b981]" />
                Métricas de Calidad
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-[#64748b]">Tasa de Cumplimiento</span>
                    <span className="font-semibold text-[#10b981]">
                      {estadisticas.totalDespachos > 0 
                        ? ((estadisticas.totalDespachos - estadisticas.despachosConProblemas) / estadisticas.totalDespachos * 100).toFixed(0)
                        : 100}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#10b981] rounded-full" 
                      style={{ 
                        width: `${estadisticas.totalDespachos > 0 
                          ? ((estadisticas.totalDespachos - estadisticas.despachosConProblemas) / estadisticas.totalDespachos * 100)
                          : 100}%` 
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-[#64748b]">Despachos con Título</span>
                    <span className="font-semibold text-[#3b82f6]">
                      {estadisticas.porcentajeTitulos || 0}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#3b82f6] rounded-full" 
                      style={{ width: `${estadisticas.porcentajeTitulos || 0}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-[#64748b]">Grabados en Vivo</span>
                    <span className="font-semibold text-[#f59e0b]">
                      {estadisticas.porcentajeEnVivo.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#f59e0b] rounded-full" 
                      style={{ width: `${estadisticas.porcentajeEnVivo}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de detalle de reportero */}
      {showDetalleReportero && reporteroSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-[#e2e8f0] flex justify-between items-center">
              <h3 className="font-semibold text-[#1a365d] flex items-center gap-2">
                <FontAwesomeIcon icon={faUser} />
                Despachos de {reporteroSeleccionado.nombre}
              </h3>
              <button
                onClick={() => setShowDetalleReportero(null)}
                className="text-[#64748b] hover:text-[#1e293b] transition-colors"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="bg-[#f8fafc] p-3 rounded-lg">
                  <div className="text-xs text-[#64748b]">Total Despachos</div>
                  <div className="text-xl font-semibold text-[#1e293b]">{reporteroSeleccionado.totalDespachos}</div>
                </div>
                <div className="bg-[#ecfdf5] p-3 rounded-lg">
                  <div className="text-xs text-[#64748b]">Con Título</div>
                  <div className="text-xl font-semibold text-[#10b981]">{reporteroSeleccionado.despachosConTitulo}</div>
                </div>
                <div className="bg-[#eff6ff] p-3 rounded-lg">
                  <div className="text-xs text-[#64748b]">En Vivo</div>
                  <div className="text-xl font-semibold text-[#3b82f6]">{reporteroSeleccionado.despachosEnVivo}</div>
                </div>
                <div className="bg-[#fee2e2] p-3 rounded-lg">
                  <div className="text-xs text-[#64748b]">Problemas</div>
                  <div className="text-xl font-semibold text-[#ef4444]">{reporteroSeleccionado.despachosConProblemas}</div>
                </div>
              </div>
              
              {/* Periodo seleccionado */}
              <div className="mb-4 bg-[#f8fafc] p-3 rounded-lg flex items-center justify-between">
                <span className="text-sm text-[#475569]">
                  <FontAwesomeIcon icon={faCalendar} className="mr-2 text-[#1a56db]" />
                  Período: {formatoPeriodoActual()}
                </span>
                <span className="text-sm font-medium text-[#1a56db]">
                  {reporteroSeleccionado.despachos.length} despachos en este período
                </span>
              </div>
              
              <table className="w-full">
                <thead className="bg-[#f8fafc]">
                  <tr>
                    <th className="text-left py-2 px-3 text-sm">Fecha</th>
                    <th className="text-left py-2 px-3 text-sm">N°</th>
                    <th className="text-left py-2 px-3 text-sm">Título</th>
                    <th className="text-center py-2 px-3 text-sm">Hora</th>
                    <th className="text-center py-2 px-3 text-sm">En Vivo</th>
                    <th className="text-center py-2 px-3 text-sm">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {reporteroSeleccionado.despachos.map((despacho) => (
                    <tr key={despacho.id} className="border-b border-[#e2e8f0]">
                      <td className="py-2 px-3 text-sm">
                        {despacho.fecha_despacho_formateada || (() => {
                          // Si no existe fecha_despacho_formateada, crear formato de respaldo
                          const fechaObj = new Date(despacho.fecha_despacho);
                          fechaObj.setHours(fechaObj.getHours() + 5); // Compensar zona horaria
                          return formatDateForDisplay(fechaObj);
                        })()}
                      </td>
                      <td className="py-2 px-3 text-sm">{despacho.numero_despacho}</td>
                      <td className="py-2 px-3 text-sm">{despacho.titulo || '-'}</td>
                      <td className="py-2 px-3 text-sm text-center">{despacho.hora_despacho || '-'}</td>
                      <td className="py-2 px-3 text-sm text-center">{despacho.hora_en_vivo || '-'}</td>
                      <td className="py-2 px-3 text-sm text-center">
                        <span className={`inline-block px-2 py-1 rounded text-xs ${
                          despacho.estado === 'completado' ? 'bg-green-100 text-green-800' :
                          despacho.estado === 'problema' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {despacho.estado || 'Programado'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumenTab;