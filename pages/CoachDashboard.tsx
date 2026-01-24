import React, { useState } from 'react';
import { analyzeImage } from '../services/geminiService';
import VeoGenerator from '../components/VeoGenerator';

const CoachDashboard: React.FC = () => {
  const [showVeo, setShowVeo] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsAnalyzing(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        
        try {
           const result = await analyzeImage(base64Data, "Analyze the tactical formation in this handball frame. Identify defensive structure (e.g., 6:0, 5:1) and any obvious gaps.");
           setAnalysisResult(result || "Analysis complete. No insights returned.");
        } catch (err) {
           console.error(err);
           setAnalysisResult("Failed to analyze image. Please ensure your API key is valid.");
        } finally {
            setIsAnalyzing(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex font-inter">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 dark:border-stone-800 flex flex-col h-screen sticky top-0 bg-background-light dark:bg-background-dark overflow-hidden">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">7</div>
          <div>
            <h1 className="font-bold text-lg leading-tight">7metrics</h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-stone-500 font-bold">Unified Pro</p>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-2 space-y-8 overflow-y-auto custom-scrollbar">
          <div>
            <p className="px-2 mb-3 text-[10px] uppercase tracking-widest font-bold text-slate-400 dark:text-stone-600">Main</p>
            <div className="space-y-1">
              <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary font-medium">
                <span className="material-icons-outlined text-xl">dashboard</span>
                <span>Dashboard</span>
              </a>
              <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-stone-400 hover:bg-slate-100 dark:hover:bg-stone-800 transition-colors">
                <span className="material-icons-outlined text-xl">insights</span>
                <span>Real Stats</span>
              </a>
              <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-stone-400 hover:bg-slate-100 dark:hover:bg-stone-800 transition-colors">
                <span className="material-icons-outlined text-xl">psychology</span>
                <span>AI Analyzer Stats</span>
              </a>
            </div>
          </div>
          
          <div>
            <p className="px-2 mb-3 text-[10px] uppercase tracking-widest font-bold text-slate-400 dark:text-stone-600">Coaching</p>
            <div className="space-y-1">
              <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-stone-400 hover:bg-slate-100 dark:hover:bg-stone-800 transition-colors">
                <span className="material-icons-outlined text-xl">event_note</span>
                <span>Planning</span>
              </a>
              <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-stone-400 hover:bg-slate-100 dark:hover:bg-stone-800 transition-colors">
                <span className="material-icons-outlined text-xl">fitness_center</span>
                <span>Training</span>
              </a>
            </div>
          </div>
          
          <div>
            <p className="px-2 mb-3 text-[10px] uppercase tracking-widest font-bold text-slate-400 dark:text-stone-600">Video Labs</p>
            <div className="space-y-1">
              <a href="#" className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-600 dark:text-stone-400 hover:bg-slate-100 dark:hover:bg-stone-800 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="material-icons-outlined text-xl">movie_filter</span>
                  <div className="flex flex-col">
                    <span className="text-sm">Video Lab</span>
                    <span className="text-[10px] opacity-60">Clips & Recortes</span>
                  </div>
                </div>
              </a>
              <a href="#" className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-600 dark:text-stone-400 hover:bg-slate-100 dark:hover:bg-stone-800 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="material-icons-outlined text-xl">analytics</span>
                  <div className="flex flex-col">
                    <span className="text-sm">Video Lab</span>
                    <span className="text-[10px] opacity-60">AI Automated Stats</span>
                  </div>
                </div>
              </a>
              <button 
                onClick={() => setShowVeo(true)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-600 dark:text-stone-400 hover:bg-slate-100 dark:hover:bg-stone-800 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="material-icons-outlined text-xl">video_settings</span>
                  <div className="flex flex-col">
                    <span className="text-sm">Veo Generator</span>
                    <span className="text-[10px] opacity-60">Create Drills & Plays</span>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </nav>
        
        <div className="p-4 border-t border-slate-200 dark:border-stone-800 space-y-3">
          <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-100 dark:bg-stone-900/50 hover:bg-slate-200 dark:hover:bg-stone-800 transition-colors group">
            <span className="material-icons-outlined text-primary group-hover:scale-110 transition-transform">smart_toy</span>
            <span className="text-sm font-semibold">AI Assistant</span>
          </button>
          <div className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-stone-900/30 rounded-xl">
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-stone-700">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPFNHWDnqL1SAeP9yU5aWLV6bA2XZvHPcnY75coeEwdspmV9lUFMwmfFU2MnAFq0I7lBAZOW-oZsdhTxLxxa_5jVcz3h9t7f8iok9JHSiLRQcu3Ezzyqn6yU5pNGftcIgQAAAq0c92csDquBhdQdbBQEDZDIziJ3kkU-c2ZiGBZPxDJB737rKvlyh3uDPt1Kon7h2_GlsaqyY2UV26NdoE2PimsTJjoiI0D_OfplU8FoA1J0FOxCGDz9J1kTuUEOhQaGfdbq-AHQg" alt="Coach Profile" className="w-full h-full object-cover grayscale brightness-75" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold">Coach Anderson</span>
              <span className="text-[10px] text-primary font-bold">Elite Premium</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="p-8 pb-4 flex items-center justify-between sticky top-0 bg-background-light dark:bg-background-dark/95 backdrop-blur-md z-10 border-b border-transparent dark:border-stone-800/20">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Unified Dashboard</h2>
            <div className="flex items-center gap-4 mt-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs text-slate-500 dark:text-stone-400 font-medium">System Online</span>
              </div>
              <span className="text-slate-300 dark:text-stone-700">|</span>
              <span className="text-xs text-slate-500 dark:text-stone-400">Match Day 24: Real-time Analysis</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex p-1 bg-slate-100 dark:bg-stone-900 rounded-lg border border-slate-200 dark:border-stone-800">
              <button className="px-4 py-1.5 text-xs font-bold rounded-md bg-white dark:bg-stone-800 shadow-sm text-primary">Live</button>
              <button className="px-4 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-stone-500 dark:hover:text-stone-300">History</button>
            </div>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
              <span className="material-icons-outlined text-lg">add_circle_outline</span>
              New Analysis
            </button>
          </div>
        </header>

        <div className="px-8 pb-8 space-y-8">
          {/* Top Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-primary rounded-full"></div>
              <h3 className="font-bold text-lg">Video Lab Hub</h3>
            </div>
            <div className="grid grid-cols-12 gap-6">
              {/* Clip Library Card */}
              <div className="col-span-12 lg:col-span-7 bg-slate-50 dark:bg-card-dark rounded-2xl p-6 border border-slate-200 dark:border-stone-800/50">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <span className="material-icons-outlined">movie</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg leading-none">Clip Library</h4>
                      <p className="text-xs text-slate-500 dark:text-stone-500 mt-1">Manual tagging by Team & Player</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-mono text-xl font-bold">1,420</span>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-stone-500">Clips</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-white dark:bg-stone-900/50 p-4 rounded-xl border border-slate-200 dark:border-stone-800/50">
                    <p className="text-[10px] uppercase font-bold text-stone-500 mb-1">Fast Breaks</p>
                    <p className="font-mono text-2xl font-bold">48</p>
                  </div>
                  <div className="bg-white dark:bg-stone-900/50 p-4 rounded-xl border border-slate-200 dark:border-stone-800/50">
                    <p className="text-[10px] uppercase font-bold text-stone-500 mb-1">Defense 6:0</p>
                    <p className="font-mono text-2xl font-bold">124</p>
                  </div>
                  <div className="bg-white dark:bg-stone-900/50 p-4 rounded-xl border border-slate-200 dark:border-stone-800/50">
                    <p className="text-[10px] uppercase font-bold text-stone-500 mb-1">7m Throws</p>
                    <p className="font-mono text-2xl font-bold">12</p>
                  </div>
                </div>
                <button className="w-full py-3 bg-slate-200 dark:bg-stone-800/50 hover:bg-slate-300 dark:hover:bg-stone-800 text-xs font-bold uppercase tracking-widest rounded-xl transition-colors">
                  Open Manual Tagger
                </button>
              </div>

              {/* AI Analyzer Card */}
              <div className="col-span-12 lg:col-span-5 bg-slate-50 dark:bg-card-dark rounded-2xl p-6 border border-slate-200 dark:border-stone-800/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <span className="material-icons-outlined">memory</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-lg leading-none">AI Analyzer</h4>
                        <p className="text-xs text-slate-500 dark:text-stone-500 mt-1">Automated tactical extraction</p>
                      </div>
                    </div>
                    <span className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded-full uppercase">
                      <span className="w-1 h-1 rounded-full bg-emerald-500"></span> Active
                    </span>
                  </div>
                  
                  {analysisResult ? (
                     <div className="space-y-4">
                       <div className="bg-surface-dark p-3 rounded-lg border border-white/5 max-h-32 overflow-y-auto">
                          <p className="text-xs text-slate-300 whitespace-pre-line">{analysisResult}</p>
                       </div>
                     </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Match_24_Final_H1.mp4</span>
                        <span className="font-mono text-sm font-bold text-emerald-500">85%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 dark:bg-stone-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-stone-500 italic">Detecting player movement vectors...</span>
                        <span className="text-[10px] text-stone-500 font-bold uppercase">ETR: 02:14</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <label className="w-full mt-6 py-3 border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/5 text-xs font-bold uppercase tracking-widest rounded-xl transition-colors text-center cursor-pointer flex items-center justify-center">
                   {isAnalyzing ? (
                       <span className="flex items-center gap-2">
                           <span className="w-3 h-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></span>
                           Processing...
                       </span>
                   ) : (
                       "Upload Frame for AI Analysis"
                   )}
                   <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isAnalyzing} />
                </label>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-12 gap-8">
            {/* Shot Efficiency Matrix */}
            <section className="col-span-12 md:col-span-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-icons-outlined text-primary">gps_fixed</span>
                  <h3 className="font-bold text-lg">Shot Efficiency Matrix</h3>
                </div>
                <span className="text-[10px] uppercase font-bold text-stone-500 tracking-widest">Zone Analysis</span>
              </div>
              <div className="aspect-square bg-slate-50 dark:bg-card-dark rounded-2xl p-6 border border-slate-200 dark:border-stone-800/50 flex flex-col items-center justify-center">
                <div className="w-full h-full border-4 border-slate-200 dark:border-stone-800 rounded shadow-inner overflow-hidden relative">
                  <div className="absolute inset-0 opacity-5 pointer-events-none">
                    <div className="w-full h-full grid grid-cols-3 grid-rows-3 border border-white/20"></div>
                  </div>
                  <div className="matrix-grid w-full h-full">
                    {[
                      { val: '45%', bg: 'bg-stone-800/40 dark:bg-stone-900/40', text: 'opacity-80' },
                      { val: '38%', bg: 'bg-stone-800/60 dark:bg-stone-900/60', text: 'opacity-80' },
                      { val: '82%', bg: 'bg-emerald-900/40 dark:bg-emerald-900/30', text: 'text-emerald-500' },
                      { val: '12%', bg: 'bg-primary/20', text: 'text-primary' },
                      { val: '50%', bg: 'bg-stone-800/50 dark:bg-stone-900/50', text: 'opacity-80' },
                      { val: '33%', bg: 'bg-stone-800/70 dark:bg-stone-900/70', text: 'opacity-80 text-orange-400' },
                      { val: '75%', bg: 'bg-emerald-800/30 dark:bg-emerald-900/20', text: 'text-emerald-400' },
                      { val: '98%', bg: 'bg-emerald-900/60 dark:bg-emerald-950/40', text: 'text-emerald-500 text-3xl' },
                      { val: '25%', bg: 'bg-primary/30', text: 'text-primary' }
                    ].map((cell, i) => (
                      <div key={i} className={`${cell.bg} flex items-center justify-center border border-white/5`}>
                        <span className={`font-mono text-2xl font-bold ${cell.text}`}>{cell.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Player Impact */}
            <section className="col-span-12 md:col-span-7">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-icons-outlined text-primary">bar_chart</span>
                  <h3 className="font-bold text-lg">Player Impact (+/-)</h3>
                </div>
                <button className="text-[10px] uppercase font-bold bg-slate-200 dark:bg-stone-800 px-3 py-1 rounded text-stone-500 tracking-widest hover:text-primary transition-colors">Detailed View</button>
              </div>
              <div className="bg-slate-50 dark:bg-card-dark rounded-2xl p-8 border border-slate-200 dark:border-stone-800/50 h-[calc(100%-44px)] flex flex-col justify-between">
                <div className="space-y-8">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold">M. Hansen</span>
                      <span className="font-mono text-sm font-bold text-emerald-500">+12.4</span>
                    </div>
                    <div className="w-full h-3 bg-slate-200 dark:bg-stone-900/50 rounded-full relative">
                      <div className="absolute right-0 top-0 h-full bg-emerald-500 rounded-full" style={{ width: '45%', right: '5%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold">S. Sagosen</span>
                      <span className="font-mono text-sm font-bold text-emerald-500">+8.1</span>
                    </div>
                    <div className="w-full h-3 bg-slate-200 dark:bg-stone-900/50 rounded-full relative">
                      <div className="absolute right-0 top-0 h-full bg-emerald-400 rounded-full" style={{ width: '30%', right: '10%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold">D. Mem</span>
                      <span className="font-mono text-sm font-bold text-emerald-400">+3.2</span>
                    </div>
                    <div className="w-full h-3 bg-slate-200 dark:bg-stone-900/50 rounded-full relative">
                      <div className="absolute right-0 top-0 h-full bg-emerald-400/60 rounded-full" style={{ width: '15%', right: '25%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold opacity-80">A. Dujshebaev</span>
                      <span className="font-mono text-sm font-bold text-rose-400">-2.5</span>
                    </div>
                    <div className="w-full h-3 bg-slate-200 dark:bg-stone-900/50 rounded-full relative">
                      <div className="absolute left-0 top-0 h-full bg-rose-500/40 rounded-full" style={{ width: '15%', left: '35%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold opacity-80">N. Landin</span>
                      <span className="font-mono text-sm font-bold text-rose-500">-5.8</span>
                    </div>
                    <div className="w-full h-3 bg-slate-200 dark:bg-stone-900/50 rounded-full relative">
                      <div className="absolute left-0 top-0 h-full bg-rose-500/60 rounded-full" style={{ width: '25%', left: '20%' }}></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-stone-800/50">
                  <span className="text-[10px] uppercase font-bold text-stone-500">Collective Behaviour Index</span>
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="w-2 h-2 rounded-full bg-stone-700"></span>
                    <span className="w-2 h-2 rounded-full bg-stone-700"></span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {showVeo && <VeoGenerator onClose={() => setShowVeo(false)} />}
    </div>
  );
};

export default CoachDashboard;