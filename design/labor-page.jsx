/* global React */
const { useState, useMemo, useEffect, useRef } = React;

const CALCULATIONS = [
  {
    key: "prejudice",
    label: "تعويض الضرر",
    description: "تعويض عن الضرر اللاحق بالعامل بسبب الفصل التعسفي.",
    article: "المادة 41 من مدونة الشغل",
  },
  {
    key: "preavis",
    label: "تعويض الإخطار",
    description: "تعويض مهلة الإشعار قبل إنهاء العقد.",
    article: "المواد 43-46 من مدونة الشغل",
  },
  {
    key: "indemnite",
    label: "تعويض الفصل التعسفي",
    description: "تعويض قانوني محسوب بالساعات حسب الأقدمية.",
    article: "المادة 53 من مدونة الشغل",
  },
  {
    key: "conges",
    label: "عطل سنوية",
    description: "تعويض عن العطلة السنوية المؤدى عنها وغير المستحقة.",
    article: "المواد 231-263 من مدونة الشغل",
  },
  {
    key: "prime",
    label: "منحة الأقدمية",
    description: "منحة تتراكم حسب سنوات الخدمة بنسب متدرجة.",
    article: "المادة 350 من مدونة الشغل",
  },
];

const CATEGORY_MAP = { "إطار": "cadre", "موظف": "employe", "عامل": "ouvrier" };

function formatMoney(value) {
  return `${Number(value || 0).toLocaleString("fr-MA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} درهم`;
}
function formatNumber(value) {
  return Number(value || 0).toLocaleString("fr-MA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
function yearsLabel(years) {
  const n = Number(years || 0);
  if (n === 1) return "سنة";
  if (n === 2) return "سنتان";
  return "سنوات";
}
function amountFor(key, result) {
  if (!result) return 0;
  if (key === "prejudice") return result.result;
  if (key === "preavis") return result.indemnity;
  if (key === "indemnite") return result.indemnity;
  if (key === "conges") return result.indemnityFull;
  if (key === "prime") return result.totalAccumulated;
  return 0;
}
function preavisYearsLabel(completedYears) {
  if (completedYears < 1) return "أقل من سنة";
  if (completedYears < 5) return "من 1 إلى 5 سنوات";
  return "أكثر من 5 سنوات";
}

/* ---------------- Icons (simple, original line-style) ---------------- */
function Icon({ name, size = 20 }) {
  const stroke = "currentColor";
  const sw = 1.6;
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke,
    strokeWidth: sw,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };
  switch (name) {
    case "scale":
      return (
        <svg {...props}>
          <path d="M12 4v16" />
          <path d="M6 20h12" />
          <path d="M5 8h14" />
          <path d="M5 8l-2.5 6a3.5 3.5 0 0 0 5 0L5 8z" />
          <path d="M19 8l-2.5 6a3.5 3.5 0 0 0 5 0L19 8z" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...props}>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 10h18" />
          <path d="M8 3v4M16 3v4" />
        </svg>
      );
    case "wallet":
      return (
        <svg {...props}>
          <path d="M3 7a2 2 0 0 1 2-2h12l4 4v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
          <path d="M16 13h3" />
        </svg>
      );
    case "user":
      return (
        <svg {...props}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 20c1-3.5 4-5 7-5s6 1.5 7 5" />
        </svg>
      );
    case "check":
      return (
        <svg {...props}>
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      );
    case "doc":
      return (
        <svg {...props}>
          <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
          <path d="M14 3v5h5" />
          <path d="M9 13h6M9 17h6" />
        </svg>
      );
    case "shield":
      return (
        <svg {...props}>
          <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    case "info":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v5" />
          <circle cx="12" cy="8" r="0.6" fill="currentColor" />
        </svg>
      );
    case "alert":
      return (
        <svg {...props}>
          <path d="M12 3l10 18H2L12 3z" />
          <path d="M12 10v5" />
          <circle cx="12" cy="18" r="0.6" fill="currentColor" />
        </svg>
      );
    case "sparkle":
      return (
        <svg {...props}>
          <path d="M12 4v6M12 14v6M4 12h6M14 12h6" />
        </svg>
      );
    case "arrow":
      return (
        <svg {...props}>
          <path d="M14 5l-7 7 7 7" />
        </svg>
      );
    case "ledger":
      return (
        <svg {...props}>
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <path d="M8 7h8M8 11h8M8 15h5" />
        </svg>
      );
    default:
      return null;
  }
}

/* ---------------- Field primitives ---------------- */

function Field({ label, icon, children, error, hint }) {
  return (
    <label className="field">
      <span className="field-label">
        {icon && <Icon name={icon} size={16} />}
        <span>{label}</span>
      </span>
      {children}
      {hint && !error && <span className="field-hint">{hint}</span>}
      {error && (
        <span className="field-error" role="alert">
          <Icon name="alert" size={14} />
          {error}
        </span>
      )}
    </label>
  );
}

function NumberInput({ value, onChange, placeholder, suffix }) {
  return (
    <span className="input-wrap">
      <input
        type="number"
        inputMode="decimal"
        min="1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input"
      />
      {suffix && <span className="input-suffix">{suffix}</span>}
    </span>
  );
}

function DateInput({ value, onChange }) {
  return (
    <span className="input-wrap">
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input input-date"
      />
    </span>
  );
}

function CategorySegmented({ value, onChange }) {
  const options = ["إطار", "موظف", "عامل"];
  return (
    <div className="segmented" role="radiogroup" aria-label="الفئة المهنية">
      {options.map((opt) => (
        <button
          type="button"
          key={opt}
          role="radio"
          aria-checked={value === opt}
          className={`segment ${value === opt ? "is-active" : ""}`}
          onClick={() => onChange(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function ToggleRow({ checked, onChange, label, description }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`toggle-row ${checked ? "is-on" : ""}`}
      aria-pressed={checked}
    >
      <span className="toggle-text">
        <span className="toggle-label">{label}</span>
        {description && <span className="toggle-desc">{description}</span>}
      </span>
      <span className="toggle-track" aria-hidden="true">
        <span className="toggle-knob" />
      </span>
    </button>
  );
}

/* ---------------- Compensation card (selectable) ---------------- */

function CompensationCard({ item, selected, onToggle }) {
  return (
    <button
      type="button"
      onClick={() => onToggle(item.key)}
      aria-pressed={selected}
      className={`comp-card ${selected ? "is-selected" : ""}`}
    >
      <span className="comp-card-checkmark" aria-hidden="true">
        {selected && <Icon name="check" size={14} />}
      </span>
      <span className="comp-card-body">
        <span className="comp-card-title">{item.label}</span>
        <span className="comp-card-desc">{item.description}</span>
        <span className="comp-card-article">{item.article}</span>
      </span>
    </button>
  );
}

/* ---------------- Result cards ---------------- */

function ResultRow({ children, emphasis }) {
  return <p className={`result-row ${emphasis ? "is-emph" : ""}`}>{children}</p>;
}

function ResultHeader({ index, label, amount }) {
  return (
    <div className="result-head">
      <div className="result-head-left">
        <span className="result-index">{String(index + 1).padStart(2, "0")}</span>
        <h3 className="result-title">{label}</h3>
      </div>
      <div className="result-amount-wrap">
        <span className="result-amount-label">المبلغ المستحق</span>
        <span className="result-amount">{formatMoney(amount)}</span>
      </div>
    </div>
  );
}

function PrejudiceCard({ result, monthlySalary, index, label }) {
  return (
    <article className="result-card">
      <ResultHeader index={index} label={label} amount={result.result} />
      <div className="result-body">
        <ResultRow>
          <span className="row-key">الأجر الشهري</span>
          <span className="row-val">{formatMoney(result.monthlySalary)}</span>
        </ResultRow>
        <ResultRow>
          <span className="row-key">الأشهر المستحقة</span>
          <span className="row-val">
            {formatNumber(result.completedYears)} × {formatNumber(1.5)} = {formatNumber(result.months)} شهر
          </span>
        </ResultRow>
        <ResultRow>
          <span className="row-key">سقف 36 شهراً</span>
          <span className="row-val">
            {result.capped ? (
              <span className="badge badge-warn">تم التحديد في 36 شهراً</span>
            ) : (
              <span className="badge badge-ok">لم يتجاوز السقف</span>
            )}
          </span>
        </ResultRow>
        <ResultRow emphasis>
          <span className="row-key">المعادلة النهائية</span>
          <span className="row-val">
            {formatNumber(result.monthsUsed)} × {formatNumber(result.monthlySalary)} ={" "}
            <strong>{formatMoney(result.result)}</strong>
          </span>
        </ResultRow>
      </div>
    </article>
  );
}

function PreavisCard({ result, index, label }) {
  return (
    <article className="result-card">
      <ResultHeader index={index} label={label} amount={result.indemnity} />
      <div className="result-body">
        <ResultRow>
          <span className="row-key">الأجر الشهري</span>
          <span className="row-val">{formatMoney(result.monthlySalary)}</span>
        </ResultRow>
        <ResultRow>
          <span className="row-key">مدة الأقدمية</span>
          <span className="row-val">{preavisYearsLabel(result.completedYears)}</span>
        </ResultRow>
        <ResultRow>
          <span className="row-key">مهلة الإخطار</span>
          <span className="row-val">
            {result.noticeDays} يوماً ({formatNumber(result.noticeDays / 30)} شهر)
          </span>
        </ResultRow>
        <ResultRow emphasis>
          <span className="row-key">المعادلة النهائية</span>
          <span className="row-val">
            {formatNumber(result.noticeDays / 30)} × {formatNumber(result.monthlySalary)} ={" "}
            <strong>{formatMoney(result.indemnity)}</strong>
          </span>
        </ResultRow>
      </div>
    </article>
  );
}

function IndemniteCard({ result, monthlySalary, index, label }) {
  const b = result.brackets || {};
  return (
    <article className="result-card">
      <ResultHeader index={index} label={label} amount={result.indemnity} />
      <div className="result-body">
        <ResultRow>
          <span className="row-key">الأجر الساعي</span>
          <span className="row-val">
            {formatNumber(monthlySalary)} ÷ 191 = {formatNumber(result.hourlyWage)} درهم/ساعة
          </span>
        </ResultRow>
        <div className="brackets">
          {b.years_1_5 > 0 && (
            <div className="bracket-row">
              <span>السنوات 1–5</span>
              <span>{formatNumber(b.years_1_5)} × 96 = {formatNumber(b.hours_1_5)} ساعة</span>
            </div>
          )}
          {b.years_6_10 > 0 && (
            <div className="bracket-row">
              <span>السنوات 6–10</span>
              <span>{formatNumber(b.years_6_10)} × 144 = {formatNumber(b.hours_6_10)} ساعة</span>
            </div>
          )}
          {b.years_11_15 > 0 && (
            <div className="bracket-row">
              <span>السنوات 11–15</span>
              <span>{formatNumber(b.years_11_15)} × 192 = {formatNumber(b.hours_11_15)} ساعة</span>
            </div>
          )}
          {b.years_15plus > 0 && (
            <div className="bracket-row">
              <span>أكثر من 15 سنة</span>
              <span>{formatNumber(b.years_15plus)} × 240 = {formatNumber(b.hours_15plus)} ساعة</span>
            </div>
          )}
        </div>
        <ResultRow>
          <span className="row-key">مجموع الساعات</span>
          <span className="row-val">{formatNumber(result.totalHours)} ساعة</span>
        </ResultRow>
        <ResultRow emphasis>
          <span className="row-key">المعادلة النهائية</span>
          <span className="row-val">
            {formatNumber(result.totalHours)} × {formatNumber(result.hourlyWage)} ={" "}
            <strong>{formatMoney(result.indemnity)}</strong>
          </span>
        </ResultRow>
      </div>
    </article>
  );
}

function CongesCard({ result, monthlySalary, index, label }) {
  return (
    <article className="result-card">
      <ResultHeader index={index} label={label} amount={result.indemnityFull} />
      <div className="result-body">
        <ResultRow>
          <span className="row-key">الأجر اليومي</span>
          <span className="row-val">
            {formatNumber(monthlySalary)} ÷ 26 = {formatNumber(result.dailyRate)} درهم/يوم
          </span>
        </ResultRow>
        <div className="brackets">
          {(result.brackets || []).map((b, i) => (
            <div key={i} className="bracket-row">
              <span>{b.label}</span>
              <span>
                {formatNumber(b.years)} × {formatNumber(b.daysPerYear)} = {formatNumber(b.days)} يوم
              </span>
            </div>
          ))}
        </div>
        <ResultRow>
          <span className="row-key">مجموع الأيام</span>
          <span className="row-val">{formatNumber(result.totalDays)} يوم</span>
        </ResultRow>
        <ResultRow emphasis>
          <span className="row-key">المعادلة النهائية</span>
          <span className="row-val">
            {formatNumber(result.totalDays)} × {formatNumber(result.dailyRate)} ={" "}
            <strong>{formatMoney(result.indemnityFull)}</strong>
          </span>
        </ResultRow>
      </div>
    </article>
  );
}

function PrimeCard({ result, index, label }) {
  return (
    <article className="result-card">
      <ResultHeader index={index} label={label} amount={result.totalAccumulated} />
      <div className="result-body">
        <ResultRow>
          <span className="row-key">الأجر السنوي المعتمد</span>
          <span className="row-val">{formatMoney(result.annualSalary)}</span>
        </ResultRow>
        <div className="phases">
          {(result.phases || []).map((phase, i) => {
            const previous = i > 0 ? result.phases[i - 1].phaseBonus : 0;
            const endLabel = Number.isFinite(phase.end) ? phase.end : "ما فوق";
            return (
              <div key={phase.phaseNumber} className="phase">
                <div className="phase-head">
                  <span className="phase-num">المرحلة {phase.phaseNumber}</span>
                  <span className="phase-range">
                    السنوات {phase.start} إلى {endLabel} · النسبة {formatNumber(phase.rate * 100)}%
                  </span>
                </div>
                <div className="phase-body">
                  {i === 0 ? (
                    <p>
                      <span className="row-key">مبلغ الزيادة</span>
                      <span className="row-val">
                        {formatNumber(result.annualSalary)} × {formatNumber(phase.rate * 100)}% ={" "}
                        {formatMoney(phase.phaseBonus)}
                      </span>
                    </p>
                  ) : (
                    <>
                      <p>
                        <span className="row-key">أجر المرحلة</span>
                        <span className="row-val">
                          {formatNumber(result.annualSalary)} + {formatNumber(previous)} ={" "}
                          {formatMoney(phase.phaseBase)}
                        </span>
                      </p>
                      <p>
                        <span className="row-key">مبلغ الزيادة</span>
                        <span className="row-val">
                          {formatNumber(phase.phaseBase)} × {formatNumber(phase.rate * 100)}% ={" "}
                          {formatMoney(phase.phaseBonus)}
                        </span>
                      </p>
                    </>
                  )}
                  <p>
                    <span className="row-key">علاوة المرحلة</span>
                    <span className="row-val">
                      {formatNumber(phase.phaseBonus)} × {formatNumber(phase.yearsInPhase)} ={" "}
                      <strong>{formatMoney(phase.phaseContribution)}</strong>
                    </span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <ResultRow emphasis>
          <span className="row-key">المجموع</span>
          <span className="row-val">
            {(result.phases || []).map((p) => formatNumber(p.phaseContribution)).join(" + ")} ={" "}
            <strong>{formatMoney(result.totalAccumulated)}</strong>
          </span>
        </ResultRow>
        <ResultRow>
          <span className="row-key">المنحة الشهرية الحالية</span>
          <span className="row-val">{formatMoney(result.currentMonthlyBonus)}</span>
        </ResultRow>
      </div>
    </article>
  );
}

/* ---------------- Empty state ---------------- */

function EmptyResults() {
  return (
    <div className="empty-state">
      <div className="empty-illus" aria-hidden="true">
        <Icon name="ledger" size={36} />
      </div>
      <h3 className="empty-title">لم يتم احتساب أي تعويض بعد</h3>
      <p className="empty-text">
        أكمل إدخال بيانات الحساب على اليمين، اختر التعويضات المطلوبة، ثم اضغط
        «احتسب التعويضات» لعرض النتائج التفصيلية هنا.
      </p>
      <ul className="empty-checklist">
        <li><Icon name="check" size={14} /> حساب دقيق طبقاً لمدونة الشغل المغربية</li>
        <li><Icon name="check" size={14} /> تفصيل المعادلات والمراحل لكل تعويض</li>
        <li><Icon name="check" size={14} /> مجموع كلي لكل التعويضات المختارة</li>
      </ul>
    </div>
  );
}

/* ---------------- Ad slot (subtle) ---------------- */

function AdSlot({ position }) {
  return (
    <aside className={`ad-slot ad-${position}`} aria-label="مساحة إعلانية">
      <div className="ad-tag">إعلان</div>
      <div className="ad-body">
        <span>مساحة إعلانية {position === "top" ? "علوية" : "سفلية"}</span>
        <span className="ad-meta">728 × 90</span>
      </div>
    </aside>
  );
}

/* ---------------- Main page ---------------- */

function LaborPage() {
  const [form, setForm] = useState({
    monthlySalary: "",
    startDate: "",
    endDate: "",
    category: "موظف",
    isMinor: false,
    selected: [],
  });
  const [errors, setErrors] = useState({});
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const resultsRef = useRef(null);

  const total = useMemo(() => {
    if (!results) return 0;
    return form.selected.reduce(
      (sum, key) => sum + Number(amountFor(key, results.results[key]) || 0),
      0
    );
  }, [form.selected, results]);

  function updateField(name, value) {
    setForm((c) => ({ ...c, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }));
  }

  function toggleSelected(key) {
    setForm((c) => {
      const selected = c.selected.includes(key)
        ? c.selected.filter((k) => k !== key)
        : c.selected.concat(key);
      return { ...c, selected };
    });
    if (errors.selected) setErrors((e) => ({ ...e, selected: undefined }));
  }

  function validateForm() {
    const next = {};
    const salary = Number(form.monthlySalary);
    const start = form.startDate ? new Date(form.startDate) : null;
    const end = form.endDate ? new Date(form.endDate) : null;
    if (!salary || salary <= 0) next.monthlySalary = "يرجى إدخال راتب صحيح";
    if (!form.startDate) next.startDate = "يرجى إدخال تاريخ البداية";
    if (!form.endDate) next.endDate = "يرجى إدخال تاريخ النهاية";
    if (start && end && end <= start) next.endDate = "تاريخ النهاية يجب أن يكون بعد تاريخ البداية";
    if (form.selected.length === 0) next.selected = "يرجى اختيار تعويض واحد على الأقل";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError("");
    setResults(null);
    if (!validateForm()) return;
    setLoading(true);
    try {
      // Local computation (mirrors the API contract).
      await new Promise((r) => setTimeout(r, 450));
      const data = window.computeLabor({
        monthlySalary: Number(form.monthlySalary),
        startDate: form.startDate,
        endDate: form.endDate,
        category: CATEGORY_MAP[form.category],
        isMinor: form.isMinor,
        selected: form.selected,
      });
      setResults(data);
      // Smooth-scroll the results into view on small screens.
      setTimeout(() => {
        if (window.innerWidth < 960 && resultsRef.current) {
          window.scrollTo({
            top: resultsRef.current.getBoundingClientRect().top + window.scrollY - 16,
            behavior: "smooth",
          });
        }
      }, 60);
    } catch (err) {
      setApiError("حدث خطأ في الحساب — يرجى التحقق من المعطيات المدخلة");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setForm({
      monthlySalary: "",
      startDate: "",
      endDate: "",
      category: "موظف",
      isMinor: false,
      selected: [],
    });
    setErrors({});
    setResults(null);
    setApiError("");
  }

  const completedYears = results ? results.completedYears : null;

  return (
    <div className="page" dir="rtl">
      {/* Top bar */}
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true">
              <Icon name="scale" size={22} />
            </span>
            <div className="brand-text">
              <span className="brand-name">ميزان</span>
              <span className="brand-sub">حاسبة نزاعات الشغل</span>
            </div>
          </div>
          <nav className="topnav" aria-label="القائمة">
            <a href="#calculator">الحاسبة</a>
            <a href="#about">عن الأداة</a>
            <a href="#legal">المراجع القانونية</a>
          </nav>
          <a href="#contact" className="topcta">
            <Icon name="doc" size={16} />
            <span>طلب استشارة</span>
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="hero" id="about">
        <div className="hero-inner">
          <span className="hero-eyebrow">
            <Icon name="shield" size={14} />
            <span>أداة قانونية — مدونة الشغل المغربية</span>
          </span>
          <h1 className="hero-title">
            احتسب تعويضاتك المستحقة
            <br />
            <span className="hero-title-accent">بدقة قانونية وشفافية كاملة</span>
          </h1>
          <p className="hero-text">
            حاسبة احترافية لتعويضات نزاعات الشغل في المغرب: تعويض الفصل التعسفي،
            الإخطار، الضرر، العطل السنوية، ومنحة الأقدمية. كل النتائج مفصّلة
            بالمعادلات والمراجع القانونية.
          </p>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-num">5</span>
              <span className="stat-lbl">أنواع تعويض</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-num">100٪</span>
              <span className="stat-lbl">طبقاً للمدونة</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-num">0 د.م</span>
              <span className="stat-lbl">مجاني تماماً</span>
            </div>
          </div>
        </div>
        <div className="hero-pattern" aria-hidden="true">
          <div className="hero-tile" />
          <div className="hero-tile" />
          <div className="hero-tile" />
          <div className="hero-tile" />
        </div>
      </section>

      <div className="container">
        <AdSlot position="top" />

        <main className="grid" id="calculator">
          {/* FORM */}
          <form onSubmit={handleSubmit} noValidate className="panel form-panel">
            <header className="panel-head">
              <span className="panel-step">١</span>
              <div>
                <h2 className="panel-title">بيانات الحساب</h2>
                <p className="panel-sub">أدخل تفاصيل العقد لاحتساب التعويضات بدقة.</p>
              </div>
            </header>

            <div className="panel-body">
              <Field
                label="الراتب الشهري"
                icon="wallet"
                error={errors.monthlySalary}
                hint="أدخل آخر راتب شهري إجمالي قبل الاقتطاعات"
              >
                <NumberInput
                  value={form.monthlySalary}
                  onChange={(v) => updateField("monthlySalary", v)}
                  placeholder="0٫00"
                  suffix="درهم"
                />
              </Field>

              <div className="row-2">
                <Field label="تاريخ بداية العمل" icon="calendar" error={errors.startDate}>
                  <DateInput
                    value={form.startDate}
                    onChange={(v) => updateField("startDate", v)}
                  />
                </Field>
                <Field label="تاريخ نهاية العمل" icon="calendar" error={errors.endDate}>
                  <DateInput
                    value={form.endDate}
                    onChange={(v) => updateField("endDate", v)}
                  />
                </Field>
              </div>

              <Field label="الفئة المهنية" icon="user">
                <CategorySegmented
                  value={form.category}
                  onChange={(v) => updateField("category", v)}
                />
              </Field>

              <ToggleRow
                checked={form.isMinor}
                onChange={(v) => updateField("isMinor", v)}
                label="العامل قاصر"
                description="يُطبَّق احتساب أيام العطلة المضاعفة عند تفعيل هذا الخيار."
              />
            </div>

            <header className="panel-head panel-head-sub">
              <span className="panel-step">٢</span>
              <div>
                <h2 className="panel-title">التعويضات المطلوبة</h2>
                <p className="panel-sub">اختر تعويضاً واحداً أو أكثر لاحتسابه.</p>
              </div>
            </header>

            <div className="comp-grid">
              {CALCULATIONS.map((item) => (
                <CompensationCard
                  key={item.key}
                  item={item}
                  selected={form.selected.includes(item.key)}
                  onToggle={toggleSelected}
                />
              ))}
            </div>
            {errors.selected && (
              <p className="field-error" role="alert">
                <Icon name="alert" size={14} /> {errors.selected}
              </p>
            )}

            <footer className="panel-foot">
              <button type="button" className="btn-ghost" onClick={handleReset}>
                إعادة تعيين
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner" aria-hidden="true" />
                    جارٍ الحساب…
                  </>
                ) : (
                  <>
                    <Icon name="sparkle" size={16} />
                    احتسب التعويضات
                    <Icon name="arrow" size={16} />
                  </>
                )}
              </button>
            </footer>
          </form>

          {/* RESULTS */}
          <section className="panel results-panel" ref={resultsRef} aria-live="polite">
            <header className="panel-head">
              <span className="panel-step panel-step-accent">٣</span>
              <div>
                <h2 className="panel-title">النتائج</h2>
                <p className="panel-sub">
                  {results
                    ? `تم احتساب ${form.selected.length} تعويضات لمدة خدمة قدرها ${completedYears} ${yearsLabel(completedYears)}.`
                    : "ستظهر التعويضات المفصّلة هنا بعد إدخال بياناتك."}
                </p>
              </div>
            </header>

            <div className="panel-body results-body">
              {apiError && (
                <div className="alert alert-error" role="alert">
                  <Icon name="alert" size={18} />
                  <span>{apiError}</span>
                </div>
              )}

              {!results && !apiError && <EmptyResults />}

              {results &&
                form.selected.map((key, idx) => {
                  const item = CALCULATIONS.find((c) => c.key === key);
                  const result = results.results[key];
                  if (!item || !result) return null;
                  if (key === "prejudice")
                    return (
                      <PrejudiceCard
                        key={key}
                        index={idx}
                        label={item.label}
                        result={result}
                        monthlySalary={form.monthlySalary}
                      />
                    );
                  if (key === "preavis")
                    return <PreavisCard key={key} index={idx} label={item.label} result={result} />;
                  if (key === "indemnite")
                    return (
                      <IndemniteCard
                        key={key}
                        index={idx}
                        label={item.label}
                        result={result}
                        monthlySalary={Number(form.monthlySalary)}
                      />
                    );
                  if (key === "conges")
                    return (
                      <CongesCard
                        key={key}
                        index={idx}
                        label={item.label}
                        result={result}
                        monthlySalary={Number(form.monthlySalary)}
                      />
                    );
                  if (key === "prime")
                    return <PrimeCard key={key} index={idx} label={item.label} result={result} />;
                  return null;
                })}

              {results && (
                <div className="total-card">
                  <div className="total-pattern" aria-hidden="true" />
                  <div className="total-inner">
                    <div className="total-meta">
                      <span className="total-eyebrow">
                        <Icon name="scale" size={14} />
                        المجموع الكلي للتعويضات المستحقة
                      </span>
                      <span className="total-sub">
                        مجموع {form.selected.length} تعويضات · مدة الخدمة {completedYears}{" "}
                        {yearsLabel(completedYears)}
                      </span>
                    </div>
                    <div className="total-amount">
                      <span className="total-amount-num">
                        {Number(total).toLocaleString("fr-MA", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                      <span className="total-amount-curr">درهم</span>
                    </div>
                  </div>
                  <div className="total-disclaimer">
                    <Icon name="info" size={14} />
                    <span>
                      المبالغ تقديرية ومحسوبة وفق نصوص مدونة الشغل المغربية. القرار النهائي
                      يبقى من اختصاص المحكمة المختصة.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </section>
        </main>

        <AdSlot position="bottom" />

        <section className="legal-strip" id="legal">
          <div className="legal-item">
            <Icon name="doc" size={18} />
            <div>
              <h4>مدونة الشغل المغربية</h4>
              <p>الحسابات مستندة إلى نصوص مدونة الشغل والقرارات القضائية ذات الصلة.</p>
            </div>
          </div>
          <div className="legal-item">
            <Icon name="shield" size={18} />
            <div>
              <h4>سرية كاملة</h4>
              <p>لا يتم حفظ أو إرسال أي بيانات. الحساب يجري مباشرة في متصفحك.</p>
            </div>
          </div>
          <div className="legal-item">
            <Icon name="info" size={18} />
            <div>
              <h4>للاسترشاد فقط</h4>
              <p>الحاسبة أداة مساعدة ولا تُغني عن استشارة محامٍ مختص في النزاعات الاجتماعية.</p>
            </div>
          </div>
        </section>
      </div>

      <footer className="site-foot" id="contact">
        <div className="site-foot-inner">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true">
              <Icon name="scale" size={20} />
            </span>
            <div className="brand-text">
              <span className="brand-name">ميزان</span>
              <span className="brand-sub">حاسبة نزاعات الشغل</span>
            </div>
          </div>
          <p className="site-foot-text">
            © {new Date().getFullYear()} ميزان · جميع الحقوق محفوظة · أداة قانونية تعليمية
          </p>
        </div>
      </footer>
    </div>
  );
}

window.LaborPage = LaborPage;
