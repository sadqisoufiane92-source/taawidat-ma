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

function tauxEffectifIPP(T) {
  if (T <= 0.30) return round2(T * 0.5);
  if (T <= 0.50) return round2(0.15 + 1.5 * (T - 0.30));
  return round2(0.45 + (T - 0.50));
}

function calcIPP_WA(tauxIPP, salaireAnnuel, age, secteur) {
  if (!isValidSecteur(secteur)) return { error: "ERR_INVALID_SECTEUR" };
  if (!validateNumber(tauxIPP) || tauxIPP < 0 || tauxIPP > 1) return { error: "ERR_INVALID_TAUX" };
  if (!validateNumber(salaireAnnuel) || salaireAnnuel <= 0) return { error: "ERR_INVALID_SALARY" };
  if (!validateNumber(age) || age < 0) return { error: "ERR_INVALID_AGE" };

  const { annuel } = getSmig(secteur);
  const sal_before = salaireAnnuel;
  salaireAnnuel = Math.max(salaireAnnuel, annuel);
  const smig_applied = sal_before < annuel;
  const taux_effectif = tauxEffectifIPP(tauxIPP);

  if (tauxIPP === 0) {
    return {
      type: "neant",
      montant: 0,
      taux_effectif: 0,
      details: { tauxIPP, salaireAnnuel: round2(salaireAnnuel), age, secteur, smig_applied }
    };
  }

  const rente_annuelle = round2(salaireAnnuel * taux_effectif);

  if (tauxIPP < 0.10) {
    const coef = lookupTable(t1, age, 15, 106);
    if (coef.error) return coef;
    return {
      type: "capital",
      montant: round2(rente_annuelle * coef),
      taux_effectif,
      details: { tauxIPP, salaireAnnuel: round2(salaireAnnuel), age, secteur, smig_applied }
    };
  }

  return {
    type: "rente",
    montant: rente_annuelle,
    taux_effectif,
    details: { tauxIPP, salaireAnnuel: round2(salaireAnnuel), age, secteur, smig_applied }
  };
}

function calcFauteInexcusable(renteIPP_annuelle, tauxIPP, age) {
  if (!validateNumber(tauxIPP) || tauxIPP < 0 || tauxIPP > 1) return { error: "ERR_INVALID_TAUX" };
  if (!validateNumber(renteIPP_annuelle) || renteIPP_annuelle <= 0) return { error: "ERR_INVALID_SALARY" };
  if (!validateNumber(age) || age < 0) return { error: "ERR_INVALID_AGE" };

  const isAbsolue = tauxIPP >= 0.999;
  const col = isAbsolue ? "incapacite_absolue" : "incapacite_partielle";
  const coef = lookupTable(t4, age, 15, 80);
  if (coef.error) return coef;
  const prix = coef[col];

  return {
    capital_majoration: round2(renteIPP_annuelle * prix),
    prix,
    col_used: col,
    age_used: clampAge(age, 15, 80),
    details: { renteIPP_annuelle: round2(renteIPP_annuelle), tauxIPP, age }
  };
}

module.exports = { tauxEffectifIPP, calcIPP_WA, calcFauteInexcusable };
