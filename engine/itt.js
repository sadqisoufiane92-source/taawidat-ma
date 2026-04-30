/**
 * itt.js
 * Indemnité d'Incapacité Temporaire de Travail (ITT)
 * Law 70.24 — Article 3(a)
 *
 * Formula: floor( (annualSalary × days) / 365 × responsibilityRate )
 *
 * Rules:
 *   - Salary must be > 0
 *   - If salary < MIN_SALARY → MIN_SALARY applied (Art. 6)
 *   - Days must be integer >= 1 (from medical certificate, days only)
 *   - Rounding: Math.floor() — never overpay (prudential rule)
 *   - responsibilityRate: 0–1 (Art. 1 bis bis)
 */

const ITT_MIN_SALARY = 14270; // Minimum légal — Tableau Art. 5, Loi 70.24

/**
 * Calculate ITT compensation.
 *
 * @param {number} annualSalary    Annual net salary (MAD) — must be > 0
 * @param {number} days            Days of incapacity from medical certificate
 * @param {number} responsibilityRate  0–1, default 1.0
 *
 * @returns {{
 *   inputSalary:      number,
 *   salaryUsed:       number,
 *   salaryAdjusted:   boolean,   // true if minimum was applied
 *   days:             number,
 *   responsibilityRate: number,
 *   gross:            number,    // before responsibility rate
 *   net:              number,    // final amount (Math.floor)
 *   formula:          string,    // human-readable formula with values
 *   source:           string
 * }}
 */
function calcITT(annualSalary, days, responsibilityRate) {
  // Default responsibility rate
  if (responsibilityRate === undefined) responsibilityRate = 1.0;

  // Validate
  if (typeof annualSalary       !== "number" || isNaN(annualSalary))       throw new Error("NaN_SALARY");
  if (typeof days               !== "number" || isNaN(days))               throw new Error("NaN_DAYS");
  if (typeof responsibilityRate !== "number" || isNaN(responsibilityRate)) throw new Error("NaN_RESP");

  if (annualSalary <= 0)        throw new Error("INVALID_SALARY");   // 0 is not a valid salary
  if (days < 1)                 throw new Error("INVALID_DAYS");
  if (responsibilityRate < 0 || responsibilityRate > 1) throw new Error("INVALID_RESP");

  // Apply minimum salary rule (Art. 6)
  const salaryAdjusted = annualSalary < ITT_MIN_SALARY;
  const salaryUsed     = salaryAdjusted ? ITT_MIN_SALARY : annualSalary;
  const daysInt        = Math.floor(days); // always integer days

  // Calculation
  const gross = (salaryUsed * daysInt) / 365;
  const net   = Math.floor(gross * responsibilityRate);

  return {
    inputSalary      : annualSalary,
    salaryUsed       : salaryUsed,
    salaryAdjusted   : salaryAdjusted,
    days             : daysInt,
    responsibilityRate: responsibilityRate,
    gross            : gross,
    net              : net,
    formula          : `floor( (${salaryUsed.toLocaleString("fr-MA")} × ${daysInt}) ÷ 365 × ${responsibilityRate.toFixed(2)} )`,
    source           : "المادة الثالثة (أ) — القانون رقم 70.24"
  };
}

// ─── Exports (Node.js) ───────────────────────────────────────────────────────
if (typeof module !== "undefined" && module.exports) {
  module.exports = { calcITT, ITT_MIN_SALARY };
}
