const path = require("path");
const { sendSuccess, sendError } = require("../../lib/apiResponse");

function loadEngines() {
  const runtimeRequire = eval("require");
  const itt = runtimeRequire(path.join(process.cwd(), "engine/work_accidents/wa_itt.js"));
  const ipp = runtimeRequire(path.join(process.cwd(), "engine/work_accidents/wa_ipp.js"));
  const ayantsDroit = runtimeRequire(path.join(process.cwd(), "engine/work_accidents/wa_ayants_droit.js"));
  return {
    calcSalaireJournalier: itt.calcSalaireJournalier,
    calcITT_WA: itt.calcITT_WA,
    calcIPP_WA: ipp.calcIPP_WA,
    calcFauteInexcusable: ipp.calcFauteInexcusable,
    calcRenteConjoint: ayantsDroit.calcRenteConjoint,
    calcRenteEnfants: ayantsDroit.calcRenteEnfants,
    calcRenteAscendants: ayantsDroit.calcRenteAscendants,
    calcPlafondAyantsDroit: ayantsDroit.calcPlafondAyantsDroit
  };
}

function ageInFullYears(dateNaissance, dateReference) {
  const birth = new Date(dateNaissance);
  const ref = new Date(dateReference);
  if (Number.isNaN(birth.getTime()) || Number.isNaN(ref.getTime()) || birth > ref) {
    throw new Error("ERR_INVALID_DATE");
  }
  let age = ref.getFullYear() - birth.getFullYear();
  const m = ref.getMonth() - birth.getMonth();
  const d = ref.getDate() - birth.getDate();
  if (m < 0 || (m === 0 && d < 0)) age--;
  return age;
}

function annualizeSalary(salaire, periodicite) {
  if (periodicite === "mensuel") return salaire * 12;
  if (periodicite === "hebdomadaire") return salaire * 52;
  if (periodicite === "journalier") return salaire * 300;
  if (periodicite === "annuel") return salaire;
  return NaN;
}

function syntheticBirthdateFromAge(age, dateReference) {
  const ref = new Date(dateReference);
  if (Number.isNaN(ref.getTime())) throw new Error("ERR_INVALID_DATE");
  return `${ref.getFullYear() - age}-01-01`;
}

function countToChildren(count, statut, age, dateAccident) {
  return Array.from({ length: Math.max(0, Number(count) || 0) }, () => ({
    dateNaissance: syntheticBirthdateFromAge(age, dateAccident),
    statut
  }));
}

function hasError(result) {
  return result && result.error;
}

function fail(res, error) {
  return sendError(res, "travail", 400, "VALIDATION_ERROR", "المعطيات المدخلة غير مكتملة");
}

function validateVictime(body) {
  if (!body.dateNaissance || !body.dateAccident) return "تاريخ غير صالح";
  const birth = new Date(body.dateNaissance);
  const accident = new Date(body.dateAccident);
  if (Number.isNaN(birth.getTime()) || Number.isNaN(accident.getTime())) return "تاريخ غير صالح";
  if (accident <= birth) return "يجب أن يكون تاريخ الحادثة بعد تاريخ الازدياد";

  const salaire = Number(body.salaire);
  if (!Number.isFinite(salaire) || salaire <= 0) return "يجب أن يكون الراتب عدداً موجباً";

  if (!["mensuel", "hebdomadaire", "journalier"].includes(body.periodicite)) return "دورية الراتب غير صالحة";
  if (!["industrie", "agriculture"].includes(body.secteur)) return "القطاع يجب أن يكون صناعة أو فلاحة";

  const jours = Number(body.nombreJours);
  if (!Number.isFinite(jours) || jours < 0) return "عدد أيام العجز يجب أن يكون صفراً أو أكثر";

  const taux = Number(body.tauxIPP);
  if (!Number.isFinite(taux) || taux < 0 || taux > 100) return "نسبة العجز الدائم يجب أن تكون بين 0 و 100";

  return null;
}

function validateDeces(body) {
  if (!body.dateAccident || Number.isNaN(new Date(body.dateAccident).getTime())) return "تاريخ غير صالح";
  if (!["industrie", "agriculture"].includes(body.secteur)) return "القطاع يجب أن يكون صناعة أو فلاحة";

  const salary = Number(body.salary);
  if (!Number.isFinite(salary) || salary <= 0) return "يجب أن يكون الراتب عدداً موجباً";

  if (!["mensuel", "annuel"].includes(body.salary_periodicity || "annuel")) return "دورية الراتب غير صالحة";

  const spouseCount = Number((body.spouse || {}).count || 0);
  if (![0, 1].includes(spouseCount)) return "عدد المستفيدين يجب أن يكون 0 أو 1";

  if (spouseCount === 1 && !(body.spouse || {}).birthdate) {
    return "تاريخ ازدياد الزوج/الزوجة مطلوب";
  }

  const children = body.children || {};
  for (const k of ["normal", "apprenti", "etudiant", "handicap"]) {
    if (children[k] !== undefined) {
      const n = Number(children[k]);
      if (!Number.isInteger(n) || n < 0) return "عدد المستفيدين يجب أن يكون صفراً أو أكثر";
    }
  }

  const ascendants = Array.isArray(body.ascendants) ? body.ascendants : [];
  if (ascendants.length > 2) return "عدد الصاعدين يجب ألا يتجاوز اثنين";

  for (const a of ascendants) {
    if (!a.birthdate || Number.isNaN(new Date(a.birthdate).getTime())) return "تاريخ غير صالح";
  }

  return null;
}

export default function handler(req, res) {
  if (req.method !== "POST") {
    return sendError(res, "travail", 405, "METHOD_NOT_ALLOWED", "طريقة الطلب غير مسموح بها");
  }

  try {
    const body = req.body || {};
    const mode = body.mode;

    if (mode !== "victime" && mode !== "deces") {
      return sendError(res, "travail", 400, "VALIDATION_ERROR", "وضع الحساب غير صالح");
    }

    if (mode === "victime") {
      const err = validateVictime(body);
      if (err) return sendError(res, "travail", 400, "VALIDATION_ERROR", err);
    }

    if (mode === "deces") {
      const err = validateDeces(body);
      if (err) return sendError(res, "travail", 400, "VALIDATION_ERROR", err);
    }

    const {
      calcSalaireJournalier,
      calcITT_WA,
      calcIPP_WA,
      calcFauteInexcusable,
      calcRenteConjoint,
      calcRenteEnfants,
      calcRenteAscendants,
      calcPlafondAyantsDroit
    } = loadEngines();

    if (mode === "victime") {
      const salaire = Number(body.salaire);
      const nombreJours = Number(body.nombreJours);
      const tauxIPP = Number(body.tauxIPP) / 100;
      const secteur = body.secteur;
      const periodicite = body.periodicite;
      const age = ageInFullYears(body.dateNaissance, body.dateAccident);
      const salaireAnnuel = annualizeSalary(salaire, periodicite);

      const salaireJournalier = calcSalaireJournalier(salaire, periodicite, secteur);
      if (hasError(salaireJournalier)) return fail(res, salaireJournalier.error);

      const itt = calcITT_WA(nombreJours, salaireJournalier.sj, secteur);
      if (hasError(itt)) return fail(res, itt.error);

      const ipp = calcIPP_WA(tauxIPP, salaireAnnuel, age, secteur);
      if (hasError(ipp)) return fail(res, ipp.error);

      let faute = null;
      if (body.fauteInexcusable && tauxIPP > 0) {
        const renteIPPAnnuelle = ipp.type === "rente"
          ? ipp.montant
          : Math.round((ipp.details.salaireAnnuel * ipp.taux_effectif) * 100) / 100;
        faute = calcFauteInexcusable(renteIPPAnnuelle, tauxIPP, age);
        if (hasError(faute)) return fail(res, faute.error);
      }

      return sendSuccess(res, "travail", {
        mode,
        age,
        inputs: { salaire, periodicite, secteur, nombreJours, tauxIPP, salaireAnnuel, fauteInexcusable: Boolean(body.fauteInexcusable) },
        results: {
          salaireJournalier,
          itt,
          ipp,
          fauteInexcusable: faute
        }
      });
    }

    if (mode === "deces") {
      const salary = Number(body.salary);
      const salaryPeriodicity = body.salary_periodicity || "annuel";
      const salaireAnnuel = salaryPeriodicity === "mensuel" ? salary * 12 : salary;
      const secteur = body.secteur;
      const dateAccident = body.dateAccident;
      const spouseInput = body.spouse || { count: 0 };
      const childrenInput = body.children || {};
      const ascendantsInput = Array.isArray(body.ascendants) ? body.ascendants : [];
      const spouseCount = Number(spouseInput.count || 0);

      let conjoint = null;
      if (spouseCount > 0 && spouseInput.birthdate) {
        const ageConjoint = ageInFullYears(spouseInput.birthdate, dateAccident);
        conjoint = calcRenteConjoint(
          salaireAnnuel,
          ageConjoint,
          true,
          secteur
        );
        if (!hasError(conjoint)) {
          conjoint.age = ageConjoint;
        }
      }

      const enfantsInput = []
        .concat(countToChildren(childrenInput.normal, "normal", 14, dateAccident))
        .concat(countToChildren(childrenInput.apprenti, "apprenti", 19, dateAccident))
        .concat(countToChildren(childrenInput.etudiant, "etudiant", 23, dateAccident))
        .concat(countToChildren(childrenInput.handicap, "handicap", 30, dateAccident));

      const enfants = enfantsInput.map(enfant => ({
        age: ageInFullYears(enfant.dateNaissance, dateAccident),
        statut: enfant.statut
      }));
      const enfantsResult = calcRenteEnfants(salaireAnnuel, enfants, secteur);
      if (hasError(enfantsResult)) return fail(res, enfantsResult.error);

      const ascendants = ascendantsInput.map(ascendant => ({
        age: ageInFullYears(ascendant.birthdate, dateAccident)
      }));
      const ascendantsResult = calcRenteAscendants(salaireAnnuel, ascendants, secteur);
      if (hasError(ascendantsResult)) return fail(res, ascendantsResult.error);

      const rentes = {
        conjoint: conjoint && !hasError(conjoint) ? conjoint.rente_annuelle : 0,
        enfants: enfantsResult.rente_annuelle,
        ascendants: ascendantsResult.rente_totale
      };
      const plafond = calcPlafondAyantsDroit(salaireAnnuel, rentes, secteur);
      if (hasError(plafond)) return fail(res, plafond.error);

      return sendSuccess(res, "travail", {
        mode,
        salary,
        spouse: {
          count: spouseCount,
          birthdate: spouseInput.birthdate
        },
        children: {
          normal: Number(childrenInput.normal || 0),
          apprenti: Number(childrenInput.apprenti || 0),
          etudiant: Number(childrenInput.etudiant || 0),
          handicap: Number(childrenInput.handicap || 0)
        },
        ascendants: ascendantsInput,
        inputs: { salaireAnnuel, secteur, dateAccident, salary_periodicity: salaryPeriodicity },
        ages: {
          conjoint: conjoint && conjoint.age,
          enfants,
          ascendants
        },
        results: {
          conjoint,
          enfants: enfantsResult,
          ascendants: ascendantsResult,
          plafond
        }
      });
    }
  } catch (error) {
    return sendError(res, "travail", 500, "INTERNAL_ERROR", "حدث خطأ داخلي أثناء الحساب");
  }
}
