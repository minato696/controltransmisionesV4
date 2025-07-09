const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  try {
    // Comprobar si el usuario ya existe
    const existingUser = await prisma.usuarios.findUnique({
      where: { username: 'exitosa' }
    })
    
    if (existingUser) {
      console.log('El usuario exitosa ya existe')
      return
    }
    
    // Crear el usuario
    const user = await prisma.usuarios.create({
      data: {
        username: 'exitosa',
        password: 'b0/3BeA.zoUGiP9E2rShfC2rwpv9hM9TiR/vsVi',
        nombre: 'Usuario Exitosa',
        email: 'exitosa@radio-exitosa.com',
        rol: 'admin',
        activo: true
      }
    })
    
    console.log('Usuario creado:', user)
  } catch (error) {
    console.error('Error al crear usuario:', error)
  } finally {
    await prisma.()
  }
}

main()
