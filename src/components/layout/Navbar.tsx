import { useState } from 'react';
import {
  ArrowRight,
  Menu,
  Search,
  X,
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

interface NavbarProps {
  page: Page;
  onNavigate: (page: Page) => void;
  isLoggedIn: boolean;
  onSignOut: () => void;
}

export default function Navbar({
  page,
  onNavigate,
  isLoggedIn,
  onSignOut,
}: NavbarProps) {
  const [open, setOpen] = useState(false);

  const links: { label: string; page: Page }[] = [
    { label: 'Home', page: 'home' },
    { label: 'Verify', page: 'verify' },
    { label: 'Explore', page: 'explore' },
    { label: 'About', page: 'about' },
  ];

  const go = (next: Page) => {
    setOpen(false);
    onNavigate(next);
  };

  const handleSignOut = async () => {
    setOpen(false);
    await onSignOut();
  };

  return (
    <header className="site-nav">
      <div className="nav-inner">
        <Logo onClick={() => go('home')} />

        <nav
          className={open ? 'nav-links is-open' : 'nav-links'}
          aria-label="Main navigation"
        >
          {links.map((link) => (
            <button
              key={link.page}
              className={page === link.page ? 'active' : ''}
              onClick={() => go(link.page)}
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="nav-actions">
          <button
            className="icon-button"
            aria-label="Search"
          >
            <Search size={19} />
          </button>

          {isLoggedIn ? (
            <>
              <button
                className="sign-in"
                onClick={() => go('dashboard')}
              >
                Dashboard
              </button>

              <button
                className="dark-button compact"
                onClick={handleSignOut}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button
                className="sign-in"
                onClick={() => go('signin')}
              >
                Sign In
              </button>

              <button
                className="dark-button compact"
                onClick={() => go('signup')}
              >
                Get Started
                <ArrowRight size={15} />
              </button>
            </>
          )}
        </div>

        <button
          className="menu-button"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </header>
  );
}