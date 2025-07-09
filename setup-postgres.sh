#!/bin/bash
# Script para configurar PostgreSQL con Prisma en tu aplicación de Control de Despachos

echo "🔧 Iniciando configuración de PostgreSQL con Prisma..."

# Instalando dependencias
echo "📦 Instalando Prisma y sus dependencias..."
npm install prisma @prisma/client

# Inicializando Prisma
echo "🚀 Inicializando Prisma..."
npx prisma init

# Crear el directorio lib si no existe
mkdir -p lib

# Creando archivo prisma.ts
echo "📝 Creando archivo lib/prisma.ts..."
cat > lib/prisma.ts << 'EOL'
import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
} else {
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient()
  }
  prisma = (global as any).prisma
}

export default prisma
EOL

# Creando schema.prisma
echo "📝 Creando schema.prisma..."
cat > prisma/schema.prisma << 'EOL'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Ciudades {
  id                  Int         @id @default(autoincrement())
  codigo              String      @unique
  nombre              String
  activo              Boolean     @default(true)
  fecha_creacion      DateTime    @default(now())
  fecha_actualizacion DateTime    @default(now()) @updatedAt
  reporteros          Reporteros[]
}

model Reporteros {
  id                  Int         @id @default(autoincrement())
  nombre              String
  ciudad              Ciudades    @relation(fields: [ciudad_id], references: [id])
  ciudad_id           Int
  estado              String      @default("activo")
  fecha_creacion      DateTime    @default(now())
  fecha_actualizacion DateTime    @default(now()) @updatedAt
  despachos           Despachos[]
}

model Despachos {
  id                  Int         @id @default(autoincrement())
  reportero           Reporteros  @relation(fields: [reportero_id], references: [id])
  reportero_id        Int
  numero_despacho     Int
  titulo              String
  hora_despacho       String
  hora_en_vivo        String?
  fecha_despacho      DateTime    @db.Date
  estado              String      @default("programado")
  fecha_creacion      DateTime    @default(now())
  fecha_actualizacion DateTime    @default(now()) @updatedAt
}
EOL

# Configurar .env con la DATABASE_URL
echo "🔑 Configurando variables de entorno..."
cat > .env << 'EOL'
DATABASE_URL="postgresql://despachos:147ABC55@localhost:5432/control_despachos"
EOL

# Crear directorio para API routes
mkdir -p app/api/ciudades
mkdir -p app/api/reporteros
mkdir -p app/api/despachos

# Crear API endpoints
echo "🌐 Creando endpoints API..."

# API para ciudades
cat > app/api/ciudades/route.ts << 'EOL'
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const ciudades = await prisma.ciudades.findMany({
      orderBy: { nombre: 'asc' }
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
    const ciudad = await prisma.ciudades.create({
      data: {
        codigo: data.codigo,
        nombre: data.nombre
      }
    });
    return NextResponse.json(ciudad);
  } catch (error) {
    console.error('Error al crear ciudad:', error);
    return NextResponse.json({ error: 'Error al crear ciudad' }, { status: 500 });
  }
}
EOL

# API para reporteros
cat > app/api/reporteros/route.ts << 'EOL'
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
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
EOL

# API para despachos
cat > app/api/despachos/route.ts << 'EOL'
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const despachos = await prisma.despachos.findMany({
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
    return NextResponse.json(despachos);
  } catch (error) {
    console.error('Error al obtener despachos:', error);
    return NextResponse.json({ error: 'Error al obtener despachos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const despacho = await prisma.despachos.create({
      data: {
        reportero: { connect: { id: data.reportero_id } },
        numero_despacho: data.numero_despacho,
        titulo: data.titulo,
        hora_despacho: data.hora_despacho,
        hora_en_vivo: data.hora_en_vivo,
        fecha_despacho: new Date(data.fecha_despacho),
        estado: data.estado || 'programado'
      },
      include: { 
        reportero: {
          include: { ciudad: true }
        }
      }
    });
    return NextResponse.json(despacho);
  } catch (error) {
    console.error('Error al crear despacho:', error);
    return NextResponse.json({ error: 'Error al crear despacho' }, { status: 500 });
  }
}
EOL

# Crear script de seed (inicialización de datos)
mkdir -p scripts

cat > scripts/seed.ts << 'EOL'
import prisma from '../lib/prisma';

async function main() {
  try {
    console.log('🧹 Limpiando tablas existentes...');
    await prisma.despachos.deleteMany({});
    await prisma.reporteros.deleteMany({});
    await prisma.ciudades.deleteMany({});
    
    console.log('🌆 Insertando ciudades...');
    const ciudades = [
      { codigo: 'abancay', nombre: 'Abancay' },
      { codigo: 'arequipa', nombre: 'Arequipa' },
      { codigo: 'ayacucho', nombre: 'Ayacucho' },
      { codigo: 'barranca', nombre: 'Barranca' },
      { codigo: 'cajamarca', nombre: 'Cajamarca' },
      { codigo: 'chiclayo', nombre: 'Chiclayo' },
      { codigo: 'chincha', nombre: 'Chincha' },
      { codigo: 'cusco', nombre: 'Cusco' },
      { codigo: 'huancayo', nombre: 'Huancayo' },
      { codigo: 'huaral', nombre: 'Huaral' },
      { codigo: 'huaraz', nombre: 'Huaraz' },
      { codigo: 'huacho', nombre: 'Huacho' },
      { codigo: 'ica', nombre: 'Ica' },
      { codigo: 'iquitos', nombre: 'Iquitos' },
      { codigo: 'juliaca', nombre: 'Juliaca' },
      { codigo: 'mollendo', nombre: 'Mollendo' },
      { codigo: 'piura', nombre: 'Piura' },
      { codigo: 'pisco', nombre: 'Pisco' },
      { codigo: 'puerto_maldonado', nombre: 'Puerto Maldonado' },
      { codigo: 'tacna', nombre: 'Tacna' },
      { codigo: 'tarapoto', nombre: 'Tarapoto' },
      { codigo: 'trujillo', nombre: 'Trujillo' },
      { codigo: 'tumbes', nombre: 'Tumbes' },
      { codigo: 'yurimaguas', nombre: 'Yurimaguas' }
    ];
    
    for (const ciudad of ciudades) {
      await prisma.ciudades.create({ data: ciudad });
    }
    
    console.log('👥 Insertando reporteros...');
    const reporterosData = [
      { nombre: 'Genaro Nuñez', ciudad_codigo: 'abancay' },
      { nombre: 'Richard Calcina', ciudad_codigo: 'arequipa' },
      { nombre: 'Carlos Nina', ciudad_codigo: 'arequipa' },
      { nombre: 'Diego Condori', ciudad_codigo: 'arequipa' },
      { nombre: 'Leonardo Ripas', ciudad_codigo: 'ayacucho' },
      { nombre: 'Sally Chaquilano', ciudad_codigo: 'barranca' },
      { nombre: 'Alvaro Franco', ciudad_codigo: 'cajamarca' },
      { nombre: 'Noeli Bracamonte', ciudad_codigo: 'chiclayo' },
      { nombre: 'Christian Auris', ciudad_codigo: 'chincha' },
      { nombre: 'Percy Pillca', ciudad_codigo: 'cusco' },
      { nombre: 'Christian Canchapoma', ciudad_codigo: 'huancayo' },
      { nombre: 'Carlos Mesias', ciudad_codigo: 'huaral' },
      { nombre: 'Milagros Herrera', ciudad_codigo: 'huaraz' },
      { nombre: 'Erick Aldabe', ciudad_codigo: 'huacho' },
      { nombre: 'Rogger Espino', ciudad_codigo: 'ica' },
      { nombre: 'Omar Rios', ciudad_codigo: 'iquitos' },
      { nombre: 'Jose Luis Yupanqui', ciudad_codigo: 'juliaca' },
      { nombre: 'Gabriel Castro', ciudad_codigo: 'mollendo' },
      { nombre: 'Percy Bereche', ciudad_codigo: 'piura' },
      { nombre: 'Giusepi Mozo', ciudad_codigo: 'pisco' },
      { nombre: 'Gilbert Galindo', ciudad_codigo: 'puerto_maldonado' },
      { nombre: 'Elizabeth Ticona', ciudad_codigo: 'tacna' },
      { nombre: 'Armando Murriera', ciudad_codigo: 'tarapoto' },
      { nombre: 'Roxana Gamboa', ciudad_codigo: 'trujillo' },
      { nombre: 'Anabel Santos', ciudad_codigo: 'trujillo' },
      { nombre: 'Pedro Concepción', ciudad_codigo: 'trujillo' },
      { nombre: 'Carlos Esteves', ciudad_codigo: 'tumbes' },
      { nombre: 'Luis Canevaro', ciudad_codigo: 'yurimaguas' }
    ];
    
    for (const reportero of reporterosData) {
      const ciudad = await prisma.ciudades.findUnique({
        where: { codigo: reportero.ciudad_codigo }
      });
      
      if (ciudad) {
        await prisma.reporteros.create({
          data: {
            nombre: reportero.nombre,
            ciudad: { connect: { id: ciudad.id } }
          }
        });
      }
    }
    
    console.log('✅ Base de datos inicializada correctamente');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
EOL

# Crear componente BaseDatosTab
mkdir -p components/tabs

cat > components/tabs/BaseDatosTab.tsx << 'EOL'
"use client"

import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDatabase, faSync, faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons'

const BaseDatosTab = () => {
  const [activeTable, setActiveTable] = useState('ciudades')
  const [tableData, setTableData] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchTableData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/${activeTable}`)
      const data = await response.json()
      setTableData(data)
    } catch (error) {
      console.error(`Error al obtener datos de ${activeTable}:`, error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTableData()
  }, [activeTable])

  // Renderizar tabla según el tipo seleccionado
  const renderTable = () => {
    if (loading) {
      return <div className="p-10 text-center">Cargando datos...</div>
    }

    if (tableData.length === 0) {
      return <div className="p-10 text-center">No hay datos disponibles</div>
    }

    if (activeTable === 'ciudades') {
      return (
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left py-3 px-4 bg-[#f1f5f9] font-semibold text-[#475569] border-b border-[#e2e8f0]">ID</th>
              <th className="text-left py-3 px-4 bg-[#f1f5f9] font-semibold text-[#475569] border-b border-[#e2e8f0]">Código</th>
              <th className="text-left py-3 px-4 bg-[#f1f5f9] font-semibold text-[#475569] border-b border-[#e2e8f0]">Nombre</th>
              <th className="text-left py-3 px-4 bg-[#f1f5f9] font-semibold text-[#475569] border-b border-[#e2e8f0]">Estado</th>
              <th className="text-left py-3 px-4 bg-[#f1f5f9] font-semibold text-[#475569] border-b border-[#e2e8f0]">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((ciudad: any) => (
              <tr key={ciudad.id} className="hover:bg-[#f1f5f9]">
                <td className="py-3 px-4 border-b border-[#e2e8f0]">{ciudad.id}</td>
                <td className="py-3 px-4 border-b border-[#e2e8f0]">{ciudad.codigo}</td>
                <td className="py-3 px-4 border-b border-[#e2e8f0]">{ciudad.nombre}</td>
                <td className="py-3 px-4 border-b border-[#e2e8f0]">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                    ciudad.activo ? 'bg-[#ecfdf5] text-[#10b981]' : 'bg-[#fee2e2] text-[#ef4444]'
                  }`}>
                    {ciudad.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="py-3 px-4 border-b border-[#e2e8f0]">
                  <div className="flex gap-2">
                    <button className="w-8 h-8 flex items-center justify-center rounded-full text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#1a56db]">
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-full text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#ef4444]">
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )
    }

    if (activeTable === 'reporteros') {
      return (
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left py-3 px-4 bg-[#f1f5f9] font-semibold text-[#475569] border-b border-[#e2e8f0]">ID</th>
              <th className="text-left py-3 px-4 bg-[#f1f5f9] font-semibold text-[#475569] border-b border-[#e2e8f0]">Nombre</th>
              <th className="text-left py-3 px-4 bg-[#f1f5f9] font-semibold text-[#475569] border-b border-[#e2e8f0]">Ciudad</th>
              <th className="text-left py-3 px-4 bg-[#f1f5f9] font-semibold text-[#475569] border-b border-[#e2e8f0]">Estado</th>
              <th className="text-left py-3 px-4 bg-[#f1f5f9] font-semibold text-[#475569] border-b border-[#e2e8f0]">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((reportero: any) => (
              <tr key={reportero.id} className="hover:bg-[#f1f5f9]">
                <td className="py-3 px-4 border-b border-[#e2e8f0]">{reportero.id}</td>
                <td className="py-3 px-4 border-b border-[#e2e8f0]">{reportero.nombre}</td>
                <td className="py-3 px-4 border-b border-[#e2e8f0]">{reportero.ciudad?.nombre || '-'}</td>
                <td className="py-3 px-4 border-b border-[#e2e8f0]">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                    reportero.estado === 'activo' ? 'bg-[#ecfdf5] text-[#10b981]' : 
                    reportero.estado === 'ausente' ? 'bg-[#fffbeb] text-[#f59e0b]' : 
                    'bg-[#fee2e2] text-[#ef4444]'
                  }`}>
                    {reportero.estado === 'activo' ? 'Activo' : 
                     reportero.estado === 'ausente' ? 'Ausente' : 'Inactivo'}
                  </span>
                </td>
                <td className="py-3 px-4 border-b border-[#e2e8f0]">
                  <div className="flex gap-2">
                    <button className="w-8 h-8 flex items-center justify-center rounded-full text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#1a56db]">
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-full text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#ef4444]">
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )
    }

    if (activeTable === 'despachos') {
      return (
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left py-3 px-4 bg-[#f1f5f9] font-semibold text-[#475569] border-b border-[#e2e8f0]">ID</th>
              <th className="text-left py-3 px-4 bg-[#f1f5f9] font-semibold text-[#475569] border-b border-[#e2e8f0]">Reportero</th>
              <th className="text-left py-3 px-4 bg-[#f1f5f9] font-semibold text-[#475569] border-b border-[#e2e8f0]">Título</th>
              <th className="text-left py-3 px-4 bg-[#f1f5f9] font-semibold text-[#475569] border-b border-[#e2e8f0]">Fecha</th>
              <th className="text-left py-3 px-4 bg-[#f1f5f9] font-semibold text-[#475569] border-b border-[#e2e8f0]">Hora</th>
              <th className="text-left py-3 px-4 bg-[#f1f5f9] font-semibold text-[#475569] border-b border-[#e2e8f0]">Estado</th>
              <th className="text-left py-3 px-4 bg-[#f1f5f9] font-semibold text-[#475569] border-b border-[#e2e8f0]">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((despacho: any) => (
              <tr key={despacho.id} className="hover:bg-[#f1f5f9]">
                <td className="py-3 px-4 border-b border-[#e2e8f0]">{despacho.id}</td>
                <td className="py-3 px-4 border-b border-[#e2e8f0]">{despacho.reportero?.nombre || '-'}</td>
                <td className="py-3 px-4 border-b border-[#e2e8f0]">{despacho.titulo}</td>
                <td className="py-3 px-4 border-b border-[#e2e8f0]">
                  {new Date(despacho.fecha_despacho).toLocaleDateString('es-ES')}
                </td>
                <td className="py-3 px-4 border-b border-[#e2e8f0]">{despacho.hora_despacho}</td>
                <td className="py-3 px-4 border-b border-[#e2e8f0]">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                    despacho.estado === 'programado' ? 'bg-[#eff6ff] text-[#3b82f6]' : 
                    despacho.estado === 'completado' ? 'bg-[#ecfdf5] text-[#10b981]' : 
                    despacho.estado === 'problema' ? 'bg-[#fee2e2] text-[#ef4444]' : 
                    'bg-[#f1f5f9] text-[#64748b]'
                  }`}>
                    {despacho.estado.charAt(0).toUpperCase() + despacho.estado.slice(1)}
                  </span>
                </td>
                <td className="py-3 px-4 border-b border-[#e2e8f0]">
                  <div className="flex gap-2">
                    <button className="w-8 h-8 flex items-center justify-center rounded-full text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#1a56db]">
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-full text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#ef4444]">
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )
    }

    return <div>Tabla no disponible</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-[#1a365d] flex items-center gap-3">
          <FontAwesomeIcon icon={faDatabase} />
          Administración de Base de Datos
        </h2>
        <button 
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[#1a56db] text-white rounded-lg"
          onClick={fetchTableData}
        >
          <FontAwesomeIcon icon={faSync} />
          Actualizar
        </button>
      </div>

      <div className="flex mb-6 bg-white rounded-lg shadow overflow-hidden">
        <div 
          className={`px-5 py-3 cursor-pointer ${activeTable === 'ciudades' ? 'bg-[#e0f2fe] text-[#1a56db] border-b-2 border-[#1a56db]' : ''}`}
          onClick={() => setActiveTable('ciudades')}
        >
          Ciudades
        </div>
        <div 
          className={`px-5 py-3 cursor-pointer ${activeTable === 'reporteros' ? 'bg-[#e0f2fe] text-[#1a56db] border-b-2 border-[#1a56db]' : ''}`}
          onClick={() => setActiveTable('reporteros')}
        >
          Reporteros
        </div>
        <div 
          className={`px-5 py-3 cursor-pointer ${activeTable === 'despachos' ? 'bg-[#e0f2fe] text-[#1a56db] border-b-2 border-[#1a56db]' : ''}`}
          onClick={() => setActiveTable('despachos')}
        >
          Despachos
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        {renderTable()}
      </div>
    </div>
  )
}

export default BaseDatosTab
EOL

# Actualizar components/Tabs.tsx para incluir la nueva pestaña
echo "📝 Actualizando componente Tabs.tsx para incluir la pestaña de Base de Datos..."

if [ -f "components/Tabs.tsx" ]; then
  # Hacer backup del archivo
  cp components/Tabs.tsx components/Tabs.tsx.bak
  
  # Modificar el archivo Tabs.tsx para incluir la pestaña de Base de Datos
  sed -i 's/import { faClipboardList, faCity, faUsers, faChartBar, faCog/import { faClipboardList, faCity, faUsers, faChartBar, faCog, faDatabase/g' components/Tabs.tsx
  sed -i 's/\({ id: '\''resumen'\'', label: '\''Resumen Semanal'\'', icon: faChartBar },\)/\1\n    { id: '\''basedatos'\'', label: '\''Base de Datos'\'', icon: faDatabase },/g' components/Tabs.tsx
fi

# Actualizar components/MainContent.tsx para incluir la nueva pestaña
echo "📝 Actualizando componente MainContent.tsx para incluir la pestaña de Base de Datos..."

if [ -f "components/MainContent.tsx" ]; then
  # Hacer backup del archivo
  cp components/MainContent.tsx components/MainContent.tsx.bak
  
  # Modificar el archivo MainContent.tsx para incluir la pestaña de Base de Datos
  sed -i 's/import RegistroTab from '\''\.\/tabs\/RegistroTab'\''/import RegistroTab from '\''\.\/tabs\/RegistroTab'\''\nimport BaseDatosTab from '\''\.\/tabs\/BaseDatosTab'\''/g' components/MainContent.tsx
  sed -i 's/\({activeTab === '\''config'\'' && <ConfigTab \/>\}\)/\1\n      {activeTab === '\''basedatos'\'' \&\& <BaseDatosTab \/>\}/g' components/MainContent.tsx
fi

# Modificar AppContext.tsx para conectar con API
echo "📝 Modificando AppContext.tsx para conectar con la API..."

# Crear script para la migración y seed
echo "#!/usr/bin/env node
const { execSync } = require('child_process');

console.log('🚀 Ejecutando migraciones y seed de la base de datos...');

try {
  console.log('📦 Generando Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  console.log('🔄 Creando migraciones...');
  execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });
  
  console.log('🌱 Ejecutando seed para inicializar datos...');
  execSync('npx ts-node scripts/seed.ts', { stdio: 'inherit' });
  
  console.log('✅ Base de datos configurada correctamente');
} catch (error) {
  console.error('❌ Error:', error);
  process.exit(1);
}
" > setup-db.js

chmod +x setup-db.js

# Actualizar package.json para incluir comandos útiles
if [ -f "package.json" ]; then
  # Hacer backup del archivo
  cp package.json package.json.bak
  
  # Intentar añadir scripts a package.json
  echo "📝 Actualizando package.json con scripts para la base de datos..."
  sed -i 's/"lint": "next lint"/"lint": "next lint",\n    "db:migrate": "prisma migrate dev",\n    "db:seed": "ts-node scripts\/seed.ts",\n    "db:setup": "node setup-db.js"/g' package.json
fi

echo "✅ Configuración completada. Para inicializar la base de datos, ejecuta:"
echo "npm install ts-node -D"
echo "node setup-db.js"