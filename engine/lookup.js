/**
 * lookup.js
 * Reference Capital Lookup Engine — Law 70.24
 * Source: Official Moroccan Gazette (BO) n°7478, January 2026
 *
 * STRICT LOOKUP — no interpolation, no rounding, no correction.
 * All anomalies in the official table are preserved as-is.
 *
 * Usage (browser):
 *   <script src="data/capital_table.json"> (loaded externally, assigned to TABLE)
 *   <script src="engine/lookup.js">
 *
 * Usage (Node.js):
 *   const TABLE = require('../data/capital_table.json');
 *   const { getReferenceCapital } = require('./engine/lookup.js');
 */

// ─── Dataset validation ───────────────────────────────────────────────────────

/**
 * Validate the dataset structure before any calculation.
 * Call once on startup. Returns an array of error strings (empty = valid).
 *
 * @param {object} table
 * @returns {string[]} errors
 */
function validateDataset(table) {
  const EXPECTED_AGES     = 46;
  const EXPECTED_SALARIES = 65;
  const errors = [];

  if (!table || typeof table !== "object")            { errors.push("الجدول غير موجود"); return errors; }
  if (!Array.isArray(table.ages))                     { errors.push("مصفوفة الأعمار غير موجودة"); return errors; }
  if (!Array.isArray(table.salaries))                 { errors.push("مصفوفة الأجور غير موجودة"); return errors; }
  if (!Array.isArray(table.capitalTable))             { errors.push("جدول رأس المال غير موجود"); return errors; }

  if (table.ages.length !== EXPECTED_AGES)            { errors.push(`عدد الأعمار: متوقع ${EXPECTED_AGES}، موجود ${table.ages.length}`); }
  if (table.salaries.length !== EXPECTED_SALARIES)    { errors.push(`عدد فئات الأجر: متوقع ${EXPECTED_SALARIES}، موجود ${table.salaries.length}`); }
  if (table.capitalTable.length !== EXPECTED_AGES)    { errors.push(`عدد صفوف الجدول: متوقع ${EXPECTED_AGES}، موجود ${table.capitalTable.length}`); }

  table.capitalTable.forEach(function(row, i) {
    if (row.length !== EXPECTED_SALARIES) {
      errors.push(`الصف ${i}: متوقع ${EXPECTED_SALARIES} عمود، موجود ${row.length}`);
    }
    row.forEach(function(val, j) {
      if (typeof val !== "number" || isNaN(val)) {
        errors.push(`قيمة غير صحيحة: capitalTable[${i}][${j}] = ${val}`);
      }
    });
  });

  return errors;
}

// ─── Core engine ─────────────────────────────────────────────────────────────

/**
 * Normalize age to valid table range [18, 63].
 * Rules:
 *   - Non-integer → Math.floor()
 *   - age < 18    → 18
 *   - age > 63    → 63
 *   - Otherwise   → exact integer
 *
 * @param {number} age
 * @returns {number}
 */
function normalizeAge(age) {
  if (typeof age !== "number" || isNaN(age)) throw new Error("NaN_AGE");
  const floored = Math.floor(age);
  if (floored < 18) return 18;
  if (floored > 63) return 63;
  return floored;
}

/**
 * Binary search: largest index in arr where arr[index] <= target.
 * Returns 0 if target is below arr[0] (clamp to minimum).
 *
 * @param {number[]} arr    Sorted ascending
 * @param {number}   target
 * @returns {number}        Floor index
 */
function floorSearch(arr, target) {
  let lo = 0, hi = arr.length - 1, result = 0;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid] <= target) { result = mid; lo = mid + 1; }
    else                    { hi = mid - 1; }
  }
  return result;
}

/**
 * Find the salary bracket index (nearest lower bracket).
 * Rules:
 *   - Negative / NaN → throw error
 *   - salary < minimum → use minimum (index 0)
 *   - salary > maximum → use maximum (last index)
 *   - salary between brackets → largest bracket <= salary
 *
 * @param {object} table  The TABLE dataset
 * @param {number} salary
 * @returns {number} index into table.salaries
 */
function findSalaryIndex(table, salary) {
  if (typeof salary !== "number" || isNaN(salary)) throw new Error("NaN_SALARY");
  if (salary < 0) throw new Error("NEGATIVE_SALARY");
  return floorSearch(table.salaries, salary);
}

/**
 * Main lookup — returns the exact reference capital from the official table.
 *
 * NEVER modifies, interpolates, or corrects any value.
 * Anomalies in the official table are preserved.
 *
 * @param {object} table   The TABLE dataset (capital_table.json)
 * @param {number} age     Victim age at accident date (completed years)
 * @param {number} salary  Annual net professional income (MAD)
 *
 * @returns {{
 *   inputAge:         number,
 *   usedAge:          number,
 *   inputSalary:      number,
 *   usedSalary:       number,
 *   referenceCapital: number,
 *   ageIndex:         number,
 *   salaryIndex:      number,
 *   source:           string
 * }}
 */
function getReferenceCapital(table, age, salary) {
  if (typeof age    !== "number" || isNaN(age))    throw new Error("NaN_AGE");
  if (typeof salary !== "number" || isNaN(salary)) throw new Error("NaN_SALARY");
  if (salary < 0)                                  throw new Error("NEGATIVE_SALARY");

  const usedAge    = normalizeAge(age);
  const salaryIdx  = findSalaryIndex(table, salary);
  const usedSalary = table.salaries[salaryIdx];
  const ageIdx     = usedAge - 18;               // ages array is [18,19,...,63]
  const capital    = table.capitalTable[ageIdx][salaryIdx];

  return {
    inputAge        : age,
    usedAge         : usedAge,
    inputSalary     : salary,
    usedSalary      : usedSalary,
    referenceCapital: capital,
    ageIndex        : ageIdx,
    salaryIndex     : salaryIdx,
    source          : "جدول رأس المال المعتمد — ملحق القانون 70.24 — الجريدة الرسمية عدد 7478"
  };
}

// ─── Date utility ─────────────────────────────────────────────────────────────

/**
 * Calculate victim age in completed years on the accident date.
 *
 * Rules:
 *   - If accident date < birth date → throw DATE_ORDER
 *   - If birthday has not yet occurred in accident year → subtract 1
 *
 * @param {Date} birthDate
 * @param {Date} accidentDate
 * @returns {number} age in completed years
 */
function calculateAgeAtAccident(birthDate, accidentDate) {
  if (accidentDate < birthDate) throw new Error("DATE_ORDER");

  let age = accidentDate.getFullYear() - birthDate.getFullYear();

  const birthMD    = (birthDate.getMonth()    * 100) + birthDate.getDate();
  const accidentMD = (accidentDate.getMonth() * 100) + accidentDate.getDate();

  if (accidentMD < birthMD) age -= 1; // birthday not yet reached in accident year

  return age;
}

// ─── Error messages ───────────────────────────────────────────────────────────

/**
 * Map technical error codes to Arabic user-friendly messages.
 *
 * @param {string} code
 * @returns {string}
 */
function friendlyError(code) {
  const map = {
    "NaN_AGE"         : "السن غير صالح",
    "NaN_SALARY"      : "الأجر غير صالح",
    "NEGATIVE_SALARY" : "الأجر لا يمكن أن يكون سالباً",
    "DATE_ORDER"      : "تاريخ الحادثة يجب أن يكون بعد تاريخ الميلاد",
    "NaN_IPP_RATE"    : "نسبة العجز البدني غير صالحة",
    "INVALID_IPP_RATE": "نسبة العجز البدني يجب أن تكون بين 0 و100",
    "INVALID_DEGREE"  : "درجة الضرر غير صالحة",
    "INVALID_SUBCASE" : "نوع تغيير المهنة غير صالح",
    "INVALID_TYPE"    : "نوع الانقطاع عن الدراسة غير صالح",
    "INVALID_COUNT"   : "عدد المستفيدين يجب أن يكون عدداً صحيحاً موجباً",
    "INVALID_SALARY"  : "الأجر يجب أن يكون رقماً موجباً",
    "INVALID_YEARS"   : "عدد سنوات الخدمة يجب أن يكون عدداً صحيحاً موجباً أو صفراً",
    "INVALID_MONTHS"  : "عدد الأشهر يجب أن يكون عدداً صحيحاً موجباً أو صفراً",
    "INVALID_CATEGORY": "فئة الأجير غير صالحة — يجب أن تكون: cadre أو employe أو ouvrier"
  };
  return map[code] || "حدث خطأ غير متوقع";
}

// ─── Salary period normalization ─────────────────────────────────────────────

const VALID_PERIODS = ["daily", "monthly", "annual"];

/**
 * Convert a salary amount from a given period to an annual figure.
 *
 * @param {number} amount   Salary amount (must be > 0)
 * @param {string} period   "daily" | "monthly" | "annual"
 * @returns {number}        Annual salary
 */
function annualizeSalary(amount, period) {
  if (typeof amount !== "number" || isNaN(amount) || amount <= 0)
    throw new Error("INVALID_SALARY_AMOUNT");
  if (!VALID_PERIODS.includes(period))
    throw new Error("INVALID_SALARY_PERIOD");
  if (period === "daily")   return amount * 365;
  if (period === "monthly") return amount * 12;
  return amount;
}

/**
 * Lookup reference capital from a salary expressed in any supported period.
 *
 * @param {object} table         The TABLE dataset
 * @param {number} age           Victim age at accident date
 * @param {number} salaryAmount  Salary amount in the given period
 * @param {string} salaryPeriod  "daily" | "monthly" | "annual"
 *
 * @returns {{
 *   inputAge:         number,
 *   usedAge:          number,
 *   inputSalaryAmount:number,
 *   salaryPeriod:     string,
 *   annualSalary:     number,
 *   usedSalary:       number,
 *   referenceCapital: number,
 *   ageIndex:         number,
 *   salaryIndex:      number,
 *   source:           string
 * }}
 */
function getReferenceCapitalFromSalaryPeriod(table, age, salaryAmount, salaryPeriod) {
  const annualSalary = annualizeSalary(salaryAmount, salaryPeriod);
  const base = getReferenceCapital(table, age, annualSalary);
  return {
    inputAge         : base.inputAge,
    usedAge          : base.usedAge,
    inputSalaryAmount: salaryAmount,
    salaryPeriod     : salaryPeriod,
    annualSalary     : annualSalary,
    usedSalary       : base.usedSalary,
    referenceCapital : base.referenceCapital,
    ageIndex         : base.ageIndex,
    salaryIndex      : base.salaryIndex,
    source           : base.source
  };
}

// ─── Exports (Node.js) ───────────────────────────────────────────────────────
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    validateDataset,
    normalizeAge,
    floorSearch,
    findSalaryIndex,
    getReferenceCapital,
    annualizeSalary,
    getReferenceCapitalFromSalaryPeriod,
    calculateAgeAtAccident,
    friendlyError
  };
}
