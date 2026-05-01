import Link from 'next/link';

const NAV_LINKS = [
  { href: '/labor', label: 'نزاعات الشغل' },
  { href: '/travail', label: 'حوادث الشغل' },
  { href: '/avp-victime', label: 'حوادث السير · الضحية' },
  { href: '/avp-ayants-droit', label: 'حوادث السير · ذوو الحقوق' },
];

export default function SiteNav({ current }) {
  return (
    <nav className="site-nav" dir="rtl">
      <div className="site-nav-inner">
        <Link href="/" legacyBehavior>
          <a className="site-nav-logo">
            <span className="site-nav-icon">⚖️</span>
            <span className="site-nav-title">تااويدات</span>
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
    </nav>
  );
}
