import Link from 'next/link';
import { useEffect, useState } from 'react';

const NAV_LINKS = [
  { href: '/labor', label: 'نزاعات الشغل' },
  { href: '/travail', label: 'حوادث الشغل' },
  { href: '/avp-victime', label: 'حوادث السير · الضحية' },
  { href: '/avp-ayants-droit', label: 'حوادث السير · ذوو الحقوق' },
  { href: '/blog', label: 'دليلك القانوني' },
];

export default function SiteNav({ current }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMenuOpen) return undefined;

    const handleOutsideClick = (event) => {
      if (event.target.closest('[data-site-nav-mobile-shell="true"]')) {
        return;
      }

      setIsMenuOpen(false);
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isMenuOpen]);

  return (
    <div className="site-nav-shell" dir="rtl" data-site-nav-mobile-shell="true">
      <nav className="site-nav">
        <div className="site-nav-inner">
          <Link href="/" legacyBehavior>
            <a className="site-nav-logo" onClick={() => setIsMenuOpen(false)}>
              <img
                src="/icons/icon-48.png"
                alt="logo"
                style={{ width: '32px', height: '32px', borderRadius: '8px' }}
              />
              <div className="site-nav-logo-text">
                حاسبة التعويضات
                <span className="site-nav-logo-sub">القانون المغربي</span>
              </div>
            </a>
          </Link>
          <ul className="site-nav-links">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} legacyBehavior>
                  <a className={`site-nav-link ${current === link.href ? 'is-active' : ''}`}>
                    {link.label}
                  </a>
                </Link>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="site-nav-toggle"
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            ☰
          </button>
        </div>
      </nav>

      <div className={`site-nav-mobile-menu ${isMenuOpen ? 'is-open' : ''}`}>
        <div className="site-nav-mobile-menu-head">
          <button
            type="button"
            className="site-nav-mobile-close"
            aria-label="إغلاق القائمة"
            onClick={() => setIsMenuOpen(false)}
          >
            ✕
          </button>
        </div>
        <ul className="site-nav-mobile-list">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} legacyBehavior>
                <a
                  className={`site-nav-mobile-link ${current === link.href ? 'is-active' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <style jsx>{`
        .site-nav-shell {
          position: relative;
        }

        .site-nav-toggle,
        .site-nav-mobile-menu {
          display: none;
        }

        @media (max-width: 700px) {
          .site-nav-links {
            display: none;
          }

          .site-nav-toggle {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            order: -1;
            padding: 0;
            background: none;
            border: none;
            color: #fff;
            font-family: 'Cairo', 'Noto Kufi Arabic', system-ui, sans-serif;
            font-size: 28px;
            line-height: 1;
            cursor: pointer;
          }

          .site-nav-mobile-menu {
            display: block;
            position: absolute;
            top: 100%;
            right: 0;
            left: 0;
            width: 100%;
            max-height: 0;
            opacity: 0;
            overflow: hidden;
            pointer-events: none;
            transform: translateY(-10px);
            background: #1B4332;
            box-shadow: 0 18px 36px oklch(0.2 0.07 155 / 0.24);
            transition: max-height 0.28s ease, opacity 0.22s ease, transform 0.28s ease;
            z-index: 120;
          }

          .site-nav-mobile-menu.is-open {
            max-height: 420px;
            opacity: 1;
            pointer-events: auto;
            transform: translateY(0);
          }

          .site-nav-mobile-menu-head {
            display: flex;
            justify-content: flex-start;
            border-bottom: 1px solid oklch(1 0 0 / 0.08);
          }

          .site-nav-mobile-close {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 16px 24px;
            background: none;
            border: none;
            color: #fff;
            font-family: 'Cairo', 'Noto Kufi Arabic', system-ui, sans-serif;
            font-size: 24px;
            line-height: 1;
            cursor: pointer;
          }

          .site-nav-mobile-list {
            list-style: none;
            margin: 0;
            padding: 0;
          }

          .site-nav-mobile-link {
            display: block;
            padding: 16px 24px;
            border-bottom: 1px solid oklch(1 0 0 / 0.08);
            color: oklch(1 0 0 / 0.82);
            text-decoration: none;
            font-family: 'Cairo', 'Noto Kufi Arabic', system-ui, sans-serif;
            font-size: 15px;
            font-weight: 700;
            transition: background 0.18s ease, color 0.18s ease;
          }

          .site-nav-mobile-link:hover {
            background: oklch(1 0 0 / 0.06);
            color: #fff;
          }

          .site-nav-mobile-link.is-active {
            color: oklch(0.72 0.12 75);
          }
        }

        @media (max-width: 500px) {
          .site-nav-toggle {
            font-size: 26px;
          }
        }
      `}</style>
    </div>
  );
}
