import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Generic CSV Export
export const exportToCSV = <T extends object>(
  data: T[],
  headers: { key: keyof T | string; label: string }[],
  filename: string
): void => {
  const headerRow = headers.map(h => `"${h.label}"`).join(',');
  const dataRows = data.map(row =>
    headers.map(h => {
      const value = (row as Record<string, unknown>)[h.key as string];
      // Handle arrays, objects, and escape quotes
      if (Array.isArray(value)) {
        return `"${value.join('; ')}"`;
      }
      if (typeof value === 'object' && value !== null) {
        return `"${JSON.stringify(value)}"`;
      }
      return `"${String(value ?? '').replace(/"/g, '""')}"`;
    }).join(',')
  );

  const csvContent = [headerRow, ...dataRows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
};

// Generic PDF Export with Table
export const exportToPDF = <T extends object>(
  data: T[],
  headers: { key: keyof T | string; label: string }[],
  title: string,
  filename: string,
  options?: {
    orientation?: 'portrait' | 'landscape';
    subtitle?: string;
  }
): void => {
  const doc = new jsPDF({
    orientation: options?.orientation || 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Add title
  doc.setFontSize(18);
  doc.setTextColor(34, 139, 34); // Forest green
  doc.text(title, 14, 20);

  // Add subtitle if provided
  if (options?.subtitle) {
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(options.subtitle, 14, 28);
  }

  // Add generation date
  doc.setFontSize(10);
  doc.setTextColor(128);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, options?.subtitle ? 35 : 28);

  // Prepare table data
  const tableHeaders = headers.map(h => h.label);
  const tableData = data.map(row =>
    headers.map(h => {
      const value = (row as Record<string, unknown>)[h.key as string];
      if (Array.isArray(value)) {
        return value.join(', ');
      }
      if (typeof value === 'number') {
        return value.toLocaleString();
      }
      return String(value ?? '');
    })
  );

  // Add table
  autoTable(doc, {
    head: [tableHeaders],
    body: tableData,
    startY: options?.subtitle ? 42 : 35,
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [34, 139, 34],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { left: 14, right: 14 },
  });

  // Save PDF
  doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
};

// Payslip PDF Generator
export interface PayslipData {
  employeeId: string;
  employeeName: string;
  email: string;
  payPeriod: string;
  paymentDate: string;
  paymentMethod: string;
  baseHarvest: number;
  baseRate: number;
  grossPay: number;
  qualityBonus: number;
  deductions: number;
  netPay: number;
}

export const generatePayslipPDF = (payslip: PayslipData): void => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Company Header
  doc.setFillColor(34, 139, 34);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setFontSize(24);
  doc.setTextColor(255);
  doc.text('SAPSENSE', 14, 18);
  
  doc.setFontSize(12);
  doc.text('Coconut Sap Management System', 14, 26);
  doc.text('PAYSLIP', 14, 34);

  // Employee Information
  doc.setTextColor(0);
  doc.setFontSize(12);
  doc.text('Employee Information', 14, 55);
  
  doc.setFontSize(10);
  doc.setTextColor(80);
  doc.text(`Name: ${payslip.employeeName}`, 14, 63);
  doc.text(`Employee ID: ${payslip.employeeId}`, 14, 70);
  doc.text(`Email: ${payslip.email}`, 14, 77);

  // Pay Period Info
  doc.setTextColor(0);
  doc.setFontSize(12);
  doc.text('Pay Period Details', 120, 55);
  
  doc.setFontSize(10);
  doc.setTextColor(80);
  doc.text(`Period: ${payslip.payPeriod}`, 120, 63);
  doc.text(`Payment Date: ${payslip.paymentDate}`, 120, 70);
  doc.text(`Method: ${payslip.paymentMethod}`, 120, 77);

  // Earnings Section
  doc.setDrawColor(34, 139, 34);
  doc.setLineWidth(0.5);
  doc.line(14, 90, 196, 90);

  doc.setTextColor(0);
  doc.setFontSize(12);
  doc.text('Earnings', 14, 100);

  // Earnings Table
  autoTable(doc, {
    startY: 105,
    head: [['Description', 'Quantity/Rate', 'Amount (₱)']],
    body: [
      ['Base Harvest Pay', `${payslip.baseHarvest}L`, payslip.grossPay.toLocaleString()],
      ['Quality Bonus', 'Performance', `+${payslip.qualityBonus.toLocaleString()}`],
    ],
    styles: { fontSize: 10 },
    headStyles: { fillColor: [34, 139, 34] },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 50, halign: 'center' },
      2: { cellWidth: 50, halign: 'right' },
    },
    margin: { left: 14, right: 14 },
  });

  // Deductions Section
  const earningsEndY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  
  doc.setTextColor(0);
  doc.setFontSize(12);
  doc.text('Deductions', 14, earningsEndY);

  autoTable(doc, {
    startY: earningsEndY + 5,
    head: [['Description', 'Amount (₱)']],
    body: [
      ['Total Deductions', `-${payslip.deductions.toLocaleString()}`],
    ],
    styles: { fontSize: 10 },
    headStyles: { fillColor: [220, 53, 69] },
    columnStyles: {
      0: { cellWidth: 130 },
      1: { cellWidth: 50, halign: 'right' },
    },
    margin: { left: 14, right: 14 },
  });

  // Net Pay Summary
  const deductionsEndY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
  
  doc.setFillColor(240, 240, 240);
  doc.rect(14, deductionsEndY, 182, 25, 'F');
  
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text('NET PAY', 20, deductionsEndY + 10);
  
  doc.setFontSize(20);
  doc.setTextColor(34, 139, 34);
  doc.text(`₱${payslip.netPay.toLocaleString()}`, 20, deductionsEndY + 20);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(128);
  doc.text('This is a computer-generated document. No signature required.', 14, 280);
  doc.text(`Generated on ${new Date().toLocaleString()}`, 14, 285);

  // Save
  doc.save(`payslip_${payslip.employeeId}_${payslip.payPeriod.replace(/\s/g, '_')}.pdf`);
};

// Batch export multiple payslips
export const generateAllPayslipsPDF = (payslips: PayslipData[]): void => {
  payslips.forEach((payslip, index) => {
    setTimeout(() => {
      generatePayslipPDF(payslip);
    }, index * 500); // Stagger downloads to prevent browser blocking
  });
};

// Export container/sensor data
export interface SensorExportData {
  id: string;
  name: string;
  ph: number;
  temperature: number;
  volume: number;
  humidity: number;
  batteryLevel: number;
  status: string;
  lastUpdate: Date | string;
}

export const exportSensorDataToCSV = (sensor: SensorExportData): void => {
  const headers = [
    { key: 'id', label: 'Container ID' },
    { key: 'name', label: 'Name' },
    { key: 'ph', label: 'pH Level' },
    { key: 'temperature', label: 'Temperature (°C)' },
    { key: 'volume', label: 'Volume (L)' },
    { key: 'humidity', label: 'Humidity (%)' },
    { key: 'batteryLevel', label: 'Battery (%)' },
    { key: 'status', label: 'Status' },
    { key: 'lastUpdate', label: 'Last Update' },
  ];

  const data = [{
    ...sensor,
    lastUpdate: sensor.lastUpdate instanceof Date 
      ? sensor.lastUpdate.toLocaleString() 
      : sensor.lastUpdate,
  }];

  exportToCSV(data, headers, `container_${sensor.id}_data`);
};

// Export disputes data
export interface DisputeExportData {
  id: string;
  farmerName: string;
  treeId: string;
  farmPH: number;
  plantPH: number;
  discrepancy: number;
  status: string;
  farmTimestamp: Date | string;
  plantTimestamp: Date | string;
}

export const exportDisputesToPDF = (
  disputes: DisputeExportData[],
  title: string = 'Dispute Resolution Report'
): void => {
  const headers = [
    { key: 'farmerName', label: 'Farmer' },
    { key: 'treeId', label: 'Tree' },
    { key: 'farmPH', label: 'Farm pH' },
    { key: 'plantPH', label: 'Plant pH' },
    { key: 'discrepancy', label: 'Discrepancy' },
    { key: 'status', label: 'Status' },
  ];

  const formattedDisputes = disputes.map(d => ({
    ...d,
    treeId: d.treeId.replace('container-', 'Tree '),
    discrepancy: d.discrepancy.toFixed(1),
  }));

  exportToPDF(formattedDisputes, headers, title, 'dispute_report', {
    orientation: 'landscape',
    subtitle: `Total Disputes: ${disputes.length}`,
  });
};

// Export quality reports
export interface QualityReportExportData {
  period: string;
  totalHarvest: number;
  acceptedSap: number;
  rejectedSap: number;
  avgPH: number;
  avgQuality: number;
  disputes: number;
}

export const exportQualityReportsToPDF = (
  reports: QualityReportExportData[]
): void => {
  const headers = [
    { key: 'period', label: 'Period' },
    { key: 'totalHarvest', label: 'Total (L)' },
    { key: 'acceptedSap', label: 'Accepted (L)' },
    { key: 'rejectedSap', label: 'Rejected (L)' },
    { key: 'avgPH', label: 'Avg pH' },
    { key: 'avgQuality', label: 'Quality' },
    { key: 'disputes', label: 'Disputes' },
  ];

  exportToPDF(reports, headers, 'Quality Reports Summary', 'quality_reports', {
    subtitle: `Reports: ${reports.length} periods`,
  });
};
