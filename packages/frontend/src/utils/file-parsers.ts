import * as Papa from 'papaparse';
import * as XLSX from 'xlsx';

export interface ParsedFile {
  headers: string[];
  rows: Record<string, string>[];
  totalRows: number;
  fileName: string;
  fileType: 'csv' | 'xlsx' | 'xls';
}

export function parseCSV(file: File): Promise<ParsedFile> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve({
          headers: results.meta.fields || [],
          rows: results.data as Record<string, string>[],
          totalRows: results.data.length,
          fileName: file.name,
          fileType: 'csv',
        });
      },
      error: (err) => reject(new Error(`CSV parse error: ${err.message}`)),
    });
  });
}

export function parseExcel(file: File): Promise<ParsedFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(firstSheet, { raw: false });
        const headers = jsonData.length > 0 ? Object.keys(jsonData[0]) : [];
        const ext = file.name.toLowerCase().endsWith('.xls') ? 'xls' : 'xlsx';
        resolve({
          headers,
          rows: jsonData,
          totalRows: jsonData.length,
          fileName: file.name,
          fileType: ext as 'xlsx' | 'xls',
        });
      } catch (err: any) {
        reject(new Error(`Excel parse error: ${err.message}`));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

export function parseFile(file: File): Promise<ParsedFile> {
  const ext = file.name.toLowerCase().split('.').pop();
  if (ext === 'csv') return parseCSV(file);
  if (ext === 'xlsx' || ext === 'xls') return parseExcel(file);
  return Promise.reject(new Error(`Unsupported file type: .${ext}. Please use .csv, .xlsx, or .xls`));
}
