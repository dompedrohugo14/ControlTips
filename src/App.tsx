import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Management from './pages/Management';
import NewBet from './pages/NewBet';
import EditBet from './pages/EditBet';
import ProfitEvolution from './pages/ProfitEvolution';
import ROIEvolution from './pages/ROIEvolution';
import WinRateEvolution from './pages/WinRateEvolution';
import CategoryWinRate from './pages/CategoryWinRate';
import TermsOfService from './pages/TermsOfService';
import { Subscription } from './pages/Subscription';
import { Success } from './pages/Success';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setIsAuthenticated(!!session);
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-yellow-500 text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login />
            )
          }
        />
        <Route
          path="/signup"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Signup />
            )
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Register
                onRegisterSuccess={() => setIsAuthenticated(true)}
                onBackToLogin={() => {}}
              />
            )
          }
        />
        <Route
          path="/forgot-password"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <ForgotPassword onBackToLogin={() => {}} />
            )
          }
        />
        <Route
          path="/admin-login"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <AdminLogin />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/management"
          element={
            <ProtectedRoute>
              <Management />
            </ProtectedRoute>
          }
        />
        <Route
          path="/new-bet"
          element={
            <ProtectedRoute>
              <NewBet />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-bet/:id"
          element={
            <ProtectedRoute>
              <EditBet />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profit-evolution"
          element={
            <ProtectedRoute>
              <ProfitEvolution />
            </ProtectedRoute>
          }
        />
        <Route
          path="/roi-evolution"
          element={
            <ProtectedRoute>
              <ROIEvolution />
            </ProtectedRoute>
          }
        />
        <Route
          path="/win-rate-evolution"
          element={
            <ProtectedRoute>
              <WinRateEvolution />
            </ProtectedRoute>
          }
        />
        <Route
          path="/category-win-rate"
          element={
            <ProtectedRoute>
              <CategoryWinRate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subscription"
          element={
            <ProtectedRoute>
              <Subscription />
            </ProtectedRoute>
          }
        />
        <Route
          path="/success"
          element={
            <ProtectedRoute>
              <Success />
            </ProtectedRoute>
          }
        />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;