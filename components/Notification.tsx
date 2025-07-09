"use client"

import { useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle, faExclamationCircle, faTimes } from '@fortawesome/free-solid-svg-icons'

interface NotificationProps {
  show: boolean
  type: string
  title: string
  message: string
  onClose: () => void
}

const Notification: React.FC<NotificationProps> = ({ 
  show, 
  type, 
  title, 
  message, 
  onClose 
}) => {
  // Auto-hide notification after 3 seconds
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose()
      }, 3000)
      
      return () => clearTimeout(timer)
    }
  }, [show, onClose])

  if (!show) return null

  return (
    <div 
      className={`
        fixed top-6 right-6 p-4 border-l-4 rounded shadow-md flex items-center gap-3 max-w-[350px] z-50 bg-white
        ${type === 'success' ? 'border-l-success' : 'border-l-danger'}
        transform transition-all duration-300 ${show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <FontAwesomeIcon 
        icon={type === 'success' ? faCheckCircle : faExclamationCircle}
        className={type === 'success' ? 'text-success' : 'text-danger'}
        size="lg"
      />
      <div className="flex-1">
        <div className="font-semibold mb-1 text-sm">{title}</div>
        <div className="text-gray text-xs">{message}</div>
      </div>
      <div 
        className="text-gray hover:text-dark cursor-pointer transition-colors"
        onClick={onClose}
      >
        <FontAwesomeIcon icon={faTimes} />
      </div>
    </div>
  )
}

export default Notification