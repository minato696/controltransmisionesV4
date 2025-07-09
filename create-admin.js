// create-admin.js
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash('contraseña_admin', 10)
  
  const admin = await prisma.usuarios.create({
    data: {
      username: 'admin_control',
      password: password,
      nombre: 'Administrador',
      email: 'admin@radio-exitosa.com',
      rol: 'admin',
      activo: true
    }
  })
  
  console.log('Administrador creado:', admin)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
