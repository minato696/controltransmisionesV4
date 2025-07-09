// utils/dateUtils.ts - Versión corregida y unificada

/**
 * Utilidades para manejo de fechas con zona horaria de Lima, Perú (UTC-5)
 */

// Constante para la zona horaria de Lima
const LIMA_TIMEZONE = 'America/Lima';
const LIMA_OFFSET_HOURS = -5;

/**
 * Parsea una fecha string considerando la zona horaria de Lima
 * @param dateString - String de fecha en formato YYYY-MM-DD o ISO
 * @returns Date objeto ajustado a la zona horaria de Lima
 */
export function parseDateLima(dateString: string | Date): Date {
  // Si ya es un Date object, retornarlo
  if (dateString instanceof Date) {
    return dateString;
  }
  
  // Si no hay fecha, usar la fecha actual
  if (!dateString) {
    return getCurrentDateLima();
  }
  
  // Si es solo fecha (YYYY-MM-DD), agregar hora de medianoche
  let dateStr = dateString;
  if (!dateStr.includes('T') && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    // Agregar medianoche en hora de Lima
    dateStr = `${dateStr}T00:00:00`;
  }
  
  // Crear fecha
  const date = new Date(dateStr);
  
  // Si la fecha es inválida, retornar fecha actual
  if (isNaN(date.getTime())) {
    console.error('Fecha inválida:', dateString);
    return getCurrentDateLima();
  }
  
  // Si la fecha string no incluía información de zona horaria,
  // ajustar asumiendo que es hora de Lima
  if (!dateString.includes('Z') && !dateString.includes('+') && !dateString.includes('-')) {
    // Obtener el offset actual del navegador
    const localOffset = date.getTimezoneOffset();
    // Offset de Lima en minutos (UTC-5 = -300 minutos)
    const limaOffset = LIMA_OFFSET_HOURS * 60;
    // Ajustar la fecha
    const offsetDiff = localOffset + limaOffset;
    date.setMinutes(date.getMinutes() + offsetDiff);
  }
  
  return date;
}

/**
 * Obtiene el inicio del día en la zona horaria de Lima
 * @param date - Date objeto
 * @returns Date objeto al inicio del día (00:00:00.000)
 */
export function getStartOfDayLima(date: Date): Date {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
}

/**
 * Obtiene el final del día en la zona horaria de Lima
 * @param date - Date objeto
 * @returns Date objeto al final del día (23:59:59.999)
 */
export function getEndOfDayLima(date: Date): Date {
  const newDate = new Date(date);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
}

/**
 * Formatea una fecha para la API (YYYY-MM-DD)
 * @param date - Date objeto o string
 * @returns String en formato YYYY-MM-DD
 */
export function formatDateForAPI(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    console.error('Fecha inválida para formatear:', date);
    return formatDateForAPI(new Date());
  }
  
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formatea una fecha para mostrar en UI
 * @param date - Date objeto o string
 * @param options - Opciones de formato
 * @returns String formateado para mostrar
 */
export function formatDateForDisplay(
  date: Date | string,
  options: {
    includeTime?: boolean;
    includeWeekday?: boolean;
    shortFormat?: boolean;
  } = {}
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Fecha inválida';
  }
  
  const { includeTime = false, includeWeekday = false, shortFormat = false } = options;
  
  const formatOptions: Intl.DateTimeFormatOptions = {
    timeZone: LIMA_TIMEZONE,
    day: 'numeric',
    month: shortFormat ? 'short' : 'long',
    year: 'numeric',
    ...(includeWeekday && { weekday: shortFormat ? 'short' : 'long' }),
    ...(includeTime && { hour: '2-digit', minute: '2-digit' })
  };
  
  return dateObj.toLocaleDateString('es-PE', formatOptions);
}

/**
 * Obtiene la fecha actual en la zona horaria de Lima
 * @returns Date objeto con la fecha/hora actual de Lima
 */
export function getCurrentDateLima(): Date {
  const now = new Date();
  
  // Obtener la fecha/hora actual en Lima usando Intl
  const limaTime = new Date(now.toLocaleString("en-US", { timeZone: LIMA_TIMEZONE }));
  
  return limaTime;
}

/**
 * Compara si dos fechas son del mismo día (ignorando la hora)
 * @param date1 - Primera fecha
 * @param date2 - Segunda fecha
 * @returns true si son del mismo día
 */
export function isSameDay(date1: Date | string, date2: Date | string): boolean {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}

/**
 * Obtiene el lunes de la semana de una fecha dada
 * @param date - Date objeto
 * @returns Date objeto del lunes de esa semana
 */
export function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Obtiene el domingo de la semana de una fecha dada
 * @param date - Date objeto
 * @returns Date objeto del domingo de esa semana
 */
export function getSunday(date: Date): Date {
  const monday = getMonday(date);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return sunday;
}

/**
 * Verifica si una semana está completa
 * @param endDate - Fecha de fin de la semana
 * @returns boolean indicando si la semana está completa
 */
export function isWeekComplete(endDate: Date): boolean {
  const today = getCurrentDateLima();
  today.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  return end < today;
}

/**
 * Verifica si una fecha está en la semana actual
 * @param startDate - Fecha de inicio de la semana
 * @param endDate - Fecha de fin de la semana
 * @returns boolean indicando si es la semana actual
 */
export function isCurrentWeek(startDate: Date, endDate: Date): boolean {
  const today = getCurrentDateLima();
  today.setHours(0, 0, 0, 0);
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  return today >= start && today <= end;
}

/**
 * Agrega días a una fecha
 * @param date - Date objeto
 * @param days - Número de días a agregar (puede ser negativo)
 * @returns Nueva fecha con los días agregados
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Obtiene el primer día del mes
 * @param date - Date objeto
 * @returns Date objeto del primer día del mes
 */
export function getFirstDayOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

/**
 * Obtiene el último día del mes
 * @param date - Date objeto
 * @returns Date objeto del último día del mes
 */
export function getLastDayOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

/**
 * Formatea un rango de fechas para mostrar
 * @param startDate - Fecha de inicio
 * @param endDate - Fecha de fin
 * @returns String con el rango formateado
 */
export function formatDateRange(startDate: Date, endDate: Date): string {
  const start = formatDateForDisplay(startDate, { shortFormat: true });
  const end = formatDateForDisplay(endDate, { shortFormat: true });
  
  // Si es el mismo día
  if (isSameDay(startDate, endDate)) {
    return formatDateForDisplay(startDate, { includeWeekday: true });
  }
  
  // Si es el mismo mes y año
  if (startDate.getMonth() === endDate.getMonth() && 
      startDate.getFullYear() === endDate.getFullYear()) {
    const month = startDate.toLocaleDateString('es-PE', { month: 'long', timeZone: LIMA_TIMEZONE });
    const year = startDate.getFullYear();
    return `${startDate.getDate()} - ${endDate.getDate()} de ${month} ${year}`;
  }
  
  // Rango completo
  return `${start} - ${end}`;
}

/**
 * Calcula la diferencia en días entre dos fechas
 * @param date1 - Primera fecha
 * @param date2 - Segunda fecha
 * @returns Número de días de diferencia
 */
export function daysDifference(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000; // horas * minutos * segundos * milisegundos
  const diffMs = Math.abs(date1.getTime() - date2.getTime());
  return Math.round(diffMs / oneDay);
}

/**
 * Verifica si una fecha es hoy
 * @param date - Date objeto a verificar
 * @returns true si la fecha es hoy
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, getCurrentDateLima());
}

/**
 * Verifica si una fecha es de esta semana
 * @param date - Date objeto a verificar
 * @returns true si la fecha está en la semana actual
 */
export function isThisWeek(date: Date): boolean {
  const now = getCurrentDateLima();
  const weekStart = getMonday(now);
  const weekEnd = getSunday(now);
  
  return date >= weekStart && date <= weekEnd;
}

/**
 * Obtiene un arreglo de fechas entre dos fechas
 * @param startDate - Fecha de inicio
 * @param endDate - Fecha de fin
 * @returns Array de fechas
 */
export function getDatesBetween(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
}

/**
 * Convierte una hora string (HH:MM) a minutos desde medianoche
 * @param timeString - Hora en formato HH:MM
 * @returns Minutos desde medianoche
 */
export function timeStringToMinutes(timeString: string): number {
  if (!timeString || !timeString.includes(':')) return 0;
  
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Convierte minutos desde medianoche a hora string (HH:MM)
 * @param minutes - Minutos desde medianoche
 * @returns Hora en formato HH:MM
 */
export function minutesToTimeString(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

/**
 * Valida si una fecha string es válida
 * @param dateString - String de fecha a validar
 * @returns true si la fecha es válida
 */
export function isValidDate(dateString: string): boolean {
  if (!dateString) return false;
  
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Obtiene el nombre del día de la semana
 * @param date - Date objeto
 * @param short - Si debe ser la versión corta
 * @returns Nombre del día en español
 */
export function getDayName(date: Date, short: boolean = false): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: short ? 'short' : 'long',
    timeZone: LIMA_TIMEZONE
  };
  
  return date.toLocaleDateString('es-PE', options);
}

/**
 * Obtiene el nombre del mes
 * @param date - Date objeto
 * @param short - Si debe ser la versión corta
 * @returns Nombre del mes en español
 */
export function getMonthName(date: Date, short: boolean = false): string {
  const options: Intl.DateTimeFormatOptions = {
    month: short ? 'short' : 'long',
    timeZone: LIMA_TIMEZONE
  };
  
  return date.toLocaleDateString('es-PE', options);
}