import React from 'react';

interface AdProps {
  type: 'banner' | 'sidebar' | 'square';
  className?: string;
  label?: string;
}

export const AdSpace: React.FC<AdProps> = ({ type, className = '', label = "Advertisement" }) => {
  const getSizeClasses = () => {
    switch (type) {
      case 'banner':
        return 'w-full h-full min-h-[60px] md:min-h-[80px]';
      case 'sidebar':
        return 'w-full h-full min-h-[400px]';
      case 'square':
        return 'w-full max-w-[300px] aspect-square mx-auto';
      default:
        return 'w-full h-24';
    }
  };

  return (
    <div className={`bg-slate-100 dark:bg-slate-900/50 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex flex-col items-center justify-center p-4 text-slate-400 dark:text-slate-500 text-sm font-medium uppercase tracking-wider transition-all hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:border-slate-400 dark:hover:border-slate-600 cursor-default ${getSizeClasses()} ${className}`}>
      <span className="text-center">{label}</span>
      <span className="text-[10px] opacity-50 mt-1">Ad Space</span>
    </div>
  );
};