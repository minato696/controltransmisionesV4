// app/api/despachos/[id]/route.ts - Versión corregida y unificada
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { formatDateForAPI, parseDateLima } from '@/utils/dateUtils';

// Obtener un despacho por ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const despacho = await prisma.despachos.findUnique({
      where: { id },
      include: {
        reportero: {
          include: { ciudad: true }
        }
      }
    });
    
    if (!despacho) {
      return NextResponse.json({ error: 'Despacho no encontrado' }, { status: 404 });
    }
    
    // Formatear la fecha correctamente
    const fechaStr = formatDateForAPI(despacho.fecha_despacho);
    
    return NextResponse.json({
      ...despacho,
      fecha_despacho: despacho.fecha_despacho.toISOString(),
      fecha_display: fechaStr,
      fecha: fechaStr // Para compatibilidad
    });
  } catch (error) {
    console.error('Error al obtener despacho:', error);
    return NextResponse.json({ error: 'Error al obtener despacho' }, { status: 500 });
  }
}

// Actualizar un despacho
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const data = await request.json();
    
    // Verificar que el despacho existe
    const despachoExistente = await prisma.despachos.findUnique({
      where: { id }
    });
    
    if (!despachoExistente) {
      return NextResponse.json({ error: 'Despacho no encontrado' }, { status: 404 });
    }
    
    // Preparar los datos para actualización
    const updateData: any = {
      titulo: data.titulo !== undefined ? data.titulo : despachoExistente.titulo,
      hora_despacho: data.hora_despacho !== undefined ? data.hora_despacho : despachoExistente.hora_despacho,
      hora_en_vivo: data.hora_en_vivo !== undefined ? data.hora_en_vivo : despachoExistente.hora_en_vivo,
      estado: data.estado !== undefined ? data.estado : despachoExistente.estado
    };
    
    // Si se proporciona una nueva fecha, procesarla correctamente
    if (data.fecha_despacho) {
      updateData.fecha_despacho = parseDateLima(data.fecha_despacho);
      
      console.log('Actualizando fecha:', {
        original: data.fecha_despacho,
        procesada: updateData.fecha_despacho.toISOString(),
        local: updateData.fecha_despacho.toLocaleString('es-PE', { timeZone: 'America/Lima' })
      });
    }
    
    // Actualizar el despacho
    const despacho = await prisma.despachos.update({
      where: { id },
      data: updateData,
      include: {
        reportero: {
          include: { ciudad: true }
        }
      }
    });
    
    // Formatear la fecha correctamente en la respuesta
    const fechaStr = formatDateForAPI(despacho.fecha_despacho);
    
    return NextResponse.json({
      ...despacho,
      fecha_despacho: despacho.fecha_despacho.toISOString(),
      fecha_display: fechaStr,
      fecha: fechaStr // Para compatibilidad
    });
  } catch (error) {
    console.error('Error al actualizar despacho:', error);
    return NextResponse.json({ error: 'Error al actualizar despacho' }, { status: 500 });
  }
}

// Eliminar un despacho
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    await prisma.despachos.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar despacho:', error);
    return NextResponse.json({ error: 'Error al eliminar despacho' }, { status: 500 });
  }
}