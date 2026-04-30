import Head from "next/head";
import { useMemo, useRef, useState } from "react";

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

function ippTypeLabel(type) {
  if (type === "rente") return "إيراد";
  if (type === "capital") return "رأسمال";
  if (type === "neant") return "لا تعويض";
  return type;
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
  if (name === "user") return <svg {...props}><circle cx="12" cy="8" r="3.5" /><path d="M5 20c1-3.5 4-5 7-5s6 1.5 7 5" /></svg>;
  if (name === "check") return <svg {...props}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>;
  if (name === "alert") return <svg {...props}><path d="M12 3l10 18H2L12 3z" /><path d="M12 10v5" /><circle cx="12" cy="18" r="0.6" fill="currentColor" /></svg>;
  if (name === "info") return <svg {...props}><circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><circle cx="12" cy="8" r="0.6" fill="currentColor" /></svg>;
  if (name === "plus") return <svg {...props}><path d="M12 5v14M5 12h14" /></svg>;
  if (name === "trash") return <svg {...props}><path d="M4 7h16" /><path d="M10 11v6M14 11v6" /><path d="M6 7l1 14h10l1-14" /><path d="M9 7V4h6v3" /></svg>;
  return null;
}

function Field({ label, icon, children, error, hint }) {
  return (
    <label className="field">
      <span className="field-label">{icon && <Icon name={icon} size={16} />}<span>{label}</span></span>
      {children}
      {hint && !error && <span className="field-hint">{hint}</span>}
      {error && <span className="field-error"><Icon name="alert" size={14} />{error}</span>}
    </label>
  );
}

function NumberInput({ value, onChange, placeholder, suffix }) {
  return (
    <span className="input-wrap">
      <input type="number" inputMode="decimal" min="0" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="input" />
      {suffix && <span className="input-suffix">{suffix}</span>}
    </span>
  );
}

function DateInput({ value, onChange }) {
  return <span className="input-wrap"><input type="date" value={value} onChange={e => onChange(e.target.value)} className="input input-date" /></span>;
}

function SelectInput({ value, onChange, children }) {
  return <select value={value} onChange={e => onChange(e.target.value)} className="input">{children}</select>;
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

function EmptyResults() {
  return (
    <div className="empty-state">
      <div className="empty-illus"><Icon name="scale" size={36} /></div>
      <h3 className="empty-title">لم يتم احتساب أي تعويض بعد</h3>
      <p className="empty-text">أدخل بيانات الحادثة ثم اضغط «احتسب التعويضات» لعرض النتائج التفصيلية هنا.</p>
    </div>
  );
}

function VictimResults({ results }) {
  const r = results.results;
  const faute = r.fauteInexcusable;
  return (
    <>
      <article className="result-card">
        <ResultHeader index={1} label="الأجرة اليومية المعتمدة" amount={r.salaireJournalier.sj} />
        <div className="result-body">
          <ResultRow label="الأجرة قبل SMIG">{formatMoney(r.salaireJournalier.details.sj_before)}</ResultRow>
          <ResultRow label="SMIG اليومي">{formatMoney(r.salaireJournalier.details.smig_journalier)}</ResultRow>
          <ResultRow label="تطبيق الحد الأدنى">{r.salaireJournalier.smig_applied ? <span className="badge badge-warn">تم التطبيق</span> : <span className="badge badge-ok">غير مطبق</span>}</ResultRow>
        </div>
      </article>
      <article className="result-card">
        <ResultHeader index={2} label="تعويض العجز المؤقت" amount={r.itt.montant} />
        <div className="result-body">
          <ResultRow label="عدد الأيام">{formatNumber(r.itt.details.nombreJours)} يوم</ResultRow>
          <ResultRow label="النسبة">2/3</ResultRow>
          <ResultRow label="المعادلة" emphasis>{formatNumber(r.itt.details.nombreJours)} × {formatNumber(r.itt.details.salaireJournalier)} × 2/3 = <strong>{formatMoney(r.itt.montant)}</strong></ResultRow>
        </div>
      </article>
      <article className="result-card">
        <ResultHeader index={3} label={r.ipp.type === "capital" ? "رأسمال العجز الدائم" : r.ipp.type === "rente" ? "إيراد العجز الدائم" : "العجز الدائم"} amount={r.ipp.montant} />
        <div className="result-body">
          <ResultRow label="سن الضحية">{formatNumber(results.age)} سنة</ResultRow>
          <ResultRow label="نسبة IPP">{formatNumber(r.ipp.details.tauxIPP * 100)}%</ResultRow>
          <ResultRow label="النسبة الفعلية">{formatNumber(r.ipp.taux_effectif * 100)}%</ResultRow>
          <ResultRow label="نوع التعويض"><span className="badge badge-ok">{ippTypeLabel(r.ipp.type)}</span></ResultRow>
          <ResultRow label="المعادلة" emphasis>{formatNumber(r.ipp.details.salaireAnnuel)} × {formatNumber(r.ipp.taux_effectif)} = <strong>{formatMoney(r.ipp.montant)}</strong></ResultRow>
        </div>
      </article>
      {faute && (
        <article className="result-card">
          <ResultHeader index={4} label="الخطأ غير المعذور" amount={faute.capital_majoration} />
          <div className="result-body">
            <ResultRow label="العمود المعتمد">{faute.col_used}</ResultRow>
            <ResultRow label="السن المعتمد">{formatNumber(faute.age_used)} سنة</ResultRow>
            <ResultRow label="معامل الجدول">{formatNumber(faute.prix)}</ResultRow>
            <ResultRow label="المعادلة" emphasis>{formatNumber(faute.details.renteIPP_annuelle)} × {formatNumber(faute.prix)} = <strong>{formatMoney(faute.capital_majoration)}</strong></ResultRow>
          </div>
        </article>
      )}
    </>
  );
}

function DeathResults({ results }) {
  const r = results.results;
  return (
    <>
      {r.conjoint && (
        <article className="result-card">
          <ResultHeader index={1} label="رأسمال الزوج أو الزوجة" amount={r.conjoint.capital_constitution || 0} />
          <div className="result-body">
            {r.conjoint.error ? (
              <ResultRow label="الحالة"><span className="badge badge-warn">{r.conjoint.error}</span></ResultRow>
            ) : (
              <>
                <ResultRow label="السن">{formatNumber(r.conjoint.age)} سنة</ResultRow>
                <ResultRow label="الإيراد السنوي">{formatMoney(r.conjoint.rente_annuelle)}</ResultRow>
                <ResultRow label="النسبة">50%</ResultRow>
                <ResultRow label="الرأسمال" emphasis><strong>{formatMoney(r.conjoint.capital_constitution)}</strong></ResultRow>
              </>
            )}
          </div>
        </article>
      )}
      <article className="result-card">
        <ResultHeader index={2} label="إيراد الأبناء" amount={r.enfants.rente_annuelle} />
        <div className="result-body">
          <ResultRow label="النسبة الإجمالية">{formatNumber(r.enfants.taux_global * 100)}%</ResultRow>
          <div className="brackets">
            {(r.enfants.par_enfant || []).map((child, index) => (
              <div className="bracket-row" key={index}><span>{child.statut} · {formatNumber(child.age)} سنة</span><span>{formatMoney(child.rente)}</span></div>
            ))}
            {(r.enfants.capital_par_enfant || []).map((child, index) => (
              <div className="bracket-row" key={`capital-${index}`}><span>رأسمال طفل {index + 1}</span><span>{formatMoney(child.capital)}</span></div>
            ))}
          </div>
        </div>
      </article>
      <article className="result-card">
        <ResultHeader index={3} label="إيراد الأصول" amount={r.ascendants.rente_totale} />
        <div className="result-body">
          <ResultRow label="النسبة الفعلية">{formatNumber(r.ascendants.taux_effectif * 100)}%</ResultRow>
          <ResultRow label="الإيراد لكل أصل">{formatMoney(r.ascendants.rente_par_ascendant)}</ResultRow>
          <div className="brackets">
            {(r.ascendants.capital_par_ascendant || []).map((asc, index) => (
              <div className="bracket-row" key={index}><span>أصل {index + 1} · {formatNumber(asc.age)} سنة</span><span>{formatMoney(asc.capital)}</span></div>
            ))}
          </div>
        </div>
      </article>
      <article className="result-card">
        <ResultHeader index={4} label="سقف ذوي الحقوق" amount={r.plafond.total_apres_plafond} />
        <div className="result-body">
          <ResultRow label="قبل السقف">{formatMoney(r.plafond.total_avant_plafond)}</ResultRow>
          <ResultRow label="السقف 85%">{formatMoney(r.plafond.plafond)}</ResultRow>
          <ResultRow label="تطبيق التخفيض">{r.plafond.reduction_applied ? <span className="badge badge-warn">نعم</span> : <span className="badge badge-ok">لا</span>}</ResultRow>
          <ResultRow label="بعد السقف" emphasis><strong>{formatMoney(r.plafond.total_apres_plafond)}</strong></ResultRow>
        </div>
      </article>
    </>
  );
}

export default function TravailPage() {
  const [mode, setMode] = useState("victime");
  const [form, setForm] = useState({
    dateAccident: "",
    secteur: "industrie",
    salaire: "",
    periodicite: "mensuel",
    nombreJours: "",
    tauxIPP: "",
    dateNaissance: "",
    fauteInexcusable: false,
    decesSalary: "",
    decesPeriodicity: "mensuel",
    spouseCount: 0,
    spouseBirthdate: "",
    childrenNormal: 0,
    childrenApprenti: 0,
    childrenEtudiant: 0,
    childrenHandicap: 0,
    ascendantsCount: 0,
    fatherBirthdate: "",
    motherBirthdate: ""
  });
  const [errors, setErrors] = useState({});
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const resultsRef = useRef(null);

  const total = useMemo(() => {
    if (!results) return 0;
    if (results.mode === "victime") {
      const r = results.results;
      return Number(r.itt?.montant || 0) + Number(r.ipp?.montant || 0) + Number(r.fauteInexcusable?.capital_majoration || 0);
    }
    return Number(results.results.plafond?.total_apres_plafond || 0);
  }, [results]);

  function update(name, value) {
    setForm(current => ({ ...current, [name]: value }));
    if (errors[name]) setErrors(current => ({ ...current, [name]: undefined }));
  }

  function validateForm() {
    const next = {};
    if (!form.dateAccident) next.dateAccident = "يرجى إدخال تاريخ الحادثة";
    if (mode === "victime") {
      if (!Number(form.salaire) || Number(form.salaire) <= 0) next.salaire = "يرجى إدخال أجر صحيح";
      if (!Number(form.nombreJours) || Number(form.nombreJours) <= 0) next.nombreJours = "يرجى إدخال عدد أيام صحيح";
      if (form.tauxIPP === "" || Number(form.tauxIPP) < 0 || Number(form.tauxIPP) > 100) next.tauxIPP = "نسبة العجز يجب أن تكون بين 0 و100";
      if (!form.dateNaissance) next.dateNaissance = "يرجى إدخال تاريخ ميلاد الضحية";
    } else {
      if (!Number(form.decesSalary) || Number(form.decesSalary) <= 0) next.decesSalary = "يرجى إدخال راتب صحيح";
      if (![0, 1].includes(Number(form.spouseCount))) next.spouseCount = "عدد الأزواج يجب أن يكون 0 أو 1";
      if (Number(form.spouseCount) > 0 && !form.spouseBirthdate) next.spouseBirthdate = "يرجى إدخال تاريخ ميلاد الزوج";
      if (Number(form.ascendantsCount) < 0 || Number(form.ascendantsCount) > 2) next.ascendantsCount = "عدد الأصول يجب أن يكون بين 0 و2";
      if (Number(form.ascendantsCount) === 1 && !form.fatherBirthdate) next.fatherBirthdate = "يرجى إدخال تاريخ ميلاد الأصل";
      if (Number(form.ascendantsCount) === 2 && !form.fatherBirthdate) next.fatherBirthdate = "يرجى إدخال تاريخ ميلاد الأب";
      if (Number(form.ascendantsCount) === 2 && !form.motherBirthdate) next.motherBirthdate = "يرجى إدخال تاريخ ميلاد الأم";
    }
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
      const body = mode === "victime"
        ? {
            mode,
            salaire: Number(form.salaire),
            periodicite: form.periodicite,
            secteur: form.secteur,
            nombreJours: Number(form.nombreJours),
            tauxIPP: Number(form.tauxIPP),
            dateNaissance: form.dateNaissance,
            dateAccident: form.dateAccident,
            fauteInexcusable: form.fauteInexcusable
          }
        : {
            mode,
            salary: Number(form.decesSalary),
            salary_periodicity: form.decesPeriodicity,
            secteur: form.secteur,
            dateAccident: form.dateAccident,
            spouse: {
              count: Number(form.spouseCount),
              birthdate: form.spouseBirthdate || undefined
            },
            children: {
              normal: Number(form.childrenNormal),
              apprenti: Number(form.childrenApprenti),
              etudiant: Number(form.childrenEtudiant),
              handicap: Number(form.childrenHandicap)
            },
            ascendants: [
              ...(Number(form.ascendantsCount) >= 1 ? [{ birthdate: form.fatherBirthdate }] : []),
              ...(Number(form.ascendantsCount) >= 2 ? [{ birthdate: form.motherBirthdate }] : [])
            ]
          };
      const response = await fetch("/api/travail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "API error");
      setResults(data);
      setTimeout(() => {
        if (window.innerWidth < 960 && resultsRef.current) {
          window.scrollTo({ top: resultsRef.current.getBoundingClientRect().top + window.scrollY - 16, behavior: "smooth" });
        }
      }, 60);
    } catch (error) {
      setApiError("حدث خطأ في الحساب — يرجى التحقق من المعطيات المدخلة");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>حاسبة حوادث الشغل</title>
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
            --f-head: 'Noto Kufi Arabic', system-ui, sans-serif;
            --f-body: 'Noto Naskh Arabic', system-ui, sans-serif;
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
          @media (max-width: 960px) { .grid { grid-template-columns: 1fr; } .results-panel { position: static !important; } }
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
          .field-hint { font-size: 12px; color: var(--c-text-500); }
          .field-error { display: flex; align-items: center; gap: 5px; font-size: 12px; color: var(--c-red-600); font-weight: 600; }
          .input-wrap { position: relative; display: flex; align-items: center; }
          .input { width: 100%; padding: 11px 16px; padding-left: 58px; font-size: 15px; color: var(--c-text-900); background: var(--c-bg); border: 1.5px solid var(--c-border); border-radius: var(--r-md); text-align: right; outline: none; }
          .input:focus { border-color: var(--c-green-600); box-shadow: 0 0 0 3px oklch(45% .115 158 / .12); }
          .input-suffix { position: absolute; left: 14px; font-size: 13px; color: var(--c-text-500); pointer-events: none; font-family: var(--f-body); font-weight: 500; line-height: 1; }
          .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
          .segmented { display: flex; gap: 6px; background: var(--c-surface-alt); border: 1.5px solid var(--c-border); border-radius: var(--r-md); padding: 4px; }
          .segment { flex: 1; padding: 9px 12px; font-family: var(--f-head); font-size: 14px; font-weight: 600; color: var(--c-text-500); border-radius: var(--r-sm); text-align: center; }
          .segment.is-active { background: var(--c-green-600); color: #fff; box-shadow: var(--shadow-sm); }
          .toggle-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 14px 16px; background: var(--c-surface-alt); border: 1.5px solid var(--c-border); border-radius: var(--r-md); text-align: right; }
          .toggle-row.is-on { border-color: var(--c-green-600); background: var(--c-green-50); }
          .toggle-text { display: flex; flex-direction: column; gap: 2px; }
          .toggle-label { font-family: var(--f-head); font-size: 14px; font-weight: 700; color: var(--c-text-900); }
          .toggle-desc { font-size: 12px; color: var(--c-text-500); }
          .toggle-track { position: relative; width: 42px; height: 24px; border-radius: 999px; background: var(--c-border-strong); flex-shrink: 0; }
          .is-on .toggle-track { background: var(--c-green-600); }
          .toggle-knob { position: absolute; top: 3px; right: 3px; width: 18px; height: 18px; border-radius: 50%; background: #fff; box-shadow: 0 1px 4px oklch(0% 0 0 / .20); transition: transform .2s; }
          .is-on .toggle-knob { transform: translateX(-18px); }
          .btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 13px 24px; background: var(--c-green-600); color: #fff; font-family: var(--f-head); font-size: 15px; font-weight: 800; border-radius: var(--r-md); box-shadow: var(--shadow-sm); }
          .btn-primary:hover { background: var(--c-green-700); }
          .btn-primary:disabled { opacity: .65; cursor: not-allowed; }
          .btn-ghost { display: inline-flex; align-items: center; gap: 6px; padding: 11px 18px; color: var(--c-text-500); font-family: var(--f-head); font-size: 14px; font-weight: 600; border: 1.5px solid var(--c-border); border-radius: var(--r-md); }
          .alert { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-radius: var(--r-md); font-size: 14px; font-weight: 600; border: 1.5px solid; }
          .alert-error { background: var(--c-red-100); color: var(--c-red-600); border-color: var(--c-red-600); }
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
          .row-val { color: var(--c-text-900); text-align: left; direction: ltr; }
          .brackets { background: var(--c-surface-alt); border: 1px solid var(--c-border); border-radius: var(--r-sm); padding: 10px 12px; display: flex; flex-direction: column; gap: 6px; }
          .bracket-row { display: flex; justify-content: space-between; gap: 12px; font-size: 12.5px; color: var(--c-text-700); }
          .badge { display: inline-flex; align-items: center; padding: 2px 9px; border-radius: 999px; font-size: 11px; font-weight: 700; font-family: var(--f-head); }
          .badge-ok { background: var(--c-green-100); color: var(--c-green-700); }
          .badge-warn { background: oklch(94% 0.04 60); color: oklch(40% 0.10 60); }
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
        <section className="hero">
          <div className="hero-inner">
            <div className="hero-simple">
              <Icon name="scale" size={36} />
              <h1 className="hero-simple-title">حاسبة حوادث الشغل</h1>
            </div>
          </div>
        </section>

        <div className="container">
          <div className="ad-slot"><span>إعلان</span><span>728 × 90</span></div>

          <main className="grid">
            <form onSubmit={handleSubmit} noValidate className="panel form-panel">
              <header className="panel-head">
                <span className="panel-step">١</span>
                <div>
                  <h2 className="panel-title">بيانات الحادثة</h2>
                  <p className="panel-sub">اختر نوع الحساب وأدخل المعطيات الأساسية.</p>
                </div>
              </header>

              <div className="panel-body">
                <div className="segmented" role="radiogroup" aria-label="نوع الحساب">
                  <button type="button" className={`segment ${mode === "victime" ? "is-active" : ""}`} onClick={() => { setMode("victime"); setResults(null); }}>الضحية</button>
                  <button type="button" className={`segment ${mode === "deces" ? "is-active" : ""}`} onClick={() => { setMode("deces"); setResults(null); }}>ذوو الحقوق</button>
                </div>

                {mode === "victime" && (
                  <Field label="تاريخ ميلاد الضحية" icon="calendar" error={errors.dateNaissance}>
                    <DateInput value={form.dateNaissance} onChange={value => update("dateNaissance", value)} />
                  </Field>
                )}

                <Field label="تاريخ الحادثة" icon="calendar" error={errors.dateAccident}>
                  <DateInput value={form.dateAccident} onChange={value => update("dateAccident", value)} />
                </Field>

                <Field label="القطاع" icon="user">
                  <SelectInput value={form.secteur} onChange={value => update("secteur", value)}>
                    <option value="industrie">الصناعة والتجارة والخدمات</option>
                    <option value="agriculture">الفلاحة</option>
                  </SelectInput>
                </Field>

                {mode === "victime" ? (
                  <>
                    <div className="row-2">
                      <Field label="الأجر" error={errors.salaire}>
                        <NumberInput value={form.salaire} onChange={value => update("salaire", value)} placeholder="0.00" suffix="درهم" />
                      </Field>
                      <Field label="دورية الأجر">
                        <SelectInput value={form.periodicite} onChange={value => update("periodicite", value)}>
                          <option value="mensuel">شهري</option>
                          <option value="hebdomadaire">أسبوعي</option>
                          <option value="journalier">يومي</option>
                        </SelectInput>
                      </Field>
                    </div>
                    <div className="row-2">
                      <Field label="أيام العجز المؤقت" error={errors.nombreJours}>
                        <NumberInput value={form.nombreJours} onChange={value => update("nombreJours", value)} placeholder="0" suffix="يوم" />
                      </Field>
                      <Field label="نسبة العجز الدائم" error={errors.tauxIPP}>
                        <NumberInput value={form.tauxIPP} onChange={value => update("tauxIPP", value)} placeholder="0" suffix="%" />
                      </Field>
                    </div>
                    <ToggleRow checked={form.fauteInexcusable} onChange={value => update("fauteInexcusable", value)} label="خطأ غير معذور" description="احتساب رأسمال الزيادة عند ثبوت الخطأ غير المعذور." />
                  </>
                ) : (
                  <>
                    <div className="row-2">
                      <Field label="الراتب" error={errors.decesSalary}>
                        <NumberInput value={form.decesSalary} onChange={value => update("decesSalary", value)} placeholder="0.00" suffix="درهم" />
                      </Field>
                      <Field label="الدورية">
                        <SelectInput value={form.decesPeriodicity} onChange={value => update("decesPeriodicity", value)}>
                          <option value="mensuel">شهري</option>
                          <option value="annuel">سنوي</option>
                        </SelectInput>
                      </Field>
                    </div>

                    <Field label="الزوج (عدد الأزواج)" error={errors.spouseCount}>
                      <NumberInput value={form.spouseCount} onChange={value => update("spouseCount", value)} placeholder="0" />
                    </Field>
                    {Number(form.spouseCount) > 0 && (
                      <div className="brackets">
                        <Field label="تاريخ ميلاد الزوج/الزوجة" icon="calendar" error={errors.spouseBirthdate}>
                          <DateInput value={form.spouseBirthdate} onChange={value => update("spouseBirthdate", value)} />
                        </Field>
                      </div>
                    )}

                    <div className="brackets">
                      <div className="bracket-row"><strong>الأبناء</strong><span>أدخل عدد المستفيدين حسب الصفة</span></div>
                      <div className="row-2">
                        <Field label="اليتامى">
                          <NumberInput value={form.childrenNormal} onChange={value => update("childrenNormal", value)} placeholder="0" />
                        </Field>
                        <Field label="اليتامى (تدريب مهني)">
                          <NumberInput value={form.childrenApprenti} onChange={value => update("childrenApprenti", value)} placeholder="0" />
                        </Field>
                      </div>
                      <div className="row-2">
                        <Field label="اليتامى (طلبة)">
                          <NumberInput value={form.childrenEtudiant} onChange={value => update("childrenEtudiant", value)} placeholder="0" />
                        </Field>
                        <Field label="اليتامى (إعاقة)">
                          <NumberInput value={form.childrenHandicap} onChange={value => update("childrenHandicap", value)} placeholder="0" />
                        </Field>
                      </div>
                    </div>

                    <div className="brackets">
                      <Field label="عدد الأصول" error={errors.ascendantsCount}>
                        <NumberInput value={form.ascendantsCount} onChange={value => update("ascendantsCount", value)} placeholder="0" />
                      </Field>
                      {Number(form.ascendantsCount) === 1 && (
                        <Field label="تاريخ ميلاد الأصل" icon="calendar" error={errors.fatherBirthdate}>
                          <DateInput value={form.fatherBirthdate} onChange={value => update("fatherBirthdate", value)} />
                        </Field>
                      )}
                      {Number(form.ascendantsCount) === 2 && (
                        <div className="row-2">
                          <Field label="تاريخ ميلاد الأب" icon="calendar" error={errors.fatherBirthdate}>
                            <DateInput value={form.fatherBirthdate} onChange={value => update("fatherBirthdate", value)} />
                          </Field>
                          <Field label="تاريخ ميلاد الأم" icon="calendar" error={errors.motherBirthdate}>
                            <DateInput value={form.motherBirthdate} onChange={value => update("motherBirthdate", value)} />
                          </Field>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              <footer className="panel-foot">
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? "جارٍ الحساب..." : <><Icon name="plus" size={16} />احتسب التعويضات</>}
                </button>
              </footer>
            </form>

            <section className="panel results-panel" ref={resultsRef} aria-live="polite">
              <header className="panel-head">
                <span className="panel-step panel-step-accent">٢</span>
                <div>
                  <h2 className="panel-title">النتائج</h2>
                  <p className="panel-sub">ستظهر تفاصيل الحساب حسب قانون حوادث الشغل.</p>
                </div>
              </header>
              <div className="panel-body results-body">
                {apiError && <div className="alert alert-error"><Icon name="alert" size={18} /><span>{apiError}</span></div>}
                {!results && !apiError && <EmptyResults />}
                {results?.mode === "victime" && <VictimResults results={results} />}
                {results?.mode === "deces" && <DeathResults results={results} />}
                {results && (
                  <div className="total-card">
                    <div className="total-inner">
                      <span className="total-eyebrow"><Icon name="scale" size={14} />المجموع المرجعي</span>
                      <div><span className="total-amount-num">{formatNumber(total)}</span><span className="total-amount-curr"> درهم</span></div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </main>

          <div className="ad-slot"><span>إعلان</span><span>728 × 90</span></div>
        </div>

        <footer className="site-foot">
          <div className="site-foot-inner">
            <p className="site-foot-text">حاسبة حوادث الشغل · أداة قانونية للاستئناس فقط</p>
          </div>
        </footer>
      </div>
    </>
  );
}
