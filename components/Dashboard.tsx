import React, { useMemo } from 'react';
import { Subscription, Transaction, TransactionType, Frequency, AppSettings, Debt } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { DollarSign, TrendingUp, TrendingDown, Wallet, Calendar, AlertTriangle, CheckCircle, BellRing, Pin } from 'lucide-react';

interface DashboardProps {
  subscriptions: Subscription[];
  transactions: Transaction[];
  settings: AppSettings;
  debts?: Debt[];
}

// Marker / Pastel Palette
const COLORS = ['#bef264', '#fde047', '#f87171', '#60a5fa', '#c084fc', '#fb923c', '#2dd4bf'];

export const Dashboard: React.FC<DashboardProps> = ({ subscriptions, transactions, settings, debts = [] }) => {
  const currency = settings.currencySymbol || '$';
  
  const stats = useMemo(() => {
    // 1. Calculate Monthly Fixed Costs
    let monthlySubsCost = 0;
    subscriptions.forEach(sub => {
      let cost = sub.amount;
      if (sub.frequency === Frequency.YEARLY) cost = sub.amount / 12;
      if (sub.frequency === Frequency.WEEKLY) cost = sub.amount * 4;
      monthlySubsCost += cost;
    });

    // 2. Calculate Transaction Totals (Current Month)
    const now = new Date();
    const currentMonthTrans = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    const income = currentMonthTrans
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);

    const variableExpenses = currentMonthTrans
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = variableExpenses + monthlySubsCost;
    const balance = income - totalExpenses;

    // Budget Calculations
    const budget = settings.monthlyBudget || 0;
    const budgetProgress = budget > 0 ? (totalExpenses / budget) * 100 : 0;
    const remainingBudget = Math.max(0, budget - totalExpenses);

    // 3. Category Distribution
    const categoryTotals: Record<string, number> = {};
    
    // Add subs to categories
    subscriptions.forEach(sub => {
       let cost = sub.amount;
       if (sub.frequency === Frequency.YEARLY) cost = sub.amount / 12;
       if (sub.frequency === Frequency.WEEKLY) cost = sub.amount * 4;
       categoryTotals[sub.category] = (categoryTotals[sub.category] || 0) + cost;
    });

    // Add expenses to categories
    currentMonthTrans.filter(t => t.type === TransactionType.EXPENSE).forEach(t => {
       categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    const categoryData = Object.keys(categoryTotals).map(key => ({
      name: key,
      value: Math.round(categoryTotals[key] * 100) / 100
    }));

    // 4. Upcoming Reminders (Board)
    const reminders = [
      ...subscriptions.map(s => ({
        id: s.id,
        title: s.name,
        amount: s.amount,
        date: s.nextPaymentDate,
        type: 'SUBSCRIPTION',
        isPaid: false
      })),
      ...debts.filter(d => d.dueDate && d.remainingAmount > 0).map(d => ({
        id: d.id,
        title: `Deuda: ${d.name}`,
        amount: d.remainingAmount, // Full debt or installment? Assuming reminder for debt
        date: d.dueDate!,
        type: 'DEBT',
        isPaid: false
      }))
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 5);

    return { monthlySubsCost, income, totalExpenses, balance, categoryData, budget, budgetProgress, remainingBudget, reminders };
  }, [subscriptions, transactions, settings, debts]);

  const StatCard = ({ title, value, icon: Icon, color, subtext }: { title: string, value: string, icon: any, color: string, subtext?: string }) => (
    <Card className="border-0">
      <CardContent className="flex items-center p-6">
        <div className={`p-4 rounded-2xl ${color} bg-opacity-20 mr-5 rotate-3`}>
          <Icon className={`w-8 h-8 ${color.replace('bg-', 'text-').replace('-200', '-600')}`} />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wide">{title}</p>
          <h3 className="text-3xl font-bold font-hand text-slate-900 dark:text-white">{value}</h3>
          {subtext && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{subtext}</p>}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      
      {/* Top Section: Budget & Reminders Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Budget Bar */}
        <div className="lg:col-span-2 space-y-6">
           {stats.budget > 0 && (
            <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-8 shadow-sketch">
              <div className="relative z-10">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <h3 className="text-xl font-bold font-hand text-slate-800 dark:text-white">Presupuesto Mensual</h3>
                    <p className="text-4xl font-bold mt-1 text-slate-900 dark:text-white font-hand">
                      {currency}{Math.round(stats.remainingBudget).toLocaleString()}
                      <span className="text-lg text-slate-400 dark:text-slate-500 font-sans font-medium ml-2">restantes</span>
                    </p>
                  </div>
                  <div className="text-right">
                     <span className={`inline-block px-3 py-1 rounded-lg text-sm font-bold ${
                       stats.budgetProgress > 100 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                     }`}>
                       {stats.budgetProgress.toFixed(0)}% Usado
                     </span>
                  </div>
                </div>
                
                {/* Custom Progress Bar */}
                <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden flex">
                   <div 
                    className={`h-full transition-all duration-1000 ${
                      stats.budgetProgress > 100 ? 'bg-red-500' : 'bg-slate-900 dark:bg-blue-500'
                    }`} 
                    style={{ width: `${Math.min(stats.budgetProgress, 100)}%` }} 
                   />
                   {stats.budgetProgress > 100 && (
                      <div className="h-full bg-red-500 animate-pulse w-full" style={{ width: '100%' }} />
                   )}
                </div>
                <p className="text-sm text-slate-400 dark:text-slate-500 mt-2 font-medium">
                  Has gastado {currency}{Math.round(stats.totalExpenses).toLocaleString()} de {currency}{stats.budget.toLocaleString()}
                </p>
              </div>
            </div>
           )}

           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard 
                title="Balance" 
                value={`${currency}${stats.balance.toLocaleString()}`} 
                icon={Wallet} 
                color="bg-blue-200"
                subtext={stats.balance > 0 ? "+ Ahorro potencial" : "- Déficit"}
              />
              <StatCard 
                title="Gastos Totales" 
                value={`${currency}${stats.totalExpenses.toLocaleString()}`} 
                icon={TrendingDown} 
                color="bg-red-200"
                subtext="Fijos + Variables"
              />
              <StatCard 
                title="Ingresos" 
                value={`${currency}${stats.income.toLocaleString()}`} 
                icon={TrendingUp} 
                color="bg-green-200"
              />
           </div>
        </div>

        {/* Reminders Board */}
        <div className="lg:col-span-1">
          <Card className="h-full">
             <CardHeader className="bg-yellow-50 dark:bg-slate-800/50 border-b border-yellow-100 dark:border-slate-700/50">
               <CardTitle className="flex items-center gap-2">
                 <Pin className="w-5 h-5 text-marker-black dark:text-slate-300" /> Tablero de Avisos
               </CardTitle>
             </CardHeader>
             <CardContent className="p-0">
               {stats.reminders.length === 0 ? (
                 <div className="p-8 text-center text-slate-400 dark:text-slate-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>¡Todo al día!</p>
                 </div>
               ) : (
                 <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
                   {stats.reminders.map((reminder, idx) => (
                     <div key={`${reminder.type}-${reminder.id}-${idx}`} className="p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                        <div className="flex-shrink-0 w-12 text-center bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                           <span className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{new Date(reminder.date).toLocaleString('default', { month: 'short' })}</span>
                           <span className="block text-xl font-bold text-slate-800 dark:text-slate-200 leading-none">{new Date(reminder.date).getDate()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{reminder.title}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Próximo Vencimiento</p>
                        </div>
                        <div className="text-right">
                           <span className="block font-hand font-bold text-lg text-slate-900 dark:text-white">{currency}{reminder.amount}</span>
                        </div>
                     </div>
                   ))}
                 </div>
               )}
             </CardContent>
          </Card>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="min-h-[400px]">
          <CardHeader>
            <CardTitle>Gastos por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
             {stats.categoryData.length > 0 ? (
               <div className="h-[300px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie
                       data={stats.categoryData}
                       cx="50%"
                       cy="50%"
                       innerRadius={60}
                       outerRadius={80}
                       paddingAngle={5}
                       dataKey="value"
                     >
                       {stats.categoryData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                       ))}
                     </Pie>
                     <Tooltip 
                       contentStyle={{ 
                         backgroundColor: '#1e293b', 
                         borderColor: '#334155', 
                         borderRadius: '12px', 
                         color: '#fff',
                         boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                       }} 
                       itemStyle={{ color: '#fff' }}
                     />
                     <Legend verticalAlign="bottom" height={36} />
                   </PieChart>
                 </ResponsiveContainer>
               </div>
             ) : (
               <div className="h-[300px] flex items-center justify-center text-slate-400 dark:text-slate-500 text-center">
                  <p>Añade gastos para ver la distribución</p>
               </div>
             )}
          </CardContent>
        </Card>

        {/* Quick Tips / Insight Placeholder */}
        <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-0 shadow-lg dark:shadow-indigo-900/20">
          <CardContent className="p-8 flex flex-col justify-between h-full">
             <div>
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                  <BellRing className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold font-hand mb-2">Consejo del Día</h3>
                <p className="text-indigo-100 text-lg leading-relaxed">
                  "La regla 50/30/20 es un gran punto de partida: 50% necesidades, 30% deseos y 20% ahorros. ¿Cómo se ve tu gráfico hoy?"
                </p>
             </div>
             <div className="mt-8 pt-6 border-t border-white/20">
                <p className="text-sm font-medium text-indigo-200">
                   Recuerda revisar tus metas de ahorro mensualmente.
                </p>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};