import PDFDocument from 'pdfkit';

/**
 * Generates a PDF document from a report
 * @param report The report object with all related data
 * @returns A buffer containing the PDF document
 */
export async function generatePDF(report: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      // Create a new PDF document
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: 'Informe de Evaluación Psicológica',
          Author: `${report.createdBy.firstName} ${report.createdBy.lastName}`,
          Subject: `Informe para ${report.assessment.patient.firstName} ${report.assessment.patient.lastName}`,
          Keywords: 'informe, psicología, evaluación',
          CreationDate: new Date(),
        },
      });

      // Create a buffer to store the PDF
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      // Add header
      doc
        .font('Helvetica-Bold')
        .fontSize(18)
        .text('INFORME DE EVALUACIÓN PSICOLÓGICA', { align: 'center' });

      // Add horizontal line
      doc
        .moveTo(50, 80)
        .lineTo(550, 80)
        .strokeColor('#4682B4')
        .stroke();

      // Add patient information section
      doc
        .moveDown(2)
        .font('Helvetica-Bold')
        .fontSize(12)
        .text('DATOS DEL PACIENTE');

      const patient = report.assessment.patient;
      const clinician = report.assessment.clinician;
      const clinic = report.assessment.clinic;

      doc
        .moveDown(0.5)
        .font('Helvetica')
        .fontSize(10)
        .text(`Nombre: ${patient.firstName} ${patient.lastName}`)
        .text(`Fecha de Nacimiento: ${formatDate(patient.dateOfBirth)}`)
        .text(`Email: ${patient.contactEmail}`)
        .text(`Teléfono: ${patient.contactPhone || 'No disponible'}`);

      // Add clinical information section
      doc
        .moveDown(1)
        .font('Helvetica-Bold')
        .fontSize(12)
        .text('INFORMACIÓN CLÍNICA');

      doc
        .moveDown(0.5)
        .font('Helvetica')
        .fontSize(10)
        .text(`Clínica: ${clinic.name}`)
        .text(`Psicólogo: ${clinician.firstName} ${clinician.lastName}`)
        .text(`Fecha de Evaluación: ${formatDate(report.createdAt)}`);

      // Add report content
      doc
        .moveDown(2)
        .font('Helvetica')
        .fontSize(10);

      // Parse the report text and format it
      const sections = parseReportSections(report.reportText);
      
      sections.forEach(section => {
        if (section.isHeader) {
          doc
            .moveDown(1)
            .font('Helvetica-Bold')
            .fontSize(12)
            .text(section.text.toUpperCase());
        } else {
          doc
            .moveDown(0.5)
            .font('Helvetica')
            .fontSize(10)
            .text(section.text, {
              align: 'justify',
              lineGap: 2,
            });
        }
      });

      // Add footer
      const totalPages = doc.bufferedPageRange().count;
      for (let i = 0; i < totalPages; i++) {
        doc.switchToPage(i);
        
        // Save the current position
        const originalY = doc.y;
        
        // Move to the bottom of the page
        doc.y = doc.page.height - 50;
        
        doc
          .font('Helvetica-Oblique')
          .fontSize(8)
          .text(
            `Informe generado el ${formatDate(new Date())} - Página ${i + 1} de ${totalPages}`,
            { align: 'center' }
          );
        
        // Add confidentiality notice on the last page
        if (i === totalPages - 1) {
          doc
            .moveDown(1)
            .font('Helvetica-Oblique')
            .fontSize(8)
            .text(
              'Este informe es de carácter confidencial y debe ser utilizado sólo por profesionales de la salud mental autorizados.',
              { align: 'center' }
            );
        }
        
        // Restore the position
        doc.y = originalY;
      }

      // Finalize the PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Formats a date as DD/MM/YYYY
 * @param date The date to format
 * @returns The formatted date string
 */
function formatDate(date: Date | string): string {
  const d = new Date(date);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
}

/**
 * Parses the report text into sections
 * @param reportText The report text to parse
 * @returns An array of sections with isHeader flag
 */
function parseReportSections(reportText: string): { text: string; isHeader: boolean }[] {
  const lines = reportText.split('\n');
  const sections: { text: string; isHeader: boolean }[] = [];
  
  let currentSection = '';
  let isHeader = false;
  
  for (const line of lines) {
    // Check if this is a header line (starts with # or ##)
    if (line.startsWith('# ') || line.startsWith('## ')) {
      // If we have accumulated text, add it as a section
      if (currentSection) {
        sections.push({
          text: currentSection.trim(),
          isHeader,
        });
      }
      
      // Start a new section with the header
      currentSection = line.replace(/^#+ /, '');
      isHeader = true;
    } else {
      // If we haven't started a section yet, start one
      if (!currentSection) {
        currentSection = line;
        isHeader = false;
      } else if (isHeader) {
        // If the previous line was a header, add it as a section and start a new one
        sections.push({
          text: currentSection.trim(),
          isHeader: true,
        });
        currentSection = line;
        isHeader = false;
      } else {
        // Otherwise, append to the current section
        currentSection += '\n' + line;
      }
    }
  }
  
  // Add the last section
  if (currentSection) {
    sections.push({
      text: currentSection.trim(),
      isHeader,
    });
  }
  
  return sections;
}
