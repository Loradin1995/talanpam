import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import ScrollToTop from './components/ScrollToTop';
import { LangProvider } from '@/lib/LangContext';
// Paj yo
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Lobby from './pages/Lobby';
import PlayerDashboard from './pages/PlayerDashboard';
import DepositPage from './pages/DepositPage';
import WithdrawPage from './pages/WithdrawPage';
import KYCPage from './pages/KYCPage';
import TournamentPage from './pages/TournamentPage';
import ChallengePage from './pages/ChallengePage';
import FreePlay from './pages/FreePlay';
import Game from './pages/Game';
import AdminDashboard from './pages/AdminDashboard';
import TermsPage from './pages/legal/TermsPage';
import PrivacyPage from './pages/legal/PrivacyPage';
import ResponsibleGamingPage from './pages/legal/ResponsibleGamingPage';

const AuthenticatedApp = () => {
  const { isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/responsible-gaming" element={<ResponsibleGamingPage />} />
      <Route path="/" element={<Lobby />} />
      <Route path="/lobby" element={<Lobby />} />
      <Route path="/dashboard" element={<PlayerDashboard />} />
      <Route path="/deposit" element={<DepositPage />} />
      <Route path="/withdraw" element={<WithdrawPage />} />
      <Route path="/kyc" element={<KYCPage />} />
      <Route path="/tournament" element={<TournamentPage />} />
      <Route path="/challenge" element={<ChallengePage />} />
      <Route path="/free-play" element={<FreePlay />} />
      <Route path="/game" element={<Game />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <LangProvider>
          <Router>
            <ScrollToTop />
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </LangProvider>
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
