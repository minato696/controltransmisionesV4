const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function setupUsers() {
  try {
    console.log('Configurando usuarios predeterminados...');

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash('147ABC55', 10);

    // Crear usuario administrador
    const admin = await prisma.usuarios.upsert({
      where: { username: 'admin_control' },
      update: {
        password: hashedPassword,
        nombre: 'Administrador del Sistema',
        rol: 'admin',
        activo: true
      },
      create: {
        username: 'admin_control',
        password: hashedPassword,
        nombre: 'Administrador del Sistema',
        email: 'admin@sistema.com',
        rol: 'admin',
        activo: true
      }
    });

    console.log('✓ Usuario administrador creado:', admin.username);

    // Crear usuario operador
    const operador = await prisma.usuarios.upsert({
      where: { username: 'exitosa' },
      update: {
        password: hashedPassword,
        nombre: 'Operador Exitosa',
        rol: 'operador',
        activo: true
      },
      create: {
        username: 'exitosa',
        password: hashedPassword,
        nombre: 'Operador Exitosa',
        email: 'operador@sistema.com',
        rol: 'operador',
        activo: true
      }
    });

    console.log('✓ Usuario operador creado:', operador.username);
    console.log('\nUsuarios configurados exitosamente:');
    console.log('- Admin: admin_control / 147ABC55');
    console.log('- Operador: exitosa / 147ABC55');

  } catch (error) {
    console.error('Error al configurar usuarios:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupUsers();