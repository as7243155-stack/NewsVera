import { useState } from 'react';
import { Check, Save } from 'lucide-react';

import SectionEyebrow from '@/components/layout/SectionEyebrow';
import TruthScore from '@/components/verification/TruthScore';
import VerdictBadge from '@/components/verification/VerdictBadge';
import SourceCard from '@/components/verification/SourceCard';
import { getCurrentUser } from '@/services/auth';
import { saveReport } from '@/services/reports';

import type { VerificationResult } from '@/components/verification/VerificationWorkspace';

interface ResultPageProps {
  result: VerificationResult;
  onAnother: () => void;
}

export default function ResultPage({
  result,
  onAnother,
}: ResultPageProps) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');

    const user = await getCurrentUser();

    if (!user) {
      setSaveError('Please sign in to save this report.');
      setSaving(false);
      return;
    }

    const { error } = await saveReport(user.id, result);

    if (error) {
      setSaveError(error.message);
      setSaving(false);
      return;
    }

    setSaved(true);
    setSaving(false);
  };

  return (
    <main className="simple-page result-page">
      <div className="result-kicker">
        <SectionEyebrow>
          YOUR INVESTIGATION · MOCK RESULT
        </SectionEyebrow>

        <button
          className="text-button"
          onClick={onAnother}
        >
          ← Verify another story
        </button>
      </div>

      <div className="result-header">
        <div>
          <h1>
            Here's what we <em>found.</em>
          </h1>

          <p className="result-claim">
            “{result.input || 'The submitted story'}”
          </p>
        </div>

        <div className="result-score">
          <TruthScore score={result.score} />

          <VerdictBadge
            verdict={result.verdict}
          />
        </div>
      </div>

      <div className="result-grid">
        <section className="analysis-card paper-panel">
          <SectionEyebrow>
            OUR READ
          </SectionEyebrow>

          <h2>AI Analysis</h2>

          <ul>
            {result.analysis.map((item, index) => (
              <li key={index}>
                {item}
              </li>
            ))}
          </ul>

          <div className="confidence-line">
            <span>Confidence</span>

            <div>
              <i style={{ width: `${result.score}%` }} />
            </div>

            <b>
              {result.score >= 75
                ? 'High'
                : result.score >= 50
                  ? 'Medium'
                  : 'Low'}
            </b>
          </div>
        </section>

        <section className="sources-section">
          <SectionEyebrow>
            FOLLOW THE PAPER TRAIL
          </SectionEyebrow>

          <h2>Evidence &amp; Sources</h2>

          <div className="source-list">
            {result.sources.map((source, index) => (
              <SourceCard
                key={index}
                name={source.name}
                title={source.title}
                type={source.type}
                description={source.description}
                url={source.url}
              />
            ))}
          </div>
        </section>
      </div>

      <div className="result-actions">
        <button
          className="dark-button"
          onClick={handleSave}
          disabled={saving || saved}
        >
          {saved ? (
            <>
              <Check size={17} />
              Report Saved
            </>
          ) : (
            <>
              <Save size={17} />
              {saving ? 'Saving...' : 'Save Report'}
            </>
          )}
        </button>

        {saveError && (
          <p className="form-error">
            {saveError}
          </p>
        )}
      </div>

      <p className="result-disclaimer">
        This is a UI demonstration using mock data.
        These sources do not represent a real-time
        verification of your submission.
      </p>
    </main>
  );
}