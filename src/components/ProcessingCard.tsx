import React from 'react';
import { CheckCircle, AlertCircle, Loader2, FileText, Calendar, Building, Euro } from 'lucide-react';
import { UploadedFile } from '../types/invoice';

interface ProcessingCardProps {
  file: UploadedFile;
}

export const ProcessingCard: React.FC<ProcessingCardProps> = ({ file }) => {
  const getStatusIcon = () => {
    switch (file.status.status) {
      case 'completed':
        return <CheckCircle className="text-green-500\" size={20} />;
      case 'error':
        return <AlertCircle className="text-red-500" size={20} />;
      default:
        return <Loader2 className="text-blue-500 animate-spin" size={20} />;
    }
  };

  const getStatusColor = () => {
    switch (file.status.status) {
      case 'completed':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <div className={`border-2 rounded-xl p-6 transition-all duration-300 ${getStatusColor()}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <FileText className="text-gray-600" size={24} />
          <div>
            <h3 className="font-semibold text-gray-800 truncate max-w-48">
              {file.file.name}
            </h3>
            <p className="text-sm text-gray-500">
              {(file.file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>
        {getStatusIcon()}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>{file.status.message}</span>
          <span>{file.status.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              file.status.status === 'error' ? 'bg-red-500' : 'bg-blue-500'
            }`}
            style={{ width: `${file.status.progress}%` }}
          ></div>
        </div>
      </div>

      {/* Error Message */}
      {file.status.error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{file.status.error}</p>
        </div>
      )}

      {/* Extracted Data */}
      {file.extractedData && (
        <div className="space-y-3 pt-4 border-t border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-3">Datos extraídos:</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center space-x-2">
              <Calendar size={16} className="text-gray-500" />
              <div>
                <span className="text-xs text-gray-500 block">Fecha</span>
                <span className="text-sm font-medium">{file.extractedData.fecha}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <FileText size={16} className="text-gray-500" />
              <div>
                <span className="text-xs text-gray-500 block">Nº Factura</span>
                <span className="text-sm font-medium">{file.extractedData.numeroFactura}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Building size={16} className="text-gray-500" />
              <div>
                <span className="text-xs text-gray-500 block">Empresa</span>
                <span className="text-sm font-medium">{file.extractedData.empresa}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Euro size={16} className="text-gray-500" />
              <div>
                <span className="text-xs text-gray-500 block">Importe Total</span>
                <span className="text-sm font-medium">{file.extractedData.importeTotal}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-3">
            <span className="text-xs text-gray-500 block">Concepto</span>
            <span className="text-sm">{file.extractedData.concepto}</span>
          </div>
        </div>
      )}
    </div>
  );
};