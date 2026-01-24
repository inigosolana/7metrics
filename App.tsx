import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import RoleSelection from './pages/RoleSelection';
import AdminDashboard from './pages/AdminDashboard';
import CoachDashboard from './pages/CoachDashboard';
import ManagementHub from './pages/ManagementHub';
import PlayerPortal from './pages/PlayerPortal';
import GeminiAssistant from './components/GeminiAssistant';

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="min-h-screen font-space">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/select-role" element={<RoleSelection />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/coach" element={<CoachDashboard />} />
          <Route path="/management" element={<ManagementHub />} />
          <Route path="/player" element={<PlayerPortal />} />
        </Routes>
        <GeminiAssistant />
      </div>
    </HashRouter>
  );
};

export default App;