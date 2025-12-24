import React, { useState } from 'react';
import { Category, Transaction, TransactionType, Account } from '../types';
import { Plus, ArrowUpCircle, ArrowDownCircle, Wallet } from 'lucide-react';

interface TransactionFormProps {
  onAdd: (t: Omit<Transaction, 'id'>) => void;
  onClose: () => void;
  accounts?: Account[];
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ onAdd, onClose, accounts = [] }) => {
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>(Category.FOOD);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;

    onAdd({
      type,
      amount: parseFloat(amount),
      category,
      date,
      description,
      accountId: selectedAccountId || undefined
    });
    onClose();
  };

  const inputClasses = "w-full p-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-400 dark:focus:border-blue-500 outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 transition-all font-medium";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* Type Toggle */}
      <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-6">
        <button
          type="button"
          onClick={() => setType(TransactionType.EXPENSE)}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
            type === TransactionType.EXPENSE 
              ? 'bg-white dark:bg-slate-700 text-red-500 shadow-md transform scale-100' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <ArrowDownCircle className="w-5 h-5" /> Gasto
        </button>
        <button
          type="button"
          onClick={() => setType(TransactionType.INCOME)}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
            type === TransactionType.INCOME 
              ? 'bg-white dark:bg-slate-700 text-green-600 shadow-md transform scale-100' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <ArrowUpCircle className="w-5 h-5" /> Ingreso
        </button>
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">Concepto</label>
        <input
          type="text"
          required
          className={inputClasses}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={type === TransactionType.EXPENSE ? "Supermercado, Gasolina..." : "Nómina, Venta..."}
        />
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
           <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">Fecha</label>
           <input
            type="date"
            required
            className={inputClasses}
            value={date}
            onChange={(e) => setDate(e.target.value)}
           />
        </div>
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

      {accounts.length > 0 && (
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
           <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide flex items-center gap-2">
             <Wallet className="w-4 h-4 text-slate-400" /> Cuenta (Opcional)
           </label>
           <select
             className={inputClasses}
             value={selectedAccountId}
             onChange={(e) => setSelectedAccountId(e.target.value)}
           >
             <option value="">-- No especificar --</option>
             {accounts.map((acc) => (
               <option key={acc.id} value={acc.id}>{acc.name} (Actual: ${acc.balance})</option>
             ))}
           </select>
           <p className="text-xs text-slate-400 mt-2">
             El saldo de esta cuenta se actualizará automáticamente.
           </p>
        </div>
      )}

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
          className={`flex-1 py-3 px-4 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 hover:-translate-y-1 ${
            type === TransactionType.EXPENSE 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          <Plus className="w-5 h-5" /> 
          {type === TransactionType.EXPENSE ? 'Registrar Gasto' : 'Registrar Ingreso'}
        </button>
      </div>
    </form>
  );
};