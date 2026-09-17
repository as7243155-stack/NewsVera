import { ArrowRight } from 'lucide-react';

import Tape from '../layout/Tape';

interface CTAProps {
  onClick: () => void;
}

export default function CTA({ onClick }: CTAProps) {
  return (
    <section className="bottom-cta">
      <Tape>THE MORE YOU KNOW</Tape>

      <h2>
        Don't just read the headline.
        <br />
        <em>Read the evidence.</em>
      </h2>

      <button
        className="dark-button"
        onClick={onClick}
      >
        Start verifying
        <ArrowRight size={17} />
      </button>
    </section>
  );
}