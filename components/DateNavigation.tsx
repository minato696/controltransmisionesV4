"use client"

import { useState, useRef } from 'react'
import { useAppContext } from './AppContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendarAlt, faChevronLeft, faChevronRight, faCalendarDay } from '@fortawesome/free-solid-svg-icons'
import DropdownCalendar from './DropdownCalendar'

const DateNavigation = () => {
  const { currentDate, setCurrentDate } = useAppContext()
  const [showCalendar, setShowCalendar] = useState(false)
  const calendarButtonRef = useRef<HTMLButtonElement>(null)

  // Función para formatear la fecha
  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    }
    return date.toLocaleDateString('es-ES', options)
      .replace(/^\w/, c => c.toUpperCase())
  }

  // Manejar el cambio de día
  const goToPreviousDay = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() - 1)
    setCurrentDate(newDate)
  }

  const goToNextDay = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + 1)
    setCurrentDate(newDate)
  }

  const handleSelectDate = (date: Date) => {
    setCurrentDate(date)
    setShowCalendar(false)
  }

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded shadow mb-6">
      <div className="flex items-center gap-3 font-medium text-dark cursor-pointer hover:text-primary transition-colors" onClick={() => setShowCalendar(!showCalendar)}>
        <FontAwesomeIcon icon={faCalendarAlt} />
        <span>{formatDate(currentDate)}</span>
      </div>
      <div className="flex gap-3 relative">
        <button 
          onClick={goToPreviousDay}
          className="btn btn-outline"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
          Día anterior
        </button>
        <button 
          ref={calendarButtonRef}
          onClick={() => setShowCalendar(!showCalendar)}
          className="btn btn-primary"
        >
          <FontAwesomeIcon icon={faCalendarDay} />
          Hoy
        </button>
        
        {/* Posición del calendario desplegable */}
        <div className="relative">
          <DropdownCalendar 
            show={showCalendar}
            onClose={() => setShowCalendar(false)}
            currentDate={currentDate}
            onSelectDate={handleSelectDate}
          />
        </div>
        
        <button 
          onClick={goToNextDay}
          className="btn btn-outline"
        >
          Día siguiente
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>
    </div>
  )
}

export default DateNavigation