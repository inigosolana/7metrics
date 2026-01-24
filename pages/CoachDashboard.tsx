import React, { useState } from 'react';
import { analyzeImage } from '../services/geminiService';
import VeoGenerator from '../components/VeoGenerator';
import VideoProcessor from '../components/VideoProcessor';

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
          {/* Video Innovation Labs */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-primary rounded-full"></div>
                <h3 className="font-bold text-xl">AI Video Innovation Labs</h3>
              </div>
              <p className="text-xs text-slate-500 font-medium bg-slate-100 dark:bg-stone-900 px-3 py-1 rounded-full border border-slate-200 dark:border-stone-800">
                Next-Gen Analysis Powered by Hyperion-7
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Tool 1: AI Clipper */}
              <div className="h-full">
                <VideoProcessor
                  mode="clipper"
                  title="Smart AI Clipper"
                  description="Auto-crops actions by Team & Player (Gols, Shots, Stops)"
                  icon="auto_awesome_motion"
                  accentClass="bg-primary"
                />
              </div>

              {/* Tool 2: AI Stats */}
              <div className="h-full">
                <VideoProcessor
                  mode="stats"
                  title="Automated Stats Hub"
                  description="Real-time box score & tactical heatmaps extraction"
                  icon="query_stats"
                  accentClass="bg-indigo-600"
                />
              </div>

              {/* Tool 3: Veo 3D Generator */}
              <div className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-slate-200 dark:border-stone-800/50 flex flex-col h-full shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                      <span className="material-icons-outlined text-2xl">sports_esports</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg leading-none dark:text-white">3D Drill Creator</h4>
                      <p className="text-xs text-slate-500 dark:text-stone-500 mt-1">Prompt to 3D video & tactical drills</p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1.5 px-2 py-1 bg-orange-500/10 text-orange-500 text-[10px] font-bold rounded-full uppercase">
                    <span className="w-1 h-1 rounded-full bg-orange-500"></span> Beta
                  </span>
                </div>

                <div className="flex-1 flex flex-col justify-center py-4">
                  <div className="bg-slate-50 dark:bg-stone-900/30 rounded-xl p-6 border border-slate-200/50 dark:border-stone-800/20 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-amber-500 opacity-50"></div>
                    <span className="material-symbols-outlined text-4xl text-orange-500/30 mb-2">tactic</span>
                    <p className="text-sm font-bold text-slate-700 dark:text-stone-300">"Explain a 5:1 screen play..."</p>
                    <p className="text-[11px] text-slate-400 mt-2">Generate tactical animations from text prompts</p>
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    onClick={() => setShowVeo(true)}
                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <span className="material-icons-outlined text-sm">auto_fix_high</span>
                    Launch Generator
                  </button>
                </div>
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