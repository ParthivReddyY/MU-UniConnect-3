/**
 * PDF export utilities for generating reports
 */
import jsPDF from 'jspdf';
// Import autoTable directly as a function
import autoTable from 'jspdf-autotable';

/**
 * Create a PDF with presentation grading report
 * @param {Object} presentation - The presentation object
 * @param {Object} stats - The grading statistics
 * @param {Array} exportData - The data to be included in the detailed table
 * @param {Function} formatDate - Function to format dates
 * @returns {jsPDF} The PDF document object
 */
export const createPresentationGradingPDF = (presentation, stats, exportData, formatDate) => {
  // Create a new document
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text(`Presentation Grading Report: ${presentation.title}`, 14, 20);
  
  // Add presentation details
  doc.setFontSize(12);
  doc.text(`Venue: ${presentation.venue}`, 14, 30);
  doc.text(`Period: ${formatDate(presentation.presentationPeriod?.start)} - ${formatDate(presentation.presentationPeriod?.end)}`, 14, 37);
  
  // Add statistics if available
  if (stats) {
    doc.setFontSize(14);
    doc.text('Grading Statistics', 14, 47);
    
    const statsData = [
      ['Total Graded', 'Average Score', 'Highest Score', 'Lowest Score'],
      [`${stats.totalGraded}`, `${stats.averageScore}`, `${stats.highestScore}`, `${stats.lowestScore}`]
    ];
    
    // Use autoTable as a function with doc as parameter
    autoTable(doc, {
      startY: 52,
      head: [statsData[0]],
      body: [statsData[1]],
      theme: 'grid'
    });
    
    // Get the ending Y position of the first table
    const firstTableEndY = doc.lastAutoTable.finalY;
    
    // Score distribution
    const distributionData = [
      ['Grade Range', 'Count', 'Percentage'],
      ['Excellent (90-100)', stats.excellent, `${Math.round(stats.excellent/stats.totalGraded*100)}%`],
      ['Very Good (80-89)', stats.veryGood, `${Math.round(stats.veryGood/stats.totalGraded*100)}%`],
      ['Good (70-79)', stats.good, `${Math.round(stats.good/stats.totalGraded*100)}%`],
      ['Average (60-69)', stats.average, `${Math.round(stats.average/stats.totalGraded*100)}%`],
      ['Below Average (<60)', stats.belowAverage, `${Math.round(stats.belowAverage/stats.totalGraded*100)}%`]
    ];
    
    doc.setFontSize(14);
    doc.text('Score Distribution', 14, firstTableEndY + 15);
    
    // Second table - using finalY from first table
    autoTable(doc, {
      startY: firstTableEndY + 20,
      head: [distributionData[0]],
      body: distributionData.slice(1),
      theme: 'grid'
    });
  }
  
  // Add detailed grading table
  if (exportData.length > 0) {
    doc.addPage();
    doc.setFontSize(14);
    doc.text('Detailed Grading Results', 14, 20);
    
    // Convert to appropriate format for autoTable
    const headers = Object.keys(exportData[0]);
    const data = exportData.map(row => headers.map(key => row[key]));
    
    autoTable(doc, {
      startY: 25,
      head: [headers],
      body: data,
      theme: 'grid',
      styles: { fontSize: 8 },
      columnStyles: { 0: { cellWidth: 20 } }
    });
  }
  
  return doc;
};

// A simple function to directly export the PDF without returning the doc
export const exportPresentationToPdf = (presentation, stats, exportData, formatDate, filename) => {
  try {
    const doc = createPresentationGradingPDF(
      presentation,
      stats,
      exportData,
      formatDate
    );
    
    // Save the PDF
    doc.save(filename || `${presentation.title}_Grading_Report.pdf`);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
};

const pdfUtils = {
  createPresentationGradingPDF,
  exportPresentationToPdf
};

export default pdfUtils;
