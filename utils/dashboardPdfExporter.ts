// utils/dashboardPdfExporter.ts
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportDashboardToPDF = async (
  elementId: string,
  fileName: string = 'resumen-semanal',
  options: {
    scale?: number;
    backgroundColor?: string;
    orientation?: 'portrait' | 'landscape';
    excludeSelectors?: string[];
  } = {}
) => {
  const {
    scale = 2,
    backgroundColor = '#ffffff',
    orientation = 'portrait',
    excludeSelectors = []
  } = options;

  try {
    // Obtener el elemento del dashboard
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Elemento no encontrado');
    }

    // Mostrar indicador de carga
    const loadingDiv = document.createElement('div');
    loadingDiv.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
      ">
        <div style="
          background: white;
          padding: 20px 40px;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          text-align: center;
        ">
          <div style="
            width: 50px;
            height: 50px;
            border: 5px solid #f3f3f3;
            border-top: 5px solid #1a56db;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 15px;
          "></div>
          <p style="margin: 0; color: #1a365d; font-weight: 600;">Generando PDF...</p>
          <p style="margin: 5px 0 0; color: #64748b; font-size: 14px;">Esto puede tomar unos segundos</p>
        </div>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
    document.body.appendChild(loadingDiv);

    // Clonar el elemento para modificarlo
    const clonedElement = element.cloneNode(true) as HTMLElement;
    
    // Ocultar elementos que no queremos en el PDF
    const selectorsToHide = [
      '.flex.justify-between.items-center.mb-6', // Header con controles
      '#dashboard-controls', // Controles del dashboard
      '.bg-\\[\\#eff6ff\\]', // Banner de información de período
      ...excludeSelectors
    ];

    selectorsToHide.forEach(selector => {
      const elements = clonedElement.querySelectorAll(selector);
      elements.forEach(el => {
        (el as HTMLElement).style.display = 'none';
      });
    });

    // Crear un contenedor temporal
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.width = '1200px'; // Ancho fijo para mejor control
    tempContainer.appendChild(clonedElement);
    document.body.appendChild(tempContainer);

    // Capturar el elemento como canvas
    const canvas = await html2canvas(clonedElement, {
      scale: scale,
      backgroundColor: backgroundColor,
      logging: false,
      useCORS: true,
      allowTaint: true,
      windowWidth: 1200,
      windowHeight: clonedElement.scrollHeight
    });

    // Remover el contenedor temporal
    document.body.removeChild(tempContainer);

    // Crear el PDF con mejor ajuste para A4
    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: 'a4'
    });

    // Dimensiones A4 en mm
    const pageWidth = orientation === 'portrait' ? 210 : 297;
    const pageHeight = orientation === 'portrait' ? 297 : 210;
    
    // Márgenes
    const marginTop = 15;
    const marginBottom = 15;
    const marginLeft = 10;
    const marginRight = 10;
    
    // Área de contenido
    const contentWidth = pageWidth - marginLeft - marginRight;
    const contentHeight = pageHeight - marginTop - marginBottom;
    
    // Calcular la escala para ajustar el contenido
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const scale1 = contentWidth / imgWidth;
    const scale2 = contentHeight / imgHeight;
    const finalScale = Math.min(scale1, scale2) * 0.95; // 95% para dar un poco de espacio
    
    const scaledWidth = imgWidth * finalScale;
    const scaledHeight = imgHeight * finalScale;
    
    // Calcular posición para centrar
    const xOffset = marginLeft + (contentWidth - scaledWidth) / 2;
    const yOffset = marginTop;

    // Si el contenido cabe en una página
    if (scaledHeight <= contentHeight) {
      // Agregar título personalizado
      pdf.setFillColor(26, 86, 219);
      pdf.rect(0, 0, pageWidth, 30, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(18);
      pdf.text('RESUMEN DE PRODUCTIVIDAD', pageWidth / 2, 12, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.text('Sistema de Control de Despachos', pageWidth / 2, 20, { align: 'center' });
      
      pdf.setFontSize(10);
      pdf.text(
        `Generado el ${new Date().toLocaleDateString('es-ES', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric'
        })}`,
        pageWidth / 2, 
        26, 
        { align: 'center' }
      );
      
      // Agregar el contenido del dashboard
      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        xOffset,
        35, // Dejar espacio para el header
        scaledWidth,
        scaledHeight
      );
      
      // Agregar número de página
      pdf.setTextColor(100, 116, 139);
      pdf.setFontSize(8);
      pdf.text(`Página 1 de 1`, pageWidth / 2, pageHeight - 5, { align: 'center' });
    } else {
      // Si necesita múltiples páginas
      const pagesNeeded = Math.ceil(scaledHeight / (contentHeight - 40)); // 40mm para header en primera página
      
      for (let i = 0; i < pagesNeeded; i++) {
        if (i > 0) {
          pdf.addPage();
        }
        
        if (i === 0) {
          // Primera página con header
          pdf.setFillColor(26, 86, 219);
          pdf.rect(0, 0, pageWidth, 30, 'F');
          
          pdf.setTextColor(255, 255, 255);
          pdf.setFontSize(18);
          pdf.text('RESUMEN DE PRODUCTIVIDAD', pageWidth / 2, 12, { align: 'center' });
          
          pdf.setFontSize(12);
          pdf.text('Sistema de Control de Despachos', pageWidth / 2, 20, { align: 'center' });
          
          pdf.setFontSize(10);
          pdf.text(
            `Generado el ${new Date().toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric'
            })}`,
            pageWidth / 2, 
            26, 
            { align: 'center' }
          );
        }
        
        // Calcular qué parte del canvas mostrar
        const sourceY = i === 0 ? 0 : (contentHeight - 40) + (i - 1) * contentHeight;
        const sourceHeight = i === 0 ? (contentHeight - 40) : contentHeight;
        const destY = i === 0 ? 35 : marginTop;
        
        // Crear un canvas parcial
        const partCanvas = document.createElement('canvas');
        partCanvas.width = canvas.width;
        partCanvas.height = sourceHeight / finalScale;
        
        const ctx = partCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(
            canvas,
            0, sourceY / finalScale, canvas.width, partCanvas.height,
            0, 0, canvas.width, partCanvas.height
          );
          
          pdf.addImage(
            partCanvas.toDataURL('image/png'),
            'PNG',
            xOffset,
            destY,
            scaledWidth,
            sourceHeight
          );
        }
        
        // Agregar número de página
        pdf.setTextColor(100, 116, 139);
        pdf.setFontSize(8);
        pdf.text(`Página ${i + 1} de ${pagesNeeded}`, pageWidth / 2, pageHeight - 5, { align: 'center' });
      }
    }

    // Agregar metadatos
    pdf.setProperties({
      title: 'Resumen de Productividad - Sistema de Control de Despachos',
      subject: 'Análisis de productividad y estadísticas',
      author: 'Sistema de Control de Despachos',
      keywords: 'despachos, reporteros, estadísticas, productividad',
      creator: 'SCD'
    });

    // Eliminar indicador de carga
    document.body.removeChild(loadingDiv);

    // Guardar el PDF
    const fecha = new Date().toISOString().split('T')[0];
    pdf.save(`${fileName}_${fecha}.pdf`);

    return true;
  } catch (error) {
    console.error('Error al generar PDF:', error);
    
    // Eliminar indicador de carga si existe
    const loadingDiv = document.querySelector('div[style*="position: fixed"]');
    if (loadingDiv && loadingDiv.parentNode) {
      loadingDiv.parentNode.removeChild(loadingDiv);
    }
    
    throw error;
  }
};

// Función específica para exportar el resumen semanal
export const exportResumenSemanalPDF = async (periodo: string, fechas: string) => {
  const fileName = `resumen-${periodo.toLowerCase()}`;
  
  try {
    await exportDashboardToPDF('dashboard-content', fileName, {
      orientation: 'portrait',
      scale: 2,
      excludeSelectors: [
        '.flex.gap-4.items-center', // Controles de período
        'button', // Todos los botones
        'select', // Todos los selectores
        '.flex.bg-\\[\\#f1f5f9\\]' // Botones de tipo de semana
      ]
    });
  } catch (error) {
    console.error('Error al exportar resumen:', error);
    throw error;
  }
};