import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';

// Pages
import Dashboard from './pages/Dashboard';
import Tables from './pages/Tables';
import SqlConsole from './pages/SqlConsole';
import AiQuery from './pages/AiQuery';
import Passengers from './pages/Passengers';
import Reservations from './pages/Reservations';
import Analytics from './pages/Analytics';
import Auth from './pages/Auth';

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background min-h-screen text-on-background selection:bg-primary selection:text-on-primary font-body">
      <Sidebar />
      <Topbar />
      {children}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        
        {/* App Routes */}
        <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
        <Route path="/tables" element={<AppLayout><Tables /></AppLayout>} />
        <Route path="/sql" element={<AppLayout><SqlConsole /></AppLayout>} />
        <Route path="/ai-query" element={<AppLayout><AiQuery /></AppLayout>} />
        <Route path="/passengers" element={<AppLayout><Passengers /></AppLayout>} />
        <Route path="/reservations" element={<AppLayout><Reservations /></AppLayout>} />
        <Route path="/analytics" element={<AppLayout><Analytics /></AppLayout>} />
        
        {/* Default route */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
