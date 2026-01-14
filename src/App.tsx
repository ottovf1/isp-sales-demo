import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Toaster } from './components/ui/toaster';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import SponsorMatch from './pages/SponsorMatch';
import FanbaseInsights from './pages/FanbaseInsights';
import ProspectResearch from './pages/ProspectResearch';
import Pipeline from './pages/Pipeline';
import AIPitchGenerator from './pages/AIPitchGenerator';
import TokenReceiver from './pages/TokenReceiver';
import Login from './pages/Login';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Laddar ISP Sales Demo...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/auth/callback" element={<TokenReceiver />} />
        <Route path="/login" element={<Login />} />
        
        {user ? (
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/sponsor-match" element={<SponsorMatch />} />
            <Route path="/fanbase-insights" element={<FanbaseInsights />} />
            <Route path="/prospect-research" element={<ProspectResearch />} />
            <Route path="/pipeline" element={<Pipeline />} />
            <Route path="/pitch-generator" element={<AIPitchGenerator />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
