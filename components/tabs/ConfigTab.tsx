"use client"

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faCity, faUsers, faCog, faPlus, faEdit, 
  faTrash, faToggleOn, faSave 
} from '@fortawesome/free-solid-svg-icons'

const ConfigTab = () => {
  return (
    <div>
      {/* Gestión de Ciudades */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-primary-darker flex items-center gap-3 mb-5">
          <FontAwesomeIcon icon={faCity} />
          Gestión de Ciudades
        </h3>
        
        <div className="bg-white rounded shadow">
          <div className="p-6">
            <div className="flex gap-4 mb-4">
              <input 
                type="text" 
                className="flex-1 max-w-[300px] px-3.5 py-2.5 text-sm border border-gray-light rounded shadow-sm transition-all focus:outline-none focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-25"
                placeholder="Nombre de la ciudad" 
              />
              <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded shadow-sm hover:bg-primary-dark transition-colors">
                <FontAwesomeIcon icon={faPlus} />
                Agregar Ciudad
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left py-3 px-4 bg-gray-light font-semibold text-gray-dark border-b border-gray-light">Ciudad</th>
                    <th className="text-left py-3 px-4 bg-gray-light font-semibold text-gray-dark border-b border-gray-light">Reporteros</th>
                    <th className="text-left py-3 px-4 bg-gray-light font-semibold text-gray-dark border-b border-gray-light">Despachos esta semana</th>
                    <th className="text-left py-3 px-4 bg-gray-light font-semibold text-gray-dark border-b border-gray-light">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-gray-light">
                    <td className="py-3 px-4 border-b border-gray-light">Arequipa</td>
                    <td className="py-3 px-4 border-b border-gray-light">3</td>
                    <td className="py-3 px-4 border-b border-gray-light">32</td>
                    <td className="py-3 px-4 border-b border-gray-light">
                      <div className="flex gap-2">
                        <button className="w-8 h-8 flex items-center justify-center rounded-full text-gray hover:bg-gray-light hover:text-primary transition-colors">
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-full text-gray hover:bg-gray-light hover:text-danger transition-colors">
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-light">
                    <td className="py-3 px-4 border-b border-gray-light">Trujillo</td>
                    <td className="py-3 px-4 border-b border-gray-light">3</td>
                    <td className="py-3 px-4 border-b border-gray-light">28</td>
                    <td className="py-3 px-4 border-b border-gray-light">
                      <div className="flex gap-2">
                        <button className="w-8 h-8 flex items-center justify-center rounded-full text-gray hover:bg-gray-light hover:text-primary transition-colors">
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-full text-gray hover:bg-gray-light hover:text-danger transition-colors">
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      {/* Gestión de Reporteros */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-primary-darker flex items-center gap-3 mb-5">
          <FontAwesomeIcon icon={faUsers} />
          Gestión de Reporteros
        </h3>
        
        <div className="bg-white rounded shadow">
          <div className="p-6">
            <div className="flex gap-4 mb-4">
              <div className="flex-1 max-w-[300px]">
                <input 
                  type="text" 
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-light rounded shadow-sm transition-all focus:outline-none focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-25"
                  placeholder="Nombre del reportero" 
                />
              </div>
              <div className="flex-1 max-w-[200px]">
                <select className="w-full px-3.5 py-2.5 text-sm border border-gray-light rounded shadow-sm transition-all focus:outline-none focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-25">
                  <option value="">-- Seleccione Ciudad --</option>
                  <option value="abancay">Abancay</option>
                  <option value="arequipa">Arequipa</option>
                  <option value="ayacucho">Ayacucho</option>
                  <option value="cajamarca">Cajamarca</option>
                  <option value="chiclayo">Chiclayo</option>
                  <option value="cusco">Cusco</option>
                  <option value="huancayo">Huancayo</option>
                  <option value="ica">Ica</option>
                  <option value="piura">Piura</option>
                  <option value="tacna">Tacna</option>
                  <option value="trujillo">Trujillo</option>
                </select>
              </div>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded shadow-sm hover:bg-primary-dark transition-colors">
                <FontAwesomeIcon icon={faPlus} />
                Agregar Reportero
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left py-3 px-4 bg-gray-light font-semibold text-gray-dark border-b border-gray-light">Reportero</th>
                    <th className="text-left py-3 px-4 bg-gray-light font-semibold text-gray-dark border-b border-gray-light">Ciudad</th>
                    <th className="text-left py-3 px-4 bg-gray-light font-semibold text-gray-dark border-b border-gray-light">Estado</th>
                    <th className="text-left py-3 px-4 bg-gray-light font-semibold text-gray-dark border-b border-gray-light">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-gray-light">
                    <td className="py-3 px-4 border-b border-gray-light">Carlos Nina</td>
                    <td className="py-3 px-4 border-b border-gray-light">Arequipa</td>
                    <td className="py-3 px-4 border-b border-gray-light">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-success-light text-success">
                        Activo
                      </span>
                    </td>
                    <td className="py-3 px-4 border-b border-gray-light">
                      <div className="flex gap-2">
                        <button className="w-8 h-8 flex items-center justify-center rounded-full text-gray hover:bg-gray-light hover:text-primary transition-colors">
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-full text-gray hover:bg-gray-light hover:text-primary transition-colors">
                          <FontAwesomeIcon icon={faToggleOn} />
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-full text-gray hover:bg-gray-light hover:text-danger transition-colors">
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-light">
                    <td className="py-3 px-4 border-b border-gray-light">Percy Pillca</td>
                    <td className="py-3 px-4 border-b border-gray-light">Cusco</td>
                    <td className="py-3 px-4 border-b border-gray-light">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-success-light text-success">
                        Activo
                      </span>
                    </td>
                    <td className="py-3 px-4 border-b border-gray-light">
                      <div className="flex gap-2">
                        <button className="w-8 h-8 flex items-center justify-center rounded-full text-gray hover:bg-gray-light hover:text-primary transition-colors">
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-full text-gray hover:bg-gray-light hover:text-primary transition-colors">
                          <FontAwesomeIcon icon={faToggleOn} />
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-full text-gray hover:bg-gray-light hover:text-danger transition-colors">
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      {/* Configuración General */}
      <div>
        <h3 className="text-lg font-semibold text-primary-darker flex items-center gap-3 mb-5">
          <FontAwesomeIcon icon={faCog} />
          Configuración General
        </h3>
        
        <div className="bg-white rounded shadow">
          <div className="p-6">
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-dark">
                Nombre de la Organización
              </label>
              <input 
                type="text" 
                className="w-full px-3.5 py-2.5 text-sm border border-gray-light rounded shadow-sm transition-all focus:outline-none focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-25"
                defaultValue="Sistema de Control de Despachos"
              />
            </div>
            
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-dark">
                Zona Horaria
              </label>
              <select className="w-full px-3.5 py-2.5 text-sm border border-gray-light rounded shadow-sm transition-all focus:outline-none focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-25">
                <option value="America/Lima">América/Lima (UTC-5)</option>
                <option value="America/Bogota">América/Bogotá (UTC-5)</option>
                <option value="America/Santiago">América/Santiago (UTC-4)</option>
              </select>
            </div>
            
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-dark">
                Formato de Fecha
              </label>
              <select className="w-full px-3.5 py-2.5 text-sm border border-gray-light rounded shadow-sm transition-all focus:outline-none focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-25">
                <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                <option value="yyyy-mm-dd">YYYY-MM-DD</option>
              </select>
            </div>
            
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-dark">
                Correo de Notificaciones
              </label>
              <input 
                type="email" 
                className="w-full px-3.5 py-2.5 text-sm border border-gray-light rounded shadow-sm transition-all focus:outline-none focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-25"
                defaultValue="notificaciones@despachos.com"
              />
            </div>
            
            <div className="flex justify-end">
              <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded font-medium text-sm shadow-sm hover:bg-primary-dark hover:transform hover:-translate-y-0.5 hover:shadow transition-all">
                <FontAwesomeIcon icon={faSave} />
                Guardar Configuración
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfigTab