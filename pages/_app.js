import '../styles/globals.css';
import Head from 'next/head';

const GA_ID = 'G-8QP3XESLWT'; // replace with your actual Measurement ID

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&family=Noto+Kufi+Arabic:wght@400;500;600;700;800;900&family=Noto+Naskh+Arabic:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <style>{`
  .site-nav {
    position: sticky;
    top: 0;
    z-index: 100;
    height: 64px;
    background: oklch(0.20 0.07 155 / 0.95);
    backdrop-filter: blur(16px) saturate(1.4);
    -webkit-backdrop-filter: blur(16px) saturate(1.4);
    border-bottom: 1px solid oklch(1 0 0 / 0.08);
    display: flex;
    align-items: center;
    padding: 0 32px;
  }
  .site-nav-inner {
    max-width: 1100px;
    width: 100%;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
  }
  .site-nav-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    flex-shrink: 0;
  }
  .site-nav-logo-icon {
    width: 36px;
    height: 36px;
    background: oklch(0.72 0.12 75);
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
  }
  .site-nav-logo-text {
    font-family: 'Cairo', 'Noto Kufi Arabic', system-ui, sans-serif;
    font-size: 16px;
    font-weight: 800;
    color: #fff;
    line-height: 1.2;
    display: flex;
    flex-direction: column;
  }
  .site-nav-logo-sub {
    font-size: 10px;
    font-weight: 500;
    color: oklch(1 0 0 / 0.55);
  }
  .site-nav-links {
    display: flex;
    align-items: center;
    gap: 4px;
    list-style: none;
    margin: 0;
    padding: 0;
    overflow-x: auto;
  }
  .site-nav-link {
    font-family: 'Cairo', 'Noto Kufi Arabic', system-ui, sans-serif;
    font-size: 13.5px;
    font-weight: 600;
    color: oklch(1 0 0 / 0.75);
    text-decoration: none;
    padding: 6px 14px;
    border-radius: 8px;
    white-space: nowrap;
    transition: all 0.2s;
    display: inline-block;
  }
  .site-nav-link:hover { color: #fff; background: oklch(1 0 0 / 0.1); }
  .site-nav-link.is-active { color: oklch(0.72 0.12 75); background: oklch(1 0 0 / 0.08); }
  @media (max-width: 700px) {
    .site-nav { padding: 0 16px; }
    .site-nav-logo-text { display: none; }
    .site-nav-link { font-size: 12px; padding: 5px 8px; }
  }
`}</style>
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}');
            `,
          }}
        />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9825028663283152"
          crossOrigin="anonymous"
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
