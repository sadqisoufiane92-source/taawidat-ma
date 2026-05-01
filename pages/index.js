import Head from 'next/head';
import Link from 'next/link';
import SiteNav from '../components/SiteNav';

export default function Home() {
  return (
    <>
      <Head>
        <title>حاسبة التعويضات القانونية المغربية</title>
      </Head>

      <div lang="ar" dir="rtl">

        <SiteNav current="/" />

        {/* HERO */}
        <header className="idx-hero">
          <div className="idx-hero-pattern" />
          <div className="idx-hero-glow" />
          <div className="idx-hero-content">
            <div className="idx-hero-badge">
              <span className="idx-hero-badge-dot" />
              مُحدَّث وفق القانون 70.24 — يناير 2026
            </div>
            <h1 className="idx-hero-title">
              حاسبة <em className="idx-hero-accent">التعويضات</em><br />القانونية
            </h1>
            <p className="idx-hero-sub">
              أداة استرشادية دقيقة لحساب التعويضات وفق أحدث النصوص القانونية المغربية، في ثوانٍ
            </p>
          </div>
          <div className="idx-hero-scroll">
            <div className="idx-hero-scroll-line" />
            <div className="idx-hero-scroll-dot" />
          </div>
        </header>

        {/* MAIN */}
        <main className="idx-main">

          <div className="idx-ad-slot">إعلان</div>

          <div className="idx-section-header">
            <p className="idx-eyebrow">اختر نوع النزاع</p>
            <h2 className="idx-section-title">ما الحالة التي تريد حسابها؟</h2>
          </div>

          <div className="idx-cards-grid">

            <Link href="/labor" legacyBehavior>
              <a className="idx-card idx-card-labor">
                <div className="idx-card-law-tag">مدونة الشغل المغربية</div>
                <div className="idx-card-icon-wrap">
                  <svg width="28" height="28" viewBox="0 0 32 32" fill="none" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" stroke="oklch(0.36 0.12 155)"><rect x="8" y="10" width="16" height="13" rx="1.5" fill="oklch(0.85 0.09 155)"/><path d="M12 10V8a4 4 0 0 1 8 0v2"/><line x1="12" y1="15" x2="20" y2="15"/><line x1="12" y1="18" x2="17" y2="18"/></svg>
                </div>
                <div className="idx-card-title">نزاعات الشغل</div>
                <p className="idx-card-desc">احسب تعويضات الفصل التعسفي، الإخطار، الفصل التأديبي، العطل السنوية ومنحة الأقدمية وفق مدونة الشغل المغربية</p>
                <div className="idx-card-footer">
                  <span className="idx-card-cta">ابدأ الحساب</span>
                  <div className="idx-card-arrow">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="oklch(0.36 0.12 155)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 8H3M7 5l-3 3 3 3"/></svg>
                  </div>
                </div>
              </a>
            </Link>

            <Link href="/avp-victime" legacyBehavior>
              <a className="idx-card idx-card-victim">
                <div className="idx-card-law-tag">قانون 70.24</div>
                <div className="idx-card-icon-wrap">
                  <svg width="28" height="28" viewBox="0 0 32 32" fill="none" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" stroke="oklch(0.36 0.12 290)"><circle cx="13" cy="9" r="4" fill="oklch(0.88 0.07 290)"/><path d="M5 27c0-4 3.134-7 8-7"/><circle cx="22" cy="18" r="5" fill="oklch(0.88 0.07 10)" stroke="oklch(0.46 0.14 10)"/><line x1="22" y1="15" x2="22" y2="21" stroke="oklch(0.46 0.14 10)"/><line x1="19" y1="18" x2="25" y2="18" stroke="oklch(0.46 0.14 10)"/></svg>
                </div>
                <div className="idx-card-title">حوادث السير · الضحية</div>
                <p className="idx-card-desc">تقدير التعويض المستحق للضحية المباشرة عن العجز الجزئي أو الكلي وفق القانون 70.24 الصادر في يناير 2026</p>
                <div className="idx-card-footer">
                  <span className="idx-card-cta">ابدأ الحساب</span>
                  <div className="idx-card-arrow">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="oklch(0.36 0.12 290)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 8H3M7 5l-3 3 3 3"/></svg>
                  </div>
                </div>
              </a>
            </Link>

            <Link href="/avp-ayants-droit" legacyBehavior>
              <a className="idx-card idx-card-heirs">
                <div className="idx-card-law-tag">قانون 70.24</div>
                <div className="idx-card-icon-wrap">
                  <svg width="28" height="28" viewBox="0 0 32 32" fill="none" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" stroke="oklch(0.40 0.12 55)"><circle cx="16" cy="8" r="3.5" fill="oklch(0.88 0.09 55)"/><path d="M9 23c0-3.866 3.134-7 7-7s7 3.134 7 7"/><circle cx="6" cy="12" r="2.5" fill="oklch(0.94 0.06 55)"/><path d="M2 23c0-2.761 1.79-4.5 4-4.5"/><circle cx="26" cy="12" r="2.5" fill="oklch(0.94 0.06 55)"/><path d="M30 23c0-2.761-1.79-4.5-4-4.5"/></svg>
                </div>
                <div className="idx-card-title">حوادث السير · ذوو الحقوق</div>
                <p className="idx-card-desc">احتساب حق الورثة والمعالين في التعويض عن وفاة الضحية في حادثة سير وفق القانون 70.24</p>
                <div className="idx-card-footer">
                  <span className="idx-card-cta">ابدأ الحساب</span>
                  <div className="idx-card-arrow">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="oklch(0.40 0.12 55)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 8H3M7 5l-3 3 3 3"/></svg>
                  </div>
                </div>
              </a>
            </Link>

            <Link href="/travail" legacyBehavior>
              <a className="idx-card idx-card-workacci">
                <div className="idx-card-law-tag">ظهير 1927</div>
                <div className="idx-card-icon-wrap">
                  <svg width="28" height="28" viewBox="0 0 32 32" fill="none" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" stroke="oklch(0.40 0.12 35)"><path d="M6 17c0-5.523 4.477-10 10-10s10 4.477 10 10" fill="oklch(0.88 0.09 55)" stroke="none"/><path d="M6 17c0-5.523 4.477-10 10-10s10 4.477 10 10"/><rect x="4" y="17" width="24" height="4" rx="1" fill="oklch(0.88 0.09 35)"/><line x1="10" y1="21" x2="10" y2="26"/><line x1="22" y1="21" x2="22" y2="26"/><line x1="7" y1="26" x2="25" y2="26"/><line x1="16" y1="10" x2="16" y2="14"/></svg>
                </div>
                <div className="idx-card-title">حوادث الشغل</div>
                <p className="idx-card-desc">تعويضات إصابات العمل والأمراض المهنية وفق ظهير 1927 المعدل، شاملاً العجز المؤقت والدائم والوفاة</p>
                <div className="idx-card-footer">
                  <span className="idx-card-cta">ابدأ الحساب</span>
                  <div className="idx-card-arrow">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="oklch(0.40 0.12 35)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 8H3M7 5l-3 3 3 3"/></svg>
                  </div>
                </div>
              </a>
            </Link>

          </div>

          {/* HOW IT WORKS */}
          <div className="idx-divider">
            <div className="idx-divider-line" />
            <div className="idx-divider-diamond" />
            <div className="idx-divider-line" />
          </div>

          <section className="idx-how-section">
            <div className="idx-section-header">
              <p className="idx-eyebrow">طريقة الاستخدام</p>
              <h2 className="idx-section-title">كيف تعمل الحاسبة؟</h2>
            </div>
            <div className="idx-how-steps">
              <div className="idx-how-connector" />
              <div className="idx-how-step">
                <div className="idx-how-step-num">١</div>
                <h3 className="idx-how-step-title">اختر نوع النزاع</h3>
                <p className="idx-how-step-desc">حدد ما إذا كان النزاع يتعلق بنزاعات الشغل، حوادث الشغل، أو حوادث السير</p>
              </div>
              <div className="idx-how-step">
                <div className="idx-how-step-num">٢</div>
                <h3 className="idx-how-step-title">أدخل المعطيات</h3>
                <p className="idx-how-step-desc">أدخل البيانات المطلوبة كالراتب والتواريخ ونسب العجز وفق المعطيات المتوفرة لديك</p>
              </div>
              <div className="idx-how-step">
                <div className="idx-how-step-num">٣</div>
                <h3 className="idx-how-step-title">احصل على النتيجة</h3>
                <p className="idx-how-step-desc">تعرض الحاسبة تفصيلاً دقيقاً للمبالغ المستحقة مع المعادلات القانونية المعتمدة</p>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="idx-faq-section">
            <div className="idx-section-header">
              <p className="idx-eyebrow">أسئلة شائعة</p>
              <h2 className="idx-section-title">ما تودّ معرفته</h2>
            </div>
            <div className="idx-faq-list">
              <details className="idx-faq-item">
                <summary className="idx-faq-q">
                  هل نتائج الحاسبة ملزمة قانونياً؟
                  <div className="idx-faq-icon"><svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M7 3v8M3 7h8"/></svg></div>
                </summary>
                <p className="idx-faq-a">لا. الحاسبة أداة استرشادية تعتمد على النصوص القانونية المعمول بها. القرار النهائي في تحديد التعويض يبقى من اختصاص المحكمة المختصة.</p>
              </details>
              <details className="idx-faq-item">
                <summary className="idx-faq-q">
                  ما هي القوانين التي تستند إليها الحاسبة؟
                  <div className="idx-faq-icon"><svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M7 3v8M3 7h8"/></svg></div>
                </summary>
                <p className="idx-faq-a">تستند الحاسبة إلى مدونة الشغل المغربية لنزاعات الشغل، وظهير 1927 لحوادث الشغل، والقانون 70.24 الصادر في يناير 2026 لحوادث السير.</p>
              </details>
              <details className="idx-faq-item">
                <summary className="idx-faq-q">
                  هل يتم حفظ البيانات التي أدخلها؟
                  <div className="idx-faq-icon"><svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M7 3v8M3 7h8"/></svg></div>
                </summary>
                <p className="idx-faq-a">لا. جميع البيانات المدخلة تُعالج مباشرة في المتصفح ولا يتم حفظها أو إرسالها إلى أي خادم خارجي.</p>
              </details>
              <details className="idx-faq-item">
                <summary className="idx-faq-q">
                  هل الحاسبة مجانية؟
                  <div className="idx-faq-icon"><svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M7 3v8M3 7h8"/></svg></div>
                </summary>
                <p className="idx-faq-a">نعم. الحاسبة مجانية بالكامل وتتوفر للجميع دون قيود.</p>
              </details>
              <details className="idx-faq-item">
                <summary className="idx-faq-q">
                  هل يمكنني استخدام النتائج أمام المحكمة؟
                  <div className="idx-faq-icon"><svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M7 3v8M3 7h8"/></svg></div>
                </summary>
                <p className="idx-faq-a">يمكن الاستعانة بالنتائج كمرجع استرشادي لتقدير المبالغ، لكن يُنصح دائماً باستشارة محامٍ مختص قبل اتخاذ أي إجراء قانوني.</p>
              </details>
            </div>
          </section>

          <div className="idx-ad-slot">إعلان</div>
        </main>

        <footer className="idx-footer" dir="rtl">
          <p className="idx-footer-text">هذه الحاسبة للاستئناس فقط ولا تغني عن استشارة محامٍ مختص</p>
        </footer>

      </div>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --idx-green-950: oklch(0.20 0.07 155);
          --idx-green-900: oklch(0.26 0.09 155);
          --idx-green-800: oklch(0.32 0.10 155);
          --idx-green-700: oklch(0.40 0.11 155);
          --idx-green-600: oklch(0.50 0.13 155);
          --idx-green-400: oklch(0.65 0.14 155);
          --idx-green-200: oklch(0.88 0.07 155);
          --idx-green-100: oklch(0.95 0.03 155);
          --idx-green-50:  oklch(0.98 0.015 155);
          --idx-gold:      oklch(0.72 0.12 75);
          --idx-gold-dark: oklch(0.58 0.12 75);
          --idx-bg:        oklch(0.975 0.008 90);
          --idx-surface:   #ffffff;
          --idx-border:    oklch(0.91 0.02 155);
          --idx-text-dark: oklch(0.18 0.04 155);
          --idx-text-mid:  oklch(0.45 0.04 155);
          --idx-text-soft: oklch(0.62 0.03 155);
          --idx-radius:    20px;
          --idx-shadow:    0 2px 12px oklch(0.20 0.07 155 / 0.08), 0 1px 3px oklch(0.20 0.07 155 / 0.06);
          --idx-shadow-hover: 0 16px 40px oklch(0.20 0.07 155 / 0.18), 0 4px 12px oklch(0.20 0.07 155 / 0.10);
          --idx-transition: 0.28s cubic-bezier(0.34, 1.2, 0.64, 1);
        }

        body {
          font-family: 'Cairo', 'Noto Kufi Arabic', system-ui, sans-serif;
          background: var(--idx-bg);
          color: var(--idx-text-dark);
          -webkit-font-smoothing: antialiased;
        }

        /* HERO */
        .idx-hero {
          position: relative;
          min-height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 80px 24px 60px;
          overflow: hidden;
          background: var(--idx-green-950);
        }
        .idx-hero-pattern {
          position: absolute;
          inset: 0;
          opacity: 0.06;
          background-image:
            repeating-linear-gradient(0deg, transparent, transparent 39px, oklch(1 0 0 / 0.5) 39px, oklch(1 0 0 / 0.5) 40px),
            repeating-linear-gradient(90deg, transparent, transparent 39px, oklch(1 0 0 / 0.5) 39px, oklch(1 0 0 / 0.5) 40px);
        }
        .idx-hero-glow {
          position: absolute;
          width: 600px; height: 400px;
          background: radial-gradient(ellipse, oklch(0.50 0.13 155 / 0.25) 0%, transparent 70%);
          top: -60px; left: 50%; transform: translateX(-50%);
          pointer-events: none;
        }
        .idx-hero-content {
          position: relative;
          z-index: 2;
          max-width: 680px;
        }
        .idx-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: oklch(1 0 0 / 0.07);
          border: 1px solid oklch(1 0 0 / 0.15);
          border-radius: 100px;
          padding: 6px 16px;
          font-size: 12px;
          font-weight: 600;
          color: var(--idx-gold);
          margin-bottom: 24px;
        }
        .idx-hero-badge-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--idx-gold);
          animation: idx-pulse 2s ease-in-out infinite;
        }
        @keyframes idx-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.7); }
        }
        .idx-hero-title {
          font-size: clamp(30px, 5vw, 48px);
          font-weight: 900;
          color: #fff;
          line-height: 1.25;
          margin-bottom: 16px;
        }
        .idx-hero-accent {
          font-style: normal;
          color: var(--idx-gold);
        }
        .idx-hero-sub {
          font-size: clamp(14px, 2vw, 16px);
          color: oklch(1 0 0 / 0.65);
          line-height: 1.8;
          max-width: 500px;
          margin: 0 auto;
        }
        .idx-hero-scroll {
          position: absolute;
          bottom: 20px; left: 50%; transform: translateX(-50%);
          display: flex; flex-direction: column; align-items: center; gap: 5px;
          opacity: 0.35;
          animation: idx-bounce 2.5s ease-in-out infinite;
        }
        .idx-hero-scroll-line { width: 1px; height: 24px; background: #fff; }
        .idx-hero-scroll-dot { width: 4px; height: 4px; border-radius: 50%; background: #fff; }
        @keyframes idx-bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(5px); }
        }

        /* MAIN */
        .idx-main {
          max-width: 1100px;
          margin: 0 auto;
          padding: 56px 24px 80px;
        }

        /* AD SLOT */
        .idx-ad-slot {
          background: var(--idx-green-100);
          border: 1.5px dashed var(--idx-green-200);
          border-radius: 10px;
          text-align: center;
          padding: 18px;
          font-size: 12px;
          font-weight: 600;
          color: var(--idx-green-700);
          letter-spacing: 0.08em;
          margin-bottom: 48px;
        }

        /* SECTION HEADER */
        .idx-section-header {
          text-align: center;
          margin-bottom: 36px;
        }
        .idx-eyebrow {
          font-size: 12px;
          font-weight: 700;
          color: var(--idx-green-700);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .idx-section-title {
          font-size: clamp(20px, 3vw, 28px);
          font-weight: 800;
          color: var(--idx-text-dark);
          line-height: 1.3;
        }

        /* CARDS */
        .idx-cards-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-bottom: 64px;
        }
        @media (max-width: 680px) {
          .idx-cards-grid { grid-template-columns: 1fr; }
        }
        .idx-card {
          background: var(--idx-surface);
          border: 1.5px solid var(--idx-border);
          border-radius: var(--idx-radius);
          padding: 28px 24px 24px;
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
          gap: 10px;
          box-shadow: var(--idx-shadow);
          transition: transform var(--idx-transition), box-shadow var(--idx-transition), border-color var(--idx-transition);
          position: relative;
          overflow: hidden;
        }
        .idx-card::before {
          content: '';
          position: absolute;
          top: 0; right: 0; left: 0;
          height: 3px;
          background: var(--card-accent-color, var(--idx-green-600));
          opacity: 0;
          transition: opacity 0.25s;
        }
        .idx-card:hover { transform: translateY(-5px); box-shadow: var(--idx-shadow-hover); }
        .idx-card:hover::before { opacity: 1; }

        .idx-card-labor    { --card-accent-color: oklch(0.50 0.13 155); }
        .idx-card-victim   { --card-accent-color: oklch(0.52 0.14 290); }
        .idx-card-heirs    { --card-accent-color: oklch(0.62 0.13 55); }
        .idx-card-workacci { --card-accent-color: oklch(0.60 0.14 35); }

        .idx-card-law-tag {
          display: inline-flex;
          padding: 3px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          width: fit-content;
        }
        .idx-card-labor    .idx-card-law-tag { background: oklch(0.95 0.04 155); color: oklch(0.36 0.12 155); }
        .idx-card-victim   .idx-card-law-tag { background: oklch(0.94 0.04 290); color: oklch(0.36 0.12 290); }
        .idx-card-heirs    .idx-card-law-tag { background: oklch(0.95 0.05 55);  color: oklch(0.40 0.12 55); }
        .idx-card-workacci .idx-card-law-tag { background: oklch(0.95 0.05 35);  color: oklch(0.40 0.12 35); }

        .idx-card-icon-wrap {
          width: 52px; height: 52px;
          border-radius: 13px;
          display: flex; align-items: center; justify-content: center;
        }
        .idx-card-labor    .idx-card-icon-wrap { background: oklch(0.95 0.04 155); }
        .idx-card-victim   .idx-card-icon-wrap { background: oklch(0.94 0.04 290); }
        .idx-card-heirs    .idx-card-icon-wrap { background: oklch(0.95 0.05 55); }
        .idx-card-workacci .idx-card-icon-wrap { background: oklch(0.95 0.05 35); }

        .idx-card-title {
          font-size: 18px;
          font-weight: 800;
          color: var(--idx-text-dark);
          line-height: 1.3;
        }
        .idx-card-desc {
          font-size: 13px;
          color: var(--idx-text-mid);
          line-height: 1.85;
          flex: 1;
        }
        .idx-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 14px;
          border-top: 1px solid var(--idx-border);
          margin-top: 4px;
        }
        .idx-card-cta {
          font-size: 14px;
          font-weight: 700;
          color: var(--card-accent-color, var(--idx-green-700));
        }
        .idx-card-arrow {
          width: 32px; height: 32px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          transition: background var(--idx-transition), transform var(--idx-transition);
        }
        .idx-card-labor    .idx-card-arrow { background: oklch(0.95 0.04 155); }
        .idx-card-victim   .idx-card-arrow { background: oklch(0.94 0.04 290); }
        .idx-card-heirs    .idx-card-arrow { background: oklch(0.95 0.05 55); }
        .idx-card-workacci .idx-card-arrow { background: oklch(0.95 0.05 35); }
        .idx-card:hover .idx-card-arrow {
          background: var(--card-accent-color, var(--idx-green-600));
          transform: translateX(-3px);
        }
        .idx-card:hover .idx-card-arrow svg { stroke: #fff !important; }

        /* DIVIDER */
        .idx-divider {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 56px;
        }
        .idx-divider-line {
          flex: 1;
          height: 1px;
          background: var(--idx-border);
        }
        .idx-divider-diamond {
          width: 8px; height: 8px;
          background: var(--idx-gold-dark);
          transform: rotate(45deg);
          flex-shrink: 0;
        }

        /* HOW IT WORKS */
        .idx-how-section { margin-bottom: 64px; }
        .idx-how-steps {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          position: relative;
        }
        @media (max-width: 680px) {
          .idx-how-steps { grid-template-columns: 1fr; }
          .idx-how-connector { display: none; }
        }
        .idx-how-connector {
          position: absolute;
          top: 38px;
          right: 33.3%; left: 33.3%;
          height: 1px;
          background: linear-gradient(90deg, var(--idx-border), var(--idx-green-400), var(--idx-border));
          pointer-events: none;
        }
        .idx-how-step {
          background: var(--idx-surface);
          border: 1.5px solid var(--idx-border);
          border-radius: var(--idx-radius);
          padding: 28px 20px;
          display: flex; flex-direction: column; align-items: center;
          text-align: center; gap: 12px;
          transition: transform var(--idx-transition), box-shadow var(--idx-transition);
        }
        .idx-how-step:hover { transform: translateY(-4px); box-shadow: var(--idx-shadow-hover); }
        .idx-how-step-num {
          width: 50px; height: 50px;
          border-radius: 50%;
          background: var(--idx-green-900);
          color: #fff;
          font-size: 22px; font-weight: 900;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 0 6px var(--idx-green-100);
          position: relative; z-index: 1;
        }
        .idx-how-step-title { font-size: 15px; font-weight: 800; color: var(--idx-text-dark); }
        .idx-how-step-desc { font-size: 13px; color: var(--idx-text-mid); line-height: 1.85; }

        /* FAQ */
        .idx-faq-section { margin-bottom: 64px; }
        .idx-faq-list {
          display: flex; flex-direction: column; gap: 10px;
          max-width: 780px; margin: 0 auto;
        }
        .idx-faq-item {
          background: var(--idx-surface);
          border: 1.5px solid var(--idx-border);
          border-radius: var(--idx-radius);
          overflow: hidden;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .idx-faq-item[open] {
          border-color: var(--idx-green-400);
          box-shadow: 0 4px 20px oklch(0.50 0.13 155 / 0.10);
        }
        .idx-faq-q {
          padding: 18px 22px;
          font-size: 15px; font-weight: 700;
          color: var(--idx-text-dark);
          cursor: pointer;
          list-style: none;
          display: flex; align-items: center;
          justify-content: space-between; gap: 16px;
          user-select: none;
        }
        .idx-faq-q::-webkit-details-marker { display: none; }
        .idx-faq-icon {
          width: 28px; height: 28px;
          border-radius: 50%;
          background: var(--idx-green-100);
          border: 1.5px solid var(--idx-border);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          transition: background 0.2s, border-color 0.2s;
          color: var(--idx-green-800);
        }
        .idx-faq-icon svg { transition: transform 0.25s; }
        .idx-faq-item[open] .idx-faq-icon {
          background: var(--idx-green-900);
          border-color: var(--idx-green-900);
          color: #fff;
        }
        .idx-faq-item[open] .idx-faq-icon svg { transform: rotate(45deg); }
        .idx-faq-a {
          padding: 0 22px 18px;
          font-size: 14px; color: var(--idx-text-mid); line-height: 1.85;
          border-top: 1px solid var(--idx-border);
          padding-top: 14px;
        }

        /* FOOTER */
        .idx-footer {
          background: var(--idx-green-950);
          border-top: 1px solid oklch(1 0 0 / 0.06);
          padding: 24px;
          text-align: center;
        }
        .idx-footer-text {
          font-size: 13px;
          color: oklch(1 0 0 / 0.45);
        }
      `}</style>
    </>
  );
}
