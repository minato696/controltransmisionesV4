// Mapeo de identificadores de ciudades a nombres para mostrar
export const cityNameMap: {[key: string]: string} = {
  'abancay': 'Abancay',
  'arequipa': 'Arequipa',
  'ayacucho': 'Ayacucho',
  'barranca': 'Barranca',
  'cajamarca': 'Cajamarca',
  'chiclayo': 'Chiclayo',
  'chincha': 'Chincha',
  'cusco': 'Cusco',
  'huancayo': 'Huancayo',
  'huaral': 'Huaral',
  'huaraz': 'Huaraz',
  'huacho': 'Huacho',
  'ica': 'Ica',
  'iquitos': 'Iquitos',
  'juliaca': 'Juliaca',
  'mollendo': 'Mollendo',
  'piura': 'Piura',
  'pisco': 'Pisco',
  'puerto_maldonado': 'Puerto Maldonado',
  'tacna': 'Tacna',
  'tarapoto': 'Tarapoto',
  'trujillo': 'Trujillo',
  'tumbes': 'Tumbes',
  'yurimaguas': 'Yurimaguas',
  'pucallpa': 'Pucallpa',
  'lima': 'Lima'
}

// Función para formatear nombre de ciudad
export const formatCityName = (cityKey: string): string => {
  return cityNameMap[cityKey] || cityKey.charAt(0).toUpperCase() + cityKey.slice(1).replace(/_/g, ' ');
}

// Función para obtener una lista de ciudades formateada para selects
export const getCityOptions = (cities: string[]) => {
  return [
    { value: "", label: "-- Seleccione Ciudad --" },
    ...cities.map(city => ({
      value: city,
      label: formatCityName(city)
    })).sort((a, b) => a.label.localeCompare(b.label)) // Ordenar alfabéticamente
  ];
}