import * as Papa from 'papaparse';
import * as XLSX from 'xlsx';
import type { ImportSchema } from '@erp/shared';

export function exportToCSV(data: Record<string, unknown>[], filename: string): void {
  if (data.length === 0) return;
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filename}.csv`);
}

export function exportToExcel(data: Record<string, unknown>[], filename: string): void {
  if (data.length === 0) return;
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

export function downloadTemplate(schema: ImportSchema): void {
  const headers = schema.fields.map(f => f.label);
  const exampleRow: Record<string, string> = {};
  for (const field of schema.fields) {
    if (field.type === 'enum' && field.enumValues) {
      exampleRow[field.label] = field.enumValues[0];
    } else if (field.type === 'number') {
      exampleRow[field.label] = '0';
    } else if (field.type === 'boolean') {
      exampleRow[field.label] = String(field.defaultValue ?? 'true');
    } else if (field.type === 'date') {
      exampleRow[field.label] = '2025-01-15';
    } else {
      exampleRow[field.label] = field.required ? `Example ${field.label}` : '';
    }
  }
  const csv = Papa.unparse({ fields: headers, data: [exampleRow] });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, schema.templateFilename);
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
