let tarifs;
try {
  tarifs = require("../../data/tarifs_1812.json");
} catch (e) {
  tarifs = require("../../data/tarifs_decret_2-10-319.json");
}
const smigData = require("../../data/smig.json");
const t1 = tarifs.tableau1.data;
const t2 = tarifs.tableau2.data;
const t3 = tarifs.tableau3.data;
const t4 = tarifs.tableau4.data;

const round2 = x => Math.round(x * 100) / 100;

function validateNumber(x) {
  return typeof x === "number" && !isNaN(x);
}

function isValidSecteur(s) {
  return s === "industrie" || s === "agriculture";
}

function getSmig(secteur) {
  if (secteur === "agriculture") {
    return {
      journalier: smigData.agriculture.journalier,
      annuel:     smigData.agriculture.annuel
    };
  }
  return {
    journalier: smigData.industrie_commerce_services.journalier_base26,
    annuel:     smigData.industrie_commerce_services.annuel
  };
}

function clampAge(age, min, max) {
  return Math.min(Math.max(Math.floor(age), min), max);
}

function lookupTable(table, age, min, max) {
  const key = String(clampAge(age, min, max));
  const val = table[key];
  if (val === undefined) return { error: "ERR_TABLE_LOOKUP" };
  return val;
}

function calcRenteConjoint(salaireAnnuel, ageConjoint, mariageAvantAccident, secteur) {
  if (!isValidSecteur(secteur)) return { error: "ERR_INVALID_SECTEUR" };
  if (!validateNumber(salaireAnnuel) || salaireAnnuel <= 0) return { error: "ERR_INVALID_SALARY" };
  if (!validateNumber(ageConjoint) || ageConjoint < 0) return { error: "ERR_INVALID_AGE" };
  if (mariageAvantAccident === false) return { error: "ERR_MARIAGE_APRES_ACCIDENT" };

  const { annuel } = getSmig(secteur);
  const sal_before = salaireAnnuel;
  salaireAnnuel = Math.max(salaireAnnuel, annuel);
  const smig_applied = sal_before < annuel;
  const rente_annuelle = round2(salaireAnnuel * 0.50);
  const coef = lookupTable(t2, ageConjoint, 18, 106);
  if (coef.error) return coef;

  return {
    rente_annuelle,
    capital_constitution: round2(rente_annuelle * coef),
    details: { ageConjoint, age_used: clampAge(ageConjoint, 18, 106), taux: 0.50, smig_applied, salaireAnnuel: round2(salaireAnnuel), secteur }
  };
}

function calcRenteEnfants(salaireAnnuel, enfants, secteur) {
  if (!Array.isArray(enfants)) return { error: "ERR_INVALID_ENFANTS" };
  const STATUTS = ["normal", "etudiant", "apprenti", "handicap"];
  for (const e of enfants) {
    if (!validateNumber(e.age)) return { error: "ERR_INVALID_AGE" };
    if (!STATUTS.includes(e.statut)) return { error: "ERR_INVALID_STATUT" };
  }
  if (!isValidSecteur(secteur)) return { error: "ERR_INVALID_SECTEUR" };
  if (!validateNumber(salaireAnnuel) || salaireAnnuel <= 0) return { error: "ERR_INVALID_SALARY" };

  function isEligible(e) {
    if (e.statut === "handicap") return true;
    if (e.statut === "etudiant") return e.age <= 26;
    if (e.statut === "apprenti") return e.age <= 21;
    return e.age <= 16;
  }

  const { annuel } = getSmig(secteur);
  const sal_before = salaireAnnuel;
  salaireAnnuel = Math.max(salaireAnnuel, annuel);
  const smig_applied = sal_before < annuel;
  const eligible = enfants.filter(isEligible);
  const n = eligible.length;
  const base = n === 0 ? 0
             : n === 1 ? 0.20
             : n === 2 ? 0.30
             : n === 3 ? 0.40
             : 0.40 + (n - 3) * 0.10;
  const taux_global = Math.min(base, 0.85);

  if (n === 0) {
    return {
      rente_annuelle: 0,
      taux_global: 0,
      par_enfant: [],
      capital_par_enfant: [],
      smig_applied,
      details: { salaireAnnuel: round2(salaireAnnuel), secteur, eligible_count: 0 }
    };
  }

  const rente_annuelle = round2(salaireAnnuel * taux_global);
  const rente_par_enfant = round2(rente_annuelle / n);
  const par_enfant = eligible.map(e => ({ age: e.age, statut: e.statut, rente: rente_par_enfant }));
  const capital_par_enfant = [];

  for (const e of eligible) {
    const coef = lookupTable(t3, e.age, 0, 15);
    if (coef.error) return coef;
    capital_par_enfant.push({ age: e.age, capital: round2(rente_par_enfant * coef) });
  }

  return {
    rente_annuelle,
    taux_global,
    smig_applied,
    par_enfant,
    capital_par_enfant,
    details: { salaireAnnuel: round2(salaireAnnuel), secteur, eligible_count: n }
  };
}

function calcRenteAscendants(salaireAnnuel, ascendants, secteur) {
  if (!Array.isArray(ascendants)) return { error: "ERR_INVALID_ASCENDANTS" };
  for (const a of ascendants) {
    if (!validateNumber(a.age)) return { error: "ERR_INVALID_AGE" };
  }
  if (!isValidSecteur(secteur)) return { error: "ERR_INVALID_SECTEUR" };
  if (!validateNumber(salaireAnnuel) || salaireAnnuel <= 0) return { error: "ERR_INVALID_SALARY" };

  const { annuel } = getSmig(secteur);
  const sal_before = salaireAnnuel;
  salaireAnnuel = Math.max(salaireAnnuel, annuel);
  const smig_applied = sal_before < annuel;
  const n = ascendants.length;
  const taux_raw = n * 0.15;
  const taux_effectif = Math.min(taux_raw, 0.30);
  const rente_totale = round2(salaireAnnuel * taux_effectif);
  const rente_par_ascendant = n > 0 ? round2(rente_totale / n) : 0;
  const capital_par_ascendant = [];

  for (const a of ascendants) {
    const coef = lookupTable(t1, a.age, 15, 106);
    if (coef.error) return coef;
    capital_par_ascendant.push({ age: a.age, capital: round2(rente_par_ascendant * coef) });
  }

  return {
    rente_totale,
    taux_effectif,
    rente_par_ascendant,
    smig_applied,
    capital_par_ascendant,
    details: { salaireAnnuel: round2(salaireAnnuel), secteur, ascendants_count: n }
  };
}

function calcPlafondAyantsDroit(salaireAnnuel, rentes, secteur) {
  const { conjoint = 0, enfants = 0, ascendants = 0 } = rentes || {};
  if ([conjoint, enfants, ascendants].some(v => !validateNumber(v))) {
    return { error: "ERR_INVALID_RENTES" };
  }
  if (!isValidSecteur(secteur)) return { error: "ERR_INVALID_SECTEUR" };
  if (!validateNumber(salaireAnnuel) || salaireAnnuel <= 0) return { error: "ERR_INVALID_SALARY" };

  const { annuel } = getSmig(secteur);
  const sal_before = salaireAnnuel;
  salaireAnnuel = Math.max(salaireAnnuel, annuel);
  const smig_applied = sal_before < annuel;
  const plafond = round2(salaireAnnuel * 0.85);
  const total = conjoint + enfants + ascendants;
  let rentes_ajustees = {
    conjoint: round2(conjoint),
    enfants: round2(enfants),
    ascendants: round2(ascendants)
  };

  if (total > plafond) {
    const ratio = plafond / total;
    rentes_ajustees = {
      conjoint:   round2(conjoint   * ratio),
      enfants:    round2(enfants    * ratio),
      ascendants: round2(ascendants * ratio)
    };
  }

  return {
    total_avant_plafond: round2(total),
    total_apres_plafond: round2(Math.min(total, plafond)),
    plafond,
    reduction_applied: total > plafond,
    rentes_ajustees,
    details: { salaireAnnuel: round2(salaireAnnuel), secteur, smig_applied }
  };
}

module.exports = {
  calcRenteConjoint,
  calcRenteEnfants,
  calcRenteAscendants,
  calcPlafondAyantsDroit
};
