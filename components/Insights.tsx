import React, { useState } from 'react';
import { Subscription, Transaction } from '../types';
import { analyzeFinances } from '../services/geminiService';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { BrainCircuit, RefreshCw, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface InsightsProps {
  subscriptions: Subscription[];
  transactions: Transaction[];
}

export const Insights: React.FC<InsightsProps> = ({ subscriptions, transactions }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (subscriptions.length === 0 && transactions.length === 0) {
      setAnalysis("Agrega suscripciones o movimientos para que pueda analizarlos.");
      return;
    }
    
    setLoading(true);
    const result = await analyzeFinances(subscriptions, transactions);
    setAnalysis(result);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-indigo-600 to-purple-600 dark:from-indigo-900 dark:to-purple-900 border-0 shadow-xl relative overflow-hidden text-white">
        <div className="absolute inset-0 bg-grid-white/[0.1] bg-[size:20px_20px]" />
        <CardContent className="p-10 text-center relative z-10">
          <div className="flex justify-center mb-6">
            <div className="bg-white/20 p-5 rounded-2xl shadow-inner border border-white/30 backdrop-blur-sm">
              <BrainCircuit className="w-14 h-14 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-3 tracking-tight font-hand">Asistente Financiero AI</h2>
          <p className="text-indigo-100 max-w-lg mx-auto mb-8 text-lg font-medium">
            Utiliza la potencia de Gemini para analizar tus finanzas, detectar gastos hormiga y proyectar ahorros.
          </p>
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="group relative inline-flex items-center px-8 py-3.5 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-100 to-transparent translate-x-[-200%] group-hover:animate-shimmer" />
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Analizando Datos...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generar Informe Inteligente
              </>
            )}
          </button>
        </CardContent>
      </Card>

      {analysis && (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-l-4 border-l-indigo-500 shadow-md">
            <CardHeader className="bg-indigo-50 dark:bg-indigo-900/20 border-b border-indigo-100 dark:border-indigo-900/30">
              <CardTitle className="flex items-center gap-3 text-indigo-700 dark:text-indigo-300">
                <SparklesIcon className="w-6 h-6 text-yellow-400 drop-shadow-md" />
                Análisis de Gemini
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate dark:prose-invert max-w-none p-8">
              <div className="whitespace-pre-line text-slate-700 dark:text-slate-300 leading-relaxed text-lg">
                {analysis}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

const SparklesIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813a3.75 3.75 0 002.576-2.576l.813-2.846A.75.75 0 019 4.5zM9 15.75l.18.63a1.5 1.5 0 01-1.03.39l-2.028.58a.75.75 0 11-.414-1.442l2.028-.58a.25.25 0 00.172-.172l.58-2.028a.75.75 0 111.442.414l-.58 2.028a1.5 1.5 0 01-.35 1.18zM15.75 9l.63.18a1.5 1.5 0 01.39 1.03l.58 2.028a.75.75 0 11-1.442.414l-.58-2.028a.25.25 0 00-.172-.172l-2.028-.58a.75.75 0 11.414-1.442l2.028.58a1.5 1.5 0 011.18.35z" clipRule="evenodd" />
  </svg>
);