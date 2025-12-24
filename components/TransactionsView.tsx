import React from 'react';
import { Transaction, TransactionType } from '../types';
import { ArrowUpRight, ArrowDownLeft, Calendar, Tag, Trash2, ArrowRightLeft } from 'lucide-react';

interface TransactionsViewProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({ transactions, onDelete }) => {
  // Sort by date desc
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-4">
      {sortedTransactions.length === 0 ? (
        <div className="text-center py-20 bg-white/50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
           <div className="mx-auto w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4 text-slate-400 dark:text-slate-500">
             <ArrowRightLeft className="w-8 h-8" />
           </div>
           <h3 className="text-lg font-bold font-hand text-slate-700 dark:text-slate-200">Sin movimientos</h3>
           <p className="text-slate-500 dark:text-slate-400 mt-1">Registra tus ingresos y gastos para ver el historial.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          {sortedTransactions.map((t, index) => (
            <div 
              key={t.id} 
              className={`p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                index !== sortedTransactions.length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  t.type === TransactionType.INCOME 
                    ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {t.type === TransactionType.INCOME ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownLeft className="w-6 h-6" />}
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200 text-lg">{t.description}</p>
                  <div className="flex items-center gap-3 text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(t.date).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded"><Tag className="w-3 h-3" /> {t.category}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <span className={`font-bold font-hand text-xl ${
                  t.type === TransactionType.INCOME ? 'text-green-600 dark:text-green-400' : 'text-slate-900 dark:text-slate-100'
                }`}>
                  {t.type === TransactionType.INCOME ? '+' : '-'}${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <button 
                  onClick={() => onDelete(t.id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                  title="Eliminar movimiento"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};