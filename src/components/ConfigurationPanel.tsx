import React, { useState, useEffect } from 'react';
import { Save, Info } from 'lucide-react';
import { getConfig, saveSheetId, saveDriveFolderId } from '../services/configService';

export const ConfigurationPanel: React.FC = () => {
  const [sheetIdInput, setSheetIdInput] = useState('');
  const [driveFolderIdInput, setDriveFolderIdInput] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const loadedConfig = getConfig();
    setSheetIdInput(loadedConfig.sheetId || '');
    setDriveFolderIdInput(loadedConfig.driveFolderId || '');
  }, []);

  const handleSave = () => {
    try {
      saveSheetId(sheetIdInput.trim());
      saveDriveFolderId(driveFolderIdInput.trim());
      setMessage({ type: 'success', text: 'Configuración guardada exitosamente.' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Error saving configuration:", error);
      setMessage({ type: 'error', text: 'Error al guardar la configuración.' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-1">Configuración Personalizada</h3>
      <p className="text-sm text-gray-600 mb-6">
        Aquí puedes definir IDs específicos para la Hoja de Cálculo de Google y la Carpeta de Google Drive
        donde se guardarán los datos y archivos de las facturas procesadas.
        Estos valores anularán los IDs definidos en las variables de entorno si están presentes.
      </p>

      <div className="space-y-6">
        <div>
          <label htmlFor="sheetId" className="block text-sm font-medium text-gray-700 mb-1">
            ID de Google Sheet para Facturas
          </label>
          <input
            type="text"
            name="sheetId"
            id="sheetId"
            value={sheetIdInput}
            onChange={(e) => setSheetIdInput(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Ej: 1aBcD_eFgHiJkLmNoPqRsTuVwXyZ"
          />
          <p className="mt-1 text-xs text-gray-500">
            El ID se encuentra en la URL de tu Google Sheet. Déjalo vacío para usar el ID de las variables de entorno.
          </p>
        </div>

        <div>
          <label htmlFor="driveFolderId" className="block text-sm font-medium text-gray-700 mb-1">
            ID de Carpeta de Google Drive para Facturas
          </label>
          <input
            type="text"
            name="driveFolderId"
            id="driveFolderId"
            value={driveFolderIdInput}
            onChange={(e) => setDriveFolderIdInput(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Ej: 0A1bC2dE3fG_hIjKlMnOpQrStUvWxYz"
          />
          <p className="mt-1 text-xs text-gray-500">
            El ID se encuentra en la URL de tu carpeta de Google Drive. Déjalo vacío para usar el ID de las variables de entorno.
          </p>
        </div>
      </div>

      {message && (
        <div className={`mt-4 p-3 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Save size={16} className="mr-2" />
          Guardar Configuración
        </button>
      </div>

      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <Info className="h-5 w-5 text-amber-500" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-amber-800">Nota Importante sobre Variables de Entorno</h3>
            <div className="mt-1 text-xs text-amber-700">
              <p>
                Las Claves API de Google (`VITE_GOOGLE_API_KEY`, `VITE_GOOGLE_CLOUD_API_KEY`) y el Client ID (`VITE_GOOGLE_CLIENT_ID`)
                <strong>deben</strong> configurarse a través de las variables de entorno (archivo `.env`).
                Esta sección solo permite personalizar los IDs de destino para Sheets y Drive.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
