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
    background: oklch(26% 0.080 165);
    border-bottom: 1px solid oklch(31% 0.090 162);
    position: sticky;
    top: 0;
    z-index: 100;
  }
  .site-nav-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    height: 56px;
  }
  .site-nav-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    flex-shrink: 0;
  }
  .site-nav-icon { font-size: 20px; }
  .site-nav-title {
    font-family: 'Cairo', 'Noto Kufi Arabic', system-ui, sans-serif;
    font-size: 18px;
    font-weight: 800;
    color: #fff;
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
    display: inline-block;
    padding: 6px 12px;
    font-family: 'Cairo', 'Noto Kufi Arabic', system-ui, sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: oklch(80% 0.02 160);
    text-decoration: none;
    border-radius: 6px;
    white-space: nowrap;
    transition: background .15s, color .15s;
  }
  .site-nav-link:hover { background: oklch(31% 0.090 162); color: #fff; }
  .site-nav-link.is-active { background: oklch(45% 0.115 158); color: #fff; }
  @media (max-width: 700px) {
    .site-nav-title { display: none; }
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
      </Head>
      <Component {...pageProps} />
    </>
  );
}
