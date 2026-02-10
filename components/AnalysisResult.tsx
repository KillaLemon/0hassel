import React from 'react';
import { Sparkles, Tag, FileText, Info } from 'lucide-react';

interface AnalysisResultProps {
  data: {
    altText: string;
    description: string;
    tags: string[];
  } | null | undefined;
  isLoading: boolean;
  onAnalyze: () => void;
  hasApiKey: boolean;
}

export const AnalysisResult: React.FC<AnalysisResultProps> = ({ data, isLoading, onAnalyze, hasApiKey }) => {
  
  if (!hasApiKey) return null;

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/30 dark:to-slate-900 rounded-2xl shadow-sm border border-indigo-100 dark:border-indigo-900/50 p-6 space-y-4 transition-colors duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-slate-900 dark:text-white">AI Analysis & SEO</h3>
        </div>
        {!data && !isLoading && (
            <button 
                onClick={onAnalyze}
                className="text-xs font-semibold bg-indigo-600 text-white px-3 py-1.5 rounded-full hover:bg-indigo-700 transition-colors shadow-sm"
            >
                Generate Metadata
            </button>
        )}
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-8 space-y-3">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium animate-pulse">Consulting Gemini...</p>
        </div>
      )}

      {data && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <Info className="w-3 h-3" />
                Alt Text
            </div>
            <p className="text-sm text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700 select-all">
                {data.altText}
            </p>
          </div>

          <div className="space-y-1.5">
             <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <FileText className="w-3 h-3" />
                Description
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {data.description}
            </p>
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <Tag className="w-3 h-3" />
                Suggested Tags
            </div>
            <div className="flex flex-wrap gap-2">
                {data.tags.map((tag, i) => (
                    <span key={i} className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs text-slate-600 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors cursor-default">
                        #{tag}
                    </span>
                ))}
            </div>
          </div>
        </div>
      )}
      
      {!data && !isLoading && (
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Use Gemini to automatically generate SEO-friendly alt text, descriptions, and tags for your compressed image.
          </p>
      )}
    </div>
  );
};