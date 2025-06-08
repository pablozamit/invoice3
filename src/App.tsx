import React from 'react';
import { FileText, TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import { FileUpload } from './components/FileUpload';
import { ProcessingCard } from './components/ProcessingCard';
import { StatsCard } from './components/StatsCard';
import { AuthButton } from './components/AuthButton';
import { useInvoiceProcessor } from './hooks/useInvoiceProcessor';
import { ExchangeRateInput } from './components/ExchangeRateInput';
import { ConfigurationPanel } from './components/ConfigurationPanel';

function App() {
  const { files, isProcessing, addFiles, clearAll, stats } = useInvoiceProcessor();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <FileText className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Procesador de Facturas</h1>
                <p className="text-gray-600">Análisis automático y extracción de datos</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <AuthButton />
              {files.length > 0 && (
                <button
                  onClick={clearAll}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  Limpiar todo
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Setup Instructions */}
        <div className="mb-8 bg-amber-50 border border-amber-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-amber-800 mb-4">⚠️ Configuración requerida</h3>
          <div className="space-y-3 text-sm text-amber-700">
            <p>Para que el sistema funcione correctamente, necesitas:</p>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Crear un archivo <code className="bg-amber-100 px-2 py-1 rounded">.env</code> basado en <code className="bg-amber-100 px-2 py-1 rounded">.env.example</code></li>
              <li>Configurar las APIs de Google (Sheets, Drive, Cloud Vision)</li>
              <li>Hacer clic en "Conectar con Google" para autorizar el acceso</li>
            </ol>
            <p className="mt-3 font-medium">
              📖 <a href="#setup-guide" className="text-amber-800 underline">Ver guía completa de configuración</a>
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total de archivos"
            value={stats.total}
            icon={FileText}
            color="blue"
          />
          <StatsCard
            title="Completados"
            value={stats.completed}
            icon={TrendingUp}
            color="green"
          />
          <StatsCard
            title="Procesando"
            value={stats.processing}
            icon={Clock}
            color="orange"
          />
          <StatsCard
            title="Errores"
            value={stats.errors}
            icon={AlertTriangle}
            color="purple"
          />
        </div>

        {/* Upload Area */}
        <div className="mb-8">
          <FileUpload onFilesAdded={addFiles} isProcessing={isProcessing} />
        </div>

        {/* Processing Cards */}
        {files.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Archivos en procesamiento
              </h2>
              <span className="text-sm text-gray-500">
                {files.length} archivo{files.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            <div className="grid gap-6">
              {files.map(file => (
                <ProcessingCard key={file.id} file={file} />
              ))}
            </div>
          </div>
        )}

        {/* Integration Info */}
        <div className="mt-12 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración de integración</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Google Sheets</h4>
              <p className="text-sm text-gray-600 mb-2">
                Los datos se guardarán automáticamente en tu hoja de cálculo:
              </p>
              <a 
                href={`https://docs.google.com/spreadsheets/d/${import.meta.env.VITE_GOOGLE_SHEETS_ID}/edit`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm underline"
              >
                Ver hoja de cálculo →
              </a>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Google Drive</h4>
              <p className="text-sm text-gray-600 mb-2">
                Los archivos se subirán automáticamente a:
              </p>
              <a
                href={`https://drive.google.com/drive/folders/${import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_ID}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm underline"
              >
                Ver carpeta de Drive →
              </a>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Tipo de cambio</h4>
              <p className="text-sm text-gray-600 mb-2">
                Define manualmente el cambio de USD a EUR:
              </p>
              <ExchangeRateInput />
            </div>
          </div>
        </div>

        {/* User Configuration Panel */}
        <div className="mt-12"> {/* Adjusted margin to mt-12 to be consistent with other major sections */}
          <ConfigurationPanel />
        </div>

        {/* Setup Guide */}
        <div id="setup-guide" className="mt-12 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📖 Guía de configuración</h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">1. Google Cloud Console</h4>
              <ul className="text-sm text-gray-600 space-y-1 ml-4 list-disc">
                <li>Crear un proyecto en <a href="https://console.cloud.google.com" className="text-blue-600 underline" target="_blank">Google Cloud Console</a></li>
                <li>Habilitar las APIs: Google Sheets, Google Drive, Google Cloud Vision</li>
                <li>Crear credenciales (API Key y OAuth 2.0)</li>
                <li>Configurar pantalla de consentimiento OAuth</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-800 mb-2">2. Variables de entorno</h4>
              <p className="text-sm text-gray-600 mb-2">Crear archivo <code className="bg-gray-100 px-2 py-1 rounded">.env</code> con:</p>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`VITE_GOOGLE_API_KEY=tu_api_key_aqui
VITE_GOOGLE_CLIENT_ID=tu_client_id_aqui
VITE_GOOGLE_SHEETS_ID=tu_id_de_hoja_de_calculo_aqui
VITE_GOOGLE_DRIVE_FOLDER_ID=tu_id_de_carpeta_de_drive_aqui
VITE_GOOGLE_CLOUD_API_KEY=tu_api_key_cloud_vision_aqui
VITE_GOOGLE_CLOUD_PROJECT_ID=tu_project_id_cloud_aqui`}
              </pre>
              <p className="text-sm text-gray-600 mt-4">
                <strong>Nota Importante:</strong> El <code>VITE_GOOGLE_SHEETS_ID</code> y <code>VITE_GOOGLE_DRIVE_FOLDER_ID</code> también pueden ser configurados
                directamente en la interfaz gráfica, en la sección "Configuración Personalizada" (arriba de esta guía).
                Los valores guardados en la interfaz tendrán prioridad sobre los definidos en el archivo <code>.env</code> para estos dos campos específicos.
                El resto de variables (API Keys, Client ID, Project ID) <strong>deben</strong> ser configuradas en el archivo <code>.env</code>.
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="text-center p-6">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <FileText className="text-blue-600" size={24} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">OCR Real con Tesseract.js</h3>
            <p className="text-sm text-gray-600">
              Extracción automática de texto de PDFs e imágenes usando OCR real
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="text-green-600" size={24} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Conversión de Moneda Manual</h3>
            <p className="text-sm text-gray-600">
              Define el tipo de cambio USD/EUR directamente en la interfaz
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Clock className="text-purple-600" size={24} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Integración Google Real</h3>
            <p className="text-sm text-gray-600">
              Guardado automático en Google Sheets y subida a Google Drive
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;