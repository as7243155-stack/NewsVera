import type { ReactNode } from 'react';

interface SectionEyebrowProps {
  children: ReactNode;
}

export default function SectionEyebrow({ children }: SectionEyebrowProps) {
  return (
    <p className="eyebrow">
      <span />
      {children}
    </p>
  );
}