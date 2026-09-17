import React, { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { User } from '@supabase/supabase-js';

import { supabase } from './lib/supabase';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

import HomePage from './pages/HomePage';
import VerifyPage from './pages/VerifyPage';
import ResultPage from './pages/ResultPage';
import ExplorePage from './pages/ExplorePage';
import AboutPage from './pages/AboutPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import DashboardPage from './pages/DashboardPage';

import { VerificationResult } from './components/verification/VerificationWorkspace';

function ProtectedRoute({
  user,
  children,
}: {
  user: User | null;
  children: React.ReactNode;
}) {
  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
}

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState<User | null>(null);
  const [result, setResult] = useState<VerificationResult | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleResult = (verificationResult: VerificationResult) => {
    setResult(verificationResult);
    navigate('/result');
  };

  const handleNavigate = (page: string) => {
    navigate(page);
  };

  return (
    <div className="min-h-screen bg-[#f4f0e8] text-[#171717]">
      <Navbar
        page={location.pathname}
        onNavigate={handleNavigate}
      />

      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              onVerify={() => navigate('/verify')}
              onExplore={() => navigate('/explore')}
            />
          }
        />

        <Route
          path="/verify"
          element={<VerifyPage onResult={handleResult} />}
        />

        <Route
          path="/result"
          element={
            result ? (
              <ResultPage
                result={result}
                onAnother={() => navigate('/verify')}
              />
            ) : (
              <Navigate to="/verify" replace />
            )
          }
        />

        <Route
          path="/explore"
          element={<ExplorePage />}
        />

        <Route
          path="/about"
          element={<AboutPage />}
        />

        <Route
          path="/signin"
          element={
            <SignInPage
              onNavigate={handleNavigate}
            />
          }
        />

        <Route
          path="/signup"
          element={
            <SignUpPage
              onNavigate={handleNavigate}
            />
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user}>
              <DashboardPage
                onNavigate={handleNavigate}
                onSignOut={handleSignOut}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}