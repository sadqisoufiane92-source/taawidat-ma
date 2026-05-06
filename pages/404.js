import Head from 'next/head';
import Link from 'next/link';
import SiteNav from '../components/SiteNav';

export default function Custom404Page() {
  return (
    <>
      <Head>
        <title>404 — الصفحة غير موجودة | taawidat.ma</title>
      </Head>

      <div className="notfound-page" lang="ar" dir="rtl">
        <SiteNav current="/404" />

        <main className="notfound-main">
          <section className="notfound-card" aria-labelledby="notfound-title">
            <p className="notfound-code">404</p>
            <h1 id="notfound-title">الصفحة غير موجودة</h1>
            <p className="notfound-subtitle">يبدو أن هذه الصفحة غير موجودة أو تم نقلها.</p>

            <Link href="/" legacyBehavior>
              <a className="notfound-button">العودة إلى الرئيسية</a>
            </Link>
          </section>
        </main>

        <footer className="notfound-footer">
          <p>هذه الحاسبة للاستئناس فقط ولا تغني عن استشارة محامٍ مختص</p>
        </footer>
      </div>

      <style jsx>{`
        .notfound-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: oklch(0.975 0.008 90);
          color: oklch(0.18 0.04 155);
          font-family: 'Cairo', 'Noto Kufi Arabic', system-ui, sans-serif;
        }

        .notfound-main {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 24px;
        }

        .notfound-card {
          width: 100%;
          max-width: 720px;
          text-align: center;
          background: #fff;
          border: 1.5px solid oklch(0.91 0.02 155);
          border-radius: 24px;
          padding: 48px 32px;
          box-shadow: 0 16px 40px oklch(0.2 0.07 155 / 0.08), 0 4px 12px oklch(0.2 0.07 155 / 0.06);
        }

        .notfound-code {
          margin: 0 0 10px;
          font-size: clamp(72px, 15vw, 140px);
          line-height: 0.95;
          font-weight: 900;
          color: oklch(0.72 0.12 75);
          letter-spacing: -0.04em;
        }

        h1 {
          margin: 0 0 14px;
          font-size: clamp(28px, 4vw, 38px);
          line-height: 1.35;
          font-weight: 900;
          color: #1B4332;
        }

        .notfound-subtitle {
          margin: 0 auto 28px;
          max-width: 460px;
          font-size: 17px;
          line-height: 1.9;
          color: oklch(0.4 0.04 155);
        }

        .notfound-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 13px 24px;
          background: #1B4332;
          color: oklch(0.72 0.12 75);
          font-size: 15px;
          font-weight: 800;
          text-decoration: none;
          border-radius: 14px;
          box-shadow: 0 10px 24px oklch(0.2 0.07 155 / 0.14);
          transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
          white-space: nowrap;
        }

        .notfound-button:hover {
          background: oklch(0.26 0.09 155);
          box-shadow: 0 16px 32px oklch(0.2 0.07 155 / 0.18);
        }

        .notfound-button:active {
          transform: translateY(1px);
        }

        .notfound-footer {
          padding: 0 24px 36px;
          text-align: center;
        }

        .notfound-footer p {
          margin: 0;
          font-size: 14px;
          color: oklch(0.45 0.04 155);
        }

        @media (max-width: 640px) {
          .notfound-main {
            padding: 24px 16px;
          }

          .notfound-card {
            padding: 40px 20px;
            border-radius: 20px;
          }

          .notfound-subtitle {
            font-size: 15px;
          }
        }
      `}</style>
    </>
  );
}
