import {
  Instagram,
  Linkedin,
  Youtube,
} from 'lucide-react';

import Logo from './Logo';

type Page =
  | 'home'
  | 'verify'
  | 'explore'
  | 'about'
  | 'signin'
  | 'signup'
  | 'dashboard'
  | 'result';

interface FooterProps {
  onNavigate: (page: Page) => void;
}

export default function Footer({
  onNavigate,
}: FooterProps) {
  return (
    <footer>
      <div>
        <Logo onClick={() => onNavigate('home')} />
        <p>For a more informed tomorrow.</p>
      </div>

      <div className="footer-links">
        <button onClick={() => onNavigate('verify')}>
          Verify a story
        </button>

        <button onClick={() => onNavigate('explore')}>
          Explore news
        </button>

        <button onClick={() => onNavigate('about')}>
          About NewsVera
        </button>
      </div>

      <div className="socials">
        <Instagram size={17} />
        <Linkedin size={17} />
        <Youtube size={18} />
      </div>
    </footer>
  );
}