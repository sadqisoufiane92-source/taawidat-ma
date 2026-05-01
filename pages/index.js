import Head from 'next/head';
import Link from 'next/link';
import SiteNav from '../components/SiteNav';

export default function Home() {
  return (
    <>
      <Head>
        <title>حاسبة التعويضات القانونية</title>
        <style>{`
/* HOW IT WORKS */
.how-section {
  max-width: 900px;
  margin: 48px auto 0;
  padding: 0 24px;
  text-align: center;
}
.how-title {
  font-family: 'Cairo', system-ui, sans-serif;
  font-size: clamp(22px, 4vw, 30px);
  font-weight: 800;
  color: #1B4332;
  margin-bottom: 10px;
}
.how-sub {
  font-size: 15px;
  color: #555;
  margin-bottom: 36px;
}
.how-steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
@media (max-width: 700px) {
  .how-steps { grid-template-columns: 1fr; }
}
.how-step {
  background: #fff;
  border: 1.5px solid #e2e8e0;
  border-radius: 16px;
  padding: 28px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.how-step-num {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #1B4332;
  color: #fff;
  font-family: 'Cairo', system-ui, sans-serif;
  font-size: 20px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}
.how-step-title {
  font-family: 'Cairo', system-ui, sans-serif;
  font-size: 16px;
  font-weight: 800;
  color: #1B4332;
}
.how-step-desc {
  font-size: 13px;
  color: #555;
  line-height: 1.8;
}

/* FAQ */
.faq-section {
  max-width: 800px;
  margin: 48px auto 48px;
  padding: 0 24px;
}
.faq-title {
  font-family: 'Cairo', system-ui, sans-serif;
  font-size: clamp(20px, 3.5vw, 26px);
  font-weight: 800;
  color: #1B4332;
  margin-bottom: 24px;
  text-align: center;
}
.faq-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.faq-item {
  background: #fff;
  border: 1.5px solid #e2e8e0;
  border-radius: 12px;
  overflow: hidden;
}
.faq-item[open] { border-color: #1B4332; }
.faq-q {
  padding: 16px 20px;
  font-family: 'Cairo', system-ui, sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: #1B4332;
  cursor: pointer;
  list-style: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.faq-q::-webkit-details-marker { display: none; }
.faq-q::after {
  content: '+';
  font-size: 20px;
  font-weight: 400;
  color: #1B4332;
  flex-shrink: 0;
  transition: transform .2s;
}
.faq-item[open] .faq-q::after { transform: rotate(45deg); }
.faq-a {
  padding: 12px 20px 16px;
  font-size: 14px;
  color: #444;
  line-height: 1.8;
  border-top: 1px solid #e2e8e0;
}
`}</style>
      </Head>

      <div lang="ar" dir="rtl" className="index-page">
        <SiteNav current="/" />
        {/* HEADER */}
        <header>
          <div className="header-inner">
            <span className="header-icon">⚖️</span>
            <h1 className="site-name">حاسبة <span>التعويضات</span> القانونية</h1>
            <p className="tagline">حساب التعويضات وفق القانون المغربي</p>
            <div className="header-divider">
              <div className="header-divider-diamond"></div>
            </div>
          </div>
        </header>

        {/* MAIN */}
        <main>
          <div className="ad-slot">إعلان</div>

          <p className="section-label">اختر نوع النزاع</p>

          <div className="cards-grid">

            {/* CARD 1 — Active */}
            <Link href="/labor" className="card active">
              <div className="card-header">
                <div className="card-icon"><svg width="32" height="32" viewBox="0 0 32 32" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="10" width="16" height="13" rx="1.5" stroke="#2D6A4F" fill="#B7E4C7"/><path d="M12 10V8a4 4 0 0 1 8 0v2" stroke="#2D6A4F"/><line x1="12" y1="15" x2="20" y2="15" stroke="#40916C"/><line x1="12" y1="18" x2="17" y2="18" stroke="#40916C"/></svg></div>
              </div>
              <div className="card-title">نزاعات الشغل</div>
              <div className="card-law">مدونة الشغل المغربية</div>
              <p className="card-desc">احسب تعويضات الفصل التعسفي، الإخطار، الفصل التأديبي، العطل السنوية ومنحة الأقدمية وفق مدونة الشغل المغربية</p>
              <div className="card-footer">
                <span className="card-cta">ابدأ الحساب</span>
                <span className="card-arrow">←</span>
              </div>
            </Link>

            {/* CARD 2 — Active */}
            <Link href="/avp-victime" className="card active">
              <div className="card-header">
                <div className="card-icon"><svg width="32" height="32" viewBox="0 0 32 32" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="13" cy="9" r="4" stroke="#7B5EA7" fill="#E9D8FD"/><path d="M5 27c0-4 3.134-7 8-7" stroke="#7B5EA7"/><circle cx="22" cy="17" r="5" stroke="#C44B4B" fill="#FED7D7"/><line x1="22" y1="14" x2="22" y2="20" stroke="#C44B4B"/><line x1="19" y1="17" x2="25" y2="17" stroke="#C44B4B"/></svg></div>
              </div>
              <div className="card-title">حوادث السير · الضحية</div>
              <div className="card-law">قانون 70.24</div>
              <p className="card-desc">تقدير التعويض المستحق للضحية المباشرة عن العجز الجزئي أو الكلي وفق القانون 70.24 الصادر في يناير 2026</p>
              <div className="card-footer">
                <span className="card-cta">ابدأ الحساب</span>
                <span className="card-arrow">←</span>
              </div>
            </Link>

            {/* CARD 3 — Active */}
            <Link href="/avp-ayants-droit" className="card active">
              <div className="card-header">
                <div className="card-icon"><svg width="32" height="32" viewBox="0 0 32 32" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="16" cy="8" r="3.5" stroke="#B45309" fill="#FDE68A"/><path d="M9 23c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="#B45309"/><circle cx="6" cy="11" r="2.5" stroke="#C9A84C" fill="#FEF3C7"/><path d="M2 23c0-2.761 1.79-4.5 4-4.5" stroke="#C9A84C"/><circle cx="26" cy="11" r="2.5" stroke="#C9A84C" fill="#FEF3C7"/><path d="M30 23c0-2.761-1.79-4.5-4-4.5" stroke="#C9A84C"/></svg></div>
              </div>
              <div className="card-title">حوادث السير · ذوو الحقوق</div>
              <div className="card-law">قانون 70.24</div>
              <p className="card-desc">احتساب حق الورثة والمعالين في التعويض عن وفاة الضحية في حادثة سير وفق القانون 70.24</p>
              <div className="card-footer">
                <span className="card-cta">ابدأ الحساب</span>
                <span className="card-arrow">←</span>
              </div>
            </Link>

            {/* CARD 4 — Active */}
            <Link href="/travail" className="card active">
              <div className="card-header">
                <div className="card-icon"><svg width="32" height="32" viewBox="0 0 32 32" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 17c0-5.523 4.477-10 10-10s10 4.477 10 10" stroke="#B45309" fill="#FDE68A"/><rect x="4" y="17" width="24" height="4" rx="1" stroke="#92400E" fill="#F59E0B"/><line x1="10" y1="21" x2="10" y2="27" stroke="#92400E"/><line x1="22" y1="21" x2="22" y2="27" stroke="#92400E"/><line x1="7" y1="27" x2="25" y2="27" stroke="#92400E"/><line x1="16" y1="10" x2="16" y2="14" stroke="#92400E"/></svg></div>
              </div>
              <div className="card-title">حوادث الشغل</div>
              <div className="card-law">ظهير 1927</div>
              <p className="card-desc">تعويضات إصابات العمل والأمراض المهنية وفق ظهير 1927 المعدل، شاملاً العجز المؤقت والدائم والوفاة</p>
              <div className="card-footer">
                <span className="card-cta">ابدأ الحساب</span>
                <span className="card-arrow">←</span>
              </div>
            </Link>

          </div>

          {/* HOW IT WORKS */}
          <section className="how-section">
            <h2 className="how-title">كيف تعمل الحاسبة؟</h2>
            <p className="how-sub">ثلاث خطوات بسيطة للحصول على تقدير دقيق للتعويض المستحق</p>
            <div className="how-steps">
              <div className="how-step">
                <div className="how-step-num">١</div>
                <h3 className="how-step-title">اختر نوع النزاع</h3>
                <p className="how-step-desc">حدد ما إذا كان النزاع يتعلق بنزاعات الشغل، حوادث الشغل، أو حوادث السير.</p>
              </div>
              <div className="how-step">
                <div className="how-step-num">٢</div>
                <h3 className="how-step-title">أدخل المعطيات</h3>
                <p className="how-step-desc">أدخل البيانات المطلوبة كالراتب والتواريخ ونسب العجز وفق المعطيات المتوفرة لديك.</p>
              </div>
              <div className="how-step">
                <div className="how-step-num">٣</div>
                <h3 className="how-step-title">احصل على النتيجة</h3>
                <p className="how-step-desc">تعرض الحاسبة تفصيلاً دقيقاً للمبالغ المستحقة مع المعادلات القانونية المعتمدة.</p>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="faq-section">
            <h2 className="faq-title">أسئلة متكررة</h2>
            <div className="faq-list">
              <details className="faq-item">
                <summary className="faq-q">هل نتائج الحاسبة ملزمة قانونياً؟</summary>
                <p className="faq-a">لا. الحاسبة أداة استرشادية تعتمد على النصوص القانونية المعمول بها. القرار النهائي في تحديد التعويض يبقى من اختصاص المحكمة المختصة.</p>
              </details>
              <details className="faq-item">
                <summary className="faq-q">ما هي القوانين التي تستند إليها الحاسبة؟</summary>
                <p className="faq-a">تستند الحاسبة إلى مدونة الشغل المغربية لنزاعات الشغل، وظهير 1927 لحوادث الشغل، والقانون 70.24 الصادر في يناير 2026 لحوادث السير.</p>
              </details>
              <details className="faq-item">
                <summary className="faq-q">هل يتم حفظ البيانات التي أدخلها؟</summary>
                <p className="faq-a">لا. جميع البيانات المدخلة تُعالج مباشرة في المتصفح ولا يتم حفظها أو إرسالها إلى أي خادم خارجي.</p>
              </details>
              <details className="faq-item">
                <summary className="faq-q">هل الحاسبة مجانية؟</summary>
                <p className="faq-a">نعم. الحاسبة مجانية بالكامل وتتوفر للجميع دون قيود.</p>
              </details>
              <details className="faq-item">
                <summary className="faq-q">هل يمكنني استخدام النتائج أمام المحكمة؟</summary>
                <p className="faq-a">يمكن الاستعانة بالنتائج كمرجع استرشادي لتقدير المبالغ، لكن يُنصح دائماً باستشارة محامٍ مختص قبل اتخاذ أي إجراء قانوني.</p>
              </details>
            </div>
          </section>

          <div className="ad-slot">إعلان</div>
        </main>

        {/* FOOTER */}
        <footer>
          <p className="footer-text">هذه الحاسبة للاستئناس فقط ولا تغني عن استشارة محامٍ مختص</p>
        </footer>
      </div>
    </>
  );
}
