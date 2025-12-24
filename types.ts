export enum Frequency {
  MONTHLY = 'Mensual',
  YEARLY = 'Anual',
  WEEKLY = 'Semanal'
}

export enum TransactionType {
  INCOME = 'ingreso',
  EXPENSE = 'gasto'
}

export enum Category {
  // Income
  SALARY = 'Salario',
  FREELANCE = 'Freelance',
  INVESTMENT = 'Inversiones',
  
  // Expenses
  HOUSING = 'Vivienda',
  TRANSPORT = 'Transporte',
  FOOD = 'Comida',
  ENTERTAINMENT = 'Entretenimiento',
  UTILITIES = 'Servicios',
  SOFTWARE = 'Software',
  FITNESS = 'Salud y Fitness',
  SHOPPING = 'Compras',
  DEBT = 'Deudas',
  OTHER = 'Otro'
}

export interface Account {
  id: string;
  name: string;
  type: 'CASH' | 'BANK' | 'SAVINGS' | 'WALLET' | 'OTHER';
  balance: number;
  color: string;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  currency: string;
  frequency: Frequency;
  category: Category;
  nextPaymentDate: string; 
  description?: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: Category;
  date: string;
  description: string;
  accountId?: string; // Optional link to an account
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  color: string;
}

export interface Debt {
  id: string;
  name: string;
  totalAmount: number; // Monto original
  remainingAmount: number; // Lo que falta pagar
  dueDate?: string;
  interestRate?: number;
  color: string;
}

export interface AppSettings {
  monthlyBudget: number;
  userName: string;
  currencySymbol: string;
  currencyCode: string;
  theme: 'light' | 'dark';
}

export interface FinancialInsight {
  title: string;
  message: string;
  type: 'warning' | 'success' | 'info';
  savingsPotential?: number;
}