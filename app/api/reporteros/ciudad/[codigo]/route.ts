// app/api/reporteros/ciudad/[codigo]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Obtener reporteros por código de ciudad
export async function GET(
  request: Request,
  { params }: { params: { codigo: string } }
) {
  try {
    const codigo = params.codigo;
    
    const ciudad = await prisma.ciudades.findUnique({
      where: { codigo }
    });
    
    if (!ciudad) {
      return NextResponse.json({ error: 'Ciudad no encontrada' }, { status: 404 });
    }
    
    const reporteros = await prisma.reporteros.findMany({
      where: { ciudad_id: ciudad.id },
      orderBy: { nombre: 'asc' }
    });
    
    return NextResponse.json(reporteros);
  } catch (error) {
    console.error('Error al obtener reporteros por ciudad:', error);
    return NextResponse.json({ error: 'Error al obtener reporteros por ciudad' }, { status: 500 });
  }
}