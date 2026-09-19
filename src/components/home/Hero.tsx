import { useState } from 'react';

import {
  ArrowRight,
  CircleAlert,
  FileText,
  Globe2,
  Image as ImageIcon,
  Search,
  ShieldCheck,
} from 'lucide-react';

import homepageImage from '../../assets/homepage.jpeg';

type InputMode = 'text' | 'url' | 'image';

interface HeroProps {
  onVerify: (
    content: string,
    mode: 'text' | 'url'
  ) => Promise<void>;
  onCheckLink: (url: string) => Promise<void>;
  onExplore: () => void;
}

export default function Hero({
  onVerify,
  onCheckLink,
  onExplore,
}: HeroProps) {
  const [mode, setMode] = useState<InputMode>('text');
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [linkLoading, setLinkLoading] = useState(false);
  const [error, setError] = useState('');

  const modePlaceholder = {
    text: 'Paste a news claim here...',
    url: 'Paste an article URL here...',
    image: 'Upload a screenshot of a news story...',
  };

  const switchMode = (nextMode: InputMode) => {
    setMode(nextMode);
    setValue('');
    setError('');
  };

  const handleVerify = async () => {
    const trimmedValue = value.trim();

    if (mode === 'image') {
      setError(
        'Image verification is coming next. Please use Text or URL for now.'
      );
      return;
    }

    if (mode === 'text') {
      const words = trimmedValue
        ? trimmedValue.split(/\s+/).length
        : 0;

      if (words < 10) {
        setError(
          'Please enter at least 10 words so we can examine the claim.'
        );
        return;
      }
    }

    if (mode === 'url') {
      if (
        !/^https?:\/\/[^\s]+\.[^\s]+$/i.test(
          trimmedValue
        )
      ) {
        setError(
          'Please enter a valid-looking article URL, including http:// or https://.'
        );
        return;
      }
    }

    if (!trimmedValue) {
      setError('Please enter something to verify.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await onVerify(
        trimmedValue,
        mode === 'url' ? 'url' : 'text'
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong while verifying.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCheckLink = async () => {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      setError('Please paste a website link first.');
      return;
    }

    if (
      !/^https?:\/\/[^\s]+$/i.test(
        trimmedValue
      )
    ) {
      setError(
        'Please enter a complete link starting with http:// or https://.'
      );
      return;
    }

    setError('');
    setLinkLoading(true);

    try {
      await onCheckLink(trimmedValue);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong while checking the link.'
      );
    } finally {
      setLinkLoading(false);
    }
  };

  return (
    <section className="home-hero newspaper-hero">

      {/* Lovable newspaper collage */}
      <img
        className="hero-collage"
        src={homepageImage}
        alt=""
        aria-hidden="true"
      />

      {/* Main verification sheet */}
      <div className="hero-paper">

        <div className="hero-tape hero-tape-top" />

        <div className="hero-brand">
          <div className="hero-brand-kicker">
            THE VERIFICATION DESK
          </div>

          <h1>
            News<span>Vera</span>
          </h1>

          <p>
            Verify the story. See the evidence.
          </p>
        </div>

        <div className="hero-black-strip">
          AI-powered news verification for a more informed world.
        </div>

        {/* Verification interface */}
        <div className="hero-verification">

          <div className="hero-mode-tabs">

            <button
              className={
                mode === 'text' ? 'active' : ''
              }
              onClick={() => switchMode('text')}
              type="button"
            >
              <FileText size={17} />
              Text
            </button>

            <button
              className={
                mode === 'url' ? 'active' : ''
              }
              onClick={() => switchMode('url')}
              type="button"
            >
              <Globe2 size={17} />
              URL
            </button>

            <button
              className={
                mode === 'image' ? 'active' : ''
              }
              onClick={() => switchMode('image')}
              type="button"
            >
              <ImageIcon size={17} />
              Image
            </button>

          </div>

          <div className="hero-input-wrap">

            <textarea
              value={value}
              onChange={(event) => {
                setValue(event.target.value);
                setError('');
              }}
              placeholder={modePlaceholder[mode]}
              maxLength={2000}
            />

            <span>
              {value.length}/2000
            </span>

          </div>

          {error && (
            <p className="form-error">
              <CircleAlert size={16} />
              {error}
            </p>
          )}

          <button
            className="hero-analyze"
            disabled={
              loading || linkLoading
            }
            onClick={handleVerify}
            type="button"
          >
            <Search size={21} />

            {loading
              ? 'Analyzing...'
              : 'Analyze & Verify'}

            {!loading && (
              <ArrowRight size={19} />
            )}
          </button>

          <p className="hero-verification-note">
            Get a truth score, detailed analysis,
            and trusted sources in seconds.
          </p>

          {/* Link safety shortcut */}
          <div className="hero-link-check">

            <div className="hero-link-check-copy">
              <ShieldCheck size={17} />

              <span>
                Not sure whether you should open a link?
              </span>
            </div>

            <button
              type="button"
              onClick={handleCheckLink}
              disabled={
                loading || linkLoading
              }
            >
              {linkLoading
                ? 'Checking...'
                : 'Check this link'}

              {!linkLoading && (
                <ArrowRight size={14} />
              )}
            </button>

          </div>

        </div>

      </div>

      {/* Editorial callout */}
      <button
        className="hero-explore-note"
        onClick={onExplore}
        type="button"
      >
        Read.
        <br />
        Verify.
        <br />
        Think.
      </button>

    </section>
  );
}