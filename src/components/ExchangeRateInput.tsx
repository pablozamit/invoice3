import React, { useState, useEffect } from 'react';
import { CurrencyService } from '../services/currencyService';

export const ExchangeRateInput: React.FC = () => {
  const currencyService = CurrencyService.getInstance();
  const [rate, setRate] = useState<string>('');

  useEffect(() => {
    const stored = currencyService.getManualRate('USD');
    if (stored) {
      setRate(stored.toString());
    }
  }, [currencyService]);

  const handleSave = () => {
    const numeric = parseFloat(rate.replace(',', '.'));
    if (!isNaN(numeric) && numeric > 0) {
      currencyService.setManualRate('USD', numeric);
      alert('Tipo de cambio actualizado');
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Tipo de cambio USD a EUR (1 USD = ? EUR)
      </label>
      <div className="flex items-center space-x-2">
        <input
          type="number"
          step="0.0001"
          className="border rounded px-3 py-1 w-32"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
        />
        <button
          type="button"
          onClick={handleSave}
          className="px-3 py-1 bg-blue-600 text-white rounded"
        >
          Guardar
        </button>
      </div>
    </div>
  );
};
