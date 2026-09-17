import type { ReactNode } from 'react';

interface TapeProps {
  children: ReactNode;
  className?: string;
}

export default function Tape({
  children,
  className = '',
}: TapeProps) {
  return (
    <div className={`tape ${className}`}>
      {children}
    </div>
  );
}