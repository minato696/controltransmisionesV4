// components/modals/ConfirmDeleteCiudadModal.tsx
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle, faTimes, faTrash, faSpinner, faCity } from '@fortawesome/free-solid-svg-icons'

interface ConfirmDeleteCiudadModalProps {
  show: boolean
  onClose: () => void
  onConfirm: () => void
  ciudad: {
    nombre: string
    reporterosCount: number
  } | null
  isDeleting: boolean
}

const ConfirmDeleteCiudadModal: React.FC<ConfirmDeleteCiudadModalProps> = ({ 
  show, 
  onClose, 
  onConfirm, 
  ciudad,
  isDeleting
}) => {
  if (!show || !ciudad) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backdropFilter: "blur(8px)", backgroundColor: "rgba(0, 0, 0, 0.4)" }}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center px-4 py-3 border-b border-[#e2e8f0]">
          <h3 className="text-base font-semibold text-[#ef4444] flex items-center gap-2">
            <FontAwesomeIcon icon={faExclamationTriangle} />
            Confirmar eliminación de ciudad
          </h3>
          <button 
            className="text-[#64748b] hover:text-[#1e293b] transition-colors"
            onClick={onClose}
            disabled={isDeleting}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        
        <div className="p-4">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-[#fee2e2] rounded-full flex items-center justify-center flex-shrink-0">
              <FontAwesomeIcon icon={faCity} className="text-[#ef4444]" />
            </div>
            <div>
              <p className="text-[#1e293b] mb-2">
                ¿Estás seguro de que deseas eliminar la ciudad <span className="font-semibold">{ciudad.nombre}</span>?
              </p>
              {ciudad.reporterosCount > 0 ? (
                <div className="bg-[#fee2e2] border border-[#fecaca] rounded-lg p-3 text-sm">
                  <p className="text-[#dc2626] font-medium mb-1">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
                    No se puede eliminar esta ciudad
                  </p>
                  <p className="text-[#7f1d1d]">
                    La ciudad tiene {ciudad.reporterosCount} reportero{ciudad.reporterosCount !== 1 ? 's' : ''} asociado{ciudad.reporterosCount !== 1 ? 's' : ''}. 
                    Debes eliminar primero todos los reporteros de esta ciudad.
                  </p>
                </div>
              ) : (
                <p className="text-[#64748b] text-sm">
                  Esta acción es permanente y no se puede deshacer.
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end p-3 gap-3 border-t border-[#e2e8f0] bg-[#f8fafc]">
          <button
            className="px-4 py-2 bg-white text-[#1e293b] border border-[#e2e8f0] rounded-md hover:bg-[#f1f5f9] transition-colors"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancelar
          </button>
          {ciudad.reporterosCount === 0 && (
            <button
              className="px-4 py-2 bg-[#ef4444] text-white rounded-md hover:bg-[#dc2626] transition-colors flex items-center gap-2"
              onClick={onConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  Eliminando...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faTrash} />
                  Eliminar Ciudad
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ConfirmDeleteCiudadModal