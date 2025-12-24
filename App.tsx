import React, { useState, useEffect } from 'react';
import { LayoutDashboard, CreditCard, Sparkles, Plus, Menu, X, ArrowRightLeft, Settings, Target, TrendingDown, Landmark } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { SubscriptionForm } from './components/SubscriptionForm';
import { TransactionForm } from './components/TransactionForm';
import { TransactionsView } from './components/TransactionsView';
import { SettingsView } from './components/SettingsView';
import { SavingsGoalsView } from './components/SavingsGoalsView';
import { DebtsView } from './components/DebtsView';
import { AccountsView } from './components/AccountsView'; // Import
import { Insights } from './components/Insights';
import { QuickAdd } from './components/QuickAdd';
import { Subscription, Transaction, AppSettings, SavingsGoal, Debt, Account, TransactionType } from './types';
import { 
  loadSubscriptions, saveSubscriptions, 
  loadTransactions, saveTransactions, 
  loadSettings, saveSettings,
  loadGoals, saveGoals,
  loadDebts, saveDebts,
  loadAccounts, saveAccounts // Import
} from './services/storageService';
import { motion, AnimatePresence } from 'framer-motion';

enum View {
  DASHBOARD = 'Dashboard',
  ACCOUNTS = 'Cuentas', // New View
  TRANSACTIONS = 'Movimientos',
  GOALS = 'Metas Ahorro',
  DEBTS = 'Deudas',
  SUBSCRIPTIONS = 'Suscripciones',
  INSIGHTS = 'Insights AI',
  SETTINGS = 'Configuración'
}

type ModalType = 'SUBSCRIPTION' | 'TRANSACTION' | null;

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]); // New State
  const [settings, setSettings] = useState<AppSettings>({ monthlyBudget: 0, userName: 'Usuario', currencySymbol: '$', currencyCode: 'USD', theme: 'light' });
  
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setSubscriptions(loadSubscriptions());
    setTransactions(loadTransactions());
    setSettings(loadSettings());
    setGoals(loadGoals());
    setDebts(loadDebts());
    setAccounts(loadAccounts()); // Load
  }, []);

  // Theme Effect
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  useEffect(() => {
    saveSubscriptions(subscriptions);
  }, [subscriptions]);

  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveGoals(goals);
  }, [goals]);

  useEffect(() => {
    saveDebts(debts);
  }, [debts]);

  useEffect(() => {
    saveAccounts(accounts); // Save
  }, [accounts]);

  const handleAddSubscription = (newSub: Omit<Subscription, 'id'>) => {
    const sub: Subscription = {
      ...newSub,
      id: crypto.randomUUID(),
    };
    setSubscriptions(prev => [...prev, sub]);
  };

  // Enhanced handleAddTransaction to update Account Balances
  const handleAddTransaction = (newTrans: Omit<Transaction, 'id'>) => {
    const t: Transaction = {
      ...newTrans,
      id: crypto.randomUUID(),
    };
    setTransactions(prev => [...prev, t]);

    // If account is selected, update balance
    if (t.accountId) {
       setAccounts(prevAccounts => prevAccounts.map(acc => {
         if (acc.id === t.accountId) {
            const amount = t.amount;
            const newBalance = t.type === TransactionType.INCOME 
               ? acc.balance + amount 
               : acc.balance - amount;
            return { ...acc, balance: newBalance };
         }
         return acc;
       }));
    }
  };

  const handleAddGoal = (newGoal: Omit<SavingsGoal, 'id'>) => {
    const g: SavingsGoal = {
      ...newGoal,
      id: crypto.randomUUID(),
    };
    setGoals([...goals, g]);
  };

  const handleUpdateGoal = (updatedGoal: SavingsGoal) => {
    setGoals(goals.map(g => g.id === updatedGoal.id ? updatedGoal : g));
  };

  const handleAddDebt = (newDebt: Omit<Debt, 'id'>) => {
    const d: Debt = {
      ...newDebt,
      id: crypto.randomUUID(),
    };
    setDebts([...debts, d]);
  };

  const handleUpdateDebt = (updatedDebt: Debt) => {
    setDebts(debts.map(d => d.id === updatedDebt.id ? updatedDebt : d));
  };

  // Account Handlers
  const handleAddAccount = (newAcc: Omit<Account, 'id'>) => {
    const acc: Account = {
      ...newAcc,
      id: crypto.randomUUID()
    };
    setAccounts([...accounts, acc]);
  };

  const handleDeleteAccount = (id: string) => {
    setAccounts(accounts.filter(a => a.id !== id));
  };

  const handleDeleteSubscription = (id: string) => {
    setSubscriptions(subscriptions.filter(s => s.id !== id));
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const handleDeleteGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  const handleDeleteDebt = (id: string) => {
    setDebts(debts.filter(d => d.id !== id));
  };

  const handleClearData = () => {
    setSubscriptions([]);
    setTransactions([]);
    setGoals([]);
    setDebts([]);
    setAccounts([]);
    setSettings({ monthlyBudget: 0, userName: 'Usuario', currencySymbol: '$', currencyCode: 'USD', theme: 'light' });
    localStorage.clear(); 
  };

  const NavItem = ({ view, icon: Icon }: { view: View; icon: any }) => (
    <button
      onClick={() => {
        setCurrentView(view);
        setIsMobileMenuOpen(false);
      }}
      className={`relative flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-200 group ${
        currentView === view 
          ? 'text-slate-900 dark:text-white font-bold' 
          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
      }`}
    >
      {currentView === view && (
        <motion.div
          layoutId="activeTab"
          className="absolute inset-0 bg-marker-green/30 dark:bg-marker-green/20 rounded-lg -skew-x-3 scale-95"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
      <span className="relative z-10 flex items-center gap-3">
        <Icon className={`w-5 h-5 ${currentView === view ? 'text-slate-900 dark:text-white' : 'group-hover:text-slate-900 dark:group-hover:text-white transition-colors'}`} />
        <span className="font-hand text-lg">{view}</span>
      </span>
    </button>
  );

  return (
    <div className="min-h-screen font-sans flex flex-col md:flex-row relative dark:bg-slate-950 transition-colors duration-300">
      
      {/* Mobile Header */}
      <div className="md:hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 p-4 flex justify-between items-center sticky top-0 z-50 transition-colors">
        <div className="flex items-center gap-2 font-hand font-bold text-2xl text-slate-800 dark:text-white">
          <div className="w-8 h-8 bg-marker-green rounded-lg flex items-center justify-center text-slate-900 shadow-sm border border-slate-900/10">F</div>
          FinanzasGenius
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600 dark:text-slate-300">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border-r border-slate-100 dark:border-slate-800 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:block
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8 h-full flex flex-col">
          <div className="flex items-center gap-3 font-hand font-bold text-3xl text-slate-900 dark:text-white mb-10 hidden md:flex">
            <div className="relative">
               <div className="absolute inset-0 bg-marker-yellow rounded-full blur-sm opacity-50"></div>
               <div className="relative w-10 h-10 bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-slate-900 shadow-lg rotate-3">F</div>
            </div>
            <span className="tracking-tight">Finanzas</span>
          </div>

          <nav className="space-y-2 flex-1">
            <NavItem view={View.DASHBOARD} icon={LayoutDashboard} />
            <NavItem view={View.ACCOUNTS} icon={Landmark} />
            <NavItem view={View.TRANSACTIONS} icon={ArrowRightLeft} />
            <NavItem view={View.GOALS} icon={Target} />
            <NavItem view={View.DEBTS} icon={TrendingDown} />
            <NavItem view={View.SUBSCRIPTIONS} icon={CreditCard} />
            <NavItem view={View.INSIGHTS} icon={Sparkles} />
            <NavItem view={View.SETTINGS} icon={Settings} />
          </nav>

          {/* Manual Add Transaction Button - Sidebar */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
             <button 
              onClick={() => setActiveModal('TRANSACTION')}
              className="group relative w-full py-4 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl font-hand font-bold text-lg transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-slate-900/20 flex items-center justify-center gap-2 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <Plus className="w-5 h-5" /> Nuevo Movimiento
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-10 overflow-y-auto relative z-10 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              key={currentView}
              className="text-5xl font-hand font-bold text-slate-900 dark:text-white tracking-tight"
            >
              <span className="relative inline-block">
                {currentView}
                <span className="absolute bottom-1 left-0 w-full h-3 bg-marker-yellow/50 -z-10 -rotate-1 rounded-sm"></span>
              </span>
            </motion.h1>
          </div>
          
          {currentView === View.SUBSCRIPTIONS && (
             <button 
                onClick={() => setActiveModal('SUBSCRIPTION')}
                className="hidden md:flex px-6 py-2 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 font-hand font-bold text-lg hover:border-marker-green hover:bg-marker-green/10 transition-all items-center gap-2 shadow-sm"
              >
                <Plus className="w-5 h-5" /> Nueva Suscripción
              </button>
          )}
        </header>

        <div className="max-w-7xl mx-auto pb-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {currentView === View.DASHBOARD && (
                 <Dashboard 
                    subscriptions={subscriptions} 
                    transactions={transactions} 
                    settings={settings}
                    debts={debts} // Pass debts for reminder board
                 />
              )}
              
              {currentView === View.ACCOUNTS && (
                <AccountsView 
                  accounts={accounts}
                  settings={settings}
                  onAddAccount={handleAddAccount}
                  onDeleteAccount={handleDeleteAccount}
                />
              )}

              {currentView === View.INSIGHTS && <Insights subscriptions={subscriptions} transactions={transactions} />}
              
              {currentView === View.TRANSACTIONS && <TransactionsView transactions={transactions} onDelete={handleDeleteTransaction} />}
              
              {currentView === View.GOALS && (
                 <SavingsGoalsView 
                   goals={goals} 
                   settings={settings}
                   onAddGoal={handleAddGoal} 
                   onUpdateGoal={handleUpdateGoal} 
                   onDeleteGoal={handleDeleteGoal}
                   onAddTransaction={handleAddTransaction} 
                 />
              )}

              {currentView === View.DEBTS && (
                 <DebtsView
                   debts={debts}
                   settings={settings}
                   onAddDebt={handleAddDebt}
                   onUpdateDebt={handleUpdateDebt}
                   onDeleteDebt={handleDeleteDebt}
                   onAddTransaction={handleAddTransaction}
                 />
              )}

              {currentView === View.SETTINGS && (
                <SettingsView 
                  settings={settings} 
                  onSave={setSettings} 
                  subscriptions={subscriptions}
                  transactions={transactions}
                  onClearData={handleClearData}
                />
              )}

              {currentView === View.SUBSCRIPTIONS && (
                <div className="space-y-4">
                  {subscriptions.length === 0 ? (
                    <div className="text-center py-20 bg-white/50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                      <div className="mx-auto w-20 h-20 bg-marker-yellow/30 rounded-full flex items-center justify-center mb-4 rotate-3">
                        <CreditCard className="w-10 h-10 text-slate-600 dark:text-slate-300" />
                      </div>
                      <h3 className="text-2xl font-hand font-bold text-slate-800 dark:text-white">No hay suscripciones</h3>
                      <p className="text-slate-500 dark:text-slate-400 mt-2 mb-8 font-medium">Comienza agregando tus gastos fijos.</p>
                      <button 
                        onClick={() => setActiveModal('SUBSCRIPTION')}
                        className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 font-bold font-hand shadow-lg hover:-translate-y-1 transition-all"
                      >
                        Agregar Primera
                      </button>
                    </div>
                  ) : (
                    <>
                      <button 
                        onClick={() => setActiveModal('SUBSCRIPTION')}
                        className="w-full py-6 mb-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl flex flex-col items-center justify-center gap-2 text-slate-500 dark:text-slate-400 hover:text-marker-green hover:border-marker-green hover:bg-green-50 dark:hover:bg-green-900/10 transition-all group font-hand text-xl font-bold"
                      >
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm group-hover:scale-110 transition-transform border border-slate-200 dark:border-slate-700">
                          <Plus className="w-8 h-8" /> 
                        </div>
                        <span>Agregar Nueva Suscripción</span>
                      </button>

                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {subscriptions.map(sub => (
                          <div key={sub.id} className="group relative bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 shadow-sketch hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className="flex justify-between items-start mb-6">
                              <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-white font-hand font-bold text-2xl border border-slate-100 dark:border-slate-600">
                                  {sub.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <h3 className="font-bold text-xl text-slate-800 dark:text-white font-hand">{sub.name}</h3>
                                  <span className="text-xs px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 font-semibold">{sub.category}</span>
                                </div>
                              </div>
                              <button 
                                onClick={() => handleDeleteSubscription(sub.id)}
                                className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                title="Eliminar"
                              >
                                <X className="w-6 h-6" />
                              </button>
                            </div>
                            <div className="flex justify-between items-end border-t border-slate-50 dark:border-slate-700 pt-4">
                              <div>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Costo</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white font-hand">{settings.currencySymbol}{sub.amount}</p>
                              </div>
                              <div className="text-right">
                                 <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Próximo</p>
                                 <p className="text-sm font-medium text-slate-600 dark:text-slate-300 bg-marker-green/20 px-2 py-0.5 rounded-md inline-block">
                                   {new Date(sub.nextPaymentDate).toLocaleDateString()}
                                 </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Global Quick Add Button & Manual Add */}
      <QuickAdd 
        onAddTransaction={handleAddTransaction} 
        onAddSubscription={handleAddSubscription}
        onOpenManualTransaction={() => setActiveModal('TRANSACTION')}
        onOpenManualSubscription={() => setActiveModal('SUBSCRIPTION')}
      />

      {/* Modals with Backdrop Blur */}
      <AnimatePresence>
        {activeModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, rotate: -2 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100"
            >
              <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-2xl font-bold font-hand text-slate-800">
                  {activeModal === 'SUBSCRIPTION' ? 'Nueva Suscripción' : 'Nuevo Movimiento'}
                </h2>
                <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-800">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-8">
                {activeModal === 'SUBSCRIPTION' && (
                  <SubscriptionForm onAdd={handleAddSubscription} onClose={() => setActiveModal(null)} />
                )}
                {activeModal === 'TRANSACTION' && (
                   <TransactionForm onAdd={handleAddTransaction} onClose={() => setActiveModal(null)} accounts={accounts} />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;