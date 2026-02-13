import React, { useState, useMemo } from 'react';
import { View, UserRole, Club, User } from './types';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { AIChat } from './components/AIChat';
import { TacticalBoardGenerator } from './components/TacticalBoardGenerator'; // Renamed import
import { RealStats } from './components/RealStats';
import { AIStats } from './components/AIStats';
import { ManualStats } from './components/ManualStats';
import { TeamHub } from './components/TeamHub';
import { VideoLabs } from './components/VideoLabs';
import { ClipEditor } from './components/ClipEditor';
import { SuperAdminDashboard } from './components/SuperAdminDashboard';
import { ClubAdminDashboard } from './components/ClubAdminDashboard';
import { PlayerDashboard } from './components/PlayerDashboard';

const App: React.FC = () => {
  // --- AUTH STATE ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // --- MOCK DATA FOR RBAC & SUBSCRIPTIONS ---
  const [clubs, setClubs] = useState<Club[]>([
    { 
        id: 'c1', name: 'PSG Handball', logoUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=100', 
        subscription: { 
            tier: 'ELITE', 
            features: { aiStats: true, clipEditor: true, externalApp: true, videoGen: true } 
        } 
    },
    { 
        id: 'c2', name: 'Local Club', logoUrl: 'https://images.unsplash.com/photo-1516054575922-f0b8ee4404b5?w=100', 
        subscription: { 
            tier: 'BASIC', 
            features: { aiStats: false, clipEditor: false, externalApp: false, videoGen: false } 
        } 
    }
  ]);

  // Current User Simulation
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'u1',
    name: 'Admin User',
    role: UserRole.SUPER_ADMIN,
    clubId: 'c1',
    avatarUrl: 'https://i.pravatar.cc/150?u=u1'
  });

  const currentClub = useMemo(() => clubs.find(c => c.id === currentUser.clubId) || clubs[0], [clubs, currentUser.clubId]);

  const [activeView, setActiveView] = useState<View>(View.DASHBOARD);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [hasAIProcessedData, setHasAIProcessedData] = useState(false);

  // Update Club features (Super Admin Action)
  const updateClubSubscription = (clubId: string, features: any) => {
    setClubs(clubs.map(c => c.id === clubId ? { ...c, subscription: { ...c.subscription, features } } : c));
  };

  const handleAddClub = (newClub: Club) => {
      setClubs([...clubs, newClub]);
  };

  const switchUserRole = (role: UserRole) => {
      const clubToUse = role === UserRole.SUPER_ADMIN ? 'c1' : 'c1'; // Default
      setCurrentUser({
          ...currentUser,
          role: role,
          name: role === UserRole.SUPER_ADMIN ? 'Super Admin' : (role === UserRole.PLAYER ? 'Mikkel Hansen' : 'Coach Anderson'),
          clubId: clubToUse
      });
      // Reset view to default for role
      if (role === UserRole.PLAYER) setActiveView(View.PLAYER_DASHBOARD);
      else if (role === UserRole.SUPER_ADMIN) setActiveView(View.SUPER_ADMIN);
      else if (role === UserRole.CLUB_ADMIN) setActiveView(View.CLUB_ADMIN);
      else setActiveView(View.DASHBOARD);
  };

  const handleAIProcessComplete = () => {
      setHasAIProcessedData(true);
  };

  // Permission Checks
  const hasFeature = (feature: keyof typeof currentClub.subscription.features) => {
      // Super Admin sees all? Or simulate club view? Let's say Super Admin sees all capabilities.
      if (currentUser.role === UserRole.SUPER_ADMIN) return true;
      return currentClub.subscription.features[feature];
  };

  // If not logged in, show Landing Page
  if (!isLoggedIn) {
      return <LandingPage onLogin={() => setIsLoggedIn(true)} />;
  }

  // Render Logic
  return (
    <div className="flex min-h-screen w-full bg-background-dark text-white font-display">
        {/* --- DEMO ROLE SWITCHER (TOP BAR) --- */}
        <div className="fixed top-0 left-0 right-0 h-1 z-[60] flex justify-center pointer-events-none">
            <div className="bg-black/80 backdrop-blur text-white px-4 py-1 rounded-b-xl border border-white/10 pointer-events-auto flex gap-4 text-xs shadow-xl">
                <span className="font-bold text-[#cbad90] uppercase my-auto">Simulate Role:</span>
                {[UserRole.SUPER_ADMIN, UserRole.CLUB_ADMIN, UserRole.COACH, UserRole.PLAYER].map(role => (
                    <button 
                        key={role}
                        onClick={() => switchUserRole(role)}
                        className={`px-2 py-1 rounded ${currentUser.role === role ? 'bg-primary text-white font-bold' : 'text-white/50 hover:text-white'}`}
                    >
                        {role.replace('_', ' ')}
                    </button>
                ))}
                 <div className="w-px h-4 bg-white/20 my-auto mx-2"></div>
                <button onClick={() => setIsLoggedIn(false)} className="text-red-400 hover:text-white font-bold">Exit Demo</button>
            </div>
        </div>

      {/* Sidebar */}
      <aside className="sticky top-0 h-screen w-20 lg:w-72 flex-shrink-0 flex flex-col border-r border-[#493622] bg-sidebar-bg z-50 pt-8">
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Branding */}
          <div className="flex items-center gap-3 p-6 mb-2">
            <div className="aspect-square rounded-full size-12 overflow-hidden border-2 border-primary/50 shadow-lg shadow-primary/20">
                <img src={currentClub.logoUrl} alt="Club" className="w-full h-full object-cover" />
            </div>
            <div className="hidden lg:flex flex-col">
              <h1 className="text-white text-lg font-bold leading-none tracking-tight">{currentClub.name}</h1>
              <p className="text-[#cbad90] text-[10px] font-medium uppercase tracking-widest mt-1">{currentUser.role.replace('_', ' ')}</p>
            </div>
          </div>

          <nav className="flex flex-col gap-1 px-3">
            
            {/* SUPER ADMIN MENU */}
            {currentUser.role === UserRole.SUPER_ADMIN && (
                <>
                    <p className="hidden lg:block text-[10px] font-bold text-red-500 uppercase tracking-widest px-4 mb-2 mt-4">Administration</p>
                    <button onClick={() => setActiveView(View.SUPER_ADMIN)} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${activeView === View.SUPER_ADMIN ? 'nav-item-active' : 'nav-item-inactive'}`}>
                        <span className="material-symbols-outlined text-[22px]">admin_panel_settings</span>
                        <span className="hidden lg:block text-sm font-semibold">Global Console</span>
                    </button>
                </>
            )}

            {/* CLUB ADMIN MENU */}
            {currentUser.role === UserRole.CLUB_ADMIN && (
                <>
                    <p className="hidden lg:block text-[10px] font-bold text-blue-500 uppercase tracking-widest px-4 mb-2 mt-4">Management</p>
                    <button onClick={() => setActiveView(View.CLUB_ADMIN)} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${activeView === View.CLUB_ADMIN ? 'nav-item-active' : 'nav-item-inactive'}`}>
                        <span className="material-symbols-outlined text-[22px]">domain</span>
                        <span className="hidden lg:block text-sm font-semibold">Club Admin</span>
                    </button>
                </>
            )}

            {/* PLAYER MENU */}
            {currentUser.role === UserRole.PLAYER && (
                 <>
                    <p className="hidden lg:block text-[10px] font-bold text-[#cbad90] uppercase tracking-widest px-4 mb-2 mt-4">Personal</p>
                    <button onClick={() => setActiveView(View.PLAYER_DASHBOARD)} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${activeView === View.PLAYER_DASHBOARD ? 'nav-item-active' : 'nav-item-inactive'}`}>
                        <span className="material-symbols-outlined text-[22px]">person</span>
                        <span className="hidden lg:block text-sm font-semibold">My Stats</span>
                    </button>
                    {/* Players can see Team Hub but maybe read-only */}
                    <button onClick={() => setActiveView(View.TEAM_HUB)} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${activeView === View.TEAM_HUB ? 'nav-item-active' : 'nav-item-inactive'}`}>
                        <span className="material-symbols-outlined text-[22px]">hub</span>
                        <span className="hidden lg:block text-sm font-medium">Team Roster</span>
                    </button>
                </>
            )}

            {/* COACH & ADMIN GENERAL MENU */}
            {(currentUser.role === UserRole.COACH || currentUser.role === UserRole.SUPER_ADMIN || currentUser.role === UserRole.CLUB_ADMIN) && (
                <>
                    <p className="hidden lg:block text-[10px] font-bold text-[#493622] uppercase tracking-widest px-4 mb-2 mt-4">Team Performance</p>
                    <button onClick={() => setActiveView(View.DASHBOARD)} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${activeView === View.DASHBOARD ? 'nav-item-active' : 'nav-item-inactive'}`}>
                        <span className="material-symbols-outlined text-[22px]">grid_view</span>
                        <span className="hidden lg:block text-sm font-semibold">Dashboard</span>
                    </button>
                    
                    <button onClick={() => setActiveView(View.TEAM_HUB)} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${activeView === View.TEAM_HUB ? 'nav-item-active' : 'nav-item-inactive'}`}>
                        <span className="material-symbols-outlined text-[22px]">hub</span>
                        <div className="hidden lg:flex flex-col leading-tight">
                            <span className="text-sm font-medium">Team Hub</span>
                            <span className="text-[10px] text-[#cbad90] font-normal">Roster & Season</span>
                        </div>
                    </button>

                    {/* FEATURE: EXTERNAL APP */}
                    {hasFeature('externalApp') && (
                        <button onClick={() => setActiveView(View.REAL_STATS)} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${activeView === View.REAL_STATS ? 'nav-item-active' : 'nav-item-inactive'}`}>
                            <span className="material-symbols-outlined text-[22px]">tablet_mac</span>
                            <div className="hidden lg:flex flex-col leading-tight">
                                <span className="text-sm font-medium">Live Match API</span>
                                <span className="text-[10px] text-[#cbad90] font-normal">Real-time Feed</span>
                            </div>
                        </button>
                    )}

                    {/* FEATURE: AI STATS */}
                    {hasFeature('aiStats') && (
                        <>
                            <p className="hidden lg:block text-[10px] font-bold text-[#493622] uppercase tracking-widest px-4 mb-2 mt-6">AI Suite</p>
                            <button onClick={() => setActiveView(View.AI_STATS)} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${activeView === View.AI_STATS ? 'nav-item-active' : 'nav-item-inactive'}`}>
                                <span className="material-symbols-outlined text-[22px]">insights</span>
                                <div className="hidden lg:flex flex-col leading-tight">
                                    <span className="text-sm font-medium">AI Auto-Stats</span>
                                    <span className="text-[10px] text-[#cbad90] font-normal">View Data</span>
                                </div>
                            </button>
                            <button onClick={() => setActiveView(View.VIDEO_LAB_PROCESS)} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${activeView === View.VIDEO_LAB_PROCESS ? 'nav-item-active' : 'nav-item-inactive'}`}>
                                <span className="material-symbols-outlined text-[22px]">science</span>
                                <div className="hidden lg:flex flex-col leading-tight">
                                    <span className="text-sm font-medium">AI Processor</span>
                                    <span className="text-[10px] text-[#cbad90] font-normal">Input Video</span>
                                </div>
                            </button>
                        </>
                    )}

                    {/* FEATURE: CLIP EDITOR */}
                    {hasFeature('clipEditor') && (
                         <button onClick={() => setActiveView(View.CLIP_EDITOR)} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${activeView === View.CLIP_EDITOR ? 'nav-item-active' : 'nav-item-inactive'}`}>
                            <span className="material-symbols-outlined text-[22px]">content_cut</span>
                            <div className="hidden lg:flex flex-col leading-tight">
                                <span className="text-sm font-medium">Clip Editor</span>
                                <span className="text-[10px] text-[#cbad90] font-normal">AI Auto-Splicer</span>
                            </div>
                        </button>
                    )}

                    <button onClick={() => setActiveView(View.MANUAL_STATS)} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${activeView === View.MANUAL_STATS ? 'nav-item-active' : 'nav-item-inactive'}`}>
                        <span className="material-symbols-outlined text-[22px]">edit_note</span>
                        <div className="hidden lg:flex flex-col leading-tight">
                            <span className="text-sm font-medium">Manual Tagging</span>
                        </div>
                    </button>
                </>
            )}
            
            {/* FEATURE: VIDEO GENERATOR (TACTICAL BOARD) */}
            {(currentUser.role === UserRole.COACH || currentUser.role === UserRole.SUPER_ADMIN) && hasFeature('videoGen') && (
                <button 
                    onClick={() => setIsVideoModalOpen(true)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg nav-item-inactive text-left group mt-4"
                >
                    <span className="material-symbols-outlined text-[22px] group-hover:text-primary transition-colors">view_in_ar</span>
                    <div className="hidden lg:flex flex-col leading-tight">
                        <span className="text-sm font-medium">3D Tactical Board</span>
                        <span className="text-[10px] text-[#cbad90] font-normal">AI Drills Generator</span>
                    </div>
                </button>
            )}
          </nav>
        </div>
        
        {/* User Profile Bottom */}
        <div className="p-4 mt-auto border-t border-[#493622] bg-sidebar-bg/50">
           {currentUser.role !== UserRole.PLAYER && (
               <button 
                    onClick={() => setIsChatOpen(!isChatOpen)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-4 transition-colors ${isChatOpen ? 'bg-primary text-white' : 'bg-white/5 text-[#cbad90] hover:bg-white/10'}`}
                >
                <span className="material-symbols-outlined">smart_toy</span>
                <span className="hidden lg:block text-sm font-medium">AI Assistant</span>
                </button>
           )}

            <div className="flex items-center gap-3 px-3 py-3 bg-white/5 rounded-xl border border-white/5">
                <div className="bg-center bg-no-repeat bg-cover rounded-lg size-10 border border-white/20 shrink-0" style={{backgroundImage: `url("${currentUser.avatarUrl}")`}}></div>
                <div className="hidden lg:flex flex-col min-w-0">
                    <p className="text-white text-xs font-bold truncate">{currentUser.name}</p>
                    <p className="text-primary text-[10px] font-medium">{currentUser.role.replace('_', ' ')}</p>
                </div>
            </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Top Header - Context Aware */}
        <header className="glass-panel sticky top-0 z-40 px-8 py-5 flex items-center justify-between gap-4 border-b border-[#493622]/50 mt-1">
            <div className="flex items-center gap-6">
                <div className="flex flex-col">
                    <h2 className="text-white text-xl font-bold tracking-tight">
                        {activeView === View.SUPER_ADMIN ? 'Global Administration' : 
                         activeView === View.CLUB_ADMIN ? 'Club Management' :
                         activeView === View.PLAYER_DASHBOARD ? 'My Player Portal' :
                         'Unified Dashboard'}
                    </h2>
                    {currentUser.role !== UserRole.PLAYER && (
                        <div className="flex items-center gap-3 text-xs text-[#cbad90] mt-0.5">
                            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-neon-green"></span> System Online</span>
                        </div>
                    )}
                </div>
            </div>
        </header>

        {/* View Routing */}
        {activeView === View.SUPER_ADMIN && <SuperAdminDashboard clubs={clubs} updateClubSubscription={updateClubSubscription} onAddClub={handleAddClub} />}
        {activeView === View.CLUB_ADMIN && <ClubAdminDashboard />}
        {activeView === View.PLAYER_DASHBOARD && <PlayerDashboard />}
        
        {/* Shared Views (Role Restricted by Navbar logic mostly, but guarded here if needed) */}
        {activeView === View.DASHBOARD && <Dashboard />}
        {activeView === View.TEAM_HUB && <TeamHub clubLogo={currentClub.logoUrl} setClubLogo={() => {}} />} {/* Read only logo for non-super admins usually */}
        {activeView === View.REAL_STATS && <RealStats />}
        {activeView === View.AI_STATS && <AIStats hasProcessedData={hasAIProcessedData} />}
        {activeView === View.VIDEO_LAB_PROCESS && <VideoLabs onProcessComplete={handleAIProcessComplete} />}
        {activeView === View.CLIP_EDITOR && <ClipEditor />}
        {activeView === View.MANUAL_STATS && <ManualStats />}

        {/* Modals */}
        <AIChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        
        {/* Tactical Board (3D Generator) */}
        <TacticalBoardGenerator isOpen={isVideoModalOpen} onClose={() => setIsVideoModalOpen(false)} />
      </main>
    </div>
  );
};

export default App;