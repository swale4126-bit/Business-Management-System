import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const exportToPDF = (title, columns, data, filename) => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Generated on ${new Date().toLocaleString()}`, 14, 30);

  doc.autoTable({
    startY: 40,
    head: [columns.map(col => col.header)],
    body: data.map(row => columns.map(col => {
      const val = row[col.key];
      return col.format ? col.format(val) : val;
    })),
    theme: 'grid',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [79, 70, 229] }
  });

  doc.save(`${filename}.pdf`);
};

export const exportToExcel = (title, columns, data, filename) => {
  const formattedData = data.map(row => {
    const formattedRow = {};
    columns.forEach(col => {
      const val = row[col.key];
      formattedRow[col.header] = col.format ? col.format(val) : val;
    });
    return formattedRow;
  });

  const ws = XLSX.utils.json_to_sheet(formattedData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data');
  
  XLSX.writeFile(wb, `${filename}.xlsx`);
};
