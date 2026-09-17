import { CircleAlert } from 'lucide-react';

import SectionEyebrow from '@/components/layout/SectionEyebrow';

const steps = [
  {
    number: '01',
    title: 'Submit',
    detail: 'Bring us a claim, a link, or a screenshot.',
  },
  {
    number: '02',
    title: 'Extract',
    detail: 'We identify the key claims and the details that matter.',
  },
  {
    number: '03',
    title: 'Verify',
    detail: 'Evidence is compared across trusted, independent sources.',
  },
  {
    number: '04',
    title: 'Explain',
    detail: 'You get a clear score, verdict, and source trail.',
  },
];

const scoreRanges = [
  {
    range: '0–39',
    label: 'Fake / Misleading',
    className: 'fake',
  },
  {
    range: '40–64',
    label: 'Unverified',
    className: 'unverified',
  },
  {
    range: '65–84',
    label: 'Partially Accurate',
    className: 'partial',
  },
  {
    range: '85–100',
    label: 'Trustworthy',
    className: 'true',
  },
];

export default function AboutPage() {
  return (
    <main className="simple-page about-page">
      <div className="about-intro">
        <SectionEyebrow>
          THE NEWSVERA NOTEBOOK
        </SectionEyebrow>

        <h1>
          Truth is a process,
          <br />
          <em>not a punchline.</em>
        </h1>

        <p>
          NewsVera is an AI-assisted reading companion
          for a noisy news cycle. We make the path from
          a headline to the evidence easier to follow.
        </p>
      </div>

      <div className="about-grid">
        <section>
          <h2>What is NewsVera?</h2>

          <p>
            NewsVera helps you slow down, question a claim,
            and see what supports it. The goal isn't to tell
            you what to think. It's to make the evidence
            visible so you can decide for yourself.
          </p>

          <div className="red-quote">
            “The truth is rarely hidden. It is usually just
            surrounded by noise.”
          </div>
        </section>

        <section className="how-card paper-panel">
          <SectionEyebrow>
            A CLEARER WAY TO READ
          </SectionEyebrow>

          <h2>How it works</h2>

          {steps.map((step) => (
            <div
              className="step"
              key={step.number}
            >
              <span>{step.number}</span>

              <div>
                <h3>{step.title}</h3>
                <p>{step.detail}</p>
              </div>
            </div>
          ))}
        </section>
      </div>

      <section className="score-explainer">
        <SectionEyebrow>
          A SCORE, NOT A SENTENCE
        </SectionEyebrow>

        <h2>How the truth score works</h2>

        <p>
          The score is a quick way to communicate the
          weight of the available evidence. It considers
          source agreement, primary records, language,
          and what remains unknown. A score is a starting
          point for deeper reading, never the final word.
        </p>

        <div className="score-scale">
          {scoreRanges.map((item) => (
            <span key={item.range}>
              <i className={item.className} />

              {item.range}
              <br />

              <b>{item.label}</b>
            </span>
          ))}
        </div>
      </section>

      <div className="disclaimer">
        <CircleAlert size={20} />

        <p>
          NewsVera is an AI-assisted verification tool.
          It does not replace professional fact-checkers,
          journalists, or primary sources. Always review
          the evidence and cited sources.
        </p>
      </div>
    </main>
  );
}