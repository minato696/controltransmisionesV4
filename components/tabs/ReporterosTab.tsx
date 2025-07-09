// components/tabs/ReporterosTab.tsx - HOTFIX para mostrar los despachos del día actual
import { useState, useEffect } from 'react'
import { useAppContext } from '../AppContext'
import { useAuth } from '../AuthContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faUsers, faPlus, faSearch, faPencilAlt, 
  faClipboardList, faTrash, faSpinner, faCheck, 
  faExclamationTriangle, faBan
} from '@fortawesome/free-solid-svg-icons'
import { formatCityName } from '../../utils/cityUtils'
import AddReporteroModal from '../modals/AddReporteroModal'
import ConfirmDeleteModal from '../modals/ConfirmDeleteModal'
import { formatDateForDisplay, parseDateLima } from '@/utils/dateUtils'

interface Reportero {
  id: number
  nombre: string
  estado: string
  ciudad: {
    id: number
    codigo: string
    nombre: string
  }
  despachos_count?: number
  ultimo_despacho?: string
}

const ReporterosTab = () => {
  const { setActiveTab, setSelectedCity, setNotification } = useAppContext()
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [reporteros, setReporteros] = useState<Reportero[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedReportero, setSelectedReportero] = useState<Reportero | null>(null)
  
  // Estados para el modal de confirmación de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [reporteroToDelete, setReporteroToDelete] = useState<Reportero | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // HOTFIX: Función directa para consultar los despachos más recientes de un reportero
  const getUltimoDespacho = async (reporteroId: number) => {
    try {
      // 1. Obtener la fecha actual en el formato YYYY-MM-DD
      const hoy = new Date();
      const año = hoy.getFullYear();
      const mes = String(hoy.getMonth() + 1).padStart(2, '0');
      const dia = String(hoy.getDate()).padStart(2, '0');
      const fechaActual = `${año}-${mes}-${dia}`;
      
      console.log(`Buscando despachos HOY (${fechaActual}) para reportero ID ${reporteroId}`);
      
      // 2. Intentar obtener despachos del día actual
      const respHoy = await fetch(`/api/despachos?reportero_id=${reporteroId}&fecha=${fechaActual}`);
      let despachosHoy = await respHoy.json();
      
      // 3. Si hay despachos hoy, ordena por hora y devuelve el más reciente
      if (despachosHoy && despachosHoy.length > 0) {
        despachosHoy.sort((a: any, b: any) => {
          // Si la hora_despacho es igual, compara por ID (el más reciente tiene ID mayor)
          if (a.hora_despacho === b.hora_despacho) {
            return b.id - a.id;
          }
          // Ordenar por hora de forma descendente (la más reciente primero)
          return b.hora_despacho.localeCompare(a.hora_despacho);
        });
        
        const ultimoDespachoHoy = despachosHoy[0];
        console.log(`Encontrado despacho HOY para ${reporteroId}: ${ultimoDespachoHoy.hora_despacho}`);
        
        // Formatear para mostrar
        return `${fechaActual}, ${ultimoDespachoHoy.hora_despacho}`;
      }
      
      // 4. Si no hay despachos hoy, buscar los últimos 7 días
      const fechaHaceSiete = new Date(hoy);
      fechaHaceSiete.setDate(hoy.getDate() - 7);
      const fechaInicio = fechaHaceSiete.toISOString().split('T')[0];
      
      console.log(`No hay despachos hoy, buscando últimos 7 días (${fechaInicio} a ${fechaActual}) para reportero ID ${reporteroId}`);
      
      const respSemana = await fetch(`/api/despachos?reportero_id=${reporteroId}&desde=${fechaInicio}&hasta=${fechaActual}`);
      let despachosSemana = await respSemana.json();
      
      // 5. Si hay despachos en la semana, ordenar por fecha y hora descendente
      if (despachosSemana && despachosSemana.length > 0) {
        despachosSemana.sort((a: any, b: any) => {
          // Primero comparar por fecha
          const fechaA = new Date(a.fecha_despacho);
          const fechaB = new Date(b.fecha_despacho);
          
          if (fechaA.getTime() !== fechaB.getTime()) {
            return fechaB.getTime() - fechaA.getTime();
          }
          
          // Si la fecha es igual, comparar por hora
          return b.hora_despacho.localeCompare(a.hora_despacho);
        });
        
        const ultimoDespachoSemana = despachosSemana[0];
        
        // Formatear fecha para mostrar
        const fechaUltimo = new Date(ultimoDespachoSemana.fecha_despacho).toISOString().split('T')[0];
        console.log(`Encontrado despacho en SEMANA para ${reporteroId}: ${fechaUltimo}, ${ultimoDespachoSemana.hora_despacho}`);
        
        return `${fechaUltimo}, ${ultimoDespachoSemana.hora_despacho}`;
      }
      
      // 6. Si no hay despachos en la semana
      return 'Sin despachos';
    } catch (error) {
      console.error(`Error al obtener último despacho para reportero ${reporteroId}:`, error);
      return 'Sin despachos';
    }
  };

  // HOTFIX: Función directa para contar despachos de la semana
  const contarDespachosSemanales = async (reporteroId: number) => {
    try {
      // 1. Calcular el rango de fechas para la semana actual
      const hoy = new Date();
      const dia = hoy.getDay() || 7; // 0 es domingo, para cálculos lo convertimos a 7
      const lunes = new Date(hoy);
      lunes.setDate(hoy.getDate() - dia + 1); // Retroceder al lunes
      
      const inicioSemana = lunes.toISOString().split('T')[0];
      const finSemana = hoy.toISOString().split('T')[0];
      
      console.log(`Contando despachos de la semana (${inicioSemana} a ${finSemana}) para reportero ID ${reporteroId}`);
      
      // 2. Consultar API para obtener los despachos de la semana
      const response = await fetch(`/api/despachos?reportero_id=${reporteroId}&desde=${inicioSemana}&hasta=${finSemana}`);
      const despachos = await response.json();
      
      return despachos.length;
    } catch (error) {
      console.error(`Error al contar despachos semanales para reportero ${reporteroId}:`, error);
      return 0;
    }
  };

  // Cargar reporteros desde la API - VERSIÓN HOTFIX
  const loadReporteros = async () => {
    setLoading(true);
    try {
      // 1. Cargar reporteros básicos
      const response = await fetch('/api/reporteros');
      if (!response.ok) {
        throw new Error('Error al obtener reporteros');
      }
      const data = await response.json();
      
      // 2. Procesar cada reportero para obtener sus despachos y último despacho
      const reporterosProcessed = [];
      for (const reportero of data) {
        try {
          // Obtener último despacho directamente (versión HOTFIX)
          const ultimoDespacho = await getUltimoDespacho(reportero.id);
          
          // Contar despachos semanales directamente (versión HOTFIX)
          const conteoSemanal = await contarDespachosSemanales(reportero.id);
          
          reporterosProcessed.push({
            ...reportero,
            despachos_count: conteoSemanal,
            ultimo_despacho: ultimoDespacho
          });
        } catch (error) {
          console.error(`Error procesando reportero ${reportero.id}:`, error);
          reporterosProcessed.push({
            ...reportero,
            despachos_count: 0,
            ultimo_despacho: 'Sin despachos'
          });
        }
      }
      
      setReporteros(reporterosProcessed);
    } catch (error) {
      console.error('Error al cargar reporteros:', error);
      setNotification({
        show: true,
        type: 'error',
        title: 'Error',
        message: 'No se pudieron cargar los reporteros'
      });
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    loadReporteros();
  }, []);

  // Filtrar reporteros según búsqueda
  const filteredReporteros = reporteros.filter(reportero => 
    reportero.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reportero.ciudad.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Función para ir a la pestaña de registro con el reportero seleccionado
  const handleRegistrarDespachos = (reportero: Reportero) => {
    setSelectedCity(reportero.ciudad.codigo)
    setActiveTab('registro')
  }

  // Función para editar reportero
  const handleEditarReportero = (reportero: Reportero) => {
    setSelectedReportero(reportero)
    setShowAddModal(true)
  }

  // Función para mostrar el modal de confirmación de eliminación
  const handleShowDeleteConfirmation = (reportero: Reportero) => {
    setReporteroToDelete(reportero)
    setShowDeleteModal(true)
  }

  // Función para eliminar reportero
  const handleConfirmDelete = async () => {
    if (!reporteroToDelete) return
    
    try {
      setIsDeleting(true)
      
      const response = await fetch(`/api/reporteros/${reporteroToDelete.id}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al eliminar reportero')
      }
      
      // Actualizar la lista de reporteros
      setReporteros(prevReporteros => prevReporteros.filter(r => r.id !== reporteroToDelete.id))
      
      setNotification({
        show: true,
        type: 'success',
        title: 'Reportero eliminado',
        message: data.message || `El reportero ${reporteroToDelete.nombre} ha sido eliminado correctamente`
      })
      
      // Cerrar el modal
      setShowDeleteModal(false)
      setReporteroToDelete(null)
    } catch (error) {
      console.error('Error al eliminar reportero:', error)
      
      setNotification({
        show: true,
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'No se pudo eliminar el reportero'
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Función para obtener la clase de estado
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'activo':
        return 'bg-[#ecfdf5] text-[#10b981]';
      case 'ausente':
        return 'bg-[#fffbeb] text-[#f59e0b]';
      case 'inactivo':
        return 'bg-[#fee2e2] text-[#ef4444]';
      default:
        return 'bg-[#eff6ff] text-[#3b82f6]';
    }
  }

  // Función para renderizar el estado con icono
  const renderEstado = (estado: string) => {
    let icon;
    switch (estado) {
      case 'activo':
        icon = faCheck;
        break;
      case 'ausente':
        icon = faExclamationTriangle;
        break;
      case 'inactivo':
        icon = faBan;
        break;
      default:
        icon = faCheck;
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusClass(estado)}`}>
        <FontAwesomeIcon icon={icon} className="mr-1" />
        {estado.charAt(0).toUpperCase() + estado.slice(1)}
      </span>
    );
  }

  // HOTFIX: Botón para forzar actualización
  const refreshData = () => {
    setLoading(true);
    setTimeout(() => {
      loadReporteros();
    }, 100);
  };

  // SOLUCIÓN: Ver detalles de un reportero con las fechas formateadas correctamente
  const handleVerDetalles = async (reporteroId: number) => {
    try {
      setLoading(true);
      
      // Obtener detalles del reportero
      const response = await fetch(`/api/reporteros/${reporteroId}`);
      if (!response.ok) {
        throw new Error('Error al obtener detalles del reportero');
      }
      
      const reporteroDetalle = await response.json();
      
      // Formatear fechas para los despachos
      if (reporteroDetalle.despachos) {
        reporteroDetalle.despachos = reporteroDetalle.despachos.map((despacho: any) => ({
          ...despacho,
          fecha_formateada: formatDateForDisplay(parseDateLima(despacho.fecha_despacho))
        }));
      }
      
      // Mostrar detalles (aquí podrías abrir un modal)
      console.log('Detalles del reportero con fechas formateadas:', reporteroDetalle);
      
      return reporteroDetalle;
    } catch (error) {
      console.error('Error al obtener detalles del reportero:', error);
      setNotification({
        show: true,
        type: 'error',
        title: 'Error',
        message: 'No se pudieron obtener los detalles del reportero'
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <FontAwesomeIcon icon={faSpinner} spin className="text-3xl text-primary mr-3" />
        <span className="text-lg">Cargando reporteros...</span>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-[#1a365d] flex items-center gap-3">
          <FontAwesomeIcon icon={faUsers} />
          Todos los Reporteros
          <span className="ml-2 text-sm bg-[#e0f2fe] text-[#1a56db] px-2 py-1 rounded-full">
            {reporteros.length} reporteros
          </span>
        </h2>
        <div className="flex gap-3">
          {/* HOTFIX: Botón de actualización */}
          <button 
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[#10b981] text-white rounded-lg shadow-sm hover:bg-[#0d9669] transition-colors"
            onClick={refreshData}
          >
            <FontAwesomeIcon icon={faSpinner} />
            Actualizar Datos
          </button>
          
          {user && user.rol === 'admin' && (
            <button 
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[#1a56db] text-white rounded-lg shadow-sm hover:bg-[#1e429f] transition-colors"
              onClick={() => {
                setSelectedReportero(null)
                setShowAddModal(true)
              }}
            >
              <FontAwesomeIcon icon={faPlus} />
              Agregar Reportero
            </button>
          )}
        </div>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <FontAwesomeIcon icon={faSearch} className="text-[#64748b]" />
        </div>
        <input 
          type="text" 
          className="w-full pl-12 pr-4 py-3 text-sm border border-[#e2e8f0] rounded-lg shadow-sm transition-all focus:outline-none focus:border-[#1a56db] focus:ring focus:ring-[#1a56db] focus:ring-opacity-25"
          placeholder="Buscar reportero por nombre o ciudad..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left py-3.5 px-4 bg-[#f1f5f9] font-semibold text-[#475569] border-b border-[#e2e8f0]">Nombre</th>
              <th className="text-left py-3.5 px-4 bg-[#f1f5f9] font-semibold text-[#475569] border-b border-[#e2e8f0]">Ciudad</th>
              <th className="text-left py-3.5 px-4 bg-[#f1f5f9] font-semibold text-[#475569] border-b border-[#e2e8f0]">Despachos esta semana</th>
              <th className="text-left py-3.5 px-4 bg-[#f1f5f9] font-semibold text-[#475569] border-b border-[#e2e8f0]">Último despacho</th>
              <th className="text-left py-3.5 px-4 bg-[#f1f5f9] font-semibold text-[#475569] border-b border-[#e2e8f0]">Estado</th>
              <th className="text-left py-3.5 px-4 bg-[#f1f5f9] font-semibold text-[#475569] border-b border-[#e2e8f0]">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredReporteros.map(reportero => (
              <tr key={reportero.id} className="hover:bg-[#f1f5f9]">
                <td className="py-3 px-4 border-b border-[#e2e8f0] text-[#1e293b] font-medium">{reportero.nombre}</td>
                <td className="py-3 px-4 border-b border-[#e2e8f0] text-[#1e293b]">{reportero.ciudad.nombre}</td>
                <td className="py-3 px-4 border-b border-[#e2e8f0] text-[#1e293b] text-center">{reportero.despachos_count || 0}</td>
                <td className="py-3 px-4 border-b border-[#e2e8f0] text-[#1e293b]">{reportero.ultimo_despacho || 'Sin despachos'}</td>
                <td className="py-3 px-4 border-b border-[#e2e8f0]">
                  {renderEstado(reportero.estado)}
                </td>
                <td className="py-3 px-4 border-b border-[#e2e8f0]">
                  <div className="flex gap-2">
                    {user && user.rol === 'admin' && (
                      <>
                        <button 
                          className="w-8 h-8 flex items-center justify-center rounded-full text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#1a56db] transition-colors"
                          onClick={() => handleEditarReportero(reportero)}
                          title="Editar reportero"
                        >
                          <FontAwesomeIcon icon={faPencilAlt} />
                        </button>
                        <button 
                          className="w-8 h-8 flex items-center justify-center rounded-full text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#ef4444] transition-colors"
                          onClick={() => handleShowDeleteConfirmation(reportero)}
                          title="Eliminar reportero"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </>
                    )}
                    <button 
                      className="w-8 h-8 flex items-center justify-center rounded-full text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#1a56db] transition-colors"
                      onClick={() => handleRegistrarDespachos(reportero)}
                      title="Registrar despachos"
                    >
                      <FontAwesomeIcon icon={faClipboardList} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {filteredReporteros.length === 0 && (
        <div className="text-center p-8 bg-[#f8fafc] rounded-lg border border-[#e2e8f0] text-[#64748b] mt-6">
          <p>No se encontraron reporteros con ese término de búsqueda.</p>
        </div>
      )}
      
      {/* Modal para agregar/editar reportero */}
      <AddReporteroModal 
        show={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        reportero={selectedReportero}
        onSuccess={() => {
          loadReporteros();
          setShowAddModal(false);
        }}
      />
      
      {/* Modal de confirmación para eliminar reportero */}
      <ConfirmDeleteModal
        show={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setReporteroToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        nombreReportero={reporteroToDelete?.nombre || ''}
        isDeleting={isDeleting}
      />
    </div>
  )
}

export default ReporterosTab