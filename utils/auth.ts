// utils/auth.ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface UserPayload {
  id: number;
  username: string;
  rol: string;
  nombre: string;
}

// Función para hashear contraseñas
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Función para verificar contraseñas
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// Función para generar JWT
export const generateToken = (user: UserPayload): string => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      rol: user.rol,
      nombre: user.nombre
    },
    JWT_SECRET,
    { expiresIn: '8h' }
  );
};

// Función para verificar JWT
export const verifyToken = (token: string): UserPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload;
  } catch (error) {
    return null;
  }
};

// Verificar permisos según el rol
export const checkPermission = (userRole: string, requiredRole: string): boolean => {
  const roleHierarchy: { [key: string]: number } = {
    'admin': 2,
    'operador': 1
  };

  return (roleHierarchy[userRole] || 0) >= (roleHierarchy[requiredRole] || 0);
};