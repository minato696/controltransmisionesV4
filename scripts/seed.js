const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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