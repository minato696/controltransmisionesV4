// app/api/ciudades/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeReporteros = searchParams.get('include') === 'reporteros';
    
    const ciudades = await prisma.ciudades.findMany({
      orderBy: { nombre: 'asc' },
      include: {
        reporteros: includeReporteros,
        _count: {
          select: { reporteros: true }
        }
      }
    });
    
    return NextResponse.json(ciudades);
  } catch (error) {
    console.error('Error al obtener ciudades:', error);
    return NextResponse.json({ error: 'Error al obtener ciudades' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validar datos mínimos requeridos
    if (!data.codigo || !data.nombre) {
      return NextResponse.json(
        { error: 'El código y nombre de la ciudad son obligatorios' },
        { status: 400 }
      );
    }
    
    // Verificar si la ciudad ya existe
    const existingCiudad = await prisma.ciudades.findUnique({
      where: { codigo: data.codigo }
    });
    
    if (existingCiudad) {
      return NextResponse.json(
        { error: `La ciudad con código ${data.codigo} ya existe` },
        { status: 400 }
      );
    }
    
    const ciudad = await prisma.ciudades.create({
      data: {
        codigo: data.codigo,
        nombre: data.nombre,
        activo: data.activo ?? true
      }
    });
    
    return NextResponse.json(ciudad);
  } catch (error) {
    console.error('Error al crear ciudad:', error);
    return NextResponse.json({ error: 'Error al crear ciudad' }, { status: 500 });
  }
}