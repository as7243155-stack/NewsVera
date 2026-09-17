export type NewsStory = {
  id: number;
  title: string;
  summary: string;
  category: string;
  date: string;
  source: string;
  status: 'Verified' | 'Debunked' | 'Misleading';
  score: number;
  tone: 'real' | 'false';
};

export const dailyNews: NewsStory[] = [
  {
    id: 1,
    title: 'India launches new climate initiative at global summit',
    summary: 'A new public-private partnership aims to accelerate renewable energy across the region.',
    category: 'Climate', date: 'Sep 17, 2026', source: 'Reuters', status: 'Verified', score: 94, tone: 'real',
  },
  {
    id: 2,
    title: 'No, this viral image is not from the recent earthquake',
    summary: 'The widely shared photograph is several years old and comes from a different location.',
    category: 'Fact Check', date: 'Sep 16, 2026', source: 'AFP Fact Check', status: 'Debunked', score: 12, tone: 'false',
  },
  {
    id: 3,
    title: 'Researchers find promising path toward cleaner batteries',
    summary: 'Scientists have published early findings that could make energy storage more efficient.',
    category: 'Science', date: 'Sep 16, 2026', source: 'BBC News', status: 'Verified', score: 88, tone: 'real',
  },
  {
    id: 4,
    title: 'The headline that got the election numbers wrong',
    summary: 'A misleading graphic used preliminary figures to make a claim the final data does not support.',
    category: 'Politics', date: 'Sep 15, 2026', source: 'Associated Press', status: 'Misleading', score: 38, tone: 'false',
  },
  {
    id: 5,
    title: 'Cities rethink cooling plans as summer records fall',
    summary: 'Local governments are expanding shade, water access and public cooling spaces.',
    category: 'World', date: 'Sep 14, 2026', source: 'The Guardian', status: 'Verified', score: 91, tone: 'real',
  },
  {
    id: 6,
    title: 'What the new transport study actually says',
    summary: 'The report supports a smaller, more nuanced finding than the viral posts suggest.',
    category: 'Analysis', date: 'Sep 13, 2026', source: 'Reuters', status: 'Misleading', score: 52, tone: 'false',
  },
];

export const mockReports = [
  { id: 1, claim: 'The city has banned all single-use packaging.', score: 78, verdict: 'Partially Accurate', date: 'Sep 17, 2026', sources: 4 },
  { id: 2, claim: 'A photo shows the first snowfall of the season.', score: 23, verdict: 'Fake / Misleading', date: 'Sep 12, 2026', sources: 3 },
  { id: 3, claim: 'The new public library opens next month.', score: 96, verdict: 'Trustworthy', date: 'Sep 08, 2026', sources: 5 },
];
