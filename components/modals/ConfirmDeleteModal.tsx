// components/modals/ConfirmDeleteModal.tsx
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle, faTimes, faTrash, faSpinner } from '@fortawesome/free-solid-svg-icons'

interface ConfirmDeleteModalProps {
  show: boolean
  onClose: () => void
  onConfirm: () => void
  nombreReportero: string
  isDeleting: boolean
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ 
  show, 
  onClose, 
  onConfirm, 
  nombreReportero,
  isDeleting
}) => {
  if (!show) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-white bg-opacity-30">
      <div className="bg-white rounded-lg shadow-md w-full max-w-md">
        <div className="flex justify-between items-center px-4 py-3 border-b border-[#e2e8f0]">
          <h3 className="text-base font-semibold text-[#ef4444] flex items-center gap-2">
            <FontAwesomeIcon icon={faExclamationTriangle} />
            Confirmar eliminación
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
          <p className="text-[#1e293b] mb-3">
            ¿Estás seguro de que deseas eliminar al reportero <span className="font-semibold">{nombreReportero}</span>?
          </p>
          <p className="text-[#64748b] text-sm">
            Esta acción eliminará todos los despachos asociados a este reportero y no se puede deshacer.
          </p>
        </div>
        
        <div className="flex justify-end p-3 gap-3 border-t border-[#e2e8f0] bg-[#f8fafc]">
          <button
            className="px-4 py-2 bg-white text-[#1e293b] border border-[#e2e8f0] rounded-md hover:bg-[#f1f5f9] transition-colors"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancelar
          </button>
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
                Eliminar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDeleteModal