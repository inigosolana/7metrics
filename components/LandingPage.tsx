import React, { useState } from 'react';

export const LandingPage: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [contactFormStatus, setContactFormStatus] = useState<'IDLE' | 'SENDING' | 'SENT'>('IDLE');

    const handleContactSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setContactFormStatus('SENDING');
        setTimeout(() => {
            setContactFormStatus('SENT');
            setTimeout(() => {
                setIsContactModalOpen(false);
                setContactFormStatus('IDLE');
            }, 2000);
        }, 1500);
    };

    const scrollToSection = (id: string) => {
        setIsMobileMenuOpen(false);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-[#1a120b] text-white font-display overflow-x-hidden">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-white/5 px-6 py-4 flex justify-between items-center backdrop-blur-md bg-[#1a120b]/80">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-black shadow-lg shadow-primary/20">7</div>
                    <span className="text-xl font-bold tracking-tight">7metrics <span className="text-primary">Pro</span></span>
                </div>
                
                {/* Desktop Menu */}
                <div className="hidden md:flex gap-8 text-sm font-medium text-white/70">
                    <button onClick={() => scrollToSection('features')} className="hover:text-primary transition-colors">Features</button>
                    <button onClick={() => scrollToSection('pricing')} className="hover:text-primary transition-colors">Pricing</button>
                    <button onClick={() => scrollToSection('contact')} className="hover:text-primary transition-colors">Contact</button>
                </div>
                
                <div className="hidden md:flex gap-4">
                     <button 
                        onClick={() => setIsContactModalOpen(true)}
                        className="text-white/70 hover:text-white font-medium text-sm px-4 py-2"
                    >
                        Talk to Sales
                    </button>
                    <button 
                        onClick={onLogin}
                        className="bg-primary hover:bg-primary/80 text-white px-6 py-2 rounded-full font-bold text-sm transition-all shadow-lg shadow-primary/20 hover:scale-105 active:scale-95"
                    >
                        Access Platform
                    </button>
                </div>

                {/* Mobile Hamburger */}
                <button className="md:hidden text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    <span className="material-symbols-outlined text-3xl">{isMobileMenuOpen ? 'close' : 'menu'}</span>
                </button>
            </nav>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-40 bg-[#1a120b] pt-24 px-6 animate-slide-in">
                    <div className="flex flex-col gap-6 text-2xl font-bold text-white/80">
                        <button onClick={() => scrollToSection('features')} className="text-left border-b border-white/10 pb-4">Features</button>
                        <button onClick={() => scrollToSection('pricing')} className="text-left border-b border-white/10 pb-4">Pricing</button>
                        <button onClick={() => scrollToSection('contact')} className="text-left border-b border-white/10 pb-4">Contact</button>
                        <button onClick={onLogin} className="mt-4 bg-primary text-white py-4 rounded-xl text-center">Access Platform</button>
                    </div>
                </div>
            )}

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 lg:px-20 overflow-hidden min-h-[90vh] flex items-center">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-neon-green/10 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
                
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-primary mb-6 animate-slide-in hover:bg-white/10 cursor-default transition-colors">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                            NEW: 3D Tactical Generator AI
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-6">
                            The Future of <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">Handball Analytics</span>
                        </h1>
                        <p className="text-xl text-[#cbad90] mb-8 max-w-lg leading-relaxed">
                            Unified platform for elite clubs. From AI video auto-clipping to tactical 3D simulations and real-time tablet stats.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button onClick={onLogin} className="px-8 py-4 bg-primary text-white rounded-xl font-bold text-lg hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-xl shadow-primary/20">
                                Start Free Trial <span className="material-symbols-outlined">arrow_forward</span>
                            </button>
                            <button onClick={() => scrollToSection('features')} className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-xl font-bold text-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2 backdrop-blur-sm">
                                <span className="material-symbols-outlined">expand_more</span> Learn More
                            </button>
                        </div>
                        
                        <div className="mt-12 flex items-center gap-4 text-sm text-white/40">
                            <div className="flex -space-x-3">
                                {[1,2,3,4].map(i => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-[#1a120b] bg-white/10 overflow-hidden">
                                        <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                                    </div>
                                ))}
                            </div>
                            <p>Trusted by <span className="text-white font-bold">50+ Elite Clubs</span> worldwide.</p>
                        </div>
                    </div>
                    
                    <div className="relative group perspective-1000">
                        <div className="glass-panel p-3 rounded-2xl border border-white/10 shadow-2xl rotate-3 group-hover:rotate-1 transition-transform duration-700 ease-out">
                            <img src="https://images.unsplash.com/photo-1547347298-4074fc3043af?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" alt="Dashboard Preview" className="rounded-xl w-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                            
                            {/* Floating UI Elements on Image */}
                            <div className="absolute top-8 left-8 bg-black/80 backdrop-blur px-4 py-2 rounded-lg border border-white/10 flex items-center gap-3 shadow-lg animate-bounce duration-[3000ms]">
                                <span className="material-symbols-outlined text-neon-green">check_circle</span>
                                <div>
                                    <p className="text-[10px] text-[#cbad90] uppercase font-bold">AI Detection</p>
                                    <p className="text-white text-xs font-bold">Fast Break Goal</p>
                                </div>
                            </div>

                            <div className="absolute bottom-8 right-8 bg-black/80 backdrop-blur p-4 rounded-xl border border-white/10 flex items-center justify-between gap-4 shadow-lg w-64">
                                <div>
                                    <p className="text-xs text-[#cbad90] uppercase font-bold">Live Analysis</p>
                                    <p className="text-white font-bold text-lg">Shot Eff: 82%</p>
                                </div>
                                <div className="h-10 w-24 bg-white/5 rounded-lg overflow-hidden relative">
                                    <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-neon-green to-transparent w-[82%]"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="py-24 bg-[#120b06] relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16 max-w-2xl mx-auto">
                        <span className="text-primary font-bold text-sm tracking-widest uppercase mb-2 block">Features</span>
                        <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">Elite Performance Suite</h2>
                        <p className="text-[#cbad90] text-lg">Everything a technical staff needs in one place. Replace 4 different tools with one unified ecosystem.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="glass-panel p-8 rounded-2xl border-t-4 border-t-primary hover:-translate-y-2 transition-transform cursor-default group">
                            <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                                <span className="material-symbols-outlined text-4xl text-primary">content_cut</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">AI Auto-Clipper</h3>
                            <p className="text-white/60 text-sm leading-relaxed mb-6">
                                Upload a full match and let our AI automatically slice it into indexed plays: Goals, Turnovers, Defense, and Counter-attacks.
                            </p>
                            <div className="text-xs font-mono text-primary bg-primary/5 p-2 rounded border border-primary/10">
                                Save 8+ hours/week
                            </div>
                        </div>

                        {/* Feature 2 */}
                        <div className="glass-panel p-8 rounded-2xl border-t-4 border-t-neon-green hover:-translate-y-2 transition-transform cursor-default group">
                            <div className="bg-neon-green/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-neon-green/20 transition-colors">
                                <span className="material-symbols-outlined text-4xl text-neon-green">view_in_ar</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">3D Tactical Board</h3>
                            <p className="text-white/60 text-sm leading-relaxed mb-6">
                                Describe a play in text ("Cross from Right Back to Pivot") and watch the AI generate a 3D animation to show your players.
                            </p>
                            <div className="text-xs font-mono text-neon-green bg-neon-green/5 p-2 rounded border border-neon-green/10">
                                Powered by Veo GenAI
                            </div>
                        </div>

                        {/* Feature 3 */}
                        <div className="glass-panel p-8 rounded-2xl border-t-4 border-t-cyan-400 hover:-translate-y-2 transition-transform cursor-default group">
                            <div className="bg-cyan-400/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-cyan-400/20 transition-colors">
                                <span className="material-symbols-outlined text-4xl text-cyan-400">tablet_mac</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Real-time Ecosystem</h3>
                            <p className="text-white/60 text-sm leading-relaxed mb-6">
                                Connect court-side tablets for live tagging. Data syncs instantly to the bench dashboard for immediate tactical decisions.
                            </p>
                            <div className="text-xs font-mono text-cyan-400 bg-cyan-400/5 p-2 rounded border border-cyan-400/10">
                                &lt; 200ms Latency
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section id="pricing" className="py-24 px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[#1a120b] to-[#2f2519]/50 pointer-events-none"></div>
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-16">
                         <span className="text-neon-green font-bold text-sm tracking-widest uppercase mb-2 block">Plans</span>
                        <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">Transparent Pricing</h2>
                        <p className="text-[#cbad90]">Choose the power your club needs.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {/* Basic */}
                        <div className="glass-panel p-8 rounded-2xl flex flex-col hover:border-white/20 transition-colors">
                            <h3 className="text-lg font-bold text-white/60 mb-2">Basic</h3>
                            <div className="flex items-baseline gap-1 mb-6">
                                <p className="text-4xl font-bold text-white">€49</p>
                                <span className="text-lg text-white/40 font-normal">/mo</span>
                            </div>
                            <ul className="space-y-4 mb-8 flex-1">
                                <li className="flex gap-3 text-sm text-white/80"><span className="material-symbols-outlined text-green-500 text-sm">check</span> Match Dashboard</li>
                                <li className="flex gap-3 text-sm text-white/80"><span className="material-symbols-outlined text-green-500 text-sm">check</span> Player Roster</li>
                                <li className="flex gap-3 text-sm text-white/40"><span className="material-symbols-outlined text-white/20 text-sm">close</span> AI Video Clips</li>
                                <li className="flex gap-3 text-sm text-white/40"><span className="material-symbols-outlined text-white/20 text-sm">close</span> 3D Generator</li>
                            </ul>
                            <button onClick={onLogin} className="w-full py-3 border border-white/20 rounded-xl text-white font-bold hover:bg-white/5 transition-colors">Select Plan</button>
                        </div>

                         {/* Pro */}
                         <div className="glass-panel p-8 rounded-2xl flex flex-col border border-primary relative transform lg:scale-105 bg-[#2f2519] shadow-2xl shadow-black/50">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">Most Popular</div>
                            <h3 className="text-lg font-bold text-primary mb-2">Pro</h3>
                            <div className="flex items-baseline gap-1 mb-6">
                                <p className="text-5xl font-bold text-white">€129</p>
                                <span className="text-lg text-white/40 font-normal">/mo</span>
                            </div>
                            <ul className="space-y-4 mb-8 flex-1">
                                <li className="flex gap-3 text-sm text-white"><span className="material-symbols-outlined text-primary text-sm">check</span> Match Dashboard</li>
                                <li className="flex gap-3 text-sm text-white"><span className="material-symbols-outlined text-primary text-sm">check</span> AI Auto-Stats</li>
                                <li className="flex gap-3 text-sm text-white"><span className="material-symbols-outlined text-primary text-sm">check</span> Clip Editor (Limited)</li>
                                <li className="flex gap-3 text-sm text-white/40"><span className="material-symbols-outlined text-white/20 text-sm">close</span> 3D Generator</li>
                            </ul>
                            <button onClick={onLogin} className="w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 scale-105 active:scale-95">Select Plan</button>
                        </div>

                         {/* Elite */}
                         <div className="glass-panel p-8 rounded-2xl flex flex-col hover:border-purple-500/50 transition-colors">
                            <h3 className="text-lg font-bold text-purple-400 mb-2">Elite</h3>
                            <div className="flex items-baseline gap-1 mb-6">
                                <p className="text-4xl font-bold text-white">€299</p>
                                <span className="text-lg text-white/40 font-normal">/mo</span>
                            </div>
                            <ul className="space-y-4 mb-8 flex-1">
                                <li className="flex gap-3 text-sm text-white/80"><span className="material-symbols-outlined text-purple-400 text-sm">check</span> All Pro Features</li>
                                <li className="flex gap-3 text-sm text-white/80"><span className="material-symbols-outlined text-purple-400 text-sm">check</span> Unlimited AI Clips</li>
                                <li className="flex gap-3 text-sm text-white/80"><span className="material-symbols-outlined text-purple-400 text-sm">check</span> 3D Tactical Generator</li>
                                <li className="flex gap-3 text-sm text-white/80"><span className="material-symbols-outlined text-purple-400 text-sm">check</span> External API Access</li>
                            </ul>
                            <button onClick={() => setIsContactModalOpen(true)} className="w-full py-3 border border-purple-500/50 text-purple-400 rounded-xl font-bold hover:bg-purple-500/10 transition-colors">Contact Sales</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-24 px-6 bg-[#0a0604]">
                <div className="max-w-4xl mx-auto glass-panel p-8 lg:p-12 rounded-3xl border border-white/10">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-white mb-4">Get in Touch</h2>
                        <p className="text-[#cbad90]">Questions about enterprise integration? We are here to help.</p>
                    </div>
                    
                    <form onSubmit={handleContactSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-white/60 uppercase">Name</label>
                            <input type="text" className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-primary transition-colors" placeholder="John Doe" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-white/60 uppercase">Email</label>
                            <input type="email" className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-primary transition-colors" placeholder="john@club.com" required />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-bold text-white/60 uppercase">Message</label>
                            <textarea className="w-full h-32 bg-black/20 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-primary transition-colors resize-none" placeholder="Tell us about your club's needs..." required></textarea>
                        </div>
                        <div className="md:col-span-2">
                            <button type="submit" disabled={contactFormStatus !== 'IDLE'} className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                                {contactFormStatus === 'IDLE' && 'Send Message'}
                                {contactFormStatus === 'SENDING' && 'Sending...'}
                                {contactFormStatus === 'SENT' && <><span className="material-symbols-outlined text-green-600">check_circle</span> Message Sent</>}
                            </button>
                        </div>
                    </form>
                </div>
            </section>

             <footer className="py-12 border-t border-white/5 text-center text-white/40 text-sm bg-[#0a0604]">
                <div className="flex justify-center gap-6 mb-6">
                    <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                    <a href="#" className="hover:text-white transition-colors">Support</a>
                </div>
                <p>© 2025 7metrics. All rights reserved.</p>
            </footer>

            {/* Contact Modal */}
            {isContactModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-slide-in p-4">
                    <div className="bg-[#1a120b] border border-white/10 w-full max-w-md rounded-2xl p-8 relative shadow-2xl">
                        <button onClick={() => setIsContactModalOpen(false)} className="absolute top-4 right-4 text-white/40 hover:text-white">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                        
                        <h3 className="text-2xl font-bold text-white mb-2">Talk to Sales</h3>
                        <p className="text-white/50 text-sm mb-6">Leave your details and we will schedule a demo for your club.</p>
                        
                        <form onSubmit={handleContactSubmit} className="space-y-4">
                             <input type="text" className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-primary" placeholder="Club Name" required />
                             <input type="email" className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-primary" placeholder="Email Address" required />
                             <input type="tel" className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-primary" placeholder="Phone Number" />
                             
                             <button type="submit" disabled={contactFormStatus !== 'IDLE'} className="w-full bg-primary hover:bg-primary/80 text-white font-bold py-3 rounded-xl transition-all flex justify-center items-center gap-2">
                                {contactFormStatus === 'IDLE' && 'Request Demo'}
                                {contactFormStatus === 'SENDING' && <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></span>}
                                {contactFormStatus === 'SENT' && 'Request Sent!'}
                             </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};