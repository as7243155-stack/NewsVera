import type { NewsStory } from '@/data/dailyNews';

interface NewsCardProps {
  story: NewsStory;
}

export default function NewsCard({ story }: NewsCardProps) {
  const isReal = story.tone === 'real';

  return (
    <article className={`news-card ${story.tone}`}>
      <div className="news-image">
        <span>
          {isReal ? 'THE DAILY RECORD' : 'CHECK THE HEADLINE'}
        </span>

        <div className="image-lines" />
      </div>

      <div className="news-card-body">
        <div className="card-meta">
          <span
            className={
              isReal ? 'status-real' : 'status-false'
            }
          >
            {story.status}
          </span>

          <span>{story.category}</span>
        </div>

        <h3>{story.title}</h3>

        <p>{story.summary}</p>

        <div className="card-footer">
          <span>
            {story.source} · {story.date}
          </span>

          <b>
            {story.score}
            <small>/100</small>
          </b>
        </div>
      </div>
    </article>
  );
}