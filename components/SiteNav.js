import Link from 'next/link';

const NAV_LINKS = [
  { href: '/labor', label: 'نزاعات الشغل' },
  { href: '/travail', label: 'حوادث الشغل' },
  { href: '/avp-victime', label: 'حوادث السير · الضحية' },
  { href: '/avp-ayants-droit', label: 'حوادث السير · ذوو الحقوق' },
  { href: '/blog', label: 'دليلك القانوني' },
];

export default function SiteNav({ current }) {
  return (
    <nav className="site-nav" dir="rtl">
      <div className="site-nav-inner">
        <Link href="/" legacyBehavior>
          <a className="site-nav-logo">
            <div className="site-nav-logo-icon">⚖️</div>
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
      </div>
      <style jsx>{`
        @media (max-width: 500px) {
          .site-nav-links {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            white-space: nowrap;
          }
        }
      `}</style>
    </nav>
  );
}
