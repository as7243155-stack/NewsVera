import {
  useRef,
  useState,
} from 'react';

import {
  ArrowRight,
  CircleAlert,
  CircleCheck,
  FileText,
  Globe2,
  Image as ImageIcon,
  Upload,
} from 'lucide-react';

import LoadingAnalysis from './LoadingAnalysis';

type InputMode = 'text' | 'url' | 'image';

function getSourceName(url: string): string {
  try {
    const hostname = new URL(url).hostname
      .replace(/^www\./, '');

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

export interface VerificationResult {
  score: number;
  verdict: string;
  input: string;
  analysis: string[];
  sources: {
    name: string;
    title: string;
    type: string;
    description: string;
    url?: string;
  }[];
}

interface VerificationWorkspaceProps {
  onResult: (result: VerificationResult) => void;
}

const inputModes: InputMode[] = [
  'text',
  'url',
  'image',
];

export default function VerificationWorkspace({
  onResult,
}: VerificationWorkspaceProps) {
  const [mode, setMode] =
    useState<InputMode>('text');

  const [value, setValue] = useState('');

  const [file, setFile] =
    useState<File | null>(null);

  const [error, setError] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const fileInput =
    useRef<HTMLInputElement>(null);

  const wordCount = value.trim()
    ? value.trim().split(/\s+/).length
    : 0;

  const submit = async () => {
  setError('');

  if (
    mode === 'text' &&
    wordCount < 10
  ) {
    setError(
      'Please enter at least 10 words so we can examine the claim.'
    );
    return;
  }

  if (
    mode === 'url' &&
    !/^https?:\/\/[^\s]+\.[^\s]+$/i.test(value)
  ) {
    setError(
      'Please enter a valid-looking article URL, including https://.'
    );
    return;
  }

  if (
    mode === 'image' &&
    !file
  ) {
    setError(
      'Please upload an image or screenshot to continue.'
    );
    return;
  }

  // Image OCR will be connected in the next step.
  if (mode === 'image') {
    setError(
      'Image verification is coming next. Please use text or URL for now.'
    );
    return;
  }

  setLoading(true);

  try {
    const response = await fetch(
      'http://127.0.0.1:8000/verify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode,
          content: value.trim(),
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

    onResult({
      score: data.verification.score,
      verdict: data.verification.verdict,
      input: data.input,
      analysis: data.verification.analysis,
      sources,
    });
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : 'Something went wrong while verifying the claim.'
    );
  } finally {
    setLoading(false);
  }
};

  const chooseFile = (
    selected: File | undefined
  ) => {
    if (
      selected?.type.startsWith('image/')
    ) {
      setFile(selected);
      setError('');
      return;
    }

    if (selected) {
      setError(
        'Please choose a JPG, PNG, WEBP, or GIF image.'
      );
    }
  };

  if (loading) {
    return <LoadingAnalysis />;
  }

  return (
    <div className="verify-panel paper-panel">
      <div
        className="mode-tabs"
        role="tablist"
      >
        {inputModes.map((item) => (
          <button
            key={item}
            role="tab"
            aria-selected={
              mode === item
            }
            className={
              mode === item
                ? 'selected'
                : ''
            }
            onClick={() => {
              setMode(item);
              setError('');
            }}
          >
            {item === 'text' ? (
              <FileText size={17} />
            ) : item === 'url' ? (
              <Globe2 size={17} />
            ) : (
              <ImageIcon size={17} />
            )}

            {item.toUpperCase()}
          </button>
        ))}
      </div>

      {mode === 'text' && (
        <div className="field-wrap">
          <label htmlFor="claim">
            Your claim or article text
          </label>

          <textarea
            id="claim"
            value={value}
            onChange={(event) =>
              setValue(event.target.value)
            }
            placeholder="Paste a news claim or article text here..."
            maxLength={2000}
          />

          <span className="field-meta">
            {wordCount} words ·{' '}
            {value.length}/2000
          </span>
        </div>
      )}

      {mode === 'url' && (
        <div className="field-wrap">
          <label htmlFor="url">
            Article URL
          </label>

          <div className="input-with-icon">
            <Globe2 size={18} />

            <input
              id="url"
              value={value}
              onChange={(event) =>
                setValue(event.target.value)
              }
              placeholder="Paste a news article URL..."
            />
          </div>

          <span className="field-meta">
            We only use this to understand the
            story you want to examine.
          </span>
        </div>
      )}

      {mode === 'image' && (
        <div className="field-wrap">
          <label>
            Screenshot or image
          </label>

          <button
            className="upload-zone"
            onClick={() =>
              fileInput.current?.click()
            }
            onDragOver={(event) =>
              event.preventDefault()
            }
            onDrop={(event) => {
              event.preventDefault();

              chooseFile(
                event.dataTransfer.files[0]
              );
            }}
          >
            <input
              ref={fileInput}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={(event) =>
                chooseFile(
                  event.target.files?.[0]
                )
              }
              hidden
            />

            {file ? (
              <>
                <CircleCheck size={30} />

                <strong>
                  {file.name}
                </strong>

                <span>
                  Ready to analyze · Click
                  to replace
                </span>
              </>
            ) : (
              <>
                <Upload size={29} />

                <strong>
                  Drop a screenshot here or
                  click to upload
                </strong>

                <span>
                  JPG, PNG, WEBP, or GIF ·
                  Max 10MB
                </span>
              </>
            )}
          </button>
        </div>
      )}

      {error && (
        <p className="form-error">
          <CircleAlert size={16} />
          {error}
        </p>
      )}

      <button
        className="dark-button verify-submit"
        onClick={submit}
      >
        Analyze & Verify
        <ArrowRight size={18} />
      </button>

      <p className="privacy-note">
        NewsVera provides AI-assisted analysis
        and source-based evidence. Always review
        the cited sources before making important
        decisions.
      </p>
    </div>
  );
}