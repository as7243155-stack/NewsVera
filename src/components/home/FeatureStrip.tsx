import {
  BarChart3,
  FileText,
  Search,
  ShieldCheck,
} from 'lucide-react';

const features = [
  {
    icon: ShieldCheck,
    title: 'AI-powered analysis',
    detail: 'Advanced AI to detect misinformation',
  },
  {
    icon: FileText,
    title: 'Multi-modal inputs',
    detail: 'Text, links, or images',
  },
  {
    icon: Search,
    title: 'Trusted sources',
    detail: 'Evidence from reliable news outlets',
  },
  {
    icon: BarChart3,
    title: 'Clear truth score',
    detail: 'Understand the full picture',
  },
];

export default function FeatureStrip() {
  return (
    <section className="feature-strip">
      {features.map((feature) => {
        const Icon = feature.icon;

        return (
          <div className="feature" key={feature.title}>
            <Icon
              size={29}
              strokeWidth={1.5}
            />

            <strong>{feature.title}</strong>

            <p>{feature.detail}</p>
          </div>
        );
      })}
    </section>
  );
}