interface LogoProps {
  onClick?: () => void;
}

export default function Logo({ onClick }: LogoProps) {
  return (
    <button
      className="logo"
      onClick={onClick}
      aria-label="NewsVera home"
    >
      <span>News</span>
      <b>Vera</b>
      <small>Verify the story. See the evidence.</small>
    </button>
  );
}