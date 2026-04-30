import Head from "next/head";
import { useRef, useState } from "react";

const PERIODS = [
  { label: "يومي", value: "daily" },
  { label: "شهري", value: "monthly" },
  { label: "سنوي", value: "yearly" },
];

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

function formatPercent(value) {
  return `${formatNumber(Number(value || 0) * 100)}%`;
}

function formatFormulaNumber(value) {
  return Number(value || 0).toLocaleString("fr-MA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function Icon({ name, size = 20 }) {
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };
  if (name === "scale") return <svg {...props}><path d="M12 4v16" /><path d="M6 20h12" /><path d="M5 8h14" /><path d="M5 8l-2.5 6a3.5 3.5 0 0 0 5 0L5 8z" /><path d="M19 8l-2.5 6a3.5 3.5 0 0 0 5 0L19 8z" /></svg>;
  if (name === "calendar") return <svg {...props}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18" /><path d="M8 3v4M16 3v4" /></svg>;
  if (name === "wallet") return <svg {...props}><path d="M3 7a2 2 0 0 1 2-2h12l4 4v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" /><path d="M16 13h3" /></svg>;
  if (name === "alert") return <svg {...props}><path d="M12 3l10 18H2L12 3z" /><path d="M12 10v5" /><circle cx="12" cy="18" r="0.6" fill="currentColor" /></svg>;
  if (name === "check") return <svg {...props}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>;
  return null;
}

function Field({ label, icon, children, error }) {
  return (
    <label className="field">
      <span className="field-label">{icon && <Icon name={icon} size={16} />}<span>{label}</span></span>
      {children}
      {error && <span className="field-error"><Icon name="alert" size={14} />{error}</span>}
    </label>
  );
}

function NumberInput({ value, onChange, placeholder = "0", suffix, min = "0", max }) {
  return (
    <span className="input-wrap">
      <input type="number" inputMode="decimal" min={min} max={max} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="input" />
      {suffix && <span className="input-suffix">{suffix}</span>}
    </span>
  );
}

function DateInput({ value, onChange }) {
  return <span className="input-wrap"><input type="date" value={value} onChange={(event) => onChange(event.target.value)} className="input input-date" /></span>;
}

function SelectInput({ value, onChange, children }) {
  return <select value={value} onChange={(event) => onChange(event.target.value)} className="input">{children}</select>;
}

function ToggleRow({ checked, onChange, label, description }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className={`toggle-row ${checked ? "is-on" : ""}`} aria-pressed={checked}>
      <span className="toggle-text"><span className="toggle-label">{label}</span>{description && <span className="toggle-desc">{description}</span>}</span>
      <span className="toggle-track" aria-hidden="true"><span className="toggle-knob" /></span>
    </button>
  );
}

function ResultHeader({ index, label, amount }) {
  return (
    <div className="result-head">
      <div className="result-head-left"><span className="result-index">{String(index).padStart(2, "0")}</span><h3 className="result-title">{label}</h3></div>
      <div className="result-amount-wrap"><span className="result-amount-label">المبلغ</span><span className="result-amount">{formatMoney(amount)}</span></div>
    </div>
  );
}

function ResultRow({ label, children, emphasis }) {
  return <p className={`result-row ${emphasis ? "is-emph" : ""}`}><span className="row-key">{label}</span><span className="row-val">{children}</span></p>;
}

function formulaSpan(children) {
  return (
    <span
      style={{
        direction: "ltr",
        textAlign: "left",
        unicodeBidi: "embed",
        display: "block",
      }}
    >
      {children}
    </span>
  );
}

function moralDamageFor(item, dommagesMoraux) {
  if (item.key === "spouse") return dommagesMoraux?.spouse;
  if (item.key.startsWith("child_")) return dommagesMoraux?.children;
  if (item.key === "father") return dommagesMoraux?.father;
  if (item.key === "mother") return dommagesMoraux?.mother;
  return null;
}

function BeneficiaryCard({ index, item, dommagesMoraux, responsibilityRate }) {
  const moral = moralDamageFor(item, dommagesMoraux);

  return (
    <article className="result-card">
      <ResultHeader index={index} label={`${item.label}${item.count > 1 ? ` (${item.count})` : ""}`} amount={item.netAmount} />
      <div className="result-body">
        {Number(item.rate || 0) !== 0 && <ResultRow label="النسبة">{formatPercent(item.rate)}</ResultRow>}
        {Number(item.referenceCapital || 0) !== 0 && <ResultRow label="رأس المال المرجعي">{formatMoney(item.referenceCapital)}</ResultRow>}
        {Number(item.netAmount || 0) !== 0 && (
          <ResultRow label="الضرر المادي" emphasis>
            {formulaSpan(`${formatFormulaNumber(item.referenceCapital)} × ${formatPercent(item.rate)} × ${formatPercent(responsibilityRate)} = ${formatFormulaNumber(item.netAmount)} درهم`)}
          </ResultRow>
        )}
        {moral && Number(moral.amount || 0) !== 0 && (
          <ResultRow label="الضرر المعنوي" emphasis>
            {formulaSpan(`${formatFormulaNumber(moral.count)} × ${formatFormulaNumber(moral.multiplier)} × 14.270 = ${formatFormulaNumber(moral.amount)} درهم`)}
          </ResultRow>
        )}
      </div>
    </article>
  );
}

function EmptyResults() {
  return (
    <div className="empty-state">
      <div className="empty-illus"><Icon name="scale" size={36} /></div>
      <h3 className="empty-title">لم يتم احتساب أي تعويض بعد</h3>
      <p className="empty-text">أدخل بيانات الضحية وذوي الحقوق ثم اضغط «احتسب التعويضات» لعرض النتائج.</p>
    </div>
  );
}

export default function AvpAyantsDroitPage() {
  const [form, setForm] = useState({
    dateNaissance: "",
    dateAccident: "",
    salaryAmount: "",
    salaryPeriod: "monthly",
    responsibilityPercent: "100",
    spouseCount: 0,
    child_0_5: 0,
    child_6_10: 0,
    child_11_16: 0,
    child_17_plus: 0,
    child_disabled: 0,
    fatherPresent: false,
    fatherDisabled: false,
    motherPresent: false,
    motherDisabled: false,
    otherObligatory: 0,
    otherVoluntary: 0,
  });
  const [errors, setErrors] = useState({});
  const [results, setResults] = useState(null);
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const resultsRef = useRef(null);
  const formRef = useRef(null);

  function update(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
    if (errors[name]) setErrors((current) => ({ ...current, [name]: undefined }));
  }

  function validCount(value, max) {
    const number = Number(value);
    return Number.isInteger(number) && number >= 0 && (max === undefined || number <= max);
  }

  function validateForm() {
    const next = {};
    if (!form.dateNaissance) next.dateNaissance = "يرجى إدخال تاريخ الميلاد";
    if (!form.dateAccident) next.dateAccident = "يرجى إدخال تاريخ الحادثة";
    if (!Number(form.salaryAmount) || Number(form.salaryAmount) <= 0) next.salaryAmount = "يرجى إدخال راتب صحيح";
    if (form.responsibilityPercent === "" || Number(form.responsibilityPercent) < 0 || Number(form.responsibilityPercent) > 100) next.responsibilityPercent = "النسبة يجب أن تكون بين 0 و100";
    if (!validCount(form.spouseCount, 4)) next.spouseCount = "عدد الأزواج يجب أن يكون بين 0 و4";
    [
      ["child_0_5", "عدد الأبناء غير صالح"],
      ["child_6_10", "عدد الأبناء غير صالح"],
      ["child_11_16", "عدد الأبناء غير صالح"],
      ["child_17_plus", "عدد الأبناء غير صالح"],
      ["child_disabled", "عدد الأبناء غير صالح"],
      ["otherObligatory", "العدد غير صالح"],
      ["otherVoluntary", "العدد غير صالح"],
    ].forEach(([key, message]) => {
      if (!validCount(form[key])) next[key] = message;
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setApiError("");
    setResults(null);
    if (!validateForm()) return;
    setLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      let response;
      try {
        response = await fetch("/api/avp-ayants-droit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
          dateNaissance: form.dateNaissance,
          dateAccident: form.dateAccident,
          salaryAmount: Number(form.salaryAmount),
          salaryPeriod: form.salaryPeriod,
          responsibilityRate: Number(form.responsibilityPercent) / 100,
          beneficiaries: {
            spouseCount: Number(form.spouseCount),
            children: {
              age_0_5: Number(form.child_0_5),
              age_6_10: Number(form.child_6_10),
              age_11_16: Number(form.child_11_16),
              age_17_plus: Number(form.child_17_plus),
              disabled: Number(form.child_disabled),
            },
            father: { present: form.fatherPresent, disabled: form.fatherPresent && form.fatherDisabled },
            mother: { present: form.motherPresent, disabled: form.motherPresent && form.motherDisabled },
            otherObligatory: Number(form.otherObligatory),
            otherVoluntary: Number(form.otherVoluntary),
          },
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

      setResults(data.result);
      setTimeout(() => {
        if (window.innerWidth < 960 && resultsRef.current) {
          window.scrollTo({ top: resultsRef.current.getBoundingClientRect().top + window.scrollY - 16, behavior: "smooth" });
        }
      }, 60);
    } catch (error) {
      if (error.name === "AbortError") {
        setApiError("انتهت مهلة الطلب — يرجى المحاولة مجدداً");
      } else {
        setApiError("تعذّر الاتصال بالخادم — يرجى التحقق من اتصالك بالإنترنت والمحاولة مجدداً");
      }
    } finally {
      setLoading(false);
    }
  }

  const showAdjustment = results && (results.adjustment.capApplied || Math.abs(results.adjustment.adjustmentFactor - 1) > 0.000001);
  const materialTotal = results ? Number(results.grandTotal || 0) : 0;
  const moralTotal = results ? Number(results.dommagesMoraux?.total || 0) : 0;
  const combinedTotal = materialTotal + moralTotal;

  return (
    <>
      <Head>
        <title>حاسبة ذوي الحقوق في حوادث السير</title>
        <style>{`
          :root {
            --c-bg: oklch(97% 0.008 80);
            --c-surface: oklch(99.5% 0.004 80);
            --c-surface-alt: oklch(96% 0.010 80);
            --c-border: oklch(88% 0.012 80);
            --c-border-strong: oklch(78% 0.020 80);
            --c-green-900: oklch(26% 0.080 165);
            --c-green-800: oklch(31% 0.090 162);
            --c-green-700: oklch(38% 0.100 160);
            --c-green-600: oklch(45% 0.115 158);
            --c-green-100: oklch(94% 0.030 155);
            --c-green-50: oklch(97% 0.018 155);
            --c-gold-600: oklch(60% 0.120 75);
            --c-gold-500: oklch(68% 0.130 75);
            --c-gold-200: oklch(87% 0.060 80);
            --c-text-900: oklch(18% 0.025 80);
            --c-text-700: oklch(34% 0.030 80);
            --c-text-500: oklch(55% 0.025 80);
            --c-red-100: oklch(94% 0.040 25);
            --c-red-600: oklch(50% 0.160 25);
            --f-head: 'Cairo', 'Noto Kufi Arabic', system-ui, sans-serif;
            --f-body: 'Cairo', 'Noto Naskh Arabic', system-ui, sans-serif;
            --r-sm: 6px; --r-md: 10px; --r-lg: 14px; --r-xl: 20px;
            --shadow-sm: 0 1px 3px oklch(0% 0 0 / .06), 0 1px 2px oklch(0% 0 0 / .04);
            --shadow-md: 0 4px 16px oklch(0% 0 0 / .08), 0 1px 4px oklch(0% 0 0 / .04);
            --shadow-lg: 0 12px 40px oklch(0% 0 0 / .12), 0 2px 8px oklch(0% 0 0 / .06);
          }
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: var(--f-body); background: var(--c-bg); color: var(--c-text-900); line-height: 1.7; }
          button, input, select { font-family: inherit; }
          button { border: none; background: none; cursor: pointer; }
          svg { display: block; flex-shrink: 0; }
          .page { min-height: 100vh; display: flex; flex-direction: column; }
          .hero { background: var(--c-green-900); color: #fff; padding: 20px 24px; }
          .hero-inner, .container, .site-foot-inner { max-width: 1200px; margin: 0 auto; }
          .hero-simple { display: flex; align-items: center; gap: 14px; color: #fff; }
          .hero-simple svg { color: var(--c-gold-500); }
          .hero-simple-title { font-family: var(--f-head); font-size: 22px; font-weight: 800; color: #fff; }
          .container { width: 100%; padding: 0 24px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: start; padding: 32px 0; }
          @media (max-width: 960px) { .grid { grid-template-columns: 1fr; } .results-panel { position: static !important; } .row-2 { grid-template-columns: 1fr !important; } }
          .ad-slot { width: 100%; background: var(--c-surface); border: 1px dashed var(--c-border-strong); border-radius: var(--r-md); padding: 12px 20px; display: flex; justify-content: space-between; color: var(--c-text-500); margin-top: 24px; }
          .panel { background: var(--c-surface); border-radius: var(--r-xl); border: 1px solid var(--c-border); box-shadow: var(--shadow-md); overflow: hidden; }
          .panel-head { display: flex; align-items: flex-start; gap: 14px; padding: 24px 24px 0; }
          .panel-step { width: 32px; height: 32px; border-radius: 50%; background: var(--c-green-600); color: #fff; display: flex; align-items: center; justify-content: center; font-family: var(--f-head); font-size: 13px; font-weight: 700; }
          .panel-step-accent { background: var(--c-gold-600); color: var(--c-green-900); }
          .panel-title { font-family: var(--f-head); font-size: 18px; font-weight: 800; color: var(--c-text-900); }
          .panel-sub { font-size: 13px; color: var(--c-text-500); margin-top: 2px; }
          .panel-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 18px; }
          .panel-foot { display: flex; justify-content: flex-end; gap: 12px; padding: 16px 24px 24px; border-top: 1px solid var(--c-border); }
          .field { display: flex; flex-direction: column; gap: 7px; }
          .field-label { display: flex; align-items: center; gap: 6px; font-family: var(--f-head); font-size: 13px; font-weight: 700; color: var(--c-text-700); }
          .field-label svg { color: var(--c-green-600); }
          .field-error { display: flex; align-items: center; gap: 5px; font-size: 12px; color: var(--c-red-600); font-weight: 600; }
          .input-wrap { position: relative; display: flex; align-items: center; }
          .input { width: 100%; padding: 11px 16px; padding-left: 58px; font-size: 15px; color: var(--c-text-900); background: var(--c-bg); border: 1.5px solid var(--c-border); border-radius: var(--r-md); text-align: right; outline: none; }
          .input:focus { border-color: var(--c-green-600); box-shadow: 0 0 0 3px oklch(45% .115 158 / .12); }
          .input-suffix { position: absolute; left: 14px; font-size: 13px; color: var(--c-text-500); pointer-events: none; font-family: var(--f-body); font-weight: 600; line-height: 1; }
          .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
          .toggle-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 14px 16px; background: var(--c-surface-alt); border: 1.5px solid var(--c-border); border-radius: var(--r-md); text-align: right; }
          .toggle-row.is-on { border-color: var(--c-green-600); background: var(--c-green-50); }
          .toggle-text { display: flex; flex-direction: column; gap: 2px; }
          .toggle-label { font-family: var(--f-head); font-size: 14px; font-weight: 700; color: var(--c-text-900); }
          .toggle-desc { font-size: 12px; color: var(--c-text-500); }
          .toggle-track { position: relative; width: 42px; height: 24px; border-radius: 999px; background: var(--c-border-strong); flex-shrink: 0; }
          .is-on .toggle-track { background: var(--c-green-600); }
          .toggle-knob { position: absolute; top: 3px; right: 3px; width: 18px; height: 18px; border-radius: 50%; background: #fff; box-shadow: 0 1px 4px oklch(0% 0 0 / .20); transition: transform .2s; }
          .is-on .toggle-knob { transform: translateX(-18px); }
          .btn-primary { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 13px 24px; background: var(--c-green-600); color: #fff; font-family: var(--f-head); font-size: 15px; font-weight: 800; border-radius: var(--r-md); box-shadow: var(--shadow-sm); width: 100%; }
          .btn-primary:hover { background: var(--c-green-700); }
          .btn-primary:disabled { opacity: .65; cursor: not-allowed; }
          .alert { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-radius: var(--r-md); font-size: 14px; font-weight: 600; border: 1.5px solid; }
          .alert-error { background: var(--c-red-100); color: var(--c-red-600); border-color: var(--c-red-600); }
          .section-title { font-family: var(--f-head); font-size: 15px; font-weight: 800; color: var(--c-green-800); padding-top: 4px; border-top: 1px solid var(--c-border); }
          .results-panel { position: sticky; top: 16px; }
          .results-body { display: flex; flex-direction: column; gap: 12px; }
          .result-card { border: 1.5px solid var(--c-border); border-radius: var(--r-lg); overflow: hidden; background: var(--c-surface); box-shadow: var(--shadow-sm); }
          .result-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 16px 18px; background: linear-gradient(135deg, var(--c-green-900), var(--c-green-800)); color: #fff; }
          .result-head-left { display: flex; align-items: center; gap: 10px; }
          .result-index { font-family: var(--f-head); font-size: 11px; font-weight: 800; color: oklch(70% 0.05 160); }
          .result-title { font-family: var(--f-head); font-size: 15px; font-weight: 800; color: #fff; }
          .result-amount-wrap { display: flex; flex-direction: column; align-items: flex-end; }
          .result-amount-label { font-size: 10px; color: oklch(70% 0.03 160); font-family: var(--f-head); }
          .result-amount { font-family: var(--f-head); font-size: 15px; font-weight: 800; color: var(--c-gold-500); }
          .result-body { padding: 14px 18px; display: flex; flex-direction: column; gap: 6px; }
          .result-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding: 6px 0; font-size: 13px; border-bottom: 1px solid var(--c-border); }
          .result-row:last-child { border-bottom: none; }
          .result-row.is-emph { background: var(--c-green-50); padding: 8px 10px; border-radius: var(--r-sm); border: 1.5px solid var(--c-green-100); margin-top: 4px; }
          .row-key { font-weight: 600; color: var(--c-text-700); flex-shrink: 0; }
          .row-val { color: var(--c-text-900); text-align: left; direction: ltr; overflow-wrap: anywhere; }
          .empty-state { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 48px 24px; gap: 12px; }
          .empty-illus { width: 72px; height: 72px; background: var(--c-green-50); border: 1.5px solid var(--c-green-100); border-radius: var(--r-xl); display: flex; align-items: center; justify-content: center; color: var(--c-green-600); }
          .empty-title { font-family: var(--f-head); font-size: 16px; font-weight: 800; color: var(--c-text-700); }
          .empty-text { font-size: 13px; color: var(--c-text-500); max-width: 320px; }
          .total-card { background: linear-gradient(135deg, var(--c-green-900), var(--c-green-800)); border-radius: var(--r-xl); overflow: hidden; box-shadow: var(--shadow-lg); color: #fff; }
          .total-inner { padding: 28px 24px; display: flex; flex-direction: column; gap: 12px; }
          .total-eyebrow { display: flex; align-items: center; gap: 7px; font-family: var(--f-head); font-size: 12px; font-weight: 700; color: var(--c-gold-200); }
          .total-card .row-key { color: var(--c-gold-200); }
          .total-card .row-val { color: #fff; }
          .total-card .result-row { border-bottom-color: oklch(70% 0.03 160 / .28); }
          .total-card .result-row.is-emph { background: oklch(100% 0 0 / .08); border-color: oklch(70% 0.03 160 / .35); }
          .total-amount-num { font-family: var(--f-head); font-size: clamp(28px, 5vw, 38px); font-weight: 900; color: var(--c-gold-500); direction: ltr; }
          .total-amount-curr { font-family: var(--f-head); font-size: 20px; font-weight: 700; color: var(--c-gold-200); }
          .site-foot { background: var(--c-green-900); color: oklch(70% 0.02 160); border-top: 1px solid var(--c-green-800); margin-top: auto; }
          .site-foot-inner { padding: 24px; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
          .site-foot-text { font-size: 12px; }
        `}</style>
      </Head>

      <div className="page" dir="rtl">
        <section className="hero">
          <div className="hero-inner">
            <div className="hero-simple">
              <Icon name="scale" size={36} />
              <h1 className="hero-simple-title">حاسبة تعويض ذوي الحقوق في حوادث السير</h1>
            </div>
          </div>
        </section>

        <div className="container">
          <div className="ad-slot"><span>إعلان</span><span>728 × 90</span></div>

          <main className="grid">
            <form ref={formRef} onSubmit={handleSubmit} noValidate className="panel form-panel">
              <header className="panel-head">
                <span className="panel-step">١</span>
                <div>
                  <h2 className="panel-title">بيانات الضحية وذوي الحقوق</h2>
                  <p className="panel-sub">أدخل المعطيات الأساسية وعدد المستفيدين حسب الفئات.</p>
                </div>
              </header>

              <div className="panel-body">
                <div className="row-2">
                  <Field label="تاريخ الميلاد" icon="calendar" error={errors.dateNaissance}>
                    <DateInput value={form.dateNaissance} onChange={(value) => update("dateNaissance", value)} />
                  </Field>
                  <Field label="تاريخ الحادثة" icon="calendar" error={errors.dateAccident}>
                    <DateInput value={form.dateAccident} onChange={(value) => update("dateAccident", value)} />
                  </Field>
                </div>

                <div className="row-2">
                  <Field label="الراتب" icon="wallet" error={errors.salaryAmount}>
                    <NumberInput value={form.salaryAmount} onChange={(value) => update("salaryAmount", value)} placeholder="0.00" suffix="درهم" min="1" />
                  </Field>
                  <Field label="الدورية">
                    <SelectInput value={form.salaryPeriod} onChange={(value) => update("salaryPeriod", value)}>
                      {PERIODS.map((period) => <option key={period.value} value={period.value}>{period.label}</option>)}
                    </SelectInput>
                  </Field>
                </div>

                <Field label="نسبة المسؤولية" error={errors.responsibilityPercent}>
                  <NumberInput value={form.responsibilityPercent} onChange={(value) => update("responsibilityPercent", value)} placeholder="100" suffix="%" min="0" max="100" />
                </Field>

                <h3 className="section-title">الأزواج والأبناء</h3>
                <Field label="الزوج/الزوجة" error={errors.spouseCount}>
                  <NumberInput value={form.spouseCount} onChange={(value) => update("spouseCount", value)} min="0" max="4" />
                </Field>
                <div className="row-2">
                  <Field label="0-5 سنة" error={errors.child_0_5}><NumberInput value={form.child_0_5} onChange={(value) => update("child_0_5", value)} /></Field>
                  <Field label="6-10 سنة" error={errors.child_6_10}><NumberInput value={form.child_6_10} onChange={(value) => update("child_6_10", value)} /></Field>
                </div>
                <div className="row-2">
                  <Field label="11-16 سنة" error={errors.child_11_16}><NumberInput value={form.child_11_16} onChange={(value) => update("child_11_16", value)} /></Field>
                  <Field label="17 سنة فأكثر" error={errors.child_17_plus}><NumberInput value={form.child_17_plus} onChange={(value) => update("child_17_plus", value)} /></Field>
                </div>
                <Field label="في وضعية إعاقة" error={errors.child_disabled}>
                  <NumberInput value={form.child_disabled} onChange={(value) => update("child_disabled", value)} />
                </Field>

                <h3 className="section-title">الأصول</h3>
                <ToggleRow checked={form.fatherPresent} onChange={(value) => update("fatherPresent", value)} label="الأب موجود" />
                {form.fatherPresent && <ToggleRow checked={form.fatherDisabled} onChange={(value) => update("fatherDisabled", value)} label="الأب معاق" />}
                <ToggleRow checked={form.motherPresent} onChange={(value) => update("motherPresent", value)} label="الأم موجودة" />
                {form.motherPresent && <ToggleRow checked={form.motherDisabled} onChange={(value) => update("motherDisabled", value)} label="الأم معاقة" />}

                <h3 className="section-title">باقي المستفيدين</h3>
                <div className="row-2">
                  <Field label="ذوو النفقة الإجبارية" error={errors.otherObligatory}>
                    <NumberInput value={form.otherObligatory} onChange={(value) => update("otherObligatory", value)} />
                  </Field>
                  <Field label="ذوو النفقة الاختيارية" error={errors.otherVoluntary}>
                    <NumberInput value={form.otherVoluntary} onChange={(value) => update("otherVoluntary", value)} />
                  </Field>
                </div>

                {apiError && (
                  <>
                    <div className="alert alert-error" role="alert">
                      <Icon name="alert" size={18} />
                      <span>{apiError}</span>
                    </div>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => formRef.current?.requestSubmit()}
                    >
                      حاول مجدداً
                    </button>
                  </>
                )}
              </div>

              <footer className="panel-foot">
                <button className="btn-primary" type="submit" disabled={loading}>
                  {loading ? "جارٍ الحساب..." : "احتسب التعويضات"}
                </button>
              </footer>
            </form>

            <section className="panel results-panel" ref={resultsRef}>
              <header className="panel-head">
                <span className="panel-step panel-step-accent">٢</span>
                <div>
                  <h2 className="panel-title">نتائج التعويض</h2>
                  <p className="panel-sub">تفاصيل مبالغ التعويض حسب كل فئة مستفيدة.</p>
                </div>
              </header>
              <div className="panel-body results-body">
                {!results ? (
                  <EmptyResults />
                ) : (
                  <>
                    {results.beneficiaries.map((item, index) => (
                      <BeneficiaryCard
                        key={item.key}
                        index={index + 1}
                        item={{ ...item, referenceCapital: results.referenceCapital }}
                        dommagesMoraux={results.dommagesMoraux}
                        responsibilityRate={results.inputs.responsibilityRate}
                      />
                    ))}
                    {showAdjustment && (
                      <article className="result-card">
                        <ResultHeader index={results.beneficiaries.length + 1} label="تعديل المادة 13" amount={results.adjustment.total14Gross} />
                        <div className="result-body">
                          <ResultRow label="مجموع الفئات 1-4">{formatMoney(results.adjustment.total14Gross)}</ResultRow>
                          {results.adjustment.capApplied && <ResultRow label="تطبيق السقف">نعم</ResultRow>}
                        </div>
                      </article>
                    )}
                    <article className="total-card">
                      <div className="total-inner">
                        <span className="total-eyebrow"><Icon name="check" size={16} />المجموع الكلي</span>
                        <ResultRow label="مجموع الضرر المادي">{formatMoney(materialTotal)}</ResultRow>
                        <ResultRow label="مجموع الضرر المعنوي">{formatMoney(moralTotal)}</ResultRow>
                        <ResultRow label="المجموع الكلي" emphasis>{formatMoney(combinedTotal)}</ResultRow>
                      </div>
                    </article>
                  </>
                )}
              </div>
            </section>
          </main>

          <div className="ad-slot"><span>إعلان</span><span>728 × 90</span></div>
        </div>

        <footer className="site-foot">
          <div className="site-foot-inner">
            <span className="site-foot-text">حاسبة قانونية</span>
            <span className="site-foot-text">www.hasiba.ma</span>
          </div>
        </footer>
      </div>
    </>
  );
}
