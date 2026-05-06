import Head from 'next/head';
import SiteNav from '../components/SiteNav';

const sections = [
  {
    title: 'مقدمة',
    content: [
      'taawidat.ma هي أداة استرشادية مجانية لحساب التعويضات القانونية وفق القانون المغربي. لا تتطلب المنصة إنشاء حساب أو تسجيل.',
    ],
  },
  {
    title: 'البيانات التي نجمعها',
    content: [
      'لا نجمع أي بيانات شخصية مباشرة. المعطيات التي تدخلها في الحاسبة لا تُرسل إلى أي خادم خارجي ولا تُحفظ بعد إغلاق الصفحة.',
      'نستخدم Google Analytics 4 لتحليل حركة الزيارات بشكل مجهول مثل عدد الزوار، الصفحات المزارة، ومدة الزيارة. لا يتم ربط هذه البيانات بهويتك الشخصية.',
    ],
  },
  {
    title: 'الإعلانات',
    content: [
      'تعرض المنصة إعلانات عبر Google AdSense. قد يستخدم Google ملفات تعريف الارتباط لعرض إعلانات ذات صلة باهتماماتك.',
      'يمكنك إدارة تفضيلات الإعلانات عبر إعدادات Google.',
    ],
  },
  {
    title: 'ملفات تعريف الارتباط Cookies',
    content: [
      'نستخدم ملفات تعريف الارتباط فقط لأغراض التحليل عبر Google Analytics والإعلانات عبر Google AdSense. لا نستخدم ملفات تعريف ارتباط لتتبع هويتك الشخصية مباشرة.',
    ],
  },
  {
    title: 'حقوقك',
    list: [
      'طلب معرفة البيانات المجمعة عنك إن وجدت',
      'طلب حذف أي بيانات مرتبطة بك إن وجدت',
      'تعطيل ملفات تعريف الارتباط من إعدادات متصفحك',
    ],
  },
  {
    title: 'التواصل',
    content: ['لأي استفسار يتعلق بالخصوصية، يمكن التواصل عبر:', 'taawidat.ma'],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <Head>
        <title>سياسة الخصوصية | taawidat.ma</title>
        <meta name="description" content="سياسة خصوصية تطبيق ومنصة taawidat.ma" />
      </Head>

      <div className="privacy-page" lang="ar" dir="rtl">
        <SiteNav current="/privacy" />

        <main className="privacy-main">
          <article className="privacy-card">
            <header className="privacy-header">
              <p className="privacy-kicker">آخر تحديث: ماي 2026</p>
              <h1>سياسة الخصوصية</h1>
            </header>

            <div className="privacy-sections">
              {sections.map((section, index) => (
                <section key={section.title} className="privacy-section" aria-labelledby={`privacy-section-${index}`}>
                  <h2 id={`privacy-section-${index}`}>
                    <span className="privacy-section-number">SECTION {index + 1}</span>
                    {section.title}
                  </h2>

                  {section.content?.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}

                  {section.list ? (
                    <ul>
                      {section.list.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              ))}
            </div>
          </article>
        </main>

        <footer className="privacy-footer">
          <p>هذه الحاسبة للاستئناس فقط ولا تغني عن استشارة محامٍ مختص</p>
        </footer>
      </div>

      <style jsx>{`
        .privacy-page {
          min-height: 100vh;
          background: oklch(0.975 0.008 90);
          color: oklch(0.18 0.04 155);
          font-family: 'Cairo', 'Noto Kufi Arabic', system-ui, sans-serif;
        }

        .privacy-main {
          padding: 48px 24px 80px;
        }

        .privacy-card {
          max-width: 800px;
          margin: 0 auto;
          background: #fff;
          border: 1.5px solid oklch(0.91 0.02 155);
          border-radius: 24px;
          box-shadow: 0 16px 40px oklch(0.2 0.07 155 / 0.08), 0 4px 12px oklch(0.2 0.07 155 / 0.06);
          overflow: hidden;
        }

        .privacy-header {
          padding: 40px 32px 24px;
          background:
            linear-gradient(180deg, oklch(0.95 0.03 155) 0%, oklch(1 0 0) 100%);
          border-bottom: 1px solid oklch(0.91 0.02 155);
        }

        .privacy-kicker {
          margin: 0 0 10px;
          color: oklch(0.4 0.11 155);
          font-size: 13px;
          font-weight: 700;
        }

        h1 {
          margin: 0;
          font-size: clamp(30px, 4vw, 42px);
          line-height: 1.3;
          font-weight: 900;
          color: oklch(0.2 0.07 155);
        }

        .privacy-sections {
          padding: 12px 32px 32px;
        }

        .privacy-section {
          padding: 28px 0;
          border-bottom: 1px solid oklch(0.93 0.02 155);
        }

        .privacy-section:last-child {
          border-bottom: none;
          padding-bottom: 8px;
        }

        h2 {
          margin: 0 0 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 24px;
          line-height: 1.5;
          font-weight: 800;
          color: oklch(0.24 0.08 155);
        }

        .privacy-section-number {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: oklch(0.45 0.04 155);
        }

        p,
        li {
          margin: 0;
          font-size: 17px;
          line-height: 2;
          color: oklch(0.34 0.04 155);
        }

        p + p {
          margin-top: 12px;
        }

        ul {
          margin: 0;
          padding: 0 22px 0 0;
        }

        li + li {
          margin-top: 8px;
        }

        .privacy-footer {
          padding: 0 24px 36px;
          text-align: center;
        }

        .privacy-footer p {
          margin: 0;
          font-size: 14px;
          color: oklch(0.45 0.04 155);
        }

        @media (max-width: 640px) {
          .privacy-main {
            padding: 28px 16px 56px;
          }

          .privacy-header,
          .privacy-sections {
            padding-left: 20px;
            padding-right: 20px;
          }

          h2 {
            font-size: 21px;
          }

          p,
          li {
            font-size: 15px;
          }
        }
      `}</style>
    </>
  );
}
