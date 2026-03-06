import React, { useRef } from 'react';
import { Download, Upload } from 'lucide-react';
import { exportToCsv, parseCsv } from '../utils/csvHelper';

interface CsvControlsProps<T> {
  data: T[];
  filename: string;
  onImport: (data: T[]) => void;
  className?: string;
}

export function CsvControls<T>({ data, filename, onImport, className = '' }: CsvControlsProps<T>) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    exportToCsv(data, filename);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsedData = parseCsv<T>(text);
      if (parsedData && parsedData.length > 0) {
        onImport(parsedData);
      } else {
        alert("Failed to parse CSV or file is empty.");
      }
    };
    reader.readAsText(file);
    
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={handleExport}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors"
        title="Export to CSV"
      >
        <Download className="w-4 h-4" />
        Export
      </button>
      <button
        onClick={handleImportClick}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors"
        title="Import from CSV"
      >
        <Upload className="w-4 h-4" />
        Import
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".csv"
        className="hidden"
      />
    </div>
  );
}
