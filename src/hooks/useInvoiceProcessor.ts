import { useState, useCallback } from 'react';
import { UploadedFile, InvoiceData, ProcessingStatus } from '../types/invoice';
import { InvoiceProcessor } from '../services/invoiceProcessor';

export const useInvoiceProcessor = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const processor = InvoiceProcessor.getInstance();

  const addFiles = useCallback(async (newFiles: File[]) => {
    const uploadedFiles: UploadedFile[] = newFiles.map(file => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      status: {
        status: 'idle',
        progress: 0,
        message: 'Preparando...'
      }
    }));

    setFiles(prev => [...prev, ...uploadedFiles]);
    setIsProcessing(true);

    // Process each file
    for (const uploadedFile of uploadedFiles) {
      try {
        const extractedData = await processor.processFile(
          uploadedFile.file,
          (status: ProcessingStatus) => {
            setFiles(prev => prev.map(f => 
              f.id === uploadedFile.id 
                ? { ...f, status }
                : f
            ));
          }
        );

        // Update with extracted data
        setFiles(prev => prev.map(f => 
          f.id === uploadedFile.id 
            ? { ...f, extractedData }
            : f
        ));

      } catch (error) {
        console.error('Error processing file:', error);
      }
    }

    setIsProcessing(false);
  }, [processor]);

  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  const clearAll = useCallback(() => {
    setFiles([]);
  }, []);

  const stats = {
    total: files.length,
    completed: files.filter(f => f.status.status === 'completed').length,
    processing: files.filter(f => f.status.status !== 'completed' && f.status.status !== 'error').length,
    errors: files.filter(f => f.status.status === 'error').length
  };

  return {
    files,
    isProcessing,
    addFiles,
    removeFile,
    clearAll,
    stats
  };
};