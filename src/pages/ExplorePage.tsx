import { useMemo } from 'react';

import { dailyNews } from '@/data/dailyNews';

import NewsCard from '@/components/news/NewsCard';
import SectionEyebrow from '@/components/layout/SectionEyebrow';

export default function ExplorePage() {
  const realStories = useMemo(
    () => dailyNews.filter((story) => story.tone === 'real'),
    []
  );

  const misleadingStories = useMemo(
    () => dailyNews.filter((story) => story.tone === 'false'),
    []
  );

  return (
    <main className="simple-page explore-page">
      <div className="page-intro explore-intro">
        <SectionEyebrow>
          THE DAILY BRIEF · SEP 17, 2026
        </SectionEyebrow>

        <h1>
          Today's <em>Top Stories</em>
        </h1>

        <p>
          Read widely. Check carefully. Know what holds up.
        </p>
      </div>

      <div className="explore-columns">
        <section>
          <div className="column-title">
            <h2>Top Real News</h2>
            <span>{realStories.length.toString().padStart(2, '0')} stories</span>
          </div>

          <div className="news-list">
            {realStories.map((story) => (
              <NewsCard
                story={story}
                key={story.id}
              />
            ))}
          </div>
        </section>

        <section>
          <div className="column-title false-title">
            <h2>Top Debunked / Misleading</h2>
            <span>
              {misleadingStories.length.toString().padStart(2, '0')} stories
            </span>
          </div>

          <div className="news-list">
            {misleadingStories.map((story) => (
              <NewsCard
                story={story}
                key={story.id}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}