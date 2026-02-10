import React from 'react';
import { Zap } from 'lucide-react';

export const Header: React.FC = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5 group cursor-pointer" onClick={() => window.location.reload()}>
          <div className="bg-slate-900 dark:bg-white p-1.5 rounded-lg shadow-sm group-hover:rotate-3 transition-transform duration-300">
            <Zap className="w-6 h-6 text-white dark:text-slate-900 fill-current" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">
            0<span className="text-primary-600 dark:text-primary-400">Hassel</span>
          </h1>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <button onClick={() => scrollToSection('guide')} className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">How it Works</button>
          <button onClick={() => scrollToSection('privacy')} className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Privacy</button>
          <button onClick={() => scrollToSection('contact')} className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Contact</button>
        </nav>
      </div>
    </header>
  );
};