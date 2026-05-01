import Head from "next/head";
import { useState, useMemo, useRef } from "react";
import SiteNav from '../components/SiteNav';


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
            {formatMoney(Number(monthlySalary))} ÷ 191 = {formatNumber(result.hourlyWage)} درهم/ساعة
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
            {formatMoney(Number(monthlySalary))} ÷ 26 = {formatNumber(result.dailyRate)} درهم/يوم
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

export default function LaborPage() {
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
  const formRef = useRef(null);

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
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      let response;
      try {
        response = await fetch("/api/labor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
          monthlySalary: Number(form.monthlySalary),
          startDate: form.startDate,
          endDate: form.endDate,
          category: CATEGORY_MAP[form.category],
          isMinor: form.isMinor,
          selected: form.selected,
          }),
          signal: controller.signal
        });
      } finally {
        clearTimeout(timeoutId);
      }
      const data = await response.json();

      if (!response.ok) {
        setApiError((data.error && data.error.message) || "حدث خطأ في الحساب — يرجى المحاولة مجدداً");
        return;
      }

      if (!data.result) {
        setApiError("حدث خطأ في الحساب — يرجى المحاولة مجدداً");
        return;
      }

      setResults({ results: data.result.results, completedYears: data.result.yearsOfService });
      setTimeout(() => {
        if (window.innerWidth < 960 && resultsRef.current) {
          window.scrollTo({
            top: resultsRef.current.getBoundingClientRect().top + window.scrollY - 16,
            behavior: "smooth",
          });
        }
      }, 60);
    } catch (err) {
      if (err.name === "AbortError") {
        setApiError("انتهت مهلة الطلب — يرجى المحاولة مجدداً");
      } else {
        setApiError("تعذّر الاتصال بالخادم — يرجى التحقق من اتصالك بالإنترنت والمحاولة مجدداً");
      }
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
    <>
      <Head>
        <style>{`
    /* ═══════════════════════════════════════════════
       DESIGN TOKENS
    ═══════════════════════════════════════════════ */
    :root {
      /* Palette */
      --c-bg:          oklch(97% 0.008 80);      /* warm off-white */
      --c-surface:     oklch(99.5% 0.004 80);    /* card white */
      --c-surface-alt: oklch(96% 0.010 80);      /* subtle tint */
      --c-border:      oklch(88% 0.012 80);
      --c-border-strong: oklch(78% 0.020 80);

      --c-green-900:   oklch(26% 0.080 165);     /* deep header bg */
      --c-green-800:   oklch(31% 0.090 162);
      --c-green-700:   oklch(38% 0.100 160);
      --c-green-600:   oklch(45% 0.115 158);     /* primary */
      --c-green-500:   oklch(55% 0.120 155);
      --c-green-100:   oklch(94% 0.030 155);
      --c-green-50:    oklch(97% 0.018 155);

      --c-gold-600:    oklch(60% 0.120 75);      /* accent */
      --c-gold-500:    oklch(68% 0.130 75);
      --c-gold-200:    oklch(87% 0.060 80);
      --c-gold-50:     oklch(97% 0.025 80);

      --c-text-900:    oklch(18% 0.025 80);
      --c-text-700:    oklch(34% 0.030 80);
      --c-text-500:    oklch(55% 0.025 80);
      --c-text-400:    oklch(65% 0.020 80);

      --c-red-100:     oklch(94% 0.040 25);
      --c-red-600:     oklch(50% 0.160 25);

      /* Type */
      --f-head: 'Noto Kufi Arabic', system-ui, sans-serif;
      --f-body: 'Noto Naskh Arabic', system-ui, sans-serif;

      /* Sizing */
      --r-sm:  6px;
      --r-md:  10px;
      --r-lg:  14px;
      --r-xl:  20px;
      --r-2xl: 28px;

      --shadow-sm:  0 1px 3px oklch(0% 0 0 / .06), 0 1px 2px oklch(0% 0 0 / .04);
      --shadow-md:  0 4px 16px oklch(0% 0 0 / .08), 0 1px 4px oklch(0% 0 0 / .04);
      --shadow-lg:  0 12px 40px oklch(0% 0 0 / .12), 0 2px 8px oklch(0% 0 0 / .06);
    }

    /* ═══════════════════════════════════════════════
       RESET
    ═══════════════════════════════════════════════ */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body {
      font-family: var(--f-body);
      font-size: 15px;
      background: var(--c-bg);
      color: var(--c-text-900);
      line-height: 1.7;
      text-wrap: pretty;
      -webkit-font-smoothing: antialiased;
    }
    a { color: inherit; text-decoration: none; }
    button { font-family: inherit; cursor: pointer; border: none; background: none; }
    input, select { font-family: inherit; }
    svg { display: block; flex-shrink: 0; }

    /* ═══════════════════════════════════════════════
       LAYOUT
    ═══════════════════════════════════════════════ */
    .page { min-height: 100vh; display: flex; flex-direction: column; }

    .container {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
    }

    /* 2-column grid */
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      align-items: start;
      padding: 32px 0;
    }

    @media (max-width: 960px) {
      .grid { grid-template-columns: 1fr; }
      .results-panel { order: 2; }
      .form-panel { order: 1; }
    }

    /* ═══════════════════════════════════════════════
       HERO
    ═══════════════════════════════════════════════ */
    .hero {
      background: var(--c-green-900);
      color: #fff;
      padding: 20px 24px;
    }
    .hero-inner {
      max-width: 1200px;
      margin: 0 auto;
    }
    .hero-simple {
      display: flex;
      align-items: center;
      gap: 14px;
      color: #fff;
    }
    .hero-simple svg {
      color: var(--c-gold-500);
      flex-shrink: 0;
    }
    .hero-simple-title {
      font-family: var(--f-head);
      font-size: 22px;
      font-weight: 800;
      color: #fff;
    }

    /* ═══════════════════════════════════════════════
       AD SLOTS
    ═══════════════════════════════════════════════ */
    .ad-slot {
      width: 100%;
      background: var(--c-surface);
      border: 1px dashed var(--c-border-strong);
      border-radius: var(--r-md);
      padding: 12px 20px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .ad-top { margin-top: 24px; }
    .ad-bottom { margin-bottom: 24px; }
    .ad-tag {
      font-family: var(--f-head);
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: var(--c-text-400);
      background: var(--c-surface-alt);
      padding: 2px 8px;
      border-radius: 4px;
      border: 1px solid var(--c-border);
      white-space: nowrap;
    }
    .ad-body {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex: 1;
      gap: 12px;
    }
    .ad-body > span:first-child { font-size: 13px; color: var(--c-text-400); }
    .ad-meta { font-size: 11px; color: var(--c-text-400); }

    /* ═══════════════════════════════════════════════
       PANEL
    ═══════════════════════════════════════════════ */
    .panel {
      background: var(--c-surface);
      border-radius: var(--r-xl);
      border: 1px solid var(--c-border);
      box-shadow: var(--shadow-md);
      overflow: hidden;
    }
    .panel-head {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      padding: 24px 24px 0;
    }
    .panel-head-sub {
      padding-top: 20px;
      border-top: 1px solid var(--c-border);
      margin-top: 24px;
    }
    .panel-step {
      flex-shrink: 0;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--c-green-600);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--f-head);
      font-size: 13px;
      font-weight: 700;
      margin-top: 2px;
    }
    .panel-step-accent { background: var(--c-gold-600); color: var(--c-green-900); }

    .panel-title {
      font-family: var(--f-head);
      font-size: 18px;
      font-weight: 800;
      color: var(--c-text-900);
      line-height: 1.3;
    }
    .panel-sub { font-size: 13px; color: var(--c-text-500); margin-top: 2px; }
    .panel-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 18px; }
    .panel-foot {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 24px 24px;
      border-top: 1px solid var(--c-border);
      flex-wrap: wrap;
    }
    @media (max-width: 480px) {
      .panel-foot { flex-direction: column; align-items: stretch; }
      .btn-primary, .btn-ghost { width: 100%; justify-content: center; }
    }

    /* ═══════════════════════════════════════════════
       FORM FIELDS
    ═══════════════════════════════════════════════ */
    .field { display: flex; flex-direction: column; gap: 7px; }
    .field-label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-family: var(--f-head);
      font-size: 13px;
      font-weight: 700;
      color: var(--c-text-700);
    }
    .field-label svg { color: var(--c-green-600); }
    .field-hint { font-size: 12px; color: var(--c-text-400); }
    .field-error {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 12px;
      color: var(--c-red-600);
      font-weight: 600;
    }

    .input-wrap {
      position: relative;
      display: flex;
      align-items: center;
    }
    .input {
      width: 100%;
      padding: 11px 16px;
      font-family: var(--f-body);
      font-size: 15px;
      color: var(--c-text-900);
      background: var(--c-bg);
      border: 1.5px solid var(--c-border);
      border-radius: var(--r-md);
      text-align: right;
      outline: none;
      transition: border-color .15s, box-shadow .15s;
      -webkit-appearance: none;
    }
    .input:focus {
      border-color: var(--c-green-600);
      box-shadow: 0 0 0 3px oklch(45% .115 158 / .12);
    }
    .input:hover:not(:focus) { border-color: var(--c-border-strong); }
    .input-suffix {
      position: absolute;
      left: 14px;
      font-size: 13px;
      color: var(--c-text-500);
      pointer-events: none;
    }
    .input-date { cursor: pointer; }

    /* Remove number input spinners */
    input[type=number]::-webkit-inner-spin-button,
    input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
    input[type=number] { -moz-appearance: textfield; }

    .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

    /* Segmented control */
    .segmented {
      display: flex;
      gap: 6px;
      background: var(--c-surface-alt);
      border: 1.5px solid var(--c-border);
      border-radius: var(--r-md);
      padding: 4px;
    }
    .segment {
      flex: 1;
      padding: 9px 12px;
      font-family: var(--f-head);
      font-size: 14px;
      font-weight: 600;
      color: var(--c-text-500);
      border-radius: var(--r-sm);
      transition: all .15s;
      text-align: center;
    }
    .segment:hover:not(.is-active) { color: var(--c-text-700); background: var(--c-border); }
    .segment.is-active {
      background: var(--c-green-600);
      color: #fff;
      box-shadow: var(--shadow-sm);
    }

    /* Toggle row */
    .toggle-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 14px 16px;
      background: var(--c-surface-alt);
      border: 1.5px solid var(--c-border);
      border-radius: var(--r-md);
      text-align: right;
      transition: border-color .15s, background .15s;
    }
    .toggle-row:hover { border-color: var(--c-green-600); }
    .toggle-row.is-on { border-color: var(--c-green-600); background: var(--c-green-50); }
    .toggle-text { display: flex; flex-direction: column; gap: 2px; }
    .toggle-label { font-family: var(--f-head); font-size: 14px; font-weight: 700; color: var(--c-text-900); }
    .toggle-desc { font-size: 12px; color: var(--c-text-500); text-align: right; }
    .toggle-track {
      position: relative;
      width: 42px;
      height: 24px;
      border-radius: 999px;
      background: var(--c-border-strong);
      flex-shrink: 0;
      transition: background .2s;
    }
    .is-on .toggle-track { background: var(--c-green-600); }
    .toggle-knob {
      position: absolute;
      top: 3px;
      right: 3px;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #fff;
      box-shadow: 0 1px 4px oklch(0% 0 0 / .20);
      transition: transform .2s;
    }
    .is-on .toggle-knob { transform: translateX(-18px); }

    /* Compensation cards grid */
    .comp-grid {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 0 24px;
    }
    .comp-card {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      padding: 14px 16px;
      border: 1.5px solid var(--c-border);
      border-radius: var(--r-md);
      background: var(--c-surface-alt);
      text-align: right;
      transition: border-color .15s, background .15s, box-shadow .15s;
      cursor: pointer;
    }
    .comp-card:hover { border-color: var(--c-green-500); box-shadow: var(--shadow-sm); }
    .comp-card.is-selected {
      border-color: var(--c-green-600);
      background: var(--c-green-50);
      box-shadow: 0 0 0 2px oklch(45% .115 158 / .10);
    }
    .comp-card-checkmark {
      flex-shrink: 0;
      width: 22px;
      height: 22px;
      border-radius: 6px;
      border: 2px solid var(--c-border-strong);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 2px;
      transition: all .15s;
      color: #fff;
    }
    .is-selected .comp-card-checkmark {
      background: var(--c-green-600);
      border-color: var(--c-green-600);
    }
    .comp-card-body { display: flex; flex-direction: column; gap: 3px; }
    .comp-card-title {
      font-family: var(--f-head);
      font-size: 14px;
      font-weight: 800;
      color: var(--c-text-900);
    }
    .comp-card-desc { font-size: 12px; color: var(--c-text-500); line-height: 1.5; }
    .comp-card-article {
      font-size: 11px;
      font-weight: 600;
      color: var(--c-green-600);
      font-family: var(--f-head);
    }

    /* ═══════════════════════════════════════════════
       BUTTONS
    ═══════════════════════════════════════════════ */
    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 13px 24px;
      background: var(--c-green-600);
      color: #fff;
      font-family: var(--f-head);
      font-size: 15px;
      font-weight: 800;
      border-radius: var(--r-md);
      box-shadow: var(--shadow-sm);
      transition: background .15s, transform .1s, box-shadow .15s;
      white-space: nowrap;
    }
    .btn-primary:hover { background: var(--c-green-700); box-shadow: var(--shadow-md); }
    .btn-primary:active { transform: translateY(1px); }
    .btn-primary:disabled { opacity: .65; cursor: not-allowed; }

    .btn-ghost {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 11px 18px;
      color: var(--c-text-500);
      font-family: var(--f-head);
      font-size: 14px;
      font-weight: 600;
      border: 1.5px solid var(--c-border);
      border-radius: var(--r-md);
      transition: all .15s;
    }
    .btn-ghost:hover { border-color: var(--c-border-strong); color: var(--c-text-700); }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid oklch(100% 0 0 / .3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin .7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ═══════════════════════════════════════════════
       ALERT
    ═══════════════════════════════════════════════ */
    .alert {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      border-radius: var(--r-md);
      font-size: 14px;
      font-weight: 600;
      border: 1.5px solid;
    }
    .alert-error {
      background: var(--c-red-100);
      color: var(--c-red-600);
      border-color: var(--c-red-600);
    }

    /* Badges */
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 2px 9px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 700;
      font-family: var(--f-head);
    }
    .badge-ok { background: var(--c-green-100); color: var(--c-green-700); }
    .badge-warn { background: oklch(94% 0.04 60); color: oklch(40% 0.10 60); }

    /* ═══════════════════════════════════════════════
       EMPTY STATE
    ═══════════════════════════════════════════════ */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 48px 24px;
      gap: 12px;
    }
    .empty-illus {
      width: 72px;
      height: 72px;
      background: var(--c-green-50);
      border: 1.5px solid var(--c-green-100);
      border-radius: var(--r-xl);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--c-green-600);
      margin-bottom: 8px;
    }
    .empty-title {
      font-family: var(--f-head);
      font-size: 16px;
      font-weight: 800;
      color: var(--c-text-700);
    }
    .empty-text { font-size: 13px; color: var(--c-text-500); max-width: 320px; line-height: 1.7; }
    .empty-checklist {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 8px;
    }
    .empty-checklist li {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--c-text-500);
    }
    .empty-checklist svg { color: var(--c-green-600); }

    /* ═══════════════════════════════════════════════
       RESULT CARDS
    ═══════════════════════════════════════════════ */
    .results-panel { position: sticky; top: 16px; }
    .results-body {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    @media (max-width: 960px) {
      .results-panel { position: static; }
    }

    .result-card {
      border: 1.5px solid var(--c-border);
      border-radius: var(--r-lg);
      overflow: hidden;
      background: var(--c-surface);
      box-shadow: var(--shadow-sm);
      animation: fadeUp .3s ease both;
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .result-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 16px 18px;
      background: linear-gradient(135deg, var(--c-green-900), var(--c-green-800));
      color: #fff;
    }
    .result-head-left { display: flex; align-items: center; gap: 10px; }
    .result-index {
      font-family: var(--f-head);
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1px;
      color: oklch(70% 0.05 160);
    }
    .result-title {
      font-family: var(--f-head);
      font-size: 15px;
      font-weight: 800;
      color: #fff;
    }
    .result-amount-wrap { display: flex; flex-direction: column; align-items: flex-end; gap: 1px; }
    .result-amount-label { font-size: 10px; color: oklch(70% 0.03 160); font-family: var(--f-head); letter-spacing: .5px; }
    .result-amount {
      font-family: var(--f-head);
      font-size: 15px;
      font-weight: 800;
      color: var(--c-gold-500);
    }

    .result-body {
      padding: 14px 18px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .result-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      padding: 6px 0;
      font-size: 13px;
      border-bottom: 1px solid var(--c-border);
    }
    .result-row:last-child { border-bottom: none; }
    .result-row.is-emph {
      background: var(--c-green-50);
      padding: 8px 10px;
      border-radius: var(--r-sm);
      border: 1.5px solid var(--c-green-100);
      margin-top: 4px;
    }
    .row-key { font-weight: 600; color: var(--c-text-700); flex-shrink: 0; }
    .row-val { color: var(--c-text-900); text-align: left; direction: ltr; }
    .row-val strong { color: var(--c-green-700); font-weight: 800; }

    /* Brackets and phases */
    .brackets, .phases {
      background: var(--c-surface-alt);
      border: 1px solid var(--c-border);
      border-radius: var(--r-sm);
      padding: 10px 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .bracket-row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      font-size: 12.5px;
      color: var(--c-text-700);
    }
    .bracket-row > span:last-child { direction: ltr; text-align: left; }

    .phase {
      border-bottom: 1px solid var(--c-border);
      padding-bottom: 10px;
    }
    .phase:last-child { border-bottom: none; padding-bottom: 0; }
    .phase-head {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 6px;
    }
    .phase-num {
      font-family: var(--f-head);
      font-size: 12px;
      font-weight: 800;
      color: var(--c-green-700);
      background: var(--c-green-100);
      padding: 2px 8px;
      border-radius: 4px;
    }
    .phase-range { font-size: 12px; color: var(--c-text-500); }
    .phase-body { display: flex; flex-direction: column; gap: 4px; }
    .phase-body p {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      font-size: 12.5px;
    }

    /* ═══════════════════════════════════════════════
       TOTAL CARD
    ═══════════════════════════════════════════════ */
    .total-card {
      position: relative;
      background: linear-gradient(135deg, var(--c-green-900), var(--c-green-800));
      border-radius: var(--r-xl);
      overflow: hidden;
      box-shadow: var(--shadow-lg);
      animation: fadeUp .35s ease .1s both;
    }
    .total-pattern {
      position: absolute;
      inset: 0;
      background-image: repeating-linear-gradient(
        45deg,
        oklch(100% 0 0 / .02) 0px,
        oklch(100% 0 0 / .02) 1px,
        transparent 1px,
        transparent 12px
      );
    }
    .total-inner {
      position: relative;
      padding: 28px 24px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .total-meta { display: flex; flex-direction: column; gap: 4px; }
    .total-eyebrow {
      display: flex;
      align-items: center;
      gap: 7px;
      font-family: var(--f-head);
      font-size: 12px;
      font-weight: 700;
      letter-spacing: .8px;
      text-transform: uppercase;
      color: var(--c-gold-200);
    }
    .total-sub { font-size: 12px; color: oklch(65% 0.02 160); }
    .total-amount {
      display: flex;
      align-items: baseline;
      gap: 10px;
    }
    .total-amount-num {
      font-family: var(--f-head);
      font-size: clamp(28px, 5vw, 38px);
      font-weight: 900;
      color: var(--c-gold-500);
      direction: ltr;
    }
    .total-amount-curr {
      font-family: var(--f-head);
      font-size: 20px;
      font-weight: 700;
      color: var(--c-gold-200);
    }
    .total-disclaimer {
      position: relative;
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 12px 24px;
      border-top: 1px solid oklch(100% 0 0 / .10);
      font-size: 11px;
      color: oklch(60% 0.02 160);
      line-height: 1.6;
    }
    .total-disclaimer svg { flex-shrink: 0; margin-top: 2px; color: oklch(55% 0.02 160); }

    /* ═══════════════════════════════════════════════
       FOOTER
    ═══════════════════════════════════════════════ */
    .site-foot {
      background: var(--c-green-900);
      color: oklch(70% 0.02 160);
      border-top: 1px solid var(--c-green-800);
      margin-top: auto;
    }
    .site-foot-inner {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
    }
    .site-foot-text { font-size: 12px; }

    /* ═══════════════════════════════════════════════
       SCROLLBAR
    ═══════════════════════════════════════════════ */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--c-border-strong); border-radius: 3px; }
  `}</style>
      </Head>
      <div className="page" dir="rtl">
      <SiteNav current="/labor" />
      {/* Hero */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-simple">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 4v16" />
              <path d="M6 20h12" />
              <path d="M5 8h14" />
              <path d="M5 8l-2.5 6a3.5 3.5 0 0 0 5 0L5 8z" />
              <path d="M19 8l-2.5 6a3.5 3.5 0 0 0 5 0L19 8z" />
            </svg>
            <h1 className="hero-simple-title">حساب تعويضات نزاعات شغل</h1>
          </div>
        </div>
      </section>

      <div className="container">
        <AdSlot position="top" />

        <main className="grid" id="calculator">
          {/* FORM */}
          <form ref={formRef} onSubmit={handleSubmit} noValidate className="panel form-panel">
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
                <>
                  <div className="alert alert-error" role="alert">
                    <Icon name="alert" size={18} />
                    <span>{apiError}</span>
                  </div>
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => formRef.current?.requestSubmit()}
                  >
                    حاول مجدداً
                  </button>
                </>
              )}

              {!results && !apiError && <EmptyResults />}

              {results && (total || 0) === 0 && (
                <p style={{ textAlign: "center", color: "var(--c-text-500)", fontSize: "14px", padding: "32px 16px" }}>
                  لم يتم احتساب أي مبلغ بناءً على المعطيات المدخلة
                </p>
              )}

              {results && total > 0 && (() => {
                const cards = form.selected.map((key, idx) => {
                  const item = CALCULATIONS.find((c) => c.key === key);
                  const result = results.results[key];
                  if (!item || !result) return null;
                  const amount = amountFor(key, result);
                  if (amount === 0) return null;
                  if (key === "prejudice") return <PrejudiceCard key={key} index={idx} label={item.label} result={result} monthlySalary={form.monthlySalary} />;
                  if (key === "preavis") return <PreavisCard key={key} index={idx} label={item.label} result={result} />;
                  if (key === "indemnite") return <IndemniteCard key={key} index={idx} label={item.label} result={result} monthlySalary={Number(form.monthlySalary)} />;
                  if (key === "conges") return <CongesCard key={key} index={idx} label={item.label} result={result} monthlySalary={Number(form.monthlySalary)} />;
                  if (key === "prime") return <PrimeCard key={key} index={idx} label={item.label} result={result} />;
                  return null;
                });

                const hasSkipped = form.selected.some((key) => {
                  const result = results.results[key];
                  return !result || amountFor(key, result) === 0;
                });

                return (
                  <>
                    {cards}
                    {hasSkipped && (
                      <p style={{ fontSize: "12px", color: "var(--c-text-500)", fontStyle: "italic", textAlign: "center" }}>
                        تم عرض النتائج المتاحة فقط
                      </p>
                    )}
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
                  </>
                );
              })()}
            </div>
          </section>
        </main>

        <AdSlot position="bottom" />
      </div>

      <footer className="site-foot">
        <div className="site-foot-inner">
          <span className="site-foot-text">هذه الحاسبة للاستئناس فقط ولا تغني عن استشارة محامٍ مختص</span>
        </div>
      </footer>
      </div>
    </>
  );
}
