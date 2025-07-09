// components/AppContext.tsx - Mejora para filtrado por fechas exactas
"use client"

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { formatDateForAPI, getCurrentDateLima } from '@/utils/dateUtils'

// Definir tipos para reporteros y despachos
export interface Reportero {
  id: number
  nombre: string
  ciudad_id?: number
  ciudad?: {
    id: number
    codigo: string
    nombre: string
  }
}

export interface Despacho {
  id?: number
  reportero_id: number
  reportero_nombre?: string
  reportero?: Reportero
  numero_despacho: number
  titulo: string
  hora_despacho: string
  hora_en_vivo: string
  fecha_despacho: string
  fecha: string // Para compatibilidad con el código existente
  ciudad?: string
  estado?: string
}

interface ReporterosMap {
  [ciudad: string]: Reportero[]
}

interface AppContextType {
  currentDate: Date
  setCurrentDate: (date: Date) => void
  selectedCity: string
  setSelectedCity: (city: string) => void
  reporteros: ReporterosMap
  setReporteros: (reporteros: ReporterosMap) => void
  despachos: Despacho[]
  setDespachos: (despachos: Despacho[]) => void
  activeTab: string
  setActiveTab: (tab: string) => void
  notification: {
    show: boolean
    type: string
    title: string
    message: string
  }
  setNotification: (notification: {
    show: boolean
    type: string
    title: string
    message: string
  }) => void
  addReportero: (nombre: string, ciudad: string) => void
  saveDespachos: (nuevosDespachos: Despacho[]) => void
  loading: boolean
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  // Usar getCurrentDateLima() en lugar de new Date()
  const [currentDate, setCurrentDate] = useState<Date>(getCurrentDateLima())
  const [selectedCity, setSelectedCity] = useState<string>('arequipa')
  const [reporteros, setReporteros] = useState<ReporterosMap>({})
  const [despachos, setDespachos] = useState<Despacho[]>([])
  const [activeTab, setActiveTab] = useState<string>('registro')
  const [loading, setLoading] = useState<boolean>(true)
  const [notification, setNotification] = useState({
    show: false,
    type: 'success',
    title: '',
    message: ''
  })

  // Cargar reporteros al inicio
  useEffect(() => {
    const fetchReporteros = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/reporteros')
        const data = await response.json()

        // Transformar la estructura para que coincida con la estructura actual
        const reporterosMap: ReporterosMap = {}
        
        data.forEach((reportero: any) => {
          const ciudadCodigo = reportero.ciudad.codigo
          
          if (!reporterosMap[ciudadCodigo]) {
            reporterosMap[ciudadCodigo] = []
          }
          
          reporterosMap[ciudadCodigo].push({
            id: reportero.id,
            nombre: reportero.nombre,
            ciudad_id: reportero.ciudad.id
          })
        })
        
        setReporteros(reporterosMap)
      } catch (error) {
        console.error('Error al cargar reporteros:', error)
        setNotification({
          show: true,
          type: 'error',
          title: 'Error',
          message: 'No se pudieron cargar los reporteros'
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchReporteros()
  }, [])

  // Cargar despachos cuando cambia la fecha o ciudad
  useEffect(() => {
    const fetchDespachos = async () => {
      if (!selectedCity) return;
      
      setLoading(true);
      try {
        // Formatear la fecha para la API
        const fechaFormateada = formatDateForAPI(currentDate);
        console.log(`Solicitando despachos para fecha=${fechaFormateada}, ciudad=${selectedCity}`);
        
        // CAMBIO IMPORTANTE: Usar 'fecha' en lugar de 'desde'/'hasta' para obtener solo esta fecha exacta
        const response = await fetch(`/api/despachos?fecha=${fechaFormateada}&ciudad_codigo=${selectedCity}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Error ${response.status}: ${errorText}`);
          throw new Error(`Error ${response.status}: ${errorText}`);
        }
        
        // Solo parsear como JSON si hay contenido
        const text = await response.text();
        if (!text) {
          console.log('Respuesta vacía del servidor');
          setDespachos([]);
          return;
        }
        
        const data = JSON.parse(text);
        console.log(`Recibidos ${data.length} despachos para fecha ${fechaFormateada}`);
        
        // Formatear los despachos, asegurando que todos tengan la misma fecha que la actual
        const formattedDespachos = data.map((despacho: any) => ({
          id: despacho.id,
          reportero_id: despacho.reportero_id,
          reportero_nombre: despacho.reportero?.nombre || '',
          numero_despacho: despacho.numero_despacho,
          titulo: despacho.titulo || '',
          hora_despacho: despacho.hora_despacho || '',
          hora_en_vivo: despacho.hora_en_vivo || '',
          fecha_despacho: despacho.fecha_despacho,
          fecha: despacho.fecha_display || fechaFormateada,
          ciudad: despacho.reportero?.ciudad?.codigo || '',
          estado: despacho.estado || 'programado'
        }));
        
        // Verificar si los despachos corresponden exactamente a la fecha seleccionada
        const despachosActuales = formattedDespachos.filter((d: Despacho) => {
          const fechaDespacho = new Date(d.fecha_despacho).toISOString().split('T')[0];
          const fechaActual = currentDate.toISOString().split('T')[0];
          return fechaDespacho === fechaActual;
        });
        
        console.log(`Filtrados ${despachosActuales.length} despachos que coinciden exactamente con la fecha ${fechaFormateada}`);
        
        setDespachos(despachosActuales);
      } catch (error) {
        console.error('Error al cargar despachos:', error);
        setNotification({
          show: true,
          type: 'error',
          title: 'Error',
          message: 'No se pudieron cargar los despachos. Intente nuevamente.'
        });
        // En caso de error, dejamos la lista vacía
        setDespachos([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDespachos();
  }, [currentDate, selectedCity]);

  // Función para agregar un nuevo reportero
  const addReportero = async (nombre: string, ciudad: string) => {
    setLoading(true);
    try {
      // Obtener el ID de la ciudad
      const ciudadResponse = await fetch(`/api/ciudades`);
      const ciudades = await ciudadResponse.json();
      const ciudadSeleccionada = ciudades.find((c: any) => c.codigo === ciudad);
      
      if (!ciudadSeleccionada) {
        throw new Error('Ciudad no encontrada');
      }
      
      // Crear el reportero
      const response = await fetch('/api/reporteros', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nombre,
          ciudad_id: ciudadSeleccionada.id,
          estado: 'activo'
        })
      });
      
      const nuevoReportero = await response.json();
      
      // Actualizar el estado local
      setReporteros(prev => {
        const newReporteros = {...prev};
        
        if (!newReporteros[ciudad]) {
          newReporteros[ciudad] = [];
        }
        
        newReporteros[ciudad].push({
          id: nuevoReportero.id,
          nombre: nuevoReportero.nombre,
          ciudad_id: nuevoReportero.ciudad.id
        });
        
        return newReporteros;
      });
      
      // Mostrar notificación
      setNotification({
        show: true,
        type: 'success',
        title: '¡Reportero agregado!',
        message: `${nombre} ha sido agregado a ${ciudad}.`
      });
      
      // Si la ciudad seleccionada es la misma a la que se agrega el reportero,
      // seguimos en la misma pestaña
      if (ciudad === selectedCity) {
        setActiveTab('registro');
      }
    } catch (error) {
      console.error('Error al agregar reportero:', error);
      setNotification({
        show: true,
        type: 'error',
        title: 'Error',
        message: 'No se pudo agregar el reportero'
      });
    } finally {
      setLoading(false);
    }
  };

  // Función saveDespachos mejorada para asegurar que los despachos sean para la fecha actual
  const saveDespachos = async (nuevosDespachos: Despacho[]) => {
    setLoading(true);
    try {
      // Obtener la fecha actual en formato YYYY-MM-DD
      const fechaFormateada = formatDateForAPI(currentDate);
      
      console.log(`Guardando ${nuevosDespachos.length} despachos para la fecha ${fechaFormateada}`);
      
      // Asegurar que todos los despachos tengan la fecha actual
      const despachosActualizados = nuevosDespachos.map(despacho => ({
        ...despacho,
        fecha: fechaFormateada,
        fecha_despacho: fechaFormateada
      }));
      
      // Primero, obtener todos los despachos existentes para esta fecha y ciudad
      const despachosExistentesResponse = await fetch(`/api/despachos?fecha=${fechaFormateada}&ciudad_codigo=${selectedCity}`);
      const despachosExistentes = await despachosExistentesResponse.json();
      
      // Crear un mapa de despachos existentes para búsqueda rápida
      // La clave es una combinación de reportero_id y numero_despacho
      const mapaDespachos: { [key: string]: any } = {};
      despachosExistentes.forEach((despacho: any) => {
        const clave = `${despacho.reportero_id}-${despacho.numero_despacho}`;
        mapaDespachos[clave] = despacho;
      });
      
      // Procesar cada despacho para actualizar o crear según corresponda
      for (const despacho of despachosActualizados) {
        const clave = `${despacho.reportero_id}-${despacho.numero_despacho}`;
        const despachoExistente = mapaDespachos[clave];
        
        // Solo crear/actualizar si hay datos válidos (título, hora o en vivo)
        if (despacho.titulo || despacho.hora_despacho || despacho.hora_en_vivo) {
          if (despachoExistente) {
            // Actualizar el despacho existente
            console.log(`Actualizando despacho existente ID ${despachoExistente.id} para fecha ${fechaFormateada}`);
            
            await fetch(`/api/despachos/${despachoExistente.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                titulo: despacho.titulo,
                hora_despacho: despacho.hora_despacho,
                hora_en_vivo: despacho.hora_en_vivo,
                fecha_despacho: fechaFormateada,
                estado: despachoExistente.estado || 'programado'
              })
            });
          } else {
            // Crear un nuevo despacho
            console.log(`Creando nuevo despacho para reportero ${despacho.reportero_id}, fecha ${fechaFormateada}`);
            
            await fetch('/api/despachos', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                reportero_id: despacho.reportero_id,
                numero_despacho: despacho.numero_despacho,
                titulo: despacho.titulo,
                hora_despacho: despacho.hora_despacho,
                hora_en_vivo: despacho.hora_en_vivo,
                fecha_despacho: fechaFormateada,
                estado: 'programado'
              })
            });
          }
        }
      }
      
      // Actualizar la lista de despachos - recargarlos con la fecha exacta
      const response = await fetch(`/api/despachos?fecha=${fechaFormateada}&ciudad_codigo=${selectedCity}`);
      const data = await response.json();
      
      // Procesar los despachos actualizados para la fecha actual
      const formattedDespachos = data.map((despacho: any) => ({
        id: despacho.id,
        reportero_id: despacho.reportero_id,
        reportero_nombre: despacho.reportero.nombre,
        numero_despacho: despacho.numero_despacho,
        titulo: despacho.titulo,
        hora_despacho: despacho.hora_despacho,
        hora_en_vivo: despacho.hora_en_vivo,
        fecha_despacho: despacho.fecha_despacho,
        fecha: despacho.fecha_display || fechaFormateada,
        ciudad: despacho.reportero.ciudad.codigo,
        estado: despacho.estado
      }));
      
      // Verificar fecha exacta antes de actualizar estado
      const despachosActuales = formattedDespachos.filter((d: Despacho) => {
        const fechaDespacho = new Date(d.fecha_despacho).toISOString().split('T')[0];
        const fechaActual = currentDate.toISOString().split('T')[0];
        return fechaDespacho === fechaActual;
      });
      
      setDespachos(despachosActuales);
      
      // Mostrar notificación
      setNotification({
        show: true,
        type: 'success',
        title: '¡Operación exitosa!',
        message: 'Los despachos han sido guardados correctamente.'
      });
    } catch (error) {
      console.error('Error al guardar despachos:', error);
      setNotification({
        show: true,
        type: 'error',
        title: 'Error',
        message: 'No se pudieron guardar los despachos'
      });
    } finally {
      setLoading(false);
    }
  };

  // Valores que expondremos en el contexto
  const contextValue: AppContextType = {
    currentDate,
    setCurrentDate,
    selectedCity,
    setSelectedCity,
    reporteros,
    setReporteros,
    despachos,
    setDespachos,
    activeTab,
    setActiveTab,
    notification,
    setNotification,
    addReportero,
    saveDespachos,
    loading
  }

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  )
}

// Hook personalizado para usar el contexto
export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useAppContext debe ser usado dentro de un AppProvider')
  }
  return context
}