// app/api/despachos/route.ts - Versión corregida y unificada
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { 
  formatDateForAPI, 
  parseDateLima, 
  getStartOfDayLima, 
  getEndOfDayLima 
} from '@/utils/dateUtils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fecha = searchParams.get('fecha');
    const reportero_id = searchParams.get('reportero_id');
    const ciudad_codigo = searchParams.get('ciudad_codigo');
    const desde = searchParams.get('desde');
    const hasta = searchParams.get('hasta');
    
    console.log('Recibiendo solicitud en /api/despachos con params:', { fecha, reportero_id, ciudad_codigo, desde, hasta });

    // Construir where de forma segura
    let where: any = {};
    
    // Agregar filtro por rango de fechas si existen
    if (desde && hasta) {
      try {
        // Usar parseDateLima para manejar correctamente las fechas
        const desdeDate = parseDateLima(desde);
        const hastaDate = parseDateLima(hasta);
        
        // Usar rangos de día completo para asegurar que capture todos los registros
        const startDate = getStartOfDayLima(desdeDate);
        const endDate = getEndOfDayLima(hastaDate);
        
        where.fecha_despacho = {
          gte: startDate,
          lte: endDate
        };
        
        console.log('Filtro por rango:', {
          desde: startDate.toISOString(),
          hasta: endDate.toISOString(),
          desdeLocal: startDate.toLocaleString('es-PE', { timeZone: 'America/Lima' }),
          hastaLocal: endDate.toLocaleString('es-PE', { timeZone: 'America/Lima' })
        });
      } catch (error) {
        console.error('Formato de fechas inválido:', { desde, hasta });
      }
    }
    // Agregar filtro por fecha específica si existe
    else if (fecha) {
      try {
        // Usar parseDateLima y rangos para manejar correctamente la fecha
        const fechaDate = parseDateLima(fecha);
        const startDate = getStartOfDayLima(fechaDate);
        const endDate = getEndOfDayLima(fechaDate);
        
        // Usar rango en lugar de comparación exacta para capturar todo el día
        where.fecha_despacho = {
          gte: startDate,
          lte: endDate
        };
        
        console.log('Filtro por fecha específica:', {
          fecha: fecha,
          inicio: startDate.toISOString(),
          fin: endDate.toISOString(),
          inicioLocal: startDate.toLocaleString('es-PE', { timeZone: 'America/Lima' }),
          finLocal: endDate.toLocaleString('es-PE', { timeZone: 'America/Lima' })
        });
      } catch (error) {
        console.error('Formato de fecha inválido:', fecha);
      }
    }
    
    // Agregar filtro por reportero_id si existe
    if (reportero_id && !isNaN(parseInt(reportero_id))) {
      where.reportero_id = parseInt(reportero_id);
    }
    
    // Agregar filtro por ciudad_codigo si existe
    if (ciudad_codigo) {
      try {
        const ciudad = await prisma.ciudades.findUnique({
          where: { codigo: ciudad_codigo }
        });
        
        if (ciudad) {
          where.reportero = {
            ciudad_id: ciudad.id
          };
        } else {
          console.log(`Ciudad con código ${ciudad_codigo} no encontrada`);
        }
      } catch (error) {
        console.error('Error al buscar ciudad:', error);
      }
    }
    
    console.log('Consulta de Prisma donde:', JSON.stringify(where, null, 2));
    
    // Buscar despachos con los filtros
    const despachos = await prisma.despachos.findMany({
      where,
      include: { 
        reportero: {
          include: { ciudad: true }
        }
      },
      orderBy: [
        { fecha_despacho: 'desc' },
        { hora_despacho: 'asc' }
      ]
    });
    
    console.log(`Encontrados ${despachos.length} despachos`);
    
    // Formatear las fechas para la respuesta
    const despachosFormateados = despachos.map(despacho => {
      // Generar fecha formateada
      const fechaStr = formatDateForAPI(despacho.fecha_despacho);
      
      return {
        ...despacho,
        fecha_despacho: despacho.fecha_despacho.toISOString(),
        fecha_display: fechaStr,
        fecha: fechaStr // Para compatibilidad con código existente
      };
    });
    
    return NextResponse.json(despachosFormateados);
  } catch (error) {
    console.error('Error en endpoint /api/despachos:', error);
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? { error: `Error en endpoint de despachos: ${error instanceof Error ? error.message : 'Error desconocido'}` }
      : { error: 'Error al obtener despachos' };
      
    return NextResponse.json(errorMessage, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log("Datos recibidos en POST despachos:", data);
    
    // Validaciones básicas
    if (!data.reportero_id || !data.numero_despacho) {
      return NextResponse.json(
        { error: 'reportero_id y numero_despacho son campos obligatorios' }, 
        { status: 400 }
      );
    }
    
    // Procesar la fecha correctamente
    let fecha_despacho;
    try {
      // Usar parseDateLima para manejar la zona horaria correctamente
      fecha_despacho = parseDateLima(data.fecha_despacho);
      
      console.log('Fecha procesada:', {
        original: data.fecha_despacho,
        procesada: fecha_despacho.toISOString(),
        local: fecha_despacho.toLocaleString('es-PE', { timeZone: 'America/Lima' })
      });
    } catch (error) {
      return NextResponse.json(
        { error: 'Formato de fecha inválido' }, 
        { status: 400 }
      );
    }
    
    // Verificar duplicados usando rangos
    const startOfDay = getStartOfDayLima(fecha_despacho);
    const endOfDay = getEndOfDayLima(fecha_despacho);
    
    const despachoExistente = await prisma.despachos.findFirst({
      where: {
        reportero_id: data.reportero_id,
        numero_despacho: data.numero_despacho,
        fecha_despacho: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });
    
    if (despachoExistente) {
      // Actualizar el despacho existente
      const despachoActualizado = await prisma.despachos.update({
        where: { id: despachoExistente.id },
        data: {
          titulo: data.titulo || despachoExistente.titulo,
          hora_despacho: data.hora_despacho || despachoExistente.hora_despacho,
          hora_en_vivo: data.hora_en_vivo || despachoExistente.hora_en_vivo,
          estado: data.estado || despachoExistente.estado
        },
        include: { 
          reportero: {
            include: { ciudad: true }
          }
        }
      });
      
      // Formatear la fecha para la respuesta
      const fechaStr = formatDateForAPI(despachoActualizado.fecha_despacho);
      
      return NextResponse.json({
        ...despachoActualizado,
        updated: true,
        fecha_despacho: despachoActualizado.fecha_despacho.toISOString(),
        fecha_display: fechaStr,
        fecha: fechaStr // Para compatibilidad
      });
    }
    
    // Si no existe, crear un nuevo despacho
    const despacho = await prisma.despachos.create({
      data: {
        reportero_id: data.reportero_id,
        numero_despacho: data.numero_despacho,
        titulo: data.titulo || '',
        hora_despacho: data.hora_despacho || '',
        hora_en_vivo: data.hora_en_vivo || '',
        fecha_despacho,
        estado: data.estado || 'programado'
      },
      include: { 
        reportero: {
          include: { ciudad: true }
        }
      }
    });
    
    // Formatear la fecha para la respuesta
    const fechaStr = formatDateForAPI(despacho.fecha_despacho);
    
    console.log('Despacho creado:', {
      id: despacho.id,
      fecha: despacho.fecha_despacho.toISOString(),
      fechaLocal: despacho.fecha_despacho.toLocaleString('es-PE', { timeZone: 'America/Lima' }),
      fechaStr
    });
    
    return NextResponse.json({
      ...despacho,
      fecha_despacho: despacho.fecha_despacho.toISOString(),
      fecha_display: fechaStr,
      fecha: fechaStr // Para compatibilidad
    });
  } catch (error) {
    console.error('Error al crear despacho:', error);
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? { error: `Error al crear despacho: ${error instanceof Error ? error.message : 'Error desconocido'}` }
      : { error: 'Error al crear despacho' };
      
    return NextResponse.json(errorMessage, { status: 500 });
  }
}