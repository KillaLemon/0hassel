import React, { useState, useEffect, useRef } from 'react';
import { UploadCloud, Download, FileImage, Trash2, RefreshCw, AlertCircle, ShieldCheck, Lock, HardDrive, Zap, Save, Globe, Cpu, EyeOff, Mail, ArrowRight } from 'lucide-react';
import { Header } from './components/Header.tsx';
import { AdSpace } from './components/AdSpace.tsx';
import { CompressionControls } from './components/CompressionControls.tsx';
import { compressImage, formatFileSize } from './utils/imageUtils.ts';
import { CompressionSettings, ImageState } from './types.ts';

const INITIAL_SETTINGS: CompressionSettings = {
  quality: 0.8,
  width: 0,
  height: 0,
  maintainAspectRatio: true,
  format: 'image/jpeg',
  outputExtension: 'jpg',
  targetSizeKB: null,
  resizeUnit: 'px'
};

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [settings, setSettings] = useState<CompressionSettings>(INITIAL_SETTINGS);
  const [imageState, setImageState] = useState<ImageState>({
    originalUrl: null,
    compressedUrl: null,
    originalSize: 0,
    compressedSize: 0,
    originalDimensions: { width: 0, height: 0 },
    compressedDimensions: { width: 0, height: 0 },
    name: '',
    isProcessing: false
  });

  const [error, setError] = useState<string | null>(null);
  const processingRef = useRef<number | null>(null);

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Basic validation
      if (!selectedFile.type.startsWith('image/')) {
        setError("Please upload a valid image file.");
        return;
      }

      setFile(selectedFile);
      setError(null);
      
      // Load initial metadata
      const url = URL.createObjectURL(selectedFile);
      const img = new Image();
      img.src = url;
      await new Promise(r => img.onload = r);
      
      setImageState({
        originalUrl: url,
        compressedUrl: null, // Reset until compressed
        originalSize: selectedFile.size,
        compressedSize: 0,
        originalDimensions: { width: img.width, height: img.height },
        compressedDimensions: { width: 0, height: 0 },
        name: selectedFile.name,
        isProcessing: true
      });

      // Update default dimensions in settings
      const fileType = selectedFile.type as any || 'image/jpeg';
      // Infer extension from name or type
      let ext: 'jpg' | 'jpeg' | 'png' | 'webp' = 'jpg';
      if (fileType === 'image/png') ext = 'png';
      if (fileType === 'image/webp') ext = 'webp';
      // If original was jpeg, preserve jpg vs jpeg preference if possible, default to jpg
      if (selectedFile.name.toLowerCase().endsWith('.jpeg')) ext = 'jpeg';

      setSettings(prev => ({
        ...prev,
        width: img.width,
        height: img.height,
        format: fileType,
        outputExtension: ext
      }));
    }
  };

  // Trigger compression when settings or file change
  useEffect(() => {
    if (!file || !imageState.originalUrl) return;

    // Debounce compression to avoid lagging on slider drag
    if (processingRef.current) {
      window.clearTimeout(processingRef.current);
    }

    setImageState(prev => ({ ...prev, isProcessing: true }));

    processingRef.current = window.setTimeout(async () => {
      try {
        const result = await compressImage(file, settings);
        setImageState(prev => ({
          ...prev,
          compressedUrl: result.url,
          compressedSize: result.blob.size,
          compressedDimensions: { width: result.width, height: result.height },
          isProcessing: false
        }));
      } catch (err) {
        console.error(err);
        setImageState(prev => ({ ...prev, isProcessing: false }));
        setError("Error compressing image.");
      }
    }, 300); // 300ms debounce

    return () => {
      if (processingRef.current) window.clearTimeout(processingRef.current);
    };
  }, [file, settings.quality, settings.width, settings.height, settings.format, settings.targetSizeKB]);

  const reset = () => {
    setFile(null);
    setImageState({
        originalUrl: null,
        compressedUrl: null,
        originalSize: 0,
        compressedSize: 0,
        originalDimensions: { width: 0, height: 0 },
        compressedDimensions: { width: 0, height: 0 },
        name: '',
        isProcessing: false
    });
    setSettings(INITIAL_SETTINGS);
    setError(null);
  };

  const downloadImage = () => {
    if (imageState.compressedUrl) {
      const link = document.createElement('a');
      link.href = imageState.compressedUrl;
      // Use the explicit output extension
      const ext = settings.outputExtension;
      const name = imageState.name.substring(0, imageState.name.lastIndexOf('.')) || imageState.name;
      link.download = `${name}_0hassel.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const calculateSizeDiff = () => {
    const diff = imageState.originalSize - imageState.compressedSize;
    const pct = Math.round((Math.abs(diff) / imageState.originalSize) * 100);
    
    if (diff > 0) {
      return { label: `-${pct}%`, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' };
    } else if (diff < 0) {
      return { label: `+${pct}%`, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30' };
    }
    return { label: `0%`, color: 'text-slate-600', bg: 'bg-slate-100' };
  };

  const sizeDiff = calculateSizeDiff();

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 font-sans overflow-hidden transition-colors duration-200">
      <div className="flex-none z-50">
          <Header />
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT ADVERTISEMENT COLUMN - Hidden on tablets and below */}
        <aside className="hidden xl:flex w-[220px] flex-none flex-col items-stretch p-4 bg-slate-100/30 dark:bg-slate-900/30 border-r border-slate-200 dark:border-slate-800 z-10">
            <AdSpace type="sidebar" className="h-full w-full" label="Ad Space" />
        </aside>

        {/* CENTER CONTENT */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
            
            {/* TOP ADVERTISEMENT */}
            <div className="flex-none p-4 flex justify-center z-10 bg-slate-50 dark:bg-slate-950">
                <div className="w-full max-w-4xl h-24">
                   <AdSpace type="banner" className="w-full h-full" label="Ad Space" />
                </div>
            </div>

            {/* SCROLLABLE WORKSPACE */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 scroll-smooth">
               <div className="max-w-5xl mx-auto flex flex-col min-h-full">
                  
                  {/* Privacy Banner - Only show when no file is selected to keep UI clean */}
                  {!file && (
                     <div className="mb-8 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/50 rounded-xl p-4 flex flex-col md:flex-row items-center justify-center text-center gap-3 shadow-sm">
                        <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-full">
                           <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="text-emerald-900 dark:text-emerald-200 text-sm md:text-base">
                           <span className="font-bold">100% Private & Secure:</span> Your images are processed strictly on your device. No uploads.
                        </div>
                     </div>
                  )}

                  {!file ? (
                    // Upload State
                    <div className="flex-1 flex flex-col justify-center pb-12">
                      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 p-8 md:p-12 text-center relative overflow-hidden group max-w-3xl mx-auto w-full transition-colors duration-200">
                         <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50/50 to-slate-50/50 dark:from-indigo-950/20 dark:to-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                         
                         <div className="relative z-10 space-y-6">
                           <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                              <Zap className="w-10 h-10 text-primary-600 dark:text-primary-400 fill-current" />
                           </div>
                           
                           <h2 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                              Zero hassle. Total privacy.
                           </h2>
                           <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto text-base md:text-lg">
                              The fastest way to resize and compress images. No servers, no sign-ups, just browser power.
                           </p>
          
                           <div className="pt-6">
                              <label className="inline-flex cursor-pointer w-full sm:w-auto justify-center">
                                  <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/png, image/jpeg, image/webp, .jpg, .jpeg, .png, .webp"
                                    onChange={handleFileChange}
                                  />
                                  <span className="bg-primary-600 dark:bg-primary-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-primary-700 dark:hover:bg-primary-500 transition-all shadow-lg shadow-primary-500/30 dark:shadow-primary-900/30 transform hover:-translate-y-1 active:translate-y-0 w-full sm:w-auto block text-center">
                                      Select Image
                                  </span>
                              </label>
                           </div>
                           
                           <div className="pt-8 flex flex-wrap justify-center gap-4 md:gap-8 text-sm text-slate-400 dark:text-slate-500">
                              <span className="flex items-center gap-1.5"><Lock className="w-4 h-4" /> 100% Offline</span>
                              <span className="flex items-center gap-1.5"><HardDrive className="w-4 h-4" /> Browser Processed</span>
                              <span className="flex items-center gap-1.5"><RefreshCw className="w-4 h-4" /> Instant Preview</span>
                           </div>
                         </div>
                      </div>
                      
                      {/* Inline Ad for Mobile/Tablet since sidebars are hidden */}
                      <div className="block xl:hidden mt-8 max-w-3xl mx-auto w-full">
                          <AdSpace type="banner" className="h-24" label="Ad Space" />
                      </div>

                      {/* Benefits Section */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto w-full">
                         {[
                           { title: 'Zero Data Usage', desc: 'Since we don\'t upload your photos, you save bandwidth and time.' },
                           { title: 'Ultimate Privacy', desc: 'Your photos never leave your device. Perfect for sensitive documents.' },
                           { title: 'Any Format', desc: 'Convert effortlessly between JPG, PNG, and WebP formats.' }
                         ].map((item, i) => (
                           <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-200">
                              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                           </div>
                         ))}
                      </div>
                    </div>
                  ) : (
                    // Editor State - Optimized Vertical Layout
                    <div className="flex flex-col gap-4 pb-8 h-full">
                       
                       {/* 1. Header Actions */}
                       <div className="flex-none flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors duration-200">
                          <div className="flex items-center gap-3 overflow-hidden">
                               <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg flex-shrink-0">
                                  <FileImage className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                               </div>
                               <div className="min-w-0">
                                   <h2 className="font-semibold text-sm text-slate-900 dark:text-white truncate max-w-[150px] md:max-w-md">{imageState.name}</h2>
                                   <p className="text-[10px] text-slate-500 dark:text-slate-400">Processing locally</p>
                               </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                              <button 
                                onClick={reset}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Discard"
                              >
                                  <Trash2 className="w-4 h-4" />
                              </button>
                              <button 
                                 onClick={downloadImage}
                                 disabled={imageState.isProcessing}
                                 className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-primary-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                              >
                                  <Save className="w-4 h-4" />
                                  <span>Save</span>
                              </button>
                          </div>
                      </div>

                      {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          {error}
                        </div>
                      )}

                       {/* 2. Previews - Flexible with Max Height to ensure controls fit */}
                       <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 gap-4">
                             {/* Original - Hidden on Mobile */}
                             <div className="hidden md:flex flex-col space-y-2 h-full min-h-0">
                                <div className="flex justify-between text-xs flex-none">
                                   <span className="font-medium text-slate-500 dark:text-slate-400">Original</span>
                                   <span className="font-mono text-slate-700 dark:text-slate-300">{formatFileSize(imageState.originalSize)}</span>
                                </div>
                                <div className="flex-1 bg-white p-2 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] min-h-0">
                                   {imageState.originalUrl && (
                                       <img src={imageState.originalUrl} alt="Original" className="w-full h-full object-contain" />
                                   )}
                                </div>
                                <div className="text-[10px] text-center text-slate-400 dark:text-slate-500 flex-none">
                                   {imageState.originalDimensions.width} x {imageState.originalDimensions.height} px
                                </div>
                             </div>
          
                             {/* Compressed - Full height on mobile */}
                             <div className="flex flex-col space-y-2 h-[40vh] md:h-full min-h-0">
                                <div className="flex justify-between items-center text-xs flex-none">
                                   <span className="font-medium text-primary-600 dark:text-primary-400">Preview</span>
                                   <div className="flex items-center gap-2">
                                      {/* Mobile: Original Size with strike-through or arrow to indicate change */}
                                      <div className="md:hidden flex items-center gap-1 opacity-70">
                                         <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 line-through decoration-slate-400/50">
                                            {formatFileSize(imageState.originalSize)}
                                         </span>
                                         <ArrowRight className="w-3 h-3 text-slate-400" />
                                      </div>

                                      {imageState.compressedSize > 0 && (
                                          <span className={`text-[10px] ${sizeDiff.bg} ${sizeDiff.color} px-1.5 py-0.5 rounded-full font-bold`}>
                                              {sizeDiff.label}
                                          </span>
                                      )}
                                      <span className="font-mono text-slate-900 dark:text-white font-bold">{imageState.isProcessing ? '...' : formatFileSize(imageState.compressedSize)}</span>
                                   </div>
                                </div>
                                <div className="flex-1 bg-white p-2 rounded-2xl shadow-sm border-2 border-primary-100 dark:border-primary-900 flex items-center justify-center overflow-hidden relative bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] min-h-0">
                                   {imageState.isProcessing && (
                                      <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 z-10 flex items-center justify-center backdrop-blur-sm">
                                         <RefreshCw className="w-8 h-8 text-primary-600 dark:text-primary-400 animate-spin" />
                                      </div>
                                   )}
                                   {imageState.compressedUrl && (
                                       <img src={imageState.compressedUrl} alt="Compressed" className="w-full h-full object-contain" />
                                   )}
                                </div>
                                 <div className="text-[10px] text-center text-slate-400 dark:text-slate-500 flex-none">
                                   {imageState.compressedDimensions.width} x {imageState.compressedDimensions.height} px
                                </div>
                             </div>
                          </div>

                       {/* 3. Controls at Bottom - Fixed Height Container */}
                       <div className="w-full flex-none">
                          <CompressionControls 
                             settings={settings} 
                             onChange={setSettings}
                             originalDimensions={imageState.originalDimensions}
                          />
                       </div>

                       {/* Mobile/Tablet Ad Placeholder */}
                       <div className="block xl:hidden mt-2 flex-none">
                            <AdSpace type="banner" className="h-20" label="Ad Space" />
                       </div>
                    </div>
                  )}

                  {/* Informational Sections (Privacy, Guide, Contact) */}
                  <div className="mt-16 space-y-16 pb-12">
                      
                      {/* Guide Section */}
                      <section id="guide" className="scroll-mt-24">
                          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-10 border border-slate-100 dark:border-slate-800 shadow-sm">
                              <div className="flex items-center gap-3 mb-6">
                                  <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
                                      <Cpu className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                  </div>
                                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">How it Works</h2>
                              </div>
                              <div className="grid md:grid-cols-2 gap-8 items-center">
                                  <div className="space-y-4 text-slate-600 dark:text-slate-400 leading-relaxed">
                                      <p>
                                          0Hassel utilizes advanced browser-based compression technologies (WebAssembly and Canvas APIs) to process images locally. 
                                      </p>
                                      <p>
                                          Unlike traditional online tools that require you to upload your files to a remote server, 0Hassel downloads the optimization engine to your device. When you select an image, the processing happens using your computer's own CPU and memory.
                                      </p>
                                      <p>
                                          This architecture ensures zero latency, works without an internet connection (once loaded), and provides bank-level security for your personal documents.
                                      </p>
                                  </div>
                                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700/50">
                                      <ul className="space-y-4">
                                          <li className="flex items-start gap-3">
                                              <Globe className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
                                              <div>
                                                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Client-Side Processing</h4>
                                                  <p className="text-xs text-slate-500 mt-1">No file transfers. Everything happens in Chrome/Safari/Edge/Firefox.</p>
                                              </div>
                                          </li>
                                          <li className="flex items-start gap-3">
                                              <Zap className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
                                              <div>
                                                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Instant Results</h4>
                                                  <p className="text-xs text-slate-500 mt-1">No upload/download wait times. Real-time preview changes.</p>
                                              </div>
                                          </li>
                                      </ul>
                                  </div>
                              </div>
                          </div>
                      </section>

                      {/* Privacy Section */}
                      <section id="privacy" className="scroll-mt-24">
                          <div className="bg-emerald-50/50 dark:bg-emerald-900/5 rounded-3xl p-8 md:p-10 border border-emerald-100 dark:border-emerald-900/20">
                              <div className="flex items-center gap-3 mb-6">
                                  <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                                      <EyeOff className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                  </div>
                                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Privacy First</h2>
                              </div>
                              <div className="prose prose-slate dark:prose-invert max-w-none">
                                  <p className="text-lg text-slate-700 dark:text-slate-300 font-medium mb-4">
                                      Your photos never leave your device.
                                  </p>
                                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                                      We believe that simple tools shouldn't require sacrificing privacy. Because 0Hassel operates entirely locally:
                                  </p>
                                  <ul className="grid sm:grid-cols-2 gap-4 list-none pl-0">
                                      {[
                                          "No servers store your images",
                                          "No cloud processing",
                                          "No data mining",
                                          "No third-party access",
                                          "No hidden trackers",
                                          "Works offline"
                                      ].map((item, i) => (
                                          <li key={i} className="flex items-center gap-2 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/30 shadow-sm">
                                              <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                              {item}
                                          </li>
                                      ))}
                                  </ul>
                              </div>
                          </div>
                      </section>

                      {/* Contact Section */}
                      <section id="contact" className="scroll-mt-24 text-center">
                          <div className="max-w-2xl mx-auto space-y-6">
                              <div className="inline-flex items-center justify-center p-3 bg-slate-100 dark:bg-slate-800 rounded-full mb-2">
                                  <Mail className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                              </div>
                              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Get in touch</h2>
                              <p className="text-slate-500 dark:text-slate-400">
                                  Have feedback, found a bug, or just want to say hi? We'd love to hear from you.
                              </p>
                              <a href="mailto:support@0hassel.fake" className="inline-flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-2xl font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-lg shadow-slate-900/20">
                                  <Mail className="w-5 h-5" />
                                  support@0hassel.fake
                              </a>
                          </div>
                      </section>

                  </div>

               </div>
            </div>

            {/* BOTTOM ADVERTISEMENT */}
            <div className="flex-none p-4 pt-0 flex justify-center z-10 bg-slate-50 dark:bg-slate-950">
               <div className="w-full max-w-4xl h-20">
                   <AdSpace type="banner" className="w-full h-full" label="Ad Space" />
               </div>
            </div>

        </main>

        {/* RIGHT ADVERTISEMENT COLUMN - Hidden on tablets and below */}
        <aside className="hidden xl:flex w-[220px] flex-none flex-col items-stretch p-4 bg-slate-100/30 dark:bg-slate-900/30 border-l border-slate-200 dark:border-slate-800 z-10">
            <AdSpace type="sidebar" className="h-full w-full" label="Ad Space" />
        </aside>

      </div>
    </div>
  );
};

export default App;