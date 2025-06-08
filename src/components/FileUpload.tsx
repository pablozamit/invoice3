import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Image } from 'lucide-react';

interface FileUploadProps {
  onFilesAdded: (files: File[]) => void;
  isProcessing: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFilesAdded, isProcessing }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesAdded(acceptedFiles);
  }, [onFilesAdded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp']
    },
    multiple: true,
    disabled: isProcessing
  });

  return (
    <div
      {...getRootProps()}
      className={`
        relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
        transition-all duration-300 ease-in-out
        ${isDragActive 
          ? 'border-blue-400 bg-blue-50 scale-105' 
          : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }
        ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input {...getInputProps()} />
      
      <div className="flex flex-col items-center space-y-4">
        <div className={`
          p-4 rounded-full transition-colors duration-300
          ${isDragActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}
        `}>
          <Upload size={32} />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {isDragActive ? '¡Suelta los archivos aquí!' : 'Sube tus facturas'}
          </h3>
          <p className="text-gray-600 mb-4">
            Arrastra y suelta archivos PDF o imágenes, o haz clic para seleccionar
          </p>
          
          <div className="flex justify-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <FileText size={16} />
              <span>PDF</span>
            </div>
            <div className="flex items-center space-x-2">
              <Image size={16} />
              <span>JPG, PNG, GIF</span>
            </div>
          </div>
        </div>
        
        {!isProcessing && (
          <button
            type="button"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Seleccionar archivos
          </button>
        )}
      </div>
    </div>
  );
};