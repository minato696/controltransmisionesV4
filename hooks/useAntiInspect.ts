import { useEffect } from 'react'

export const useAntiInspect = () => {
  useEffect(() => {
    const handleContext = (e: MouseEvent) => e.preventDefault()

    const handleKey = (e: KeyboardEvent) => {
      const forbidden =
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['I', 'C', 'J'].includes(e.key)) ||
        (e.ctrlKey && e.key === 'U')

      if (forbidden) {
        e.preventDefault()
        e.stopPropagation()
      }
    }

    document.addEventListener('contextmenu', handleContext)
    document.addEventListener('keydown', handleKey)

    // Limpieza al desmontar
    return () => {
      document.removeEventListener('contextmenu', handleContext)
      document.removeEventListener('keydown', handleKey)
    }
  }, [])
}
