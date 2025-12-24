import React, { useState, useRef, useEffect } from 'react';
import { Mic, Send, X, Loader2, Sparkles, StopCircle, Keyboard, Plus, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { processFinancialCommand } from '../services/geminiService';
import { Subscription, Transaction } from '../types';

interface QuickAddProps {
  onAddTransaction: (t: Omit<Transaction, 'id'>) => void;
  onAddSubscription: (s: Omit<Subscription, 'id'>) => void;
  onOpenManualTransaction: () => void;
  onOpenManualSubscription: () => void;
}

export const QuickAdd: React.FC<QuickAddProps> = ({ 
  onAddTransaction, 
  onAddSubscription, 
  onOpenManualTransaction,
  onOpenManualSubscription
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'IDLE' | 'RECORDING' | 'PROCESSING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [inputText, setInputText] = useState('');
  const [feedback, setFeedback] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await handleProcess(undefined, audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setMode('RECORDING');
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setFeedback("Permiso de micrófono denegado");
      setMode('ERROR');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mode === 'RECORDING') {
      mediaRecorderRef.current.stop();
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove data url prefix (e.g., "data:audio/wav;base64,")
        const base64Data = base64String.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleProcess = async (text?: string, audioBlob?: Blob) => {
    setMode('PROCESSING');
    setFeedback("Procesando con Gemini...");

    try {
      let result;
      
      if (audioBlob) {
        const base64 = await blobToBase64(audioBlob);
        result = await processFinancialCommand({ audioBase64: base64 });
      } else if (text) {
        result = await processFinancialCommand({ text });
      } else {
        throw new Error("No input");
      }

      if (result.intent === 'TRANSACTION' && result.transactionData) {
        onAddTransaction(result.transactionData);
        setFeedback(`Gasto registrado: ${result.transactionData.description} ($${result.transactionData.amount})`);
        setMode('SUCCESS');
      } else if (result.intent === 'SUBSCRIPTION' && result.subscriptionData) {
        onAddSubscription({ ...result.subscriptionData, currency: 'USD' }); // Default currency
        setFeedback(`Suscripción registrada: ${result.subscriptionData.name}`);
        setMode('SUCCESS');
      } else {
        setFeedback(result.error || "No entendí la solicitud.");
        setMode('ERROR');
      }
    } catch (e) {
      console.error(e);
      setFeedback("Error de conexión.");
      setMode('ERROR');
    }

    setTimeout(() => {
      if (mode !== 'RECORDING') {
        setMode('IDLE');
        setInputText('');
        if (mode === 'SUCCESS') setIsOpen(false);
      }
    }, 3000);
  };

  const handleSubmitText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    handleProcess(inputText);
  };

  return (
    <>
      {/* Floating Action Buttons Group */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 md:top-8 md:right-8 md:bottom-auto z-50 flex flex-col md:flex-row-reverse items-center gap-4">
          
          {/* Main Mic Button */}
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            onClick={() => setIsOpen(true)}
            className="w-16 h-16 bg-marker-red text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-all group border-4 border-white dark:border-slate-800"
            title="Nota Rápida AI"
          >
            <div className="absolute inset-0 rounded-full bg-marker-red opacity-30 group-hover:animate-ping" />
            <Mic className="w-8 h-8 relative z-10" />
          </motion.button>

          {/* Manual Add Transaction Button */}
          <motion.button
            initial={{ scale: 0, x: 20 }}
            animate={{ scale: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            onClick={onOpenManualTransaction}
            className="w-12 h-12 bg-slate-900 dark:bg-slate-700 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all border-2 border-white dark:border-slate-800"
            title="Nuevo Movimiento Manual"
          >
            <Plus className="w-6 h-6" />
          </motion.button>

           {/* Manual Add Subscription Button */}
           <motion.button
            initial={{ scale: 0, x: 20 }}
            animate={{ scale: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            onClick={onOpenManualSubscription}
            className="w-12 h-12 bg-white dark:bg-slate-600 text-slate-900 dark:text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all border-2 border-slate-100 dark:border-slate-700"
            title="Nueva Suscripción Manual"
          >
            <CreditCard className="w-6 h-6" />
          </motion.button>
        </div>
      )}

      {/* Expanded Modal/Panel */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4 bg-slate-900/30 backdrop-blur-sm">
            <motion.div
              initial={{ y: 100, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 100, opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative"
            >
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex items-center gap-2 text-marker-blue font-bold font-hand text-xl">
                  <Sparkles className="w-5 h-5" /> Nota Rápida AI
                </div>
                <button 
                  onClick={() => {
                    setIsOpen(false);
                    setMode('IDLE');
                    stopRecording();
                  }}
                  className="text-slate-400 hover:text-slate-800 dark:hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-8 flex flex-col items-center gap-8">
                
                {mode === 'RECORDING' ? (
                  <div className="flex flex-col items-center gap-4 py-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-red-400 blur-2xl opacity-30 animate-pulse rounded-full" />
                      <button
                        onClick={stopRecording}
                        className="relative w-24 h-24 bg-red-50 border-4 border-red-500 text-red-500 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all scale-110 shadow-lg"
                      >
                        <StopCircle className="w-12 h-12" />
                      </button>
                    </div>
                    <p className="text-red-500 animate-pulse font-bold font-hand text-2xl">Escuchando...</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Di algo como: "Gasté 15 dólares en comida hoy"</p>
                  </div>
                ) : mode === 'PROCESSING' ? (
                   <div className="flex flex-col items-center gap-6 py-6">
                     <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                     <p className="text-blue-600 font-bold text-lg animate-pulse">{feedback}</p>
                   </div>
                ) : mode === 'SUCCESS' ? (
                   <div className="flex flex-col items-center gap-6 py-6">
                     <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center shadow-sm">
                       <Sparkles className="w-8 h-8" />
                     </div>
                     <p className="text-green-700 dark:text-green-400 font-bold text-xl text-center font-hand">{feedback}</p>
                   </div>
                ) : mode === 'ERROR' ? (
                   <div className="flex flex-col items-center gap-6 py-6">
                     <p className="text-red-500 text-center font-bold text-lg">{feedback}</p>
                     <button onClick={() => setMode('IDLE')} className="text-sm text-slate-500 underline hover:text-slate-800 dark:hover:text-white">Intentar de nuevo</button>
                   </div>
                ) : (
                  // IDLE STATE
                  <div className="w-full space-y-8">
                     <p className="text-center text-slate-500 dark:text-slate-400 text-lg font-hand">
                       Graba un audio o escribe para agregar gastos, ingresos o suscripciones automáticamente.
                     </p>
                     
                     <div className="flex justify-center">
                        <button
                          onClick={startRecording}
                          className="w-20 h-20 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-marker-blue hover:text-marker-blue text-slate-400 rounded-full flex items-center justify-center transition-all shadow-lg group hover:scale-110"
                        >
                          <Mic className="w-10 h-10" />
                        </button>
                     </div>

                     <div className="relative">
                       <div className="absolute inset-0 flex items-center">
                         <span className="w-full border-t border-slate-200 dark:border-slate-700" />
                       </div>
                       <div className="relative flex justify-center text-xs uppercase font-bold tracking-widest">
                         <span className="bg-white dark:bg-slate-900 px-3 text-slate-400">o escribe</span>
                       </div>
                     </div>

                     <form onSubmit={handleSubmitText} className="relative">
                       <input
                         type="text"
                         value={inputText}
                         onChange={(e) => setInputText(e.target.value)}
                         placeholder="Ej: Pago de Netflix 15 USD mensual..."
                         className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white p-4 pr-14 rounded-2xl focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-400 dark:focus:border-blue-500 outline-none placeholder-slate-400 transition-all font-medium"
                         autoFocus
                       />
                       <button 
                        type="submit"
                        disabled={!inputText.trim()}
                        className="absolute right-3 top-3 p-2 bg-slate-900 dark:bg-slate-700 text-white rounded-xl hover:bg-slate-700 dark:hover:bg-slate-600 disabled:opacity-50 disabled:hover:bg-slate-900 transition-colors shadow-sm"
                       >
                         <Send className="w-5 h-5" />
                       </button>
                     </form>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};