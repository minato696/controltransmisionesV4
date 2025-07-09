// utils/pdfExporter.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCityName } from './cityUtils';

// Configuración de colores corporativos
const colors = {
  primary: '#1a56db',
  primaryDark: '#1e429f',
  gray: '#64748b',
  dark: '#1e293b',
  border: '#e2e8f0',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444'
};

// Función principal para exportar despachos por reportero
export const exportDespachosReportero = (
  reportero: any,
  despachos: any[],
  fechaInicio: Date,
  fechaFin: Date
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  let yPosition = 20;

  // Header con logo/título
  doc.setFillColor(26, 86, 219); // primary color
  doc.rect(0, 0, pageWidth, 30, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORME DE DESPACHOS', pageWidth / 2, 15, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generado el ${new Date().toLocaleDateString('es-ES')}`, pageWidth / 2, 22, { align: 'center' });

  yPosition = 45;

  // Información del reportero
  doc.setTextColor(30, 41, 59); // dark color
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Información del Reportero', 14, yPosition);
  
  yPosition += 10;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139); // gray color
  
  const infoReportero = [
    ['Nombre:', reportero.nombre],
    ['Ciudad:', formatCityName(reportero.ciudad?.nombre || reportero.ciudad)],
    ['Estado:', reportero.estado || 'Activo'],
    ['Período:', `${fechaInicio.toLocaleDateString('es-ES')} - ${fechaFin.toLocaleDateString('es-ES')}`],
    ['Total despachos:', despachos.length.toString()]
  ];

  infoReportero.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 14, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 50, yPosition);
    yPosition += 7;
  });

  yPosition += 10;

  // Línea divisora
  doc.setDrawColor(226, 232, 240); // border color
  doc.line(14, yPosition, pageWidth - 14, yPosition);
  yPosition += 15;

  // Título de la tabla
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Detalle de Despachos', 14, yPosition);
  yPosition += 10;

  // Tabla de despachos
  const tableData = despachos.map((despacho, index) => [
    (index + 1).toString(),
    new Date(despacho.fecha_despacho || despacho.fecha).toLocaleDateString('es-ES'),
    despacho.numero_despacho?.toString() || '-',
    despacho.titulo || 'Sin título',
    despacho.hora_despacho || '-',
    despacho.hora_en_vivo || '-',
    despacho.estado || 'Programado'
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [['#', 'Fecha', 'N°', 'Título', 'Hora', 'En Vivo', 'Estado']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [26, 86, 219],
      textColor: 255,
      fontSize: 10,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [30, 41, 59]
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 25 },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 'auto' },
      4: { cellWidth: 20, halign: 'center' },
      5: { cellWidth: 20, halign: 'center' },
      6: { cellWidth: 25, halign: 'center' }
    },
    didDrawCell: (data) => {
      // Colorear el estado según su valor
      if (data.column.index === 6 && data.cell.section === 'body') {
        const estado = data.cell.text[0].toLowerCase();
        if (estado === 'completado') {
          doc.setTextColor(16, 185, 129); // success
        } else if (estado === 'problema') {
          doc.setTextColor(239, 68, 68); // danger
        } else {
          doc.setTextColor(59, 130, 246); // info
        }
      }
    }
  });

  // Footer
  const finalY = (doc as any).lastAutoTable.finalY || yPosition + 50;
  
  if (finalY + 40 > pageHeight - 20) {
    doc.addPage();
    yPosition = 20;
  } else {
    yPosition = finalY + 20;
  }

  // Resumen estadístico
  doc.setDrawColor(226, 232, 240);
  doc.line(14, yPosition, pageWidth - 14, yPosition);
  yPosition += 10;

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumen Estadístico', 14, yPosition);
  yPosition += 10;

  const totalDespachos = despachos.length;
  const despachosEnVivo = despachos.filter(d => d.hora_en_vivo).length;
  const porcentajeEnVivo = totalDespachos > 0 ? ((despachosEnVivo / totalDespachos) * 100).toFixed(1) : '0';

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`• Total de despachos: ${totalDespachos}`, 20, yPosition);
  yPosition += 6;
  doc.text(`• Despachos en vivo: ${despachosEnVivo} (${porcentajeEnVivo}%)`, 20, yPosition);
  yPosition += 6;
  doc.text(`• Promedio diario: ${(totalDespachos / 7).toFixed(1)} despachos`, 20, yPosition);

  // Pie de página
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Sistema de Control de Despachos', pageWidth / 2, pageHeight - 10, { align: 'center' });

  // Guardar el PDF
  doc.save(`Informe_${reportero.nombre.replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
};

// Función para exportar resumen de ciudad
export const exportResumenCiudad = (
  ciudad: string,
  reporteros: any[],
  despachos: any[],
  periodo: string
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  let yPosition = 20;

  // Header
  doc.setFillColor(26, 86, 219);
  doc.rect(0, 0, pageWidth, 30, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('RESUMEN DE CIUDAD', pageWidth / 2, 15, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(formatCityName(ciudad), pageWidth / 2, 22, { align: 'center' });

  yPosition = 45;

  // Información general
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Información General', 14, yPosition);
  
  yPosition += 10;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  
  doc.text(`Ciudad: ${formatCityName(ciudad)}`, 14, yPosition);
  yPosition += 7;
  doc.text(`Período: ${periodo}`, 14, yPosition);
  yPosition += 7;
  doc.text(`Total de reporteros: ${reporteros.length}`, 14, yPosition);
  yPosition += 7;
  doc.text(`Total de despachos: ${despachos.length}`, 14, yPosition);
  yPosition += 15;

  // Tabla de reporteros con sus estadísticas
  const reporterosData = reporteros.map(reportero => {
    const despachosReportero = despachos.filter(d => d.reportero_id === reportero.id);
    const despachosEnVivo = despachosReportero.filter(d => d.hora_en_vivo).length;
    
    return [
      reportero.nombre,
      despachosReportero.length.toString(),
      despachosEnVivo.toString(),
      reportero.estado || 'Activo'
    ];
  });

  autoTable(doc, {
    startY: yPosition,
    head: [['Reportero', 'Total Despachos', 'En Vivo', 'Estado']],
    body: reporterosData,
    theme: 'grid',
    headStyles: {
      fillColor: [26, 86, 219],
      textColor: 255,
      fontSize: 10,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [30, 41, 59]
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    }
  });

  // Gráfico de barras simple (representación textual)
  const finalY = (doc as any).lastAutoTable.finalY || yPosition + 50;
  yPosition = finalY + 20;

  if (yPosition + 60 > pageHeight - 20) {
    doc.addPage();
    yPosition = 20;
  }

  // Estadísticas finales
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Análisis de Rendimiento', 14, yPosition);
  yPosition += 10;

  const totalDespachos = despachos.length;
  const despachosEnVivo = despachos.filter(d => d.hora_en_vivo).length;
  const promedioPorReportero = reporteros.length > 0 ? (totalDespachos / reporteros.length).toFixed(1) : '0';

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`• Promedio de despachos por reportero: ${promedioPorReportero}`, 20, yPosition);
  yPosition += 6;
  doc.text(`• Porcentaje de despachos en vivo: ${((despachosEnVivo / totalDespachos) * 100).toFixed(1)}%`, 20, yPosition);

  // Pie de página
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generado el ${new Date().toLocaleDateString('es-ES')} - Sistema de Control de Despachos`, 
    pageWidth / 2, pageHeight - 10, { align: 'center' });

  doc.save(`Resumen_${formatCityName(ciudad)}_${new Date().toISOString().split('T')[0]}.pdf`);
};

// Función para exportar estadísticas generales
export const exportEstadisticasGenerales = (estadisticas: any) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  let yPosition = 20;

  // Header elegante
  doc.setFillColor(26, 86, 219);
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORME ESTADÍSTICO', pageWidth / 2, 18, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Sistema de Control de Despachos', pageWidth / 2, 28, { align: 'center' });

  yPosition = 50;

  // KPIs principales en cajas
  const kpis = [
    { label: 'Total Despachos', value: estadisticas.totalDespachos, color: colors.primary },
    { label: 'Promedio Diario', value: estadisticas.promedioDespachosDiarios.toFixed(1), color: colors.success },
    { label: 'Reporteros Activos', value: estadisticas.reporterosActivos, color: colors.warning },
    { label: 'Cobertura Nacional', value: `${estadisticas.coberturaNacional.toFixed(1)}%`, color: colors.primary }
  ];

  // Dibujar KPI boxes
  const boxWidth = 40;
  const boxHeight = 25;
  const startX = (pageWidth - (boxWidth * 4 + 30)) / 2;

  kpis.forEach((kpi, index) => {
    const x = startX + (index * (boxWidth + 10));
    
    // Caja con sombra
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, yPosition, boxWidth, boxHeight, 3, 3, 'FD');
    
    // Título del KPI
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, x + boxWidth/2, yPosition + 8, { align: 'center' });
    
    // Valor del KPI
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(kpi.value.toString(), x + boxWidth/2, yPosition + 18, { align: 'center' });
  });

  yPosition += boxHeight + 20;

  // Top 5 Ciudades
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Top 5 Ciudades por Despachos', 14, yPosition);
  yPosition += 10;

  const ciudadesData = estadisticas.topCiudades.map((ciudad: any, index: number) => [
    (index + 1).toString(),
    ciudad.nombre,
    ciudad.despachos.toString(),
    `${ciudad.porcentaje}%`
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [['Ranking', 'Ciudad', 'Despachos', 'Porcentaje']],
    body: ciudadesData,
    theme: 'striped',
    headStyles: {
      fillColor: [26, 86, 219],
      textColor: 255,
      fontSize: 10
    },
    bodyStyles: {
      fontSize: 9
    },
    columnStyles: {
      0: { cellWidth: 20, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 30, halign: 'center' },
      3: { cellWidth: 30, halign: 'center' }
    }
  });

  // Top 5 Reporteros
  yPosition = (doc as any).lastAutoTable.finalY + 20;
  
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Top 5 Reporteros', 14, yPosition);
  yPosition += 10;

  const reporterosData = estadisticas.topReporteros.map((reportero: any, index: number) => [
    (index + 1).toString(),
    reportero.nombre,
    reportero.ciudad,
    reportero.despachos.toString(),
    `${reportero.porcentaje}%`
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [['Ranking', 'Reportero', 'Ciudad', 'Despachos', 'Porcentaje']],
    body: reporterosData,
    theme: 'striped',
    headStyles: {
      fillColor: [26, 86, 219],
      textColor: 255,
      fontSize: 10
    },
    bodyStyles: {
      fontSize: 9
    },
    columnStyles: {
      0: { cellWidth: 20, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 40 },
      3: { cellWidth: 25, halign: 'center' },
      4: { cellWidth: 25, halign: 'center' }
    }
  });

  // Pie de página con fecha y hora
  const now = new Date();
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Generado el ${now.toLocaleDateString('es-ES')} a las ${now.toLocaleTimeString('es-ES')}`, 
    pageWidth / 2, 
    pageHeight - 10, 
    { align: 'center' }
  );

  doc.save(`Estadisticas_Generales_${now.toISOString().split('T')[0]}.pdf`);
};

// Función para exportar despachos por fecha
export const exportDespachosPorFecha = (fecha: Date, despachos: any[]) => {
  const doc = new jsPDF('landscape'); // Orientación horizontal para más espacio
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  let yPosition = 20;

  // Header
  doc.setFillColor(26, 86, 219);
  doc.rect(0, 0, pageWidth, 30, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('DESPACHOS DEL DÍA', pageWidth / 2, 15, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(fecha.toLocaleDateString('es-ES', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }), pageWidth / 2, 23, { align: 'center' });

  yPosition = 45;

  // Agrupar despachos por ciudad
  const despachosPorCiudad = despachos.reduce((acc: any, despacho) => {
    const ciudad = despacho.reportero?.ciudad?.nombre || 'Sin ciudad';
    if (!acc[ciudad]) acc[ciudad] = [];
    acc[ciudad].push(despacho);
    return acc;
  }, {});

  // Para cada ciudad
  Object.entries(despachosPorCiudad).forEach(([ciudad, despachosArray]: [string, any]) => {
    if (yPosition + 40 > pageHeight - 20) {
      doc.addPage();
      yPosition = 20;
    }

    // Título de ciudad
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCityName(ciudad), 14, yPosition);
    yPosition += 8;

    // Tabla de despachos de esa ciudad
    const tableData = despachosArray.map((despacho: any) => [
      despacho.reportero?.nombre || 'Sin reportero',
      despacho.numero_despacho?.toString() || '-',
      despacho.titulo || 'Sin título',
      despacho.hora_despacho || '-',
      despacho.hora_en_vivo || '-',
      despacho.estado || 'Programado'
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Reportero', 'N°', 'Título', 'Hora', 'En Vivo', 'Estado']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [241, 245, 249],
        textColor: [30, 41, 59],
        fontSize: 9,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [30, 41, 59]
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 15, halign: 'center' },
        2: { cellWidth: 'auto' },
        3: { cellWidth: 25, halign: 'center' },
        4: { cellWidth: 25, halign: 'center' },
        5: { cellWidth: 30, halign: 'center' }
      }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  });

  // Resumen final
  if (yPosition + 30 > pageHeight - 20) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setDrawColor(226, 232, 240);
  doc.line(14, yPosition, pageWidth - 14, yPosition);
  yPosition += 10;

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumen del día:', 14, yPosition);
  yPosition += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Total de despachos: ${despachos.length}`, 20, yPosition);
  yPosition += 5;
  doc.text(`Ciudades cubiertas: ${Object.keys(despachosPorCiudad).length}`, 20, yPosition);
  yPosition += 5;
  doc.text(`Despachos en vivo: ${despachos.filter(d => d.hora_en_vivo).length}`, 20, yPosition);

  doc.save(`Despachos_${fecha.toISOString().split('T')[0]}.pdf`);
};