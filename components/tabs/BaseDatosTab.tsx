// components/tabs/BaseDatosTab.tsx
import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDatabase, faSync, faPlus } from '@fortawesome/free-solid-svg-icons'

const BaseDatosTab = () => {
  const [activeTable, setActiveTable] = useState('ciudades')
  const [tableData, setTableData] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchTableData = async () => {
    setLoading(true)
    const response = await fetch(`/api/${activeTable}`)
    const data = await response.json()
    setTableData(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchTableData()
  }, [activeTable])

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-[#1a365d] flex items-center gap-3">
          <FontAwesomeIcon icon={faDatabase} />
          Administración de Base de Datos
        </h2>
        <button 
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[#1a56db] text-white rounded-lg"
          onClick={fetchTableData}
        >
          <FontAwesomeIcon icon={faSync} />
          Actualizar
        </button>
      </div>

      <div className="flex mb-6 bg-white rounded-lg shadow overflow-hidden">
        <div 
          className={`px-5 py-3 cursor-pointer ${activeTable === 'ciudades' ? 'bg-[#e0f2fe] text-[#1a56db] border-b-2 border-[#1a56db]' : ''}`}
          onClick={() => setActiveTable('ciudades')}
        >
          Ciudades
        </div>
        <div 
          className={`px-5 py-3 cursor-pointer ${activeTable === 'reporteros' ? 'bg-[#e0f2fe] text-[#1a56db] border-b-2 border-[#1a56db]' : ''}`}
          onClick={() => setActiveTable('reporteros')}
        >
          Reporteros
        </div>
        <div 
          className={`px-5 py-3 cursor-pointer ${activeTable === 'despachos' ? 'bg-[#e0f2fe] text-[#1a56db] border-b-2 border-[#1a56db]' : ''}`}
          onClick={() => setActiveTable('despachos')}
        >
          Despachos
        </div>
      </div>

      {/* Tabla dinámica según la selección */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        {/* Contenido de la tabla según activeTable */}
      </div>
    </div>
  )
}

export default BaseDatosTab