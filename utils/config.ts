// utils/config.ts
export const getBaseURL = () => {
  // Si estamos en el servidor
  if (typeof window === 'undefined') {
    // En producción, usa la URL del servidor
    if (process.env.NODE_ENV === 'production') {
      return process.env.NEXTAUTH_URL || 'http://192.168.10.188:5451'
    }
    return 'http://192.168.10.188:5451'
  }
  
  // Si estamos en el cliente, usa la URL actual
  return window.location.origin
}

export const config = {
  baseURL: getBaseURL(),
  api: {
    timeout: 30000, // 30 segundos
  }
}