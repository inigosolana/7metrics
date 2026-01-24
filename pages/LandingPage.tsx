import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white transition-colors duration-300 font-space min-h-screen flex flex-col">
      {/* Top Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-nav">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-8 bg-primary rounded flex items-center justify-center text-white">
              <span className="material-symbols-outlined font-bold">analytics</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">7metrics</h2>
          </div>
          <div className="hidden md:flex items-center gap-10">
            <a href="#" className="text-sm font-medium hover:text-primary transition-colors">Funciones</a>
            <a href="#" className="text-sm font-medium hover:text-primary transition-colors">Precios</a>
            <a href="#" className="text-sm font-medium hover:text-primary transition-colors">Casos de éxito</a>
            <a href="#" className="text-sm font-medium hover:text-primary transition-colors">Blog</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/select-role" className="text-sm font-bold px-5 py-2 hover:text-primary transition-colors">Login</Link>
            <Link to="/select-role" className="bg-primary hover:bg-orange-600 text-white text-sm font-bold px-6 py-2.5 rounded-lg transition-all shadow-lg shadow-primary/20">
              Comenzar
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden flex-1">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-background-dark/40 to-background-dark z-0"></div>
          {/* Background Image with YOLO overlays simulation */}
          <div className="w-full h-full bg-center bg-cover opacity-40 absolute inset-0 -z-10" style={{ backgroundImage: "url('https://picsum.photos/1920/1080?grayscale')" }}></div>
        </div>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          <div className="lg:col-span-7 flex flex-col gap-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest w-fit">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Next-Gen Sports Intelligence
            </div>
            <h1 className="text-5xl md:text-7xl font-black leading-[1.1] tracking-tight text-white">
              Unleash Elite Performance with <span className="text-primary">AI-Driven</span> Handball Analytics
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed">
              Harness the power of our dual video lab and rapid data entry to transform game footage into winning strategies. Built for the world's most demanding coaching staffs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Link to="/select-role" className="bg-primary hover:bg-orange-600 text-white px-8 py-4 rounded-xl text-lg font-bold transition-all flex items-center justify-center gap-2 group">
                Solicitar Demo
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </Link>
              <button className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-4 rounded-xl text-lg font-bold transition-all flex items-center justify-center gap-2">
                Explorar Funciones
              </button>
            </div>
          </div>
          <div className="lg:col-span-5 relative hidden lg:block">
            {/* Decorative Mockup Element */}
            <div className="relative z-10 rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-primary/10 bg-slate-900 p-2">
              <div className="bg-background-dark rounded-xl overflow-hidden aspect-[4/3] flex items-center justify-center relative">
                <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                  <div className="bg-primary/20 border border-primary text-[10px] text-primary font-bold px-2 py-0.5 rounded">PLAYER_07 [88% ACC]</div>
                  <div className="bg-blue-500/20 border border-blue-500 text-[10px] text-blue-500 font-bold px-2 py-0.5 rounded">SHOT_ZONE_9M</div>
                </div>
                <img className="w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-700" src="https://picsum.photos/800/600" alt="Handball analysis" />
                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur px-3 py-1.5 rounded-lg border border-white/10 text-[10px] text-white flex items-center gap-2">
                  <span className="size-2 rounded-full bg-red-500 animate-pulse"></span> REC: 00:42:15:08
                </div>
              </div>
            </div>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 blur-3xl rounded-full"></div>
            <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-primary/10 blur-3xl rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col gap-4 mb-16 text-center max-w-3xl mx-auto">
            <h2 className="text-primary text-sm font-black uppercase tracking-[0.3em]">Engineered for Excellence</h2>
            <h3 className="text-4xl md:text-5xl font-bold tracking-tight text-white">Advanced Handball Analytics Suite</h3>
            <p className="text-slate-400 text-lg">Every second of the game decoded through state-of-the-art computer vision and expert sports science.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: 'touch_app', title: '5-Click Tracking', desc: 'Rapid tagging system for live game events designed for speed and precision. Capture entire offensive sequences in seconds.' },
              { icon: 'visibility', title: 'AI Video Lab', desc: 'Automated player identification and movement heatmaps using state-of-the-art computer vision. Zero manual input required.' },
              { icon: 'fitness_center', title: 'Biomechanical Insights', desc: 'Detailed physical performance metrics and postural analysis from standard video footage. Predict injuries before they happen.' }
            ].map((f, i) => (
              <div key={i} className="feature-card bg-slate-900/50 p-8 rounded-2xl flex flex-col gap-6 border border-primary/10 hover:border-primary hover:-translate-y-1 transition-all duration-300">
                <div className="size-14 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-3xl">{f.icon}</span>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-3">{f.title}</h4>
                  <p className="text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-background-dark mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3 opacity-60">
            <div className="size-6 bg-primary rounded flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-sm font-bold">analytics</span>
            </div>
            <h2 className="text-lg font-bold tracking-tight">7metrics</h2>
          </div>
          <div className="text-slate-500 text-sm">
            © 2024 7metrics Analytics. All rights reserved.
          </div>
          <div className="flex gap-6 text-slate-500">
             <a href="#" className="hover:text-primary transition-colors"><span className="material-symbols-outlined">share</span></a>
             <a href="#" className="hover:text-primary transition-colors"><span className="material-symbols-outlined">mail</span></a>
             <a href="#" className="hover:text-primary transition-colors"><span className="material-symbols-outlined">support_agent</span></a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;