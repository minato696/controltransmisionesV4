import { useState, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faChevronLeft, 
  faChevronRight
} from '@fortawesome/free-solid-svg-icons'

interface DropdownCalendarProps {
  show: boolean
  onClose: () => void
  currentDate: Date
  onSelectDate: (date: Date) => void
}

const DropdownCalendar: React.FC<DropdownCalendarProps> = ({
  show,
  onClose,
  currentDate,
  onSelectDate
}) => {
  const [viewDate, setViewDate] = useState<Date>(new Date(currentDate))
  const [calendarDays, setCalendarDays] = useState<(Date | null)[]>([])
  const calendarRef = useRef<HTMLDivElement>(null)

  // Cerrar el calendario cuando se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    
    if (show) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [show, onClose])

  // Recalcular días del calendario cuando cambia el mes de vista
  useEffect(() => {
    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()
    
    // Calcular el primer y último día visible en el calendario
    // (incluyendo días del mes anterior y siguiente para completar semanas)
    const firstDayOfMonth = new Date(year, month, 1)
    const lastDayOfMonth = new Date(year, month + 1, 0)
    
    // Obtener el día de la semana del primer día (0 = domingo, 1 = lunes, etc.)
    // Ajustamos para que la semana empiece en lunes (0 = lunes, 6 = domingo)
    let firstDayOfWeek = firstDayOfMonth.getDay() - 1
    if (firstDayOfWeek === -1) firstDayOfWeek = 6 // Si es domingo (0) ajustar a 6
    
    // Número de días en el mes
    const daysInMonth = lastDayOfMonth.getDate()
    
    // Crear array para los días del calendario
    const days: (Date | null)[] = []
    
    // Agregar días del mes anterior para completar la primera semana
    const lastDayOfPrevMonth = new Date(year, month, 0).getDate()
    for (let i = 0; i < firstDayOfWeek; i++) {
      const day = lastDayOfPrevMonth - firstDayOfWeek + i + 1
      days.push(new Date(year, month - 1, day))
    }
    
    // Agregar los días del mes actual
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    
    // Agregar días del mes siguiente para completar la última semana
    const remainingDays = 42 - days.length // 6 filas x 7 días = 42 celdas en total
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i))
    }
    
    setCalendarDays(days)
  }, [viewDate])

  // Cambiar al mes anterior
  const prevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))
  }

  // Cambiar al mes siguiente
  const nextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))
  }

  // Comprobar si una fecha es hoy
  const isToday = (date: Date) => {
    const today = new Date()
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear()
  }

  // Comprobar si una fecha es la seleccionada actualmente
  const isSelected = (date: Date) => {
    return date.getDate() === currentDate.getDate() &&
           date.getMonth() === currentDate.getMonth() &&
           date.getFullYear() === currentDate.getFullYear()
  }

  // Comprobar si una fecha es del mes actual que se está viendo
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === viewDate.getMonth()
  }

  // Formato del mes y año
  const monthYearFormat = () => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ]
    return `${months[viewDate.getMonth()]} ${viewDate.getFullYear()}`
  }

  if (!show) return null

  return (
    <div 
      ref={calendarRef}
      className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg z-50 transition-all duration-200 border border-[#e2e8f0]"
      style={{ width: '280px' }}
    >
      {/* Navegación del mes */}
      <div className="flex justify-between items-center p-3 border-b border-[#e2e8f0]">
        <button 
          className="p-1 rounded-full hover:bg-[#f1f5f9] text-[#64748b]"
          onClick={prevMonth}
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <h4 className="font-medium text-sm text-[#1e293b]">{monthYearFormat()}</h4>
        <button 
          className="p-1 rounded-full hover:bg-[#f1f5f9] text-[#64748b]"
          onClick={nextMonth}
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>
      
      {/* Días de la semana */}
      <div className="grid grid-cols-7 text-center py-1 text-xs">
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => (
          <div 
            key={index} 
            className="h-8 flex items-center justify-center font-medium text-[#64748b]"
          >
            {day}
          </div>
        ))}
      </div>
      
      {/* Días del mes */}
      <div className="grid grid-cols-7 text-center p-1">
        {calendarDays.map((day, index) => (
          <div 
            key={index} 
            className={`
              h-8 w-8 mx-auto flex items-center justify-center rounded-full text-xs
              ${day && isCurrentMonth(day) ? 'text-[#1e293b]' : 'text-[#cbd5e1]'} 
              ${day && isToday(day) ? 'font-bold' : ''}
              ${day && isSelected(day) ? 'bg-[#1a56db] text-white' : ''}
              ${day ? 'cursor-pointer hover:bg-[#e0f2fe]' : ''}
              ${day && isSelected(day) ? 'hover:bg-[#1e429f]' : ''}
            `}
            onClick={() => day && onSelectDate(day)}
          >
            {day?.getDate()}
          </div>
        ))}
      </div>
      
      {/* Botón "Hoy" */}
      <div className="p-2 text-right border-t border-[#e2e8f0]">
        <button
          className="px-3 py-1 text-xs bg-[#1a56db] text-white rounded hover:bg-[#1e429f] transition-colors"
          onClick={() => onSelectDate(new Date())}
        >
          Hoy
        </button>
      </div>
    </div>
  )
}

export default DropdownCalendar