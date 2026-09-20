import { useEffect, useState } from 'react';

import {
  dailyNews,
  type NewsStory,
} from '@/data/dailyNews';

import Hero from '@/components/home/Hero';
import FeatureStrip from '@/components/home/FeatureStrip';
import CTA from '@/components/home/CTA';
import NewsCard from '@/components/news/NewsCard';
import SectionEyebrow from '@/components/layout/SectionEyebrow';
import LoadingAnalysis from '@/components/verification/LoadingAnalysis';

interface HomePageProps {
  onVerify: (
    content: string,
    mode: 'text' | 'url'
  ) => Promise<void>;
  onCheckLink: (url: string) => Promise<void>;
  onExplore: () => void;
}

const API_BASE_URL = 'http://127.0.0.1:8000';

export default function HomePage({
  onVerify,
  onCheckLink,
  onExplore,
}: HomePageProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [featuredStories, setFeaturedStories] =
    useState<NewsStory[]>(
      dailyNews.slice(0, 4)
    );

  const [isNewsLoading, setIsNewsLoading] =
    useState(true);

  const [isLiveNews, setIsLiveNews] =
    useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadNews = async () => {
      try {
        setIsNewsLoading(true);

        const response = await fetch(
          `${API_BASE_URL}/news`
        );

        if (!response.ok) {
          throw new Error(
            `News request failed: ${response.status}`
          );
        }

        const data = await response.json();

        if (
          !data.success ||
          !Array.isArray(data.stories) ||
          data.stories.length === 0
        ) {
          throw new Error(
            'No live news stories returned.'
          );
        }

        if (isMounted) {
          setFeaturedStories(
            data.stories.slice(0, 4)
          );

          setIsLiveNews(true);
        }
      } catch (error) {
        console.warn(
          'Live news unavailable. Using fallback stories.',
          error
        );

        if (isMounted) {
          setFeaturedStories(
            dailyNews.slice(0, 4)
          );

          setIsLiveNews(false);
        }
      } finally {
        if (isMounted) {
          setIsNewsLoading(false);
        }
      }
    };

    loadNews();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleVerify = async (
    content: string,
    mode: 'text' | 'url'
  ) => {
    setIsAnalyzing(true);

    try {
      await onVerify(content, mode);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <main>
      {isAnalyzing ? (
        <section className="home-analysis-state">
          <LoadingAnalysis />
        </section>
      ) : (
        <>
          <Hero
            onVerify={handleVerify}
            onCheckLink={onCheckLink}
            onExplore={onExplore}
          />

          <FeatureStrip />

          <section className="today-section">
            <div className="section-heading">
              <div>
                <SectionEyebrow>
                  THE DAILY BRIEF
                </SectionEyebrow>

                <h2>
                  Today's <span>Top Stories</span>
                </h2>

                <p>
                  Real news that matters. And myths that don't.
                </p>
              </div>

              <div className="today-heading-actions">
                {isLiveNews && !isNewsLoading && (
                  <span className="live-news-indicator">
                    <span className="live-news-dot" />
                    LIVE
                  </span>
                )}

                <button
                  className="text-button"
                  onClick={onExplore}
                  type="button"
                >
                  View all stories
                </button>
              </div>
            </div>

            {isNewsLoading ? (
              <div className="news-grid home-news">
                {dailyNews.slice(0, 4).map((story) => (
                  <NewsCard
                    key={story.id}
                    story={story}
                  />
                ))}
              </div>
            ) : (
              <div className="news-grid home-news">
                {featuredStories.map((story) => (
                  <NewsCard
                    key={`${story.id}-${story.title}`}
                    story={story}
                  />
                ))}
              </div>
            )}
          </section>

          <CTA
            onClick={(content) =>
              handleVerify(content, 'text')
            }
          />
        </>
      )}
    </main>
  );
}