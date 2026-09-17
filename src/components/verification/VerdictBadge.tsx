interface VerdictBadgeProps {
  verdict: string;
}

export default function VerdictBadge({
  verdict,
}: VerdictBadgeProps) {
  return (
    <span className="verdict-badge">
      {verdict}
    </span>
  );
}