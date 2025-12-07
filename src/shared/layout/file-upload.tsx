'use client';

import { useCallback, useState } from 'react';
import { Upload, X, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
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
    onFileSelect(null);
  }, [onFileSelect]);

  if (file) {
    return (
      <div className="flex items-center gap-4 p-4 rounded-lg border bg-muted/50 animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-transform duration-200 hover:scale-110">
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
        'relative rounded-lg border-2 border-dashed transition-all duration-300 ease-in-out',
        isDragging 
          ? 'border-primary bg-primary/10 scale-[1.02] shadow-lg' 
          : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/30',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className={cn(
          "flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4 transition-all duration-300",
          isDragging && "scale-110 bg-primary/20"
        )}>
          <Upload className={cn(
            "h-8 w-8 text-muted-foreground transition-all duration-300",
            isDragging && "text-primary scale-110"
          )} />
        </div>
        <p className="text-lg font-medium mb-2 transition-colors duration-200">
          {isDragging ? 'Suelta el archivo aquí' : 'Arrastra tu archivo Excel aquí'}
        </p>
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
