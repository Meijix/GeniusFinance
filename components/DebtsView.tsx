import React, { useState } from 'react';
import { Debt, AppSettings, Transaction, TransactionType, Category } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Plus, Trash2, Calendar, TrendingDown, DollarSign, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DebtsViewProps {
  debts: Debt[];
  settings: AppSettings;
  onAddDebt: (debt: Omit<Debt, 'id'>) => void;
  onUpdateDebt: (debt: Debt) => void;
  onDeleteDebt: (id: string) => void;
  onAddTransaction: (t: Omit<Transaction, 'id'>) => void;
}

export const DebtsView: React.FC<DebtsViewProps> = ({ 
  debts, 
  settings, 
  onAddDebt, 
  onUpdateDebt, 
  onDeleteDebt,
  onAddTransaction
}) => {
  const [showForm, setShowForm] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  const [newDebt, setNewDebt] = useState({
    name: '',
    totalAmount: '',
    remainingAmount: '',
    dueDate: '',
    color: 'bg-red-200'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDebt.name || !newDebt.totalAmount) return;

    const total = parseFloat(newDebt.totalAmount);
    // If remaining is not set, assume it's the total amount (new debt)
    const remaining = newDebt.remainingAmount ? parseFloat(newDebt.remainingAmount) : total;

    onAddDebt({
      name: newDebt.name,
      totalAmount: total,
      remainingAmount: remaining,
      dueDate: newDebt.dueDate,
      color: newDebt.color
    });

    setNewDebt({ name: '', totalAmount: '', remainingAmount: '', dueDate: '', color: 'bg-red-200' });
    setShowForm(false);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDebt || !paymentAmount) return;
    
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) return;

    if (amount > selectedDebt.remainingAmount) {
      alert("El monto no puede ser mayor a la deuda restante.");
      return;
    }

    // 1. Update Debt
    onUpdateDebt({
      ...selectedDebt,
      remainingAmount: selectedDebt.remainingAmount - amount
    });

    // 2. Create Transaction Log
    onAddTransaction({
      type: TransactionType.EXPENSE,
      category: Category.DEBT,
      amount: amount,
      date: new Date().toISOString().split('T')[0],
      description: `Pago deuda: ${selectedDebt.name}`
    });

    setSelectedDebt(null);
    setPaymentAmount('');
  };

  const colors = [
    'bg-red-200', 'bg-orange-200', 'bg-amber-200', 'bg-yellow-200', 'bg-slate-200', 'bg-blue-200'
  ];

  const inputClasses = "w-full p-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-400 dark:focus:border-blue-500 outline-none text-slate-800 dark:text-white placeholder-slate-400 transition-all font-medium";

  return (
    <div className="space-y-8 relative">
      
      {/* Header / Add Button */}
      {!showForm ? (
        <button 
          onClick={() => setShowForm(true)}
          className="w-full py-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl flex flex-col items-center justify-center gap-2 text-slate-500 dark:text-slate-400 hover:text-marker-red hover:border-marker-red hover:bg-red-50 dark:hover:bg-red-900/10 transition-all group font-hand text-xl font-bold"
        >
          <div className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm group-hover:scale-110 transition-transform border border-slate-200 dark:border-slate-700">
            <Plus className="w-8 h-8" /> 
          </div>
          <span>Registrar Nueva Deuda</span>
        </button>
      ) : (
        <Card className="rotate-1">
          <CardHeader>
             <CardTitle>Nueva Deuda</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">Nombre / Concepto</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ej. Préstamo Auto, Tarjeta de Crédito..."
                  className={inputClasses}
                  value={newDebt.name}
                  onChange={e => setNewDebt({...newDebt, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">Monto Total ({settings.currencySymbol})</label>
                  <input 
                    type="number" 
                    required
                    step="0.01"
                    className={inputClasses}
                    value={newDebt.totalAmount}
                    onChange={e => setNewDebt({...newDebt, totalAmount: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">Deuda Actual ({settings.currencySymbol})</label>
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="Igual al total si es nueva"
                    className={inputClasses}
                    value={newDebt.remainingAmount}
                    onChange={e => setNewDebt({...newDebt, remainingAmount: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">Fecha Límite (Opcional)</label>
                <input 
                  type="date" 
                  className={inputClasses}
                  value={newDebt.dueDate}
                  onChange={e => setNewDebt({...newDebt, dueDate: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">Color de Etiqueta</label>
                <div className="flex gap-3">
                  {colors.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewDebt({...newDebt, color: c})}
                      className={`w-10 h-10 rounded-full ${c} border-2 ${newDebt.color === c ? 'border-slate-800 scale-110' : 'border-transparent opacity-70 hover:opacity-100'} transition-all shadow-sm`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800">Cancelar</button>
                <button type="submit" className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 font-bold shadow-lg hover:-translate-y-1 transition-transform">Guardar Deuda</button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Debts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {debts.map(debt => {
          const paidAmount = debt.totalAmount - debt.remainingAmount;
          const progress = Math.min((paidAmount / debt.totalAmount) * 100, 100);
          const isPaid = debt.remainingAmount <= 0;
          
          return (
            <Card key={debt.id} className="relative overflow-visible group hover:rotate-1 transition-transform duration-300">
               <button 
                  onClick={() => onDeleteDebt(debt.id)}
                  className="absolute -top-3 -right-3 p-2 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-full text-slate-400 hover:text-red-500 hover:border-red-200 shadow-md opacity-0 group-hover:opacity-100 transition-all z-20"
                  title="Eliminar Deuda"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              <CardContent className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-2xl ${debt.color} border-2 border-white dark:border-slate-700 shadow-sm -rotate-3`}>
                      <TrendingDown className="w-8 h-8 text-slate-900" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-2xl font-hand">{debt.name}</h3>
                      {debt.dueDate && !isPaid && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1 font-medium">
                          <Calendar className="w-4 h-4" /> Vence: {new Date(debt.dueDate).toLocaleDateString()}
                        </p>
                      )}
                      {isPaid && (
                         <span className="text-sm font-bold text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-lg mt-1 inline-block">¡Pagada!</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wide">Restante</p>
                    <p className={`text-3xl font-bold font-hand ${isPaid ? 'text-green-500 line-through opacity-50' : 'text-slate-900 dark:text-white'}`}>{settings.currencySymbol}{debt.remainingAmount.toLocaleString()}</p>
                  </div>
                </div>

                {/* Marker Style Progress Bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-xl h-6 mb-6 overflow-hidden border border-slate-200 dark:border-slate-600 relative">
                    {/* Background stripes */}
                   <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%)', backgroundSize: '10px 10px'}}></div>
                  
                  <div 
                    className={`h-full ${debt.color.replace('200', '400')} transition-all duration-1000 relative border-r-4 border-white/50`}
                    style={{ width: `${progress}%` }}
                  >
                     {/* Marker texture */}
                     <div className="absolute inset-0 bg-white opacity-20" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'4\' height=\'4\' viewBox=\'0 0 4 4\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1 3h1v1H1V3zm2-2h1v1H3V1z\' fill=\'%23000000\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")' }}></div>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-6 text-sm font-bold text-slate-500 dark:text-slate-400">
                    <span>Pagado: {settings.currencySymbol}{paidAmount.toLocaleString()} ({progress.toFixed(0)}%)</span>
                    <span>Total: {settings.currencySymbol}{debt.totalAmount.toLocaleString()}</span>
                </div>

                {!isPaid && (
                  <button 
                    onClick={() => setSelectedDebt(debt)}
                    className={`w-full py-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 hover:border-${debt.color.split('-')[1]}-400 hover:bg-${debt.color.split('-')[1]}-50 dark:hover:bg-${debt.color.split('-')[1]}-900/20 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md`}
                  >
                    <DollarSign className="w-5 h-5" /> Registrar Abono
                  </button>
                )}
              </CardContent>
            </Card>
          );
        })}
        {debts.length === 0 && !showForm && (
           <div className="col-span-1 md:col-span-2 text-center py-16">
              <div className="inline-block p-6 rounded-full bg-green-100 dark:bg-green-900/30 mb-4 rotate-3">
                 <DollarSign className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-2xl font-bold font-hand text-slate-800 dark:text-white">¡Estás libre de deudas!</h3>
              <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">O quizás olvidaste registrar alguna...</p>
           </div>
        )}
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {selectedDebt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, rotate: -2 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 dark:border-slate-700"
            >
              <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                <h2 className="text-2xl font-bold font-hand text-slate-800 dark:text-white">Registrar Abono</h2>
                <button onClick={() => setSelectedDebt(null)} className="text-slate-400 hover:text-slate-800 dark:hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-8">
                 <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium">
                   Vas a registrar un pago para <span className="text-slate-800 dark:text-white font-bold">{selectedDebt.name}</span>. 
                   Restante: {settings.currencySymbol}{selectedDebt.remainingAmount.toLocaleString()}
                 </p>
                 <form onSubmit={handlePaymentSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">Monto a Pagar</label>
                      <div className="relative">
                        <span className="absolute left-3 top-3.5 text-slate-400 font-bold">$</span>
                        <input
                          type="number"
                          required
                          step="0.01"
                          min="0.01"
                          max={selectedDebt.remainingAmount}
                          className={`${inputClasses} pl-7`}
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          placeholder="0.00"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setSelectedDebt(null)}
                        className="flex-1 py-3 px-4 border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-3 px-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-lg hover:-translate-y-1 flex items-center justify-center gap-2"
                      >
                        <DollarSign className="w-5 h-5" /> Confirmar
                      </button>
                    </div>
                 </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};