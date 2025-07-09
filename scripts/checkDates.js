// scripts/checkDates.js - Script para diagnosticar problemas de fechas
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDates() {
  console.log('\n🔍 DIAGNÓSTICO DE FECHAS EN EL SISTEMA\n');
  
  // 1. Verificar la fecha/hora actual del servidor
  const now = new Date();
  console.log('📅 Fecha/Hora actual del servidor:');
  console.log('   UTC:', now.toISOString());
  console.log('   Local:', now.toString());
  console.log('   Lima:', now.toLocaleString('es-PE', { timeZone: 'America/Lima' }));
  
  // 2. Obtener los últimos 10 despachos
  console.log('\n📋 Últimos 10 despachos en la base de datos:');
  const despachos = await prisma.despachos.findMany({
    take: 10,
    orderBy: { fecha_creacion: 'desc' },
    include: {
      reportero: {
        include: { ciudad: true }
      }
    }
  });
  
  despachos.forEach((despacho, index) => {
    console.log(`\n${index + 1}. Despacho ID: ${despacho.id}`);
    console.log(`   Reportero: ${despacho.reportero.nombre} (${despacho.reportero.ciudad.nombre})`);
    console.log(`   Fecha despacho (DB): ${despacho.fecha_despacho}`);
    console.log(`   Fecha despacho (ISO): ${despacho.fecha_despacho.toISOString()}`);
    console.log(`   Fecha despacho (Lima): ${despacho.fecha_despacho.toLocaleString('es-PE', { timeZone: 'America/Lima' })}`);
    console.log(`   Creado: ${despacho.fecha_creacion.toLocaleString('es-PE', { timeZone: 'America/Lima' })}`);
  });
  
  // 3. Verificar despachos de hoy
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const mañana = new Date(hoy);
  mañana.setDate(mañana.getDate() + 1);
  
  console.log('\n📊 Despachos de hoy:');
  console.log(`   Buscando entre: ${hoy.toISOString()} y ${mañana.toISOString()}`);
  
  const despachosHoy = await prisma.despachos.count({
    where: {
      fecha_despacho: {
        gte: hoy,
        lt: mañana
      }
    }
  });
  
  console.log(`   Total encontrados: ${despachosHoy}`);
  
  // 4. Verificar la configuración de timezone en PostgreSQL
  console.log('\n🔧 Configuración de PostgreSQL:');
  try {
    const result = await prisma.$queryRaw`SHOW timezone`;
    console.log('   Timezone:', result[0].TimeZone);
    
    const currentTime = await prisma.$queryRaw`SELECT NOW() as now, CURRENT_TIMESTAMP as current`;
    console.log('   NOW():', currentTime[0].now);
    console.log('   CURRENT_TIMESTAMP:', currentTime[0].current);
  } catch (error) {
    console.log('   Error al obtener configuración:', error.message);
  }
  
  await prisma.$disconnect();
}

checkDates().catch(console.error);

// 4. Actualizar app/api/despachos/[id]/route.ts para manejar fechas correctamente
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { parseDateLima } from '@/utils/dateUtils';

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
    
    return NextResponse.json({
      ...despacho,
      fecha_display: formatDateForAPI(despacho.fecha_despacho)
    });
  } catch (error) {
    console.error('Error al actualizar despacho:', error);
    return NextResponse.json({ error: 'Error al actualizar despacho' }, { status: 500 });
  }
}