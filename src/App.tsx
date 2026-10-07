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
import ResultPage from './pages/ResultPage';
import ExplorePage from './pages/ExplorePage';
import AboutPage from './pages/AboutPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import DashboardPage from './pages/DashboardPage';
import LinkCheckPage from './pages/LinkCheckPage';

import { getReportById } from './services/reports';

import SectionEyebrow from './components/layout/SectionEyebrow';

import {
  VerificationResult,
} from './components/verification/VerificationWorkspace';

function ProtectedRoute({
  user,
  children,
}: {
  user: User | null;
  children: React.ReactNode;
}) {
  if (!user) {
    return (
      <Navigate
        to="/signin"
        replace
      />
    );
  }

  return <>{children}</>;
}

function getSourceName(
  url: string
): string {
  try {
    const hostname = new URL(url)
      .hostname
      .replace(/^www\./, '');

    const knownSources: Record<
      string,
      string
    > = {
      'reuters.com': 'Reuters',
      'apnews.com': 'AP',
      'bbc.com': 'BBC',
      'afp.com': 'AFP',
      'nasa.gov': 'NASA',
      'who.int': 'WHO',
      'un.org': 'United Nations',
    };

    return (
      knownSources[hostname] ||
      hostname
    );
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

  const [report, setReport] =
    useState<VerificationResult | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  useEffect(() => {
    async function loadReport() {
      if (!reportId) {
        setError('Report not found.');
        setLoading(false);
        return;
      }

      const {
        data,
        error: reportError,
      } = await getReportById(reportId);

      if (reportError || !data) {
        setError(
          reportError?.message ||
            'Unable to load this report.'
        );

        setLoading(false);
        return;
      }

      const analysis =
        Array.isArray(data.ai_comments)
          ? data.ai_comments.filter(
              (
                item
              ): item is string =>
                typeof item ===
                'string'
            )
          : [];

      const sources =
        Array.isArray(
          data.source_links
        )
          ? data.source_links
              .filter(
                (source: any) =>
                  source &&
                  source.title &&
                  source.url
              )
              .map(
                (source: any) => ({
                  name:
                    source.name ||
                    getSourceName(
                      source.url
                    ),
                  title:
                    source.title,
                  type:
                    source.type ||
                    'Web source',
                  description:
                    source.description ||
                    'Evidence retrieved during verification.',
                  url: source.url,
                })
              )
          : [];

      setReport({
        score: data.truth_score,
        verdict:
          data.verdict_label,
        input:
          data.claim_text,
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
            <h3>
              Loading your report...
            </h3>
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
            <h3>
              Unable to load this report
            </h3>

            <p>
              {error ||
                'Report not found.'}
            </p>
          </div>
        </div>

        <button
          className="dark-button"
          onClick={onAnother}
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
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const [user, setUser] =
    useState<User | null>(null);

  const [result, setResult] =
    useState<VerificationResult | null>(
      null
    );

  const [
    linkCheckResult,
    setLinkCheckResult,
  ] = useState<any>(null);

  /*
   * Authentication
   */
  useEffect(() => {
    supabase.auth
      .getUser()
      .then(({ data }) => {
        setUser(data.user);
      });

    const {
      data: {
        subscription,
      },
    } =
      supabase.auth.onAuthStateChange(
        (event, session) => {
          setUser(
            session?.user ?? null
          );

          /*
           * Google OAuth returns to "/"
           * so Vercel can load the SPA.
           *
           * Once Supabase confirms the login,
           * React sends the user to Dashboard.
           */
          if (
            event === 'SIGNED_IN' &&
            session?.user &&
            sessionStorage.getItem(
              'newsvera_google_login'
            ) === '1'
          ) {
            sessionStorage.removeItem(
              'newsvera_google_login'
            );

            navigate('/dashboard');
          }
        }
      );

    return () =>
      subscription.unsubscribe();
  }, [navigate]);

  /*
   * Sign out
   */
  const handleSignOut =
    async () => {
      await supabase.auth.signOut();

      setUser(null);

      navigate('/');
    };

  /*
   * Verification result
   */
  const handleResult = (
    verificationResult: VerificationResult
  ) => {
    setResult(
      verificationResult
    );

    navigate('/result');
  };

  /*
   * Homepage verification
   */
  const handleHomeVerify =
    async (
      content: string,
      mode: 'text' | 'url'
    ) => {
      if (!user) {
        navigate('/signin');
        return;
      }

      const response =
        await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/verify`,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify({
              mode,
              content:
                content.trim(),
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            'Verification request failed.'
        );
      }

      const sources =
        Array.isArray(
          data.sources
        )
          ? data.sources
              .filter(
                (source: any) =>
                  source.url &&
                  source.title
              )
              .slice(0, 4)
              .map(
                (source: any) => ({
                  name:
                    getSourceName(
                      source.url
                    ),
                  title:
                    source.title,
                  type:
                    'Web source',
                  description:
                    source.content ||
                    'Evidence retrieved during verification.',
                  url: source.url,
                })
              )
          : [];

      const verificationResult: VerificationResult =
        {
          score:
            data.verification
              .score,

          verdict:
            data.verification
              .verdict,

          input:
            data.input,

          analysis:
            data.verification
              .analysis,

          sources,
        };

      handleResult(
        verificationResult
      );
    };

  /*
   * Link checker
   */
  const handleCheckLink =
    async (url: string) => {
      if (!user) {
        navigate('/signin');
        return;
      }

      const response =
        await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/check-link`,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify({
              url: url.trim(),
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            'Link check failed.'
        );
      }

      setLinkCheckResult(data);

      navigate(
        '/link-check'
      );
    };

  const handleNavigate =
    (page: string) => {
      navigate(page);
    };

  return (
    <div className="min-h-screen bg-[#f4f0e8] text-[#171717]">

      <Navbar
        page={
          location.pathname.replace(
            '/',
            ''
          ) || 'home'
        }
        onNavigate={
          handleNavigate
        }
        isLoggedIn={!!user}
        onSignOut={
          handleSignOut
        }
      />

      <Routes>

        {/* HOME */}

        <Route
          path="/"
          element={
            <HomePage
              onVerify={
                handleHomeVerify
              }
              onCheckLink={
                handleCheckLink
              }
              onExplore={() =>
                navigate(
                  '/explore'
                )
              }
            />
          }
        />

        {/* LIVE RESULT */}

        <Route
          path="/result"
          element={
            <ProtectedRoute
              user={user}
            >
              {result ? (
                <ResultPage
                  result={result}
                  onAnother={() =>
                    navigate('/')
                  }
                />
              ) : (
                <Navigate
                  to="/"
                  replace
                />
              )}
            </ProtectedRoute>
          }
        />

        {/* SAVED REPORT */}

        <Route
          path="/result/:reportId"
          element={
            <ProtectedRoute
              user={user}
            >
              <SavedReportPage
                onAnother={() =>
                  navigate('/')
                }
              />
            </ProtectedRoute>
          }
        />

        {/* LINK CHECKER */}

        <Route
          path="/link-check"
          element={
            <ProtectedRoute
              user={user}
            >
              {linkCheckResult ? (
                <LinkCheckPage
                  result={
                    linkCheckResult
                  }
                  onAnother={() =>
                    navigate('/')
                  }
                />
              ) : (
                <Navigate
                  to="/"
                  replace
                />
              )}
            </ProtectedRoute>
          }
        />

        {/* EXPLORE */}

        <Route
          path="/explore"
          element={
            <ExplorePage />
          }
        />

        {/* ABOUT */}

        <Route
          path="/about"
          element={
            <AboutPage />
          }
        />

        {/* SIGN IN */}

        <Route
          path="/signin"
          element={
            <SignInPage
              onNavigate={
                handleNavigate
              }
              onSuccess={() =>
                navigate(
                  '/dashboard'
                )
              }
            />
          }
        />

        {/* SIGN UP */}

        <Route
          path="/signup"
          element={
            <SignUpPage
              onNavigate={
                handleNavigate
              }
            />
          }
        />

        {/* DASHBOARD */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute
              user={user}
            >
              <DashboardPage
                onNavigate={
                  handleNavigate
                }
                onSignOut={
                  handleSignOut
                }
              />
            </ProtectedRoute>
          }
        />

        {/* FALLBACK */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
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