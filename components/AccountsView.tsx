import React, { useState } from 'react';
import { Account, AppSettings } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Plus, Wallet, Landmark, CreditCard, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AccountsViewProps {
  accounts: Account[];
  settings: AppSettings;
  onAddAccount: (acc: Omit<Account, 'id'>) => void;
  onDeleteAccount: (id: string) => void;
}

export const AccountsView: React.FC<AccountsViewProps> = ({ accounts, settings, onAddAccount, onDeleteAccount }) => {
  const [showForm, setShowForm] = useState(false);
  const [newAccount, setNewAccount] = useState({
    name: '',
    type: 'BANK',
    balance: '',
    color: 'bg-blue-200'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccount.name || !newAccount.balance) return;

    onAddAccount({
      name: newAccount.name,
      type: newAccount.type as any,
      balance: parseFloat(newAccount.balance),
      color: newAccount.color
    });

    setNewAccount({ name: '', type: 'BANK', balance: '', color: 'bg-blue-200' });
    setShowForm(false);
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'CASH': return <Wallet className="w-6 h-6" />;
      case 'BANK': return <Landmark className="w-6 h-6" />;
      default: return <CreditCard className="w-6 h-6" />;
    }
  };

  const colors = ['bg-blue-200', 'bg-green-200', 'bg-yellow-200', 'bg-purple-200', 'bg-pink-200', 'bg-slate-200'];
  const inputClasses = "w-full p-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-400 dark:focus:border-blue-500 outline-none text-slate-800 dark:text-white placeholder-slate-400 transition-all font-medium";

  return (
    <div className="space-y-8">
      
      {/* Add Button */}
      {!showForm ? (
        <button 
          onClick={() => setShowForm(true)}
          className="w-full py-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl flex flex-col items-center justify-center gap-2 text-slate-500 dark:text-slate-400 hover:text-marker-blue hover:border-marker-blue hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group font-hand text-xl font-bold"
        >
          <div className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm group-hover:scale-110 transition-transform border border-slate-200 dark:border-slate-700">
            <Plus className="w-8 h-8" /> 
          </div>
          <span>Agregar Cuenta o Lugar</span>
        </button>
      ) : (
        <Card className="rotate-1">
          <CardHeader>
             <CardTitle className="flex justify-between items-center">
                Nueva Cuenta
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-800 dark:hover:text-white"><X /></button>
             </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">Nombre</label>
                <input 
                  type="text" required placeholder="Ej. Billetera, Banco X, Ahorros"
                  className={inputClasses}
                  value={newAccount.name}
                  onChange={e => setNewAccount({...newAccount, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">Saldo Actual</label>
                  <input 
                    type="number" required step="0.01" className={inputClasses}
                    value={newAccount.balance}
                    onChange={e => setNewAccount({...newAccount, balance: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">Tipo</label>
                  <select 
                    className={inputClasses}
                    value={newAccount.type}
                    onChange={e => setNewAccount({...newAccount, type: e.target.value})}
                  >
                    <option value="BANK">Banco</option>
                    <option value="CASH">Efectivo</option>
                    <option value="WALLET">Billetera Digital</option>
                    <option value="SAVINGS">Ahorros</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">Color</label>
                <div className="flex gap-3">
                  {colors.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewAccount({...newAccount, color: c})}
                      className={`w-10 h-10 rounded-full ${c} border-2 ${newAccount.color === c ? 'border-slate-800 scale-110' : 'border-transparent opacity-70 hover:opacity-100'} transition-all shadow-sm`}
                    />
                  ))}
                </div>
              </div>
              <button type="submit" className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 font-bold shadow-lg hover:-translate-y-1 transition-transform mt-4">Guardar Cuenta</button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {accounts.map(acc => (
           <motion.div 
             key={acc.id}
             whileHover={{ y: -5 }}
             className={`relative overflow-hidden rounded-2xl p-6 ${acc.color} shadow-sketch border-2 border-white/50 dark:border-slate-600/50`}
           >
              {/* Card Texture - Fix quotes to avoid syntax errors */}
              <div className="absolute inset-0 opacity-30 mix-blend-overlay" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width=%226%22 height=%226%22 viewBox=%220 0 6 6%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22%23000000%22 fill-opacity=%220.2%22 fill-rule=%22evenodd%22%3E%3Cpath d=%22M5 0h1L0 6V5zM6 5v1H5z%22/%3E%3C/g%3E%3C/svg%3E')"}}></div>

              <button 
                  onClick={() => onDeleteAccount(acc.id)}
                  className="absolute top-2 right-2 p-2 text-slate-600/50 hover:text-red-600 hover:bg-white/50 rounded-full transition-all z-10"
                >
                  <Trash2 className="w-5 h-5" />
              </button>

              <div className="relative z-10 flex flex-col h-32 justify-between">
                 <div className="flex items-start gap-3">
                    <div className="p-2 bg-white/40 rounded-xl backdrop-blur-sm text-slate-800">
                      {getIcon(acc.type)}
                    </div>
                    <div>
                      <h3 className="font-bold font-hand text-2xl text-slate-900 leading-none">{acc.name}</h3>
                      <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">{acc.type}</span>
                    </div>
                 </div>
                 
                 <div className="text-right">
                    <p className="text-xs font-bold text-slate-600 uppercase mb-1">Saldo Disponible</p>
                    <p className="text-4xl font-bold text-slate-900 tracking-tight font-hand">
                       {settings.currencySymbol}{acc.balance.toLocaleString()}
                    </p>
                 </div>
              </div>
           </motion.div>
         ))}
      </div>
      
      {accounts.length === 0 && !showForm && (
        <div className="text-center py-10 opacity-50 font-hand text-xl text-slate-500 dark:text-slate-400">
           No has registrado cuentas ni lugares donde guardas tu dinero.
        </div>
      )}
    </div>
  );
};