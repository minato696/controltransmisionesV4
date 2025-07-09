// app/api/ciudades/[id]/route.ts (actualizado con tipos)
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Obtener una ciudad por ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const ciudad = await prisma.ciudades.findUnique({
      where: { id },
      include: {
        reporteros: true,
        _count: {
          select: { reporteros: true }
        }
      }
    });
    
    if (!ciudad) {
      return NextResponse.json({ error: 'Ciudad no encontrada' }, { status: 404 });
    }
    
    return NextResponse.json(ciudad);
  } catch (error) {
    console.error('Error al obtener ciudad:', error);
    return NextResponse.json({ error: 'Error al obtener ciudad' }, { status: 500 });
  }
}

// Actualizar una ciudad
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const data = await request.json();
    
    const ciudad = await prisma.ciudades.update({
      where: { id },
      data: {
        codigo: data.codigo,
        nombre: data.nombre,
        activo: data.activo
      }
    });
    
    return NextResponse.json(ciudad);
  } catch (error) {
    console.error('Error al actualizar ciudad:', error);
    return NextResponse.json({ error: 'Error al actualizar ciudad' }, { status: 500 });
  }
}

// Eliminar una ciudad
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    // Verificar si la ciudad existe
    const ciudad = await prisma.ciudades.findUnique({
      where: { id },
      include: {
        reporteros: {
          include: {
            despachos: true
          }
        }
      }
    });
    
    if (!ciudad) {
      return NextResponse.json({ error: 'Ciudad no encontrada' }, { status: 404 });
    }
    
    // Verificar si la ciudad tiene reporteros
    if (ciudad.reporteros.length > 0) {
      // Contar total de despachos asociados
      const totalDespachos = ciudad.reporteros.reduce((total: number, reportero: any) => {
        return total + reportero.despachos.length;
      }, 0);
      
      return NextResponse.json({ 
        error: 'No se puede eliminar la ciudad porque tiene reporteros asociados',
        detail: `La ciudad ${ciudad.nombre} tiene ${ciudad.reporteros.length} reporteros y ${totalDespachos} despachos asociados. Debe eliminar primero todos los reporteros.`
      }, { status: 400 });
    }
    
    // Si no tiene reporteros, proceder a eliminar
    await prisma.ciudades.delete({
      where: { id }
    });
    
    return NextResponse.json({ 
      success: true,
      message: `Ciudad ${ciudad.nombre} eliminada correctamente`
    });
  } catch (error) {
    console.error('Error al eliminar ciudad:', error);
    
    // Mensaje de error más detallado en desarrollo
    const errorDetail = process.env.NODE_ENV === 'development' 
      ? { detail: error instanceof Error ? error.message : 'Error desconocido' } 
      : {};
      
    return NextResponse.json({ 
      error: 'Error al eliminar ciudad',
      ...errorDetail 
    }, { status: 500 });
  }
}