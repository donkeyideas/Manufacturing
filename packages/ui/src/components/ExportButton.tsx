import { useState, useRef, useEffect } from 'react';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../lib/utils';

interface ExportButtonProps {
  onExportCSV: () => void;
  onExportExcel: () => void;
  disabled?: boolean;
}

export function ExportButton({ onExportCSV, onExportExcel, disabled }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleExportCSV = () => {
    onExportCSV();
    setIsOpen(false);
  };

  const handleExportExcel = () => {
    onExportExcel();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        ref={buttonRef}
        variant="secondary"
        size="sm"
        onClick={handleToggle}
        disabled={disabled}
      >
        <Download className="w-4 h-4 mr-2" />
        Export
      </Button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-48 bg-surface-0 border border-border rounded-lg shadow-lg z-10 overflow-hidden"
        >
          <button
            onClick={handleExportCSV}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 text-sm text-text-primary',
              'hover:bg-surface-1 transition-colors'
            )}
          >
            <FileText className="w-4 h-4 text-text-muted" />
            Export as CSV
          </button>
          <button
            onClick={handleExportExcel}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 text-sm text-text-primary',
              'hover:bg-surface-1 transition-colors border-t border-border'
            )}
          >
            <FileSpreadsheet className="w-4 h-4 text-text-muted" />
            Export as Excel
          </button>
        </div>
      )}
    </div>
  );
}
