'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, X, FileText, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  accept?: string;
  maxSize?: number; // in MB
  onFileSelect: (file: File) => void;
  onError?: (error: string) => void;
  label?: string;
  hint?: string;
  disabled?: boolean;
}

export function FileUpload({
  accept = '.csv',
  maxSize = 5,
  onFileSelect,
  onError,
  label = 'Upload a file',
  hint,
  disabled = false,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    // Check file type
    const acceptedTypes = accept.split(',').map((t) => t.trim());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const isValidType = acceptedTypes.some(
      (type) => type === fileExtension || type === file.type || type === '*'
    );

    if (!isValidType) {
      const errorMsg = `Invalid file type. Please upload: ${accept}`;
      setError(errorMsg);
      onError?.(errorMsg);
      return false;
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      const errorMsg = `File too large. Maximum size: ${maxSize}MB`;
      setError(errorMsg);
      onError?.(errorMsg);
      return false;
    }

    setError(null);
    return true;
  };

  const handleFile = (file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      )}

      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${error ? 'border-red-300 bg-red-50' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
          disabled={disabled}
        />

        {selectedFile ? (
          <div className="flex items-center justify-center gap-3">
            <FileText className="w-8 h-8 text-blue-500" />
            <div className="text-left">
              <p className="font-medium text-gray-900">{selectedFile.name}</p>
              <p className="text-sm text-gray-500">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              type="button"
              className="ml-2 p-1 hover:bg-gray-100 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        ) : (
          <>
            <Upload className="w-10 h-10 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600">
              <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {accept} (max {maxSize}MB)
            </p>
          </>
        )}
      </div>

      {hint && !error && (
        <p className="mt-2 text-sm text-gray-500">{hint}</p>
      )}

      {error && (
        <div className="mt-2 flex items-center gap-1 text-sm text-red-600">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
}
