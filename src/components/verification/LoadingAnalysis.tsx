import { useEffect, useState } from 'react';
import {
  Check,
  Search,
} from 'lucide-react';

import SectionEyebrow from '../layout/SectionEyebrow';

const stages = [
  'Reading the story...',
  'Extracting claims...',
  'Searching trusted sources...',
  'Comparing evidence...',
  'Generating verification...',
];

export default function LoadingAnalysis() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((current) =>
        Math.min(current + 1, stages.length - 1)
      );
    }, 560);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="loading-panel paper-panel">
      <div className="loader-ring">
        <Search size={31} />
      </div>

      <SectionEyebrow>
        INVESTIGATIVE MODE
      </SectionEyebrow>

      <h3>
        Following the evidence
        <span className="blink">_</span>
      </h3>

      <p>
        Give us a moment to read between the lines.
      </p>

      <div className="stage-list">
        {stages.map((stage, index) => (
          <div
            key={stage}
            className={
              index < active
                ? 'done'
                : index === active
                  ? 'current'
                  : ''
            }
          >
            {index < active ? (
              <Check size={15} />
            ) : (
              <span className="stage-dot" />
            )}

            {stage}

            {index === active && (
              <i>working</i>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}