import { ArrowUpRight } from 'lucide-react';

interface SourceCardProps {
  name: string;
  title: string;
  type: string;
  description: string;
  url?: string;
}

export default function SourceCard({
  name,
  title,
  type,
  description,
  url,
}: SourceCardProps) {
  const content = (
    <>
      <div className="source-top">
        <span className="source-mark">
          {name.slice(0, 2).toUpperCase()}
        </span>

        <span>{name}</span>

        <ArrowUpRight size={16} />
      </div>

      <h4>{title}</h4>

      <p>{description}</p>

      <small>{type}</small>
    </>
  );

  if (!url) {
    return (
      <div className="source-card">
        {content}
      </div>
    );
  }

  return (
    <a
      className="source-card"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
    >
      {content}
    </a>
  );
}