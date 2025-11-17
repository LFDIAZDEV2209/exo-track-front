'use client';

import { useCallback, useState } from 'react';
import { Upload, X, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  disabled?: boolean;
}

export function FileUpload({ onFileSelect, accept = '.xlsx,.xls', disabled }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    (selectedFile: File) => {
      setFile(selectedFile);
      onFileSelect(selectedFile);
    },
    [onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        handleFile(droppedFile);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        handleFile(selectedFile);
      }
    },
    [handleFile]
  );

  const removeFile = useCallback(() => {
    setFile(null);
  }, []);

  if (file) {
    return (
      <div className="flex items-center gap-4 p-4 rounded-lg border bg-muted/50">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <FileSpreadsheet className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <p className="font-medium">{file.name}</p>
          <p className="text-sm text-muted-foreground">
            {(file.size / 1024).toFixed(2)} KB
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={removeFile}
          disabled={disabled}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={cn(
        'relative rounded-lg border-2 border-dashed transition-colors',
        isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
          <Upload className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-lg font-medium mb-2">Arrastra tu archivo Excel aquí</p>
        <p className="text-sm text-muted-foreground mb-4">
          Formatos soportados: .xlsx, .xls
        </p>
        <label htmlFor="file-upload">
          <Button variant="secondary" disabled={disabled} asChild>
            <span>O selecciona un archivo</span>
          </Button>
          <input
            id="file-upload"
            type="file"
            accept={accept}
            onChange={handleFileInput}
            className="hidden"
            disabled={disabled}
          />
        </label>
      </div>
    </div>
  );
}
