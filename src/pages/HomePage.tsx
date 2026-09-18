import { useMemo } from 'react';

import { dailyNews } from '@/data/dailyNews';

import Hero from '@/components/home/Hero';
import FeatureStrip from '@/components/home/FeatureStrip';
import CTA from '@/components/home/CTA';
import NewsCard from '@/components/news/NewsCard';
import SectionEyebrow from '@/components/layout/SectionEyebrow';

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
  const featuredStories = useMemo(
    () => dailyNews.slice(0, 4),
    []
  );

  return (
    <main>
      <Hero
        onVerify={onVerify}
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

      <CTA onClick={onVerify} />
    </main>
  );
}