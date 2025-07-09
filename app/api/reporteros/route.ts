// app/api/reporteros/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { formatDateForAPI, getCurrentDateLima, getMonday } from '@/utils/dateUtils';

// Obtener todos los reporteros
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeUltimoDespacho = searchParams.get('includeUltimoDespacho') === 'true';
    
    // Si se solicita incluir el último despacho
    if (includeUltimoDespacho) {
      // Primero obtenemos los reporteros básicos
      const reporteros = await prisma.reporteros.findMany({
        include: { ciudad: true },
        orderBy: { nombre: 'asc' }
      });
      
      // Para cada reportero, obtenemos su último despacho
      const reporterosCompletos = await Promise.all(reporteros.map(async (reportero) => {
        try {
          // Consulta para encontrar el último despacho, ordenado por fecha y hora más reciente
          const ultimoDespacho = await prisma.despachos.findFirst({
            where: { 
              reportero_id: reportero.id 
            },
            orderBy: [
              { fecha_despacho: 'desc' },
              { hora_despacho: 'desc' }
            ],
            take: 1
          });
          
          // Consulta para contar despachos de la semana actual
          const hoy = getCurrentDateLima();
          const inicioSemana = getMonday(hoy);
          
          const despachosCount = await prisma.despachos.count({
            where: {
              reportero_id: reportero.id,
              fecha_despacho: {
                gte: inicioSemana,
                lte: hoy
              }
            }
          });
          
          // Formatear la fecha del último despacho
          let ultimoDespachoStr = 'Sin despachos';
          if (ultimoDespacho) {
            // Formatear la fecha como día/mes/año
            const fecha = new Date(ultimoDespacho.fecha_despacho);
            ultimoDespachoStr = `${fecha.getDate()}/${fecha.getMonth() + 1}/${fecha.getFullYear()}, ${ultimoDespacho.hora_despacho}`;
            
            // Log para depuración
            console.log(`Último despacho para ${reportero.nombre}: ${ultimoDespachoStr} (Fecha original: ${ultimoDespacho.fecha_despacho})`);
          }
          
          // Retornar el reportero con la información adicional
          return {
            ...reportero,
            despachos_count: despachosCount,
            ultimo_despacho: ultimoDespachoStr
          };
        } catch (error) {
          console.error(`Error al procesar despachos para reportero ${reportero.id}:`, error);
          return {
            ...reportero,
            despachos_count: 0,
            ultimo_despacho: 'Sin despachos'
          };
        }
      }));
      
      return NextResponse.json(reporterosCompletos);
    }
    
    // Si no se solicita incluir el último despacho, devolver reporteros básicos
    const reporteros = await prisma.reporteros.findMany({
      include: { ciudad: true },
      orderBy: { nombre: 'asc' }
    });
    
    return NextResponse.json(reporteros);
  } catch (error) {
    console.error('Error al obtener reporteros:', error);
    return NextResponse.json({ error: 'Error al obtener reporteros' }, { status: 500 });
  }
}

// Crear un nuevo reportero
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const reportero = await prisma.reporteros.create({
      data: {
        nombre: data.nombre,
        ciudad: { connect: { id: data.ciudad_id } },
        estado: data.estado || 'activo'
      },
      include: { ciudad: true }
    });
    
    return NextResponse.json(reportero);
  } catch (error) {
    console.error('Error al crear reportero:', error);
    return NextResponse.json({ error: 'Error al crear reportero' }, { status: 500 });
  }
}