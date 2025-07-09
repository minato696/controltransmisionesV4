import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faChevronLeft, 
  faChevronRight,
  faTimes
} from '@fortawesome/free-solid-svg-icons'

interface CalendarModalProps {
  show: boolean
  onClose: () => void
  currentDate: Date
  onSelectDate: (date: Date) => void
}

const CalendarModal: React.FC<CalendarModalProps> = ({
  show,
  onClose,
  currentDate,
  onSelectDate
}) => {
  const [viewDate, setViewDate] = useState<Date>(new Date(currentDate))
  const [calendarDays, setCalendarDays] = useState<(Date | null)[]>([])

  // Recalcular días del calendario cuando cambia el mes de vista
  useEffect(() => {
    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()
    
    // Primer día del mes
    const firstDayOfMonth = new Date(year, month, 1)
    // Último día del mes
    const lastDayOfMonth = new Date(year, month + 1, 0)
    
    // Día de la semana del primer día del mes (0 = domingo, 1 = lunes, etc.)
    const firstDayOfWeek = firstDayOfMonth.getDay()
    // Ajuste para que la semana comience en lunes (0 = lunes, 6 = domingo)
    const adjustedFirstDayOfWeek = (firstDayOfWeek === 0) ? 6 : firstDayOfWeek - 1
    
    // Número de días en el mes
    const daysInMonth = lastDayOfMonth.getDate()
    
    // Crear array para los días del calendario
    const days: (Date | null)[] = []
    
    // Agregar días vacíos al principio para alinear con el día de la semana correcto
    for (let i = 0; i < adjustedFirstDayOfWeek; i++) {
      days.push(null)
    }
    
    // Agregar los días del mes
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    
    // Agregar días vacíos al final para completar la última semana
    const remainingCells = 42 - days.length // 6 semanas * 7 días = 42
    for (let i = 0; i < remainingCells; i++) {
      days.push(null)
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
  const isToday = (date: Date | null) => {
    if (!date) return false
    const today = new Date()
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear()
  }

  // Comprobar si una fecha es la seleccionada actualmente
  const isSelected = (date: Date | null) => {
    if (!date) return false
    return date.getDate() === currentDate.getDate() &&
           date.getMonth() === currentDate.getMonth() &&
           date.getFullYear() === currentDate.getFullYear()
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md transform transition-transform duration-300">
        <div className="flex justify-between items-center px-5 py-4 border-b border-[#e2e8f0]">
          <h3 className="text-lg font-semibold text-[#1a365d]">Seleccionar Fecha</h3>
          <button 
            className="text-[#64748b] hover:text-[#1e293b] transition-colors text-xl"
            onClick={onClose}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        
        <div className="p-4">
          {/* Navegación del mes */}
          <div className="flex justify-between items-center mb-4">
            <button 
              className="p-2 rounded-full hover:bg-[#f1f5f9] text-[#64748b]"
              onClick={prevMonth}
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <h4 className="font-semibold text-[#1e293b]">{monthYearFormat()}</h4>
            <button 
              className="p-2 rounded-full hover:bg-[#f1f5f9] text-[#64748b]"
              onClick={nextMonth}
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
          
          {/* Días de la semana */}
          <div className="grid grid-cols-7 mb-2">
            {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, index) => (
              <div 
                key={index} 
                className="h-8 flex items-center justify-center text-sm font-medium text-[#64748b]"
              >
                {day}
              </div>
            ))}
          </div>
          
          {/* Días del mes */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => (
              <div 
                key={index} 
                className={`
                  h-10 flex items-center justify-center rounded-md text-sm relative
                  ${!day ? 'text-[#cbd5e1]' : 'cursor-pointer hover:bg-[#e0f2fe]'}
                  ${isToday(day) ? 'font-bold' : ''}
                  ${isSelected(day) ? 'bg-[#1a56db] text-white hover:bg-[#1e429f]' : ''}
                `}
                onClick={() => day && onSelectDate(day)}
              >
                {day?.getDate()}
                {isToday(day) && !isSelected(day) && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[#1a56db] rounded-full"></div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-end p-4 border-t border-[#e2e8f0]">
          <button
            className="px-4 py-2 bg-[#1a56db] text-white rounded-lg hover:bg-[#1e429f] transition-colors"
            onClick={() => onSelectDate(new Date())}
          >
            Hoy
          </button>
        </div>
      </div>
    </div>
  )
}

export default CalendarModal