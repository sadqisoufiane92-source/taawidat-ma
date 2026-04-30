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

function calcSalaireJournalier(montant, periodicite, secteur) {
  if (!isValidSecteur(secteur)) return { error: "ERR_INVALID_SECTEUR" };
  if (!validateNumber(montant) || montant <= 0) return { error: "ERR_INVALID_SALARY" };
  if (!["mensuel", "hebdomadaire", "journalier"].includes(periodicite)) {
    return { error: "ERR_INVALID_PERIODICITE" };
  }

  let sj;
  if (periodicite === "mensuel") sj = montant / 26;
  if (periodicite === "hebdomadaire") sj = montant / 6;
  if (periodicite === "journalier") sj = montant;

  const { journalier } = getSmig(secteur);
  const sj_before = sj;
  sj = Math.max(sj, journalier);
  const smig_applied = sj_before < journalier;

  return {
    sj: round2(sj),
    smig_applied,
    details: { montant: round2(montant), periodicite, secteur, sj_before: round2(sj_before), smig_journalier: round2(journalier) }
  };
}

function calcITT_WA(nombreJours, salaireJournalier, secteur) {
  if (!isValidSecteur(secteur)) return { error: "ERR_INVALID_SECTEUR" };
  if (!validateNumber(nombreJours) || nombreJours <= 0) return { error: "ERR_INVALID_DAYS" };
  if (!validateNumber(salaireJournalier) || salaireJournalier <= 0) return { error: "ERR_INVALID_SALARY" };

  const { journalier } = getSmig(secteur);
  const sj_before = salaireJournalier;
  salaireJournalier = Math.max(salaireJournalier, journalier);
  const smig_applied = sj_before < journalier;
  const montant = round2(nombreJours * salaireJournalier * (2 / 3));

  return {
    montant,
    details: {
      nombreJours,
      salaireJournalier: round2(salaireJournalier),
      smig_applied,
      taux: "2/3",
      secteur,
      sj_before: round2(sj_before)
    }
  };
}

module.exports = { calcSalaireJournalier, calcITT_WA };
