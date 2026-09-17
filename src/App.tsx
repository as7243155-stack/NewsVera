import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight, ArrowUpRight, BarChart3, Check, ChevronDown, CircleAlert, CircleCheck,
  ClipboardCheck, FileText, Globe2, Image as ImageIcon, Instagram, Linkedin, Menu, Search,
  ShieldCheck, Sparkles, Upload, X, Youtube,
} from 'lucide-react';
import { dailyNews, mockReports, type NewsStory } from '@/data/dailyNews';

type Page = 'home' | 'verify' | 'explore' | 'about' | 'signin' | 'signup' | 'dashboard' | 'result';
type InputMode = 'text' | 'url' | 'image';
type Result = { score: number; verdict: string; input: string };

const stages = ['Reading the story...', 'Extracting claims...', 'Searching trusted sources...', 'Comparing evidence...', 'Generating verification...'];

function getPage(): Page {
  const path = window.location.pathname.replace('/', '') as Page;
  return ['verify', 'explore', 'about', 'signin', 'signup', 'dashboard', 'result'].includes(path) ? path : 'home';
}

function navigate(page: Page) {
  window.history.pushState({}, '', page === 'home' ? '/' : `/${page}`);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

function Logo({ onClick }: { onClick?: () => void }) {
  return <button className="logo" onClick={onClick} aria-label="NewsVera home"><span>News</span><b>Vera</b><small>Verify the story. See the evidence.</small></button>;
}

function Navbar({ page }: { page: Page }) {
  const [open, setOpen] = useState(false);
  const links: { label: string; page: Page }[] = [{ label: 'Home', page: 'home' }, { label: 'Verify', page: 'verify' }, { label: 'Explore', page: 'explore' }, { label: 'About', page: 'about' }];
  const go = (next: Page) => { setOpen(false); navigate(next); };
  return <header className="site-nav">
    <div className="nav-inner"><Logo onClick={() => go('home')} />
      <nav className={open ? 'nav-links is-open' : 'nav-links'} aria-label="Main navigation">{links.map((link) => <button key={link.page} className={page === link.page ? 'active' : ''} onClick={() => go(link.page)}>{link.label}</button>)}</nav>
      <div className="nav-actions"><button className="icon-button" aria-label="Search"><Search size={19} /></button><button className="sign-in" onClick={() => go('signin')}>Sign In</button><button className="dark-button compact" onClick={() => go('signup')}>Get Started <ArrowRight size={15} /></button></div>
      <button className="menu-button" onClick={() => setOpen(!open)} aria-label={open ? 'Close menu' : 'Open menu'}>{open ? <X size={22} /> : <Menu size={22} />}</button>
    </div>
  </header>;
}

function Tape({ children, className = '' }: { children: React.ReactNode; className?: string }) { return <div className={`tape ${className}`}>{children}</div>; }
function SectionEyebrow({ children }: { children: React.ReactNode }) { return <p className="eyebrow"><span />{children}</p>; }

function Home({ onVerify }: { onVerify: () => void }) {
  return <main>
    <section className="home-hero paper-noise">
      <div className="hero-scrap scrap-one">REAL<br /><span>FACTS</span><br />REAL<br /><span>IMPACT</span></div>
      <div className="hero-scrap scrap-two">Same story.<br />Different headlines.<br /><b>Different truth?</b></div>
      <div className="hero-photo camera-mark"><div className="camera-lens" /><div className="camera-body" /></div>
      <div className="hero-copy">
        <SectionEyebrow>AI-POWERED FACT VERIFICATION</SectionEyebrow>
        <h1>Question the story.<br /><em>Check the evidence.</em></h1>
        <p className="hero-subtitle">NewsVera helps you investigate news claims using AI-powered analysis and trusted sources.</p>
        <div className="hero-buttons"><button className="dark-button" onClick={onVerify}>Verify a Story <ArrowRight size={17} /></button><button className="outline-button" onClick={() => navigate('explore')}>Explore Today's News <ArrowUpRight size={16} /></button></div>
        <div className="hero-note"><ShieldCheck size={15} /> Built for curious minds and careful readers.</div>
      </div>
      <div className="hero-sticker">FACTS<br /><span>OVER</span><br />RUMORS</div>
      <div className="hero-arrow">↘</div>
    </section>
    <FeatureStrip />
    <section className="today-section"><div className="section-heading"><div><SectionEyebrow>THE DAILY BRIEF</SectionEyebrow><h2>Today's <span>Top Stories</span></h2><p>Real news that matters. And myths that don't.</p></div><button className="text-button" onClick={() => navigate('explore')}>View all stories <ArrowRight size={16} /></button></div><div className="news-grid home-news">{dailyNews.slice(0, 4).map((story) => <NewsCard key={story.id} story={story} />)}</div></section>
    <CTA onClick={onVerify} />
  </main>;
}

function FeatureStrip() {
  const features = [[ShieldCheck, 'AI-powered analysis', 'Advanced AI to detect misinformation'], [FileText, 'Multi-modal inputs', 'Text, links, or images'], [Search, 'Trusted sources', 'Evidence from reliable news outlets'], [BarChart3, 'Clear truth score', 'Understand the full picture']];
  return <section className="feature-strip">{features.map(([Icon, title, detail]) => <div className="feature" key={title as string}><Icon size={29} strokeWidth={1.5} /><strong>{title as string}</strong><p>{detail as string}</p></div>)}</section>;
}

function VerificationWorkspace({ onResult }: { onResult: (result: Result) => void }) {
  const [mode, setMode] = useState<InputMode>('text');
  const [value, setValue] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const submit = () => {
    setError('');
    if (mode === 'text' && wordCount < 10) return setError('Please enter at least 10 words so we can examine the claim.');
    if (mode === 'url' && !/^https?:\/\/[^\s]+\.[^\s]+$/i.test(value)) return setError('Please enter a valid-looking article URL, including https://.');
    if (mode === 'image' && !file) return setError('Please upload an image or screenshot to continue.');
    setLoading(true);
    let index = 0;
    const interval = window.setInterval(() => { index += 1; if (index >= stages.length) { window.clearInterval(interval); window.setTimeout(() => { setLoading(false); onResult({ score: 78, verdict: 'Partially Accurate', input: mode === 'image' ? file?.name || 'Uploaded image' : value }); }, 360); } }, 560);
  };
  const chooseFile = (selected: File | undefined) => { if (selected?.type.startsWith('image/')) { setFile(selected); setError(''); } else if (selected) setError('Please choose a JPG, PNG, WEBP, or GIF image.'); };
  if (loading) return <LoadingAnalysis />;
  return <div className="verify-panel paper-panel"><div className="mode-tabs" role="tablist">{(['text', 'url', 'image'] as InputMode[]).map((item) => <button key={item} role="tab" aria-selected={mode === item} className={mode === item ? 'selected' : ''} onClick={() => { setMode(item); setError(''); }}>{item === 'text' ? <FileText size={17} /> : item === 'url' ? <Globe2 size={17} /> : <ImageIcon size={17} />} {item.toUpperCase()}</button>)}</div>
    {mode === 'text' && <div className="field-wrap"><label htmlFor="claim">Your claim or article text</label><textarea id="claim" value={value} onChange={(event) => setValue(event.target.value)} placeholder="Paste a news claim or article text here..." maxLength={2000} /><span className="field-meta">{wordCount} words · {value.length}/2000</span></div>}
    {mode === 'url' && <div className="field-wrap"><label htmlFor="url">Article URL</label><div className="input-with-icon"><Globe2 size={18} /><input id="url" value={value} onChange={(event) => setValue(event.target.value)} placeholder="Paste a news article URL..." /></div><span className="field-meta">We only use this to understand the story you want to examine.</span></div>}
    {mode === 'image' && <div className="field-wrap"><label>Screenshot or image</label><button className="upload-zone" onClick={() => fileInput.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); chooseFile(event.dataTransfer.files[0]); }}><input ref={fileInput} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(event) => chooseFile(event.target.files?.[0])} hidden />{file ? <><CircleCheck size={30} /><strong>{file.name}</strong><span>Ready to analyze · Click to replace</span></> : <><Upload size={29} /><strong>Drop a screenshot here or click to upload</strong><span>JPG, PNG, WEBP, or GIF · Max 10MB</span></>}</button></div>}
    {error && <p className="form-error"><CircleAlert size={16} />{error}</p>}<button className="dark-button verify-submit" onClick={submit}>Analyze & Verify <ArrowRight size={18} /></button><p className="privacy-note">NewsVera provides AI-assisted analysis and source-based evidence. Always review the cited sources before making important decisions.</p>
  </div>;
}

function LoadingAnalysis() { const [active, setActive] = useState(0); useEffect(() => { const timer = window.setInterval(() => setActive((current) => Math.min(current + 1, stages.length - 1)), 560); return () => window.clearInterval(timer); }, []); return <div className="loading-panel paper-panel"><div className="loader-ring"><Search size={31} /></div><SectionEyebrow>INVESTIGATIVE MODE</SectionEyebrow><h3>Following the evidence<span className="blink">_</span></h3><p>Give us a moment to read between the lines.</p><div className="stage-list">{stages.map((stage, index) => <div key={stage} className={index < active ? 'done' : index === active ? 'current' : ''}>{index < active ? <Check size={15} /> : <span className="stage-dot" />}{stage}{index === active && <i>working</i>}</div>)}</div></div>; }

function VerifyPage({ onResult }: { onResult: (result: Result) => void }) { return <main className="simple-page verify-page"><div className="page-intro"><SectionEyebrow>START YOUR INVESTIGATION</SectionEyebrow><h1>Verify a <em>Story</em></h1><p>Give us the story. We'll help you examine the evidence.</p></div><VerificationWorkspace onResult={onResult} /><div className="mock-label"><Sparkles size={14} /> MOCK EXPERIENCE · No external services connected yet</div></main>; }

function TruthScore({ score }: { score: number }) { return <div className="score-wrap"><div className="score-ring" style={{ '--score': `${score * 3.6}deg` } as React.CSSProperties}><div><strong>{score}</strong><span>/ 100</span></div></div><p>TRUTH SCORE</p></div>; }
function VerdictBadge({ verdict }: { verdict: string }) { return <span className="verdict-badge">{verdict}</span>; }
function SourceCard({ name, title, type, description }: { name: string; title: string; type: string; description: string }) { return <div className="source-card"><div className="source-top"><span className="source-mark">{name.slice(0, 2).toUpperCase()}</span><span>{name}</span><ArrowUpRight size={16} /></div><h4>{title}</h4><p>{description}</p><small>{type}</small></div>; }
function ResultPage({ result, onAnother }: { result: Result; onAnother: () => void }) { return <main className="simple-page result-page"><div className="result-kicker"><SectionEyebrow>YOUR INVESTIGATION · MOCK RESULT</SectionEyebrow><button className="text-button" onClick={onAnother}>← Verify another story</button></div><div className="result-header"><div><h1>Here's what we <em>found.</em></h1><p className="result-claim">“{result.input || 'The submitted story'}”</p></div><div className="result-score"><TruthScore score={result.score} /><VerdictBadge verdict={result.verdict} /></div></div><div className="result-grid"><section className="analysis-card paper-panel"><SectionEyebrow>OUR READ</SectionEyebrow><h2>AI Analysis</h2><ul><li>The central claim is supported by multiple independent reports.</li><li>One important detail differs between the original claim and available evidence.</li><li>The wording appears stronger than what the cited evidence establishes.</li></ul><div className="confidence-line"><span>Confidence</span><div><i style={{ width: '78%' }} /></div><b>High</b></div></section><section className="sources-section"><SectionEyebrow>FOLLOW THE PAPER TRAIL</SectionEyebrow><h2>Evidence &amp; Sources</h2><div className="source-list"><SourceCard name="Reuters" title="Reporting and context around the central claim" type="International news agency" description="A corroborating report with context on the event and timeline." /><SourceCard name="AP" title="What the available records show" type="Independent reporting" description="A second account that helps clarify the important detail." /><SourceCard name="BBC" title="A closer look at the wider story" type="Background analysis" description="Background reporting that adds perspective without overstating the evidence." /></div></section></div><p className="result-disclaimer">This is a UI demonstration using mock data. These sources do not represent a real-time verification of your submission.</p></main>; }

function NewsCard({ story }: { story: NewsStory }) { return <article className={`news-card ${story.tone}`}><div className="news-image"><span>{story.tone === 'real' ? 'THE DAILY RECORD' : 'CHECK THE HEADLINE'}</span><div className="image-lines" /></div><div className="news-card-body"><div className="card-meta"><span className={story.tone === 'real' ? 'status-real' : 'status-false'}>{story.status}</span><span>{story.category}</span></div><h3>{story.title}</h3><p>{story.summary}</p><div className="card-footer"><span>{story.source} · {story.date}</span><b>{story.score}<small>/100</small></b></div></div></article>; }
function ExplorePage() { const real = useMemo(() => dailyNews.filter((story) => story.tone === 'real'), []); const falseStories = useMemo(() => dailyNews.filter((story) => story.tone === 'false'), []); return <main className="simple-page explore-page"><div className="page-intro explore-intro"><SectionEyebrow>THE DAILY BRIEF · SEP 17, 2026</SectionEyebrow><h1>Today's <em>Top Stories</em></h1><p>Read widely. Check carefully. Know what holds up.</p></div><div className="explore-columns"><section><div className="column-title"><h2>Top Real News</h2><span>03 stories</span></div><div className="news-list">{real.map((story) => <NewsCard story={story} key={story.id} />)}</div></section><section><div className="column-title false-title"><h2>Top Debunked / Misleading</h2><span>03 stories</span></div><div className="news-list">{falseStories.map((story) => <NewsCard story={story} key={story.id} />)}</div></section></div></main>; }

function AboutPage() { const steps = [['01', 'Submit', 'Bring us a claim, a link, or a screenshot.'], ['02', 'Extract', 'We identify the key claims and the details that matter.'], ['03', 'Verify', 'Evidence is compared across trusted, independent sources.'], ['04', 'Explain', 'You get a clear score, verdict, and source trail.']]; return <main className="simple-page about-page"><div className="about-intro"><SectionEyebrow>THE NEWSVERA NOTEBOOK</SectionEyebrow><h1>Truth is a process,<br /><em>not a punchline.</em></h1><p>NewsVera is an AI-assisted reading companion for a noisy news cycle. We make the path from a headline to the evidence easier to follow.</p></div><div className="about-grid"><section><h2>What is NewsVera?</h2><p>NewsVera helps you slow down, question a claim, and see what supports it. The goal isn't to tell you what to think. It's to make the evidence visible so you can decide for yourself.</p><div className="red-quote">“The truth is rarely hidden. It is usually just surrounded by noise.”</div></section><section className="how-card paper-panel"><SectionEyebrow>A CLEARER WAY TO READ</SectionEyebrow><h2>How it works</h2>{steps.map(([number, title, detail]) => <div className="step" key={number}><span>{number}</span><div><h3>{title}</h3><p>{detail}</p></div></div>)}</section></div><section className="score-explainer"><SectionEyebrow>A SCORE, NOT A SENTENCE</SectionEyebrow><h2>How the truth score works</h2><p>The score is a quick way to communicate the weight of the available evidence. It considers source agreement, primary records, language, and what remains unknown. A score is a starting point for deeper reading, never the final word.</p><div className="score-scale"><span><i className="fake" />0–39<br /><b>Fake / Misleading</b></span><span><i className="unverified" />40–64<br /><b>Unverified</b></span><span><i className="partial" />65–84<br /><b>Partially Accurate</b></span><span><i className="true" />85–100<br /><b>Trustworthy</b></span></div></section><div className="disclaimer"><CircleAlert size={20} /><p>NewsVera is an AI-assisted verification tool. It does not replace professional fact-checkers, journalists, or primary sources. Always review the evidence and cited sources.</p></div></main>; }

function AuthPage({ signup }: { signup: boolean }) { return <main className="auth-page paper-noise"><div className="auth-card"><Logo onClick={() => navigate('home')} /><SectionEyebrow>{signup ? 'JOIN THE NOTEBOOK' : 'WELCOME BACK, READER'}</SectionEyebrow><h1>{signup ? 'Create your account.' : 'Sign in to NewsVera.'}</h1><p>{signup ? 'Save your reports and keep your investigations in one place.' : 'Pick up where your last investigation left off.'}</p><form onSubmit={(event) => { event.preventDefault(); navigate('dashboard'); }}><label>Email address<input type="email" placeholder="you@example.com" required /></label><label>Password<input type="password" placeholder="At least 8 characters" required minLength={8} /></label>{signup && <label>Confirm password<input type="password" placeholder="Repeat your password" required minLength={8} /></label>}<button className="dark-button" type="submit">{signup ? 'Create account' : 'Sign in'} <ArrowRight size={17} /></button></form><p className="auth-switch">{signup ? 'Already have an account?' : 'New to NewsVera?'} <button onClick={() => navigate(signup ? 'signin' : 'signup')}>{signup ? 'Sign in' : 'Create an account'}</button></p><small className="auth-note">Authentication is a frontend preview for now.</small></div></main>; }

function DashboardPage() { return <main className="simple-page dashboard-page"><div className="dashboard-top"><div><SectionEyebrow>YOUR PRIVATE NOTEBOOK</SectionEyebrow><h1>My <em>Reports</em></h1><p>Keep your questions, findings, and source trails close.</p></div><button className="dark-button" onClick={() => navigate('verify')}>New verification <ArrowRight size={17} /></button></div><div className="reports-card paper-panel"><div className="report-heading"><h2>Recent investigations</h2><span>03 saved reports</span></div>{mockReports.map((report) => <div className="report-row" key={report.id}><div className="report-claim"><span>{report.date}</span><h3>{report.claim}</h3></div><div className="report-verdict"><strong>{report.score}</strong><span>{report.verdict}</span></div><div className="report-sources">{report.sources} sources</div><button className="report-view" onClick={() => navigate('result')}>View report <ArrowUpRight size={15} /></button><button className="delete-button" aria-label={`Delete report ${report.id}`}>Delete</button></div>)}</div><div className="dashboard-tip"><ClipboardCheck size={22} /><div><strong>Keep asking good questions.</strong><p>Reports saved here are mock examples until accounts and saving are connected.</p></div></div></main>; }

function CTA({ onClick }: { onClick: () => void }) { return <section className="bottom-cta"><Tape>THE MORE YOU KNOW</Tape><h2>Don't just read the headline.<br /><em>Read the evidence.</em></h2><button className="dark-button" onClick={onClick}>Start verifying <ArrowRight size={17} /></button></section>; }

function Footer() { return <footer><div><Logo onClick={() => navigate('home')} /><p>For a more informed tomorrow.</p></div><div className="footer-links"><button onClick={() => navigate('verify')}>Verify a story</button><button onClick={() => navigate('explore')}>Explore news</button><button onClick={() => navigate('about')}>About NewsVera</button></div><div className="socials"><Instagram size={17} /><Linkedin size={17} /><Youtube size={18} /></div></footer>; }

function App() { const [page, setPage] = useState<Page>(getPage); const [result, setResult] = useState<Result>({ score: 78, verdict: 'Partially Accurate', input: '' }); useEffect(() => { const update = () => setPage(getPage()); window.addEventListener('popstate', update); return () => window.removeEventListener('popstate', update); }, []); const showResult = (next: Result) => { setResult(next); navigate('result'); }; let content: React.ReactNode; if (page === 'home') content = <Home onVerify={() => navigate('verify')} />; if (page === 'verify') content = <VerifyPage onResult={showResult} />; if (page === 'result') content = <ResultPage result={result} onAnother={() => navigate('verify')} />; if (page === 'explore') content = <ExplorePage />; if (page === 'about') content = <AboutPage />; if (page === 'signin') content = <AuthPage signup={false} />; if (page === 'signup') content = <AuthPage signup />; if (page === 'dashboard') content = <DashboardPage />; return <div className="app-shell"><Navbar page={page} />{content}<Footer /></div>; }

export default App;
