import { useState } from 'react';
import { ArrowRight } from 'lucide-react';

import Logo from '@/components/layout/Logo';
import SectionEyebrow from '@/components/layout/SectionEyebrow';
import { signIn } from '@/services/auth';

interface SignInPageProps {
  onNavigate: (page: string) => void;
  onSuccess: () => void;
}

export default function SignInPage({
  onNavigate,
  onSuccess,
}: SignInPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError('');
    setLoading(true);

    const { error: signInError } = await signIn(
      email,
      password
    );


    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }
    onNavigate('/dashboard');

    setLoading(false);
    onSuccess();
  };

  return (
    <main className="auth-page paper-noise">
      <div className="auth-card">
        <Logo onClick={() => onNavigate('home')} />

        <SectionEyebrow>
          WELCOME BACK, READER
        </SectionEyebrow>

        <h1>Sign in to NewsVera.</h1>

        <p>
          Pick up where your last investigation left off.
        </p>

        <form onSubmit={handleSubmit}>
          <label>
            Email address

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="you@example.com"
              required
            />
          </label>

          <label>
            Password

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Your password"
              required
            />
          </label>

          {error && (
            <p className="form-error">
              {error}
            </p>
          )}

          <button
            className="dark-button"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}

            {!loading && (
              <ArrowRight size={17} />
            )}
          </button>
        </form>

        <p className="auth-switch">
          New to NewsVera?{' '}

          <button
            type="button"
            onClick={() =>
              onNavigate('signup')
            }
          >
            Create an account
          </button>
        </p>
      </div>
    </main>
  );
}