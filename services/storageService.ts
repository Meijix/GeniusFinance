import { Subscription, Transaction, AppSettings, SavingsGoal, Debt, Account } from '../types';

const SUBS_KEY = 'finanzas_genius_subscriptions';
const TRANS_KEY = 'finanzas_genius_transactions';
const SETTINGS_KEY = 'finanzas_genius_settings';
const GOALS_KEY = 'finanzas_genius_goals';
const DEBTS_KEY = 'finanzas_genius_debts';
const ACCOUNTS_KEY = 'finanzas_genius_accounts';

export const saveSubscriptions = (subs: Subscription[]): void => {
  try {
    localStorage.setItem(SUBS_KEY, JSON.stringify(subs));
  } catch (error) {
    console.error("Failed to save subscriptions", error);
  }
};

export const loadSubscriptions = (): Subscription[] => {
  try {
    const data = localStorage.getItem(SUBS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load subscriptions", error);
    return [];
  }
};

export const saveTransactions = (trans: Transaction[]): void => {
  try {
    localStorage.setItem(TRANS_KEY, JSON.stringify(trans));
  } catch (error) {
    console.error("Failed to save transactions", error);
  }
};

export const loadTransactions = (): Transaction[] => {
  try {
    const data = localStorage.getItem(TRANS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load transactions", error);
    return [];
  }
};

export const saveSettings = (settings: AppSettings): void => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Failed to save settings", error);
  }
};

export const loadSettings = (): AppSettings => {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : { monthlyBudget: 0, userName: 'Usuario', currencySymbol: '$', currencyCode: 'USD', theme: 'light' };
  } catch (error) {
    return { monthlyBudget: 0, userName: 'Usuario', currencySymbol: '$', currencyCode: 'USD', theme: 'light' };
  }
};

export const saveGoals = (goals: SavingsGoal[]): void => {
  try {
    localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
  } catch (error) {
    console.error("Failed to save goals", error);
  }
};

export const loadGoals = (): SavingsGoal[] => {
  try {
    const data = localStorage.getItem(GOALS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load goals", error);
    return [];
  }
};

export const saveDebts = (debts: Debt[]): void => {
  try {
    localStorage.setItem(DEBTS_KEY, JSON.stringify(debts));
  } catch (error) {
    console.error("Failed to save debts", error);
  }
};

export const loadDebts = (): Debt[] => {
  try {
    const data = localStorage.getItem(DEBTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load debts", error);
    return [];
  }
};

export const saveAccounts = (accounts: Account[]): void => {
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch (error) {
    console.error("Failed to save accounts", error);
  }
};

export const loadAccounts = (): Account[] => {
  try {
    const data = localStorage.getItem(ACCOUNTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load accounts", error);
    return [];
  }
};