import type { CSSProperties } from 'react';

interface TruthScoreProps {
  score: number;
}

export default function TruthScore({
  score,
}: TruthScoreProps) {
  const rotation = Math.max(0, Math.min(100, score)) * 3.6;

  return (
    <div className="score-wrap">
      <div
        className="score-ring"
        style={
          {
            '--score': `${rotation}deg`,
          } as CSSProperties
        }
      >
        <div>
          <strong>{score}</strong>
          <span>/ 100</span>
        </div>
      </div>

      <p>TRUTH SCORE</p>
    </div>
  );
}