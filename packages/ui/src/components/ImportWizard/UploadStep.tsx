import { useState, useRef } from 'react';
import { Upload, FileText, Check, AlertCircle } from 'lucide-react';
import { Button } from '../Button';
import { cn } from '../../lib/utils';

interface UploadStepProps {
  onFileSelect: (file: File) => void;
  fileName?: string;
  totalRows?: number;
  isLoading: boolean;
  error?: string;
  onDownloadTemplate?: () => void;
  entityLabel: string;
}

export function UploadStep({
  onFileSelect,
  fileName,
  totalRows,
  isLoading,
  error,
  onDownloadTemplate,
  entityLabel,
}: UploadStepProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    const validExtensions = ['.csv', '.xlsx', '.xls'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (validExtensions.includes(fileExtension)) {
      onFileSelect(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleChangeFile = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {!fileName ? (
          <div
            className={cn(
              'border-2 border-dashed rounded-lg p-12 text-center transition-colors',
              isDragging ? 'border-blue-600 bg-blue-50' : 'border-border bg-surface-0',
              isLoading && 'opacity-50 pointer-events-none'
            )}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">
              Drop your CSV or Excel file here
            </h3>
            <p className="text-text-muted mb-4">or</p>
            <Button variant="secondary" onClick={handleBrowseClick} disabled={isLoading}>
              Browse Files
            </Button>
            <p className="text-sm text-text-muted mt-4">Accepted formats: .csv, .xlsx, .xls</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>
        ) : (
          <div className="border border-border rounded-lg p-6 bg-surface-1">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <Check className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-text-muted" />
                  <span className="font-medium text-text-primary">{fileName}</span>
                </div>
                {totalRows !== undefined && (
                  <p className="text-sm text-text-muted">
                    {totalRows.toLocaleString()} rows detected
                  </p>
                )}
              </div>
              <button
                onClick={handleChangeFile}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Change file
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-900">Error parsing file</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="text-center text-text-muted">
            <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2" />
            <p className="text-sm">Parsing file...</p>
          </div>
        )}

        {onDownloadTemplate && (
          <div className="text-center pt-4 border-t border-border">
            <p className="text-sm text-text-muted mb-2">
              Need a template to get started?
            </p>
            <button
              onClick={onDownloadTemplate}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Download {entityLabel} Template
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
