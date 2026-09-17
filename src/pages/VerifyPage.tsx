import { Sparkles } from 'lucide-react';

import SectionEyebrow from '@/components/layout/SectionEyebrow';
import VerificationWorkspace, {
  type VerificationResult,
} from '@/components/verification/VerificationWorkspace';

interface VerifyPageProps {
  onResult: (result: VerificationResult) => void;
}

export default function VerifyPage({
  onResult,
}: VerifyPageProps) {
  return (
    <main className="simple-page verify-page">
      <div className="page-intro">
        <SectionEyebrow>
          START YOUR INVESTIGATION
        </SectionEyebrow>

        <h1>
          Verify a <em>Story</em>
        </h1>

        <p>
          Give us the story. We'll help you examine
          the evidence.
        </p>
      </div>

      <VerificationWorkspace
        onResult={onResult}
      />

      <div className="mock-label">
        <Sparkles size={14} />
        MOCK EXPERIENCE · No external services
        connected yet
      </div>
    </main>
  );
}