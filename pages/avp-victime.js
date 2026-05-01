import Head from "next/head";
import { useMemo, useRef, useState } from "react";
import SiteNav from '../components/SiteNav';

const PERIODS = [
  { label: "يومي", value: "daily" },
  { label: "شهري", value: "monthly" },
  { label: "سنوي", value: "yearly" },
];

const DEGREE_OPTIONS = [
  { label: "على جانب من الأهمية", value: "important" },
  { label: "مهم", value: "majeur" },
  { label: "مهم جداً", value: "tres_majeur" },
];

const SUPPLEMENT_LABELS = {
  tiercePersonne: "الاستعانة بشخص آخر",
  pretiumDoloris: "الألم الجسماني",
  prejudiceEsthetique: "تشويه الخلقة",
  changementProfession: "تغيير المهنة",
  interruptionEtudes: "الانقطاع عن الدراسة",
};

const FIELD_LABELS = {
  inputAge: "السن المدخل",
  usedAge: "السن المعتمد",
  inputSalary: "الأجر المدخل",
  usedSalary: "الأجر المعتمد",
  referenceCapital: "رأس المال المرجعي",
  pointValue: "قيمة النقطة",
  pointValueFloored: "تطبيق الحد الأدنى للنقطة",
  ippRate: "نسبة العجز",
  responsibilityRate: "نسبة المسؤولية",
  grossIPP: "المبلغ الخام",
  netIPP: "المبلغ الصافي",
  inputSalary: "الأجر المدخل",
  salaryUsed: "الأجر السنوي المعتمد",
  salaryAdjusted: "تطبيق الحد الأدنى للأجر",
  days: "عدد الأيام",
  gross: "المبلغ الخام",
  net: "المبلغ الصافي",
  formula: "المعادلة",
  supplementType: "نوع التعويض",
  capitalA: "رأس المال أ",
  capitalB: "رأس المال ب",
  baseUsed: "الأساس المعتمد",
  baseValue: "قيمة الأساس",
  rate: "النسبة",
  cumulationWarning: "تنبيه الجمع",
  hasProfessionalImpact: "تأثير على الحياة المهنية",
  source: "المصدر",
};

function formatMoney(value) {
  return `${Number(value || 0).toLocaleString("fr-MA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} درهم`;
}

function formatFormulaNumber(value) {
  return Number(value || 0).toLocaleString("fr-MA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
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

function displayValue(key, value) {
  if (typeof value === "boolean") return value ? "نعم" : "لا";
  if (typeof value === "number") {
    if (key === "usedAge") return Math.floor(value).toLocaleString("fr-MA");
    if (key === "responsibilityRate") return formatPercent(value);
    if (key === "rate") return formatPercent(value);
    if (/salary|capital|gross|net|value|ipp/i.test(key) && !/rate/i.test(key)) return formatMoney(value);
    if (/rate/i.test(key)) return `${formatNumber(value)}%`;
    return formatNumber(value);
  }
  return String(value);
}

function amountForResult(result) {
  if (!result) return 0;
  if (typeof result.net === "number") return result.net;
  if (typeof result.netIPP === "number") return result.netIPP;
  return 0;
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

function NumberInput({ value, onChange, placeholder, suffix, min = "0", max }) {
  return (
    <span className="input-wrap">
      <input type="number" inputMode="decimal" min={min} max={max} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="input" />
      {suffix && <span className="input-suffix">{suffix}</span>}
    </span>
  );
}

function DateInput({ value, onChange }) {
  return <span className="input-wrap"><input type="date" value={value} onChange={(e) => onChange(e.target.value)} className="input input-date" /></span>;
}

function SelectInput({ value, onChange, children }) {
  return <select value={value} onChange={(e) => onChange(e.target.value)} className="input">{children}</select>;
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

function sameValue(left, right) {
  return left !== undefined && right !== undefined && Number(left) === Number(right);
}

function pretiumDegreeLabel(rate) {
  if (Number(rate) === 0.05) return "على جانب من الأهمية";
  if (Number(rate) === 0.07) return "مهم";
  if (Number(rate) === 0.10) return "مهم جداً";
  if (Number(rate) === 0.15) return "مهم جداً";
  if (Number(rate) === 0.25) return "على جانب من الأهمية";
  if (Number(rate) === 0.30) return "مهم";
  if (Number(rate) === 0.35) return "مهم جداً";
  return "";
}

function changementProfessionLabel(rate) {
  if (Number(rate) === 0.20) return "تقاعد مبكر";
  if (Number(rate) === 0.15) return "فقدان الترقية";
  if (Number(rate) === 0.10) return "حرمان من ساعات";
  return "";
}

function interruptionEtudesLabel(rate) {
  if (Number(rate) === 0.25) return "نهائي";
  if (Number(rate) === 0.15) return "شبه نهائي";
  return "";
}

function shouldHideRow(key, data, kind) {
  if (key === "responsibilityRate") return true;
  if (key === "source") return true;
  if (kind === "ipp" && key === "pointValue") return true;
  if (kind === "itt" && key === "formula") return true;
  if (kind === "tiercePersonne" && ["supplementType", "baseUsed", "baseValue", "capitalB"].includes(key)) return true;
  if (["salaryAdjusted", "pointValueFloored"].includes(key) && data[key] === false) return true;
  if (key === "inputAge" && sameValue(data.inputAge, data.usedAge)) return true;
  if (key === "inputSalary" && (sameValue(data.inputSalary, data.usedSalary) || sameValue(data.inputSalary, data.salaryUsed))) return true;
  if (["gross", "grossIPP", "net", "netIPP"].includes(key)) return true;
  if (["tiercePersonne", "pretiumDoloris", "prejudiceEsthetique", "changementProfession", "interruptionEtudes"].includes(kind) && key === "net") return true;
  return false;
}

function rowLabel(key, data) {
  if (key === "degreeLabel") return "الدرجة";
  if (key === "subCaseLabel") return "النوع";
  if (key === "net" || key === "netIPP") return "المبلغ";
  return FIELD_LABELS[key] || key;
}

function orderedEntries(data, kind) {
  if (kind === "pretiumDoloris") {
    return [
      ["capitalA", data?.capitalA],
      ["degreeLabel", pretiumDegreeLabel(data?.rate)],
      ["rate", data?.rate],
    ].filter(([, value]) => value !== null && value !== undefined && value !== "");
  }

  if (kind === "prejudiceEsthetique") {
    return [
      ["capitalB", data?.capitalB],
      ["degreeLabel", pretiumDegreeLabel(data?.rate)],
      ["rate", data?.rate],
      ...(data?.hasProfessionalImpact ? [["hasProfessionalImpact", data.hasProfessionalImpact]] : []),
    ].filter(([, value]) => value !== null && value !== undefined && value !== "");
  }

  if (kind === "changementProfession") {
    return [
      ["capitalB", data?.capitalB],
      ["subCaseLabel", changementProfessionLabel(data?.rate)],
      ["rate", data?.rate],
    ].filter(([, value]) => value !== null && value !== undefined && value !== "");
  }

  if (kind === "interruptionEtudes") {
    return [
      ["capitalB", data?.capitalB],
      ["subCaseLabel", interruptionEtudesLabel(data?.rate)],
      ["rate", data?.rate],
    ].filter(([, value]) => value !== null && value !== undefined && value !== "");
  }

  const entries = Object.entries(data || {})
    .filter(([key, value]) => value !== null && value !== undefined && typeof value !== "object")
    .filter(([key]) => !shouldHideRow(key, data || {}, kind));

  if (kind !== "tiercePersonne") return entries;

  const order = ["capitalA", "rate"];
  return order
    .map((key) => entries.find(([entryKey]) => entryKey === key))
    .filter(Boolean);
}

function formulaFor(kind, data) {
  if (!data) return "";
  const responsibility = data.responsibilityRate;
  const amount = amountForResult(data);
  if (responsibility === undefined || !amount) return "";
  const result = `${formatFormulaNumber(amount)} درهم`;

  if (kind === "itt" && data.salaryUsed !== undefined && data.days !== undefined) {
    return `${formatFormulaNumber(data.salaryUsed)} × ${formatFormulaNumber(data.days)} ÷ 365 × ${formatPercent(responsibility)} = ${result}`;
  }

  if (kind === "ipp" && data.referenceCapital !== undefined && data.ippRate !== undefined) {
    return `${formatFormulaNumber(data.referenceCapital)} ÷ 100 × ${formatFormulaNumber(data.ippRate)}% × ${formatPercent(responsibility)} = ${result}`;
  }

  if (kind === "tiercePersonne" && data.capitalA !== undefined && data.net !== undefined) {
    return `${formatFormulaNumber(data.capitalA)} × 50% × ${formatPercent(responsibility)} = ${formatFormulaNumber(data.net)} درهم`;
  }

  if (["pretiumDoloris"].includes(kind) && data.capitalA !== undefined && data.rate !== undefined && data.net !== undefined) {
    return `${formatFormulaNumber(data.capitalA)} × ${formatPercent(data.rate)} × ${formatPercent(responsibility)} = ${formatFormulaNumber(data.net)} درهم`;
  }

  if (["prejudiceEsthetique", "changementProfession", "interruptionEtudes"].includes(kind) && data.capitalB !== undefined && data.rate !== undefined) {
    return `${formatFormulaNumber(data.capitalB)} × ${formatPercent(data.rate)} × ${formatPercent(responsibility)} = ${formatFormulaNumber(data.net)} درهم`;
  }

  return "";
}

function BreakdownRows({ data, kind }) {
  return orderedEntries(data, kind).map(([key, value]) => (
      <ResultRow key={key} label={rowLabel(key, data || {})}>{displayValue(key, value)}</ResultRow>
    ));
}

function ResultCard({ index, label, result, kind }) {
  const amount = amountForResult(result);
  const formula = formulaFor(kind, result);
  return (
    <article className="result-card">
      <ResultHeader index={index} label={label} amount={amount} />
      <div className="result-body">
        <BreakdownRows data={result} kind={kind} />
        {formula && (
          <ResultRow label="المعادلة النهائية" emphasis>
            <span
              style={{
                direction: "ltr",
                textAlign: "left",
                unicodeBidi: "embed",
                display: "block",
              }}
            >
              {formula}
            </span>
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
      <p className="empty-text">أدخل بيانات الضحية ثم اضغط «احتسب التعويضات» لعرض النتائج التفصيلية هنا.</p>
    </div>
  );
}

export default function AvpVictimePage() {
  const [form, setForm] = useState({
    dateNaissance: "",
    dateAccident: "",
    salaryAmount: "",
    salaryPeriod: "monthly",
    responsibilityPercent: "100",
    ittDays: "",
    ippRate: "",
    tiercePersonne: false,
    pretiumDolorisActive: false,
    pretiumDolorisDegree: "majeur",
    prejudiceEsthetiqueActive: false,
    prejudiceEsthetiqueDegree: "important",
    prejudiceEsthetiqueProfessional: false,
    changementProfessionActive: false,
    changementProfessionSubCase: "retraite_anticipee",
    interruptionEtudesActive: false,
    interruptionEtudesType: "definitif",
  });
  const [errors, setErrors] = useState({});
  const [results, setResults] = useState(null);
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const resultsRef = useRef(null);
  const formRef = useRef(null);

  const supplementCards = useMemo(() => {
    if (!results) return [];
    return Object.entries(results.supplements || {});
  }, [results]);

  function update(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
    if (errors[name]) setErrors((current) => ({ ...current, [name]: undefined }));
  }

  function validateForm() {
    const next = {};
    if (!form.dateNaissance) next.dateNaissance = "يرجى إدخال تاريخ الميلاد";
    if (!form.dateAccident) next.dateAccident = "يرجى إدخال تاريخ الحادثة";
    if (!Number(form.salaryAmount) || Number(form.salaryAmount) <= 0) next.salaryAmount = "يرجى إدخال راتب صحيح";
    if (form.responsibilityPercent === "" || Number(form.responsibilityPercent) < 0 || Number(form.responsibilityPercent) > 100) next.responsibilityPercent = "النسبة يجب أن تكون بين 0 و100";
    if (!Number(form.ittDays) || Number(form.ittDays) < 1) next.ittDays = "يرجى إدخال عدد أيام صحيح";
    if (form.ippRate === "" || Number(form.ippRate) < 0 || Number(form.ippRate) > 100) next.ippRate = "نسبة العجز يجب أن تكون بين 0 و100";
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
        response = await fetch("/api/avp-victime", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
          dateNaissance: form.dateNaissance,
          dateAccident: form.dateAccident,
          salaryAmount: Number(form.salaryAmount),
          salaryPeriod: form.salaryPeriod,
          responsibilityRate: Number(form.responsibilityPercent) / 100,
          ittDays: Number(form.ittDays),
          ippRate: Number(form.ippRate),
          supplements: {
            tiercePersonne: form.tiercePersonne,
            pretiumDoloris: {
              active: form.pretiumDolorisActive,
              degree: form.pretiumDolorisDegree,
            },
            prejudiceEsthetique: {
              active: form.prejudiceEsthetiqueActive,
              degree: form.prejudiceEsthetiqueDegree,
              hasProfessionalImpact: form.prejudiceEsthetiqueProfessional,
            },
            changementProfession: {
              active: form.changementProfessionActive,
              subCase: form.changementProfessionSubCase,
            },
            interruptionEtudes: {
              active: form.interruptionEtudesActive,
              type: form.interruptionEtudesType,
            },
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

  return (
    <>
      <Head>
        <title>حاسبة ضحية حادثة سير</title>
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
          .total-amount-num { font-family: var(--f-head); font-size: clamp(28px, 5vw, 38px); font-weight: 900; color: var(--c-gold-500); direction: ltr; }
          .total-amount-curr { font-family: var(--f-head); font-size: 20px; font-weight: 700; color: var(--c-gold-200); }
          .site-foot { background: var(--c-green-900); color: oklch(70% 0.02 160); border-top: 1px solid var(--c-green-800); margin-top: auto; }
          .site-foot-inner { padding: 24px; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
          .site-foot-text { font-size: 12px; }
        `}</style>
      </Head>

      <div className="page" dir="rtl">
        <SiteNav current="/avp-victime" />
        <section className="hero">
          <div className="hero-inner">
            <div className="hero-simple">
              <Icon name="scale" size={36} />
              <h1 className="hero-simple-title">حاسبة تعويض ضحية حادثة سير</h1>
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
                  <h2 className="panel-title">بيانات الضحية والحادثة</h2>
                  <p className="panel-sub">أدخل المعطيات الأساسية ونسب المسؤولية والعجز.</p>
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

                <div className="row-2">
                  <Field label="نسبة المسؤولية" error={errors.responsibilityPercent}>
                    <NumberInput value={form.responsibilityPercent} onChange={(value) => update("responsibilityPercent", value)} placeholder="100" suffix="%" min="0" max="100" />
                  </Field>
                  <Field label="أيام العجز المؤقت ITT" error={errors.ittDays}>
                    <NumberInput value={form.ittDays} onChange={(value) => update("ittDays", value)} placeholder="0" suffix="يوم" min="1" />
                  </Field>
                </div>

                <Field label="نسبة العجز الدائم IPP" error={errors.ippRate}>
                  <NumberInput value={form.ippRate} onChange={(value) => update("ippRate", value)} placeholder="0" suffix="%" min="0" max="100" />
                </Field>

                <h3 className="section-title">التعويضات التكميلية</h3>
                <ToggleRow checked={form.tiercePersonne} onChange={(value) => update("tiercePersonne", value)} label="الاستعانة بشخص آخر" description="احتساب التعويض عند الحاجة إلى مساعدة الغير." />

                <ToggleRow checked={form.pretiumDolorisActive} onChange={(value) => update("pretiumDolorisActive", value)} label="الألم الجسماني" description="يحتسب حسب درجة الضرر." />
                {form.pretiumDolorisActive && (
                  <Field label="درجة الألم البدني">
                    <SelectInput value={form.pretiumDolorisDegree} onChange={(value) => update("pretiumDolorisDegree", value)}>
                      {DEGREE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </SelectInput>
                  </Field>
                )}

                <ToggleRow checked={form.prejudiceEsthetiqueActive} onChange={(value) => update("prejudiceEsthetiqueActive", value)} label="تشويه الخلقة" description="يحتسب حسب الدرجة مع إمكانية تأثير على الحياة المهنية." />
                {form.prejudiceEsthetiqueActive && (
                  <>
                    <Field label="درجة تشويه الخلقة">
                      <SelectInput value={form.prejudiceEsthetiqueDegree} onChange={(value) => update("prejudiceEsthetiqueDegree", value)}>
                        {DEGREE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                      </SelectInput>
                    </Field>
                    <ToggleRow checked={form.prejudiceEsthetiqueProfessional} onChange={(value) => update("prejudiceEsthetiqueProfessional", value)} label="تأثير على الحياة المهنية" description="تفعيل أثر تشويه الخلقة على العمل." />
                  </>
                )}

                <ToggleRow checked={form.changementProfessionActive} onChange={(value) => update("changementProfessionActive", value)} label="تغيير المهنة" description="تعويض عند تأثير الحادثة على المسار المهني." />
                {form.changementProfessionActive && (
                  <Field label="الحالة">
                    <SelectInput value={form.changementProfessionSubCase} onChange={(value) => update("changementProfessionSubCase", value)}>
                      <option value="retraite_anticipee">تقاعد مبكر</option>
                      <option value="perte_promotion">فقدان الترقية</option>
                      <option value="privation_heures">حرمان من ساعات</option>
                    </SelectInput>
                  </Field>
                )}

                <ToggleRow checked={form.interruptionEtudesActive} onChange={(value) => update("interruptionEtudesActive", value)} label="انقطاع عن الدراسة" description="تعويض عند الانقطاع النهائي أو شبه النهائي عن الدراسة." />
                {form.interruptionEtudesActive && (
                  <Field label="نوع الانقطاع">
                    <SelectInput value={form.interruptionEtudesType} onChange={(value) => update("interruptionEtudesType", value)}>
                      <option value="definitif">نهائي</option>
                      <option value="quasi_definitif">شبه نهائي</option>
                    </SelectInput>
                  </Field>
                )}

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
                  <p className="panel-sub">تفاصيل الحساب كما ترجعها محركات التعويض.</p>
                </div>
              </header>
              <div className="panel-body results-body">
                {!results ? (
                  <EmptyResults />
                ) : results.total === 0 ? (
                  <p style={{ textAlign: "center", color: "var(--c-text-500)", fontSize: "14px", padding: "32px 16px" }}>
                    لم يتم احتساب أي مبلغ بناءً على المعطيات المدخلة
                  </p>
                ) : (
                  <>
                    {amountForResult(results.itt) > 0 && (
                      <ResultCard index={1} label="تعويض العجز المؤقت ITT" result={results.itt} kind="itt" />
                    )}
                    {amountForResult(results.ipp) > 0 && (
                      <ResultCard index={2} label="تعويض العجز الدائم IPP" result={results.ipp} kind="ipp" />
                    )}
                    {supplementCards.every(([, r]) => !r || amountForResult(r) === 0) && (
                      <p style={{ fontSize: "13px", color: "var(--c-text-500)", textAlign: "center", padding: "8px 0" }}>
                        لا توجد تعويضات تكميلية مفعلة
                      </p>
                    )}
                    {supplementCards.map(([key, result], index) => {
                      if (!result || amountForResult(result) === 0) return null;
                      return (
                        <ResultCard key={key} index={index + 3} label={SUPPLEMENT_LABELS[key] || key} result={result} kind={key} />
                      );
                    })}
                    {supplementCards.some(([, r]) => !r || amountForResult(r) === 0) &&
                     !supplementCards.every(([, r]) => !r || amountForResult(r) === 0) && (
                      <p style={{ fontSize: "12px", color: "var(--c-text-500)", fontStyle: "italic", textAlign: "center" }}>
                        تم عرض النتائج المتاحة فقط
                      </p>
                    )}
                    <article className="total-card">
                      <div className="total-inner">
                        <span className="total-eyebrow"><Icon name="check" size={16} />المجموع الكلي</span>
                        <div><span className="total-amount-num">{formatNumber(results.total)}</span> <span className="total-amount-curr">درهم</span></div>
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
