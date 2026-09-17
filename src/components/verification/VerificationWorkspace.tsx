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

  const submit = () => {
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

    setLoading(true);

    let index = 0;

    const interval =
      window.setInterval(() => {
        index += 1;

        if (
          index >= 5
        ) {
          window.clearInterval(interval);

          window.setTimeout(() => {
            setLoading(false);

            onResult({
  score: 78,
  verdict: 'Partially Accurate',
  input:
    mode === 'image'
      ? file?.name || 'Uploaded image'
      : value,
  analysis: [
    'The central claim is supported by multiple independent reports.',
    'One important detail differs between the original claim and available evidence.',
    'The wording appears stronger than what the cited evidence establishes.',
  ],
  sources: [
    {
      name: 'Reuters',
      title: 'Reporting and context around the central claim',
      type: 'International news agency',
      description:
        'A corroborating report with context on the event and timeline.',
    },
    {
      name: 'AP',
      title: 'What the available records show',
      type: 'Independent reporting',
      description:
        'A second account that helps clarify the important detail.',
    },
    {
      name: 'BBC',
      title: 'A closer look at the wider story',
      type: 'Background analysis',
      description:
        'Background reporting that adds perspective without overstating the evidence.',
    },
  ],
});
          }, 360);
        }
      }, 560);
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