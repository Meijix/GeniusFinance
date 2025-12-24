import React, { useState } from 'react';
import { AppSettings, Subscription, Transaction } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Save, Download, Settings, Trash2, Globe, Moon, Sun } from 'lucide-react';

interface SettingsViewProps {
  settings: AppSettings;
  onSave: (s: AppSettings) => void;
  subscriptions: Subscription[];
  transactions: Transaction[];
  onClearData: () => void;
}

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'Dólar Estadounidense' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'MXN', symbol: '$', name: 'Peso Mexicano' },
  { code: 'COP', symbol: '$', name: 'Peso Colombiano' },
  { code: 'ARS', symbol: '$', name: 'Peso Argentino' },
  { code: 'CLP', symbol: '$', name: 'Peso Chileno' },
  { code: 'PEN', symbol: 'S/', name: 'Sol Peruano' },
];

export const SettingsView: React.FC<SettingsViewProps> = ({ settings, onSave, subscriptions, transactions, onClearData }) => {
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'monthlyBudget' ? parseFloat(value) : value
    }));
  };

  const toggleTheme = () => {
    setFormData(prev => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark'
    }));
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const currency = CURRENCIES.find(c => c.code === code);
    if (currency) {
      setFormData(prev => ({
        ...prev,
        currencyCode: currency.code,
        currencySymbol: currency.symbol
      }));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const exportData = () => {
    const data = {
      settings: formData,
      subscriptions,
      transactions,
      exportDate: new Date().toISOString()
    };
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "finanzas_backup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const inputClasses = "w-full p-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-slate-900 dark:text-white placeholder-slate-400 transition-all";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-500" /> Configuración General
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            
            {/* Theme Toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700 mb-4">
               <div>
                 <h4 className="font-medium text-slate-800 dark:text-white">Apariencia</h4>
                 <p className="text-sm text-slate-500">Cambia entre modo claro y oscuro.</p>
               </div>
               <button
                type="button"
                onClick={toggleTheme}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${formData.theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`}
               >
                 <span className={`${formData.theme === 'dark' ? 'translate-x-7' : 'translate-x-1'} inline-block h-6 w-6 transform rounded-full bg-white transition-transform flex items-center justify-center shadow-sm`}>
                    {formData.theme === 'dark' ? <Moon className="w-3 h-3 text-slate-800" /> : <Sun className="w-3 h-3 text-orange-400" />}
                 </span>
               </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">Nombre de Usuario</label>
              <input
                type="text"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                className={inputClasses}
              />
            </div>

             <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">Moneda Principal</label>
              <div className="relative">
                <Globe className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                <select
                  name="currencyCode"
                  value={formData.currencyCode || 'USD'}
                  onChange={handleCurrencyChange}
                  className={`${inputClasses} pl-9`}
                >
                  {CURRENCIES.map(c => (
                    <option key={c.code} value={c.code}>{c.code} - {c.name} ({c.symbol})</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">Presupuesto Mensual Objetivo</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400">{formData.currencySymbol || '$'}</span>
                <input
                  type="number"
                  name="monthlyBudget"
                  value={formData.monthlyBudget}
                  onChange={handleChange}
                  className={`${inputClasses} pl-7`}
                  placeholder="Ej. 2000"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">Establece un límite para visualizar tu progreso en el Dashboard.</p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20 w-full sm:w-auto"
              >
                <Save className="w-4 h-4" /> Guardar Cambios
              </button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gestión de Datos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-between border border-slate-100 dark:border-slate-800">
            <div>
              <h4 className="font-medium text-slate-700 dark:text-slate-200">Exportar Información</h4>
              <p className="text-sm text-slate-500">Descarga un archivo JSON con todos tus registros.</p>
            </div>
            <button
              onClick={exportData}
              className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all"
            >
              <Download className="w-4 h-4" /> Exportar
            </button>
          </div>

          <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl">
            {!showConfirm ? (
              <div className="flex items-center justify-between">
                <div>
                   <h4 className="font-medium text-red-600 dark:text-red-400">Borrar Todo</h4>
                   <p className="text-sm text-red-500/70">Elimina suscripciones, transacciones y configuración.</p>
                </div>
                <button
                  onClick={() => setShowConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                >
                  <Trash2 className="w-4 h-4" /> Borrar
                </button>
              </div>
            ) : (
               <div className="text-center">
                 <p className="font-bold text-red-600 dark:text-red-400 mb-3">¿Estás seguro? Esta acción no se puede deshacer.</p>
                 <div className="flex justify-center gap-3">
                    <button
                      onClick={() => setShowConfirm(false)}
                      className="px-4 py-2 bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => {
                        onClearData();
                        setShowConfirm(false);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500"
                    >
                      Sí, Eliminar Todo
                    </button>
                 </div>
               </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};