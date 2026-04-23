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
import VersionControl from './pages/VersionControl';
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

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const role = localStorage.getItem('userRole');
  if (!role) {
    return <Navigate to="/auth" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        
        {/* App Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
        <Route path="/tables" element={<ProtectedRoute><AppLayout><Tables /></AppLayout></ProtectedRoute>} />
        <Route path="/sql" element={<ProtectedRoute><AppLayout><SqlConsole /></AppLayout></ProtectedRoute>} />
        <Route path="/ai-query" element={<ProtectedRoute><AppLayout><AiQuery /></AppLayout></ProtectedRoute>} />
        <Route path="/passengers" element={<ProtectedRoute><AppLayout><Passengers /></AppLayout></ProtectedRoute>} />
        <Route path="/version-control" element={<ProtectedRoute><AppLayout><VersionControl /></AppLayout></ProtectedRoute>} />
        
        {/* Default route */}
        <Route path="/" element={<Navigate to="/auth" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
