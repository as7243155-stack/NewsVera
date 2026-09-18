import React, { useEffect, useState } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
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
import { getReportById } from './services/reports';
import SectionEyebrow from './components/layout/SectionEyebrow';
import LinkCheckPage from './pages/LinkCheckPage';

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

function getSourceName(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '');

    const knownSources: Record<string, string> = {
      'reuters.com': 'Reuters',
      'apnews.com': 'AP',
      'bbc.com': 'BBC',
      'afp.com': 'AFP',
      'nasa.gov': 'NASA',
      'who.int': 'WHO',
      'un.org': 'United Nations',
    };

    return knownSources[hostname] || hostname;
  } catch {
    return 'Web Source';
  }
}
function SavedReportPage({
  onAnother,
}: {
  onAnother: () => void;
}) {
  const { reportId } = useParams();

  const [report, setReport] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadReport() {
      if (!reportId) {
        setError('Report not found.');
        setLoading(false);
        return;
      }

      const { data, error: reportError } =
        await getReportById(reportId);

      if (reportError || !data) {
        setError(
          reportError?.message || 'Unable to load this report.'
        );
        setLoading(false);
        return;
      }

      const analysis = Array.isArray(data.ai_comments)
        ? data.ai_comments.filter(
            (item): item is string => typeof item === 'string'
          )
        : [];

      const sources = Array.isArray(data.source_links)
        ? data.source_links
            .filter(
              (source: any) =>
                source &&
                source.title &&
                source.url
            )
            .map((source: any) => ({
              name: source.name || getSourceName(source.url),
              title: source.title,
              type: source.type || 'Web source',
              description:
                source.description ||
                'Evidence retrieved during verification.',
              url: source.url,
            }))
        : [];

      setReport({
        score: data.truth_score,
        verdict: data.verdict_label,
        input: data.claim_text,
        analysis,
        sources,
      });

      setLoading(false);
    }

    loadReport();
  }, [reportId]);

  if (loading) {
    return (
      <main className="simple-page result-page">
        <div className="result-kicker">
          <SectionEyebrow>
            SAVED INVESTIGATION
          </SectionEyebrow>
        </div>

        <div className="report-row">
          <div className="report-claim">
            <h3>Loading your report...</h3>
          </div>
        </div>
      </main>
    );
  }

  if (error || !report) {
    return (
      <main className="simple-page result-page">
        <div className="result-kicker">
          <SectionEyebrow>
            SAVED INVESTIGATION
          </SectionEyebrow>
        </div>

        <div className="report-row">
          <div className="report-claim">
            <h3>Unable to load this report</h3>
            <p>{error || 'Report not found.'}</p>
          </div>
        </div>

        <button
          className="dark-button"
          onClick={() => onAnother()}
        >
          Verify another story
        </button>
      </main>
    );
  }

  return (
    <ResultPage
      result={report}
      onAnother={onAnother}
    />
  );
}

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPage =
    location.pathname === '/'
      ? 'home'
      : location.pathname.split('/')[1] || 'home';

  const [user, setUser] = useState<User | null>(null);
  const [result, setResult] =
    useState<VerificationResult | null>(null);
  
  const [linkCheckResult, setLinkCheckResult] =
    useState<any>(null);

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

  const handleResult = (
    verificationResult: VerificationResult
  ) => {
    setResult(verificationResult);
    navigate('/result');
  };

  /*
   * Homepage verification.
   *
   * This sends the text entered in the homepage
   * directly to the real FastAPI verification API.
   */
  const handleHomeVerify = async (
  content: string,
  mode: 'text' | 'url'
) => {
  if (!user) {
    navigate('/signin');
    return;
  }

  const response = await fetch(
    'http://127.0.0.1:8000/verify',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mode,
        content: content.trim(),
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || 'Verification request failed.'
    );
  }

  const sources = Array.isArray(data.sources)
    ? data.sources
        .filter(
          (source: any) =>
            source.url &&
            source.title
        )
        .slice(0, 4)
        .map((source: any) => ({
          name: getSourceName(source.url),
          title: source.title,
          type: 'Web source',
          description:
            source.content ||
            'Evidence retrieved during verification.',
          url: source.url,
        }))
    : [];

  const verificationResult: VerificationResult = {
    score: data.verification.score,
    verdict: data.verification.verdict,
    input: data.input,
    analysis: data.verification.analysis,
    sources,
  };

  handleResult(verificationResult);
};

const handleCheckLink = async (url: string) => {
  if (!user) {
    navigate('/signin');
    return;
  }

  const response = await fetch(
    'http://127.0.0.1:8000/check-link',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url.trim(),
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || 'Link check failed.'
    );
  }

  setLinkCheckResult(data);
  navigate('/link-check');
};


  const handleNavigate = (page: string) => {
    navigate(page);
  };

  return (
    <div className="min-h-screen bg-[#f4f0e8] text-[#171717]">
      <Navbar
        page={location.pathname.replace('/', '') || 'home'}
        onNavigate={handleNavigate}
        isLoggedIn={!!user}
        onSignOut={handleSignOut}
      />

      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              onVerify={handleHomeVerify}
              onCheckLink={handleCheckLink}
              onExplore={() => navigate('/explore')}
            />
          }
        />

        <Route
          path="/verify"
          element={
            <ProtectedRoute user={user}>
              <VerifyPage onResult={handleResult} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/result"
          element={
            <ProtectedRoute user={user}>
              {result ? (
                <ResultPage
                  result={result}
                  onAnother={() => navigate('/verify')}
                />
              ) : (
                <Navigate to="/verify" replace />
              )}
            </ProtectedRoute>
          }
        />


<Route
  path="/result/:reportId"
  element={
    <ProtectedRoute user={user}>
      <SavedReportPage
        onAnother={() => navigate('/verify')}
      />
    </ProtectedRoute>
  }
/>
<Route
  path="/link-check"
  element={
    <ProtectedRoute user={user}>
      {linkCheckResult ? (
        <LinkCheckPage
          result={linkCheckResult}
          onAnother={() => navigate('/')}
        />
      ) : (
        <Navigate to="/" replace />
      )}
    </ProtectedRoute>
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