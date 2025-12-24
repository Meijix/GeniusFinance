import React, { useState } from 'react';
import { SavingsGoal, AppSettings, Transaction, TransactionType, Category } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Plus, Target, Trash2, TrendingUp, Calendar, X, PiggyBank } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SavingsGoalsViewProps {
  goals: SavingsGoal[];
  settings: AppSettings;
  onAddGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  onUpdateGoal: (goal: SavingsGoal) => void;
  onDeleteGoal: (id: string) => void;
  onAddTransaction: (t: Omit<Transaction, 'id'>) => void;
}

export const SavingsGoalsView: React.FC<SavingsGoalsViewProps> = ({ 
  goals, 
  settings, 
  onAddGoal, 
  onUpdateGoal, 
  onDeleteGoal,
  onAddTransaction
}) => {
  const [showForm, setShowForm] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);
  const [contributionAmount, setContributionAmount] = useState('');

  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    deadline: '',
    color: 'bg-blue-500'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.name || !newGoal.targetAmount) return;

    onAddGoal({
      name: newGoal.name,
      targetAmount: parseFloat(newGoal.targetAmount),
      currentAmount: parseFloat(newGoal.currentAmount) || 0,
      deadline: newGoal.deadline,
      color: newGoal.color
    });

    setNewGoal({ name: '', targetAmount: '', currentAmount: '', deadline: '', color: 'bg-blue-500' });
    setShowForm(false);
  };

  const handleContributionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal || !contributionAmount) return;

    const amount = parseFloat(contributionAmount);
    if (isNaN(amount) || amount <= 0) return;

    // 1. Update Goal
    onUpdateGoal({
      ...selectedGoal,
      currentAmount: selectedGoal.currentAmount + amount
    });

    // 2. Create Transaction Log (Expense -> Investment/Savings)
    onAddTransaction({
      type: TransactionType.EXPENSE,
      category: Category.INVESTMENT, // Using Investment as proxy for Savings
      amount: amount,
      date: new Date().toISOString().split('T')[0],
      description: `Ahorro: ${selectedGoal.name}`
    });

    setSelectedGoal(null);
    setContributionAmount('');
  };

  const colors = [
    'bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-pink-500', 'bg-amber-500', 'bg-indigo-500'
  ];

  const inputClasses = "w-full p-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-slate-900 dark:text-white placeholder-slate-400 transition-all";
  const modalInputClasses = "w-full p-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none text-slate-800 placeholder-slate-400 transition-all font-medium";

  return (
    <div className="space-y-6 relative">
      
      {/* Header / Add Button */}
      {!showForm ? (
        <button 
          onClick={() => setShowForm(true)}
          className="w-full py-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-500 dark:text-slate-400 hover:text-blue-500 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group"
        >
          <div className="p-3 bg-white dark:bg-slate-800 rounded-full group-hover:bg-blue-500/20 transition-colors border border-slate-200 dark:border-slate-700">
            <Plus className="w-6 h-6" /> 
          </div>
          <span className="font-medium">Crear Nueva Meta de Ahorro</span>
        </button>
      ) : (
        <Card>
          <CardHeader>
             <CardTitle>Crear Nueva Meta</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Nombre de la Meta</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ej. Viaje a Japón, Fondo de Emergencia..."
                  className={inputClasses}
                  value={newGoal.name}
                  onChange={e => setNewGoal({...newGoal, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Monto Objetivo ({settings.currencySymbol})</label>
                  <input 
                    type="number" 
                    required
                    step="0.01"
                    className={inputClasses}
                    value={newGoal.targetAmount}
                    onChange={e => setNewGoal({...newGoal, targetAmount: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Ahorro Inicial ({settings.currencySymbol})</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className={inputClasses}
                    value={newGoal.currentAmount}
                    onChange={e => setNewGoal({...newGoal, currentAmount: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Fecha Límite (Opcional)</label>
                <input 
                  type="date" 
                  className={inputClasses}
                  value={newGoal.deadline}
                  onChange={e => setNewGoal({...newGoal, deadline: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Color de Acento</label>
                <div className="flex gap-3">
                  {colors.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewGoal({...newGoal, color: c})}
                      className={`w-8 h-8 rounded-full ${c} ${newGoal.color === c ? 'ring-2 ring-offset-2 ring-slate-400 dark:ring-slate-500 scale-110' : 'opacity-70 hover:opacity-100'} transition-all`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 shadow-lg shadow-blue-500/20">Guardar Meta</button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Goals List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map(goal => {
          const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
          
          return (
            <Card key={goal.id} className="relative overflow-visible group bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
               <button 
                  onClick={() => onDeleteGoal(goal.id)}
                  className="absolute -top-2 -right-2 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-slate-400 hover:text-red-500 hover:border-red-200 opacity-0 group-hover:opacity-100 transition-all z-20 shadow-lg"
                  title="Eliminar Meta"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${goal.color} bg-opacity-20 dark:bg-opacity-20`}>
                      <Target className={`w-6 h-6 ${goal.color.replace('bg-', 'text-')}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg">{goal.name}</h3>
                      {goal.deadline && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                          <Calendar className="w-3 h-3" /> {new Date(goal.deadline).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{settings.currencySymbol}{goal.currentAmount.toLocaleString()}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">de {settings.currencySymbol}{goal.targetAmount.toLocaleString()}</p>
                  </div>
                </div>

                {/* Neon Progress Bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-2 mb-6 overflow-hidden">
                  <div 
                    className={`h-full ${goal.color} transition-all duration-1000`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>

                <button 
                  onClick={() => setSelectedGoal(goal)}
                  className="w-full py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <TrendingUp className="w-4 h-4" /> Añadir Fondos
                </button>
              </CardContent>
            </Card>
          );
        })}
        {goals.length === 0 && !showForm && (
           <div className="col-span-1 md:col-span-2 text-center py-10 text-slate-500 dark:text-slate-400">
              No tienes metas de ahorro activas. ¡Crea una para empezar!
           </div>
        )}
      </div>

       {/* Contribution Modal */}
       <AnimatePresence>
        {selectedGoal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, rotate: 2 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100"
            >
              <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-2xl font-bold font-hand text-slate-800">Añadir Fondos</h2>
                <button onClick={() => setSelectedGoal(null)} className="text-slate-400 hover:text-slate-800">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-8">
                 <div className="flex items-center gap-3 mb-6 bg-blue-50 p-4 rounded-2xl border border-blue-100">
                    <PiggyBank className="w-8 h-8 text-blue-500" />
                    <div>
                       <p className="text-sm text-blue-400 font-bold uppercase tracking-wide">Destino</p>
                       <p className="text-lg font-bold text-slate-800 font-hand">{selectedGoal.name}</p>
                    </div>
                 </div>
                 
                 <form onSubmit={handleContributionSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Monto a Ahorrar</label>
                      <div className="relative">
                        <span className="absolute left-3 top-3.5 text-slate-400 font-bold">$</span>
                        <input
                          type="number"
                          required
                          step="0.01"
                          min="0.01"
                          className={`${modalInputClasses} pl-7`}
                          value={contributionAmount}
                          onChange={(e) => setContributionAmount(e.target.value)}
                          placeholder="0.00"
                          autoFocus
                        />
                      </div>
                      <p className="text-xs text-slate-400 mt-2">
                        Esto se registrará como un "gasto" en tus movimientos bajo la categoría de Inversiones.
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setSelectedGoal(null)}
                        className="flex-1 py-3 px-4 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-3 px-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg hover:-translate-y-1 flex items-center justify-center gap-2"
                      >
                        <TrendingUp className="w-5 h-5" /> Contribuir
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