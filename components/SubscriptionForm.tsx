import React, { useState } from 'react';
import { Category, Frequency, Subscription } from '../types';
import { Plus, Loader2, Sparkles } from 'lucide-react';
import { suggestCategory } from '../services/geminiService';

interface SubscriptionFormProps {
  onAdd: (sub: Omit<Subscription, 'id'>) => void;
  onClose: () => void;
}

export const SubscriptionForm: React.FC<SubscriptionFormProps> = ({ onAdd, onClose }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<Frequency>(Frequency.MONTHLY);
  const [category, setCategory] = useState<Category>(Category.OTHER);
  const [nextPaymentDate, setNextPaymentDate] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount || !nextPaymentDate) return;

    onAdd({
      name,
      amount: parseFloat(amount),
      currency: 'USD', // Default for now
      frequency,
      category,
      nextPaymentDate,
    });
    onClose();
  };

  const handleAutoCategorize = async () => {
    if (!name) return;
    setIsSuggesting(true);
    const suggestion = await suggestCategory(name, "");
    
    // Find matching enum value
    const matchingCategory = Object.values(Category).find(c => c === suggestion) as Category;
    if (matchingCategory) {
      setCategory(matchingCategory);
    }
    setIsSuggesting(false);
  };

  const inputClasses = "w-full p-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-400 dark:focus:border-blue-500 outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 transition-all font-medium";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">Nombre del Servicio</label>
        <div className="flex gap-2">
          <input
            type="text"
            required
            className={`flex-1 ${inputClasses}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Netflix, Spotify, AWS..."
          />
          <button
            type="button"
            onClick={handleAutoCategorize}
            disabled={!name || isSuggesting}
            className="p-3 text-blue-500 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-100 dark:border-blue-800 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 disabled:opacity-50 transition-colors"
            title="Autodetectar Categoría con IA"
          >
            {isSuggesting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">Monto</label>
          <div className="relative">
            <span className="absolute left-3 top-3.5 text-slate-400 font-bold">$</span>
            <input
              type="number"
              required
              step="0.01"
              min="0"
              className={`${inputClasses} pl-7`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>
        </div>
        <div>
           <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">Próximo Pago</label>
           <input
            type="date"
            required
            className={inputClasses}
            value={nextPaymentDate}
            onChange={(e) => setNextPaymentDate(e.target.value)}
           />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">Frecuencia</label>
          <select
            className={inputClasses}
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as Frequency)}
          >
            {Object.values(Frequency).map((freq) => (
              <option key={freq} value={freq}>{freq}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">Categoría</label>
          <select
            className={inputClasses}
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
          >
            {Object.values(Category).map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-4 pt-6">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-3 px-4 border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="flex-1 py-3 px-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-lg hover:-translate-y-1 flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" /> Agregar
        </button>
      </div>
    </form>
  );
};