/**
 * supplements.js
 * Complementary Compensation Engine — Law 70.24, Article 10
 *
 * Usage (Node.js):
 *   const TABLE = require('../data/capital_table.json');
 *   const { calcTiercePersonne, ... } = require('./engine/supplements.js');
 */

const { getReferenceCapital } = require("./lookup.js");

const MIN_SALARY = 14270; // Legal minimum — Table Art. 5, Law 70.24

const SOURCE = "المادة العاشرة — القانون رقم 70.24";

// ─── Shared utilities ─────────────────────────────────────────────────────────

function normalizeEnum(str) {
  return String(str).trim().toLowerCase().replace(/\s+/g, "_");
}

function validateResponsibilityRate(rate) {
  if (typeof rate !== "number" || isNaN(rate)) throw new Error("NaN_RESP");
  if (rate < 0 || rate > 1)                    throw new Error("INVALID_RESP");
}

function validateIppRate(rate) {
  if (typeof rate !== "number" || isNaN(rate)) throw new Error("NaN_IPP_RATE");
  if (rate < 0 || rate > 100)                  throw new Error("INVALID_IPP_RATE");
}

function computeBases(table, age, annualSalary) {
  const capitalA = getReferenceCapital(table, age, MIN_SALARY).referenceCapital;
  const capitalB = getReferenceCapital(table, age, annualSalary).referenceCapital;
  return { capitalA, capitalB };
}

function buildResult(supplementType, capitalA, capitalB, baseUsed, rate, gross, responsibilityRate, extras) {
  const baseValue = baseUsed === "capitalA" ? capitalA : capitalB;
  const net = Math.floor(gross * responsibilityRate);
  return Object.assign({
    supplementType,
    capitalA,
    capitalB,
    baseUsed,
    baseValue,
    rate,
    gross,
    responsibilityRate,
    net,
    source: SOURCE
  }, extras);
}

// ─── 1. Tierce personne ───────────────────────────────────────────────────────

function calcTiercePersonne(table, age, annualSalary, responsibilityRate) {
  validateResponsibilityRate(responsibilityRate);
  const { capitalA, capitalB } = computeBases(table, age, annualSalary);
  const rate  = 0.50;
  const gross = capitalA * rate;
  return buildResult("tierce_personne", capitalA, capitalB, "capitalA", rate, gross, responsibilityRate, {});
}

// ─── 2. Pretium doloris ───────────────────────────────────────────────────────

const PRETIUM_RATES = { important: 0.05, majeur: 0.07, tres_majeur: 0.10 };

function calcPretiumDoloris(table, age, annualSalary, degree, responsibilityRate) {
  validateResponsibilityRate(responsibilityRate);
  const norm = normalizeEnum(degree);
  if (!(norm in PRETIUM_RATES)) throw new Error("INVALID_DEGREE");
  const { capitalA, capitalB } = computeBases(table, age, annualSalary);
  const rate  = PRETIUM_RATES[norm];
  const gross = capitalA * rate;
  return buildResult("pretium_doloris", capitalA, capitalB, "capitalA", rate, gross, responsibilityRate, {});
}

// ─── 3. Préjudice esthétique ──────────────────────────────────────────────────

const ESTH_RATES_NO_IMPACT   = { important: 0.05, majeur: 0.10, tres_majeur: 0.15 };
const ESTH_RATES_WITH_IMPACT = { important: 0.25, majeur: 0.30, tres_majeur: 0.35 };

function calcPrejudiceEsthetique(table, age, annualSalary, hasProfessionalImpact, degree, ippRate, responsibilityRate) {
  validateIppRate(ippRate);
  validateResponsibilityRate(responsibilityRate);
  const norm  = normalizeEnum(degree);
  const rates = hasProfessionalImpact ? ESTH_RATES_WITH_IMPACT : ESTH_RATES_NO_IMPACT;
  if (!(norm in rates)) throw new Error("INVALID_DEGREE");
  const { capitalA, capitalB } = computeBases(table, age, annualSalary);
  const rate             = rates[norm];
  const gross            = capitalB * rate;
  const cumulationWarning = hasProfessionalImpact ? ippRate > 10 : false;
  return buildResult("prejudice_esthetique", capitalA, capitalB, "capitalB", rate, gross, responsibilityRate,
    { ippRate, cumulationWarning });
}

// ─── 4. Changement de profession ─────────────────────────────────────────────

const CHANGEMENT_RATES = { retraite_anticipee: 0.20, perte_promotion: 0.15, privation_heures: 0.10 };

function calcChangementProfession(table, age, annualSalary, subCase, ippRate, responsibilityRate) {
  validateIppRate(ippRate);
  validateResponsibilityRate(responsibilityRate);
  const norm = normalizeEnum(subCase);
  if (!(norm in CHANGEMENT_RATES)) throw new Error("INVALID_SUBCASE");
  const { capitalA, capitalB } = computeBases(table, age, annualSalary);
  const rate             = CHANGEMENT_RATES[norm];
  const gross            = capitalB * rate;
  const cumulationWarning = ippRate > 10;
  return buildResult("changement_profession", capitalA, capitalB, "capitalB", rate, gross, responsibilityRate,
    { ippRate, cumulationWarning });
}

// ─── 5. Interruption d'études ─────────────────────────────────────────────────

const ETUDES_RATES = { definitif: 0.25, quasi_definitif: 0.15 };

function calcInterruptionEtudes(table, age, annualSalary, type, responsibilityRate) {
  validateResponsibilityRate(responsibilityRate);
  const norm = normalizeEnum(type);
  if (!(norm in ETUDES_RATES)) throw new Error("INVALID_TYPE");
  const { capitalA, capitalB } = computeBases(table, age, annualSalary);
  const rate  = ETUDES_RATES[norm];
  const gross = capitalB * rate;
  return buildResult("interruption_etudes", capitalA, capitalB, "capitalB", rate, gross, responsibilityRate, {});
}

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  normalizeEnum,
  computeBases,
  calcTiercePersonne,
  calcPretiumDoloris,
  calcPrejudiceEsthetique,
  calcChangementProfession,
  calcInterruptionEtudes
};
