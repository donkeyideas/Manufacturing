import { useState, useRef, type DragEvent } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface FileUploadProps {
  value?: string;
  onChange: (url: string) => void;
  accept?: string;
  placeholder?: string;
  className?: string;
}

export function FileUpload({
  value,
  onChange,
  accept = 'image/*',
  placeholder = 'Upload Image',
  className,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) onChange(e.target.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setUrlInput('');
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      {value ? (
        <div className="relative rounded-lg border border-border overflow-hidden">
          <img src={value} alt="Preview" className="w-full h-32 object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed py-6 cursor-pointer transition-colors',
            isDragging
              ? 'border-brand-500 bg-brand-50 dark:bg-brand-950'
              : 'border-border hover:border-brand-400 hover:bg-surface-1'
          )}
        >
          <Upload className="h-6 w-6 text-text-muted" />
          <span className="text-xs text-text-muted">{placeholder}</span>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </div>
      )}
      <div className="flex items-center gap-1">
        <span className="text-2xs text-text-muted whitespace-nowrap">Or enter image URL</span>
        <div className="flex flex-1 gap-1">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
            placeholder="https://example.com/image.jpg"
            className="flex-1 rounded-md border border-border bg-surface-0 px-2 py-1 text-2xs text-text-primary placeholder:text-text-muted outline-none focus:ring-1 focus:ring-brand-500"
          />
          {urlInput && (
            <button
              type="button"
              onClick={handleUrlSubmit}
              className="rounded-md bg-brand-500 px-2 py-1 text-2xs text-white hover:bg-brand-600"
            >
              <ImageIcon className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
