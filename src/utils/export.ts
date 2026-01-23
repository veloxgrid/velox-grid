/**
 * VeloxGrid Export Utilities
 * Phase 8: Excel Export/Import
 * 
 * @description Provides export functionality for Excel, CSV, and JSON formats
 */

import type { RowData, ColumnDefinition, ExportOptions, CellValue, ValueType } from '../types';
// formatValue can be used for custom formatting in future

// ============================================
// Types
// ============================================

export interface ExportContext {
  data: RowData[];
  displayData: RowData[];
  columns: ColumnDefinition[];
  selectedRows: number[];
  options: ExportOptions;
}

export interface ImportResult {
  data: RowData[];
  headers: string[];
  errors: string[];
}

// ============================================
// CSV Export
// ============================================

/**
 * Export data to CSV format
 */
export function exportToCSV(context: ExportContext): string {
  const { data, displayData, columns, selectedRows, options } = context;
  
  // Determine which columns to export
  const exportColumns = options.columns
    ? columns.filter(c => options.columns!.includes(c.field) && c.visible !== false)
    : columns.filter(c => c.visible !== false);
  
  // Determine which rows to export
  let rowsToExport: RowData[];
  if (options.selectedOnly && selectedRows.length > 0) {
    const sourceData = options.filteredOnly ? displayData : data;
    rowsToExport = selectedRows.map(i => sourceData[i]).filter(Boolean);
  } else if (options.filteredOnly) {
    rowsToExport = displayData;
  } else {
    rowsToExport = data;
  }
  
  const lines: string[] = [];
  
  // Add header row
  if (options.includeHeader !== false) {
    const headerRow = exportColumns.map(col => escapeCSVValue(col.header));
    lines.push(headerRow.join(','));
  }
  
  // Add data rows
  rowsToExport.forEach(row => {
    const values = exportColumns.map(col => {
      const value = row[col.field];
      return escapeCSVValue(formatExportValue(value, col.type));
    });
    lines.push(values.join(','));
  });
  
  return lines.join('\r\n');
}

/**
 * Escape a value for CSV format
 */
function escapeCSVValue(value: string | null | undefined): string {
  if (value === null || value === undefined) return '';
  
  const stringValue = String(value);
  
  // Check if value needs quoting
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n') || stringValue.includes('\r')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
}

// ============================================
// JSON Export
// ============================================

/**
 * Export data to JSON format
 */
export function exportToJSON(context: ExportContext): string {
  const { data, displayData, columns, selectedRows, options } = context;
  
  // Determine which columns to export
  const exportColumns = options.columns
    ? columns.filter(c => options.columns!.includes(c.field) && c.visible !== false)
    : columns.filter(c => c.visible !== false);
  
  // Determine which rows to export
  let rowsToExport: RowData[];
  if (options.selectedOnly && selectedRows.length > 0) {
    const sourceData = options.filteredOnly ? displayData : data;
    rowsToExport = selectedRows.map(i => sourceData[i]).filter(Boolean);
  } else if (options.filteredOnly) {
    rowsToExport = displayData;
  } else {
    rowsToExport = data;
  }
  
  // Filter columns for each row
  const result = rowsToExport.map(row => {
    const obj: RowData = {};
    exportColumns.forEach(col => {
      obj[col.field] = row[col.field];
    });
    return obj;
  });
  
  return JSON.stringify(result, null, 2);
}

// ============================================
// Excel Export (using SheetJS)
// ============================================

/**
 * Check if SheetJS is available
 */
export function isSheetJSAvailable(): boolean {
  return typeof (window as any).XLSX !== 'undefined';
}

/**
 * Get SheetJS library
 */
function getXLSX(): any {
  const XLSX = (window as any).XLSX;
  if (!XLSX) {
    throw new Error(
      'SheetJS (xlsx) library is not loaded. ' +
      'Please include it via CDN: <script src="https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js"></script>'
    );
  }
  return XLSX;
}

/**
 * Export data to Excel format
 */
export function exportToExcel(context: ExportContext): void {
  const XLSX = getXLSX();
  const { data, displayData, columns, selectedRows, options } = context;
  
  // Determine which columns to export
  const exportColumns = options.columns
    ? columns.filter(c => options.columns!.includes(c.field) && c.visible !== false)
    : columns.filter(c => c.visible !== false);
  
  // Determine which rows to export
  let rowsToExport: RowData[];
  if (options.selectedOnly && selectedRows.length > 0) {
    const sourceData = options.filteredOnly ? displayData : data;
    rowsToExport = selectedRows.map(i => sourceData[i]).filter(Boolean);
  } else if (options.filteredOnly) {
    rowsToExport = displayData;
  } else {
    rowsToExport = data;
  }
  
  // Build worksheet data
  const wsData: any[][] = [];
  
  // Add header row
  if (options.includeHeader !== false) {
    wsData.push(exportColumns.map(col => col.header));
  }
  
  // Add data rows
  rowsToExport.forEach(row => {
    const rowData = exportColumns.map(col => {
      const value = row[col.field];
      return formatExcelValue(value, col.type);
    });
    wsData.push(rowData);
  });
  
  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  
  // Set column widths
  const colWidths = exportColumns.map(col => ({
    wch: Math.max(
      col.header.length,
      ...rowsToExport.slice(0, 100).map(row => {
        const value = row[col.field];
        return String(value ?? '').length;
      })
    ) + 2
  }));
  ws['!cols'] = colWidths;
  
  // Create workbook
  const wb = XLSX.utils.book_new();
  const sheetName = options.sheetName || 'Sheet1';
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  
  // Generate filename
  const filename = (options.filename || 'export') + '.xlsx';
  
  // Write file
  XLSX.writeFile(wb, filename);
}

/**
 * Format value for Excel export
 */
function formatExcelValue(value: CellValue, type?: ValueType): any {
  if (value === null || value === undefined) return '';
  
  switch (type) {
    case 'number':
      return typeof value === 'number' ? value : parseFloat(String(value)) || 0;
    case 'boolean':
      return Boolean(value);
    case 'date':
    case 'datetime':
      if (value instanceof Date) return value;
      if (typeof value === 'string' || typeof value === 'number') {
        const date = new Date(value);
        return isNaN(date.getTime()) ? String(value) : date;
      }
      return String(value);
    default:
      return String(value);
  }
}

/**
 * Format value for general export
 */
function formatExportValue(value: CellValue, type?: ValueType): string {
  if (value === null || value === undefined) return '';
  
  switch (type) {
    case 'date':
      if (value instanceof Date) {
        return value.toISOString().split('T')[0];
      }
      return String(value);
    case 'datetime':
      if (value instanceof Date) {
        return value.toISOString();
      }
      return String(value);
    default:
      return String(value);
  }
}

// ============================================
// CSV Import
// ============================================

/**
 * Parse CSV string to data array
 */
export function parseCSV(csvString: string, hasHeader = true): ImportResult {
  const result: ImportResult = {
    data: [],
    headers: [],
    errors: []
  };
  
  try {
    const lines = parseCSVLines(csvString);
    
    if (lines.length === 0) {
      result.errors.push('CSV file is empty');
      return result;
    }
    
    let dataStartIndex = 0;
    
    if (hasHeader) {
      result.headers = lines[0];
      dataStartIndex = 1;
    } else {
      // Generate default headers
      const columnCount = lines[0]?.length || 0;
      result.headers = Array.from({ length: columnCount }, (_, i) => `Column${i + 1}`);
    }
    
    // Parse data rows
    for (let i = dataStartIndex; i < lines.length; i++) {
      const line = lines[i];
      const row: RowData = {};
      
      result.headers.forEach((header, colIndex) => {
        row[header] = line[colIndex] ?? '';
      });
      
      result.data.push(row);
    }
  } catch (error) {
    result.errors.push(`CSV parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  return result;
}

/**
 * Parse CSV string into lines and cells
 */
function parseCSVLines(csvString: string): string[][] {
  const lines: string[][] = [];
  let currentLine: string[] = [];
  let currentCell = '';
  let inQuotes = false;
  
  for (let i = 0; i < csvString.length; i++) {
    const char = csvString[i];
    const nextChar = csvString[i + 1];
    
    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          // Escaped quote
          currentCell += '"';
          i++;
        } else {
          // End of quoted field
          inQuotes = false;
        }
      } else {
        currentCell += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentLine.push(currentCell);
        currentCell = '';
      } else if (char === '\r') {
        // Skip carriage return
        continue;
      } else if (char === '\n') {
        currentLine.push(currentCell);
        if (currentLine.some(cell => cell.trim() !== '')) {
          lines.push(currentLine);
        }
        currentLine = [];
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
  }
  
  // Handle last cell/line
  if (currentCell !== '' || currentLine.length > 0) {
    currentLine.push(currentCell);
    if (currentLine.some(cell => cell.trim() !== '')) {
      lines.push(currentLine);
    }
  }
  
  return lines;
}

// ============================================
// Excel Import (using SheetJS)
// ============================================

/**
 * Import data from Excel file
 */
export function importFromExcel(file: File, sheetIndex = 0): Promise<ImportResult> {
  return new Promise((resolve) => {
    const result: ImportResult = {
      data: [],
      headers: [],
      errors: []
    };
    
    if (!isSheetJSAvailable()) {
      result.errors.push(
        'SheetJS (xlsx) library is not loaded. ' +
        'Please include it via CDN: <script src="https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js"></script>'
      );
      resolve(result);
      return;
    }
    
    const XLSX = getXLSX();
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get sheet
        const sheetNames = workbook.SheetNames;
        if (sheetIndex >= sheetNames.length) {
          result.errors.push(`Sheet index ${sheetIndex} not found. Available sheets: ${sheetNames.join(', ')}`);
          resolve(result);
          return;
        }
        
        const sheetName = sheetNames[sheetIndex];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        
        if (jsonData.length === 0) {
          result.errors.push('Excel sheet is empty');
          resolve(result);
          return;
        }
        
        // First row as headers
        result.headers = jsonData[0].map((h: any) => String(h ?? ''));
        
        // Data rows
        for (let i = 1; i < jsonData.length; i++) {
          const row: RowData = {};
          const rowData = jsonData[i];
          
          result.headers.forEach((header, colIndex) => {
            const value = rowData[colIndex];
            row[header] = value ?? '';
          });
          
          // Skip empty rows
          if (Object.values(row).some(v => v !== '')) {
            result.data.push(row);
          }
        }
        
        resolve(result);
      } catch (error) {
        result.errors.push(`Excel parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        resolve(result);
      }
    };
    
    reader.onerror = () => {
      result.errors.push('Failed to read file');
      resolve(result);
    };
    
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Import data from Excel file by sheet name
 */
export function importFromExcelBySheetName(file: File, sheetName: string): Promise<ImportResult> {
  return new Promise((resolve) => {
    const result: ImportResult = {
      data: [],
      headers: [],
      errors: []
    };
    
    if (!isSheetJSAvailable()) {
      result.errors.push('SheetJS (xlsx) library is not loaded.');
      resolve(result);
      return;
    }
    
    const XLSX = getXLSX();
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        
        if (!workbook.SheetNames.includes(sheetName)) {
          result.errors.push(`Sheet "${sheetName}" not found. Available sheets: ${workbook.SheetNames.join(', ')}`);
          resolve(result);
          return;
        }
        
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        
        if (jsonData.length === 0) {
          result.errors.push('Excel sheet is empty');
          resolve(result);
          return;
        }
        
        result.headers = jsonData[0].map((h: any) => String(h ?? ''));
        
        for (let i = 1; i < jsonData.length; i++) {
          const row: RowData = {};
          const rowData = jsonData[i];
          
          result.headers.forEach((header, colIndex) => {
            row[header] = rowData[colIndex] ?? '';
          });
          
          if (Object.values(row).some(v => v !== '')) {
            result.data.push(row);
          }
        }
        
        resolve(result);
      } catch (error) {
        result.errors.push(`Excel parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        resolve(result);
      }
    };
    
    reader.onerror = () => {
      result.errors.push('Failed to read file');
      resolve(result);
    };
    
    reader.readAsArrayBuffer(file);
  });
}

// ============================================
// Download Utility
// ============================================

/**
 * Download content as a file
 */
export function downloadFile(content: string | Blob, filename: string, mimeType = 'text/plain'): void {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Download CSV file
 */
export function downloadCSV(context: ExportContext): void {
  const csv = exportToCSV(context);
  const filename = (context.options.filename || 'export') + '.csv';
  downloadFile(csv, filename, 'text/csv;charset=utf-8');
}

/**
 * Download JSON file
 */
export function downloadJSON(context: ExportContext): void {
  const json = exportToJSON(context);
  const filename = (context.options.filename || 'export') + '.json';
  downloadFile(json, filename, 'application/json');
}
