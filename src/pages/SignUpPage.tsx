import { useState } from 'react';
import { ArrowRight } from 'lucide-react';

import Logo from '@/components/layout/Logo';
import SectionEyebrow from '@/components/layout/SectionEyebrow';
import { signUp } from '@/services/auth';

interface SignUpPageProps {
  onNavigate: (page: 'home' | 'signin') => void;
}

export default function SignUpPage({
  onNavigate,
}: SignUpPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    const {
      data,
      error: signUpError,
    } = await signUp(
      email,
      password
    );

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    setLoading(false);

    if (data.user) {
      setMessage(
        'Account created. Please check your email to confirm your account.'
      );
    }
  };

  return (
    <main className="auth-page paper-noise">
      <div className="auth-card">
        <Logo onClick={() => onNavigate('home')} />

        <SectionEyebrow>
          JOIN THE NOTEBOOK
        </SectionEyebrow>

        <h1>Create your account.</h1>

        <p>
          Save your reports and keep your investigations
          in one place.
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
              placeholder="At least 8 characters"
              minLength={8}
              required
            />
          </label>

          <label>
            Confirm password

            <input
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              placeholder="Repeat your password"
              minLength={8}
              required
            />
          </label>

          {error && (
            <p className="form-error">
              {error}
            </p>
          )}

          {message && (
            <p className="form-success">
              {message}
            </p>
          )}

          <button
            className="dark-button"
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Creating account...'
              : 'Create account'}

            {!loading && (
              <ArrowRight size={17} />
            )}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}

          <button
            type="button"
            onClick={() =>
              onNavigate('signin')
            }
          >
            Sign in
          </button>
        </p>
      </div>
    </main>
  );
}