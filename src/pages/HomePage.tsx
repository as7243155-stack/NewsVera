import { useMemo, useState } from 'react';

import { dailyNews } from '@/data/dailyNews';

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

export default function HomePage({
  onVerify,
  onCheckLink,
  onExplore,
}: HomePageProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const featuredStories = useMemo(
    () => dailyNews.slice(0, 4),
    []
  );

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

              <button
                className="text-button"
                onClick={onExplore}
                type="button"
              >
                View all stories
              </button>
            </div>

            <div className="news-grid home-news">
              {featuredStories.map((story) => (
                <NewsCard
                  key={story.id}
                  story={story}
                />
              ))}
            </div>
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