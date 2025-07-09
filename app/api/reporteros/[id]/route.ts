// app/api/reporteros/[id]/route.ts - Versión corregida
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { formatDateForAPI } from '@/utils/dateUtils';

// Obtener un reportero por ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const reportero = await prisma.reporteros.findUnique({
      where: { id },
      include: {
        ciudad: true,
        despachos: {
          orderBy: { fecha_despacho: 'desc' }
        }
      }
    });
    
    if (!reportero) {
      return NextResponse.json({ error: 'Reportero no encontrado' }, { status: 404 });
    }
    
    // Formatear las fechas de los despachos
    const reporteroFormateado = {
      ...reportero,
      despachos: reportero.despachos.map(despacho => {
        const fechaStr = formatDateForAPI(despacho.fecha_despacho);
        return {
          ...despacho,
          fecha_despacho: despacho.fecha_despacho.toISOString(),
          fecha_display: fechaStr,
          fecha: fechaStr // Para compatibilidad
        };
      })
    };
    
    return NextResponse.json(reporteroFormateado);
  } catch (error) {
    console.error('Error al obtener reportero:', error);
    return NextResponse.json({ error: 'Error al obtener reportero' }, { status: 500 });
  }
}

// Actualizar un reportero
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const data = await request.json();
    
    const reportero = await prisma.reporteros.update({
      where: { id },
      data: {
        nombre: data.nombre,
        estado: data.estado,
        ciudad: data.ciudad_id ? { connect: { id: data.ciudad_id } } : undefined
      },
      include: { ciudad: true }
    });
    
    return NextResponse.json(reportero);
  } catch (error) {
    console.error('Error al actualizar reportero:', error);
    return NextResponse.json({ error: 'Error al actualizar reportero' }, { status: 500 });
  }
}

// Eliminar un reportero
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    // Verificar si el reportero existe
    const reportero = await prisma.reporteros.findUnique({
      where: { id },
      include: {
        despachos: true
      }
    });
    
    if (!reportero) {
      return NextResponse.json({ error: 'Reportero no encontrado' }, { status: 404 });
    }
    
    // Usar una transacción para garantizar que todas las operaciones se completan o ninguna
    const result = await prisma.$transaction(async (tx) => {
      // Primero eliminar los despachos asociados
      if (reportero.despachos.length > 0) {
        await tx.despachos.deleteMany({
          where: { reportero_id: id }
        });
      }
      
      // Luego eliminar el reportero
      return await tx.reporteros.delete({
        where: { id }
      });
    });
    
    return NextResponse.json({ 
      success: true, 
      message: `Reportero ${reportero.nombre} eliminado correctamente`
    });
  } catch (error) {
    console.error('Error al eliminar reportero:', error);
    
    // Mensaje de error más detallado en desarrollo
    const errorDetail = process.env.NODE_ENV === 'development' 
      ? { detail: error instanceof Error ? error.message : 'Error desconocido' } 
      : {};
      
    return NextResponse.json({ 
      error: 'Error al eliminar reportero',
      ...errorDetail 
    }, { status: 500 });
  }
}