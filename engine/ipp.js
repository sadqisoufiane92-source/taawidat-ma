/**
 * ipp.js
 * IPP (Incapacité Permanente Partielle) Calculation Engine — Law 70.24, Articles 5 & 9
 *
 * Usage (Node.js):
 *   const TABLE = require('../data/capital_table.json');
 *   const { calcIPP } = require('./engine/ipp.js');
 */

const { getReferenceCapital } = require("./lookup.js");

const MIN_SALARY      = 14270;
const POINT_VALUE_MIN = MIN_SALARY / 5; // 2854

/**
 * Calculate IPP compensation.
 *
 * Formula:
 *   pointValue = max(referenceCapital / 100, MIN_SALARY / 5)
 *   grossIPP   = pointValue × ippRate
 *   netIPP     = floor(grossIPP × responsibilityRate)
 *
 * @param {object} table            The TABLE dataset (capital_table.json)
 * @param {number} age              Victim age at accident date
 * @param {number} annualSalary     Annual net professional income (MAD)
 * @param {number} ippRate          IPP percentage set by medical expert (0–100)
 * @param {number} responsibilityRate  Liability share (0–1)
 *
 * @returns {{
 *   inputAge:          number,
 *   usedAge:           number,
 *   inputSalary:       number,
 *   usedSalary:        number,
 *   referenceCapital:  number,
 *   pointValue:        number,
 *   pointValueFloored: boolean,
 *   ippRate:           number,
 *   responsibilityRate:number,
 *   grossIPP:          number,
 *   netIPP:            number,
 *   source:            string
 * }}
 */
function calcIPP(table, age, annualSalary, ippRate, responsibilityRate) {
  if (typeof ippRate !== "number" || isNaN(ippRate))             throw new Error("NaN_IPP_RATE");
  if (ippRate < 0 || ippRate > 100)                              throw new Error("INVALID_IPP_RATE");
  if (typeof responsibilityRate !== "number" || isNaN(responsibilityRate)) throw new Error("NaN_RESP");
  if (responsibilityRate < 0 || responsibilityRate > 1)          throw new Error("INVALID_RESP");

  const lookup         = getReferenceCapital(table, age, annualSalary);
  const rawPoint       = lookup.referenceCapital / 100;
  const floored        = rawPoint < POINT_VALUE_MIN;
  const pointValue     = floored ? POINT_VALUE_MIN : rawPoint;
  const grossIPP       = pointValue * ippRate;
  const netIPP         = Math.floor(grossIPP * responsibilityRate);

  return {
    inputAge          : lookup.inputAge,
    usedAge           : lookup.usedAge,
    inputSalary       : lookup.inputSalary,
    usedSalary        : lookup.usedSalary,
    referenceCapital  : lookup.referenceCapital,
    pointValue        : pointValue,
    pointValueFloored : floored,
    ippRate           : ippRate,
    responsibilityRate: responsibilityRate,
    grossIPP          : grossIPP,
    netIPP            : netIPP,
    source            : "المادتان 5 و9 — القانون رقم 70.24"
  };
}

module.exports = { calcIPP };
