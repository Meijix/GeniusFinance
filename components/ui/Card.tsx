import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <motion.div 
      whileHover={{ y: -4, rotate: 0.5 }}
      transition={{ type: "spring", stiffness: 300 }}
      onClick={onClick}
      className={`relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-100 dark:border-slate-700 rounded-3xl shadow-sketch hover:shadow-xl transition-all ${className}`}
    >
      {children}
    </motion.div>
  );
};

export const CardHeader: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`px-6 py-5 border-b border-slate-100 dark:border-slate-700 ${className}`}>
    {children}
  </div>
);

export const CardTitle: React.FC<CardProps> = ({ children, className = '' }) => (
  <h3 className={`text-xl font-hand font-bold text-slate-800 dark:text-slate-100 tracking-wide ${className}`}>
    {children}
  </div>
);

export const CardContent: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);