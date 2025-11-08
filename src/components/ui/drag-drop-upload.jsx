import React, { useState, useCallback } from 'react';
import { Upload, X, FileText, Image, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

/**
 * Drag & Drop Upload Premium
 * V12.0 - UX Intuitiva
 */
export default function DragDropUpload({ 
  onFilesSelected, 
  accept = "*",
  multiple = true,
  maxSizeMB = 10,
  className 
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  }, []);

  const handleFileInput = (e) => {
    const selectedFiles = Array.from(e.target.files);
    processFiles(selectedFiles);
  };

  const processFiles = (newFiles) => {
    const validFiles = newFiles.filter(file => {
      const sizeMB = file.size / 1024 / 1024;
      if (sizeMB > maxSizeMB) {
        toast.error(`${file.name} excede ${maxSizeMB}MB`);
        return false;
      }
      return true;
    });

    setFiles(prev => multiple ? [...prev, ...validFiles] : validFiles);
    onFilesSelected?.(multiple ? [...files, ...validFiles] : validFiles);
  };

  const removeFile = (index) => {
    const updatedFiles = files.filter((_, idx) => idx !== index);
    setFiles(updatedFiles);
    onFilesSelected?.(updatedFiles);
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) return <Image className="w-8 h-8 text-blue-500" />;
    if (file.type === 'application/pdf') return <FileText className="w-8 h-8 text-red-500" />;
    return <File className="w-8 h-8 text-slate-500" />;
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer",
          isDragging 
            ? "border-blue-500 bg-blue-50" 
            : "border-slate-300 hover:border-slate-400 bg-white"
        )}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
        />
        
        <label htmlFor="file-upload" className="cursor-pointer">
          <Upload className={cn(
            "w-12 h-12 mx-auto mb-4",
            isDragging ? "text-blue-500" : "text-slate-400"
          )} />
          
          <p className="text-lg font-medium text-slate-700 mb-2">
            {isDragging ? "Solte os arquivos aqui" : "Arraste arquivos ou clique para selecionar"}
          </p>
          
          <p className="text-sm text-slate-500">
            Tamanho máximo: {maxSizeMB}MB {multiple && "• Múltiplos arquivos permitidos"}
          </p>
        </label>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">
            {files.length} arquivo{files.length > 1 ? 's' : ''} selecionado{files.length > 1 ? 's' : ''}
          </p>
          
          {files.map((file, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border">
              {getFileIcon(file)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-slate-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeFile(idx)}
                className="flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}