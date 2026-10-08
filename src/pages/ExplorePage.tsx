import { useEffect, useMemo, useState } from 'react';
import { Newspaper } from 'lucide-react';

import { dailyNews, type NewsStory } from '@/data/dailyNews';

import NewsCard from '@/components/news/NewsCard';
import SectionEyebrow from '@/components/layout/SectionEyebrow';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function ExplorePage() {
  const [stories, setStories] = useState<NewsStory[]>(dailyNews);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiveNews, setIsLiveNews] = useState(false);

  const formattedDate = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
      .format(new Date())
      .toUpperCase();
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadNews = async () => {
      try {
        setIsLoading(true);

        const response = await fetch(`${API_BASE_URL}/news`);

        if (!response.ok) {
          throw new Error(`News request failed: ${response.status}`);
        }

        const data = await response.json();

        if (
          !data.success ||
          !Array.isArray(data.stories) ||
          data.stories.length === 0
        ) {
          throw new Error('No live news stories returned.');
        }

        if (isMounted) {
          setStories(data.stories);
          setIsLiveNews(true);
        }
      } catch (error) {
        console.warn(
          'Live news unavailable. Using fallback stories.',
          error
        );

        if (isMounted) {
          setStories(dailyNews);
          setIsLiveNews(false);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadNews();

    return () => {
      isMounted = false;
    };
  }, []);

  const realStories = useMemo(
    () => stories.filter((story) => story.tone === 'real'),
    [stories]
  );

  const misleadingStories = useMemo(
    () => stories.filter((story) => story.tone === 'false'),
    [stories]
  );

  return (
    <main className="simple-page explore-page">
      <div className="page-intro explore-intro">
        <SectionEyebrow>
          {isLiveNews && !isLoading
            ? `LIVE NEWSROOM FEED · ${formattedDate}`
            : `THE DAILY BRIEF · ${formattedDate}`}
          {isLiveNews && !isLoading && (
            <span
              className="live-news-indicator"
              style={{ marginLeft: '12px' }}
            >
              <span className="live-news-dot" />
              LIVE
            </span>
          )}
        </SectionEyebrow>

        <h1>
          Today's <em>Top Stories</em>
        </h1>

        <p>
          Read widely. Check carefully. Know what holds up.
        </p>
      </div>

      {isLoading ? (
        <div
          className="loading-panel paper-panel"
          style={{ maxWidth: '640px', margin: '40px auto' }}
        >
          <div className="loader-ring">
            <Newspaper size={31} />
          </div>

          <SectionEyebrow>
            NEWSROOM DISPATCH
          </SectionEyebrow>

          <h3>
            Gathering today's top stories
            <span className="blink">_</span>
          </h3>

          <p>
            Fetching verified reports and debunked claims from live feeds...
          </p>
        </div>
      ) : (
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
                  key={`${story.id}-${story.title}`}
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
                  key={`${story.id}-${story.title}`}
                />
              ))}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}