import * as XLSX from 'xlsx';

/**
 * Trigger browser download for a workbook buffer
 */
function downloadWorkbook(workbook: XLSX.WorkBook, filename: string) {
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Generate and download an Excel template file with headers and optional sample data
 */
export function downloadExcelTemplate(
  filename: string,
  headers: string[],
  sampleRows: (string | number)[][] = []
) {
  const wsData = [headers, ...sampleRows];
  const worksheet = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  worksheet['!cols'] = headers.map((h) => ({ wch: Math.max(h.length + 5, 18) }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');

  downloadWorkbook(workbook, filename);
}

/**
 * Export structured JSON data or Array of Arrays to an Excel spreadsheet
 */
export function exportToExcel(
  filename: string,
  sheetName: string,
  data: Record<string, unknown>[] | (string | number | null | undefined)[][],
  headers?: string[]
) {
  let worksheet: XLSX.WorkSheet;

  if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0])) {
    const aoaData = headers ? [headers, ...(data as (string | number | null | undefined)[][])] : data;
    worksheet = XLSX.utils.aoa_to_sheet(aoaData as (string | number)[][]);
  } else {
    worksheet = XLSX.utils.json_to_sheet(data as Record<string, unknown>[], { header: headers });
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName || 'Data');

  downloadWorkbook(workbook, filename);
}

/**
 * Parse uploaded Excel (.xlsx, .xls) file into an array of objects
 */
export async function parseExcelFile<T = Record<string, unknown>>(file: File): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Parse as JSON array of objects
        const jsonData = XLSX.utils.sheet_to_json<T>(worksheet, {
          defval: '',
          raw: false,
        });

        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}
