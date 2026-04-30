/**
 * engine.test.js
 * Test suite for lookup.js and itt.js
 *
 * Run with Node.js:
 *   node tests/engine.test.js
 *
 * No test framework needed — pure Node.js assertions.
 */

const path = require("path");
const { getReferenceCapital, normalizeAge, floorSearch,
        findSalaryIndex, calculateAgeAtAccident,
        friendlyError, validateDataset,
        annualizeSalary, getReferenceCapitalFromSalaryPeriod } = require("../engine/lookup.js");
const { calcITT, ITT_MIN_SALARY } = require("../engine/itt.js");
const { calcIPP } = require("../engine/ipp.js");
const {
  normalizeEnum, computeBases,
  calcTiercePersonne, calcPretiumDoloris,
  calcPrejudiceEsthetique, calcChangementProfession,
  calcInterruptionEtudes
} = require("../engine/supplements.js");
const { calcAyantsDroit } = require("../engine/ayants_droit.js");
const TABLE = require("../data/capital_table.json");

let passed = 0;
let failed = 0;

function assert(label, condition, detail) {
  if (condition) {
    console.log(`  ✓  ${label}`);
    passed++;
  } else {
    console.error(`  ✗  ${label}${detail ? " — " + detail : ""}`);
    failed++;
  }
}

function assertThrows(label, fn, expectedCode) {
  try {
    fn();
    console.error(`  ✗  ${label} — expected throw "${expectedCode}" but no error thrown`);
    failed++;
  } catch (e) {
    if (e.message === expectedCode) {
      console.log(`  ✓  ${label}`);
      passed++;
    } else {
      console.error(`  ✗  ${label} — expected "${expectedCode}", got "${e.message}"`);
      failed++;
    }
  }
}

function nearlyEqual(a, b, epsilon) {
  return Math.abs(a - b) < (epsilon || 0.000001);
}

// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── Dataset validation ──────────────────────────────────────────");

const validationErrors = validateDataset(TABLE);
assert("Dataset passes validation", validationErrors.length === 0,
  validationErrors.join(", "));
assert("Ages array length = 46",     TABLE.ages.length === 46);
assert("Salaries array length = 65", TABLE.salaries.length === 65);
assert("Capital table rows = 46",    TABLE.capitalTable.length === 46);
assert("First age = 18",             TABLE.ages[0] === 18);
assert("Last age = 63",              TABLE.ages[45] === 63);
assert("Min salary = 14270",         TABLE.salaries[0] === 14270);
assert("Max salary = 1000000",       TABLE.salaries[64] === 1000000);

// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── normalizeAge ────────────────────────────────────────────────");

assert("age 41 → 41",          normalizeAge(41) === 41);
assert("age 18 → 18",          normalizeAge(18) === 18);
assert("age 63 → 63",          normalizeAge(63) === 63);
assert("age 17 → 18",          normalizeAge(17) === 18);
assert("age 64 → 63",          normalizeAge(64) === 63);
assert("age 0 → 18",           normalizeAge(0) === 18);
assert("age 100 → 63",         normalizeAge(100) === 63);
assert("age 35.9 → 35",        normalizeAge(35.9) === 35);  // floor before clamp
assert("age 17.5 → 18",        normalizeAge(17.5) === 18); // floor=17 < 18 → 18
assertThrows("NaN age throws",  () => normalizeAge(NaN), "NaN_AGE");

// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── floorSearch ─────────────────────────────────────────────────");

const arr = [10, 20, 30, 40, 50];
assert("exact match 30 → idx 2",       floorSearch(arr, 30) === 2);
assert("between 25 → idx 1 (lower 20)",floorSearch(arr, 25) === 1);
assert("below min 5 → idx 0",          floorSearch(arr, 5)  === 0);
assert("above max 99 → idx 4",         floorSearch(arr, 99) === 4);
assert("exact max 50 → idx 4",         floorSearch(arr, 50) === 4);

// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── findSalaryIndex ─────────────────────────────────────────────");

assert("exact 66000 → correct index",  TABLE.salaries[findSalaryIndex(TABLE, 66000)] === 66000);
assert("67500 → bracket 66000",        TABLE.salaries[findSalaryIndex(TABLE, 67500)] === 66000);
assert("14000 → min 14270",            TABLE.salaries[findSalaryIndex(TABLE, 14000)] === 14270);
assert("1100000 → max 1000000",        TABLE.salaries[findSalaryIndex(TABLE, 1100000)] === 1000000);
assertThrows("negative salary throws", () => findSalaryIndex(TABLE, -1),  "NEGATIVE_SALARY");
assertThrows("NaN salary throws",      () => findSalaryIndex(TABLE, NaN), "NaN_SALARY");

// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── getReferenceCapital ─────────────────────────────────────────");

// Key test: age=41, salary=67500 → usedSalary=66000, capital=369145
const r1 = getReferenceCapital(TABLE, 41, 67500);
assert("age=41 sal=67500 → usedAge=41",      r1.usedAge === 41);
assert("age=41 sal=67500 → usedSal=66000",   r1.usedSalary === 66000);
assert("age=41 sal=67500 → capital=369145",  r1.referenceCapital === 369145);

// Exact bracket
const r2 = getReferenceCapital(TABLE, 41, 66000);
assert("exact bracket 66000 → 369145",       r2.referenceCapital === 369145);

// Age clamping
const r3 = getReferenceCapital(TABLE, 17, 48000);
assert("age=17 → usedAge=18",               r3.usedAge === 18);
const r4 = getReferenceCapital(TABLE, 65, 48000);
assert("age=65 → usedAge=63",               r4.usedAge === 63);

// Salary clamping
const r5 = getReferenceCapital(TABLE, 35, 14000);
assert("sal=14000 → usedSal=14270",         r5.usedSalary === 14270);
const r6 = getReferenceCapital(TABLE, 35, 1100000);
assert("sal=1100000 → usedSal=1000000",     r6.usedSalary === 1000000);

// Anomaly preserved (age=29, sal=480000 → 759220 < age=30 value)
const r7 = getReferenceCapital(TABLE, 29, 480000);
assert("anomaly age=29/sal=480000 → 759220 (preserved)", r7.referenceCapital === 759220);

// Anomaly preserved (age=41, sal=66000 → 369145 > age=40 value)
const r8 = getReferenceCapital(TABLE, 41, 66000);
assert("anomaly age=41/sal=66000 → 369145 (preserved)",  r8.referenceCapital === 369145);

// Error cases
assertThrows("NaN age throws",         () => getReferenceCapital(TABLE, NaN, 50000), "NaN_AGE");
assertThrows("NaN salary throws",      () => getReferenceCapital(TABLE, 35, NaN),    "NaN_SALARY");
assertThrows("negative salary throws", () => getReferenceCapital(TABLE, 35, -1),     "NEGATIVE_SALARY");

// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── calculateAgeAtAccident ──────────────────────────────────────");

// Birthday already passed in accident year
const age1 = calculateAgeAtAccident(new Date("1983-03-15"), new Date("2024-06-20"));
assert("1983-03-15 / accident 2024-06-20 → 41", age1 === 41);

// Birthday not yet passed in accident year
const age2 = calculateAgeAtAccident(new Date("1983-09-15"), new Date("2024-06-20"));
assert("1983-09-15 / accident 2024-06-20 → 40 (birthday not yet)", age2 === 40);

// Exact birthday
const age3 = calculateAgeAtAccident(new Date("1983-06-20"), new Date("2024-06-20"));
assert("exact birthday on accident date → 41", age3 === 41);

// DATE_ORDER
assertThrows("accident before birth throws",
  () => calculateAgeAtAccident(new Date("2000-01-01"), new Date("1999-01-01")),
  "DATE_ORDER");

// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── calcITT ─────────────────────────────────────────────────────");

// Basic
const itt1 = calcITT(84000, 45, 1.0);
assert("ITT: gross = (84000×45)/365",   Math.abs(itt1.gross - (84000*45/365)) < 0.001);
assert("ITT: net = floor(gross × 1.0)", itt1.net === Math.floor(itt1.gross));

// Minimum salary applied
const itt2 = calcITT(10000, 30, 1.0);
assert("ITT: salary 10000 < min → 14270 applied",  itt2.salaryUsed === ITT_MIN_SALARY);
assert("ITT: salaryAdjusted = true",                itt2.salaryAdjusted === true);

// Responsibility rate
const itt3 = calcITT(84000, 45, 0.75);
assert("ITT: 75% responsibility applied",  itt3.net === Math.floor(itt3.gross * 0.75));

// Rounding: always floor
const itt4 = calcITT(14270, 1, 1.0);
assert("ITT: floor rounding (not round)",  itt4.net === Math.floor((14270 * 1) / 365));

// Error cases
assertThrows("ITT: salary = 0 throws",     () => calcITT(0, 30, 1.0),    "INVALID_SALARY");
assertThrows("ITT: negative salary throws",() => calcITT(-100, 30, 1.0), "INVALID_SALARY");
assertThrows("ITT: days = 0 throws",       () => calcITT(50000, 0, 1.0), "INVALID_DAYS");
assertThrows("ITT: NaN salary throws",     () => calcITT(NaN, 30, 1.0),  "NaN_SALARY");
assertThrows("ITT: resp > 1 throws",       () => calcITT(50000, 30, 1.5),"INVALID_RESP");

// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── annualizeSalary ─────────────────────────────────────────────");

assert("annual 84000 → 84000",         annualizeSalary(84000, "annual")  === 84000);
assert("monthly 7000 → 84000",         annualizeSalary(7000,  "monthly") === 84000);
assert("daily 365 → 133225",           annualizeSalary(365,   "daily")   === 365 * 365);
assert("daily 100 → 36500",            annualizeSalary(100,   "daily")   === 36500);
assertThrows("amount = 0 throws",      () => annualizeSalary(0,     "annual"), "INVALID_SALARY_AMOUNT");
assertThrows("amount negative throws", () => annualizeSalary(-500,  "annual"), "INVALID_SALARY_AMOUNT");
assertThrows("amount NaN throws",      () => annualizeSalary(NaN,   "annual"), "INVALID_SALARY_AMOUNT");
assertThrows("invalid period throws",  () => annualizeSalary(50000, "weekly"), "INVALID_SALARY_PERIOD");
assertThrows("empty period throws",    () => annualizeSalary(50000, ""),       "INVALID_SALARY_PERIOD");

// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── getReferenceCapitalFromSalaryPeriod ─────────────────────────");

// Annual input — same result as getReferenceCapital
const rp1 = getReferenceCapitalFromSalaryPeriod(TABLE, 41, 67500, "annual");
assert("period=annual: inputSalaryAmount=67500",  rp1.inputSalaryAmount === 67500);
assert("period=annual: salaryPeriod=annual",      rp1.salaryPeriod === "annual");
assert("period=annual: annualSalary=67500",       rp1.annualSalary === 67500);
assert("period=annual: usedSalary=66000",         rp1.usedSalary === 66000);
assert("period=annual: capital=369145",           rp1.referenceCapital === 369145);
assert("period=annual: usedAge=41",               rp1.usedAge === 41);

// Monthly input — 5500/month × 12 = 66000 → exact bracket
const rp2 = getReferenceCapitalFromSalaryPeriod(TABLE, 41, 5500, "monthly");
assert("period=monthly: annualSalary=66000",      rp2.annualSalary === 66000);
assert("period=monthly: usedSalary=66000",        rp2.usedSalary === 66000);
assert("period=monthly: capital=369145",          rp2.referenceCapital === 369145);
assert("period=monthly: inputSalaryAmount=5500",  rp2.inputSalaryAmount === 5500);
assert("period=monthly: salaryPeriod=monthly",    rp2.salaryPeriod === "monthly");

// Daily input — bracket flooring after annualization
// 200/day × 365 = 73000 → bracket is 72000
const rp3 = getReferenceCapitalFromSalaryPeriod(TABLE, 35, 200, "daily");
assert("period=daily: annualSalary=73000",        rp3.annualSalary === 73000);
assert("period=daily: usedSalary bracket <= 73000", rp3.usedSalary <= 73000);
assert("period=daily: salaryPeriod=daily",        rp3.salaryPeriod === "daily");
assert("period=daily: inputSalaryAmount=200",     rp3.inputSalaryAmount === 200);

// Salary below minimum after annualization — monthly 100 × 12 = 1200 < 14270
const rp4 = getReferenceCapitalFromSalaryPeriod(TABLE, 30, 100, "monthly");
assert("below min: annualSalary=1200",            rp4.annualSalary === 1200);
assert("below min: usedSalary=14270 (clamped)",   rp4.usedSalary === 14270);

// Salary above maximum after annualization — monthly 90000 × 12 = 1080000 > 1000000
const rp5 = getReferenceCapitalFromSalaryPeriod(TABLE, 30, 90000, "monthly");
assert("above max: annualSalary=1080000",         rp5.annualSalary === 1080000);
assert("above max: usedSalary=1000000 (clamped)", rp5.usedSalary === 1000000);

// Invalid salary amount
assertThrows("period fn: amount=0 throws",
  () => getReferenceCapitalFromSalaryPeriod(TABLE, 35, 0,    "annual"), "INVALID_SALARY_AMOUNT");
assertThrows("period fn: amount<0 throws",
  () => getReferenceCapitalFromSalaryPeriod(TABLE, 35, -100, "monthly"), "INVALID_SALARY_AMOUNT");

// Invalid period
assertThrows("period fn: bad period throws",
  () => getReferenceCapitalFromSalaryPeriod(TABLE, 35, 5000, "weekly"), "INVALID_SALARY_PERIOD");

// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── calcIPP ─────────────────────────────────────────────────────");

// Known values: age=41, salary=66000 → capital=369145
// pointValue = max(3691.45, 2854) = 3691.45, floored=false
// ippRate=50, resp=1.0 → grossIPP=184572.5, netIPP=184572
const ipp1 = calcIPP(TABLE, 41, 66000, 50, 1.0);
assert("IPP: inputAge=41",                 ipp1.inputAge === 41);
assert("IPP: usedAge=41",                  ipp1.usedAge === 41);
assert("IPP: inputSalary=66000",           ipp1.inputSalary === 66000);
assert("IPP: usedSalary=66000",            ipp1.usedSalary === 66000);
assert("IPP: referenceCapital=369145",     ipp1.referenceCapital === 369145);
assert("IPP: pointValue=3691.45",          Math.abs(ipp1.pointValue - 3691.45) < 0.0001);
assert("IPP: pointValueFloored=false",     ipp1.pointValueFloored === false);
assert("IPP: grossIPP=184572.5",           Math.abs(ipp1.grossIPP - 184572.5) < 0.0001);
assert("IPP: netIPP=184572",               ipp1.netIPP === 184572);
assert("IPP: source present",             ipp1.source === "المادتان 5 و9 — القانون رقم 70.24");

// pointValueFloored=true: age=63, salary=14270 → capital=104712
// pointValue = max(1047.12, 2854) = 2854, floored=true
// ippRate=30, resp=1.0 → grossIPP=85620, netIPP=85620
const ipp2 = calcIPP(TABLE, 63, 14270, 30, 1.0);
assert("IPP floored: referenceCapital=104712",  ipp2.referenceCapital === 104712);
assert("IPP floored: pointValue=2854",          ipp2.pointValue === 2854);
assert("IPP floored: pointValueFloored=true",   ipp2.pointValueFloored === true);
assert("IPP floored: grossIPP=85620",           ipp2.grossIPP === 85620);
assert("IPP floored: netIPP=85620",             ipp2.netIPP === 85620);

// ippRate=0 → netIPP=0
const ipp3 = calcIPP(TABLE, 41, 66000, 0, 1.0);
assert("IPP: ippRate=0 → netIPP=0",        ipp3.netIPP === 0);
assert("IPP: ippRate=0 → grossIPP=0",      ipp3.grossIPP === 0);

// ippRate=100, resp=1.0 → netIPP = floor(pointValue × 100) = floor(referenceCapital)
// = referenceCapital (already integer)
const ipp4 = calcIPP(TABLE, 41, 66000, 100, 1.0);
assert("IPP: ippRate=100 → netIPP=floor(capital)",
  ipp4.netIPP === Math.floor(ipp4.referenceCapital));

// responsibilityRate=0.75
// age=41, salary=66000, ippRate=50, resp=0.75
// grossIPP=184572.5, netIPP=floor(184572.5 × 0.75)=floor(138429.375)=138429
const ipp5 = calcIPP(TABLE, 41, 66000, 50, 0.75);
assert("IPP: resp=0.75 → netIPP=138429",   ipp5.netIPP === 138429);

// responsibilityRate stored correctly
assert("IPP: responsibilityRate stored",   ipp5.responsibilityRate === 0.75);
assert("IPP: ippRate stored",              ipp5.ippRate === 50);

// Error: NaN ippRate
assertThrows("IPP: NaN ippRate throws",
  () => calcIPP(TABLE, 41, 66000, NaN, 1.0), "NaN_IPP_RATE");

// Error: ippRate out of range
assertThrows("IPP: ippRate=101 throws",
  () => calcIPP(TABLE, 41, 66000, 101, 1.0), "INVALID_IPP_RATE");
assertThrows("IPP: ippRate=-1 throws",
  () => calcIPP(TABLE, 41, 66000, -1,  1.0), "INVALID_IPP_RATE");

// Error: NaN responsibilityRate
assertThrows("IPP: NaN resp throws",
  () => calcIPP(TABLE, 41, 66000, 50, NaN), "NaN_RESP");

// Error: responsibilityRate out of range
assertThrows("IPP: resp=1.5 throws",
  () => calcIPP(TABLE, 41, 66000, 50, 1.5), "INVALID_RESP");

// Propagation: negative salary propagates from getReferenceCapital
assertThrows("IPP: negative salary propagates",
  () => calcIPP(TABLE, 41, -1, 50, 1.0), "NEGATIVE_SALARY");

// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── calcAyantsDroit ─────────────────────────────────────────────");

const AD_AGE = 41, AD_SAL = 66000;
const AD_CAPITAL = 369145;

function ayantsDroitInput(overrides) {
  const base = {
    spouseCount: 0,
    children: { age_0_5: 0, age_6_10: 0, age_11_16: 0, age_17_plus: 0, disabled: 0 },
    father: { present: false, disabled: false },
    mother: { present: false, disabled: false },
    otherObligatory: 0,
    otherVoluntary: 0
  };
  overrides = overrides || {};
  return {
    spouseCount: overrides.spouseCount !== undefined ? overrides.spouseCount : base.spouseCount,
    children: Object.assign({}, base.children, overrides.children || {}),
    father: Object.assign({}, base.father, overrides.father || {}),
    mother: Object.assign({}, base.mother, overrides.mother || {}),
    otherObligatory: overrides.otherObligatory !== undefined ? overrides.otherObligatory : base.otherObligatory,
    otherVoluntary: overrides.otherVoluntary !== undefined ? overrides.otherVoluntary : base.otherVoluntary
  };
}

const adSingleSpouse = calcAyantsDroit(TABLE, AD_AGE, AD_SAL, ayantsDroitInput({ spouseCount: 1 }), 1.0);
assert("Ayants droit: referenceCapital=369145", adSingleSpouse.referenceCapital === AD_CAPITAL);
assert("Ayants droit single spouse: rateEach=0.25", adSingleSpouse.beneficiaries.spouse.rateEach === 0.25);
assert("Ayants droit single spouse: grossEach=0.25 capital",
  adSingleSpouse.beneficiaries.spouse.grossEach === AD_CAPITAL * 0.25);
assert("Ayants droit single spouse: adjustedEach capped at 0.50 capital",
  adSingleSpouse.beneficiaries.spouse.adjustedEach === AD_CAPITAL * 0.50);
assert("Ayants droit single spouse: netEach=floor(adjusted)",
  adSingleSpouse.beneficiaries.spouse.netEach === Math.floor(AD_CAPITAL * 0.50));

const adThreeSpouses = calcAyantsDroit(TABLE, AD_AGE, AD_SAL, ayantsDroitInput({ spouseCount: 3 }), 1.0);
assert("Ayants droit 3 spouses: total gross=min(3*0.20,0.40)*capital",
  nearlyEqual(adThreeSpouses.beneficiaries.spouse.grossEach * 3, AD_CAPITAL * 0.40));
assert("Ayants droit 3 spouses: each gross=(0.40*capital)/3",
  nearlyEqual(adThreeSpouses.beneficiaries.spouse.grossEach, (AD_CAPITAL * 0.40) / 3));

const adChildrenAll = calcAyantsDroit(TABLE, AD_AGE, AD_SAL, ayantsDroitInput({
  children: { age_0_5: 1, age_6_10: 1, age_11_16: 1, age_17_plus: 1, disabled: 1 }
}), 1.0);
assert("Ayants droit children age_0_5 rate=0.25",     adChildrenAll.beneficiaries.children.age_0_5.grossEach === AD_CAPITAL * 0.25);
assert("Ayants droit children age_6_10 rate=0.20",    adChildrenAll.beneficiaries.children.age_6_10.grossEach === AD_CAPITAL * 0.20);
assert("Ayants droit children age_11_16 rate=0.15",   adChildrenAll.beneficiaries.children.age_11_16.grossEach === AD_CAPITAL * 0.15);
assert("Ayants droit children age_17_plus rate=0.10", adChildrenAll.beneficiaries.children.age_17_plus.grossEach === AD_CAPITAL * 0.10);
assert("Ayants droit disabled child rate=0.30",       adChildrenAll.beneficiaries.children.disabled.grossEach === AD_CAPITAL * 0.30);
assert("Ayants droit children all groups: total14=capital", nearlyEqual(adChildrenAll.adjustment.total14Gross, AD_CAPITAL));

const adFatherOnly = calcAyantsDroit(TABLE, AD_AGE, AD_SAL, ayantsDroitInput({
  father: { present: true, disabled: false }
}), 1.0);
assert("Ayants droit father only not disabled: gross=0.10 capital",
  adFatherOnly.beneficiaries.father.grossShare === AD_CAPITAL * 0.10);

const adBothParentsDisabled = calcAyantsDroit(TABLE, AD_AGE, AD_SAL, ayantsDroitInput({
  father: { present: true, disabled: true },
  mother: { present: true, disabled: true }
}), 1.0);
assert("Ayants droit both parents disabled: father=0.25 capital",
  adBothParentsDisabled.beneficiaries.father.grossShare === AD_CAPITAL * 0.25);
assert("Ayants droit both parents disabled: mother=0.25 capital",
  adBothParentsDisabled.beneficiaries.mother.grossShare === AD_CAPITAL * 0.25);

const adOneParentDisabled = calcAyantsDroit(TABLE, AD_AGE, AD_SAL, ayantsDroitInput({
  father: { present: true, disabled: true },
  mother: { present: true, disabled: false }
}), 1.0);
assert("Ayants droit one disabled parent: disabled parent=0.30 capital",
  adOneParentDisabled.beneficiaries.father.grossShare === AD_CAPITAL * 0.30);
assert("Ayants droit one disabled parent: other parent=0.10 capital",
  adOneParentDisabled.beneficiaries.mother.grossShare === AD_CAPITAL * 0.10);

const adOtherObligatory = calcAyantsDroit(TABLE, AD_AGE, AD_SAL, ayantsDroitInput({ otherObligatory: 2 }), 1.0);
assert("Ayants droit otherObligatory count=2", adOtherObligatory.beneficiaries.otherObligatory.count === 2);
assert("Ayants droit otherObligatory each gross=0.10 capital",
  adOtherObligatory.beneficiaries.otherObligatory.grossEach === AD_CAPITAL * 0.10);

const adVoluntary = calcAyantsDroit(TABLE, AD_AGE, AD_SAL, ayantsDroitInput({ otherVoluntary: 3 }), 1.0);
assert("Ayants droit otherVoluntary grossTotal=0.15 capital",
  adVoluntary.beneficiaries.otherVoluntary.grossTotal === AD_CAPITAL * 0.15);
assert("Ayants droit otherVoluntary grossEach=grossTotal/3",
  adVoluntary.beneficiaries.otherVoluntary.grossEach === (AD_CAPITAL * 0.15) / 3);
assert("Ayants droit otherVoluntary not in total14",
  adVoluntary.adjustment.total14Gross === 0);

const adReduction = calcAyantsDroit(TABLE, AD_AGE, AD_SAL, ayantsDroitInput({
  spouseCount: 3,
  children: { age_0_5: 2, age_6_10: 1, age_11_16: 1, age_17_plus: 1, disabled: 1 },
  father: { present: true, disabled: true },
  mother: { present: true, disabled: false },
  otherObligatory: 2
}), 1.0);
const reductionFactor = AD_CAPITAL / adReduction.adjustment.total14Gross;
assert("Ayants droit Article 12 reduction: total14 > capital", adReduction.adjustment.total14Gross > AD_CAPITAL);
assert("Ayants droit Article 12 reduction: spouse adjusted proportionally",
  nearlyEqual(adReduction.beneficiaries.spouse.adjustedEach, adReduction.beneficiaries.spouse.grossEach * reductionFactor));
assert("Ayants droit Article 12 reduction: capApplied=false", adReduction.adjustment.capApplied === false);

const adIncreaseNoCap = calcAyantsDroit(TABLE, AD_AGE, AD_SAL, ayantsDroitInput({
  father: { present: true, disabled: false },
  mother: { present: true, disabled: false }
}), 1.0);
assert("Ayants droit Article 12 increase: total14 < capital", adIncreaseNoCap.adjustment.total14Gross < AD_CAPITAL);
assert("Ayants droit Article 12 increase no cap: father adjusted=0.50 capital",
  adIncreaseNoCap.beneficiaries.father.adjustedShare === AD_CAPITAL * 0.50);
assert("Ayants droit Article 12 increase no cap: capApplied=false", adIncreaseNoCap.adjustment.capApplied === false);

const adCap = calcAyantsDroit(TABLE, AD_AGE, AD_SAL, ayantsDroitInput({
  spouseCount: 1,
  children: { age_17_plus: 1 }
}), 1.0);
assert("Ayants droit Article 12 cap: capApplied=true", adCap.adjustment.capApplied === true);
assert("Ayants droit Article 12 cap: spouse capped at 0.50 capital",
  adCap.beneficiaries.spouse.adjustedEach === AD_CAPITAL * 0.50);
assert("Ayants droit Article 12 cap: child receives redistributed remainder",
  adCap.beneficiaries.children.age_17_plus.adjustedEach === AD_CAPITAL * 0.50);

const adEmpty = calcAyantsDroit(TABLE, AD_AGE, AD_SAL, ayantsDroitInput(), 1.0);
assert("Ayants droit total14=0: adjustmentFactor=1", adEmpty.adjustment.adjustmentFactor === 1);
assert("Ayants droit total14=0: spouse adjusted=0", adEmpty.beneficiaries.spouse.adjustedEach === 0);
assert("Ayants droit total14=0: no division issue", adEmpty.grandTotal === 0);

const adCategory5Isolation = calcAyantsDroit(TABLE, AD_AGE, AD_SAL, ayantsDroitInput({
  spouseCount: 1,
  otherVoluntary: 3
}), 1.0);
assert("Ayants droit category 5 isolation: voluntary unchanged by adjustment",
  adCategory5Isolation.beneficiaries.otherVoluntary.grossEach === (AD_CAPITAL * 0.15) / 3);
assert("Ayants droit category 5 isolation: total14 excludes voluntary",
  adCategory5Isolation.adjustment.total14Gross === AD_CAPITAL * 0.25);
assert("Ayants droit category 5 note present",
  adCategory5Isolation.beneficiaries.otherVoluntary.note === "additionnel — Article 12 — non soumis au plafonnement");

const adResp = calcAyantsDroit(TABLE, AD_AGE, AD_SAL, ayantsDroitInput({
  children: { age_0_5: 1, age_6_10: 1, age_11_16: 1, age_17_plus: 1, disabled: 1 },
  otherVoluntary: 2
}), 0.75);
assert("Ayants droit responsibilityRate=0.75 stored", adResp.responsibilityRate === 0.75);
assert("Ayants droit responsibilityRate=0.75 applies to adjusted nets",
  adResp.beneficiaries.children.age_11_16.netEach === Math.floor((AD_CAPITAL * 0.15) * 0.75));
assert("Ayants droit responsibilityRate=0.75 applies to voluntary nets",
  adResp.beneficiaries.otherVoluntary.netEach === Math.floor(((AD_CAPITAL * 0.15) / 2) * 0.75));
assert("Ayants droit grandTotal includes otherVoluntary net",
  adResp.grandTotal ===
    adResp.beneficiaries.children.age_0_5.netTotal +
    adResp.beneficiaries.children.age_6_10.netTotal +
    adResp.beneficiaries.children.age_11_16.netTotal +
    adResp.beneficiaries.children.age_17_plus.netTotal +
    adResp.beneficiaries.children.disabled.netTotal +
    adResp.beneficiaries.otherVoluntary.netTotal);

const adFloat = calcAyantsDroit(TABLE, AD_AGE, AD_SAL, ayantsDroitInput({ spouseCount: 3 }), 0.75);
assert("Ayants droit intermediate gross not rounded",
  adFloat.beneficiaries.spouse.grossEach === (AD_CAPITAL * 0.40) / 3);
assert("Ayants droit intermediate adjusted not rounded",
  adFloat.beneficiaries.spouse.adjustedEach === adFloat.beneficiaries.spouse.grossEach * adFloat.adjustment.adjustmentFactor);
assert("Ayants droit only net values use Math.floor",
  adFloat.beneficiaries.spouse.netEach === Math.floor(adFloat.beneficiaries.spouse.adjustedEach * 0.75));

assertThrows("Ayants droit: INVALID_RESP",
  () => calcAyantsDroit(TABLE, AD_AGE, AD_SAL, ayantsDroitInput(), 1.5), "INVALID_RESP");
assertThrows("Ayants droit: NaN_RESP",
  () => calcAyantsDroit(TABLE, AD_AGE, AD_SAL, ayantsDroitInput(), NaN), "NaN_RESP");
assertThrows("Ayants droit: INVALID_COUNT missing count",
  () => calcAyantsDroit(TABLE, AD_AGE, AD_SAL, {
    children: { age_0_5: 0, age_6_10: 0, age_11_16: 0, age_17_plus: 0, disabled: 0 },
    father: { present: false, disabled: false },
    mother: { present: false, disabled: false },
    otherObligatory: 0,
    otherVoluntary: 0
  }, 1.0), "INVALID_COUNT");
assertThrows("Ayants droit: negative count throws INVALID_COUNT",
  () => calcAyantsDroit(TABLE, AD_AGE, AD_SAL, ayantsDroitInput({ otherObligatory: -1 }), 1.0), "INVALID_COUNT");
assertThrows("Ayants droit: non-integer count throws INVALID_COUNT",
  () => calcAyantsDroit(TABLE, AD_AGE, AD_SAL, ayantsDroitInput({ children: { age_0_5: 1.5 } }), 1.0), "INVALID_COUNT");

// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── friendlyError ───────────────────────────────────────────────");

assert('NaN_AGE → Arabic msg',         friendlyError("NaN_AGE")        === "السن غير صالح");
assert('NaN_SALARY → Arabic msg',      friendlyError("NaN_SALARY")     === "الأجر غير صالح");
assert('NEGATIVE_SALARY → Arabic msg', friendlyError("NEGATIVE_SALARY")=== "الأجر لا يمكن أن يكون سالباً");
assert('DATE_ORDER → Arabic msg',      friendlyError("DATE_ORDER")     === "تاريخ الحادثة يجب أن يكون بعد تاريخ الميلاد");
assert('NaN_IPP_RATE → Arabic msg',    friendlyError("NaN_IPP_RATE")   === "نسبة العجز البدني غير صالحة");
assert('INVALID_IPP_RATE → Arabic msg',friendlyError("INVALID_IPP_RATE")=== "نسبة العجز البدني يجب أن تكون بين 0 و100");
assert('INVALID_DEGREE → Arabic msg',  friendlyError("INVALID_DEGREE") === "درجة الضرر غير صالحة");
assert('INVALID_SUBCASE → Arabic msg', friendlyError("INVALID_SUBCASE")=== "نوع تغيير المهنة غير صالح");
assert('INVALID_TYPE → Arabic msg',    friendlyError("INVALID_TYPE")   === "نوع الانقطاع عن الدراسة غير صالح");
assert('INVALID_COUNT → Arabic msg',   friendlyError("INVALID_COUNT")  === "عدد المستفيدين يجب أن يكون عدداً صحيحاً موجباً");
assert('unknown → default msg',        friendlyError("UNKNOWN_CODE")   === "حدث خطأ غير متوقع");

// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── calcSupplements ─────────────────────────────────────────────");

// Shared constants for this section
// age=41, annualSalary=66000 → capitalA=169998, capitalB=369145
const SUPP_AGE = 41, SUPP_SAL = 66000;
const CAPITAL_A = 169998, CAPITAL_B = 369145;

// ── normalizeEnum ─────────────────────────────────────────────────────────────
assert('normalizeEnum "  Tres Majeur " → "tres_majeur"', normalizeEnum("  Tres Majeur ") === "tres_majeur");
assert('normalizeEnum "IMPORTANT" → "important"',         normalizeEnum("IMPORTANT") === "important");
assert('normalizeEnum "quasi definitif" → "quasi_definitif"', normalizeEnum("quasi definitif") === "quasi_definitif");

// ── computeBases ──────────────────────────────────────────────────────────────
const bases = computeBases(TABLE, SUPP_AGE, SUPP_SAL);
assert("computeBases: capitalA uses MIN_SALARY → 169998",  bases.capitalA === CAPITAL_A);
assert("computeBases: capitalB uses annualSalary → 369145",bases.capitalB === CAPITAL_B);

// ── calcTiercePersonne ────────────────────────────────────────────────────────
const tp1 = calcTiercePersonne(TABLE, SUPP_AGE, SUPP_SAL, 1.0);
assert("tierce: supplementType",          tp1.supplementType === "tierce_personne");
assert("tierce: baseUsed=capitalA",       tp1.baseUsed === "capitalA");
assert("tierce: baseValue=capitalA",      tp1.baseValue === CAPITAL_A);
assert("tierce: rate=0.50",               tp1.rate === 0.50);
assert("tierce: capitalA present",        tp1.capitalA === CAPITAL_A);
assert("tierce: capitalB present",        tp1.capitalB === CAPITAL_B);
assert("tierce: gross=84999",             tp1.gross === 84999);
assert("tierce: net=84999 @resp=1.0",     tp1.net === 84999);
assert("tierce: source present",          tp1.source === "المادة العاشرة — القانون رقم 70.24");

const tp2 = calcTiercePersonne(TABLE, SUPP_AGE, SUPP_SAL, 0.75);
assert("tierce: net=63749 @resp=0.75",    tp2.net === 63749);

// ── calcPretiumDoloris ────────────────────────────────────────────────────────
const pd1 = calcPretiumDoloris(TABLE, SUPP_AGE, SUPP_SAL, "important", 1.0);
assert("pretium important: rate=0.05",    pd1.rate === 0.05);
assert("pretium important: net=8499",     pd1.net === 8499);
assert("pretium important: baseUsed=capitalA", pd1.baseUsed === "capitalA");

const pd2 = calcPretiumDoloris(TABLE, SUPP_AGE, SUPP_SAL, "majeur", 1.0);
assert("pretium majeur: rate=0.07",       pd2.rate === 0.07);
assert("pretium majeur: net=11899",       pd2.net === 11899);

const pd3 = calcPretiumDoloris(TABLE, SUPP_AGE, SUPP_SAL, "tres_majeur", 1.0);
assert("pretium tres_majeur: rate=0.10",  pd3.rate === 0.10);
assert("pretium tres_majeur: net=16999",  pd3.net === 16999);

// Enum normalization — mixed case input still resolves
const pdMixed = calcPretiumDoloris(TABLE, SUPP_AGE, SUPP_SAL, "  Majeur ", 1.0);
assert("pretium: mixed-case 'Majeur' works", pdMixed.net === 11899);

// ── calcPrejudiceEsthetique — no professional impact ──────────────────────────
const pe1 = calcPrejudiceEsthetique(TABLE, SUPP_AGE, SUPP_SAL, false, "important",  0, 1.0);
assert("esth no-imp important: rate=0.05",   pe1.rate === 0.05);
assert("esth no-imp important: net=18457",   pe1.net === 18457);
assert("esth no-imp important: baseUsed=capitalB", pe1.baseUsed === "capitalB");

const pe2 = calcPrejudiceEsthetique(TABLE, SUPP_AGE, SUPP_SAL, false, "majeur",     0, 1.0);
assert("esth no-imp majeur: rate=0.10",      pe2.rate === 0.10);
assert("esth no-imp majeur: net=36914",      pe2.net === 36914);

const pe3 = calcPrejudiceEsthetique(TABLE, SUPP_AGE, SUPP_SAL, false, "tres_majeur",0, 1.0);
assert("esth no-imp tres_majeur: rate=0.15", pe3.rate === 0.15);
assert("esth no-imp tres_majeur: net=55371", pe3.net === 55371);

// ── calcPrejudiceEsthetique — with professional impact ────────────────────────
const pe4 = calcPrejudiceEsthetique(TABLE, SUPP_AGE, SUPP_SAL, true, "important",  30, 1.0);
assert("esth imp important: rate=0.25",      pe4.rate === 0.25);
assert("esth imp important: net=92286",      pe4.net === 92286);

const pe5 = calcPrejudiceEsthetique(TABLE, SUPP_AGE, SUPP_SAL, true, "majeur",     30, 1.0);
assert("esth imp majeur: rate=0.30",         pe5.rate === 0.30);
assert("esth imp majeur: net=110743",        pe5.net === 110743);

const pe6 = calcPrejudiceEsthetique(TABLE, SUPP_AGE, SUPP_SAL, true, "tres_majeur",30, 1.0);
assert("esth imp tres_majeur: rate=0.35",    pe6.rate === 0.35);
assert("esth imp tres_majeur: net=129200",   pe6.net === 129200);

// cumulationWarning=true when ippRate=30 and hasProfessionalImpact=true
const peWarn = calcPrejudiceEsthetique(TABLE, SUPP_AGE, SUPP_SAL, true, "majeur", 30, 1.0);
assert("esth: cumulationWarning=true (ipp=30, impact=true)",  peWarn.cumulationWarning === true);

// cumulationWarning=false when ippRate=10 and hasProfessionalImpact=true (not strictly greater)
const peNoWarn1 = calcPrejudiceEsthetique(TABLE, SUPP_AGE, SUPP_SAL, true, "majeur", 10, 1.0);
assert("esth: cumulationWarning=false (ipp=10, impact=true)", peNoWarn1.cumulationWarning === false);

// cumulationWarning=false when hasProfessionalImpact=false (any ippRate)
const peNoWarn2 = calcPrejudiceEsthetique(TABLE, SUPP_AGE, SUPP_SAL, false, "majeur", 30, 1.0);
assert("esth: cumulationWarning=false (impact=false, ipp=30)",peNoWarn2.cumulationWarning === false);

// Engine does NOT block when cumulationWarning=true — net is still computed
assert("esth: net still computed when cumulationWarning=true", peWarn.net === 110743);

// ── calcChangementProfession ──────────────────────────────────────────────────
const cp1 = calcChangementProfession(TABLE, SUPP_AGE, SUPP_SAL, "retraite_anticipee", 30, 1.0);
assert("changement retraite_anticipee: rate=0.20",  cp1.rate === 0.20);
assert("changement retraite_anticipee: net=73829",  cp1.net === 73829);
assert("changement retraite_anticipee: baseUsed=capitalB", cp1.baseUsed === "capitalB");

const cp2 = calcChangementProfession(TABLE, SUPP_AGE, SUPP_SAL, "perte_promotion",   30, 1.0);
assert("changement perte_promotion: rate=0.15",     cp2.rate === 0.15);
assert("changement perte_promotion: net=55371",     cp2.net === 55371);

const cp3 = calcChangementProfession(TABLE, SUPP_AGE, SUPP_SAL, "privation_heures",  30, 1.0);
assert("changement privation_heures: rate=0.10",    cp3.rate === 0.10);
assert("changement privation_heures: net=36914",    cp3.net === 36914);

// cumulationWarning for changement
assert("changement: cumulationWarning=true (ipp=30)",  cp1.cumulationWarning === true);
const cpNoWarn = calcChangementProfession(TABLE, SUPP_AGE, SUPP_SAL, "retraite_anticipee", 10, 1.0);
assert("changement: cumulationWarning=false (ipp=10)", cpNoWarn.cumulationWarning === false);

// Engine does NOT block when cumulationWarning=true
assert("changement: net still computed when cumulationWarning=true", cp1.net === 73829);

// Mixed-case enum normalization for subCase
const cpMixed = calcChangementProfession(TABLE, SUPP_AGE, SUPP_SAL, "Perte Promotion", 5, 1.0);
assert("changement: mixed-case 'Perte Promotion' works", cpMixed.net === 55371);

// ── calcInterruptionEtudes ────────────────────────────────────────────────────
const ie1 = calcInterruptionEtudes(TABLE, SUPP_AGE, SUPP_SAL, "definitif", 1.0);
assert("etudes definitif: rate=0.25",        ie1.rate === 0.25);
assert("etudes definitif: net=92286",        ie1.net === 92286);
assert("etudes definitif: baseUsed=capitalB",ie1.baseUsed === "capitalB");

const ie2 = calcInterruptionEtudes(TABLE, SUPP_AGE, SUPP_SAL, "quasi_definitif", 1.0);
assert("etudes quasi_definitif: rate=0.15",  ie2.rate === 0.15);
assert("etudes quasi_definitif: net=55371",  ie2.net === 55371);

// ── Validator error cases ─────────────────────────────────────────────────────
assertThrows("validateResp: NaN_RESP",
  () => calcTiercePersonne(TABLE, SUPP_AGE, SUPP_SAL, NaN),  "NaN_RESP");
assertThrows("validateResp: INVALID_RESP (1.5)",
  () => calcTiercePersonne(TABLE, SUPP_AGE, SUPP_SAL, 1.5),  "INVALID_RESP");
assertThrows("validateIppRate: NaN_IPP_RATE",
  () => calcPrejudiceEsthetique(TABLE, SUPP_AGE, SUPP_SAL, true, "majeur", NaN,  1.0), "NaN_IPP_RATE");
assertThrows("validateIppRate: INVALID_IPP_RATE (101)",
  () => calcPrejudiceEsthetique(TABLE, SUPP_AGE, SUPP_SAL, true, "majeur", 101,  1.0), "INVALID_IPP_RATE");

assertThrows("INVALID_DEGREE (pretium)",
  () => calcPretiumDoloris(TABLE, SUPP_AGE, SUPP_SAL, "mineur", 1.0), "INVALID_DEGREE");
assertThrows("INVALID_DEGREE (esth)",
  () => calcPrejudiceEsthetique(TABLE, SUPP_AGE, SUPP_SAL, false, "mineur", 0, 1.0), "INVALID_DEGREE");
assertThrows("INVALID_SUBCASE",
  () => calcChangementProfession(TABLE, SUPP_AGE, SUPP_SAL, "autre", 0, 1.0), "INVALID_SUBCASE");
assertThrows("INVALID_TYPE",
  () => calcInterruptionEtudes(TABLE, SUPP_AGE, SUPP_SAL, "partiel", 1.0), "INVALID_TYPE");

// Salary error propagates from computeBases (negative salary)
assertThrows("negative salary propagates from computeBases",
  () => calcTiercePersonne(TABLE, SUPP_AGE, -1, 1.0), "NEGATIVE_SALARY");

// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── calcLabor ──────────────────────────────────────────────────");

const {
  calcDommagesInterets,
  calcPrejudice,
  calcPreavis,
  calcIndemnite,
  calcCongesTotal,
  calcPrimeAnciennete
} = require("../engine/labor.js");

// calcDommagesInterets
const di1 = calcDommagesInterets(8000, 5);
assert("labor DI: 5 years x 8000 -> uncapped=60000", di1.uncapped === 60000);
assert("labor DI: 5 years x 8000 capped=false", di1.capped === false);
assert("labor DI: 5 years x 8000 result=60000", di1.result === 60000);
const di2 = calcDommagesInterets(8000, 30);
assert("labor DI: 30 years x 8000 cap=288000", di2.cap === 288000);
assert("labor DI: 30 years x 8000 capped=true", di2.capped === true);
assert("labor DI: 30 years x 8000 result=288000", di2.result === 288000);
assert("labor DI: yearsOfService=0 -> result=0", calcDommagesInterets(8000, 0).result === 0);
assertThrows("labor DI: INVALID_SALARY throws", () => calcDommagesInterets(0, 5), "INVALID_SALARY");
assertThrows("labor DI: INVALID_YEARS throws negative", () => calcDommagesInterets(8000, -1), "INVALID_YEARS");

// calcPrejudice
const prej1 = calcPrejudice(8000, 5);
assert("labor prejudice: 5 years months=7.5", prej1.months === 7.5);
assert("labor prejudice: 5 years result=60000", prej1.result === 60000);
assert("labor prejudice: 30 years capped=true", calcPrejudice(8000, 30).capped === true);
assert("labor prejudice: 30 years monthsUsed=36", calcPrejudice(8000, 30).monthsUsed === 36);
assert("labor prejudice: 30 years result=288000", calcPrejudice(8000, 30).result === 288000);
assertThrows("labor prejudice: INVALID_SALARY throws", () => calcPrejudice(0, 5), "INVALID_SALARY");
assertThrows("labor prejudice: INVALID_YEARS throws negative", () => calcPrejudice(8000, -1), "INVALID_YEARS");

// calcPreavis
assert("labor preavis: cadre 0.5 years noticeDays=30", calcPreavis(9000, "cadre", 0.5).noticeDays === 30);
assert("labor preavis: cadre 3 years noticeDays=60", calcPreavis(9000, "cadre", 3).noticeDays === 60);
assert("labor preavis: cadre 6 years noticeDays=90", calcPreavis(9000, "cadre", 6).noticeDays === 90);
const preEmploye05 = calcPreavis(9000, "employe", 0.5);
assert("labor preavis: employe 0.5 years noticeDays=8", preEmploye05.noticeDays === 8);
assert("labor preavis: employe 0.5 years indemnity=floor(salary/30*8)",
  preEmploye05.indemnity === Math.floor((9000 / 30) * 8));
assert("labor preavis: employe 3 years noticeDays=30", calcPreavis(9000, "employe", 3).noticeDays === 30);
assert("labor preavis: employe 6 years noticeDays=60", calcPreavis(9000, "employe", 6).noticeDays === 60);
assert("labor preavis: ouvrier 3 years noticeDays=30", calcPreavis(9000, "ouvrier", 3).noticeDays === 30);
assert("labor preavis: ouvrier 6 years noticeDays=60", calcPreavis(9000, "ouvrier", 6).noticeDays === 60);
assert('labor preavis: "CADRE" normalizes to "cadre"', calcPreavis(9000, " CADRE ", 3).category === "cadre");
assertThrows("labor preavis: INVALID_CATEGORY throws", () => calcPreavis(9000, "manager", 3), "INVALID_CATEGORY");

// calcIndemnite
const ind3 = calcIndemnite(3820, 3);
assert("labor indemnite: hourlyWage = monthlySalary / 191", ind3.hourlyWage === 20);
assert("labor indemnite: 3 years bracket_1_5 only", ind3.brackets.hours_1_5 === 3 * 96);
assert("labor indemnite: 3 years totalHours=288", ind3.totalHours === 288);
assert("labor indemnite: 3 years indemnity=5760", ind3.indemnity === 5760);
const ind7 = calcIndemnite(3820, 7);
assert("labor indemnite: 7 years bracket_1_5 years=5", ind7.brackets.years_1_5 === 5);
assert("labor indemnite: 7 years bracket_6_10 years=2", ind7.brackets.years_6_10 === 2);
assert("labor indemnite: 7 years hours_6_10=288", ind7.brackets.hours_6_10 === 288);
assert("labor indemnite: 7 years indemnity=15360", ind7.indemnity === 15360);
const ind15 = calcIndemnite(3820, 15);
assert("labor indemnite: 15 years three brackets", ind15.brackets.years_11_15 === 5);
assert("labor indemnite: 15 years bracket_15plus=0", ind15.brackets.years_15plus === 0);
assert("labor indemnite: 15 years indemnity=43200", ind15.indemnity === 43200);
const ind20 = calcIndemnite(3820, 20);
assert("labor indemnite: 20 years all four brackets", ind20.brackets.years_15plus === 5);
assert("labor indemnite: 20 years indemnity=67200", ind20.indemnity === 67200);
assert("labor indemnite: yearsOfService=0 -> indemnity=0", calcIndemnite(3820, 0).indemnity === 0);
const indFloat = calcIndemnite(2000, 1);
assert("labor indemnite: no intermediate rounding hourlyWage", indFloat.hourlyWage === 2000 / 191);
assert("labor indemnite: no intermediate rounding contribution",
  indFloat.indemnity === Math.floor(96 * (2000 / 191)));
assertThrows("labor indemnite: INVALID_SALARY throws", () => calcIndemnite(0, 3), "INVALID_SALARY");
assertThrows("labor indemnite: INVALID_YEARS throws", () => calcIndemnite(2200, -1), "INVALID_YEARS");

// calcCongesTotal
const ct26 = calcCongesTotal(3000, 26);
assert("labor conges total: 26 years totalDays=558", ct26.totalDays === 558);
assert("labor conges total: 26 years indemnityFull=64384", ct26.indemnityFull === 64384);
assert("labor conges total: 26 years prescriptionDays=51", ct26.prescriptionDays === 51);
assert("labor conges total: 26 years indemnityPrescription=5884", ct26.indemnityPrescription === 5884);
const ct0 = calcCongesTotal(3000, 0);
assert("labor conges total: 0 years totalDays=0", ct0.totalDays === 0);
assert("labor conges total: 0 years indemnityFull=0", ct0.indemnityFull === 0);
const ct4 = calcCongesTotal(3000, 4);
assert("labor conges total: 4 years totalDays=72", ct4.totalDays === 72);
const ct10 = calcCongesTotal(3000, 10);
assert("labor conges total: 10 years totalDays=190.5", ct10.totalDays === 190.5);
assert("labor conges total: 10 years indemnityFull=21980", ct10.indemnityFull === 21980);
assert("labor conges total: prescriptionDays for year 10 = 42", ct10.prescriptionDays === 42);
assert("labor conges total: prescriptionIndemnity for year 10 = 4846", ct10.indemnityPrescription === 4846);
assertThrows("labor conges total: INVALID_SALARY throws", () => calcCongesTotal(0, 10), "INVALID_SALARY");
assertThrows("labor conges total: INVALID_YEARS throws", () => calcCongesTotal(3000, -1), "INVALID_YEARS");

// calcPrimeAnciennete
const pa0 = calcPrimeAnciennete(3000, 0);
assert("labor anciennete: 0 years phases=[]", pa0.phases.length === 0);
assert("labor anciennete: 0 years currentMonthlyBonus=0", pa0.currentMonthlyBonus === 0);
assert("labor anciennete: 0 years totalAccumulated=0", pa0.totalAccumulated === 0);
const pa1 = calcPrimeAnciennete(3000, 1);
assert("labor anciennete: 1 year phases=[]", pa1.phases.length === 0);
assert("labor anciennete: 1 year currentMonthlyBonus=0", pa1.currentMonthlyBonus === 0);
assert("labor anciennete: 1 year totalAccumulated=0", pa1.totalAccumulated === 0);
const pa3 = calcPrimeAnciennete(3000, 3);
assert("labor anciennete: 3 years only phase 1 active", pa3.phases.length === 1 && pa3.phases[0].yearsInPhase === 1);
const pa5 = calcPrimeAnciennete(3000, 5);
assert("labor anciennete: 5 years phase 1 yearsInPhase=3", pa5.phases.length === 1 && pa5.phases[0].yearsInPhase === 3);
const pa6 = calcPrimeAnciennete(3000, 6);
assert("labor anciennete: 6 years phase 1 + phase 2 active", pa6.phases.length === 2);
assert("labor anciennete: 6 years phase 2 yearsInPhase=1", pa6.phases[1].yearsInPhase === 1);
const pa26 = calcPrimeAnciennete(3000, 26);
assert("labor anciennete: 26 years totalAccumulated=132661.35", nearlyEqual(pa26.totalAccumulated, 132661.35));
assert("labor anciennete: 26 years currentAnnualBonus=11098.35", nearlyEqual(pa26.currentAnnualBonus, 11098.35));
assert("labor anciennete: 26 years currentMonthlyBonus=924", pa26.currentMonthlyBonus === 924);
assert("labor anciennete: 26 years phases array has 5 entries", pa26.phases.length === 5);
assertThrows("labor anciennete: INVALID_SALARY throws", () => calcPrimeAnciennete(0, 26), "INVALID_SALARY");
assertThrows("labor anciennete: INVALID_YEARS throws", () => calcPrimeAnciennete(3000, -1), "INVALID_YEARS");

assert("labor friendlyError: INVALID_SALARY Arabic",
  friendlyError("INVALID_SALARY") === "الأجر يجب أن يكون رقماً موجباً");
assert("labor friendlyError: INVALID_YEARS Arabic",
  friendlyError("INVALID_YEARS") === "عدد سنوات الخدمة يجب أن يكون عدداً صحيحاً موجباً أو صفراً");
assert("labor friendlyError: INVALID_MONTHS Arabic",
  friendlyError("INVALID_MONTHS") === "عدد الأشهر يجب أن يكون عدداً صحيحاً موجباً أو صفراً");
assert("labor friendlyError: INVALID_CATEGORY Arabic",
  friendlyError("INVALID_CATEGORY") === "فئة الأجير غير صالحة — يجب أن تكون: cadre أو employe أو ouvrier");

// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── work_accidents — loi 18.12 ─────────────────────────────────");

const { calcSalaireJournalier, calcITT_WA } = require("../engine/work_accidents/wa_itt.js");
const { tauxEffectifIPP, calcIPP_WA, calcFauteInexcusable } = require("../engine/work_accidents/wa_ipp.js");
const {
  calcRenteConjoint,
  calcRenteEnfants,
  calcRenteAscendants,
  calcPlafondAyantsDroit
} = require("../engine/work_accidents/wa_ayants_droit.js");

// calcSalaireJournalier
const waSjMensuel = calcSalaireJournalier(3000, "mensuel", "industrie");
assert("WA salaire journalier: mensuel 3000 -> SMIG-adjusted current data", waSjMensuel.sj === 131.88);
const waSjHebdo = calcSalaireJournalier(600, "hebdomadaire", "industrie");
assert("WA salaire journalier: hebdomadaire 600 -> SMIG-adjusted current data", waSjHebdo.sj === 131.88);
const waSjJour = calcSalaireJournalier(100, "journalier", "industrie");
assert("WA salaire journalier: journalier 100 -> SMIG-adjusted current data", waSjJour.sj === 131.88);
const waSjSmig = calcSalaireJournalier(1, "mensuel", "industrie");
assert("WA salaire journalier: SMIG applied", waSjSmig.smig_applied === true);
assert("WA salaire journalier: invalid periodicite",
  calcSalaireJournalier(3000, "invalid", "industrie").error === "ERR_INVALID_PERIODICITE");
assert("WA salaire journalier: invalid secteur",
  calcSalaireJournalier(3000, "mensuel", "invalid").error === "ERR_INVALID_SECTEUR");

// calcITT_WA
const waItt30 = calcITT_WA(30, 200, "industrie");
assert("WA ITT: 30 days x 200 x 2/3 = 4000", waItt30.montant === 4000);
const waItt1 = calcITT_WA(1, 150, "industrie");
assert("WA ITT: 1 day x 150 x 2/3 = 100", waItt1.montant === 100);
const waIttSmig = calcITT_WA(30, 1, "industrie");
assert("WA ITT: SMIG applied", waIttSmig.details.smig_applied === true);
assert("WA ITT: invalid days", calcITT_WA(0, 200, "industrie").error === "ERR_INVALID_DAYS");
assert("WA ITT: invalid salary", calcITT_WA(30, -100, "industrie").error === "ERR_INVALID_SALARY");
assert("WA ITT: invalid secteur", calcITT_WA(30, 200, "invalid").error === "ERR_INVALID_SECTEUR");

// tauxEffectifIPP
assert("WA tauxEffectifIPP: 0 -> 0", tauxEffectifIPP(0) === 0);
assert("WA tauxEffectifIPP: 0.10 -> 0.05", tauxEffectifIPP(0.10) === 0.05);
assert("WA tauxEffectifIPP: 0.30 boundary -> 0.15", tauxEffectifIPP(0.30) === 0.15);
assert("WA tauxEffectifIPP: 0.40 -> 0.30", nearlyEqual(tauxEffectifIPP(0.40), 0.30));
assert("WA tauxEffectifIPP: 0.50 boundary -> 0.45", tauxEffectifIPP(0.50) === 0.45);
assert("WA tauxEffectifIPP: 0.60 -> 0.55", nearlyEqual(tauxEffectifIPP(0.60), 0.55));
assert("WA tauxEffectifIPP: 1.00 -> 0.95", tauxEffectifIPP(1.00) === 0.95);

// calcIPP_WA
const waIpp0 = calcIPP_WA(0, 120000, 35, "industrie");
assert("WA IPP: taux 0 -> type neant", waIpp0.type === "neant" && waIpp0.montant === 0);
const waIppCapital = calcIPP_WA(0.05, 120000, 35, "industrie");
assert("WA IPP: 5% -> type capital", waIppCapital.type === "capital");
const waIpp10 = calcIPP_WA(0.10, 120000, 35, "industrie");
assert("WA IPP: 10% -> rente 6000", waIpp10.type === "rente" && waIpp10.montant === 6000);
const waIpp30 = calcIPP_WA(0.30, 120000, 40, "industrie");
assert("WA IPP: 30% -> rente 18000", waIpp30.type === "rente" && waIpp30.montant === 18000);
const waIpp50 = calcIPP_WA(0.50, 120000, 40, "industrie");
assert("WA IPP: 50% -> rente 54000", waIpp50.type === "rente" && waIpp50.montant === 54000);
const waIpp100 = calcIPP_WA(1.00, 120000, 40, "industrie");
assert("WA IPP: 100% -> rente 114000", waIpp100.type === "rente" && waIpp100.montant === 114000);
assert("WA IPP: invalid taux", calcIPP_WA(-0.1, 120000, 40, "industrie").error === "ERR_INVALID_TAUX");
assert("WA IPP: invalid salary", calcIPP_WA(0.50, -1000, 40, "industrie").error === "ERR_INVALID_SALARY");
assert("WA IPP: invalid age", calcIPP_WA(0.50, 120000, -1, "industrie").error === "ERR_INVALID_AGE");
assert("WA IPP: invalid secteur", calcIPP_WA(0.50, 120000, 40, "invalid").error === "ERR_INVALID_SECTEUR");

// calcFauteInexcusable
const waFiPartielle = calcFauteInexcusable(6000, 0.30, 35);
assert("WA faute inexcusable: 30% uses partielle column", waFiPartielle.col_used === "incapacite_partielle");
const waFiAbsolue = calcFauteInexcusable(114000, 1.00, 35);
assert("WA faute inexcusable: 100% uses absolue column", waFiAbsolue.col_used === "incapacite_absolue");
const waFi0999 = calcFauteInexcusable(6000, 0.999, 35);
assert("WA faute inexcusable: 0.999 uses absolue column", waFi0999.col_used === "incapacite_absolue");
const waFi85 = calcFauteInexcusable(6000, 0.30, 85);
assert("WA faute inexcusable: age 85 clamped to 80", waFi85.age_used === 80);
const waFi10 = calcFauteInexcusable(6000, 0.30, 10);
assert("WA faute inexcusable: age 10 clamped to 15", waFi10.age_used === 15);

// calcRenteConjoint
const waConjoint = calcRenteConjoint(120000, 40, true, "industrie");
assert("WA conjoint: rente annuelle 60000", waConjoint.rente_annuelle === 60000);
assert("WA conjoint: mariage apres accident error",
  calcRenteConjoint(120000, 40, false, "industrie").error === "ERR_MARIAGE_APRES_ACCIDENT");
const waConjoint15 = calcRenteConjoint(120000, 15, true, "industrie");
assert("WA conjoint: age 15 clamped to 18", waConjoint15.details.age_used === 18);

// calcRenteEnfants
assert("WA enfants: one normal age 5 taux 0.20",
  calcRenteEnfants(120000, [{ age: 5, statut: "normal" }], "industrie").taux_global === 0.20);
assert("WA enfants: normal age 16 eligible",
  calcRenteEnfants(120000, [{ age: 16, statut: "normal" }], "industrie").par_enfant.length === 1);
const waNormal17 = calcRenteEnfants(120000, [{ age: 17, statut: "normal" }], "industrie");
assert("WA enfants: normal age 17 not eligible", waNormal17.rente_annuelle === 0 && waNormal17.par_enfant.length === 0);
assert("WA enfants: two normal children taux 0.30",
  calcRenteEnfants(120000, [{ age: 5, statut: "normal" }, { age: 10, statut: "normal" }], "industrie").taux_global === 0.30);
assert("WA enfants: one eligible among two children taux 0.20",
  calcRenteEnfants(120000, [{ age: 17, statut: "normal" }, { age: 10, statut: "normal" }], "industrie").taux_global === 0.20);
assert("WA enfants: etudiant age 20 eligible",
  calcRenteEnfants(120000, [{ age: 20, statut: "etudiant" }], "industrie").par_enfant.length === 1);
assert("WA enfants: apprenti age 21 eligible",
  calcRenteEnfants(120000, [{ age: 21, statut: "apprenti" }], "industrie").par_enfant.length === 1);
assert("WA enfants: etudiant age 26 eligible",
  calcRenteEnfants(120000, [{ age: 26, statut: "etudiant" }], "industrie").par_enfant.length === 1);
assert("WA enfants: handicap age 30 eligible",
  calcRenteEnfants(120000, [{ age: 30, statut: "handicap" }], "industrie").par_enfant.length === 1);
assert("WA enfants: empty array rente 0",
  calcRenteEnfants(120000, [], "industrie").rente_annuelle === 0);
assert("WA enfants: invalid age",
  calcRenteEnfants(120000, [{ age: "x", statut: "normal" }], "industrie").error === "ERR_INVALID_AGE");
assert("WA enfants: invalid statut",
  calcRenteEnfants(120000, [{ age: 5, statut: "foo" }], "industrie").error === "ERR_INVALID_STATUT");
assert("WA enfants: invalid enfants array",
  calcRenteEnfants(120000, "not_array", "industrie").error === "ERR_INVALID_ENFANTS");

// calcRenteAscendants
assert("WA ascendants: one ascendant taux 0.15",
  calcRenteAscendants(120000, [{ age: 60 }], "industrie").taux_effectif === 0.15);
assert("WA ascendants: two ascendants taux 0.30",
  calcRenteAscendants(120000, [{ age: 60 }, { age: 65 }], "industrie").taux_effectif === 0.30);
assert("WA ascendants: three ascendants capped at 0.30",
  calcRenteAscendants(120000, [{ age: 60 }, { age: 65 }, { age: 70 }], "industrie").taux_effectif === 0.30);
assert("WA ascendants: invalid ascendants array",
  calcRenteAscendants(120000, "not_array", "industrie").error === "ERR_INVALID_ASCENDANTS");

// calcPlafondAyantsDroit
const waPlafondNo = calcPlafondAyantsDroit(120000, { conjoint: 60000, enfants: 36000, ascendants: 0 }, "industrie");
assert("WA plafond ayants droit: no reduction", waPlafondNo.reduction_applied === false);
const waPlafondYes = calcPlafondAyantsDroit(120000, { conjoint: 60000, enfants: 48000, ascendants: 18000 }, "industrie");
assert("WA plafond ayants droit: reduction applied", waPlafondYes.reduction_applied === true);
assert("WA plafond ayants droit: invalid rentes",
  calcPlafondAyantsDroit(120000, { conjoint: "x", enfants: 0, ascendants: 0 }, "industrie").error === "ERR_INVALID_RENTES");

// ─────────────────────────────────────────────────────────────────────────────
console.log("\n────────────────────────────────────────────────────────────────");
console.log(`  Results: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
