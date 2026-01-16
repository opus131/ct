import './style.css';

import { A, useLocation } from '@solidjs/router';
import { createSignal, createEffect, onCleanup } from 'solid-js';
import { ThemePicker } from '../theme-picker';

export function Header() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = createSignal(false);

  const isActive = (path: string) => location.pathname === path;

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen());
  const closeMenu = () => setIsMenuOpen(false);

  // Close menu on route change
  createEffect(() => {
    location.pathname;
    closeMenu();
  });

  // Close menu on resize above 768px
  const handleResize = () => {
    if (window.innerWidth > 768) {
      closeMenu();
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('resize', handleResize);
    onCleanup(() => window.removeEventListener('resize', handleResize));
  }

  return (
    <>
      <header class="header">
        <div class="header--inner">
          <A href="/" class="header--logo" onClick={closeMenu}>
            <svg xmlns="http://www.w3.org/2000/svg" height="26" viewBox="0 0 114.833 26" width="114.833">
              <g fill="none">
                <path class="flag-red" fill="#c23131" d="M23.688 12.278v-1.95l-9.388 7.367 -6.138 -2.671 -7.8 5.344v1.805l7.8 -5.417 6.212 2.671 9.317 -7.221Zm-15.528 1.083 6.212 2.745 9.317 -7.221V7.005l-9.244 7.439 -6.283 -2.888m0 -1.517 6.212 2.671 9.317 -7.221V3.755L14.445 11.05 8.233 8.378m0 -1.662 6.212 2.745L23.688 2.167V0.362l-9.388 7.367L8.162 4.983m0 13.362 -7.8 5.344v1.805l7.8 -5.488 6.212 2.745 9.317 -7.221v-1.806L14.445 21.017 8.233 18.345Z" />
                <path class="flag-blue" fill="#186cea" d="m0.362 18.85 7.8 -5.417v-1.733l-7.8 5.345v1.733m7.8 -10.471 -7.8 5.416v1.805l7.8 -5.416m0 -5.055 -7.8 5.271V12.133l7.8 -5.417" />
              </g>
              <text x="28" y="11" fill="white" font-family="Inter, -apple-system, sans-serif" font-size="12" font-weight="700" letter-spacing="0.5">CAPITOL</text>
              <text x="28" y="22" fill="#6b7280" font-family="Inter, -apple-system, sans-serif" font-size="8" font-weight="500" letter-spacing="1.5">TRADES</text>
            </svg>
          </A>

          <nav class="header--nav header--nav-desktop">
            <A href="/trades" classList={{ active: isActive('/trades') }}>Trades</A>
            <A href="/politicians" classList={{ active: isActive('/politicians') }}>Politicians</A>
            <A href="/issuers" classList={{ active: isActive('/issuers') }}>Issuers</A>
            <A href="/committees" classList={{ active: isActive('/committees') }}>Committees</A>
            <A href="/states" classList={{ active: isActive('/states') }}>States</A>
            <A href="/insights" classList={{ active: isActive('/insights') }}>Insights</A>
            <A href="/buzz" classList={{ active: isActive('/buzz') }}>Buzz</A>
          </nav>

          <div class="header--actions">
            <ThemePicker />
            <button
              class="header--hamburger"
              classList={{ open: isMenuOpen() }}
              onClick={toggleMenu}
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen()}
            >
              <span class="hamburger-line" />
              <span class="hamburger-line" />
              <span class="hamburger-line" />
            </button>
          </div>
        </div>
      </header>

      <div
        class="header--overlay"
        classList={{ visible: isMenuOpen() }}
        onClick={closeMenu}
      />

      <nav class="header--drawer" classList={{ open: isMenuOpen() }}>
        <div class="header--drawer-theme">
          <span class="header--drawer-theme-label">Theme</span>
          <ThemePicker />
        </div>
        <A href="/trades" classList={{ active: isActive('/trades') }} onClick={closeMenu}>
          Trades
        </A>
        <A href="/politicians" classList={{ active: isActive('/politicians') }} onClick={closeMenu}>
          Politicians
        </A>
        <A href="/issuers" classList={{ active: isActive('/issuers') }} onClick={closeMenu}>
          Issuers
        </A>
        <A href="/committees" classList={{ active: isActive('/committees') }} onClick={closeMenu}>
          Committees
        </A>
        <A href="/states" classList={{ active: isActive('/states') }} onClick={closeMenu}>
          States
        </A>
        <A href="/insights" classList={{ active: isActive('/insights') }} onClick={closeMenu}>
          Insights
        </A>
        <A href="/buzz" classList={{ active: isActive('/buzz') }} onClick={closeMenu}>
          Buzz
        </A>
      </nav>
    </>
  );
}
