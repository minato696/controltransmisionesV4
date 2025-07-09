// components/ExportButton.tsx
import { useState, useRef, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFilePdf, faChevronDown, faSpinner } from '@fortawesome/free-solid-svg-icons'

interface ExportOption {
  id: string
  label: string
  description?: string
  action: () => void | Promise<void>
  icon?: any
}

interface ExportButtonProps {
  options: ExportOption[]
  buttonText?: string
  className?: string
}

const ExportButton: React.FC<ExportButtonProps> = ({ 
  options, 
  buttonText = 'Exportar PDF',
  className = ''
}) => {
  const [showDropdown, setShowDropdown] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportingId, setExportingId] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown])

  const handleExport = async (option: ExportOption) => {
    setIsExporting(true)
    setExportingId(option.id)
    
    try {
      await option.action()
    } catch (error) {
      console.error('Error al exportar:', error)
    } finally {
      setIsExporting(false)
      setExportingId(null)
      setShowDropdown(false)
    }
  }

  // Si solo hay una opción, ejecutar directamente
  if (options.length === 1) {
    return (
      <button
        className={`flex items-center gap-2 px-4 py-2 bg-[#ef4444] text-white rounded-lg hover:bg-[#dc2626] transition-colors ${className}`}
        onClick={() => handleExport(options[0])}
        disabled={isExporting}
      >
        {isExporting ? (
          <>
            <FontAwesomeIcon icon={faSpinner} spin />
            Exportando...
          </>
        ) : (
          <>
            <FontAwesomeIcon icon={faFilePdf} />
            {buttonText}
          </>
        )}
      </button>
    )
  }

  // Si hay múltiples opciones, mostrar dropdown
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className={`flex items-center gap-2 px-4 py-2 bg-[#ef4444] text-white rounded-lg hover:bg-[#dc2626] transition-colors ${className}`}
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={isExporting}
      >
        <FontAwesomeIcon icon={faFilePdf} />
        {buttonText}
        <FontAwesomeIcon icon={faChevronDown} className="text-xs" />
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-[#e2e8f0] z-50">
          <div className="py-2">
            {options.map((option) => (
              <button
                key={option.id}
                className="w-full px-4 py-3 text-left hover:bg-[#f1f5f9] transition-colors flex items-start gap-3"
                onClick={() => handleExport(option)}
                disabled={isExporting}
              >
                <div className="mt-0.5">
                  {exportingId === option.id ? (
                    <FontAwesomeIcon icon={faSpinner} spin className="text-[#ef4444]" />
                  ) : (
                    <FontAwesomeIcon icon={option.icon || faFilePdf} className="text-[#ef4444]" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-[#1e293b]">{option.label}</div>
                  {option.description && (
                    <div className="text-sm text-[#64748b] mt-0.5">{option.description}</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ExportButton