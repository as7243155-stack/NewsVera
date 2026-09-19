import { useRef, useState } from 'react';

import {
  ArrowRight,
  CircleAlert,
  FileText,
  Globe2,
  Image as ImageIcon,
  Search,
  ShieldCheck,
  Upload,
  X,
} from 'lucide-react';

import { createWorker } from 'tesseract.js';

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
  const [mode, setMode] =
    useState<InputMode>('text');

  const [value, setValue] = useState('');

  const [loading, setLoading] =
    useState(false);

  const [linkLoading, setLinkLoading] =
    useState(false);

  const [ocrLoading, setOcrLoading] =
    useState(false);

  const [ocrProgress, setOcrProgress] =
    useState(0);

  const [preview, setPreview] =
    useState<string | null>(null);

  const [error, setError] =
    useState('');

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const modePlaceholder = {
    text: 'Paste a news claim here...',
    url: 'Paste an article URL here...',
    image: 'Upload a screenshot of a news story...',
  };

  const switchMode = (
    nextMode: InputMode
  ) => {
    setMode(nextMode);
    setValue('');
    setError('');
    setPreview(null);
    setOcrProgress(0);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const extractTextFromImage = async (
    file: File
  ) => {
    if (!file.type.startsWith('image/')) {
      setError(
        'Please upload a valid image file.'
      );
      return;
    }

    const allowedTypes = [
      'image/png',
      'image/jpeg',
      'image/webp',
      'image/gif',
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        'Please upload a PNG, JPEG, WEBP, or GIF image.'
      );
      return;
    }

    const maxSize =
      10 * 1024 * 1024;

    if (file.size > maxSize) {
      setError(
        'Image size must be 10 MB or smaller.'
      );
      return;
    }

    setError('');
    setOcrLoading(true);
    setOcrProgress(0);
    setValue('');

    const imageUrl =
      URL.createObjectURL(file);

    setPreview(imageUrl);

    let worker:
      | Awaited<ReturnType<typeof createWorker>>
      | null = null;

    try {
      worker = await createWorker(
        'eng',
        1,
        {
          logger: (message) => {
            if (
              message.status ===
                'recognizing text' &&
              typeof message.progress ===
                'number'
            ) {
              setOcrProgress(
                Math.round(
                  message.progress * 100
                )
              );
            }
          },
        }
      );

      const result =
        await worker.recognize(
          imageUrl
        );

      const extractedText =
        result.data.text.trim();

      const wordCount =
        extractedText
          ? extractedText.split(/\s+/).length
          : 0;

      if (wordCount < 5) {
        setValue(extractedText);

        setError(
          'We could not extract enough readable text from this image. Please upload a clearer screenshot containing at least 5 words.'
        );

        return;
      }

      setValue(extractedText);
      setOcrProgress(100);
    } catch (err) {
      console.error(
        'OCR failed:',
        err
      );

      setError(
        'We could not read the text from this image. Please try a clearer screenshot.'
      );
    } finally {
      if (worker) {
        await worker.terminate();
      }

      setOcrLoading(false);
    }
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (file) {
      void extractTextFromImage(file);
    }
  };

  const handleImageDrop = (
    event: React.DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();

    const file =
      event.dataTransfer.files?.[0];

    if (file) {
      void extractTextFromImage(file);
    }
  };

  const handleVerify = async () => {
    const trimmedValue =
      value.trim();

    if (mode === 'image') {
      const words = trimmedValue
        ? trimmedValue.split(/\s+/).length
        : 0;

      if (ocrLoading) {
        setError(
          'Please wait for the image text extraction to finish.'
        );
        return;
      }

      if (words < 5) {
        setError(
          'We need at least 5 readable words from the image before we can verify it.'
        );
        return;
      }
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
      setError(
        'Please enter something to verify.'
      );
      return;
    }

    setError('');
    setLoading(true);

    try {
      await onVerify(
        trimmedValue,
        'text'
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
    const trimmedValue =
      value.trim();

    if (!trimmedValue) {
      setError(
        'Please paste a website link first.'
      );
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
      await onCheckLink(
        trimmedValue
      );
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

  const removeImage = () => {
    setPreview(null);
    setValue('');
    setError('');
    setOcrProgress(0);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
                mode === 'text'
                  ? 'active'
                  : ''
              }
              onClick={() =>
                switchMode('text')
              }
              type="button"
            >
              <FileText size={17} />
              Text
            </button>

            <button
              className={
                mode === 'url'
                  ? 'active'
                  : ''
              }
              onClick={() =>
                switchMode('url')
              }
              type="button"
            >
              <Globe2 size={17} />
              URL
            </button>

            <button
              className={
                mode === 'image'
                  ? 'active'
                  : ''
              }
              onClick={() =>
                switchMode('image')
              }
              type="button"
            >
              <ImageIcon size={17} />
              Image
            </button>

          </div>

          {mode === 'image' ? (
            <div className="hero-image-input">

              {!preview ? (
                <div
                  className="hero-upload-zone"
                  onDragOver={(event) =>
                    event.preventDefault()
                  }
                  onDrop={
                    handleImageDrop
                  }
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={
                      handleFileChange
                    }
                    hidden
                  />

                  <div className="hero-upload-icon">
                    <Upload size={23} />
                  </div>

                  <strong>
                    Upload a news screenshot
                  </strong>

                  <span>
                    Drag & drop an image here
                    or click to browse
                  </span>

                  <small>
                    PNG, JPEG, WEBP or GIF ·
                    Max 10 MB
                  </small>
                </div>
              ) : (
                <div className="hero-image-preview">

                  <img
                    src={preview}
                    alt="Uploaded news screenshot"
                  />

                  <button
                    type="button"
                    className="hero-remove-image"
                    onClick={
                      removeImage
                    }
                    aria-label="Remove image"
                  >
                    <X size={17} />
                  </button>

                </div>
              )}

              {ocrLoading && (
                <div className="hero-ocr-status">
                  <div>
                    <span>
                      Reading screenshot...
                    </span>

                    <strong>
                      {ocrProgress}%
                    </strong>
                  </div>

                  <div className="hero-ocr-bar">
                    <span
                      style={{
                        width: `${ocrProgress}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {value && !ocrLoading && (
                <div className="hero-ocr-text">
                  <div className="hero-ocr-heading">
                    <span>
                      EXTRACTED TEXT
                    </span>

                    <strong>
                      {
                        value.trim().split(/\s+/)
                          .length
                      } words
                    </strong>
                  </div>

                  <p>
                    {value}
                  </p>
                </div>
              )}

            </div>
          ) : (
            <div className="hero-input-wrap">

              <textarea
                value={value}
                onChange={(event) => {
                  setValue(
                    event.target.value
                  );
                  setError('');
                }}
                placeholder={
                  modePlaceholder[mode]
                }
                maxLength={2000}
              />

              <span>
                {value.length}/2000
              </span>

            </div>
          )}

          {error && (
            <p className="form-error">
              <CircleAlert size={16} />
              {error}
            </p>
          )}

          <button
            className="hero-analyze"
            disabled={
              loading ||
              linkLoading ||
              ocrLoading
            }
            onClick={
              handleVerify
            }
            type="button"
          >
            <Search size={21} />

            {loading
              ? 'Analyzing...'
              : ocrLoading
                ? 'Reading image...'
                : 'Analyze & Verify'}

            {!loading &&
              !ocrLoading && (
                <ArrowRight
                  size={19}
                />
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
              onClick={
                handleCheckLink
              }
              disabled={
                loading ||
                linkLoading ||
                ocrLoading
              }
            >
              {linkLoading
                ? 'Checking...'
                : 'Check this link'}

              {!linkLoading && (
                <ArrowRight
                  size={14}
                />
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