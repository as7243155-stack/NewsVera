import {
  ArrowLeft,
  ArrowRight,
  CircleAlert,
  Globe2,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';

import SectionEyebrow from '@/components/layout/SectionEyebrow';

interface LinkCheckResult {
  success: boolean;
  url: string;
  domain: string;
  scheme: string;
  https: boolean;
  risk_level: 'low' | 'medium' | 'high';
  assessment: string;
  indicators: string[];
  warnings: string[];
  is_ip_address: boolean;
  is_shortener: boolean;
  suspicious_keywords: string[];
}

interface LinkCheckPageProps {
  result: LinkCheckResult;
  onAnother: () => void;
}

export default function LinkCheckPage({
  result,
  onAnother,
}: LinkCheckPageProps) {
  const riskLabel = {
    low: 'LOW RISK',
    medium: 'CAUTION',
    high: 'HIGH RISK',
  }[result.risk_level];

  const RiskIcon =
    result.risk_level === 'low'
      ? ShieldCheck
      : result.risk_level === 'medium'
        ? CircleAlert
        : ShieldAlert;

  return (
    <main className="simple-page link-check-page">

      <div className="result-kicker">
        <SectionEyebrow>
          NEWSVERA · LINK CHECK
        </SectionEyebrow>
      </div>

      <div className="link-check-header">
        <div>
          <h1>
            Should I <em>open this?</em>
          </h1>

          <p>
            We checked the link for common warning signs
            and suspicious URL characteristics.
          </p>
        </div>

        <div
          className={`link-risk-badge risk-${result.risk_level}`}
        >
          <RiskIcon size={20} />
          <span>{riskLabel}</span>
        </div>
      </div>

      <section className="link-result-paper paper-panel">

        <div className="link-result-top">

          <div className="link-result-icon">
            <Globe2 size={28} />
          </div>

          <div className="link-result-url">
            <span>CHECKED LINK</span>

            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {result.url}
            </a>
          </div>

        </div>

        <div className="link-assessment">
          <span>ASSESSMENT</span>

          <h2>{result.assessment}</h2>

          <p>
            This assessment identifies technical and
            structural warning signs. It is not a guarantee
            that a website is safe or malicious.
          </p>
        </div>

        <div className="link-facts">

          <div className="link-fact">
            <span>DOMAIN</span>
            <strong>{result.domain}</strong>
          </div>

          <div className="link-fact">
            <span>CONNECTION</span>
            <strong>
              {result.https
                ? 'HTTPS'
                : 'HTTP'}
            </strong>
          </div>

          <div className="link-fact">
            <span>ADDRESS TYPE</span>
            <strong>
              {result.is_ip_address
                ? 'IP ADDRESS'
                : 'DOMAIN'}
            </strong>
          </div>

          <div className="link-fact">
            <span>SHORTENER</span>
            <strong>
              {result.is_shortener
                ? 'YES'
                : 'NO'}
            </strong>
          </div>

        </div>

        {result.indicators.length > 0 && (
          <div className="link-evidence">

            <div className="link-evidence-heading">
              <ShieldCheck size={19} />
              <h3>Positive indicators</h3>
            </div>

            <div className="link-evidence-list">
              {result.indicators.map(
                (indicator, index) => (
                  <div
                    className="link-evidence-item positive"
                    key={`indicator-${index}`}
                  >
                    <span>✓</span>
                    <p>{indicator}</p>
                  </div>
                )
              )}
            </div>

          </div>
        )}

        {result.warnings.length > 0 && (
          <div className="link-evidence">

            <div className="link-evidence-heading warning">
              <CircleAlert size={19} />
              <h3>Things to consider</h3>
            </div>

            <div className="link-evidence-list">
              {result.warnings.map(
                (warning, index) => (
                  <div
                    className="link-evidence-item warning"
                    key={`warning-${index}`}
                  >
                    <span>!</span>
                    <p>{warning}</p>
                  </div>
                )
              )}
            </div>

          </div>
        )}

        <div className="link-check-note">
          <CircleAlert size={17} />

          <p>
            <strong>Remember:</strong> A website using
            HTTPS is not automatically trustworthy, and
            an HTTP website is not automatically malicious.
            Check the domain and context before sharing
            sensitive information.
          </p>
        </div>

      </section>

      <div className="link-check-actions">

        <button
          className="text-button"
          onClick={onAnother}
          type="button"
        >
          <ArrowLeft size={16} />
          Check another link
        </button>

        <a
          className="dark-button"
          href={result.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open link
          <ArrowRight size={17} />
        </a>

      </div>

    </main>
  );
}