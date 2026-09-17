import {
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';

import SectionEyebrow from '../layout/SectionEyebrow';

interface HeroProps {
  onVerify: () => void;
  onExplore: () => void;
}

export default function Hero({
  onVerify,
  onExplore,
}: HeroProps) {
  return (
    <section className="home-hero paper-noise">
      <div className="hero-scrap scrap-one">
        REAL
        <br />
        <span>FACTS</span>
        <br />
        REAL
        <br />
        <span>IMPACT</span>
      </div>

      <div className="hero-scrap scrap-two">
        Same story.
        <br />
        Different headlines.
        <br />
        <b>Different truth?</b>
      </div>

      <div className="hero-photo camera-mark">
        <div className="camera-lens" />
        <div className="camera-body" />
      </div>

      <div className="hero-copy">
        <SectionEyebrow>
          AI-POWERED FACT VERIFICATION
        </SectionEyebrow>

        <h1>
          Question the story.
          <br />
          <em>Check the evidence.</em>
        </h1>

        <p className="hero-subtitle">
          NewsVera helps you investigate news claims using
          AI-powered analysis and trusted sources.
        </p>

        <div className="hero-buttons">
          <button
            className="dark-button"
            onClick={onVerify}
          >
            Verify a Story
            <ArrowRight size={17} />
          </button>

          <button
            className="outline-button"
            onClick={onExplore}
          >
            Explore Today's News
            <ArrowUpRight size={16} />
          </button>
        </div>

        <div className="hero-note">
          <ShieldCheck size={15} />
          Built for curious minds and careful readers.
        </div>
      </div>

      <div className="hero-sticker">
        FACTS
        <br />
        <span>OVER</span>
        <br />
        RUMORS
      </div>

      <div className="hero-arrow">↘</div>
    </section>
  );
}