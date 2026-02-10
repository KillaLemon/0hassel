import React from 'react';
import { Settings, Sliders, Smartphone, Image as ImageIcon, Maximize2, MoveHorizontal, Check } from 'lucide-react';
import { CompressionSettings, ResizeUnit } from '../types.ts';

interface ControlsProps {
  settings: CompressionSettings;
  onChange: (newSettings: CompressionSettings) => void;
  originalDimensions: { width: number; height: number };
}

export const CompressionControls: React.FC<ControlsProps> = ({ settings, onChange, originalDimensions }) => {
  
  const update = (key: keyof CompressionSettings, value: any) => {
    onChange({ ...settings, [key]: value });
  };

  const handleFormatChange = (format: string, extension: string) => {
      onChange({ 
          ...settings, 
          format: format as any, 
          outputExtension: extension as any 
      });
  };

  // Unit conversion helpers
  const DPI = 96;
  const toUnit = (px: number, unit: ResizeUnit): number => {
    switch (unit) {
      case 'in': return Number((px / DPI).toFixed(2));
      case 'cm': return Number((px * 2.54 / DPI).toFixed(2));
      case 'mm': return Number((px * 25.4 / DPI).toFixed(2));
      case '%': return Number(((px / originalDimensions.width) * 100).toFixed(0));
      default: return Math.round(px);
    }
  };

  const toPx = (val: number, unit: ResizeUnit, isWidth: boolean): number => {
    switch (unit) {
      case 'in': return Math.round(val * DPI);
      case 'cm': return Math.round(val * DPI / 2.54);
      case 'mm': return Math.round(val * DPI / 25.4);
      case '%': return Math.round((val / 100) * (isWidth ? originalDimensions.width : originalDimensions.height));
      default: return Math.round(val);
    }
  };

  const handleDimensionChange = (val: number, isWidth: boolean) => {
    const newPx = toPx(val, settings.resizeUnit, isWidth);
    
    if (settings.maintainAspectRatio) {
      const ratio = originalDimensions.width / originalDimensions.height;
      if (isWidth) {
        update('width', newPx);
        update('height', Math.round(newPx / ratio));
      } else {
        update('height', newPx);
        update('width', Math.round(newPx * ratio));
      }
    } else {
      update(isWidth ? 'width' : 'height', newPx);
    }
  };

  // Calculate current percentage for the slider
  const currentScale = Math.round((settings.width / originalDimensions.width) * 100);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 transition-colors duration-200">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-slate-800">
        
        {/* SECTION 1: QUALITY & FORMAT */}
        <div className="space-y-4 lg:pr-4">
             <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Quality & Format</h3>
             </div>

             <div className="space-y-3">
                 {/* Format Selection Buttons */}
                 <div>
                    <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Export Format</label>
                    <div className="grid grid-cols-4 gap-1.5">
                        {[
                            { label: 'JPG', fmt: 'image/jpeg', ext: 'jpg' },
                            { label: 'JPEG', fmt: 'image/jpeg', ext: 'jpeg' },
                            { label: 'PNG', fmt: 'image/png', ext: 'png' },
                            { label: 'WEBP', fmt: 'image/webp', ext: 'webp' }
                        ].map((opt) => (
                            <button
                                key={opt.ext}
                                onClick={() => handleFormatChange(opt.fmt, opt.ext)}
                                className={`px-1 py-1.5 rounded-md text-[10px] font-bold transition-all border ${
                                    settings.outputExtension === opt.ext
                                    ? 'bg-primary-600 border-primary-600 text-white shadow-sm'
                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                 </div>

                 {/* Mode Toggle */}
                 <div className="p-0.5 bg-slate-100 dark:bg-slate-800 rounded-md flex text-xs">
                    <button
                        onClick={() => update('targetSizeKB', null)}
                        className={`flex-1 py-1 rounded-sm font-medium transition-all ${
                            settings.targetSizeKB === null
                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                        }`}
                    >
                        Quality
                    </button>
                    <button
                        onClick={() => update('targetSizeKB', 500)}
                        className={`flex-1 py-1 rounded-sm font-medium transition-all ${
                            settings.targetSizeKB !== null
                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                        }`}
                    >
                        Target Size
                    </button>
                 </div>

                 {/* Slider or Input */}
                 {settings.targetSizeKB === null ? (
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[10px]">
                             <span className="text-slate-500">Compression</span>
                             <span className="font-mono text-primary-600 dark:text-primary-400 font-bold">{Math.round(settings.quality * 100)}%</span>
                        </div>
                        <input
                            type="range"
                            min="0.1"
                            max="1.0"
                            step="0.01"
                            value={settings.quality}
                            onChange={(e) => update('quality', parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-600 dark:accent-primary-500 block"
                        />
                    </div>
                 ) : (
                    <div className="relative">
                        <label className="text-[10px] text-slate-500 mb-1 block">Max Size (KB)</label>
                        <input
                        type="number"
                        min="10"
                        max="50000"
                        value={settings.targetSizeKB || ''}
                        onChange={(e) => update('targetSizeKB', parseInt(e.target.value) || 100)}
                        className="w-full pl-3 pr-10 py-1.5 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-xs transition-all"
                        />
                        <span className="absolute right-3 bottom-2 text-slate-400 dark:text-slate-500 text-[10px] font-medium">KB</span>
                    </div>
                 )}
             </div>
        </div>

        {/* SECTION 2: DIMENSIONS */}
        <div className="space-y-4 pt-4 lg:pt-0 lg:px-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Maximize2 className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Dimensions</h3>
                </div>
            </div>

            <div className="space-y-3">
                {/* Unit Selector */}
                <div>
                     <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Unit</label>
                     <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5">
                        {['px', '%', 'in', 'cm', 'mm'].map((u) => (
                            <button
                                key={u}
                                onClick={() => update('resizeUnit', u as ResizeUnit)}
                                className={`flex-1 py-1 rounded text-xs font-medium transition-all ${
                                    settings.resizeUnit === u
                                    ? 'bg-white dark:bg-slate-600 text-primary-600 dark:text-white shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                                }`}
                            >
                                {u}
                            </button>
                        ))}
                     </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 dark:text-slate-400">Width</label>
                        <input
                        type="number"
                        step={settings.resizeUnit === 'px' ? '1' : '0.01'}
                        value={toUnit(settings.width, settings.resizeUnit)}
                        onChange={(e) => handleDimensionChange(parseFloat(e.target.value) || 0, true)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-xs font-mono"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 dark:text-slate-400">Height</label>
                        <input
                        type="number"
                        step={settings.resizeUnit === 'px' ? '1' : '0.01'}
                        value={toUnit(settings.height, settings.resizeUnit)}
                        onChange={(e) => handleDimensionChange(parseFloat(e.target.value) || 0, false)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-xs font-mono"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 cursor-pointer" onClick={() => update('maintainAspectRatio', !settings.maintainAspectRatio)}>
                   <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${settings.maintainAspectRatio ? 'bg-primary-600 border-primary-600 text-white' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'}`}>
                      {settings.maintainAspectRatio && <Check className="w-3 h-3" />}
                   </div>
                   <label className="text-xs text-slate-600 dark:text-slate-300 select-none cursor-pointer">Maintain aspect ratio</label>
                </div>
            </div>
        </div>

        {/* SECTION 3: SCALING & INFO */}
        <div className="space-y-4 pt-4 lg:pt-0 lg:pl-4 flex flex-col justify-between">
            <div>
                 <div className="flex items-center gap-2 mb-3">
                    <MoveHorizontal className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Scaling</h3>
                 </div>

                 {settings.maintainAspectRatio ? (
                    <div className="space-y-3">
                         <div className="flex justify-between items-center text-[10px]">
                             <span className="text-slate-500">Quick Scale</span>
                             <span className="font-mono text-primary-600 dark:text-primary-400 font-bold">{currentScale}%</span>
                         </div>
                         <input
                            type="range"
                            min="1"
                            max="100"
                            value={currentScale}
                            onChange={(e) => {
                                const pct = parseInt(e.target.value);
                                const ratio = originalDimensions.width / originalDimensions.height;
                                const newWidth = Math.round((pct / 100) * originalDimensions.width);
                                const newHeight = Math.round(newWidth / ratio);
                                onChange({ ...settings, width: newWidth, height: newHeight });
                            }}
                            className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-600 dark:accent-primary-500 block"
                         />
                         <div className="flex justify-between text-[10px] text-slate-400 pt-0.5">
                            <button onClick={() => onChange({ ...settings, width: Math.round(originalDimensions.width * 0.25), height: Math.round(originalDimensions.height * 0.25) })} className="hover:text-primary-600">25%</button>
                            <button onClick={() => onChange({ ...settings, width: Math.round(originalDimensions.width * 0.5), height: Math.round(originalDimensions.height * 0.5) })} className="hover:text-primary-600">50%</button>
                            <button onClick={() => onChange({ ...settings, width: Math.round(originalDimensions.width * 0.75), height: Math.round(originalDimensions.height * 0.75) })} className="hover:text-primary-600">75%</button>
                            <button onClick={() => onChange({ ...settings, width: originalDimensions.width, height: originalDimensions.height })} className="hover:text-primary-600">100%</button>
                         </div>
                    </div>
                 ) : (
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-700 text-center">
                        <p className="text-[10px] text-slate-400">Scale slider disabled when aspect ratio is unlocked.</p>
                    </div>
                 )}
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-xl border border-blue-100 dark:border-blue-900/30">
                <h4 className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wide mb-1.5">Summary</h4>
                <div className="grid grid-cols-2 gap-y-1 text-[10px]">
                    <span className="text-slate-500 dark:text-slate-400">Final Format:</span>
                    <span className="text-right font-medium text-slate-900 dark:text-slate-200 uppercase">{settings.outputExtension}</span>
                    
                    <span className="text-slate-500 dark:text-slate-400">Dimensions:</span>
                    <span className="text-right font-medium text-slate-900 dark:text-slate-200">{settings.width} x {settings.height}</span>
                    
                    <span className="text-slate-500 dark:text-slate-400">Method:</span>
                    <span className="text-right font-medium text-slate-900 dark:text-slate-200">
                        {settings.targetSizeKB ? `Max ${settings.targetSizeKB}KB` : `Quality ${(settings.quality * 100).toFixed(0)}%`}
                    </span>
                </div>
            </div>
        </div>

      </div>

    </div>
  );
};