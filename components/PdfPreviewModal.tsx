// components/PdfPreviewModal.tsx
import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faTimes, faDownload, faExpand, faCompress, 
  faSpinner, faFilePdf 
} from '@fortawesome/free-solid-svg-icons'

interface PdfPreviewModalProps {
  show: boolean
  onClose: () => void
  pdfData: {
    title: string
    type: 'reportero' | 'ciudad' | 'estadisticas' | 'fecha'
    data: any
  } | null
  onDownload: () => void
}

const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({ 
  show, 
  onClose, 
  pdfData,
  onDownload 
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  if (!show || !pdfData) return null

  const handleDownload = async () => {
    setIsGenerating(true)
    try {
      await onDownload()
      setTimeout(() => {
        onClose()
      }, 500)
    } catch (error) {
      console.error('Error al generar PDF:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  // Renderizar vista previa según el tipo
  const renderPreview = () => {
    switch (pdfData.type) {
      case 'reportero':
        return (
          <div className="space-y-4">
            <div className="bg-[#1a56db] text-white p-6 rounded-t-lg">
              <h2 className="text-2xl font-bold text-center">INFORME DE DESPACHOS</h2>
              <p className="text-center mt-2 opacity-90">
                Generado el {new Date().toLocaleDateString('es-ES')}
              </p>
            </div>
            
            <div className="px-6">
              <h3 className="font-bold text-lg mb-3">Información del Reportero</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><strong>Nombre:</strong></div>
                <div>{pdfData.data.reportero?.nombre || 'N/A'}</div>
                <div><strong>Ciudad:</strong></div>
                <div>{pdfData.data.reportero?.ciudad?.nombre || 'N/A'}</div>
                <div><strong>Total despachos:</strong></div>
                <div>{pdfData.data.despachos?.length || 0}</div>
              </div>
            </div>

            <div className="px-6">
              <h3 className="font-bold text-lg mb-3">Despachos Registrados</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#f1f5f9]">
                      <th className="p-2 text-left">Fecha</th>
                      <th className="p-2 text-left">Título</th>
                      <th className="p-2 text-center">Hora</th>
                      <th className="p-2 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pdfData.data.despachos?.slice(0, 5).map((despacho: any, index: number) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">
                          {new Date(despacho.fecha_despacho).toLocaleDateString('es-ES')}
                        </td>
                        <td className="p-2">{despacho.titulo || 'Sin título'}</td>
                        <td className="p-2 text-center">{despacho.hora_despacho || '-'}</td>
                        <td className="p-2 text-center">
                          <span className={`inline-block px-2 py-1 rounded text-xs ${
                            despacho.estado === 'completado' ? 'bg-green-100 text-green-800' :
                            despacho.estado === 'problema' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {despacho.estado || 'Programado'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {pdfData.data.despachos?.length > 5 && (
                  <p className="text-center text-sm text-gray-500 mt-2">
                    ... y {pdfData.data.despachos.length - 5} despachos más
                  </p>
                )}
              </div>
            </div>
          </div>
        )

      case 'estadisticas':
        return (
          <div className="space-y-4">
            <div className="bg-[#1a56db] text-white p-6 rounded-t-lg">
              <h2 className="text-2xl font-bold text-center">INFORME ESTADÍSTICO</h2>
              <p className="text-center mt-2 opacity-90">Sistema de Control de Despachos</p>
            </div>
            
            <div className="px-6">
              <h3 className="font-bold text-lg mb-3">KPIs Principales</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#f8fafc] p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-[#1a56db]">
                    {pdfData.data.totalDespachos || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total Despachos</div>
                </div>
                <div className="bg-[#f8fafc] p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-[#10b981]">
                    {pdfData.data.promedioDespachosDiarios?.toFixed(1) || 0}
                  </div>
                  <div className="text-sm text-gray-600">Promedio Diario</div>
                </div>
                <div className="bg-[#f8fafc] p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-[#f59e0b]">
                    {pdfData.data.reporterosActivos || 0}
                  </div>
                  <div className="text-sm text-gray-600">Reporteros Activos</div>
                </div>
                <div className="bg-[#f8fafc] p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-[#3b82f6]">
                    {pdfData.data.coberturaNacional?.toFixed(1) || 0}%
                  </div>
                  <div className="text-sm text-gray-600">Cobertura Nacional</div>
                </div>
              </div>
            </div>

            <div className="px-6">
              <h3 className="font-bold text-lg mb-3">Top 5 Ciudades</h3>
              <div className="space-y-2">
                {pdfData.data.topCiudades?.map((ciudad: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="font-medium">{index + 1}. {ciudad.nombre}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-[#1a56db] h-2 rounded-full"
                          style={{ width: `${ciudad.porcentaje}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">{ciudad.despachos} ({ciudad.porcentaje}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div className="p-6 text-center text-gray-500">
            <FontAwesomeIcon icon={faFilePdf} className="text-6xl mb-4" />
            <p>Vista previa no disponible para este tipo de informe</p>
          </div>
        )
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`
        bg-white rounded-lg shadow-2xl transition-all duration-300
        ${isFullscreen ? 'w-full h-full' : 'w-full max-w-3xl max-h-[90vh]'}
      `}>
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Vista Previa - {pdfData.title}
          </h3>
          <div className="flex items-center gap-2">
            <button
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            >
              <FontAwesomeIcon icon={isFullscreen ? faCompress : faExpand} />
            </button>
            <button
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              onClick={onClose}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto" style={{ maxHeight: isFullscreen ? 'calc(100vh - 140px)' : '60vh' }}>
          <div className="p-6 bg-gray-50">
            <div className="bg-white rounded-lg shadow-sm">
              {renderPreview()}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600">
            Este es un preview del documento. El PDF final puede variar ligeramente.
          </p>
          <div className="flex gap-3">
            <button
              className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              className="px-4 py-2 bg-[#ef4444] text-white rounded-lg hover:bg-[#dc2626] transition-colors flex items-center gap-2"
              onClick={handleDownload}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  Generando...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faDownload} />
                  Descargar PDF
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PdfPreviewModal